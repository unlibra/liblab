'use client'

import { CloseButton, Dialog, DialogPanel, Popover, PopoverButton, PopoverPanel, Transition, TransitionChild } from '@headlessui/react'
import { Bars3Icon, ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useCallback, useState } from 'react'

import { LogoIcon } from '@/components/icons/logo-icon'
import { siteConfig } from '@/config/site'
import { categories } from '@/config/tools'

import { ThemeToggle } from './theme-toggle'

function CategoryPopover ({ category }: { category: typeof categories[number] }) {
  return (
    <Popover className='group relative'>
      <PopoverButton
        className='flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium uppercase outline-none transition-colors hover:bg-gray-100 data-[focus]:bg-gray-100 data-[open]:bg-gray-100 dark:hover:bg-atom-one-dark-lighter data-[focus]:dark:bg-atom-one-dark-lighter data-[open]:dark:bg-atom-one-dark-lighter'
      >
        {category.name}
        <ChevronDownIcon className='size-4 transition-transform group-data-[open]:rotate-180' />
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
          <div className='w-60 overflow-hidden rounded-lg border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-700 dark:bg-atom-one-dark-light'>
            {category.tools.map((tool) => (
              <CloseButton
                as={Link}
                key={tool.id}
                href={`/${tool.id}`}
                className='flex w-full items-center gap-3 rounded-md px-3 py-2 outline-none transition-colors hover:bg-gray-100 focus-visible:bg-gray-100 dark:hover:bg-atom-one-dark-lighter focus-visible:dark:bg-atom-one-dark-lighter'
              >
                <div className='space-y-0.5'>
                  <span className='text-sm font-medium'>{tool.name}</span>
                  <span className='line-clamp-2 text-xs text-gray-500'>
                    {tool.shortDescription || tool.description}
                  </span>
                </div>
              </CloseButton>
            ))}
          </div>
        </PopoverPanel>
      </Transition>
    </Popover>
  )
}

export function Header () {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleOpenMobileMenu = useCallback(() => {
    setMobileMenuOpen(true)
  }, [])

  const handleCloseMobileMenu = useCallback(() => {
    setMobileMenuOpen(false)
  }, [])

  return (
    <header>
      <nav className='mx-auto flex h-16 max-w-screen-xl items-center justify-between bg-transparent px-4 sm:px-6 lg:px-8'>
        {/* Mobile menu button */}
        <button
          type='button'
          className='flex items-center justify-center rounded-lg p-2 outline-none transition hover:bg-black/5 active:bg-black/10 hover:dark:bg-white/5 active:dark:bg-white/10 sm:hidden'
          onClick={handleOpenMobileMenu}
          aria-label='Open menu'
        >
          <Bars3Icon className='size-6' />
        </button>

        {/* Logo */}
        <Link href='/' className='flex items-center gap-2 outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-500'>
          <LogoIcon className='size-6' />
          <div className='font-logo text-xl font-semibold'>{siteConfig.name}</div>
        </Link>

        {/* Desktop Navigation */}
        <div className='hidden items-center gap-4 sm:flex'>
          {/* Category Popovers */}
          <div className='flex items-center gap-2'>
            {categories.map((category) => (
              <CategoryPopover key={category.id} category={category} />
            ))}
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />
        </div>

        {/* Mobile Theme Toggle */}
        <div className='sm:hidden'>
          <ThemeToggle />
        </div>
      </nav>

      {/* Mobile menu */}
      <Transition show={mobileMenuOpen}>
        <Dialog onClose={setMobileMenuOpen} className='relative z-50 sm:hidden'>
          {/* Background overlay */}
          <TransitionChild
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='fixed inset-0 bg-black/20 dark:bg-black/40' />
          </TransitionChild>

          {/* Slide-in panel */}
          <div className='fixed inset-0'>
            <TransitionChild
              enter='transform transition ease-out duration-300'
              enterFrom='-translate-x-full'
              enterTo='translate-x-0'
              leave='transform transition ease-in duration-200'
              leaveFrom='translate-x-0'
              leaveTo='-translate-x-full'
            >
              <DialogPanel className='fixed inset-y-0 left-0 w-[85vw] max-w-sm overflow-y-auto bg-white px-4 py-4 shadow-xl dark:bg-atom-one-dark-light'>
                <div className='flex items-center justify-between'>
                  <Link href='/' className='flex items-center gap-2 font-logo text-xl font-semibold' onClick={handleCloseMobileMenu}>
                    <LogoIcon className='size-6' />
                    {siteConfig.name}
                  </Link>
                  <button
                    type='button'
                    className='flex items-center justify-center rounded-lg p-2 outline-none transition hover:bg-black/5 active:bg-black/10 hover:dark:bg-white/5 active:dark:bg-white/10'
                    onClick={handleCloseMobileMenu}
                    aria-label='Close menu'
                  >
                    <XMarkIcon className='size-6' />
                  </button>
                </div>
                <div className='mt-6 flow-root'>
                  <div className='space-y-1'>
                    {categories.map((category) => (
                      <div key={category.id} className='space-y-1'>
                        <div className='px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400'>
                          {category.name}
                        </div>
                        {category.tools.map((tool) => (
                          <Link
                            key={tool.id}
                            href={`/${tool.id}`}
                            className='block rounded-lg px-3 py-2 transition-colors hover:bg-gray-100 dark:hover:bg-atom-one-dark-lighter'
                            onClick={handleCloseMobileMenu}
                          >
                            <div className='text-sm font-medium'>{tool.name}</div>
                            <div className='mt-0.5 text-xs text-gray-600 dark:text-gray-400'>
                              {tool.shortDescription || tool.description}
                            </div>
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>
    </header>
  )
}
