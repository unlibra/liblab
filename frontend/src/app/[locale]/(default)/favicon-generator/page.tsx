'use client'

import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { PhotoIcon, PlusIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import type { ChangeEvent } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { Breadcrumb } from '@/components/ui/breadcrumb'
import { CheckerboardPreview } from '@/components/ui/checkerboard-preview'
import { FullPageDropZone } from '@/components/ui/full-page-drop-zone'
import { useToast } from '@/components/ui/toast'
import type { FaviconSize } from '@/lib/generators/favicon'
import { generateOutputSet } from '@/lib/generators/favicon'
import { useTranslations } from '@/lib/i18n/client'
import { validateImageFile } from '@/lib/utils/file'
import { downloadBlob, getHeicSupport, loadImageFromFile, processImage } from '@/lib/utils/image'
import { createZip } from '@/lib/utils/zip'

import { FaviconOptionsPanel } from './_components/favicon-options-panel'
import type { OutputSetId } from './_lib/favicon-presets'
import { DEFAULT_OUTPUT_SETS, DEFAULT_SIZES, OUTPUT_SETS } from './_lib/favicon-presets'

const ACCEPTED_IMAGE_TYPES = 'image/png, image/jpeg, image/webp, image/svg+xml, image/gif, image/avif, image/tiff, image/bmp'
const HEIC_TYPES = 'image/heic, image/heif'

export default function FaviconGeneratorPage () {
  const t = useTranslations()
  const toast = useToast()
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedSets, setSelectedSets] = useState<Set<OutputSetId>>(
    new Set(DEFAULT_OUTPUT_SETS)
  )
  const [selectedSizes, setSelectedSizes] = useState<Set<FaviconSize>>(
    new Set(DEFAULT_SIZES)
  )
  const [borderRadius, setBorderRadius] = useState(0)
  const [backgroundColor, setBackgroundColor] = useState('#888888')
  const [useBackground, setUseBackground] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isHeicSupport, setIsHeicSupport] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Detect HEIC/HEIF support
  useEffect(() => {
    setIsHeicSupport(getHeicSupport())
  }, [])

  const validateImageFileWrapper = useCallback(async (file: File): Promise<string | null> => {
    return validateImageFile(file, {
      maxSize: 10 * 1024 * 1024, // 10MB
      maxDimensions: { width: 4096, height: 4096 }
    })
  }, [])

  const handleFileSelect = useCallback(async (file: File) => {
    // Validate file (including magic number check)
    const validationError = await validateImageFileWrapper(file)
    if (validationError) {
      toast.error(validationError)
      return
    }

    // Load image
    try {
      const loadedImage = await loadImageFromFile(file)
      setImage(loadedImage)
    } catch (err) {
      toast.error(t('faviconGenerator.errors.imageLoadFailed'))
      console.error(err)
    }
  }, [validateImageFileWrapper, toast, t])

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }, [handleFileSelect])

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
        const blob = await processImage(image, previewSize, undefined, {
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

  const handleFileButtonClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleSetToggle = useCallback((setId: OutputSetId) => {
    setSelectedSets((prev) => {
      const newSets = new Set(prev)
      if (newSets.has(setId)) {
        newSets.delete(setId)
      } else {
        newSets.add(setId)
      }
      return newSets
    })
  }, [])

  const handleSizeToggle = useCallback((size: FaviconSize) => {
    setSelectedSizes((prev) => {
      const newSizes = new Set(prev)
      if (newSizes.has(size)) {
        newSizes.delete(size)
      } else {
        newSizes.add(size)
      }
      return newSizes
    })
  }, [])

  const handleGenerate = useCallback(async () => {
    if (!image) {
      toast.error(t('faviconGenerator.errors.selectImage'))
      return
    }

    if (selectedSets.size === 0) {
      toast.error(t('faviconGenerator.errors.selectOutputFormat'))
      return
    }

    if (selectedSets.has('favicon') && selectedSizes.size === 0) {
      toast.error(t('faviconGenerator.errors.selectSize'))
      return
    }

    setIsGenerating(true)

    try {
      const sizes = Array.from(selectedSizes).sort((a, b) => a - b)
      const effectiveBackgroundColor = useBackground ? backgroundColor : undefined

      // Generate files for all selected output sets
      const allFiles: Array<{ name: string, blob: Blob }> = []

      for (const setId of selectedSets) {
        const outputSet = OUTPUT_SETS.find(s => s.id === setId)
        if (!outputSet) continue

        const files = await generateOutputSet(image, outputSet.files, {
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
      toast.error(t('faviconGenerator.errors.generateFailed'))
      console.error(err)
    } finally {
      setIsGenerating(false)
    }
  }, [image, selectedSets, selectedSizes, borderRadius, backgroundColor, useBackground, toast, t])

  return (
    <FullPageDropZone
      onFileDrop={handleFileSelect}
      accept={isHeicSupport ? `${ACCEPTED_IMAGE_TYPES}, ${HEIC_TYPES}` : ACCEPTED_IMAGE_TYPES}
    >
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: t('common.home'), href: '/' },
          { label: t('tools.favicon-generator.name') }
        ]}
      />

      <div className='mx-auto max-w-screen-lg'>
        <div className='mb-8 space-y-4'>
          <h1 className='text-2xl font-semibold'>{t('tools.favicon-generator.name')}</h1>
          <p className='whitespace-pre-line text-gray-600 dark:text-gray-400'>
            {t('tools.favicon-generator.description')}
          </p>
        </div>

        {/* Main Content Layout */}
        <div className='mb-8 flex flex-col gap-12 lg:flex-row'>
          {/* Left Column */}
          <div className='flex-1 space-y-8'>
            {/* File Upload */}
            <div className='space-y-2'>
              <h6 className='block text-sm font-semibold'>
                {t('common.selectImage')}
              </h6>
              <input
                ref={fileInputRef}
                type='file'
                accept={isHeicSupport ? `${ACCEPTED_IMAGE_TYPES}, ${HEIC_TYPES}` : ACCEPTED_IMAGE_TYPES}
                onChange={handleInputChange}
                className='hidden'
              />
              <button
                onClick={handleFileButtonClick}
                className='flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white outline-none transition-colors hover:bg-sky-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500  dark:bg-sky-600 dark:hover:bg-sky-500 '
              >
                <PlusIcon className='size-5 stroke-2' />
                {t('common.selectImage')}
              </button>
              <p className='text-xs text-gray-600 dark:text-gray-400'>
                {t('faviconGenerator.uploadHint')}
                <br />
                {t('common.dragDropAnywhere')}
              </p>
              {/* Privacy Notice */}
              <div className='flex items-center gap-3 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 dark:border-sky-950 dark:bg-sky-950'>
                <ShieldCheckIcon className='size-5 shrink-0' />
                <div className='text-sm'>
                  {t('common.privacyNotice')}
                </div>
              </div>
            </div>

            {/* Settings Panel (Mobile Only) */}
            <Disclosure defaultOpen={false} as='div' className='lg:hidden'>
              {({ open }) => (
                <div className='overflow-hidden rounded-lg bg-gray-100 dark:bg-atom-one-dark-light'>
                  <DisclosureButton className='flex w-full items-center justify-between rounded-lg px-4 py-3 text-left font-medium outline-none transition-colors hover:bg-gray-100 dark:hover:bg-gray-700'>
                    <h6 className='text-sm font-semibold'>{t('faviconGenerator.outputOptions')}</h6>
                    <ChevronDownIcon
                      className={`h-5 w-5 transition-transform ${open ? 'rotate-180' : ''
                        }`}
                    />
                  </DisclosureButton>
                  <DisclosurePanel className='p-4'>
                    <FaviconOptionsPanel
                      selectedSets={selectedSets}
                      selectedSizes={selectedSizes}
                      borderRadius={borderRadius}
                      backgroundColor={backgroundColor}
                      useBackground={useBackground}
                      onSetToggle={handleSetToggle}
                      onSizeToggle={handleSizeToggle}
                      onBorderRadiusChange={setBorderRadius}
                      onBackgroundColorChange={setBackgroundColor}
                      onUseBackgroundChange={setUseBackground}
                      checkboxIdSuffix='-mobile'
                    />
                  </DisclosurePanel>
                </div>
              )}
            </Disclosure>

            {/* Preview */}
            <div className='flex flex-col'>
              <h6 className='mb-2 block text-sm font-semibold'>
                {t('common.preview')}
              </h6>
              <CheckerboardPreview
                emptyState={
                  <div className='text-center text-sm text-gray-600 dark:text-gray-400'>
                    <PhotoIcon className='mx-auto mb-2 h-12 w-12' />
                    <p>{t('faviconGenerator.previewPlaceholder.line1')}</p>
                    <p>{t('faviconGenerator.previewPlaceholder.line2')}</p>
                  </div>
                }
              >
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt='プレビュー'
                  />
                )}
              </CheckerboardPreview>
            </div>

            {/* Download Button */}
            <div className='flex justify-center'>
              <button
                onClick={handleGenerate}
                disabled={!image || selectedSets.size === 0 || isGenerating}
                className='rounded-full bg-amber-500 px-8 py-3 font-medium text-white outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 enabled:hover:bg-amber-600 disabled:bg-gray-300 disabled:text-gray-500 dark:bg-amber-600 enabled:dark:hover:bg-amber-500 disabled:dark:bg-atom-one-dark-light'
              >
                {t('common.download')}
              </button>
            </div>
          </div>

          {/* Right Column - Settings Panel (Desktop Only) */}
          <div className='hidden lg:block lg:flex-1'>
            <h6 className='mb-4 text-sm font-semibold'>{t('faviconGenerator.outputOptions')}</h6>
            <FaviconOptionsPanel
              selectedSets={selectedSets}
              selectedSizes={selectedSizes}
              borderRadius={borderRadius}
              backgroundColor={backgroundColor}
              useBackground={useBackground}
              onSetToggle={handleSetToggle}
              onSizeToggle={handleSizeToggle}
              onBorderRadiusChange={setBorderRadius}
              onBackgroundColorChange={setBackgroundColor}
              onUseBackgroundChange={setUseBackground}
              checkboxIdSuffix='-desktop'
            />
          </div>
        </div>

      </div>
    </FullPageDropZone>
  )
}
