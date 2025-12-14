import { create } from '@i18n-tiny/next/proxy'

import { defaultLocale, locales } from '@/lib/i18n'

export const proxy = create({
  locales,
  defaultLocale
})

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
}
