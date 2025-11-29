'use client'

import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { useCallback, useState } from 'react'

import { LogoIcon } from '@/components/icons/logo-icon'
import { categories } from '@/config/tools'
import { Link, useMessages, useTranslations } from '@/lib/i18n/client'

export function MobileMenuButton () {
  const t = useTranslations()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleOpenMobileMenu = useCallback(() => {
    setMobileMenuOpen(true)
  }, [])

  const handleCloseMobileMenu = useCallback(() => {
    setMobileMenuOpen(false)
  }, [])

  return (
    <>
      <button
        type='button'
        className='z-10 flex items-center justify-center rounded-lg p-2 outline-none transition hover:bg-black/5 active:bg-black/10 hover:dark:bg-white/5 active:dark:bg-white/10 sm:hidden'
        onClick={handleOpenMobileMenu}
        aria-label={t('aria.openMenu')}
      >
        <Bars3Icon className='size-6' />
      </button>

      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={setMobileMenuOpen}
        onCloseMobile={handleCloseMobileMenu}
      />
    </>
  )
}

function MobileMenu ({
  isOpen,
  onClose,
  onCloseMobile
}: {
  isOpen: boolean
  onClose: (open: boolean) => void
  onCloseMobile: () => void
}) {
  const messages = useMessages()
  const t = useTranslations()

  return (
    <Transition show={isOpen}>
      <Dialog onClose={onClose} className='relative z-50 sm:hidden'>
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
                <Link href='/' className='flex items-center gap-2 font-logo text-xl font-semibold' onClick={onCloseMobile}>
                  <LogoIcon className='size-6' />
                  {messages.site.name}
                </Link>
                <button
                  type='button'
                  className='flex items-center justify-center rounded-lg p-2 outline-none transition hover:bg-black/5 active:bg-black/10 hover:dark:bg-white/5 active:dark:bg-white/10'
                  onClick={onCloseMobile}
                  aria-label={t('aria.closeMenu')}
                >
                  <XMarkIcon className='size-6' />
                </button>
              </div>
              <div className='mt-6 flow-root'>
                <div className='space-y-1'>
                  {categories.map((category) => (
                    <div key={category.id} className='space-y-1'>
                      <div className='px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400'>
                        {t(`categories.${category.id}`)}
                      </div>
                      {category.tools.map((tool) => (
                        <Link
                          key={tool.id}
                          href={`/${tool.id}`}
                          className='block rounded-lg px-3 py-2 transition-colors hover:bg-gray-100 dark:hover:bg-atom-one-dark-lighter'
                          onClick={onCloseMobile}
                        >
                          <div className='text-sm font-medium'>{t(`tools.${tool.id}.name`)}</div>
                          <div className='mt-0.5 text-xs text-gray-600 dark:text-gray-400'>
                            {t(`tools.${tool.id}.shortDescription`)}
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
  )
}
