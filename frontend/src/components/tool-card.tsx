'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

import type { Tool } from '@/lib/tools'

type ToolCardProps = {
  tool: Tool
}

export function ToolCard ({ tool }: ToolCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <Link
      href={tool.href}
      className='group flex w-full items-center gap-4 rounded-lg p-4 text-left transition-colors hover:bg-gray-100 dark:hover:bg-atom-one-dark-light'
    >
      {/* Tool Icon */}
      <div className='relative size-12 shrink-0'>
        {!imageLoaded && (
          <div className='absolute inset-0 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700' />
        )}
        <Image
          src={`https://api.dicebear.com/9.x/shapes/svg?seed=${encodeURIComponent(tool.name)}`}
          alt={tool.name}
          width={48}
          height={48}
          unoptimized
          className={`rounded-lg transition-opacity ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
        />
      </div>

      {/* Tool Info */}
      <div className='flex min-w-0 flex-1 flex-col gap-1'>
        <h3 className='text-sm font-semibold'>
          {tool.name}
        </h3>
        <p className='line-clamp-2 text-xs text-gray-600 dark:text-gray-400'>
          {tool.description}
        </p>
      </div>
    </Link>
  )
}
