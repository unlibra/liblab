import { LogoIcon } from '@/components/icons/logo-icon'
import { ToolCard } from '@/components/tool-card'
import { siteConfig } from '@/config/site'
import { categories } from '@/config/tools'

export default function Home () {
  // JSON-LD構造化データ
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url
  }

  return (
    <>
      {/* JSON-LD構造化データ */}
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section */}
      <div className='my-12 text-center'>
        <div className='mb-4 flex justify-center'>
          <LogoIcon className='size-16' />
        </div>
        <h1 className='mb-6 font-[Outfit] text-4xl font-semibold'>
          8px.app
        </h1>
        <p className='whitespace-pre-line font-medium text-gray-600 dark:text-gray-400'>
          {`その色も、そのアイコンも、思い通りに。
カラーパレット生成からファビコン作成まで、Web・UI開発者のためのツールセット。`}
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
