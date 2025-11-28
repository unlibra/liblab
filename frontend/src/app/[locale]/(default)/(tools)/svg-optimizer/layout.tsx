import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { generateToolMetadata } from '@/lib/metadata'

export async function generateMetadata (): Promise<Metadata> {
  return generateToolMetadata('svg-optimizer', '/svg-optimizer')
}

export default function SvgOptimizerLayout ({ children }: { children: ReactNode }) {
  return children
}
