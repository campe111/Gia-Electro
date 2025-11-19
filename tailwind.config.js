/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem',
      },
    },
    extend: {
      colors: {
        primary: {
          black: '#000000',      // Negro de la bandera alemana
          gray: '#4A4A4A',
          yellow: '#FFCC00',     // Amarillo de la bandera alemana
          red: '#DD0000',        // Rojo de la bandera alemana
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/container-queries'),
  ],
}

