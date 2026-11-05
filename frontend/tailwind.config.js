/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0D7A5F',
          dark: '#0A5C47',
          soft: '#ECFDF5',
        },
        canvas: '#F8FAFC',
        surface: '#FFFFFF',
        status: {
          pending: { bg: '#FEF3C7', text: '#B45309' },
          verify: { bg: '#DBEAFE', text: '#1D4ED8' },
          process: { bg: '#EDE9FE', text: '#6D28D9' },
          done: { bg: '#D1FAE5', text: '#065F46' },
          reject: { bg: '#FEE2E2', text: '#B91C1C' },
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'elev-1': '0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.03)',
        'elev-2': '0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.04)',
        'elev-3': '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.03)',
      },
    },
  },
  plugins: [],
}
