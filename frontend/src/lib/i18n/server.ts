/**
 * Server-side i18n utilities
 * Re-exports from the main i18n instance for cleaner imports
 *
 * @example
 * import { getMessages, getTranslations } from '@/lib/i18n/server'
 *
 * export async function MyPage({ locale }: { locale: Locale }) {
 *   const messages = await getMessages(locale)
 *   const t = await getTranslations(locale)
 *
 *   return <div>{messages.site.name}</div>
 * }
 */

import { i18n } from '../i18n'

export const getMessages = i18n.server.getMessages
export const getTranslations = i18n.server.getTranslations
export const getLocale = i18n.server.getLocale
export const getLocalizedPath = i18n.server.getLocalizedPath
export const getLocales = i18n.server.getLocales
export const getDefaultLocale = i18n.server.getDefaultLocale
