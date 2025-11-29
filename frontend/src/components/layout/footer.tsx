import { GitHubIcon } from '@/components/icons/github-icon'
import { LogoIcon } from '@/components/icons/logo-icon'
import { siteConfig } from '@/config/site'
import { categories } from '@/config/tools'
import type { Locale } from '@/lib/i18n'
import { Link } from '@/lib/i18n/client'
import { getMessages, getTranslations } from '@/lib/i18n/server'

export async function Footer ({ locale }: { locale: Locale }) {
  const messages = await getMessages(locale)
  const t = await getTranslations(locale)
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
              <span className='font-logo text-xl font-semibold'>{messages.site.name}</span>
            </Link>
            <p className='mt-3 whitespace-pre-line text-sm text-gray-600 dark:text-gray-400'>
              {t('site.description')}
            </p>
            {githubRepoUrl && (
              <a
                href={githubRepoUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='mt-4 inline-flex items-center gap-2 text-sm text-gray-600 transition-all hover:underline dark:text-gray-400'
              >
                <GitHubIcon className='size-5' />
                {t('footer.github')}
              </a>
            )}
          </div>

          {/* Center: Tools by Category (dynamic columns) */}
          <div className='grid grid-cols-1 gap-8 sm:grid-cols-2'>
            {categories.map((category) => (
              <div key={category.id}>
                <h3 className='mb-3 text-sm font-semibold uppercase tracking-wider'>
                  {t(`categories.${category.id}`)}
                </h3>
                <ul className='space-y-2'>
                  {category.tools.map((tool) => (
                    <li key={tool.id}>
                      <Link
                        href={`/${tool.id}`}
                        className='text-sm text-gray-600 transition-all hover:underline dark:text-gray-400'
                      >
                        {t(`tools.${tool.id}.name`)}
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
              {t('footer.support')}
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
                    {t('footer.bugReport')}
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
                    {t('footer.contact')}
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
                    {t('footer.donate')}
                  </a>
                </li>
              )}
              <li>
                <Link
                  href='/privacy'
                  className='text-sm text-gray-600 transition-all hover:underline dark:text-gray-400'
                >
                  {t('footer.privacyPolicy')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className='mt-8 text-sm text-gray-600 dark:text-gray-400'>
          © {new Date().getFullYear()} {messages.site.author}
        </div>
      </div>
    </footer>
  )
}
