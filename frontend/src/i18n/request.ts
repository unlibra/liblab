import { getRequestConfig } from 'next-intl/server'

// Supported locales
export const locales = ['ja', 'en'] as const
export type Locale = typeof locales[number]

// Default locale
export const defaultLocale: Locale = 'ja'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

  // Validate locale
  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  }
})
