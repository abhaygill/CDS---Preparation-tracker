/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Manual toggling
  theme: {
    extend: {
      colors: {
        army: {
          50: '#f4f7f2',
          100: '#e3ebe0',
          500: '#5c7c51', // Primary Green
          700: '#3e5636',
          900: '#1a2417',
        }
      }
    },
  },
  plugins: [],
}