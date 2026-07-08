
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#f7f7f7',
        'btnPrimary': '#d1ff43',
      },
      fontFamily: {
        inter: ['"Inter"', 'system-ui', 'sans-serif'],
        familjen: ['"Familjen Grotesk"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
