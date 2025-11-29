'use client'

import NextLink from 'next/link'
import type { ComponentProps } from 'react'

import { useLocalizedPath } from '@/lib/i18n/client'

/**
 * Localized Link component that automatically prefixes paths with current locale
 * Wraps Next.js Link with automatic locale handling
 *
 * @example
 * // In ja locale: renders as /iromide
 * // In en locale: renders as /en/iromide
 * <Link href="/iromide">Go to Iromide</Link>
 */
export function Link ({ href, ...props }: ComponentProps<typeof NextLink>) {
  const getPath = useLocalizedPath()

  // Only localize string hrefs, not object hrefs
  const localizedHref = typeof href === 'string' ? getPath(href) : href

  return <NextLink href={localizedHref} {...props} />
}
