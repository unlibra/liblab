import { SupportSection } from '@/components/layout/support-section'
import type { Locale } from '@/lib/i18n'

import { IromideClient } from './_components/iromide-client'

export default async function IromidePage ({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  return (
    <IromideClient
      supportSection={<SupportSection locale={locale as Locale} />}
    />
  )
}
