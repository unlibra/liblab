import type { MetadataRoute } from 'next'

import { siteConfig } from '@/config/site'
import { categories } from '@/config/tools'
import { locales } from '@/lib/i18n'

export const dynamic = 'force-static'

export default function sitemap (): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url
  const routes: MetadataRoute.Sitemap = []

  // Generate URLs for each locale
  for (const locale of locales) {
    const localePrefix = `/${locale}`

    // Homepage
    routes.push({
      url: `${baseUrl}${localePrefix}`,
      alternates: {
        languages: Object.fromEntries(
          locales.map(l => [l, `${baseUrl}/${l}`])
        )
      }
    })

    // Add all tool pages
    for (const category of categories) {
      for (const tool of category.tools) {
        routes.push({
          url: `${baseUrl}${localePrefix}/${tool.id}`,
          alternates: {
            languages: Object.fromEntries(
              locales.map(l => [l, `${baseUrl}/${l}/${tool.id}`])
            )
          }
        })
      }
    }
  }

  // Add privacy policy page (Japanese only, no locale prefix)
  routes.push({
    url: `${baseUrl}/privacy`
  })

  return routes
}
