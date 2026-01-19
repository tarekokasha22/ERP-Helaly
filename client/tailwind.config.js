/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#FF9E44',
          DEFAULT: '#FF7D19',
          dark: '#E16400',
        },
        secondary: {
          light: '#6B7280',
          DEFAULT: '#4B5563',
          dark: '#374151',
        },
      },
    },
  },
  plugins: [
    require('tailwindcss-rtl'),
  ],
} 