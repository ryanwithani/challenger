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
    50: '#f5f2ff',
    100: '#ece6ff',
    200: '#d9ccff',
    300: '#bea6ff',
    400: '#a47eff',
    500: '#8a57ff', // primary plumbob purple
    600: '#6c39e6',
    700: '#552ec2',
    800: '#40249b',
    900: '#2c1872',
    },
    accent: {
    500: '#00d974', // success/gamified glow
    },
    surface: {
    DEFAULT: '#ffffff',
    muted: '#f6f7fb',
    dark: '#0e0f12',
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