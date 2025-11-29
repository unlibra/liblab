import { LogoIcon } from '@/components/icons/logo-icon'
import { categories } from '@/config/tools'
import type { Locale } from '@/lib/i18n'
import { Link } from '@/lib/i18n/client'
import { getMessages } from '@/lib/i18n/server'

import { CategoryPopover } from './category-popover'
import { LocaleSwitcher } from './locale-switcher'
import { MobileMenuButton } from './mobile-menu'
import { ThemeToggle } from './theme-toggle'

export async function Header ({ locale }: { locale: Locale }) {
  const messages = await getMessages(locale)

  return (
    <header>
      <nav className='relative mx-auto flex h-16 max-w-screen-xl items-center justify-between bg-transparent px-4 sm:px-6 lg:px-8'>
        {/* Mobile menu button */}
        <MobileMenuButton />

        {/* Logo - centered on mobile, left on desktop */}
        <Link
          href='/'
          className='absolute left-1/2 flex -translate-x-1/2 items-center gap-2 outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-500 sm:static sm:translate-x-0'
        >
          <LogoIcon className='size-6' />
          <div className='font-logo text-xl font-semibold'>{messages.site.name}</div>
        </Link>

        {/* Desktop Navigation */}
        <div className='hidden items-center gap-3 sm:flex'>
          {/* Category Popovers */}
          <div className='flex items-center gap-2'>
            {categories.map((category) => (
              <CategoryPopover key={category.id} category={category} />
            ))}
          </div>

          {/* Locale Switcher */}
          <LocaleSwitcher />

          {/* Theme Toggle */}
          <ThemeToggle />
        </div>

        {/* Mobile Controls */}
        <div className='z-10 flex items-center gap-2 sm:hidden'>
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
