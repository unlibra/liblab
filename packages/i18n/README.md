# @8pxapp/i18n

Type-safe, zero-dependency i18n library for Next.js App Router with React Server Components support.

Inspired by next-intl, designed for simplicity and type safety.

## Features

- **Type-safe**: Full TypeScript support with autocomplete
- **Zero dependencies**: No external i18n libraries needed
- **Server Components**: Native RSC support
- **Simple API**: Single configuration, minimal boilerplate
- **Small**: Minimal bundle size
- **No global state**: Pure function factory pattern

## Installation

```bash
# Already installed via workspace
```

## Usage

### 1. Create i18n Instance

Create your i18n configuration in a single file:

```typescript
// src/lib/i18n.ts
import { createI18n } from '@8pxapp/i18n'
import enMessages from '@/messages/en'
import jaMessages from '@/messages/ja'

export const i18n = createI18n({
  locales: ['ja', 'en'] as const,
  defaultLocale: 'ja',
  messages: {
    ja: jaMessages,
    en: enMessages
  }
})

export type Locale = 'ja' | 'en'

// Re-export for convenience (optional)
export const locales: readonly Locale[] = ['ja', 'en']
export const defaultLocale: Locale = 'ja'
```

### 2. Use in Root Layout

```typescript
// app/[locale]/layout.tsx
import { i18n, type Locale } from '@/lib/i18n'

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params
  const messages = await i18n.server.getMessages(locale)

  return (
    <html lang={locale}>
      <body>
        <i18n.client.Provider locale={locale} messages={messages}>
          {children}
        </i18n.client.Provider>
      </body>
    </html>
  )
}
```

That's it! No additional configuration files, no initialization calls, no wrapper components.

### 3. Type Augmentation (Optional - Recommended for Large Projects)

For automatic type inference without explicit generics, create a type augmentation file:

```typescript
// src/i18n.d.ts
import type { NestedKeys } from '@8pxapp/i18n/types'
import type jaMessages from '@/messages/ja'
import type { i18n } from '@/lib/i18n'

type Messages = typeof jaMessages
type MessageKeys = NestedKeys<Messages>

declare module '@/lib/i18n' {
  interface I18n {
    server: {
      getMessages<M = Messages>(locale: string): Promise<M>
      getTranslations<K extends string = MessageKeys>(
        locale: string,
        namespace?: string
      ): Promise<(key: K) => string>
      getLocale(params: Promise<{ locale: string }>): Promise<string>
      getLocalizedPath(path: string, locale: string): string
      getLocales(): readonly string[]
      getDefaultLocale(): string
    }
    client: {
      Provider: typeof i18n.client.Provider
      useMessages<M = Messages>(): M
      useTranslations<K extends string = MessageKeys>(namespace?: string): (key: K) => string
      useLocale(): string
      useLocalizedPath(): (path: string) => string
      useLocales(): readonly string[]
      Link: typeof i18n.client.Link
    }
  }
}
```

### 4. Usage in Components

#### Server Components

```typescript
import { i18n, type Locale } from '@/lib/i18n'

export async function MyServerComponent({ locale }: { locale: Locale }) {
  // Automatic type inference with .d.ts
  const messages = await i18n.server.getMessages(locale)
  const t = await i18n.server.getTranslations(locale)

  return (
    <div>
      <h1>{messages.site.name}</h1>
      <p>{t('site.description')}</p>
      <i18n.client.Link href="/about">About</i18n.client.Link>
    </div>
  )
}
```

#### Client Components

```typescript
'use client'

import { i18n } from '@/lib/i18n'

export function MyClientComponent() {
  // Automatic type inference with .d.ts
  const messages = i18n.client.useMessages()
  const t = i18n.client.useTranslations()
  const locale = i18n.client.useLocale()

  return (
    <div>
      <h1>{messages.site.name}</h1>
      <p>{t('site.description')}</p>
      <i18n.client.Link href="/contact">Contact</i18n.client.Link>
    </div>
  )
}
```

## Recommended Import Pattern (Re-exports)

For cleaner imports, create re-export files in your application:

```typescript
// src/lib/i18n/server.ts
import { i18n } from '../i18n'

export const getMessages = i18n.server.getMessages
export const getTranslations = i18n.server.getTranslations
export const getLocale = i18n.server.getLocale
export const getLocalizedPath = i18n.server.getLocalizedPath
export const getLocales = i18n.server.getLocales
export const getDefaultLocale = i18n.server.getDefaultLocale
```

