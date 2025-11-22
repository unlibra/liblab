'use client'

import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { PhotoIcon, PlusIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import type { ChangeEvent } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { CheckerboardPreview } from '@/components/checkerboard-preview'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { FullPageDropZone } from '@/components/ui/full-page-drop-zone'
import { useToast } from '@/components/ui/toast'
import { getToolById } from '@/config/tools'
import type { PresetId, SvgoOptions } from '@/lib/image/svgo-optimizer'
import { DEFAULT_SVGO_OPTIONS, optimizeSvg, PRESETS } from '@/lib/image/svgo-optimizer'

import { SvgOptionsPanel } from './svg-options-panel'

export default function SvgOptimizerPage () {
  const tool = getToolById('svg-optimizer')
  const toast = useToast()
  const [originalSvg, setOriginalSvg] = useState<string | null>(null)
  const [previewOptimizedSvg, setPreviewOptimizedSvg] = useState<string | null>(null)
  const [originalSize, setOriginalSize] = useState<number>(0)
  const [previewOptimizedSize, setPreviewOptimizedSize] = useState<number>(0)
  const [fileName, setFileName] = useState<string>('')
  const [options, setOptions] = useState<SvgoOptions>(DEFAULT_SVGO_OPTIONS)
  const [selectedPreset, setSelectedPreset] = useState<PresetId | null>('safe')
  const [isDownloading, setIsDownloading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback(async (file: File) => {
    // Validate file type
    if (!file.type.includes('svg')) {
      toast.error('SVGファイルのみアップロードできます')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('ファイルサイズが大きすぎます（最大10MB）')
      return
    }

    try {
      const text = await file.text()
      setOriginalSvg(text)
      setOriginalSize(file.size)
      setFileName(file.name)
    } catch (err) {
      toast.error('SVGファイルの読み込みに失敗しました')
      console.error(err)
    }
  }, [toast])

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }, [handleFileSelect])

  const handleFileButtonClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handlePresetChange = useCallback((presetId: PresetId) => {
    const preset = PRESETS.find(p => p.id === presetId)
    if (preset) {
      setOptions(preset.options)
      setSelectedPreset(presetId)
    }
  }, [])

  const handleOptionsChange = useCallback((newOptions: SvgoOptions) => {
    setOptions(newOptions)
    // Clear preset selection when manually changing options
    setSelectedPreset(null)
  }, [])

  // Auto-optimize in background for preview when file or options change
  useEffect(() => {
    if (!originalSvg) {
      setPreviewOptimizedSvg(null)
      setPreviewOptimizedSize(0)
      return
    }

    try {
      const optimized = optimizeSvg(originalSvg, options)
      setPreviewOptimizedSvg(optimized)
      setPreviewOptimizedSize(new Blob([optimized]).size)
    } catch (err) {
      console.error('Preview optimization failed:', err)
      setPreviewOptimizedSvg(null)
      setPreviewOptimizedSize(0)
    }
  }, [originalSvg, options])

  const handleDownload = useCallback(async () => {
    if (!originalSvg) {
      toast.error('SVGファイルを選択してください')
      return
    }

    setIsDownloading(true)

    try {
      const optimized = optimizeSvg(originalSvg, options)
      const blob = new Blob([optimized], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName.replace(/\.svg$/i, '') + '-optimized.svg'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      toast.error('SVGの最適化に失敗しました')
      console.error(err)
    } finally {
      setIsDownloading(false)
    }
  }, [originalSvg, options, fileName, toast])

  const compressionRatio = originalSize && previewOptimizedSize
    ? ((1 - previewOptimizedSize / originalSize) * 100).toFixed(1)
    : '0'

  return (
    <FullPageDropZone
      onFileDrop={handleFileSelect}
      accept='image/svg+xml'
    >
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: tool?.name ?? 'SVG圧縮ツール' }
        ]}
      />

      <div className='mx-auto max-w-screen-lg'>
        <div className='mb-8 space-y-4'>
          <h1 className='text-2xl font-semibold'>{tool?.name ?? 'SVG圧縮ツール'}</h1>
          <p className='break-keep text-gray-600 dark:text-gray-400'>
            {tool?.description ?? ''}
          </p>
        </div>

        {/* Main Content Layout */}
        <div className='mb-8 flex flex-col gap-12 lg:flex-row'>
          {/* Left Column */}
          <div className='flex-1 space-y-8'>
            {/* File Upload */}
            <div className='space-y-2'>
              <h6 className='block text-sm font-semibold'>
                ファイルを選択
              </h6>
              <input
                ref={fileInputRef}
                type='file'
                accept='image/svg+xml,.svg'
                onChange={handleInputChange}
                className='hidden'
              />
              <button
                onClick={handleFileButtonClick}
                className='flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white outline-none transition-colors hover:bg-sky-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 dark:bg-sky-600 dark:hover:bg-sky-500'
              >
                <PlusIcon className='size-5 stroke-2' />
                ファイルを選択
              </button>
              <p className='text-xs text-gray-600 dark:text-gray-400'>
                SVGファイルをアップロードできます（最大10MB）
                <br />
                または画面のどこにでもドラッグ&ドロップ
              </p>
              {/* Privacy Notice */}
              <div className='flex items-center gap-3 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sky-900 dark:border-sky-950 dark:bg-sky-950 dark:text-gray-300'>
                <ShieldCheckIcon className='size-5 shrink-0' />
                <div className='text-sm'>
                  画像はサーバーに送信されず、ブラウザで安全に実行されます。
                </div>
              </div>
            </div>

            {/* Options Panel (Mobile Only) */}
            <Disclosure defaultOpen={false} as='div' className='lg:hidden'>
              {({ open }) => (
                <div className='overflow-hidden rounded-lg bg-gray-100 dark:bg-atom-one-dark-light'>
                  <DisclosureButton className='flex w-full items-center justify-between rounded-lg px-4 py-3 text-left font-medium outline-none transition-colors hover:bg-gray-200 dark:hover:bg-gray-700'>
                    <h6 className='text-sm font-semibold'>圧縮オプション</h6>
                    <ChevronDownIcon
                      className={`h-5 w-5 transition-transform ${open ? 'rotate-180' : ''
                        }`}
                    />
                  </DisclosureButton>
                  <DisclosurePanel className='p-4'>
                    <SvgOptionsPanel
                      options={options}
                      onOptionsChange={handleOptionsChange}
                      selectedPreset={selectedPreset}
                      onPresetChange={handlePresetChange}
                    />
                  </DisclosurePanel>
                </div>
              )}
            </Disclosure>

            {/* Preview */}
            <div className='flex flex-col'>
              <h6 className='mb-2 block text-sm font-semibold'>
                プレビュー
              </h6>
              <div className='space-y-4'>
                <CheckerboardPreview
                  emptyState={
                    <div className='text-center text-sm text-gray-600 dark:text-gray-400'>
                      <PhotoIcon className='mx-auto mb-2 h-12 w-12' />
                      <p>SVGファイルを選択すると</p>
                      <p>プレビューが表示されます</p>
                    </div>
                  }
                >
                  {previewOptimizedSvg && (
                    <div
                      className='flex size-full items-center justify-center [&>svg]:h-auto [&>svg]:max-h-full [&>svg]:w-auto [&>svg]:max-w-full'
                      dangerouslySetInnerHTML={{ __html: previewOptimizedSvg }}
                    />
                  )}
                </CheckerboardPreview>

                {/* File Size Info */}
                {previewOptimizedSvg && (
                  <div className='space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm dark:border-gray-700 dark:bg-atom-one-dark-light'>
                    <div className='flex justify-between'>
                      <span className='text-gray-600 dark:text-gray-400'>圧縮前:</span>
                      <span className='font-medium'>{(originalSize / 1024).toFixed(2)} KB</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-gray-600 dark:text-gray-400'>圧縮後:</span>
                      <span className='font-medium'>{(previewOptimizedSize / 1024).toFixed(2)} KB</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-gray-600 dark:text-gray-400'>削減:</span>
                      <span className='font-medium text-green-600 dark:text-green-400'>
                        {compressionRatio}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Download Button */}
            <div className='flex justify-center'>
              <button
                onClick={handleDownload}
                disabled={!originalSvg || isDownloading}
                className='rounded-full bg-amber-500 px-8 py-3 font-medium text-white outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 enabled:hover:bg-amber-600 disabled:bg-gray-300 disabled:text-gray-500 dark:bg-amber-600 enabled:dark:hover:bg-amber-500 disabled:dark:bg-atom-one-dark-light'
              >
                ダウンロード
              </button>
            </div>
          </div>

          {/* Right Column - Options Panel (Desktop Only) */}
          <div className='hidden lg:block lg:flex-1'>
            <h6 className='mb-4 text-sm font-semibold'>圧縮オプション</h6>
            <SvgOptionsPanel
              options={options}
              onOptionsChange={handleOptionsChange}
              selectedPreset={selectedPreset}
              onPresetChange={handlePresetChange}
            />
          </div>
        </div>
      </div>
    </FullPageDropZone>
  )
}
