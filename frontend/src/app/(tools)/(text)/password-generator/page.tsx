'use client'

import { ArrowPathIcon, ClipboardIcon } from '@heroicons/react/24/outline'
import { useCallback, useEffect, useState } from 'react'

import { useToast } from '@/components/ui/toast'
import { getToolById } from '@/config/tools'

// Character sets
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz'
const NUMBERS = '0123456789'
const SYMBOLS = '!@#$%^&*-_+=?'

// Ambiguous characters to avoid
const AMBIGUOUS = '0O1lI'

type PasswordOptions = {
  length: number
  uppercase: boolean
  lowercase: boolean
  numbers: boolean
  symbols: boolean
  avoidAmbiguous: boolean
}

function generatePassword (options: PasswordOptions): string {
  let charset = ''

  if (options.uppercase) charset += UPPERCASE
  if (options.lowercase) charset += LOWERCASE
  if (options.numbers) charset += NUMBERS
  if (options.symbols) charset += SYMBOLS

  // Remove ambiguous characters if option is enabled
  if (options.avoidAmbiguous) {
    charset = charset.split('').filter(c => !AMBIGUOUS.includes(c)).join('')
  }

  if (charset.length === 0) {
    return ''
  }

  // Use crypto.getRandomValues for secure random generation
  const array = new Uint32Array(options.length)
  crypto.getRandomValues(array)

  return Array.from(array, num => charset[num % charset.length]).join('')
}

// Toggle button component
function ToggleButton ({
  label,
  enabled,
  onChange
}: {
  label: string
  enabled: boolean
  onChange: (enabled: boolean) => void
}) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
        enabled
          ? 'bg-indigo-500 text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-atom-one-dark-light dark:text-gray-400 dark:hover:bg-atom-one-dark-lighter'
      }`}
    >
      {label}
    </button>
  )
}

export default function PasswordGeneratorPage () {
  const tool = getToolById('password-generator')
  const toast = useToast()

  // Password options
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    avoidAmbiguous: true
  })

  // Generated password
  const [password, setPassword] = useState('')

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
    <div className='mx-auto max-w-screen-sm px-4 py-12'>
      {/* Header */}
      <div className='mb-12 text-center'>
        <h1 className='text-3xl font-bold'>{tool?.name ?? 'パスワード生成'}</h1>
        <p className='mt-2 text-gray-500 dark:text-gray-400'>
          {tool?.shortDescription ?? '安全なパスワードを生成'}
        </p>
      </div>

      {/* Password Display */}
      <div className='mb-8'>
        <div className='flex items-center gap-2'>
          <div className='flex-1 overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-atom-one-dark'>
            <input
              type='text'
              value={password}
              readOnly
              className='w-full bg-transparent px-4 py-3 font-mono text-lg focus:outline-none'
              placeholder={hasCharset ? '' : '文字種を選択してください'}
            />
          </div>
          <button
            onClick={handleCopy}
            disabled={!password}
            className='rounded-lg bg-indigo-500 p-3 text-white transition-colors hover:bg-indigo-600 disabled:opacity-50'
            title='コピー'
          >
            <ClipboardIcon className='size-5' />
          </button>
          <button
            onClick={regenerate}
            disabled={!hasCharset}
            className='rounded-lg bg-gray-100 p-3 text-gray-600 transition-colors hover:bg-gray-200 disabled:opacity-50 dark:bg-atom-one-dark-light dark:text-gray-400 dark:hover:bg-atom-one-dark-lighter'
            title='再生成'
          >
            <ArrowPathIcon className='size-5' />
          </button>
        </div>
      </div>

      {/* Options */}
      <div className='space-y-6'>
        {/* Length Slider */}
        <div>
          <div className='mb-2 flex items-center justify-between'>
            <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
              文字数
            </label>
            <span className='font-mono text-sm text-gray-500 dark:text-gray-400'>
              {options.length}
            </span>
          </div>
          <input
            type='range'
            min={8}
            max={64}
            value={options.length}
            onChange={(e) => updateOption('length', parseInt(e.target.value))}
            className='w-full accent-indigo-500'
          />
          <div className='mt-1 flex justify-between text-xs text-gray-400'>
            <span>8</span>
            <span>64</span>
          </div>
        </div>

        {/* Character Type Toggles */}
        <div>
          <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
            使用する文字
          </label>
          <div className='flex flex-wrap gap-2'>
            <ToggleButton
              label='A-Z'
              enabled={options.uppercase}
              onChange={(v) => updateOption('uppercase', v)}
            />
            <ToggleButton
              label='a-z'
              enabled={options.lowercase}
              onChange={(v) => updateOption('lowercase', v)}
            />
            <ToggleButton
              label='0-9'
              enabled={options.numbers}
              onChange={(v) => updateOption('numbers', v)}
            />
            <ToggleButton
              label='記号'
              enabled={options.symbols}
              onChange={(v) => updateOption('symbols', v)}
            />
          </div>
        </div>

        {/* Avoid Ambiguous Toggle */}
        <div>
          <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
            オプション
          </label>
          <div className='flex flex-wrap gap-2'>
            <ToggleButton
              label='紛らわしい文字を避ける'
              enabled={options.avoidAmbiguous}
              onChange={(v) => updateOption('avoidAmbiguous', v)}
            />
          </div>
          <p className='mt-2 text-xs text-gray-400'>
            0とO、1とlとIなど見分けにくい文字を除外します
          </p>
        </div>
      </div>
    </div>
  )
}
