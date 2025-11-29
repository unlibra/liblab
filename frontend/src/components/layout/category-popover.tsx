'use client'

import { CloseButton, Popover, PopoverButton, PopoverPanel, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

import type { categories } from '@/config/tools'
import { Link, useTranslations } from '@/lib/i18n/client'

export function CategoryPopover ({ category }: { category: typeof categories[number] }) {
  const t = useTranslations() // 自動的にMessageKeys型

  return (
    <Popover className='group relative'>
      <PopoverButton
        className='flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium uppercase outline-none transition-colors hover:bg-black/5 data-[focus]:bg-black/5 data-[open]:bg-black/5 dark:hover:bg-white/5 data-[focus]:dark:bg-white/5 data-[open]:dark:bg-white/5'
      >
        {t(`categories.${category.id}`)}
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
                  <span className='text-sm font-medium'>{t(`tools.${tool.id}.name`)}</span>
                  <span className='line-clamp-2 text-xs text-gray-500'>
                    {t(`tools.${tool.id}.shortDescription`)}
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
