import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import type { Metadata } from 'next'
// eslint-disable-next-line camelcase
import { IBM_Plex_Sans_JP, Outfit, Roboto_Mono, Zen_Maru_Gothic } from 'next/font/google'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'

import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header'
import { siteConfig } from '@/config/site'
import type { Locale } from '@/lib/i18n'
import { getMessages } from '@/lib/i18n'
import { Providers } from '@/lib/providers'

const locales: readonly Locale[] = ['ja', 'en']

const fontSans = IBM_Plex_Sans_JP({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin', 'latin-ext'],
  variable: '--font-sans',
  display: 'swap',
  preload: false
})

const fontMono = Roboto_Mono({
  variable: '--font-mono',
  display: 'swap',
  preload: false
})

const fontZenMaru = Zen_Maru_Gothic({
  weight: ['400', '500', '700'],
  variable: '--font-zen-maru',
  display: 'swap',
  preload: false
})

const fontOutfit = Outfit({
  weight: '600',
  subsets: ['latin'],
  variable: '--font-logo',
  display: 'swap'
})

// Static params generation for all supported locales
export function generateStaticParams () {
  return locales.map((locale) => ({ locale }))
}

// Reject dynamic params not defined in generateStaticParams
export const dynamicParams = false

export async function generateMetadata ({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params

  // Validate locale
  if (!locales.includes(locale as Locale)) {
    notFound()
  }

  const messages = await getMessages(locale)

  return {
    title: messages.site.title.default,
    description: messages.site.description.replace(/\r?\n/g, ''),
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        ja: '/ja',
        en: '/en'
      }
    },
    openGraph: {
      type: 'website',
      locale: locale === 'ja' ? 'ja_JP' : 'en_US',
      url: `/${locale}`,
      title: messages.site.title.default,
      description: messages.site.description.replace(/\r?\n/g, ''),
      siteName: messages.site.name,
      images: [{
        url: `${siteConfig.url}/og/default.png`,
        width: 1200,
        height: 630
      }]
    },
    twitter: {
      card: 'summary',
      title: messages.site.title.default,
      description: messages.site.description.replace(/\r?\n/g, ''),
      images: [{
        url: `${siteConfig.url}/og/default.png`,
        width: 1200,
        height: 630
      }]
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1
      }
    },
    icons: {
      icon: [
        { url: '/icon.svg', type: 'image/svg+xml' },
        { url: '/favicon.ico', sizes: 'any' }
      ],
      apple: '/apple-touch-icon.png'
    },
    manifest: '/manifest.json'
  }
}

export default async function LocaleLayout ({
  children,
  params
}: Readonly<{
  children: ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params

  // Validate locale
  if (!locales.includes(locale as Locale)) {
    notFound()
  }

  // Get messages as plain object (not ES module)
  const currentMessages = await getMessages(locale)

  return (
    <html
      lang={locale}
      className={`${fontSans.variable} ${fontMono.variable} ${fontZenMaru.variable} ${fontOutfit.variable}`}
      suppressHydrationWarning
    >
      <body
        className='bg-white text-gray-700 antialiased dark:bg-atom-one-dark dark:text-gray-300'
      >
        <Providers
          locale={locale as Locale}
          messages={currentMessages}
        >
          <div className='flex min-h-screen flex-col overflow-x-hidden'>
            <Header locale={locale as Locale} />
            <main className='mx-auto w-full max-w-screen-xl flex-1 px-4 pb-12 pt-8 sm:px-6 lg:px-8'>
              {children}
            </main>
            <Footer locale={locale as Locale} />
          </div>
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
