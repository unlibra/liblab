import createMiddleware from 'next-intl/middleware'

import { defaultLocale, locales } from './i18n/request'

export default createMiddleware({
  // Supported locales
  locales,

  // Default locale
  defaultLocale,

  // Whether to include the default locale in the path
  // When 'as-needed', /page is accessible instead of /ja/page for default locale
  localePrefix: 'as-needed',

  // Disable automatic locale detection
  // Reasons: SEO optimization, performance, consistency with Japan-focused promotion
  // - / is always Japanese (for domestic Japan promotion)
  // - /en is always English (for international SEO traffic)
  // - Language switching is handled via LocaleSwitcher in header
  localeDetection: false
})

export const config = {
  // Path patterns to apply next-intl middleware
  // Excludes static files, API routes, and Next.js internal files
  matcher: [
    '/',
    '/(ja|en)/:path*',
    '/((?!_next|_vercel|api|.*\\..*).*)'
  ]
}
