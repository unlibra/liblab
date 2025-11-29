'use client'

import { useEffect, useState } from 'react'

import { useTranslations } from '@/lib/i18n/client'

import { HatenaIcon } from '../icons/hatena-icon'

export function HatenaShareButton () {
  const t = useTranslations()
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')

  useEffect(() => {
    setTitle(document.title.replace(/ \| [^ |]+$/, ''))
    setUrl(window.location.href)
  }, [])

  const shareUrl = `http://b.hatena.ne.jp/add?mode=confirm&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`

  return (
    <a
      href={shareUrl}
      target='_blank'
      rel='noopener noreferrer'
      className='inline-flex w-44 items-center justify-center gap-2 rounded-full bg-[#00a4de] py-3 font-medium text-white transition-colors hover:bg-[#00a4de]/80'
    >
      <HatenaIcon className='size-5' />
      {t('supportSection.shareOnHatena')}
    </a>
  )
}
