'use client'

import { useTheme } from 'next-themes'
import type { ReactNode } from 'react'

type CheckerboardPreviewProps = {
  children?: ReactNode
  emptyState?: ReactNode
  className?: string
}

export function CheckerboardPreview ({
  children,
  emptyState,
  className = 'aspect-square h-full max-h-64 w-full'
}: CheckerboardPreviewProps) {
  const { resolvedTheme } = useTheme()

  // Checkerboard color adjusted for dark mode
  const checkerboardColor = resolvedTheme === 'dark' ? '#555' : '#ccc'

  const hasContent = !!children

  return (
    <div className='flex w-full items-center justify-center'>
      <div
        className={`flex items-center justify-center rounded-lg ${
          hasContent
            ? 'border border-gray-200 p-4 dark:border-gray-700'
            : 'bg-gray-50 dark:bg-atom-one-dark-light'
        } ${className}`}
        style={
          hasContent
            ? {
                backgroundImage: `
                  linear-gradient(45deg, ${checkerboardColor} 25%, transparent 25%),
                  linear-gradient(-45deg, ${checkerboardColor} 25%, transparent 25%),
                  linear-gradient(45deg, transparent 75%, ${checkerboardColor} 75%),
                  linear-gradient(-45deg, transparent 75%, ${checkerboardColor} 75%)
                `,
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
              }
            : {}
        }
      >
        {hasContent ? children : emptyState}
      </div>
    </div>
  )
}
