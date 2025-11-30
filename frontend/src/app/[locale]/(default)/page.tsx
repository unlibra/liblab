import { LogoIcon } from '@/components/icons/logo-icon'
import { siteConfig } from '@/config/site'
import { categories } from '@/config/tools'
import type { Locale } from '@/lib/i18n'
import { getMessages, getTranslations } from '@/lib/i18n/server'

import { AboutSection } from './_components/about-section'
import { ToolCard } from './_components/tool-card'

export default async function Home ({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const messages = await getMessages(locale) // 自動的にMessages型
  const t = await getTranslations(locale) // 自動的にMessageKeys型

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: messages.site.name,
    description: t('site.description').replace(/\r?\n/g, ''),
    url: siteConfig.url
  }

  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section with Wave Background */}
      <div className='relative -mt-6 mb-12 sm:mb-16'>
        {/* Wave Background - full width, extends to header and below */}
        <div className='absolute -bottom-10 -top-24 left-1/2 -z-10 w-screen -translate-x-1/2 overflow-hidden sm:-bottom-24 xl:-bottom-32'>
          <div className='absolute inset-0 border-b border-transparent bg-gradient-to-b from-white via-logo-light/60 to-logo-medium/80 dark:from-atom-one-dark dark:via-[#999999]/20 dark:to-[#CFCFCF]/20' />
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 1440 320'
            className='absolute bottom-0 h-20 w-full sm:h-48 xl:h-64'
            preserveAspectRatio='none'
          >
            <path
              d='M0,64L48,90.7C96,117,192,171,288,192C384,213,480,203,576,181.3C672,160,768,128,864,149.3C960,171,1056,245,1152,261.3C1248,277,1344,235,1392,213.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'
              className='fill-white dark:fill-atom-one-dark'
            />
          </svg>
        </div>

        {/* Hero Content */}
        <div className='relative mx-auto max-w-screen-sm pb-20 pt-12 text-center'>
          <div className='mb-4 flex justify-center'>
            <LogoIcon className='size-16' />
          </div>
          <h1 className='mb-6 font-logo text-4xl font-semibold'>
            {messages.site.name}
          </h1>
          <p className='whitespace-pre-line font-medium'>
            {t('site.heroDescription')}
          </p>
        </div>
      </div>

      {/* Tools by Category */}
      <div className='mb-12 space-y-12'>
        {categories.map((category) => (
          <div key={category.id} id={category.id}>
            {/* Category Header */}
            <div className='mb-4'>
              <h2 className='text-2xl font-semibold'>
                {t(`categories.${category.id}`)}
              </h2>
            </div>

            {/* Tool Cards Grid */}
            <div className='grid grid-cols-1 gap-3 lg:grid-cols-2'>
              {category.tools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} iconBgColor={category.iconBgColor} locale={locale} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* About Section - band from right screen edge to center, rounded left end */}
      <AboutSection
        title={t('about.title')}
        description={t('about.description')}
        portfolioLink={new URL(siteConfig.links.portfolio).hostname}
        portfolioUrl={siteConfig.links.portfolio}
      />
    </>
  )
}
