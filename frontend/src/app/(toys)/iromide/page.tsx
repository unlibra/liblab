'use client'

import { PhotoIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'

import { CorkBoardBackground } from '@/components/iromide/cork-board-background'
import { MaskingTape } from '@/components/iromide/masking-tape'
import { PolaroidFrame } from '@/components/iromide/polaroid-frame'
import { FullPageDropZone } from '@/components/ui/full-page-drop-zone'
import { Spinner } from '@/components/ui/spinner'
import { useToast } from '@/components/ui/toast'
import { siteConfig } from '@/config/site'
import { getToolById } from '@/config/tools'
import type { ExtractedColor } from '@/lib/api/colors'
import { extractColorsFromImage, } from '@/lib/api/colors'
import { validateImageFile } from '@/lib/file/file-validation'
import type { ChekiPadding } from '@/lib/image/cheki-size'
import { calculateChekiPadding, determineChekiSize } from '@/lib/image/cheki-size'
import { loadImageFromFile, processImageForCheki } from '@/lib/image/image-processing'

export default function ImagePalettePage () {
  const tool = getToolById('iromide')
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

      // Random rotation for result (-3 to 3)
      setResultRotation(Math.random() * 6 - 3)

      // Extract colors using backend API
      const colors = await extractColorsFromImage(file, colorCount)
      setExtractedColors(colors)
    } catch (err) {
      toast.error('色の抽出に失敗しました')
      console.error('Failed to extract colors:', err)
    } finally {
      setIsProcessing(false)
    }
  }, [toast, colorCount])

  // Share palette image using Web Share API
  const handleSharePalette = useCallback(async () => {
    if (!shareTargetRef.current) {
      toast.error('シェア用の画像が準備できていません')
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
        toast.error('画像の生成に失敗しました')
        console.error('domToBlob returned null')
        return
      }

      const file = new File([blob], 'palette.png', { type: 'image/png' })

      // Check if Web Share API with files is supported
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          const shareUrl = `${siteConfig.url ?? 'https://8px.app'}/${tool?.id ?? 'iromide'}`
          await navigator.share({
            files: [file],
            text: `${message || 'あなたの推しは、なに色？イロマイドでパレットを作成しましょう！'} - ${shareUrl}`
          })
        } catch (err) {
          // User cancelled or share failed
          if ((err as Error).name !== 'AbortError') {
            toast.error('シェアに失敗しました')
            console.error('Share failed:', err)
          }
        }
      } else {
        // Fallback: download the file
        toast.info('お使いのブラウザではシェア機能が使えません。画像をダウンロードしてください。')
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'palette.png'
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch (err) {
      toast.error('画像の生成に失敗しました')
      console.error('Image capture failed:', err)
    } finally {
      setIsSharing(false)
    }
  }, [toast, message, tool])

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
      accept='image/*'
    >
      <CorkBoardBackground className='left-1/2 -mb-12 -mt-6 w-screen -translate-x-1/2 border-b border-gray-200 px-4 py-12 dark:border-gray-700 sm:px-6 sm:py-20 lg:px-8'>
        <div className='mx-auto flex min-h-[calc(100vh-160px)] max-w-screen-md flex-col px-4'>
          {/* Header */}
          {!imagePreview && (
            <div className='mb-16 text-center'>
              <h1 className='text-3xl font-bold'>{tool?.name ?? 'iromide'}</h1>
              <p className='mt-2 whitespace-pre-line text-gray-500'>
                {tool?.description ?? ''}
              </p>
            </div>
          )}

          {/* Main Content */}
          {!imagePreview && !isProcessing
            ? (
              // Upload State with Samples
              <div className='flex flex-1 flex-col items-center justify-center gap-8'>
                {/* Sample Polaroids */}
                <div className='mb-12 min-h-72'>
                  <div className='flex justify-center gap-4 sm:gap-8'>
                    {Array.from(Array(3)).map((_, index) => (
                      <Image
                        key={index}
                        src={`/images/iromide/sample-cheki-${index + 1}.webp`}
                        alt={`Sample ${index + 1}`}
                        width={500}
                        height={600}
                        unoptimized
                        className='max-h-[60vh] w-auto max-w-[60vw]'
                        style={{ transform: `rotate(${index === 0 ? 2 : index === 1 ? -2 : 1}deg)` }}
                      />
                    ))}
                  </div>
                </div>

                {/* Upload Area */}
                <label className='group flex w-full max-w-lg cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white px-6 py-12 transition-colors hover:border-gray-400 dark:border-gray-600 dark:bg-atom-one-dark dark:hover:border-gray-500'>
                  <div className='mb-4 rounded-full bg-gray-100 p-4 transition-colors group-hover:bg-gray-200 dark:bg-atom-one-dark-light dark:group-hover:bg-atom-one-dark-lighter'>
                    <PhotoIcon className='size-8 text-gray-600 dark:text-gray-400' />
                  </div>
                  <span className='mb-2 font-semibold'>
                    あなたの画像で試す
                  </span>
                  <p className='text-center text-sm text-gray-500'>
                    推奨: 縦長 (3:4) / 正方形 (1:1) / 横長 (8:5)
                  </p>
                  <input
                    type='file'
                    accept='image/*'
                    onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
                    className='hidden'
                  />
                </label>

                {/* Privacy Notice */}
                <p className='text-center text-sm text-gray-500'>
                  ※ 画像は処理のみに使用され、保存されません
                </p>
              </div>
              )
            : isProcessing
              ? (
                // Processing State
                <div className='flex flex-1 flex-col items-center justify-center gap-4'>
                  <Spinner size={24} />
                  <p className='text-lg font-medium text-gray-600 dark:text-gray-400'>
                    解析中
                  </p>
                </div>
                )
              : (
                // Result State
                <div className='flex flex-col items-center gap-4'>
                  {/* Hidden Share Target - positioned off-screen */}
                  <div className='pointer-events-none fixed left-0 top-[-9999px]'>
                    <CorkBoardBackground className='p-10' ref={shareTargetRef}>
                      <div className='relative flex justify-center'>
                        {/* Decorative Masking Tape */}
                        <MaskingTape
                          className='absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2'
                          width={chekiPadding ? Math.round(chekiPadding.top * 2) : undefined}
                          height={chekiPadding ? Math.round(chekiPadding.top * 0.6) : undefined}
                        />

                        <PolaroidFrame
                          image={{
                            src: imagePreview!,
                            alt: 'Uploaded',
                            className: '' // Display cropped image at native size
                          }}
                          rotation={resultRotation}
                          chekiPadding={chekiPadding ?? undefined}
                        >
                          <div className='relative flex size-full flex-col items-center gap-2'>
                            <div className='absolute bottom-1/2 left-1/2 flex -translate-x-1/2 gap-2 '>
                              {extractedColors.map((color, index) => (
                                <div
                                  key={index}
                                  className='rounded-full shadow-sm'
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
                  <div className='relative mb-8'>
                    <MaskingTape
                      className='absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2'
                      width={thumbnailPadding ? Math.round(thumbnailPadding.top * 2) : undefined}
                      height={thumbnailPadding ? Math.round(thumbnailPadding.top * 0.6) : undefined}
                    />
                    <PolaroidFrame
                      image={{
                        src: imagePreview!,
                        alt: 'Uploaded',
                        className: 'max-w-[80vw] max-h-[50vh]',
                      }}
                      rotation={resultRotation}
                      chekiPadding={thumbnailPadding ?? undefined}
                    >
                      <div className='relative flex size-full flex-col items-center gap-2'>
                        <div className='absolute bottom-1/2 left-1/2 flex -translate-x-1/2 gap-2 '>
                          {extractedColors.map((color, index) => (
                            <div
                              key={index}
                              className='rounded-full shadow-sm'
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
                      placeholder='メッセージを追加'
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
                      {isSharing ? '発行中...' : 'シェアする'}
                    </button>
                    <button
                      onClick={handleReset}
                      className='w-40 rounded-lg bg-stone-200 py-3 font-medium text-gray-600 transition-colors hover:bg-stone-300 dark:bg-atom-one-dark-light dark:text-gray-400 dark:hover:bg-atom-one-dark-lighter'
                    >
                      別の画像で試す
                    </button>
                  </div>
                </div>
                )}
        </div>
      </CorkBoardBackground>
    </FullPageDropZone>
  )
}
