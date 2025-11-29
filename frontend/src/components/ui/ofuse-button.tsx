'use client'

import { OfuseIcon } from '@/components/icons/ofuse-icon'
import { siteConfig } from '@/config/site'
import { useTranslations } from '@/lib/i18n/client'

export function OfuseButton () {
  const t = useTranslations()
  const ofuseUrl = siteConfig.links.sponsor

  if (!ofuseUrl) return <></>

  return (
    <a
      href={ofuseUrl}
      target='_blank'
      rel='noopener noreferrer'
      className='inline-flex w-44 items-center justify-center gap-2 rounded-full bg-[#ef8493] py-3 font-medium text-white transition-colors hover:bg-[#ef8493]/80'
    >
      <OfuseIcon className='size-6' />
      {t('supportSection.sendTip')}
    </a>
  )
}
