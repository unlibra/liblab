'use client'

import { OfuseIcon } from '@/components/icons/ofuse-icon'
import { siteConfig } from '@/config/site'

export function OfuseButton () {
  const ofuseUrl = siteConfig.links.sponsor

  if (!ofuseUrl) return <></>

  return (
    <a
      href={ofuseUrl}
      target='_blank'
      rel='noopener noreferrer'
      className='inline-flex w-48 items-center justify-center gap-2 rounded-full bg-[#2882a7] py-3 font-medium text-white transition-colors hover:bg-[#2882a7]/80'
    >
      <OfuseIcon className='size-6' />
      チップを送る
    </a>
  )
}
