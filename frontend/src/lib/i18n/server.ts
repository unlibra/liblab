import enMessages from '@/messages/en'
import type { Messages } from '@/messages/ja'
import jaMessages from '@/messages/ja'

import type { Locale, NestedKeys } from './types'

const messagesMap = {
  ja: jaMessages,
  en: enMessages
}

/**
 * Get messages object for server components
 * Provides full TypeScript type safety with object property access
 *
 * @example
 * const messages = await getMessages(locale)
 * return <div>{messages.privacy.breadcrumb.home}</div>
 */
export async function getMessages (locale: Locale) {
  return messagesMap[locale]
}

type MessageKeys = NestedKeys<Messages>

/**
 * Get translation function for server components
 * Best for dynamic key access with template literals
 *
 * @example
 * const t = await getTranslations(locale)
 * return <div>{t(`tools.${toolId}.name`)}</div>
 */
export async function getTranslations (locale: Locale, namespace?: string): Promise<(key: MessageKeys) => string> {
  const msgs = await getMessages(locale)

  return (key: MessageKeys) => {
    const fullKey = namespace ? `${String(namespace)}.${key}` : key
    const keys = fullKey.split('.')
    let obj: any = msgs

    for (const k of keys) {
      obj = obj?.[k]
      if (obj === undefined) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[i18n] Missing key: "${fullKey}" in locale "${locale}"`)
        }
        return fullKey
      }
    }

    return obj
  }
}

/**
 * Get current locale from async params (Next.js 15+)
 */
export async function getLocale (params: Promise<{ locale: string }>): Promise<Locale> {
  const { locale } = await params
  return locale as Locale
}
