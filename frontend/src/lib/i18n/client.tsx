'use client'

import type { ReactNode } from 'react'
import { createContext, useCallback, useContext, useMemo } from 'react'

import enMessages from '@/messages/en'
import type { Messages } from '@/messages/ja'
import jaMessages from '@/messages/ja'

import type { Locale, NestedKeys } from './types'
import { defaultLocale } from './types'

const messagesMap = {
  ja: jaMessages,
  en: enMessages
}

interface I18nContextValue {
  locale: Locale
  messages: Messages
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined)

export function I18nProvider ({
  locale,
  children
}: {
  locale: Locale
  children: ReactNode
}) {
  const value = useMemo(() => ({
    locale,
    messages: messagesMap[locale]
  }), [locale])

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  )
}

function useI18nContext () {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18nContext must be used within I18nProvider')
  }
  return context
}

/**
 * Get messages object for client components
 * Provides full TypeScript type safety with object property access
 *
 * @example
 * const messages = useMessages()
 * return <div>{messages.privacy.breadcrumb.home}</div>
 */
export function useMessages () {
  return useI18nContext().messages
}

type MessageKeys = NestedKeys<Messages>

/**
 * Get translation function for client components
 * Best for dynamic key access with template literals
 *
 * @example
 * const t = useTranslations()
 * return <div>{t(`tools.${toolId}.name`)}</div>
 */
export function useTranslations (namespace?: string): (key: MessageKeys) => string {
  const { locale, messages } = useI18nContext()

  return useCallback(
    (key: MessageKeys) => {
      const fullKey = namespace ? `${String(namespace)}.${key}` : key
      const keys = fullKey.split('.')
      let obj: any = messages

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
    },
    [namespace, messages, locale]
  )
}

/**
 * Get current locale
 */
export function useLocale (): Locale {
  return useI18nContext().locale
}

/**
 * Generate localized path based on current locale
 * Default locale (ja) uses root path, other locales are prefixed
 *
 * @example
 * // In ja locale
 * getLocalizedPath('/iromide', 'ja') // -> '/iromide'
 *
 * // In en locale
 * getLocalizedPath('/iromide', 'en') // -> '/en/iromide'
 */
export function getLocalizedPath (path: string, locale: Locale): string {
  if (locale === defaultLocale) {
    return path
  }
  return `/${locale}${path}`
}

/**
 * Hook to get localized path generator for current locale
 *
 * @example
 * const getPath = useLocalizedPath()
 * return <Link href={getPath('/iromide')} />
 */
export function useLocalizedPath () {
  const locale = useLocale()
  return useCallback((path: string) => getLocalizedPath(path, locale), [locale])
}
