import colors from 'tailwindcss/colors';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          50: '#faf7f2',
          100: '#f4ece4',
          200: '#e6d6c6',
          300: '#d1b7a1',
          400: '#b7957a',
          500: '#9b755a',
          600: '#7f5c44',
          700: '#5f4331',
          800: '#422f23',
          900: '#2c1e16',
          950: '#1a120d',
        },
        cyan: colors.amber,
        emerald: colors.orange,
      },
      borderRadius: {
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
    },
  },
  plugins: [],
}
