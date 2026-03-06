/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                'sans': ['Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'], // Fallbacks to Helvetica Neue / Helvetica Now style
            },
            colors: {
                'luxury-dark': '#0a0a0a',
                'luxury-light': '#f4f4f4',
                'luxury-accent': '#d4af37', // Optional gold accent
            }
        },
    },
    plugins: [],
}
