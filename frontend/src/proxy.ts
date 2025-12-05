import { detectLocale } from '@i18n-tiny/core'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { locales } from '@/lib/i18n'

export function proxy (req: NextRequest) {
  const { pathname } = req.nextUrl

  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  )
  if (hasLocale) return NextResponse.next()

  const acceptLanguage = req.headers.get('accept-language')
  const lang = detectLocale(acceptLanguage, locales) ?? 'en'

  if (lang === 'ja') {
    return NextResponse.rewrite(new URL(`/ja${pathname}`, req.url))
  }
  return NextResponse.redirect(new URL(`/en${pathname}`, req.url))
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
}
