import Image from 'next/image'
import Link from 'next/link'

import type { Tool } from '@/config/tools'

type ToolCardProps = {
  tool: Tool
  iconBgColor: string
}

export function ToolCard ({ tool, iconBgColor }: ToolCardProps) {
  return (
    <Link
      href={`/${tool.id}`}
      className='group flex w-full items-center gap-4 rounded-lg p-4 text-left outline-none transition-colors hover:bg-gray-100 focus-visible:bg-gray-100 dark:hover:bg-atom-one-dark-light focus-visible:dark:bg-atom-one-dark-light'
    >
      {/* Tool Icon */}
      <div className={`relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg ${iconBgColor}`}>
        <Image
          src={tool.icon}
          alt={tool.name}
          width={48}
          height={48}
        />
      </div>

      {/* Tool Info */}
      <div className='flex min-w-0 flex-1 flex-col gap-1'>
        <h3 className='flex items-center gap-2 font-semibold'>
          {tool.name}
          {tool.badge && (
            <span className='rounded bg-rose-500 px-1.5 py-0.5 text-xs font-semibold text-white'>
              {tool.badge}
            </span>
          )}
        </h3>
        <p className='line-clamp-3 text-sm text-gray-600 dark:text-gray-400'>
          {tool.description}
        </p>
      </div>
    </Link>
  )
}
