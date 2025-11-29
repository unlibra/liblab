import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { WebApplicationSchema } from '@/components/web-application-schema'
import type { Locale } from '@/lib/i18n'
import { generateToolMetadata } from '@/lib/metadata'

export async function generateMetadata ({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return generateToolMetadata('tw-palette-generator', '/tw-palette-generator', locale as Locale)
}

export default async function TwPaletteGeneratorLayout ({ children, params }: { children: ReactNode, params: Promise<{ locale: string }> }) {
  const { locale } = await params

  return (
    <>
      <WebApplicationSchema toolId='tw-palette-generator' locale={locale as Locale} />
      {children}
    </>
  )
}
