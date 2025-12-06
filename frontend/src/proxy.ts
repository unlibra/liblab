import { create } from '@i18n-tiny/next/proxy'

import { defaultLocale, locales } from '@/lib/i18n'

export const proxy = create({
  locales,
  defaultLocale,
  prefixDefault: true
})

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
}
