/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        glass: 'rgba(30, 30, 30, 0.85)',
        'glass-light': 'rgba(255, 255, 255, 0.1)',
      },
    },
  },
  plugins: [],
};
