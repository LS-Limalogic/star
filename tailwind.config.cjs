/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Adjust this glob pattern to match your project structure
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  darkMode: 'class', // Enable class-based dark mode
} 