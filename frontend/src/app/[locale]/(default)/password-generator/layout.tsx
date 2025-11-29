import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { WebApplicationSchema } from '@/components/web-application-schema'
import type { Locale } from '@/lib/i18n'
import { generateToolMetadata } from '@/lib/metadata'

export async function generateMetadata ({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return generateToolMetadata('password-generator', '/password-generator', locale as Locale)
}

export default async function PasswordGeneratorLayout ({ children, params }: { children: ReactNode, params: Promise<{ locale: string }> }) {
  const { locale } = await params

  return (
    <>
      <WebApplicationSchema toolId='password-generator' locale={locale as Locale} />
      {children}
    </>
  )
}
