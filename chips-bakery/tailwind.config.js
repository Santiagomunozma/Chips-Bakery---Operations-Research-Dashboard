/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          pink: '#F7B8C9',
          rose: '#FDE8EF',
          cream: '#FFF7FA',
          ink: '#1F1A17',
          muted: '#7A5560',
          tan: '#C48A4A',
          mint: '#9EE8D6',
        },
      },
    },
  },
  plugins: [],
}
