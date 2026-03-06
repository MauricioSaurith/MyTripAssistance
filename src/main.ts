import './style.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';
import { CanvasSequence } from './canvasSequence';

// Utility to split text into letters for free (alternative to GSAP SplitText Club plugin)
function splitTextIntoSpans(selector: string) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
        const text = element.textContent?.trim() || "";
        element.innerHTML = "";

        // Split by words first to keep them together on wrap
        const words = text.split(" ");
        words.forEach(word => {
            const wordSpan = document.createElement("span");
            wordSpan.style.display = "inline-block";
            wordSpan.style.whiteSpace = "nowrap"; // Keep word intact
            wordSpan.style.marginRight = "0.25em"; // Add space back between words

            // Split word into letters
            const letters = word.split("");
            letters.forEach(letter => {
                const letterSpan = document.createElement("span");
                letterSpan.textContent = letter;
                letterSpan.className = "split-letter";
                letterSpan.style.opacity = "0.2"; // Start faded (acts as gray)
                wordSpan.appendChild(letterSpan);
            });

            element.appendChild(wordSpan);
        });
    });
}

gsap.registerPlugin(ScrollTrigger);

// 1. Initialize Smooth Scrolling with Lenis (Awwwards feel)
const lenis = new Lenis({
    duration: 1.5,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
});

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {

    // --- CANVAS SEQUENCES ---
    // Ensure the user has the folders named exactly 'secuence_1' and 'secuence_2' with 'ezgif-frame-XXX.jpg'

    // Hero Window Sequence
    new CanvasSequence({
        canvasId: 'canvas-hero',
        frameCount: 120,
        triggerId: '#hero',
        folderPath: '/secuence_1', // Using Vite dev server from root
        fileNamePrefix: 'ezgif-frame-',
        fileNameSuffix: '.jpg',
        padLength: 3,
    });

    // Benefits Plane Sequence
    new CanvasSequence({
        canvasId: 'canvas-plane',
        frameCount: 120,
        triggerId: '#benefits',
        folderPath: '/secuence_2',
        fileNamePrefix: 'ezgif-frame-',
        fileNameSuffix: '.jpg',
        padLength: 3,
        offsetY: 0.15 // Pushes the plane 15% lower so the nose isn't touching top edge
    });

    // --- UI ANIMATIONS (SCROLLTRIGGER) ---

    // Hero Text Reveal (Initial load animation)
    const tlHero = gsap.timeline({ defaults: { ease: 'power3.out', duration: 1.2 } });
    tlHero.to('#hero-title', { y: 0, opacity: 1, delay: 0.2 })
        .to('#hero-input', { y: 0, opacity: 1 }, "-=0.8")
        .to('#hero-subtitle', { opacity: 1 }, "-=0.6")
        .to('#hero-cta', { opacity: 1, scale: 1 }, "-=0.8")
        .to('#hero-social', { opacity: 1 }, "-=0.8");

    // Hero Scroll Parallax (Fades out text going down, fades back in going up)
    gsap.fromTo(['#hero-title', '#hero-input', '#hero-subtitle', '#hero-cta', '#hero-social'],
        { y: 0, opacity: 1 }, // Explicit start values from tlHero
        {
            y: -100,
            opacity: 0,
            stagger: 0.05,
            ease: "power1.inOut",
            scrollTrigger: {
                trigger: '#hero',
                start: 'top top',
                end: '+=800', // Making the fadeout slightly longer and smoother
                scrub: 1,     // 1 second lag on scrub for buttery smooth feel
                immediateRender: false // Crucial: don't record start values on load
            }
        }
    );

    // Problem Section Typography Reveal (Letter by Letter)
    splitTextIntoSpans('#problem-title');
    splitTextIntoSpans('.problem-text-reveal');

    // Animating the heading letters
    gsap.to('#problem-title .split-letter', {
        opacity: 1, // from 0.2
        stagger: 0.02,
        duration: 0.1,
        ease: 'power1.inOut',
        scrollTrigger: {
            trigger: '#problem',
            start: 'top 70%',
            end: 'top 30%',
            scrub: true,
        }
    });

    // Animating the large text letters (Scrollytelling fill effect from gray to white)
    gsap.to('.problem-text-reveal .split-letter', {
        opacity: 1, // from 0.2 (gray effect) to solid white
        stagger: 0.01,
        duration: 0.1,
        ease: 'none',
        scrollTrigger: {
            trigger: '#problem',
            start: 'top 40%',
            end: 'center center',
            scrub: true,
        }
    });

    // Benefits Section (Text appearing at sides while scrolling)
    // Because #benefits is 300vh, we divide the scrollable space
    const tlBenefits = gsap.timeline({
        scrollTrigger: {
            trigger: '#benefits',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1
        }
    });

    // Header fades in and out fast
    tlBenefits.to('.header-benefits', { opacity: 1, duration: 0.5 })
        .to('.header-benefits', { opacity: 0, duration: 0.5 }, "+=0.5");

    // Benefit 1 (Left)
    tlBenefits.to('#benefit-1', { y: 0, opacity: 1, duration: 1 })
        .to('#benefit-1', { y: -50, opacity: 0, duration: 1 }, "+=0.5");

    // Benefit 2 (Right)
    tlBenefits.to('#benefit-2', { y: 0, opacity: 1, duration: 1 })
        .to('#benefit-2', { y: -50, opacity: 0, duration: 1 }, "+=0.5");

    // FAQ Accordion Logic
    const faqItems = document.querySelectorAll('.faq-item button');
    faqItems.forEach(button => {
        button.addEventListener('click', () => {
            const content = button.nextElementSibling as HTMLElement;
            const isOpen = button.classList.contains('active');

            // Close all
            document.querySelectorAll('.faq-content').forEach(c => {
                (c as HTMLElement).style.maxHeight = '0px';
                (c.previousElementSibling as HTMLElement).classList.remove('active');
                // Reset icon
                (c.previousElementSibling as HTMLElement).querySelector('.icon')!.textContent = '+';
            });

            if (!isOpen) {
                button.classList.add('active');
                content.style.maxHeight = content.scrollHeight + 'px';
                button.querySelector('.icon')!.textContent = '−'; // minus symbol
            }
        });
    });



    // Interactive Features Accordion Logic
    const featureItems = document.querySelectorAll('.feature-accordion-item');
    const featureImage = document.getElementById('feature-active-image') as HTMLImageElement;

    featureItems.forEach(item => {
        item.addEventListener('click', () => {
            const content = item.querySelector('.feature-content') as HTMLElement;
            const icon = item.querySelector('.icon') as HTMLElement;
            const newImageSrc = item.getAttribute('data-image');

            const isOpen = content.style.maxHeight !== '0px';

            // Close all
            document.querySelectorAll('.feature-accordion-item .feature-content').forEach(c => {
                (c as HTMLElement).style.maxHeight = '0px';
                (c as HTMLElement).classList.remove('mt-6');
                (c as HTMLElement).classList.add('mt-0');
            });
            document.querySelectorAll('.feature-accordion-item .icon').forEach(i => {
                (i as HTMLElement).textContent = '+';
            });

            if (!isOpen) {
                // Open clicked
                content.style.maxHeight = content.scrollHeight + 'px';
                content.classList.remove('mt-0');
                content.classList.add('mt-6');
                icon.textContent = '−';

                // Change image smoothly if it's new
                if (newImageSrc && !featureImage.src.includes(newImageSrc)) {
                    featureImage.style.opacity = '0.4'; // fade out mostly
                    setTimeout(() => {
                        featureImage.src = newImageSrc;
                        featureImage.onload = () => {
                            featureImage.style.opacity = '1'; // fade back in
                        };
                    }, 300); // sync with opacity duration
                }
            }
        });
    });

    // Footer Titles Reveal
    gsap.to('.footer-title', {
        y: 0,
        opacity: 1,
        duration: 1.5,
        ease: 'power4.out',
        scrollTrigger: {
            trigger: 'footer',
            start: 'top center'
        }
    });

});
