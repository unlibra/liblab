import { LogoIcon } from '@/components/icons/logo-icon'
import { ToolCard } from '@/components/tool-card'
import { siteConfig } from '@/config/site'
import { categories } from '@/config/tools'

export default function Home () {
  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    description: siteConfig.description.replace(/\r?\n/g, ''),
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
        <div className='absolute -bottom-12 -top-24 left-1/2 -z-50 w-screen -translate-x-1/2 overflow-hidden sm:-bottom-24 xl:-bottom-32'>
          <div className='absolute inset-0 bg-gradient-to-br from-logo-light/10 to-logo-accent/10 dark:from-[#CFCFCF]/10 dark:to-[#7A7A7A]/10' />
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 1440 320'
            className='absolute bottom-0 h-24 w-full sm:h-48 xl:h-64'
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
            {siteConfig.name}
          </h1>
          <p className='whitespace-pre-line font-medium text-gray-600 dark:text-gray-400'>
            {siteConfig.description}
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
                {category.name}
              </h2>
            </div>

            {/* Tool Cards Grid */}
            <div className='grid grid-cols-1 gap-3 lg:grid-cols-2'>
              {category.tools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} iconBgColor={category.iconBgColor} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
