// カテゴリ定義の型
type CategoryDefinition = {
  readonly id: string
  readonly name: string
  readonly iconBgColor: string
}

// カテゴリ定義
const categoryDefinitions = [
  { id: 'color', name: 'Color', iconBgColor: 'bg-gradient-to-br from-orange-200 to-orange-300 dark:from-orange-700 dark:to-orange-600' },
  { id: 'image', name: 'Image', iconBgColor: 'bg-gradient-to-br from-sky-200 to-sky-300 dark:from-sky-700 dark:to-sky-600' }
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
  badge?: string // Optional badge like "HOT", "NEW"
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
    description: 'コーポレートカラーなど指定した色をベースに、TailwindCSSのカラーパレットに馴染む美しいパレットを自動生成。デザインシステムへの統合をスムーズにします。',
    shortDescription: '選んだ色からカラーパレットを生成',
    icon: '/icons/tools/tw-palette-generator.svg',
    category: 'color'
  },
  {
    id: 'iromide',
    name: '推し色生成 イロマイド',
    description: 'お気に入りの画像からカラーパレットを抽出。人間の知覚に近い画像解析であなたの「推し色」を取り出せます。推し色をみんなにシェアしましょう！',
    shortDescription: '画像からカラーパレットを生成',
    icon: '/icons/tools/iromide.svg',
    category: 'color',
    badge: 'HOT'
  },
  {
    id: 'favicon-generator',
    name: 'Faviconジェネレーター',
    description: 'JPEG、PNG、WEBPなどの画像やSVGをアップロードするだけで、モダンなWebサイトに必要なFaviconとApple Touch Iconを一括生成。角丸加工、背景色設定も一発で完了します。',
    shortDescription: '画像からfaviconファイルを生成',
    icon: '/icons/tools/favicon-generator.svg',
    category: 'image'
  },
  {
    id: 'svg-optimizer',
    name: 'SVG最適化',
    description: '肥大化しがちなSVGファイルを、品質を保ったまま軽量化。Webサイトのパフォーマンス向上に役立つシンプルで確実な最適化ツールです。',
    shortDescription: 'SVGファイルを最適化・圧縮',
    icon: '/icons/tools/svg-optimizer.svg',
    category: 'image'
  }
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
