/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#1A1A2E",
                foreground: "#FFFFFF",
                primary: {
                    DEFAULT: "#C0392B",
                    dark: "#A03025",
                    light: "#E74C3C",
                },
                secondary: "#2C2C54",
                accent: {
                    DEFAULT: "#F39C12",
                    muted: "#8E8E9A",
                },
                void: "#0D0D0D",
            },
            fontFamily: {
                sans: ["var(--font-inter)", "Arial", "sans-serif"],
                cinema: ["Georgia", "serif"],
            },
            backgroundImage: {
                'cinema-gradient': 'linear-gradient(to bottom, rgba(26, 26, 46, 0.8), rgba(26, 26, 46, 1))',
            },
        },
    },
    plugins: [],
}
