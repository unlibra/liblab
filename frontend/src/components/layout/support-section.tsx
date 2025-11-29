import { HatenaShareButton } from '@/components/ui/hatena-share-button'
import { OfuseButton } from '@/components/ui/ofuse-button'
import { ShareButton } from '@/components/ui/share-button'
import { XShareButton } from '@/components/ui/x-share-button'
import type { Locale } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/server'

export async function SupportSection ({ locale }: { locale: Locale }) {
  const t = await getTranslations(locale)

  return (
    <div className='relative mx-auto flex max-w-screen-md flex-col items-center gap-12 py-32'>

      {/* タイトル＋左右線 */}
      <div className='flex w-full items-center justify-center'>
        <span className='flex-1 border-t-2 border-dashed border-gray-400 dark:border-gray-600' />

        <h3 className='whitespace-nowrap px-4 text-center text-lg font-semibold'>
          {t('supportSection.title')}
        </h3>

        <span className='flex-1 border-t-2 border-dashed border-gray-400 dark:border-gray-600' />
      </div>

      {/* ボタン */}
      <div className='flex flex-col gap-4 sm:flex-row'>
        <XShareButton />
        <HatenaShareButton />
        <ShareButton />
        <OfuseButton />
      </div>

      {/* 下線 */}
      <div className='w-full border-t-2 border-dashed border-gray-400 dark:border-gray-600' />

    </div>
  )
}
