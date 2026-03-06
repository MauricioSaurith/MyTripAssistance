import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                agencias: resolve(__dirname, 'agencies.html'),
            },
            output: {
                manualChunks: undefined,
            },
        },
    },
    server: {
        port: 3000,
    },
});
