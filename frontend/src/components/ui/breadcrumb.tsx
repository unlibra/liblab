import { ChevronRightIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

import { siteConfig } from '@/config/site'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export function Breadcrumb ({ items }: BreadcrumbProps) {
  // Generate structured data (JSON-LD)
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href && { item: `${siteConfig.url}${item.href}` })
    }))
  }

  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Visual breadcrumb list */}
      <nav className='mb-6 flex min-w-0 items-center gap-2 text-sm' aria-label='Breadcrumb'>
        {items.map((item, index) => (
          <div key={index} className='flex min-w-0 items-center gap-2'>
            {index > 0 && <ChevronRightIcon className='size-4 shrink-0 text-gray-600 dark:text-gray-400' aria-hidden='true' />}
            {item.href
              ? (
                <Link href={item.href} className='truncate font-medium leading-none text-blue-600 outline-none transition-colors hover:text-blue-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-500 dark:text-blue-400 dark:hover:text-blue-300'>
                  {item.label}
                </Link>
                )
              : (
                <span className='truncate font-medium leading-none text-gray-600 dark:text-gray-400' aria-current='page'>
                  {item.label}
                </span>
                )}
          </div>
        ))}
      </nav>
    </>
  )
}
