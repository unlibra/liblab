import type { MetadataRoute } from 'next'

import { siteConfig } from '@/config/site'
import { categories } from '@/config/tools'

export const dynamic = 'force-static'

export default function sitemap (): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url

  // Homepage
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl
    }
  ]

  // Add all tool pages
  for (const category of categories) {
    for (const tool of category.tools) {
      routes.push({
        url: `${baseUrl}/${tool.id}`
      })
    }
  }

  // Add privacy policy page
  routes.push({
    url: `${baseUrl}/privacy`
  })

  return routes
}
