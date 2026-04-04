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
        brand: {
          50: '#f5f3ff',   // lightest lavender
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',  // primary violet - rich and distinctive
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',  // deepest
        },
        accent: {
          400: '#2dd4bf',  // teal - split-complement to violet
          500: '#14b8a6',  // teal - energetic
          600: '#0d9488',  // teal - rich
          success: '#22c55e', // keep green for success states
        },
        cozy: {
          cream: '#f5f3ff',
          sand: '#ede9fe',
          terracotta: '#a78bfa',
          clay: '#6d28d9',
        },
        surface: {
          DEFAULT: '#ffffff',
          muted: '#f5f3ff',     // light lavender-tinted
          dark: '#0f0d1a',      // deep purple instead of warm brown
        },
        warmGray: {
          50:  '#f5f4fb',  // cool purple-tinted lightest
          100: '#eceaf6',  // body text (dark mode)
          200: '#d3d0e6',  // secondary text
          300: '#b8b3d0',  // muted text
          400: '#9b95b8',  // medium
          500: '#7f78a0',  // dim
          600: '#635b85',  // medium-dark
          700: '#4a4369',  // visible border
          800: '#312b50',  // hover surface / subtle border
          850: '#231f3d',  // elevated surface
          900: '#1a1630',  // card background
          950: '#0f0d1a',  // page background (= surface-dark)
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],      // 12px
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
        'base': ['1rem', { lineHeight: '1.5rem' }],     // 16px
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],      // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
        '5xl': ['3rem', { lineHeight: '1' }],           // 48px
        '6xl': ['3.75rem', { lineHeight: '1' }],        // 60px
        '7xl': ['4.5rem', { lineHeight: '1' }],         // 72px
        '8xl': ['6rem', { lineHeight: '1' }],           // 96px
        '9xl': ['8rem', { lineHeight: '1' }],           // 128px
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}