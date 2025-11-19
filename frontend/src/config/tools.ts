// カテゴリ定義の型
type CategoryDefinition = {
  readonly id: string
  readonly name: string
  readonly iconBgColor: string
}

// カテゴリ定義
const categoryDefinitions = [
  { id: 'color', name: 'Color', iconBgColor: 'bg-gradient-to-br from-orange-300 to-orange-400 dark:from-orange-700 dark:to-orange-600' },
  { id: 'image', name: 'Image', iconBgColor: 'bg-gradient-to-br from-sky-300 to-sky-400 dark:from-sky-700 dark:to-sky-600' }
] as const satisfies readonly CategoryDefinition[]

// カテゴリIDの型を自動抽出
export type CategoryId = typeof categoryDefinitions[number]['id']

export type Tool = {
  id: string
  name: string
  description: string
  shortDescription?: string // For popovers and compact displays
  icon: string // Path to icon file
  category: CategoryId
}

export type Category = {
  id: CategoryId
  name: string
  iconBgColor: string
  tools: Tool[]
}

// https://api.dicebear.com/9.x/shapes/svg?backgroundColor=transparent&seed=
export const tools: Tool[] = [
  {
    id: 'tw-palette-generator',
    name: 'TWパレットジェネレーター',
    description: '選んだ色からTailwindCSS風の50-950のシェードを持つカラーパレットを生成します。',
    shortDescription: 'カラーパレットを生成',
    icon: '/icons/tools/tw-palette-generator.svg',
    category: 'color'
  },
  // {
  //   id: 'image-to-palette',
  //   name: '画像カラーパレット',
  //   description: '画像から配色を抽出します。',
  //   shortDescription: '画像から配色を抽出',
  //   icon: '/icons/tools/image-to-palette.svg',
  //   category: 'color'
  // },
  {
    id: 'favicon-generator',
    name: 'Faviconジェネレーター',
    description: '画像からfaviconファイルやApple Touch Iconを生成します。JPEG、PNG、WEBP、SVGなどをサポート。ブラウザ上で完結するため安全です。',
    shortDescription: '画像からfaviconファイルを生成',
    icon: '/icons/tools/favicon-generator.svg',
    category: 'image'
  },
  {
    id: 'svg-optimizer',
    name: 'SVG圧縮ツール',
    description: 'SVGファイルを最適化・圧縮して、ファイルサイズを削減します。ブラウザ上で完結するため安全です。',
    shortDescription: 'SVGファイルを最適化・圧縮',
    icon: '/icons/tools/svg-optimizer.svg',
    category: 'image'
  },
  // {
  //   id: 'image-corner-rounder',
  //   name: '画像角丸ツール',
  //   description: '画像の角をカスタマイズ可能な半径で丸くします。',
  //   shortDescription: '画像の角を丸くする',
  //   icon: '/icons/tools/image-corner-rounder.svg',
  //   category: 'image'
  // },
  // {
  //   id: 'image-converter',
  //   name: '画像変換ツール',
  //   description: '画像を異なるフォーマットに変換します。JPEG、PNG、WEBPなどをサポート。',
  //   shortDescription: '画像フォーマットを変換',
  //   icon: '/icons/tools/image-converter.svg',
  //   category: 'image'
  // },
]

// カテゴリ一覧を自動生成
export const categories: Category[] = categoryDefinitions.map(cat => ({
  id: cat.id,
  name: cat.name,
  iconBgColor: cat.iconBgColor,
  tools: tools.filter(tool => tool.category === cat.id)
}))

// ヘルパー関数
export function getToolById (id: string): Tool | undefined {
  return tools.find(t => t.id === id)
}
