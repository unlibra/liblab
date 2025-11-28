import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { generateToolMetadata } from '@/lib/metadata'

export async function generateMetadata (): Promise<Metadata> {
  return generateToolMetadata('tw-palette-generator', '/tw-palette-generator')
}

export default function TwPaletteGeneratorLayout ({ children }: { children: ReactNode }) {
  return children
}
