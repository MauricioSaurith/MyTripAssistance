import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export interface CanvasSequenceOptions {
    canvasId: string;
    frameCount: number;
    triggerId: string;
    folderPath: string; // e.g. '/secuence_1'
    fileNamePrefix: string;     // e.g. 'ezgif-frame-'
    fileNameSuffix: string;     // e.g. '.jpg'
    startDelay?: number;
    endOffset?: string;
    padLength?: number; // Should be 3 if files are 001.jpg, 002.jpg
    offsetY?: number;   // Optional offset fraction (e.g. 0.1 for 10% down)
}

export class CanvasSequence {
    private canvas: HTMLCanvasElement;
    private ctx!: CanvasRenderingContext2D;
    private options: CanvasSequenceOptions;
    private images: HTMLImageElement[] = [];
    private currentFrame = { frame: 0 };
    private imagesLoaded = 0;

    constructor(options: CanvasSequenceOptions) {
        this.options = { padLength: 3, ...options };
        this.canvas = document.getElementById(this.options.canvasId) as HTMLCanvasElement;
        if (!this.canvas) {
            console.warn(`Canvas ${this.options.canvasId} not found. Skipping sequence.`);
            return;
        }

        this.ctx = this.canvas.getContext('2d')!;
        this.preloadImages();
    }

    // AÑADE TUS FRAMES EN LA CARPETA 'public/secuence_1' y 'public/secuence_2'
    // El código espera el nombre en formato: [prefijo][numero_con_padding][sufijo]
    // Ejemplo: ezgif-frame-001.jpg, ezgif-frame-002.jpg ... ezgif-frame-120.jpg
    // El usuario (tú) debe asegurarse de nombrar o cambiar el prefijo (`fileNamePrefix`) en la instancia.
    private currentFramePath(index: number) {
        const _padLength = this.options.padLength || 3;
        const padding = index.toString().padStart(_padLength, '0');
        return `${this.options.folderPath}/${this.options.fileNamePrefix}${padding}${this.options.fileNameSuffix}`;
    }

    private preloadImages() {
        for (let i = 1; i <= this.options.frameCount; i++) {
            const img = new Image();
            img.src = this.currentFramePath(i);
            img.onload = () => {
                this.imagesLoaded++;
                // Draw first frame when the first image is loaded
                if (i === 1) {
                    this.resizeCanvas();
                    this.render(0);
                }
            };
            this.images.push(img);
        }

        window.addEventListener('resize', () => this.resizeCanvas());
        this.setupScrollTrigger();
    }

    private resizeCanvas() {
        // Keep internal canvas resolution high (like a 1080p target or current window)
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.render(this.currentFrame.frame);
    }

    private render(index: number) {
        if (this.images[index] && this.images[index].complete) {
            const img = this.images[index];
            // Calcular "cover" scale (llena el canvas) vs "contain" scale según sea el caso
            // En secuence_1 queremos cover, en secuence_2 queremos contain o cover ajustado.
            const hRatio = this.canvas.width / img.width;
            const vRatio = this.canvas.height / img.height;
            const ratio = Math.max(hRatio, vRatio); // COVER effect

            const centerShift_x = (this.canvas.width - img.width * ratio) / 2;
            let centerShift_y = (this.canvas.height - img.height * ratio) / 2;

            if (this.options.offsetY) {
                centerShift_y += this.canvas.height * this.options.offsetY;
            }

            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(
                img,
                0, 0, img.width, img.height,
                centerShift_x, centerShift_y, img.width * ratio, img.height * ratio
            );
        }
    }

    private setupScrollTrigger() {
        // We animate the "frame" property of currentFrame from 0 to frameCount - 1
        gsap.to(this.currentFrame, {
            frame: this.options.frameCount - 1,
            snap: "frame",
            ease: "none",
            scrollTrigger: {
                trigger: this.options.triggerId,
                start: "top top",
                // The canvas is sticky for However long the trigger element is.
                end: this.options.endOffset || "bottom bottom",
                scrub: 0.5, // 0.5 sec scrub smoothness to feel premium
            },
            onUpdate: () => {
                this.render(Math.round(this.currentFrame.frame));
            }
        });
    }
}
