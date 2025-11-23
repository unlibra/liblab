'use client'

import { Field, Label, Switch } from '@headlessui/react'
import { ArrowPathIcon, ClipboardDocumentCheckIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline'
import { useCallback, useEffect, useState } from 'react'

import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Slider } from '@/components/ui/slider'
import { useToast } from '@/components/ui/toast'
import { TogglePill } from '@/components/ui/toggle-pill'
import { getToolById } from '@/config/tools'
import type { PasswordOptions } from '@/lib/password/generator'
import { generatePassword } from '@/lib/password/generator'

export default function PasswordGeneratorPage () {
  const tool = getToolById('password-generator')
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
      toast.success('コピーしました')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error('コピーに失敗しました')
      console.error('Failed to copy:', err)
    }
  }, [password, toast])

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
          { label: 'ホーム', href: '/' },
          { label: tool?.name ?? 'パスワードジェネレーター' }
        ]}
      />

      <div className='mx-auto max-w-screen-sm'>
        <div className='mb-8 space-y-4'>
          <h1 className='text-2xl font-semibold'>{tool?.name ?? 'パスワードジェネレーター'}</h1>
          <p className='whitespace-pre-line text-gray-600 dark:text-gray-400'>
            {tool?.description ?? ''}
          </p>
        </div>

        {/* Password Display */}
        <div className='mb-8 space-y-3'>
          <div className='relative overflow-hidden rounded-lg border border-gray-200 bg-white'>
            <div
              className='w-full bg-transparent py-3 pl-4 pr-24 font-mono text-lg text-gray-900 outline-none dark:text-gray-100'
            >
              {password || (
                <span className='text-gray-400 dark:text-gray-500'>
                  文字種を選択してください
                </span>
              )}
            </div>
            <button
              onClick={handleCopy}
              disabled={!password}
              className='absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1.5 rounded-md bg-sky-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-sky-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-50 dark:focus-visible:ring-offset-atom-one-dark'
            >
              {copied
                ? (
                  <ClipboardDocumentCheckIcon className='size-5' />
                  )
                : (
                  <ClipboardDocumentIcon className='size-5' />
                  )}
              コピー
            </button>
          </div>
          <button
            onClick={regenerate}
            disabled={!hasCharset}
            className='flex w-full items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-50 dark:bg-atom-one-dark-light dark:text-gray-400 dark:hover:bg-atom-one-dark-lighter dark:focus-visible:ring-offset-atom-one-dark'
          >
            <ArrowPathIcon className='size-5' />
            再生成
          </button>
        </div>

        {/* Options */}
        <div className='space-y-8'>
          {/* Length Slider */}
          <Slider
            label='文字数'
            value={options.length}
            min={8}
            max={64}
            onChange={(value) => updateOption('length', value)}
          />

          {/* Character Type Toggles */}
          <div>
            <label className='mb-2 block text-sm font-semibold'>
              使用する文字
            </label>
            <p className='mb-3 text-xs text-gray-600 dark:text-gray-400'>
              選択した文字種は必ず1文字以上含まれます
            </p>
            <div className='flex flex-wrap gap-2'>
              <TogglePill
                pressed={options.uppercase}
                onClick={() => updateOption('uppercase', !options.uppercase)}
                ariaLabel='大文字を切り替え'
              >
                大文字
              </TogglePill>
              <TogglePill
                pressed={options.lowercase}
                onClick={() => updateOption('lowercase', !options.lowercase)}
                ariaLabel='小文字を切り替え'
              >
                小文字
              </TogglePill>
              <TogglePill
                pressed={options.numbers}
                onClick={() => updateOption('numbers', !options.numbers)}
                ariaLabel='数字を切り替え'
              >
                数字
              </TogglePill>
              <TogglePill
                pressed={options.symbols}
                onClick={() => updateOption('symbols', !options.symbols)}
                ariaLabel='記号を切り替え'
              >
                記号
              </TogglePill>
            </div>
          </div>

          {/* Avoid Ambiguous Toggle */}
          <div>
            <label className='mb-2 block text-sm font-semibold'>
              オプション
            </label>
            <Field as='div' className='flex items-center justify-between gap-4'>
              <Label className='flex-1 cursor-pointer text-sm text-gray-700 dark:text-gray-300'>
                紛らわしい文字を避ける
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
              0とO、1とlとIなど見分けにくい文字を除外します
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
