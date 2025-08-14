import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#8B5FBF',
          accent:  '#00A870',
          // neutrals via Tailwind slate + gray (don’t rebrand them)
        },
      },
      borderRadius: { md: '8px', lg: '12px', xl: '16px' },
      boxShadow: { card: '0 2px 10px rgba(16,24,40,0.06)' }
    },
  },
  plugins: [],
}
export default config