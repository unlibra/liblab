'use client'

import { ChevronRightIcon } from '@heroicons/react/24/outline'
import { useEffect, useRef, useState } from 'react'

type AboutSectionProps = {
  title: string
  description: string
  portfolioLink?: string
  portfolioUrl?: string
}

export function AboutSection ({ title, description, portfolioLink, portfolioUrl }: AboutSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.6 }
    )

    observer.observe(el)

    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className='my-16 min-h-56 sm:my-24 sm:min-h-60'>
      <div
        className={`ml-auto mr-[calc(50%-50vw)] flex h-56 w-full max-w-screen-sm flex-col justify-between rounded-l-full bg-gray-100 py-10 pl-20 pr-8 transition-[transform,opacity] duration-300 ease-out dark:bg-gray-800/50 sm:h-60 sm:py-12 sm:pl-24 ${
          isVisible ? 'translate-x-0 opacity-100' : 'translate-x-1/2 opacity-0'
        }`}
      >
        <div className='space-y-2'>
          <span className='text-lg font-semibold'>
            {title}
          </span>
          <p className='whitespace-pre-line break-keep text-sm text-gray-600 dark:text-gray-400 sm:text-base'>
            {description}
          </p>
        </div>
        {portfolioUrl && (
          <a
            href={portfolioUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='w-fit rounded-full p-1 pl-0 text-blue-700 underline underline-offset-4 outline-none transition-colors hover:text-blue-500 focus-visible:outline-2 focus-visible:outline-sky-500 dark:text-blue-300'
          >
            <div className='flex items-center gap-2'>
              <ChevronRightIcon className='size-5' />
              {portfolioLink}
            </div>
          </a>
        )}
      </div>
    </div>
  )
}
