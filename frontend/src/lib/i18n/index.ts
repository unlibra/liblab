import { createI18n } from '@8pxapp/i18n'
import type { NestedKeys } from '@8pxapp/i18n/types'

import enMessages from '@/messages/en'
import jaMessages from '@/messages/ja'

export type Locale = 'ja' | 'en'
export type Messages = typeof jaMessages
export type MessageKeys = NestedKeys<Messages>

/**
 * Typed i18n instance with automatic type inference
 */
type TypedI18n = {
  server: {
    getMessages(locale: string): Promise<Messages>
    getTranslations(locale: string, namespace?: string): Promise<(key: MessageKeys) => string>
    getLocale(params: { locale: string }): string
    getLocalizedPath(path: string, locale: string): string
    getLocales(): readonly string[]
    getDefaultLocale(): string
  }
  client: {
    Provider: ReturnType<typeof createI18n>['client']['Provider']
    useMessages(): Messages
    useTranslations(namespace?: string): (key: MessageKeys) => string
    useLocale(): string
    useLocalizedPath(): (path: string) => string
    useLocales(): readonly string[]
    Link: ReturnType<typeof createI18n>['client']['Link']
  }
}

/**
 * I18n configuration for the application
 * This single export provides all i18n functionality
 */
export const i18n = createI18n({
  locales: ['ja', 'en'] as const,
  defaultLocale: 'ja',
  messages: {
    ja: jaMessages,
    en: enMessages
  }
}) as TypedI18n

// Re-export for convenience
export const locales: readonly Locale[] = ['ja', 'en']
export const defaultLocale: Locale = 'ja'

/**
 * Helper function to get localized path
 * This is a convenience wrapper around i18n.server.getLocalizedPath
 */
export function getLocalizedPath (path: string, locale: Locale): string {
  if (locale === defaultLocale) {
    return path
  }
  return `/${locale}${path}`
}
