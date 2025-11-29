import { Breadcrumb } from '@/components/ui/breadcrumb'
import { getMessages } from '@/lib/i18n/server'

function renderTextWithLinks (text: string) {
  const urlRegex = /(https:\/\/[^\s]+)/g

  return text.split(urlRegex).map((part, i) => {
    if (urlRegex.test(part)) {
      return (
        <a
          key={`privacy-link-${i}`}
          href={part}
          target='_blank'
          rel='noopener noreferrer'
          className='font-medium text-blue-600 underline hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300'
        >
          {part}
        </a>
      )
    }
    return part
  })
}

export default async function PrivacyPage ({ params }: { params: Promise<{ locale: 'ja' | 'en' }> }) {
  const { locale } = await params
  const messages = await getMessages(locale)

  return (
    <div className='mx-auto max-w-3xl'>
      <Breadcrumb
        items={[
          { label: messages.common.home, href: '/' },
          { label: messages.privacy.title }
        ]}
      />

      <div className='space-y-8'>
        {messages.privacy.sections.map(section => (
          <section key={section.id}>
            <h2 className='mb-4 text-xl font-semibold'>{section.title}</h2>
            {section.body && (
              <p className='whitespace-pre-line'>
                {renderTextWithLinks(section.body.trim())}
              </p>
            )}
            <div className='space-y-8'>
              {section.children?.map(child => (
                <div key={child.id} className='space-y-4'>
                  <h3 className='font-semibold'>{child.subtitle}</h3>
                  <p className='whitespace-pre-line'>{renderTextWithLinks(child.body.trim())}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className='mt-12 border-t border-gray-300 pt-8 dark:border-gray-700'>
        <p>{messages.privacy.lastUpdated}</p>
      </div>
    </div>
  )
}
