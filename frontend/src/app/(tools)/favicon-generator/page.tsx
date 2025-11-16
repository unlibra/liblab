'use client'

import { Disclosure } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { LightBulbIcon, LockClosedIcon, PhotoIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'

import { FileUpload } from '@/components/file-upload'
import { Slider } from '@/components/slider'
import type { FaviconSize } from '@/lib/favicon-generator'
import {
  AVAILABLE_SIZES,
  DEFAULT_SIZES,
  generateFavicon
} from '@/lib/favicon-generator'
import { downloadBlob, loadImageFromFile, processImage } from '@/lib/image-processing'

export default function FaviconGeneratorPage () {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedSizes, setSelectedSizes] = useState<Set<FaviconSize>>(
    new Set(DEFAULT_SIZES)
  )
  const [borderRadius, setBorderRadius] = useState(0)
  const [backgroundColor, setBackgroundColor] = useState('#ffffff')
  const [useBackground, setUseBackground] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null)

  // Detect screen size for accordion default state
  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)')
    setIsDesktop(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setIsDesktop(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const validateImageFile = (file: File): string | null => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return '有効な画像ファイルを選択してください'
    }

    // Validate file size (max 10MB)
    const maxFileSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxFileSize) {
      return 'ファイルサイズが大きすぎます（最大10MB）'
    }

    return null
  }

  const handleFilesChange = async (files: File[]) => {
    setSelectedFiles(files)

    if (files.length === 0) {
      setImage(null)
      setError(null)
      return
    }

    const file = files[0]
    setError(null)

    // Load image
    try {
      const loadedImage = await loadImageFromFile(file)

      // Validate image dimensions (max 4096x4096)
      const maxDimension = 4096
      if (loadedImage.width > maxDimension || loadedImage.height > maxDimension) {
        setError(`画像サイズが大きすぎます（最大${maxDimension}×${maxDimension}px）`)
        return
      }

      setImage(loadedImage)
    } catch (err) {
      setError('画像の読み込みに失敗しました')
      console.error(err)
    }
  }

  // Update preview when settings change
  useEffect(() => {
    if (!image) {
      setPreviewUrl(null)
      return
    }

    let currentUrl: string | null = null

    const updatePreview = async () => {
      try {
        const previewSize = 256
        const blob = await processImage(image, previewSize, {
          borderRadiusPercent: borderRadius,
          backgroundColor: useBackground ? backgroundColor : undefined
        })

        const url = URL.createObjectURL(blob)
        currentUrl = url
        setPreviewUrl(url)
      } catch (err) {
        console.error('Failed to update preview:', err)
      }
    }

    updatePreview()

    // Cleanup
    return () => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl)
      }
    }
  }, [image, borderRadius, backgroundColor, useBackground])

  const handleSizeToggle = (size: FaviconSize) => {
    setSelectedSizes((prev) => {
      const newSizes = new Set(prev)
      if (newSizes.has(size)) {
        newSizes.delete(size)
      } else {
        newSizes.add(size)
      }
      return newSizes
    })
  }

  const handleGenerate = async () => {
    if (!image) {
      setError('画像ファイルを選択してください')
      return
    }

    if (selectedSizes.size === 0) {
      setError('少なくとも1つのサイズを選択してください')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const sizes = Array.from(selectedSizes).sort((a, b) => a - b)
      const icoBlob = await generateFavicon(image, sizes, {
        borderRadiusPercent: borderRadius,
        backgroundColor: useBackground ? backgroundColor : undefined
      })
      downloadBlob(icoBlob, 'favicon.ico')
    } catch (err) {
      setError('ファビコンの生成に失敗しました')
      console.error(err)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className='mx-auto max-w-6xl'>
      <h1 className='mb-4 text-3xl font-bold'>Faviconジェネレーター</h1>
      <p className='mb-8 text-gray-500 dark:text-gray-400'>
        画像からfaviconファイルを生成します。すべての処理はブラウザ内で完結します。
      </p>

      {/* Privacy Notice */}
      <div className='mb-8 flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950'>
        <LockClosedIcon className='size-5 flex-shrink-0 text-blue-600 dark:text-blue-400' />
        <div className='text-sm text-blue-900 dark:text-blue-100'>
          すべての画像処理はブラウザ内で安全に実行されます。サーバーにデータは一切送信されません。
        </div>
      </div>

      {/* File Upload */}
      <div className='mb-8'>
        <label className='mb-2 block text-sm font-medium'>
          画像をアップロード
        </label>
        <FileUpload
          accept='image/*'
          selectedFiles={selectedFiles}
          onFilesChange={handleFilesChange}
          validateFile={validateImageFile}
          dragDropText='クリックして画像を選択'
          clickText='PNG, JPG, SVGなどの画像ファイルをアップロードできます (最大10MB)'
          showFileList={false}
        />
      </div>

      {/* Preview and Settings Panel */}
      <div className='mb-8 grid gap-6 lg:grid-cols-2'>
        {/* Preview */}
        <div>
          <label className='mb-2 block text-sm font-medium'>
            プレビュー
          </label>
          <div className='flex h-80 w-80 items-center justify-center rounded-lg border border-gray-300 p-4 dark:border-gray-600'>
            <div
              className='flex h-64 w-64 items-center justify-center rounded'
              style={previewUrl
                ? {
                    backgroundImage: `
                      linear-gradient(45deg, #ccc 25%, transparent 25%),
                      linear-gradient(-45deg, #ccc 25%, transparent 25%),
                      linear-gradient(45deg, transparent 75%, #ccc 75%),
                      linear-gradient(-45deg, transparent 75%, #ccc 75%)
                    `,
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                  }
                : {}}
            >
              {previewUrl
                ? (
                  <img
                    src={previewUrl}
                    alt='プレビュー'
                    className='h-64 w-64 rounded'
                    style={{ imageRendering: 'auto' }}
                  />
                  )
                : (
                  <div className='text-center text-sm text-gray-600 dark:text-gray-400'>
                    <PhotoIcon className='mx-auto mb-2 h-12 w-12' />
                    <p>画像を選択すると</p>
                    <p>プレビューが表示されます</p>
                  </div>
                  )}
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        {isDesktop !== null && (
          <Disclosure key={String(isDesktop)} defaultOpen={isDesktop}>
            {({ open }) => (
              <div className='space-y-4'>
                <Disclosure.Button className='flex w-full items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-left font-medium transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700'>
                  <span className='text-sm font-semibold'>設定オプション</span>
                  <ChevronDownIcon
                    className={`h-5 w-5 transition-transform ${
                      open ? 'rotate-180' : ''
                    }`}
                  />
                </Disclosure.Button>
                <Disclosure.Panel className='space-y-6'>
                  {/* Size Selection */}
                  <div>
                    <label className='mb-2 block text-sm font-medium'>
                      含めるサイズを選択
                    </label>
                    <div className='grid grid-cols-4 gap-2'>
                      {AVAILABLE_SIZES.map((size) => (
                        <button
                          key={size}
                          onClick={() => handleSizeToggle(size)}
                          className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          selectedSizes.has(size)
                            ? 'border-blue-500 bg-blue-500 text-white dark:border-blue-600 dark:bg-blue-600'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
                        }`}
                        >
                          {size}×{size}
                        </button>
                      ))}
                    </div>
                    <p className='mt-2 text-xs text-gray-500 dark:text-gray-400'>
                      推奨：16×16、32×32、48×48
                    </p>
                  </div>

                  {/* Border Radius */}
                  <div>
                    <Slider
                      label='角丸'
                      value={borderRadius}
                      min={0}
                      max={100}
                      unit='%'
                      onChange={setBorderRadius}
                      description='画像の角を丸くします（100%で円になります）'
                    />
                  </div>

                  {/* Background Color */}
                  <div className='space-y-3'>
                    <div className='flex items-center gap-2'>
                      <input
                        type='checkbox'
                        id='use-background'
                        checked={useBackground}
                        onChange={(e) => setUseBackground(e.target.checked)}
                        className='h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700'
                      />
                      <label htmlFor='use-background' className='text-sm font-medium'>
                        背景色を追加
                      </label>
                    </div>
                    {useBackground && (
                      <div className='flex items-center gap-3'>
                        <input
                          type='color'
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          className='h-10 w-20 cursor-pointer rounded border border-gray-300 dark:border-gray-600'
                        />
                        <input
                          type='text'
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          placeholder='#ffffff'
                          className='flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200'
                        />
                      </div>
                    )}
                    <p className='text-xs text-gray-500 dark:text-gray-400'>
                      透過画像に背景色を追加します
                    </p>
                  </div>
                </Disclosure.Panel>
              </div>
            )}
          </Disclosure>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className='mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200'>
          {error}
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={!image || selectedSizes.size === 0 || isGenerating}
        className='rounded-full bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-600'
      >
        {isGenerating ? '生成中...' : 'ダウンロード'}
      </button>

      {/* Info Section */}
      <div className='mt-12 rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800'>
        <div className='mb-3 flex items-center gap-2'>
          <LightBulbIcon className='size-5' />
          <h2 className='text-lg font-semibold'>faviconファイルについて</h2>
        </div>
        <div className='space-y-2 text-sm text-gray-600 dark:text-gray-300'>
          <p>
            <strong>推奨サイズ：</strong> 16×16と32×32が最も一般的に使用されるサイズです。
            48×48はデスクトップショートカットやタスクマネージャーのアイコンに使用されます。
          </p>
          <p>
            <strong>使用方法：</strong> 生成されたfavicon.icoファイルをウェブサイトのルートディレクトリに配置するか、
            HTMLで参照してください：<code className='rounded bg-gray-200 px-1 dark:bg-gray-700'>&lt;link rel=&quot;icon&quot; href=&quot;/favicon.ico&quot;&gt;</code>
          </p>
        </div>
      </div>
    </div>
  )
}
