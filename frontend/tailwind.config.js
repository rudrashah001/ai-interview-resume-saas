/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eef8ff',
          100: '#d9efff',
          200: '#bce3ff',
          300: '#8ed0ff',
          400: '#59b3ff',
          500: '#3093ff',
          600: '#1a72f5',
          700: '#145be1',
          800: '#1749b6',
          900: '#19408f',
        },
      },
    },
  },
  plugins: [],
};
