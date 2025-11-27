import Image from 'next/image'

import banner from '@/assets/images/ofuse-c.png'
import { siteConfig } from '@/config/site'

export function SupportSection () {
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `${siteConfig.name} - ${siteConfig.description.split('\n')[0]}`
  )}&url=${encodeURIComponent(siteConfig.url)}`

  const ofuseUrl = siteConfig.links.sponsor // または固定URL

  return (
    <div className='mx-auto my-12 rounded-lg bg-gray-50 py-12 dark:bg-atom-one-dark-lighter'>
      <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
        {/* Twitter Share */}
        <div className='flex flex-col items-center justify-center p-6'>
          <h3 className='mb-3 text-lg font-semibold'>
            気に入ったらシェア
          </h3>
          <p className='mb-4 text-center text-sm text-gray-600 dark:text-gray-400'>
            このサイトが便利だと思ったら、ぜひシェアしてください！
          </p>
          <a
            href={twitterShareUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center gap-2 rounded-full bg-[#1DA1F2] px-6 py-3 font-medium text-white transition-colors hover:bg-[#1a8cd8]'
          >
            <svg className='size-5' fill='currentColor' viewBox='0 0 24 24'>
              <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
            </svg>
            Xでシェア
          </a>
        </div>

        {/* OFUSE / Donation */}
        {ofuseUrl && (
          <div className='flex flex-col items-center justify-center p-6'>
            <h3 className='mb-3 text-lg font-semibold'>
              寄付・支援
            </h3>
            <a
              href={ofuseUrl}
              target='_blank'
              rel='noopener noreferrer'
            >
              <Image
                src={banner}
                alt='OFUSEで支援する'
                width={320}
                height={180}
                sizes='320px'
                className='w-80 rounded-lg'
              />
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
