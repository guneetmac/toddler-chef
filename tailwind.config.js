/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#f6f8f6',
          100: '#e3e9e3',
          200: '#c7d3c7',
          300: '#a1b5a1',
          400: '#7a947a',
          500: '#5d7a5d',
          600: '#486148',
          700: '#3a4d3a',
          800: '#2f3f2f',
          900: '#283528',
        },
        warmOrange: {
          50: '#fef7f3',
          100: '#fdeee5',
          200: '#fad9ca',
          300: '#f6bea4',
          400: '#f19871',
          500: '#e97548',
          600: '#d75b2d',
          700: '#b44923',
          800: '#913d22',
          900: '#76351f',
        },
      },
    },
  },
  plugins: [],
};
