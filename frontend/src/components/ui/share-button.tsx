'use client'

import { ShareIcon } from '@heroicons/react/24/outline'
import { useCallback } from 'react'

import { useTranslations } from '@/lib/i18n/client'

import { useToast } from './toast'

export function ShareButton () {
  const t = useTranslations()
  const toast = useToast()

  const handleClick = useCallback(async () => {
    const title = document.title.replace(/ \| [^ |]+$/, '')
    const url = window.location.href
    const text = `${title} - ${url}`

    if (navigator.share) {
      try {
        await navigator.share({ title, url, text })
        return
      } catch (e) {
        //
      }
    }

    navigator.clipboard.writeText(text)
      .then(() => toast.info(t('common.copied')))
      .catch(() => toast.error('common.error'))
  }, [toast, t])

  return (
    <button
      onClick={handleClick}
      className='inline-flex w-44 items-center justify-center gap-2 rounded-full bg-logo-dark py-3 font-medium text-white transition-colors hover:bg-logo-dark/80'
    >
      <ShareIcon className='size-5' />
      {t('supportSection.share')}
    </button>
  )
}
