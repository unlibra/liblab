'use client'

import { Field, Label, Switch } from '@headlessui/react'
import { ArrowPathIcon, ClipboardDocumentCheckIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline'
import { useCallback, useEffect, useState } from 'react'

import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Slider } from '@/components/ui/slider'
import { useToast } from '@/components/ui/toast'
import { TogglePill } from '@/components/ui/toggle-pill'
import type { PasswordOptions } from '@/lib/generators/password'
import { generatePassword } from '@/lib/generators/password'
import { useTranslations } from '@/lib/i18n/client'

export default function PasswordGeneratorPage () {
  const t = useTranslations()
  const toast = useToast()

  // Password options
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: false,
    avoidAmbiguous: true
  })

  // Generated password
  const [password, setPassword] = useState('')
  const [copied, setCopied] = useState(false)

  // Generate password on mount and when options change
  const regenerate = useCallback(() => {
    const newPassword = generatePassword(options)
    setPassword(newPassword)
  }, [options])

  useEffect(() => {
    regenerate()
  }, [regenerate])

  // Copy to clipboard
  const handleCopy = useCallback(async () => {
    if (!password) return

    try {
      await navigator.clipboard.writeText(password)
      toast.success(t('common.copied'))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error(t('passwordGenerator.errors.copyFailed'))
      console.error('Failed to copy:', err)
    }
  }, [password, toast, t])

  // Update option helper
  const updateOption = <K extends keyof PasswordOptions>(key: K, value: PasswordOptions[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }))
  }

  // Check if at least one character type is selected
  const hasCharset = options.uppercase || options.lowercase || options.numbers || options.symbols

  return (
    <>
      <Breadcrumb
        items={[
          { label: t('common.home'), href: '/' },
          { label: t('tools.password-generator.name') }
        ]}
      />

      <div className='mx-auto max-w-screen-sm'>
        <div className='mb-8 space-y-4'>
          <h1 className='text-2xl font-semibold'>{t('tools.password-generator.name')}</h1>
          <p className='whitespace-pre-line text-gray-600 dark:text-gray-400'>
            {t('tools.password-generator.description')}
          </p>
        </div>

        {/* Password Display */}
        <div className='mb-8 space-y-3'>
          <div className='relative overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-600 dark:bg-atom-one-dark-light'>
            <div
              className='w-full truncate bg-transparent py-3 pl-4 pr-28 font-mono text-lg text-gray-900 outline-none dark:text-gray-100'
            >
              {password || (
                <span className='text-gray-400 dark:text-gray-500'>
                  {t('passwordGenerator.selectCharacterTypes')}
                </span>
              )}
            </div>
            <button
              onClick={handleCopy}
              disabled={!password}
              className='absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1.5 rounded-md bg-sky-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-sky-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-50 dark:focus-visible:ring-offset-atom-one-dark'
              aria-label={t('passwordGenerator.copyToClipboard')}
            >
              {copied
                ? (
                  <ClipboardDocumentCheckIcon className='size-5' />
                  )
                : (
                  <ClipboardDocumentIcon className='size-5' />
                  )}
              {t('common.copy')}
            </button>
          </div>
          <button
            onClick={regenerate}
            disabled={!hasCharset}
            className='flex w-full items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-50 dark:bg-atom-one-dark-light dark:text-gray-400 dark:hover:bg-atom-one-dark-lighter dark:focus-visible:ring-offset-atom-one-dark'
          >
            <ArrowPathIcon className='size-5' />
            {t('common.regenerate')}
          </button>
        </div>

        {/* Options */}
        <div className='space-y-8'>
          {/* Length Slider */}
          <Slider
            label={t('passwordGenerator.length')}
            value={options.length}
            min={8}
            max={64}
            onChange={(value) => updateOption('length', value)}
          />

          {/* Character Type Toggles */}
          <div>
            <label className='mb-2 block text-sm font-semibold'>
              {t('passwordGenerator.characterTypes')}
            </label>
            <p className='mb-3 text-xs text-gray-600 dark:text-gray-400'>
              {t('passwordGenerator.characterTypesHint')}
            </p>
            <div className='flex flex-wrap gap-2'>
              <TogglePill
                pressed={options.uppercase}
                onClick={() => updateOption('uppercase', !options.uppercase)}
                ariaLabel='Toggle uppercase'
              >
                {t('passwordGenerator.uppercase')}
              </TogglePill>
              <TogglePill
                pressed={options.lowercase}
                onClick={() => updateOption('lowercase', !options.lowercase)}
                ariaLabel='Toggle lowercase'
              >
                {t('passwordGenerator.lowercase')}
              </TogglePill>
              <TogglePill
                pressed={options.numbers}
                onClick={() => updateOption('numbers', !options.numbers)}
                ariaLabel='Toggle numbers'
              >
                {t('passwordGenerator.numbers')}
              </TogglePill>
              <TogglePill
                pressed={options.symbols}
                onClick={() => updateOption('symbols', !options.symbols)}
                ariaLabel='Toggle symbols'
              >
                {t('passwordGenerator.symbols')}
              </TogglePill>
            </div>
          </div>

          {/* Avoid Ambiguous Toggle */}
          <div>
            <Field as='div' className='flex items-center justify-between gap-4'>
              <Label className='flex-1 cursor-pointer text-sm font-semibold text-gray-700 dark:text-gray-300'>
                {t('passwordGenerator.avoidAmbiguous')}
              </Label>
              <Switch
                checked={options.avoidAmbiguous}
                onChange={(v) => updateOption('avoidAmbiguous', v)}
                className={`${
                options.avoidAmbiguous ? 'bg-sky-500 dark:bg-sky-600' : 'bg-gray-300 dark:bg-gray-600'
              } relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-atom-one-dark`}
              >
                <span
                  aria-hidden='true'
                  className={`${
                  options.avoidAmbiguous ? 'translate-x-4' : 'translate-x-0'
                } pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
                />
              </Switch>
            </Field>
            <p className='mt-2 text-xs text-gray-600 dark:text-gray-400'>
              {t('passwordGenerator.avoidAmbiguousHint')}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
