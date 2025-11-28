import type { ReactNode } from 'react'

import { SupportSection } from '@/components/layout/support-section'

export default function WithSupportLayout ({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <SupportSection />
    </>
  )
}
