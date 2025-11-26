import './globals.css'

import type { Metadata } from 'next'
// eslint-disable-next-line camelcase
import { IBM_Plex_Sans_JP, Outfit, Roboto_Flex, Roboto_Mono, Zen_Maru_Gothic } from 'next/font/google'
import type { ReactNode } from 'react'

import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header'
import { siteConfig } from '@/config/site'
import { Providers } from '@/lib/providers'

const fontASCII = Roboto_Flex({
  subsets: ['latin'],
  variable: '--font-ascii',
  display: 'swap'
})

const fontJP = IBM_Plex_Sans_JP({
  weight: ['400', '500', '600', '700'],
  variable: '--font-jp',
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

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description.replace(/\r?\n/g, ''),
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: '/'
  },
  openGraph: {
    type: 'website',
    locale: siteConfig.locale,
    url: '/',
    title: siteConfig.title.default,
    description: siteConfig.description.replace(/\r?\n/g, ''),
    siteName: siteConfig.name
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title.default,
    description: siteConfig.description.replace(/\r?\n/g, '')
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

export default function RootLayout ({
  children
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang='ja' className={`${fontASCII.variable} ${fontJP.variable} ${fontMono.variable} ${fontZenMaru.variable} ${fontOutfit.variable}`} suppressHydrationWarning>
      <body className='bg-white text-gray-700 antialiased dark:bg-atom-one-dark dark:text-gray-300'>
        <Providers>
          <div className='flex min-h-screen flex-col overflow-x-hidden'>
            <Header />
            <main className='mx-auto w-full max-w-screen-xl flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-8'>
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}
