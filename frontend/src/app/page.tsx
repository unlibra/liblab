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
    description: siteConfig.description,
    url: siteConfig.url
  }

  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section */}
      <div className='mx-auto my-12 max-w-screen-sm text-center'>
        <div className='mb-4 flex justify-center'>
          <LogoIcon className='size-16' />
        </div>
        <h1 className='mb-6 font-[Outfit] text-4xl font-semibold'>
          {siteConfig.name}
        </h1>
        <p className='whitespace-pre-line break-keep font-medium text-gray-600 dark:text-gray-400'>
          {siteConfig.description.replaceAll('。', '。\n')}
        </p>
      </div>

      {/* Tools by Category */}
      <div className='space-y-12'>
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
