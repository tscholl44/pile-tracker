import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Pile status colors
        pile: {
          red: '#EF4444',
          orange: '#F97316',
          yellow: '#EAB308',
          green: '#22C55E',
          blue: '#3B82F6',
          purple: '#A855F7',
          gray: '#6B7280',
        },
      },
    },
  },
  plugins: [],
}

export default config
