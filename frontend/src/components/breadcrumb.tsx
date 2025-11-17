import { ChevronRightIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export function Breadcrumb ({ items }: BreadcrumbProps) {
  return (
    <nav className='mb-6 flex min-w-0 items-center gap-2 text-sm'>
      {items.map((item, index) => (
        <div key={index} className='flex min-w-0 items-center gap-2'>
          {index > 0 && <ChevronRightIcon className='size-4 shrink-0 text-gray-600 dark:text-gray-400' />}
          {item.href
            ? (
              <Link href={item.href} className='truncate font-medium leading-none text-blue-600 transition-colors hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300'>
                {item.label}
              </Link>
              )
            : (
              <span className='truncate font-medium leading-none text-gray-600 dark:text-gray-400'>{item.label}</span>
              )}
        </div>
      ))}
    </nav>
  )
}
