'use client'

import { PhotoIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'

import sampleCheki1 from '@/assets/images/iromide/sample-cheki-1.webp'
import sampleCheki2 from '@/assets/images/iromide/sample-cheki-2.webp'
import sampleCheki3 from '@/assets/images/iromide/sample-cheki-3.webp'
import { FullPageDropZone } from '@/components/ui/full-page-drop-zone'
import { Spinner } from '@/components/ui/spinner'
import { useToast } from '@/components/ui/toast'
import { siteConfig } from '@/config/site'
import type { ExtractedColor } from '@/lib/api/colors'
import { extractColorsFromImage, NetworkError } from '@/lib/api/colors'
import { useTranslations } from '@/lib/i18n/client'
import type { ChekiPadding, ChekiSize } from '@/lib/utils/cheki'
import { calculateChekiPadding, determineChekiSize } from '@/lib/utils/cheki'
import { validateImageFile } from '@/lib/utils/file'
import { getHeicSupport, loadImageFromFile, processImageForCheki } from '@/lib/utils/image'

import { CorkBoardBackground } from './_components/cork-board-background'
import { MaskingTape } from './_components/masking-tape'
import { PolaroidFrame } from './_components/polaroid-frame'

const sampleChekiImages = [sampleCheki1, sampleCheki2, sampleCheki3]

const ACCEPTED_IMAGE_TYPES = 'image/png, image/jpeg, image/webp, image/gif, image/avif, image/tiff, image/bmp'
const HEIC_TYPES = 'image/heic, image/heif'

export default function IromidePage () {
  const t = useTranslations()
  const toast = useToast()
  const shareTargetRef = useRef<HTMLDivElement>(null)

  // State
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [chekiPadding, setChekiPadding] = useState<ChekiPadding | null>(null)
  const [thumbnailPadding, setThumbnailPadding] = useState<ChekiPadding | null>(null)
  const [extractedColors, setExtractedColors] = useState<ExtractedColor[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [resultRotation, setResultRotation] = useState(0)
  const [message, setMessage] = useState('')
  const [isSharing, setIsSharing] = useState(false)
  const [isHeicSupport, setIsHeicSupport] = useState(false)
  const [loadedSamples, setLoadedSamples] = useState<Set<number>>(new Set())
  const [isPolaroidLoaded, setIsPolaroidLoaded] = useState(false)
  const [chekiSize, setChekiSize] = useState<ChekiSize | null>(null)
  const [thumbnailSize, setThumbnailSize] = useState<ChekiSize | null>(null)

  // Detect HEIC/HEIF support
  useEffect(() => {
    setIsHeicSupport(getHeicSupport())
  }, [])

  // Fixed color count for simplicity
  const colorCount = 6

  // Cleanup blob URLs on unmount or when preview changes
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  // Handle file drop/select and auto-extract
  const handleFileSelect = useCallback(async (file: File | null) => {
    if (!file) return

    // Validate file
    const error = await validateImageFile(file, {
      maxSize: 10 * 1024 * 1024,
      maxDimensions: { width: 4096, height: 4096 }
    })

    if (error) {
      toast.error(error)
      return
    }

    setExtractedColors([])
    setIsProcessing(true)

    try {
      // Load image
      const image = await loadImageFromFile(file)

      // Determine cheki size based on image aspect ratio
      const chekiSize = determineChekiSize(image.width, image.height)

      // Normalize image to cheki size (object-fit: cover)
      const normalizedBlob = await processImageForCheki(
        image,
        chekiSize.width,
        chekiSize.height
      )

      const previewUrl = URL.createObjectURL(normalizedBlob)
      setImagePreview(previewUrl)

      // Calculate padding based on cheki format
      const padding = calculateChekiPadding(chekiSize.width, chekiSize.height, chekiSize.aspectRatio)
      setChekiPadding(padding)

      // Calculate thumbnail padding for display
      const maxDisplayWidth = document.body.clientWidth * 0.8
      const maxDisplayHeight = window.innerHeight * 0.5

      let thumbWidth = chekiSize.width
      let thumbHeight = chekiSize.height

      // Scale down to fit width constraint
      if (thumbWidth > maxDisplayWidth) {
        thumbWidth = maxDisplayWidth
        thumbHeight = Math.round(thumbWidth * (chekiSize.height / chekiSize.width))
      }

      // Scale down to fit height constraint (after width adjustment)
      if (thumbHeight > maxDisplayHeight) {
        thumbHeight = maxDisplayHeight
        thumbWidth = Math.round(thumbHeight * (chekiSize.width / chekiSize.height))
      }

      const thumbPadding = calculateChekiPadding(thumbWidth, thumbHeight, chekiSize.aspectRatio)
      setThumbnailPadding(thumbPadding)

      setChekiSize(chekiSize)
      setThumbnailSize({ width: thumbWidth, height: thumbHeight, aspectRatio: chekiSize.aspectRatio })

      // Random rotation for result (-3 to 3)
      setResultRotation(Math.random() * 4 - 2)

      // Extract colors using backend API
      const colors = await extractColorsFromImage(file, colorCount)
      setExtractedColors(colors)
    } catch (err) {
      // Handle different types of errors
      let errorMessage: string
      if (err instanceof NetworkError) {
        // Network errors (Cloudflare block, API server down, etc.)
        errorMessage = t('common.networkError')
      } else if (err instanceof Error) {
        // API errors with specific messages
        errorMessage = err.message
      } else {
        // Unknown errors
        errorMessage = t('iromide.errors.colorExtractionFailed')
      }
      toast.error(errorMessage)
      console.error('Failed to extract colors:', err)
    } finally {
      setIsProcessing(false)
    }
  }, [toast, colorCount, t])

  // Share palette image using Web Share API
  const handleSharePalette = useCallback(async () => {
    if (!shareTargetRef.current) {
      toast.error(t('iromide.errors.shareTargetNotReady'))
      console.error('Share target ref is null')
      return
    }

    setIsSharing(true)
    try {
      // Wait for images to load
      const images = shareTargetRef.current.querySelectorAll('img')
      await Promise.all(
        Array.from(images).map(
          img =>
            new Promise((resolve, reject) => {
              if (img.complete) {
                resolve(null)
              } else {
                img.onload = () => resolve(null)
                img.onerror = reject
              }
            })
        )
      )

      // Lazy-load modern-screenshot only when sharing (~50KB)
      const { domToBlob } = await import('modern-screenshot')

      // Capture the element
      const blob = await domToBlob(shareTargetRef.current, {})

      if (!blob) {
        toast.error(t('iromide.errors.imageGenerationFailed'))
        console.error('domToBlob returned null')
        return
      }

      const file = new File([blob], 'iromide.png', { type: 'image/png' })

      // Check if Web Share API with files is supported
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          const shareUrl = `${siteConfig.url ?? 'https://8px.app'}/iromide`
          await navigator.share({
            files: [file],
            text: `${message || t('iromide.shareText')} - ${shareUrl}`
          })
        } catch (err) {
          // User cancelled or share failed
          if ((err as Error).name !== 'AbortError') {
            toast.error(t('iromide.errors.shareFailed'))
            console.error('Share failed:', err)
          }
        }
      } else {
        // Fallback: download the file
        toast.info(t('iromide.errors.shareNotSupported'))
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'iromide.png'
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch (err) {
      toast.error(t('iromide.errors.imageGenerationFailed'))
      console.error('Image capture failed:', err)
    } finally {
      setIsSharing(false)
    }
  }, [toast, message, t])

  // Reset
  const handleReset = useCallback(() => {
    setImagePreview(null)
    setChekiPadding(null)
    setExtractedColors([])
    setMessage('')
    window.scrollTo({ top: 0 })
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [isProcessing])

  return (
    <FullPageDropZone
      onFileDrop={handleFileSelect}
      accept={isHeicSupport ? `${ACCEPTED_IMAGE_TYPES}, ${HEIC_TYPES}` : ACCEPTED_IMAGE_TYPES}
    >
      <div className='fixed bottom-0 left-0 right-0 top-0 -z-50 h-screen'>
        <CorkBoardBackground className='h-full' />
      </div>
      <div className='absolute -top-16 left-1/2 -z-10 -mt-8 h-16 w-screen -translate-x-1/2 bg-white dark:bg-atom-one-dark' />
      <div className='mx-auto flex min-h-[calc(100vh-160px)] max-w-screen-md flex-col px-6 py-12 sm:px-8 sm:py-20 lg:px-12'>
        {/* Header */}
        <div className='mb-16 text-center'>
          <h1 className='text-3xl font-bold'>{t('tools.iromide.name')}</h1>
          {!imagePreview && (
            <p className='mt-2 whitespace-pre-line text-gray-500'>
              {t('tools.iromide.description')}
            </p>
          )}
        </div>

        {/* Main Content */}
        {!imagePreview && !isProcessing
          ? (
            // Upload State with Samples
            <div className='flex flex-1 flex-col items-center justify-center gap-8'>
              {/* Sample Polaroids */}
              <div className='mb-12 min-h-72'>
                <div className='flex justify-center gap-4 sm:gap-8'>
                  {sampleChekiImages.map((src, index) => (
                    <Image
                      key={index}
                      src={src}
                      alt={`Sample ${index + 1}`}
                      width={500}
                      height={600}
                      sizes='(max-width: 833px) 60vw, 500px'
                      onLoad={() => {
                        setLoadedSamples(prev => new Set(prev).add(index))
                      }}
                      className={`h-[calc(min(60vh,60vw*6/5))] max-h-[60vh] w-auto max-w-[60vw] transition-opacity drag-none ${loadedSamples.has(index) ? 'opacity-100' : 'opacity-0'}`}
                      style={{ transform: `rotate(${index === 0 ? 2 : index === 1 ? -2 : 1}deg)` }}
                    />
                  ))}
                </div>
              </div>

              {/* Upload Area */}
              <div className='flex w-full max-w-lg flex-col items-center justify-center gap-6 rounded-2xl border-2 border-dashed border-gray-300 bg-white px-6 py-12 dark:border-gray-600 dark:bg-atom-one-dark'>
                <PhotoIcon className='size-10 text-gray-500' />
                <span className='font-semibold'>
                  {t('iromide.tryWithYourImage')}
                </span>
                <label>
                  <input
                    type='file'
                    accept={isHeicSupport ? `${ACCEPTED_IMAGE_TYPES}, ${HEIC_TYPES}` : ACCEPTED_IMAGE_TYPES}
                    onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
                    className='hidden'
                  />
                  <span className='inline-block cursor-pointer rounded-full bg-sky-500 px-8 py-3 font-medium text-white transition-colors hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-500'>
                    {t('common.selectImage')}
                  </span>
                </label>
              </div>

              <div className='space-y-2'>
                <p className='text-center text-sm text-gray-600 dark:text-gray-400'>
                  {t('iromide.recommendedAspectRatio')}
                </p>
                {/* Privacy Notice */}
                <p className='text-center text-sm text-gray-600 dark:text-gray-400'>
                  {t('common.imageProcessingOnlyNotice')}
                </p>
              </div>
            </div>
            )
          : isProcessing
            ? (
              // Processing State
              <div className='flex flex-1 flex-col items-center justify-center gap-4'>
                <Spinner size={24} />
                <p className='text-lg font-medium text-gray-600 dark:text-gray-400'>
                  {t('common.analyzing')}
                </p>
              </div>
              )
            : (
              // Result State
              <div className='flex flex-col items-center gap-4'>
                {/* Hidden Share Target - positioned off-screen */}
                <div className='pointer-events-none fixed -top-[9999px]'>
                  <CorkBoardBackground className='size-fit p-16' ref={shareTargetRef}>
                    <div className='relative flex justify-center'>
                      {/* Decorative Masking Tape */}
                      <MaskingTape
                        className='absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2'
                        width={Math.round((chekiPadding?.top ?? 0) * (chekiSize?.aspectRatio === 'landscape' ? 3.2 : 2.4))}
                        height={Math.round((chekiPadding?.top ?? 0) * 0.8)}
                      />

                      <PolaroidFrame
                        image={{
                          src: imagePreview!,
                          alt: 'Uploaded',
                          className: 'w-auto max-w-none' // Display cropped image at native size
                        }}
                        rotation={resultRotation}
                        chekiPadding={chekiPadding ?? undefined}
                      >
                        <div className='relative flex size-full flex-col items-center gap-2'>
                          <div className='absolute bottom-1/2 left-1/2 flex -translate-x-1/2 gap-2 '>
                            {extractedColors.map((color, index) => (
                              <div
                                key={index}
                                className='rounded-full'
                                style={{
                                  backgroundColor: color.hex,
                                  width: chekiPadding ? `${Math.round(chekiPadding.bottom * 0.3)}px` : '32px',
                                  height: chekiPadding ? `${Math.round(chekiPadding.bottom * 0.3)}px` : '32px'
                                }}
                              />
                            ))}
                          </div>
                          {message && (
                            <div className='absolute left-1/2 top-1/2 w-full -translate-x-1/2 p-1'>
                              <p
                                className='line-clamp-1 text-center font-medium text-gray-700 antialiased' style={{
                                  fontSize: chekiPadding ? `${Math.round(chekiPadding.bottom * 0.25)}px` : '24px'
                                }}
                              >
                                {message}
                              </p>
                            </div>
                          )}
                        </div>
                      </PolaroidFrame>
                    </div>
                  </CorkBoardBackground>
                </div>

                {/* Visible Display Polaroid */}
                <div className={`relative mb-8 transition-opacity ${isPolaroidLoaded ? 'opacity-100' : 'opacity-0'}`}>
                  <MaskingTape
                    className='absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2'
                    width={Math.round((thumbnailPadding?.top ?? 0) * (thumbnailSize?.aspectRatio === 'landscape' ? 3.2 : 2.4))}
                    height={Math.round((thumbnailPadding?.top ?? 0) * 0.8)}
                  />
                  <PolaroidFrame
                    image={{
                      src: imagePreview!,
                      alt: 'Uploaded',
                      onLoad: () => setIsPolaroidLoaded(true),
                      className: 'max-w-[80vw] max-h-[50vh]'
                    }}
                    rotation={resultRotation}
                    chekiPadding={thumbnailPadding ?? undefined}
                  >
                    <div className='relative flex size-full flex-col items-center gap-2'>
                      <div className='absolute bottom-1/2 left-1/2 flex -translate-x-1/2 gap-2 '>
                        {extractedColors.map((color, index) => (
                          <div
                            key={index}
                            className='rounded-full'
                            style={{
                              backgroundColor: color.hex,
                              width: thumbnailPadding ? `${Math.round(thumbnailPadding.bottom * 0.3)}px` : '32px',
                              height: thumbnailPadding ? `${Math.round(thumbnailPadding.bottom * 0.3)}px` : '32px'
                            }}
                          />
                        ))}
                      </div>
                      {message && (
                        <div className='absolute left-1/2 top-1/2 w-full -translate-x-1/2 p-1'>
                          <p
                            className='line-clamp-1 text-center font-medium text-gray-700 antialiased' style={{
                              fontSize: thumbnailPadding ? `${Math.round(thumbnailPadding.bottom * 0.25)}px` : '24px'
                            }}
                          >
                            {message}
                          </p>
                        </div>
                      )}
                    </div>
                  </PolaroidFrame>
                </div>

                {/* Message Input */}
                <div className='mb-6 w-full max-w-md'>
                  <input
                    type='text'
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t('iromide.addMessage')}
                    className='w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-center outline-none transition-colors focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-gray-600 dark:bg-atom-one-dark-light'
                  />
                </div>

                {/* Actions */}
                <div className='flex flex-col items-center gap-8'>
                  <button
                    onClick={handleSharePalette}
                    disabled={isSharing}
                    className='flex w-40 items-center justify-center gap-2 rounded-full bg-sky-500 py-3 font-medium text-white transition-colors hover:bg-sky-600 disabled:opacity-50'
                  >
                    {isSharing && <Spinner className='size-5' />}
                    {isSharing ? t('iromide.sharing') : t('iromide.share')}
                  </button>
                  <button
                    onClick={handleReset}
                    className='w-40 rounded-lg bg-stone-200 py-3 font-medium text-gray-600 transition-colors hover:bg-stone-300 dark:bg-atom-one-dark-light dark:text-gray-400 dark:hover:bg-atom-one-dark-lighter'
                  >
                    {t('iromide.tryAnotherImage')}
                  </button>
                </div>
              </div>
              )}
      </div>
    </FullPageDropZone>
  )
}
