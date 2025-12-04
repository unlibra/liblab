import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { defaultLocale, locales } from '@/lib/i18n'

export default function proxy (request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if pathname already has a locale
  const hasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (hasLocale) return NextResponse.next()

  // Rewrite to default locale (keep URL as is, internally use /ja)
  request.nextUrl.pathname = `/${defaultLocale}${pathname}`
  return NextResponse.rewrite(request.nextUrl)
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
}
