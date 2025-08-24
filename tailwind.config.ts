/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Enable class-based dark mode
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Sims-themed colors with dark mode variants
        'sims-green': {
          DEFAULT: '#10b981',
          dark: '#059669',
        },
        'sims-blue': {
          DEFAULT: '#3b82f6',
          dark: '#2563eb',
        },
        'sims-purple': {
          DEFAULT: '#8b5cf6',
          dark: '#7c3aed',
        },
        'sims-yellow': {
          DEFAULT: '#f59e0b',
          dark: '#d97706',
        },
        // Background and foreground
        background: {
          DEFAULT: 'hsl(var(--background))',
          dark: 'hsl(var(--background-dark))',
        },
        foreground: {
          DEFAULT: 'hsl(var(--foreground))',
          dark: 'hsl(var(--foreground-dark))',
        },
        // Semantic colors with dark variants
        border: {
          DEFAULT: 'hsl(var(--border))',
          dark: 'hsl(var(--border-dark))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          dark: 'hsl(var(--card-dark))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          dark: 'hsl(var(--muted-dark))',
        },
      },
    },
  },
  plugins: [],
}