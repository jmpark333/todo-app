/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
        surface: 'var(--color-surface)',
        'bg-gradient-from': 'var(--color-bg-gradient-from)',
        'bg-gradient-via': 'var(--color-bg-gradient-via)',
        'bg-gradient-to': 'var(--color-bg-gradient-to)',
        text: 'var(--color-text)',
        'text-muted': 'var(--color-text-muted)',
        success: 'var(--color-success)',
        danger: 'var(--color-danger)',
        glow: 'var(--color-glow)',
      },
    },
  },
  plugins: [],
}