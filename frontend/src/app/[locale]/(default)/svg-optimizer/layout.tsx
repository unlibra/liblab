import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { WebApplicationSchema } from '@/components/web-application-schema'
import type { Locale } from '@/lib/i18n'
import { generateToolMetadata } from '@/lib/metadata'

export async function generateMetadata ({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return generateToolMetadata('svg-optimizer', '/svg-optimizer', locale as Locale)
}

export default async function SvgOptimizerLayout ({ children, params }: { children: ReactNode, params: Promise<{ locale: string }> }) {
  const { locale } = await params

  return (
    <>
      <WebApplicationSchema toolId='svg-optimizer' locale={locale as Locale} />
      {children}
    </>
  )
}
