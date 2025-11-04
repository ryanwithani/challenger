import config from 'next/config'

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
    50: '#fff5f0',   // lightest peach - warm and inviting
    100: '#ffe8db',
    200: '#ffd0b8',
    300: '#ffb088',
    400: '#ff8f5c',
    500: '#ff6b35',  // primary warm coral/orange - cozy and fun
    600: '#e84a1f',
    700: '#c73615',
    800: '#a22b11',
    900: '#7a2110',  // deepest
    },
    accent: {
    400: '#fbbf24',  // golden hour - warm yellow
    500: '#f59e0b',  // amber - energetic
    600: '#d97706',  // honey - rich
    success: '#22c55e', // keep green for success states
    },
    cozy: {
    cream: '#fef6ee',
    sand: '#f5e6d3',
    terracotta: '#d4856a',
    clay: '#8b5a3c',
    },
    surface: {
    DEFAULT: '#ffffff',
    muted: '#fef6ee',     // warm cream instead of cool gray
    dark: '#1a1410',      // warm dark brown instead of cold black
    },
    },
    borderRadius: {
    xl: '1rem',
    '2xl': '1.25rem',
    },
    boxShadow: {
    card: '0 8px 20px rgba(22, 8, 62, 0.08)',
    glow: '0 0 0 3px rgba(138,87,255,0.25)',
    },
    fontFamily: {
      display: ['"Nunito Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      body: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      exo2: ['"Exo 2"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
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
    transitionDuration: {
      fast: '150ms',
    base: '250ms',
    },
    },
    },
    plugins: [require('tailwindcss-animate')],
    }
    export default config()