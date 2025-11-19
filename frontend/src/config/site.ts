export const siteConfig = {
  name: '8px.app',
  url: 'https://8px.app',
  description: 'Web開発に必要なすべてを、シンプルに。コードとデザインの境界を越え、クリエイターの想像力を刺激する便利な機能を集めました。',
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
