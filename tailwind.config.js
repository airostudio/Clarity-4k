/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#dde6ff',
          200: '#c0d0ff',
          300: '#94afff',
          400: '#6185ff',
          500: '#3b5bfd',
          600: '#2741f2',
          700: '#1f31de',
          800: '#1f2db3',
          900: '#1e2c8e',
          950: '#161d61',
        },
        surface: {
          DEFAULT: '#0f1117',
          card:    '#161b26',
          border:  '#1e2535',
          muted:   '#2a3347',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
