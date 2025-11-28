import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { siteConfig } from '@/config/site'
import { getToolById } from '@/config/tools'

const tool = getToolById('svg-optimizer')

export const metadata: Metadata = tool
  ? {
      title: tool.name,
      description: tool.description.replace(/\r?\n/g, ''),
      alternates: {
        canonical: `/${tool.id}`
      },
      openGraph: {
        type: 'website',
        url: `/${tool.id}`,
        title: `${tool.name}`,
        description: tool.description.replace(/\r?\n/g, ''),
        siteName: siteConfig.name,
        images: [{
          url: `${siteConfig.url}/og/default.png`,
          width: 1200,
          height: 630
        }]
      },
      twitter: {
        card: 'summary',
        title: `${tool.name}`,
        description: tool.description.replace(/\r?\n/g, ''),
        images: [{
          url: `${siteConfig.url}/og/default.png`,
          width: 1200,
          height: 630
        }]
      }
    }
  : {}

export default function SvgOptimizerLayout ({ children }: { children: ReactNode }) {
  return <>{children}</>
}
