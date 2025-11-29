/**
 * Client-side i18n utilities
 * Re-exports from the main i18n instance for cleaner imports
 *
 * @example
 * import { Link, useTranslations } from '@/lib/i18n/client'
 *
 * export function MyComponent() {
 *   const t = useTranslations()
 *   return <Link href="/about">{t('nav.about')}</Link>
 * }
 */

import { i18n } from '../i18n'

export const Provider = i18n.client.Provider
export const Link = i18n.client.Link
export const useMessages = i18n.client.useMessages
export const useTranslations = i18n.client.useTranslations
export const useLocale = i18n.client.useLocale
export const useLocalizedPath = i18n.client.useLocalizedPath
export const useLocales = i18n.client.useLocales
