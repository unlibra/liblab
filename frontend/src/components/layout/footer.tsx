import Link from 'next/link'

import { LogoIcon } from '@/components/icons/logo-icon'
import { siteConfig } from '@/config/site'
import { categories } from '@/config/tools'

export function Footer () {
  const githubRepoUrl = siteConfig.links.github
  const issuesUrl = githubRepoUrl ? `${githubRepoUrl}/issues` : ''
  const sponsorUrl = siteConfig.links.sponsor

  return (
    <footer className='bg-gray-100 py-12 dark:bg-atom-one-dark-light'>
      <div className='mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 gap-8 md:grid-cols-[1fr_2fr_1fr] lg:gap-12'>
          {/* Left: Logo and Site Name */}
          <div>
            <Link href='/' className='inline-flex items-center gap-2 transition-all hover:underline'>
              <LogoIcon className='size-6' />
              <span className='font-logo text-xl font-semibold'>{siteConfig.name}</span>
            </Link>
            <p className='mt-3 whitespace-pre-line text-sm text-gray-600 dark:text-gray-400'>
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
              {githubRepoUrl && (
                <li>
                  <a
                    href={`${githubRepoUrl}/discussions`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-sm text-gray-600 transition-all hover:underline dark:text-gray-400'
                  >
                    ディスカッション
                  </a>
                </li>
              )}
              {githubRepoUrl && (
                <li>
                  <a
                    href={githubRepoUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-sm text-gray-600 transition-all hover:underline dark:text-gray-400'
                  >
                    GitHub
                  </a>
                </li>
              )}
              {sponsorUrl && (
                <li>
                  <a
                    href={sponsorUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-sm text-gray-600 transition-all hover:underline dark:text-gray-400'
                  >
                    寄付・支援
                  </a>
                </li>
              )}
              <li>
                <Link
                  href='/privacy'
                  className='text-sm text-gray-600 transition-all hover:underline dark:text-gray-400'
                >
                  プライバシーポリシー
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
