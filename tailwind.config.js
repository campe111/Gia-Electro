/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          black: '#000000',
          gray: '#4A4A4A',
          yellow: '#FFD700',
          red: '#DC2626',
        },
      },
    },
  },
  plugins: [],
}

