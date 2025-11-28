import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { generateToolMetadata } from '@/lib/metadata'

export async function generateMetadata (): Promise<Metadata> {
  return generateToolMetadata('favicon-generator', '/favicon-generator')
}

export default function FaviconGeneratorLayout ({ children }: { children: ReactNode }) {
  return children
}
