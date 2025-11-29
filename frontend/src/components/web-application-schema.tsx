import { siteConfig } from '@/config/site'
import type { ToolId } from '@/config/tools'
import type { Locale } from '@/lib/i18n'
import { defaultLocale } from '@/lib/i18n'
import { getMessages } from '@/lib/i18n/server'

interface WebApplicationSchemaProps {
  toolId: ToolId
  locale: Locale
}

export async function WebApplicationSchema ({ toolId, locale }: WebApplicationSchemaProps) {
  const messages = await getMessages(locale)
  const tool = messages.tools[toolId]

  // Generate localized URL
  const url = locale === defaultLocale
    ? `${siteConfig.url}/${toolId}`
    : `${siteConfig.url}/${locale}/${toolId}`

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: tool.name,
    description: tool.description.replace(/\r?\n/g, ' '),
    url,
    applicationCategory: 'DesignApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'JPY'
    },
    author: {
      '@type': 'Person',
      name: messages.site.author
    },
    inLanguage: locale === 'ja' ? 'ja-JP' : 'en-US'
  }

  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
