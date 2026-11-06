/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './index.tsx',
    './App.tsx',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        api: {
          blue: '#003087',
          red: '#D50032',
          gray: '#545859',
          accent: '#004C97',
          bg: '#F5F7FA',
          green: '#2E7D32',
        },
      },
    },
  },
  plugins: [],
};
