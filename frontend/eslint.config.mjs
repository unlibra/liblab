import { createRequire } from 'module'
import tseslint from '@typescript-eslint/eslint-plugin'
import nextPlugin from '@next/eslint-plugin-next'
import reactHooks from 'eslint-plugin-react-hooks'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import tailwindcss from 'eslint-plugin-tailwindcss'
import neostandard from 'neostandard'

const require = createRequire(import.meta.url)
const localRules = require('./eslint-local-rules.cjs')

export default [
  // Ignore Next.js auto-generated files and config files
  {
    ignores: [
      '.next/**',
      'out/**',
      'dist/**',
      'node_modules/**',
      'build/**',
      'next-env.d.ts',
      'eslint.config.mjs',
      'next.config.ts',
      'postcss.config.mjs',
      'tailwind.config.ts'
    ]
  },

  // neostandard基本設定（TypeScript有効）
  ...neostandard({ ts: true }),

  // Next.js + 追加プラグイン
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      '@typescript-eslint': tseslint,
      '@next/next': nextPlugin,
      'react-hooks': reactHooks,
      'simple-import-sort': simpleImportSort,
      tailwindcss,
      local: { rules: localRules }
    },
    rules: {
      // React Hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Import整列
      'simple-import-sort/imports': 'error',

      // TypeScript型インポート（インライン型を禁止し、分離を強制）
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: false,
          fixStyle: 'separate-type-imports'
        }
      ],
      '@typescript-eslint/no-import-type-side-effects': 'error',

      // カスタムルール: インライン型アノテーションを禁止
      'local/no-inline-type-imports': 'error',

      // JSXクォート
      'jsx-quotes': ['error', 'prefer-single'],

      // Tailwindcss設定
      'tailwindcss/classnames-order': 'warn',
      'tailwindcss/no-custom-classname': 'warn'
    },
    settings: {
      tailwindcss: {
        callees: ['classnames', 'clsx', 'ctl', 'cva', 'tv', 'twMerge']
      }
    }
  }
]
