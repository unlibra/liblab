import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { siteConfig } from '@/config/site'
import { getToolById } from '@/config/tools'

const tool = getToolById('password-generator')

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
        title: `${tool.name} - ${siteConfig.name}`,
        description: tool.description.replace(/\r?\n/g, ''),
        siteName: siteConfig.name
      },
      twitter: {
        card: 'summary',
        title: `${tool.name} - ${siteConfig.name}`,
        description: tool.description.replace(/\r?\n/g, '')
      }
    }
  : {}

export default function PasswordGeneratorLayout ({ children }: { children: ReactNode }) {
  return <>{children}</>
}
