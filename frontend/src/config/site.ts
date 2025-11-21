export const siteConfig = {
  name: '8px.app',
  url: 'https://8px.app',
  description: 'その色も、そのアイコンも、思い通りに。カラーパレット生成からファビコン作成まで、Web・UI開発者のためのツールセット。',
  author: '8px.app Project',
  title: {
    default: '8px.app | Web Developer Toolkit',
    template: '%s | 8px.app'
  },
  locale: 'ja_JP',
  links: {
    github: process.env.NEXT_PUBLIC_GITHUB_URL || ''
  }
} as const

export type SiteConfig = typeof siteConfig
