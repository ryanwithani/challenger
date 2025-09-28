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