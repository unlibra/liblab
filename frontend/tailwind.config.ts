import type { Config } from 'tailwindcss'

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
  plugins: []
}

export default config
