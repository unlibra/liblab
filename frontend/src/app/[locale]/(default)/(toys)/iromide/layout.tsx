import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { generateToolMetadata } from '@/lib/metadata'

export async function generateMetadata (): Promise<Metadata> {
  return generateToolMetadata('iromide', '/iromide')
}

export default function IromideLayout ({ children }: { children: ReactNode }) {
  return children
}
