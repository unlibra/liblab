import Link from 'next/link'

import { siteConfig } from '@/config/site'
import { categories } from '@/config/tools'

import { LogoIcon } from './icons/logo-icon'

export function Footer () {
  const githubRepoUrl = siteConfig.links.github
  const issuesUrl = githubRepoUrl ? `${githubRepoUrl}/issues` : ''
  const ideasUrl = githubRepoUrl ? `${githubRepoUrl}/discussions/categories/ideas` : ''
  const generalUrl = githubRepoUrl ? `${githubRepoUrl}/discussions/categories/general` : ''

  return (
    <footer className='bg-gray-100 py-12 dark:bg-atom-one-dark-light'>
      <div className='mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 gap-8 md:grid-cols-[1fr_2fr_1fr] lg:gap-12'>
          {/* Left: Logo and Site Name */}
          <div>
            <Link href='/' className='inline-flex items-center gap-2 transition-all hover:underline'>
              <LogoIcon className='size-6' />
              <span className='font-[Outfit] text-xl font-semibold'>{siteConfig.name}</span>
            </Link>
            <p className='mt-3 text-sm text-gray-600 dark:text-gray-400'>
              {siteConfig.description}
            </p>
            <p className='mt-12 text-sm text-gray-600 dark:text-gray-400'>
              © {new Date().getFullYear()} {siteConfig.author}
            </p>
          </div>

          {/* Center: Tools by Category (dynamic columns) */}
          <div className='grid grid-cols-1 gap-8 sm:grid-cols-2'>
            {categories.map((category) => (
              <div key={category.id}>
                <h3 className='mb-3 text-sm font-semibold uppercase tracking-wider'>
                  {category.name}
                </h3>
                <ul className='space-y-2'>
                  {category.tools.map((tool) => (
                    <li key={tool.id}>
                      <Link
                        href={`/${tool.id}`}
                        className='text-sm text-gray-600 transition-all hover:underline dark:text-gray-400'
                      >
                        {tool.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Right: Feedback Links */}
          <div>
            <h3 className='mb-3 text-sm font-semibold uppercase tracking-wider'>
              Support
            </h3>
            <ul className='space-y-2'>
              {issuesUrl && (
                <li>
                  <a
                    href={issuesUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-sm text-gray-600 transition-all hover:underline dark:text-gray-400'
                  >
                    バグ報告
                  </a>
                </li>
              )}
              {ideasUrl && (
                <li>
                  <a
                    href={ideasUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-sm text-gray-600 transition-all hover:underline dark:text-gray-400'
                  >
                    機能要望
                  </a>
                </li>
              )}
              {generalUrl && (
                <li>
                  <a
                    href={generalUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-sm text-gray-600 transition-all hover:underline dark:text-gray-400'
                  >
                    問い合わせ
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
