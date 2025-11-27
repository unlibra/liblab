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
      className='group flex w-full flex-col gap-2 rounded-lg p-4 text-left outline-none transition-colors hover:bg-gray-100 focus-visible:bg-gray-100 dark:hover:bg-atom-one-dark-light focus-visible:dark:bg-atom-one-dark-light'
    >
      {/* Icon and Title */}
      <div className='flex items-center gap-3'>
        <div className={`relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full ${iconBgColor}`}>
          <Image
            src={tool.icon}
            alt={tool.name}
            width={40}
            height={40}
            sizes='40px'
          />
        </div>
        <h3 className='font-semibold'>
          {tool.name}
        </h3>
      </div>

      {/* Description */}
      <p className='text-sm text-gray-600 dark:text-gray-400'>
        {tool.description.replace(/\r?\n/g, '')}
      </p>
    </Link>
  )
}
