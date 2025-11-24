import type { Config } from 'tailwindcss'
import containerQueries from '@tailwindcss/container-queries'
import plugin from 'tailwindcss/plugin';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-ascii)', 'var(--font-jp)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
        logo: ['var(--font-logo)', 'sans-serif']
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
    containerQueries,
    plugin(function ({ addUtilities }) {
			addUtilities({
				'.drag-none': {
					'-webkit-user-drag': 'none',
					'-khtml-user-drag': 'none',
					'-moz-user-drag': 'none',
					'-o-user-drag': 'none',
					'user-drag': 'none'
				}
			});
		})
  ]
}

export default config
