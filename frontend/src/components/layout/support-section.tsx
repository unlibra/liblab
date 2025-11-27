import { OfuseButton } from '@/components/ui/ofuse-button'
import { XShareButton } from '@/components/ui/x-share-button'

export function SupportSection () {
  return (
    <div className='relative mx-auto my-32 flex max-w-screen-md flex-col items-center gap-12'>

      {/* タイトル＋左右線 */}
      <div className='flex w-full items-center justify-center'>
        <span className='flex-1 border-t-2 border-dashed border-gray-400 dark:border-gray-600' />

        <h3 className='whitespace-nowrap px-4 text-center text-lg font-semibold'>
          応援よろしくお願いします！
        </h3>

        <span className='flex-1 border-t-2 border-dashed border-gray-400 dark:border-gray-600' />
      </div>

      {/* ボタン */}
      <div className='flex flex-col gap-4 sm:flex-row'>
        <XShareButton />
        <OfuseButton />
      </div>

      {/* 下線 */}
      <div className='w-full border-t-2 border-dashed border-gray-400 dark:border-gray-600' />

    </div>
  )
}
