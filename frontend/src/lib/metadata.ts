import type { Metadata } from 'next'

import { siteConfig } from '@/config/site'
import type { Locale } from '@/lib/i18n'
import { getMessages } from '@/lib/i18n/server'

/**
 * Generate metadata for tool pages with proper i18n support
 */
export async function generateToolMetadata (
  toolId: string,
  pathname: string,
  locale: Locale
): Promise<Metadata> {
  const messages = await getMessages(locale)
  const tool = messages.tools[toolId as keyof typeof messages.tools]

  const title = tool.name
  const description = tool.description.replace(/\r?\n/g, '')
  const url = locale === 'ja' ? pathname : `/en${pathname}`

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        ja: pathname,
        en: `/en${pathname}`
      }
    },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      locale: locale === 'ja' ? 'ja_JP' : 'en_US',
      siteName: messages.site.name,
      images: [{
        url: `${siteConfig.url}/og/default.png`,
        width: 1200,
        height: 630
      }]
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: [{
        url: `${siteConfig.url}/og/default.png`,
        width: 1200,
        height: 630
      }]
    }
  }
}
