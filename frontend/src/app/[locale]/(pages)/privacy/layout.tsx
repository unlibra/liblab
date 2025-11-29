import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { getMessages } from '@/lib/i18n/server'

export async function generateMetadata ({ params }: { params: Promise<{ locale: 'ja' | 'en' }> }): Promise<Metadata> {
  const { locale } = await params
  const messages = await getMessages(locale)
  const privacy = messages.privacy

  return {
    title: privacy.title,
    description: privacy.description,
    alternates: {
      canonical: locale === 'ja' ? '/privacy' : '/en/privacy',
      languages: {
        ja: '/privacy',
        en: '/en/privacy'
      }
    }
  }
}

export default async function PrivacyLayout ({
  children,
  params
}: Readonly<{
  children: ReactNode
  params: Promise<{ locale: string }>
}>) {
  return children
}
