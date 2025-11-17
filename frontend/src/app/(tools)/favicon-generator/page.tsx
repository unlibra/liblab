'use client'

import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { LockClosedIcon, PhotoIcon } from '@heroicons/react/24/outline'
import type { ChangeEvent } from 'react'
import { useEffect, useRef, useState } from 'react'

import { Breadcrumb } from '@/components/breadcrumb'
import { FullPageDropZone } from '@/components/full-page-drop-zone'
import { Slider } from '@/components/slider'
import type { FaviconSize, OutputSetId } from '@/lib/favicon-generator'
import {
  AVAILABLE_SIZES,
  DEFAULT_OUTPUT_SETS,
  DEFAULT_SIZES,
  generateOutputSet,
  OUTPUT_SETS
} from '@/lib/favicon-generator'
import { downloadBlob, loadImageFromFile, processImage } from '@/lib/image-processing'
import { createZip } from '@/lib/zip-utils'

export default function FaviconGeneratorPage () {
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedSets, setSelectedSets] = useState<Set<OutputSetId>>(
    new Set(DEFAULT_OUTPUT_SETS)
  )
  const [selectedSizes, setSelectedSizes] = useState<Set<FaviconSize>>(
    new Set(DEFAULT_SIZES)
  )
  const [borderRadius, setBorderRadius] = useState(0)
  const [backgroundColor, setBackgroundColor] = useState('#ffffff')
  const [useBackground, setUseBackground] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleFileSelect = async (file: File) => {
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

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
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
        // Use original size if smaller than 256px, otherwise cap at 256px
        const previewSize = Math.min(256, image.width, image.height)
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

  const handleSetToggle = (setId: OutputSetId) => {
    setSelectedSets((prev) => {
      const newSets = new Set(prev)
      if (newSets.has(setId)) {
        newSets.delete(setId)
      } else {
        newSets.add(setId)
      }
      return newSets
    })
  }

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

    if (selectedSets.size === 0) {
      setError('少なくとも1つの出力形式を選択してください')
      return
    }

    if (selectedSets.has('favicon') && selectedSizes.size === 0) {
      setError('favicon.icoを選択した場合、少なくとも1つのサイズを選択してください')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const sizes = Array.from(selectedSizes).sort((a, b) => a - b)
      const effectiveBackgroundColor = useBackground ? backgroundColor : undefined

      // Generate files for all selected output sets
      const allFiles: Array<{ name: string, blob: Blob }> = []

      for (const setId of selectedSets) {
        const outputSet = OUTPUT_SETS.find(s => s.id === setId)
        if (!outputSet) continue

        const files = await generateOutputSet(image, outputSet, {
          sizes,
          borderRadiusPercent: borderRadius,
          backgroundColor: effectiveBackgroundColor
        })

        allFiles.push(...files)
      }

      // Download single file or create ZIP
      if (allFiles.length === 1) {
        downloadBlob(allFiles[0].blob, allFiles[0].name)
      } else {
        const zipBlob = await createZip(allFiles)
        downloadBlob(zipBlob, 'favicons.zip')
      }
    } catch (err) {
      setError('ファビコンの生成に失敗しました')
      console.error(err)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <FullPageDropZone
      onFileDrop={handleFileSelect}
      validateFile={validateImageFile}
      accept='image/*'
    >
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Faviconジェネレーター' }
        ]}
      />

      <div className='mx-auto max-w-screen-lg'>
        <h1 className='mb-4 text-3xl font-bold'>Faviconジェネレーター</h1>
        <p className='mb-8 text-gray-600 dark:text-gray-400'>
          画像からfaviconファイルを生成します。Apple Touch IconやAndroidアイコンもサポート。すべての処理はブラウザで安全に行われます。
        </p>

        {/* Privacy Notice */}
        <div className='mb-8 flex items-center gap-3 rounded-lg border border-sky-200 bg-sky-50 p-4 text-sky-900 dark:border-gray-700 dark:bg-atom-one-dark-light dark:text-gray-300'>
          <LockClosedIcon className='size-5' />
          <div className='text-sm'>
            すべての画像処理はブラウザ内で安全に実行されます。サーバーにデータは一切送信されません。
          </div>
        </div>

        {/* Main Content Layout */}
        <div className='mb-8 flex flex-col gap-8 lg:flex-row'>
          {/* Left Column */}
          <div className='flex-1 space-y-8'>
            {/* File Upload */}
            <div>
              <h6 className='mb-2 block text-sm font-semibold'>
                画像をアップロード
              </h6>
              <input
                ref={fileInputRef}
                type='file'
                accept='image/*'
                onChange={handleInputChange}
                className='hidden'
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className='flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
              >
                <PhotoIcon className='h-5 w-5' />
                画像を選択
              </button>
              <p className='mt-2 text-xs text-gray-500 dark:text-gray-400'>
                PNG, JPG, SVGなどの画像ファイルをアップロードできます (最大10MB)
                <br />
                または画面のどこにでもドラッグ&ドロップ
              </p>
            </div>

            {/* Settings Panel (Mobile Only) */}
            {isDesktop !== null && (
              <Disclosure key={String(isDesktop)} defaultOpen={isDesktop} as='div' className='lg:hidden'>
                {({ open }) => (
                  <div className={`overflow-hidden rounded-lg ${isDesktop ? '' : 'bg-gray-100 dark:bg-atom-one-dark-light'}`}>
                    <DisclosureButton className='flex w-full items-center justify-between rounded-lg px-4 py-3 text-left font-medium transition-colors hover:bg-gray-100 focus:outline-none dark:hover:bg-gray-700'>
                      <h6 className='text-sm font-semibold'>設定オプション</h6>
                      <ChevronDownIcon
                        className={`h-5 w-5 transition-transform ${open ? 'rotate-180' : ''
                          }`}
                      />
                    </DisclosureButton>
                    <DisclosurePanel className='space-y-6 p-4'>
                      {/* Format Selection */}
                      <div>
                        <div className='mb-3'>
                          <span className='block text-sm font-semibold'>
                            出力ファイル形式
                          </span>
                        </div>
                        <div className='flex flex-wrap gap-2'>
                          {OUTPUT_SETS.map((outputSet) => (
                            <button
                              key={outputSet.id}
                              onClick={() => handleSetToggle(outputSet.id)}
                              className={`rounded-full px-4 py-2 text-sm font-medium transition-all focus:outline-none ${selectedSets.has(outputSet.id)
                                ? 'bg-sky-500 text-white hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-500'
                                : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
                                }`}
                            >
                              {outputSet.label}
                            </button>
                          ))}
                        </div>
                        <div className='mt-4 text-xs text-gray-600 dark:text-gray-400'>
                          {OUTPUT_SETS.map((set, i) => (
                            <div key={set.id}>
                              <strong>{set.label}:</strong> {set.description}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className='border-t border-gray-200 dark:border-gray-700' />

                      {/* Size Selection - Only show if favicon is selected */}
                      {selectedSets.has('favicon') && (
                        <>
                          <div>
                            <div className='mb-3'>
                              <span className='block text-sm font-semibold'>
                                favicon.icoに含めるサイズ
                              </span>
                            </div>

                            <div className='space-y-4'>
                              {/* 推奨サイズ */}
                              <div>
                                <div className='mb-2 text-xs font-medium text-gray-700 dark:text-gray-300'>
                                  推奨サイズ
                                </div>
                                <div className='flex flex-wrap gap-2'>
                                  {DEFAULT_SIZES.map((size) => (
                                    <button
                                      key={size}
                                      onClick={() => handleSizeToggle(size)}
                                      className={`rounded-full px-4 py-2 text-sm font-medium transition-all focus:outline-none ${selectedSizes.has(size)
                                        ? 'bg-sky-500 text-white hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-500'
                                        : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
                                        }`}
                                    >
                                      {size}×{size}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* 追加サイズ */}
                              <div>
                                <div className='mb-2 text-xs font-medium text-gray-600 dark:text-gray-400'>
                                  その他サイズ
                                </div>
                                <div className='flex flex-wrap gap-2'>
                                  {AVAILABLE_SIZES.filter(s => !DEFAULT_SIZES.includes(s)).map((size) => (
                                    <button
                                      key={size}
                                      onClick={() => handleSizeToggle(size)}
                                      className={`rounded-full px-4 py-2 text-sm font-medium transition-all focus:outline-none ${selectedSizes.has(size)
                                        ? 'bg-sky-500 text-white dark:bg-sky-600'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                        }`}
                                    >
                                      {size}×{size}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className='border-t border-gray-200 dark:border-gray-700' />
                        </>
                      )}

                      {/* Border Radius */}
                      <div>
                        <div className='mb-3'>
                          <span className='block text-sm font-semibold'>
                            角丸の調整
                          </span>
                          <p className='mt-1 text-xs text-gray-600 dark:text-gray-400'>
                            アイコンの角を丸くします。Apple Touch IconはiOSが自動的に角丸にします。
                          </p>
                        </div>
                        <Slider
                          label=''
                          value={borderRadius}
                          min={0}
                          max={100}
                          unit='%'
                          onChange={setBorderRadius}
                          description=''
                        />
                      </div>

                      <div className='border-t border-gray-200 dark:border-gray-700' />

                      {/* Background Color */}
                      <div>
                        <div className='mb-3'>
                          <span className='block text-sm font-semibold'>
                            背景色の設定
                          </span>
                          <p className='mt-1 text-xs text-gray-600 dark:text-gray-400'>
                            透過PNGに背景色を追加します。Apple Touch Iconは常に背景色が適用されます。
                          </p>
                        </div>
                        <div className='space-y-3'>
                          <div className='flex items-center gap-2'>
                            <input
                              type='checkbox'
                              id='use-background'
                              checked={useBackground}
                              onChange={(e) => setUseBackground(e.target.checked)}
                              className='size-4 accent-sky-600 focus:outline-none'
                            />
                            <label htmlFor='use-background' className='text-sm font-medium'>
                              背景色を追加する
                            </label>
                          </div>
                          {useBackground && (
                            <div className='flex items-center gap-3'>
                              <input
                                type='color'
                                value={backgroundColor}
                                onChange={(e) => setBackgroundColor(e.target.value)}
                                className='h-10 w-20 cursor-pointer rounded bg-transparent focus:outline-none'
                              />
                              <input
                                type='text'
                                value={backgroundColor}
                                onChange={(e) => setBackgroundColor(e.target.value)}
                                placeholder='#ffffff'
                                className='flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none dark:border-gray-600 dark:bg-atom-one-dark-light'
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </DisclosurePanel>
                  </div>
                )}
              </Disclosure>
            )}

            {/* Preview */}
            <div className='flex flex-col'>
              <h6 className='mb-2 block text-sm font-semibold'>
                プレビュー
              </h6>
              <div className='flex w-full items-center justify-center'>
                <div
                  className={`flex items-center justify-center bg-gray-100 dark:bg-atom-one-dark-light ${previewUrl ? 'size-fit rounded' : 'aspect-square h-full max-h-64 w-full rounded-lg'}`}
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

            {/* Download Button */}
            <div className='flex justify-center'>
              <button
                onClick={handleGenerate}
                disabled={!image || selectedSets.size === 0 || isGenerating}
                className='rounded-full bg-sky-500 px-8 py-3 font-medium text-white transition-colors focus:outline-none enabled:hover:bg-sky-600 disabled:opacity-50 dark:bg-sky-600 enabled:dark:hover:bg-sky-500'
              >
                {isGenerating ? '生成中...' : 'ダウンロード'}
              </button>
            </div>
          </div>

          {/* Right Column - Settings Panel (Desktop Only) */}
          {isDesktop !== null && (
            <Disclosure key={`desktop-${String(isDesktop)}`} defaultOpen={isDesktop} as='div' className='hidden lg:block lg:flex-1'>
              {({ open }) => (
                <div className={`overflow-hidden rounded-lg ${isDesktop ? '' : 'bg-gray-100 dark:bg-atom-one-dark-light'}`}>
                  <DisclosureButton className='flex w-full items-center justify-between rounded-lg px-4 py-3 text-left font-medium transition-colors hover:bg-gray-100 focus:outline-none dark:hover:bg-gray-700'>
                    <h6 className='text-sm font-semibold'>設定オプション</h6>
                    <ChevronDownIcon
                      className={`h-5 w-5 transition-transform ${open ? 'rotate-180' : ''
                        }`}
                    />
                  </DisclosureButton>
                  <DisclosurePanel className='space-y-6 p-4'>
                    {/* Format Selection */}
                    <div>
                      <div className='mb-3'>
                        <span className='block text-sm font-semibold'>
                          出力ファイル形式
                        </span>
                      </div>
                      <div className='flex flex-wrap gap-2'>
                        {OUTPUT_SETS.map((outputSet) => (
                          <button
                            key={outputSet.id}
                            onClick={() => handleSetToggle(outputSet.id)}
                            className={`rounded-full px-4 py-2 text-sm font-medium transition-all focus:outline-none ${selectedSets.has(outputSet.id)
                              ? 'bg-sky-500 text-white hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-500'
                              : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
                              }`}
                          >
                            {outputSet.label}
                          </button>
                        ))}
                      </div>
                      <div className='mt-4 text-xs text-gray-600 dark:text-gray-400'>
                        {OUTPUT_SETS.map((set, i) => (
                          <div key={set.id}>
                            <strong>{set.label}:</strong> {set.description}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className='border-t border-gray-200 dark:border-gray-700' />

                    {/* Size Selection - Only show if favicon is selected */}
                    {selectedSets.has('favicon') && (
                      <>
                        <div>
                          <div className='mb-3'>
                            <span className='block text-sm font-semibold'>
                              favicon.icoに含めるサイズ
                            </span>
                          </div>

                          <div className='space-y-4'>
                            {/* 推奨サイズ */}
                            <div>
                              <div className='mb-2 text-xs font-medium text-gray-700 dark:text-gray-300'>
                                推奨サイズ
                              </div>
                              <div className='flex flex-wrap gap-2'>
                                {DEFAULT_SIZES.map((size) => (
                                  <button
                                    key={size}
                                    onClick={() => handleSizeToggle(size)}
                                    className={`rounded-full px-4 py-2 text-sm font-medium transition-all focus:outline-none ${selectedSizes.has(size)
                                      ? 'bg-sky-500 text-white hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-500'
                                      : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
                                      }`}
                                  >
                                    {size}×{size}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* 追加サイズ */}
                            <div>
                              <div className='mb-2 text-xs font-medium text-gray-600 dark:text-gray-400'>
                                その他サイズ
                              </div>
                              <div className='flex flex-wrap gap-2'>
                                {AVAILABLE_SIZES.filter(s => !DEFAULT_SIZES.includes(s)).map((size) => (
                                  <button
                                    key={size}
                                    onClick={() => handleSizeToggle(size)}
                                    className={`rounded-full px-4 py-2 text-sm font-medium transition-all focus:outline-none ${selectedSizes.has(size)
                                      ? 'bg-sky-500 text-white dark:bg-sky-600'
                                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                      }`}
                                  >
                                    {size}×{size}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className='border-t border-gray-200 dark:border-gray-700' />
                      </>
                    )}

                    {/* Border Radius */}
                    <div>
                      <div className='mb-3'>
                        <span className='block text-sm font-semibold'>
                          角丸の調整
                        </span>
                        <p className='mt-1 text-xs text-gray-600 dark:text-gray-400'>
                          アイコンの角を丸くします。Apple Touch IconはiOSが自動的に角丸にします。
                        </p>
                      </div>
                      <Slider
                        label=''
                        value={borderRadius}
                        min={0}
                        max={100}
                        unit='%'
                        onChange={setBorderRadius}
                        description=''
                      />
                    </div>

                    <div className='border-t border-gray-200 dark:border-gray-700' />

                    {/* Background Color */}
                    <div>
                      <div className='mb-3'>
                        <span className='block text-sm font-semibold'>
                          背景色の設定
                        </span>
                        <p className='mt-1 text-xs text-gray-600 dark:text-gray-400'>
                          透過PNGに背景色を追加します。Apple Touch Iconは常に背景色が適用されます。
                        </p>
                      </div>
                      <div className='space-y-3'>
                        <div className='flex items-center gap-2'>
                          <input
                            type='checkbox'
                            id='use-background-desktop'
                            checked={useBackground}
                            onChange={(e) => setUseBackground(e.target.checked)}
                            className='size-4 accent-sky-600 focus:outline-none'
                          />
                          <label htmlFor='use-background-desktop' className='text-sm font-medium'>
                            背景色を追加する
                          </label>
                        </div>
                        {useBackground && (
                          <div className='flex items-center gap-3'>
                            <input
                              type='color'
                              value={backgroundColor}
                              onChange={(e) => setBackgroundColor(e.target.value)}
                              className='h-10 w-20 cursor-pointer rounded bg-transparent focus:outline-none'
                            />
                            <input
                              type='text'
                              value={backgroundColor}
                              onChange={(e) => setBackgroundColor(e.target.value)}
                              placeholder='#ffffff'
                              className='flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none dark:border-gray-600 dark:bg-atom-one-dark-light'
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </DisclosurePanel>
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

      </div>
    </FullPageDropZone>
  )
}
