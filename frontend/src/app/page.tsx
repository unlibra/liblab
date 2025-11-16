import { ToolCard } from '@/components/tool-card'
import { categories } from '@/lib/tools'

export default function Home () {
  return (
    <>
      {/* Hero Section */}
      <div className='my-12 text-center'>
        <h1 className='mb-4 font-[Outfit] text-4xl font-bold'>
          8px.app
        </h1>
        <p className='text-lg text-gray-500'>
          ウェブ開発をもっとスムーズに、もっとクリエイティブに。
        </p>
        <p className='text-lg text-gray-500'>
          開発者のための便利なツールを集めたコレクションです。
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
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