```typescript
// src/lib/i18n/client.ts
import { i18n } from '../i18n'

export const Provider = i18n.client.Provider
export const Link = i18n.client.Link
export const useMessages = i18n.client.useMessages
export const useTranslations = i18n.client.useTranslations
export const useLocale = i18n.client.useLocale
export const useLocalizedPath = i18n.client.useLocalizedPath
export const useLocales = i18n.client.useLocales
```

Then use them with cleaner imports:

```typescript
// Server Components
import { getMessages, getTranslations } from '@/lib/i18n/server'

export async function MyPage({ locale }: { locale: Locale }) {
  const messages = await getMessages(locale)
  const t = await getTranslations(locale)

  return <div>{messages.site.name}</div>
}
```

```typescript
// Client Components
'use client'

import { Link, useTranslations } from '@/lib/i18n/client'

export function MyComponent() {
  const t = useTranslations()

  return <Link href="/">{t('nav.home')}</Link>
}
```

Both patterns work equally well - choose based on your preference:
- **Direct access** (`i18n.server.getMessages`) - Explicit, shows the API structure
- **Re-exports** (`getMessages`) - Cleaner imports, less typing

## API Reference

### `createI18n(config)`

Creates an i18n instance with server and client APIs.

**Parameters:**
- `config.locales` - Array of supported locales
- `config.defaultLocale` - Default locale
- `config.messages` - Messages object keyed by locale

**Returns:**
An object with `server` and `client` namespaces.

### Server API (`i18n.server`)

- **`getMessages<M>(locale)`** - Get messages object
- **`getTranslations<K>(locale, namespace?)`** - Get translation function
- **`getLocale(params)`** - Get locale from Next.js params
- **`getLocalizedPath(path, locale)`** - Generate localized path
- **`getLocales()`** - Get all available locales
- **`getDefaultLocale()`** - Get default locale

### Client API (`i18n.client`)

- **`Provider`** - Context provider component (requires `locale` and `messages` props)
- **`useMessages<M>()`** - Get messages object
- **`useTranslations<K>(namespace?)`** - Get translation function
- **`useLocale()`** - Get current locale
- **`useLocalizedPath()`** - Get path localization function
- **`useLocales()`** - Get all available locales
- **`Link`** - Next.js Link with automatic locale handling (supports both string and UrlObject)

## Comparison with Previous Version

### Before (Old Pattern)

```typescript
// Required 3 files + wrapper component

// 1. src/lib/i18n.ts
export const locales = ['ja', 'en'] as const
export const messages = { ja, en }

// 2. src/lib/i18n.server.ts (initialization file)
import { createI18nConfig } from '@8pxapp/i18n/server'
createI18nConfig({ locales, defaultLocale, messages })

// 3. src/components/i18n-provider.tsx (wrapper component)
export function AppI18nProvider({ locale, messages, children }) {
  return (
    <I18nProvider locale={locale} messages={messages} locales={locales} defaultLocale={defaultLocale}>
      {children}
    </I18nProvider>
  )
}

// 4. layout.tsx
import '@/lib/i18n.server' // Side-effect import
import { getMessages } from '@8pxapp/i18n/server'
import { AppI18nProvider } from '@/components/i18n-provider'

const messages = await getMessages(locale)
<AppI18nProvider locale={locale} messages={messages}>
```

- 18 lines of boilerplate
- Side-effect imports (`import '@/lib/i18n.server'`)
- Wrapper component needed
- Provider requires 4 props

### After (New Pattern)

```typescript
// Just 1 file

// src/lib/i18n.ts
import { createI18n } from '@8pxapp/i18n'
export const i18n = createI18n({ locales, defaultLocale, messages })

// layout.tsx
import { i18n } from '@/lib/i18n'

const messages = await i18n.server.getMessages(locale)
<i18n.client.Provider locale={locale} messages={messages}>
```

- 0 lines of boilerplate
- No side-effect imports
- No wrapper component
- Provider requires only 2 props

## Technical Notes

### Message Serialization

This library uses `JSON.parse(JSON.stringify())` to convert ES module namespace objects to plain objects, ensuring React Server Components compatibility. While this adds serialization overhead, it guarantees:

- Safe passing of messages across Server/Client Component boundaries
- No reference sharing between requests
- Predictable behavior in all Next.js rendering modes

For most applications, this overhead is negligible compared to network and rendering costs.

### Link Component

The `Link` component automatically handles both string paths and Next.js `UrlObject`:

```typescript
// String path
<i18n.client.Link href="/about">About</i18n.client.Link>

// UrlObject with query params
<i18n.client.Link href={{ pathname: '/search', query: { q: 'test' } }}>
  Search
</i18n.client.Link>
```

Both will have the locale prefix automatically added based on the current locale.

## License

AGPL-3.0
