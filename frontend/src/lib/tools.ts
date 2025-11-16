// カテゴリ定義の型
type CategoryDefinition = {
  readonly id: string
  readonly name: string
}

// カテゴリ定義
const categoryDefinitions = [
  { id: 'image', name: 'Image Tools' },
  { id: 'color', name: 'Color Tools' },
  { id: 'svg', name: 'SVG Tools' },
  { id: 'accessibility', name: 'Accessibility' }
] as const satisfies readonly CategoryDefinition[]

// カテゴリIDの型を自動抽出
export type CategoryId = typeof categoryDefinitions[number]['id']

export type Tool = {
  id: string
  name: string
  description: string
  category: CategoryId
  href: string
}

export type Category = {
  id: CategoryId
  name: string
  tools: Tool[]
}

// Mock data - 実際のツール実装時に更新
export const tools: Tool[] = [
  {
    id: 'favicon-generator',
    name: 'Faviconジェネレーター',
    description: '画像からfaviconファイルを生成します。すべての処理はブラウザ内で完結します。',
    category: 'image',
    href: '/favicon-generator'
  },
  {
    id: 'image-corner-rounder',
    name: 'Image Corner Rounder',
    description: 'Round the corners of your images with customizable radius.',
    category: 'image',
    href: '/image-corner-rounder'
  },
  {
    id: 'avatar-generator',
    name: 'Avatar Generator',
    description: 'Generate geometric avatars from seed values. Deterministic and unique.',
    category: 'image',
    href: '/avatar-generator'
  },
  {
    id: 'color-palette',
    name: 'Color Palette Tool',
    description: 'Create and adjust color palettes with perceptual lightness control.',
    category: 'color',
    href: '/color-palette'
  },
  {
    id: 'image-to-palette',
    name: 'Image to Palette',
    description: 'Extract color palettes from images using k-means++ clustering.',
    category: 'color',
    href: '/image-to-palette'
  },
  {
    id: 'svg-optimizer',
    name: 'SVG Optimizer',
    description: 'Optimize and minify SVG files to reduce file size.',
    category: 'svg',
    href: '/svg-optimizer'
  },
  {
    id: 'accessibility-checker',
    name: 'Accessibility Checker',
    description: 'Check color contrast and accessibility of your designs.',
    category: 'accessibility',
    href: '/accessibility-checker'
  }
]

// カテゴリ一覧を自動生成
export const categories: Category[] = categoryDefinitions.map(cat => ({
  id: cat.id,
  name: cat.name,
  tools: tools.filter(tool => tool.category === cat.id)
}))
