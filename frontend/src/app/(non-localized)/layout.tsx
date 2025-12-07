import '@/app/globals.css'

import type { Metadata } from 'next'
// eslint-disable-next-line camelcase
import { IBM_Plex_Sans_JP, Outfit, Roboto_Mono, Zen_Maru_Gothic } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import type { ReactNode } from 'react'

import { siteConfig } from '@/config/site'

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

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    apple: '/apple-touch-icon.png'
  },
  manifest: '/manifest.json'
}

export default function NonLocalizedLayout ({
  children
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html
      lang='ja'
      className={`${fontSans.variable} ${fontMono.variable} ${fontZenMaru.variable} ${fontOutfit.variable}`}
      suppressHydrationWarning
    >
      <body
        className='bg-white text-gray-700 antialiased dark:bg-atom-one-dark dark:text-gray-300'
      >
        <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
          <div className='flex min-h-screen flex-col overflow-x-hidden'>
            <main className='mx-auto w-full max-w-screen-xl flex-1 px-4 pb-12 pt-8 sm:px-6 lg:px-8'>
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
