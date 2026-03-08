/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#A855F7',
            },
            fontFamily: {
                display: ['Space Grotesk', 'sans-serif'],
                accent: ['Bungee', 'cursive'],
                body: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
