/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class', // or 'media' or nothing (default is system)
    theme: {
        extend: {
            colors: {
                background: '#0f172a',
                surface: '#1e293b',
                primary: '#3b82f6',
                danger: '#ef4444',
                warning: '#f59e0b',
            }
        },
    },
    plugins: [],
}
