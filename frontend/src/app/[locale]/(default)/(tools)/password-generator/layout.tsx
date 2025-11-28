import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { generateToolMetadata } from '@/lib/metadata'

export async function generateMetadata (): Promise<Metadata> {
  return generateToolMetadata('password-generator', '/password-generator')
}

export default function PasswordGeneratorLayout ({ children }: { children: ReactNode }) {
  return children
}
