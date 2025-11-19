'use client'

import { MoonIcon, SunIcon } from '@heroicons/react/24/solid'
import { useTheme } from 'next-themes'
import { useCallback, useEffect, useState } from 'react'

export function ThemeToggle () {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme, systemTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => (prevTheme === 'system' && systemTheme === 'light') || prevTheme === 'light' ? 'dark' : 'light')
  }, [setTheme, systemTheme])

  // サーバーサイドではプレースホルダーを表示してレイアウトシフト回避
  if (!mounted) {
    return (
      <div className='flex items-center justify-center rounded-full p-2'>
        <div className='size-5' />
      </div>
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className='flex items-center justify-center rounded-full p-2 outline-none transition-colors hover:bg-gray-100 focus-visible:bg-gray-100 dark:hover:bg-atom-one-dark-lighter focus-visible:dark:bg-atom-one-dark-lighter'
      aria-label='Toggle theme'
    >
      {(theme === 'system' && systemTheme === 'light') || theme === 'light' ? <SunIcon className='size-5' /> : <MoonIcon className='size-5' />}
    </button>
  )
}
