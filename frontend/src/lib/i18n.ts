// i18n.ts
import { define } from '@i18n-tiny/next'
import { Link } from '@i18n-tiny/next/router'

import enMessages from '@/messages/en'
import jaMessages from '@/messages/ja'

export type Locale = 'ja' | 'en'
export const locales: Locale[] = ['ja', 'en']
export const defaultLocale: Locale = 'en'

const { client, server, Provider } = define({
  locales,
  defaultLocale,
  messages: { ja: jaMessages, en: enMessages }
})

export { Link, Provider }
export const { useMessages, useTranslations, useLocale } = client
export const { getMessages, getTranslations } = server
