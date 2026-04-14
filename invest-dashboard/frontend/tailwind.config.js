/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: { 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca' },
        risk: { low: '#22c55e', medium: '#f59e0b', high: '#f97316', critical: '#ef4444' },
      },
    },
  },
  plugins: [],
};
