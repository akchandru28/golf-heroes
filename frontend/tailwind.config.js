/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: '#c8f135',
        'accent-dim': 'rgba(200, 241, 53, 0.12)',
        'accent-hover': '#d4f54a',
        'bg-card': '#13131a',
        'bg-elevated': '#1c1c26',
        'primary-dark': '#0a0a0f',
      },
      scale: {
        '105': '1.05',
      }
    },
  },
  plugins: [],
}
