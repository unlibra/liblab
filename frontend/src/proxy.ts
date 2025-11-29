import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { defaultLocale, locales } from '@/lib/i18n/types'

export function proxy (request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if pathname already has a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasLocale) {
    return NextResponse.next()
  }

  // Rewrite root and paths without locale to default locale
  // This keeps the URL as `/` but internally processes as `/ja`
  const url = request.nextUrl.clone()
  url.pathname = `/${defaultLocale}${pathname}`

  return NextResponse.rewrite(url)
}

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|api|favicon.ico|.*\\..*).*)'
  ]
}
