import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { siteConfig } from '@/config/site'
import { getToolById } from '@/config/tools'

const tool = getToolById('iromide')

export const metadata: Metadata = tool
  ? {
      title: tool.name,
      description: tool.description,
      alternates: {
        canonical: `/${tool.id}`
      },
      openGraph: {
        type: 'website',
        url: `/${tool.id}`,
        title: `${tool.name} - ${siteConfig.name}`,
        description: tool.description,
        siteName: siteConfig.name
      },
      twitter: {
        card: 'summary',
        title: `${tool.name} - ${siteConfig.name}`,
        description: tool.description
      }
    }
  : {}

export default function IromideLayout ({ children }: { children: ReactNode }) {
  return <div className='font-[family-name:var(--font-zen-maru)]'>{children}</div>
}
