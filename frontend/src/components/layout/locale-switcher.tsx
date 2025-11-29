'use client'

import { CloseButton, Popover, PopoverButton, PopoverPanel, Transition } from '@headlessui/react'
import { GlobeAltIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { useLocale } from '@/lib/i18n/client'
import type { Locale } from '@/lib/i18n'
import { defaultLocale, getLocalizedPath, locales } from '@/lib/i18n'

const localeNames: Record<string, string> = {
  ja: '日本語',
  en: 'English'
}

export function LocaleSwitcher () {
  const locale = useLocale()
  const pathname = usePathname()

  // Remove current locale prefix from pathname to get base path
  const getBasePath = () => {
    if (locale === defaultLocale) {
      return pathname
    }
    // Remove /en prefix from /en/iromide -> /iromide
    return pathname.replace(`/${locale}`, '')
  }

  // Generate localized path for target locale
  const getLocalizedPathForLocale = (targetLocale: Locale) => {
    const basePath = getBasePath()
    return getLocalizedPath(basePath, targetLocale)
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
                href={getLocalizedPathForLocale(loc)}
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
