import type { Config } from 'tailwindcss'
import containerQueries from '@tailwindcss/container-queries'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-ascii)', 'var(--font-jp)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace']
      },
      colors: {
        'atom-one-dark': {
          lighter: '#3d4148',
          light: '#333842',
          DEFAULT: '#282c34',
          deep: '#21252b'
        },
        logo: {
          light: '#5bc5dc',
          medium: '#3ba0be',
          dark: '#1a7ba0',
          accent: '#f88c49'
        }
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        }
      }
    }
  },
  plugins: [
    containerQueries
  ]
}

export default config
