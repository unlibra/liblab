import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'

import { siteConfig } from '@/config/site'

/**
 * Generate metadata for tool pages with proper i18n support
 */
export async function generateToolMetadata (toolId: string, pathname: string): Promise<Metadata> {
  const locale = await getLocale()
  const t = await getTranslations()

  const title = t(`tools.${toolId}.name`)
  const description = t(`tools.${toolId}.description`).replace(/\r?\n/g, '')
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
      siteName: siteConfig.name,
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
