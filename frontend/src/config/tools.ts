// Category definition type
type CategoryDefinition = {
  readonly id: string
  readonly name: string
  readonly iconBgColor: string
}

// Category definitions
const categoryDefinitions = [
  { id: 'toys', name: 'Toys', iconBgColor: 'bg-logo-accent/70' },
  { id: 'tools', name: 'Tools', iconBgColor: 'bg-logo-medium/70' }
] as const satisfies readonly CategoryDefinition[]

// Auto-extract category ID type
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
    description: 'コーポレートカラーなど指定した色をベースに、TailwindCSSのカラーパレットに馴染む美しいパレットを自動生成。デザインシステムへの統合をスムーズにします。',
    shortDescription: '選んだ色からカラーパレットを生成',
    icon: '/icons/tools/tw-palette-generator.svg',
    category: 'tools'
  },
  {
    id: 'iromide',
    name: '推し色生成 イロマイド',
    description: '好きな写真からカラーパレットを生成。人間の知覚に近い画像解析であなたの「推し色」を取り出せます。推し色をみんなにシェアしましょう！',
    shortDescription: '写真から推し色チェキを作ろう！',
    icon: '/icons/tools/iromide.svg',
    category: 'toys',
  },
  {
    id: 'favicon-generator',
    name: 'Faviconジェネレーター',
    description: 'JPEG、PNG、WEBPなどの画像やSVGをアップロードするだけで、モダンなWebサイトに必要なFaviconとApple Touch Iconを一括生成。角丸加工、背景色設定も一発で完了します。',
    shortDescription: '画像からfaviconファイルを生成',
    icon: '/icons/tools/favicon-generator.svg',
    category: 'tools'
  },
  {
    id: 'svg-optimizer',
    name: 'SVG最適化',
    description: '肥大化しがちなSVGファイルを、品質を保ったまま軽量化。Webサイトのパフォーマンス向上に役立つシンプルで確実な最適化ツールです。',
    shortDescription: 'SVGファイルを最適化・圧縮',
    icon: '/icons/tools/svg-optimizer.svg',
    category: 'tools'
  },
  {
    id: 'password-generator',
    name: 'パスワードジェネレーター',
    description: 'シンプルなパスワードジェネレーター。パスワードの長さと文字種を指定して、簡単にパスワードを生成できます。',
    shortDescription: 'シンプルなパスワードジェネレーター',
    icon: '/icons/tools/password-generator.svg',
    category: 'tools'
  }
]

// Auto-generate category list
export const categories: Category[] = categoryDefinitions.map(cat => ({
  id: cat.id,
  name: cat.name,
  iconBgColor: cat.iconBgColor,
  tools: tools.filter(tool => tool.category === cat.id)
}))

// Helper function
export function getToolById (id: string): Tool | undefined {
  return tools.find(t => t.id === id)
}
