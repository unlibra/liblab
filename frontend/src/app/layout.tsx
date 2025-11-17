import './globals.css'

import { GoogleAnalytics } from '@next/third-parties/google'
import type { Metadata } from 'next'
// eslint-disable-next-line camelcase
import { IBM_Plex_Sans_JP, Roboto_Flex, Roboto_Mono } from 'next/font/google'
import type { ReactNode } from 'react'

import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
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

export const metadata: Metadata = {
  title: '8px.app | Web Developer Toolkit',
  description: 'Web開発に必要なすべてを、シンプルに。コードとデザインの境界を越え、クリエイターの想像力を刺激する便利な機能を集めました。',
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
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

  return (
    <html lang='ja' className={`${fontASCII.variable} ${fontJP.variable} ${fontMono.variable}`} suppressHydrationWarning>
      <body className='bg-white text-gray-700 antialiased dark:bg-atom-one-dark dark:text-gray-300'>
        <Providers>
          <div className='flex min-h-screen flex-col'>
            <Header />
            <main className='mx-auto w-full max-w-screen-xl flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-8'>
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
        {gaId && <GoogleAnalytics gaId={gaId} />}
      </body>
    </html>
  )
}
