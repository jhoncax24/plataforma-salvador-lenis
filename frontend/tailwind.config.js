/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        modulo: {
          notas: '#0033a0',
          asistencia: '#f97316',
          observador: '#16a34a',
        },
      },
    },
  },
  plugins: [],
}
