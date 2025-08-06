import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'sims-green': '#00a870',
        'sims-blue': '#0084c7',
        'sims-purple': '#8b5fbf',
        'sims-pink': '#e91e63',
        'sims-yellow': '#ffc107',
      },
      fontFamily: {
        'sims': ['Comic Sans MS', 'cursive'],
      },
    },
  },
  plugins: [],
}
export default config