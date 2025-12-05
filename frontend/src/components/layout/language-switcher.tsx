'use client'

import { CloseButton, Popover, PopoverButton, PopoverPanel, Transition } from '@headlessui/react'
import { GlobeAltIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import type { Locale } from '@/lib/i18n'
import { defaultLocale, locales, useLocale } from '@/lib/i18n'

const localeNames: Record<string, string> = {
  ja: '日本語',
  en: 'English'
}

export function LanguageSwitcher () {
  const locale = useLocale()
  const pathname = usePathname()
  const [browserLocale, setBrowserLocale] = useState<string | null>(null)

  useEffect(() => {
    // Detect browser language on client side
    const detected = navigator.language.split('-')[0].toLowerCase()
    setBrowserLocale(locales.includes(detected as Locale) ? detected : defaultLocale)
  }, [])

  // Generate localized path for new locale
  const getLocalizedPath = (newLocale: Locale) => {
    const basePath = removeLocalePrefix(pathname, locales)

    // If browser locale matches target locale and it's the default locale, use no prefix
    if (browserLocale === newLocale && newLocale === defaultLocale) {
      return basePath
    }

    // Otherwise, use explicit locale prefix
    return `/${newLocale}${basePath}`
  }

  return (
    <Popover className='relative'>
      <PopoverButton
        className='flex items-center justify-center gap-2 rounded-full p-2 outline-none transition-colors hover:bg-black/5 focus-visible:bg-black/5 dark:hover:bg-white/5 focus-visible:dark:bg-white/5'
        aria-label='Change language'
      >
        <GlobeAltIcon className='size-5' />
        <span className='mr-1 hidden text-sm font-medium sm:block'>Language</span>
      </PopoverButton>

      <Transition
        enter='transition duration-100 ease-out'
        enterFrom='transform scale-95 opacity-0'
        enterTo='transform scale-100 opacity-100'
        leave='transition duration-100 ease-out'
        leaveFrom='transform scale-100 opacity-100'
        leaveTo='transform scale-95 opacity-0'
      >
        <PopoverPanel className='absolute right-0 z-50 mt-2'>
          <div className='w-32 overflow-hidden rounded-lg border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-700 dark:bg-atom-one-dark-light'>
            {locales.map((loc) => (
              <CloseButton
                key={loc}
                as={Link}
                href={getLocalizedPath(loc)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm outline-none transition-colors ${
                  locale === loc
                    ? 'bg-sky-50 dark:bg-atom-one-dark-lighter'
                    : 'hover:bg-gray-100 focus-visible:bg-gray-100 dark:hover:bg-atom-one-dark-lighter focus-visible:dark:bg-atom-one-dark-lighter'
                }`}
              >
                {localeNames[loc]}
              </CloseButton>
            ))}
          </div>
        </PopoverPanel>
      </Transition>
    </Popover>
  )
}
