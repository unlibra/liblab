'use client'

import { CloseButton, Popover, PopoverButton, PopoverPanel, Transition } from '@headlessui/react'
import { MoonIcon, SunIcon } from '@heroicons/react/24/solid'
import { useTheme } from 'next-themes'
import { useCallback, useEffect, useRef, useState } from 'react'

function ThemePopoverContent ({
  isLight,
  theme,
  systemTheme,
  handleThemeChange
}: {
  isLight: boolean
  theme: string | undefined
  systemTheme: string | undefined
  handleThemeChange: (newTheme: string) => void
}) {
  const buttonRef = useRef<HTMLButtonElement>(null)

  return (
    <>
      <PopoverButton
        ref={buttonRef}
        className='flex items-center justify-center rounded-full p-2 outline-none transition-colors hover:bg-gray-100 focus-visible:bg-gray-100 dark:hover:bg-atom-one-dark-lighter focus-visible:dark:bg-atom-one-dark-lighter'
        aria-label='Toggle theme'
      >
        {isLight ? <SunIcon className='size-5' /> : <MoonIcon className='size-5' />}
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
            <CloseButton
              onClick={() => {
                handleThemeChange('light')
              }}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm outline-none transition-colors ${theme === 'light' ? 'bg-sky-50 dark:bg-atom-one-dark-lighter' : 'hover:bg-gray-100 focus-visible:bg-gray-100 dark:hover:bg-atom-one-dark-lighter focus-visible:dark:bg-atom-one-dark-lighter'}`}
            >
              <SunIcon className='size-4' />
              ライト
            </CloseButton>
            <CloseButton
              onClick={() => {
                handleThemeChange('dark')
              }}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm outline-none transition-colors ${theme === 'dark' ? 'bg-sky-50 dark:bg-atom-one-dark-lighter' : 'hover:bg-gray-100 focus-visible:bg-gray-100 dark:hover:bg-atom-one-dark-lighter focus-visible:dark:bg-atom-one-dark-lighter'}`}
            >
              <MoonIcon className='size-4' />
              ダーク
            </CloseButton>
            <CloseButton
              onClick={() => {
                handleThemeChange('system')
              }}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm outline-none transition-colors ${theme === 'system' ? 'bg-sky-50 dark:bg-atom-one-dark-lighter' : 'hover:bg-gray-100 focus-visible:bg-gray-100 dark:hover:bg-atom-one-dark-lighter focus-visible:dark:bg-atom-one-dark-lighter'}`}
            >
              {systemTheme === 'light' ? <SunIcon className='size-4' /> : <MoonIcon className='size-4' />}
              システム
            </CloseButton>
          </div>
        </PopoverPanel>
      </Transition>
    </>
  )
}

export function ThemeToggle () {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme, systemTheme, resolvedTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleThemeChange = useCallback((newTheme: string) => {
    setTheme(newTheme)
  }, [setTheme])

  // Determine if current display is light
  const isLight = resolvedTheme === 'light'

  // Show placeholder on server-side to avoid layout shift
  if (!mounted) {
    return (
      <div className='flex items-center justify-center rounded-full p-2'>
        <div className='size-5' />
      </div>
    )
  }

  return (
    <Popover className='relative'>
      <ThemePopoverContent
        isLight={isLight}
        theme={theme}
        systemTheme={systemTheme}
        handleThemeChange={handleThemeChange}
      />
    </Popover>
  )
}
