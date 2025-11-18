import type { MetadataRoute } from 'next'

import { categories } from '@/lib/tools'

export const dynamic = 'force-static'

export default function sitemap (): MetadataRoute.Sitemap {
  const baseUrl = 'https://8px.app'

  // ホームページ
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl
    }
  ]

  // 全ツールページを追加
  for (const category of categories) {
    for (const tool of category.tools) {
      routes.push({
        url: `${baseUrl}${tool.href}`
      })
    }
  }

  return routes
}
