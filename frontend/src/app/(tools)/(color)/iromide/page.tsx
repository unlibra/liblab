'use client'

import { PhotoIcon } from '@heroicons/react/24/outline'
import { domToBlob } from 'modern-screenshot'
import { useCallback, useEffect, useRef, useState } from 'react'

import { CorkBoardBackground } from '@/components/ui/cork-board-background'
import { FullPageDropZone } from '@/components/ui/full-page-drop-zone'
import { MaskingTape } from '@/components/ui/masking-tape'
import { PolaroidFrame } from '@/components/ui/polaroid-frame'
import { Spinner } from '@/components/ui/spinner'
import { useToast } from '@/components/ui/toast'
import { siteConfig } from '@/config/site'
import { getToolById } from '@/config/tools'
import { useColorHistory } from '@/contexts/color-history-context'
import type { ExtractedColor } from '@/lib/api/colors'
import { extractColorsFromImage, } from '@/lib/api/colors'
import { generateWaffleChartBlob } from '@/lib/color/waffle-chart'
import { validateImageFile } from '@/lib/file/file-validation'
import { loadImageFromFile, processImage } from '@/lib/image/image-processing'

// Sample data for showcase
const sampleImages = [
  {
    src: '/images/iromide/sample-1.jpg',
    colors: ['#FABE28', '#9B122B', '#2A1E17', '#DF4156', '#AB8828', '#F08E93']
  },
  {
    src: '/images/iromide/sample-2.jpg',
    colors: ['#DCE5EE', '#878464', '#2C160D', '#544B34']
  },
  {
    src: '/images/iromide/sample-3.jpg',
    colors: ['#DED0C3', '#4C4735', '#6D7E38', '#111211', '#A72A26']
  }
]

// Shared Color Palette component
function ColorPalette ({
  colors,
  onColorClick
}: {
  colors: ExtractedColor[]
  onColorClick?: (hex: string) => void
}) {
  return (
    <div className='mb-6'>
      <div className='flex flex-wrap justify-center gap-4'>
        {colors.map((color, index) => {
          const circle = (
            <div
              className='size-8 rounded-full shadow-lg ring-4 ring-white dark:ring-gray-800 sm:size-16'
              style={{ backgroundColor: color.hex }}
            />
          )

          if (onColorClick) {
            return (
              <button
                key={index}
                onClick={() => onColorClick(color.hex)}
                className='transition-transform hover:scale-110 active:scale-95'
              >
                {circle}
              </button>
            )
          }

          return (
            <div key={index}>
              {circle}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function ImagePalettePage () {
  const tool = getToolById('iromide')
  const toast = useToast()
  const { addColor } = useColorHistory()
  const shareTargetRef = useRef<HTMLDivElement>(null)

  // State
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageDimensions, setImageDimensions] = useState<{ width: number, height: number } | null>(null)
  const [extractedColors, setExtractedColors] = useState<ExtractedColor[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [wafflePreview, setWafflePreview] = useState<string | null>(null)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isFlipping, setIsFlipping] = useState(false)
  const [resultRotation, setResultRotation] = useState(0)
  const [message, setMessage] = useState('')

  // Handle flip with animation tracking
  const handleFlip = useCallback(() => {
    setIsFlipping(true)
    setIsFlipped(!isFlipped)
    // Reset after animation duration (500ms)
    setTimeout(() => setIsFlipping(false), 500)
  }, [isFlipped])

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

  useEffect(() => {
    return () => {
      if (wafflePreview) {
        URL.revokeObjectURL(wafflePreview)
      }
    }
  }, [wafflePreview])

  // Generate waffle chart preview when colors are extracted
  useEffect(() => {
    if (extractedColors.length === 0 || !imageDimensions) {
      setWafflePreview(null)
      return
    }

    // Generate waffle chart with the same dimensions as the original image
    generateWaffleChartBlob(extractedColors, imageDimensions.width, imageDimensions.height).then((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob)
        setWafflePreview(url)
      }
    })
  }, [extractedColors, imageDimensions])

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
    window.scrollTo({ top: 0 })

    try {
      // Load and resize image for preview (max 1200x800)
      const image = await loadImageFromFile(file)
      const resizedBlob = await processImage(image, 1200, 800, { preserveAspectRatio: true })
      const previewUrl = URL.createObjectURL(resizedBlob)
      setImagePreview(previewUrl)

      // Store resized dimensions for waffle chart generation
      const resizedImg = new Image()
      resizedImg.onload = () => {
        setImageDimensions({ width: resizedImg.width, height: resizedImg.height })
      }
      resizedImg.src = previewUrl

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

  // Copy color to clipboard
  const handleCopyColor = useCallback(async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex.toUpperCase())
      addColor(hex)
      toast.success('コピーしました')
    } catch (err) {
      toast.error('コピーに失敗しました')
      console.error('Failed to copy:', err)
    }
  }, [toast, addColor])

  // Share palette image using Web Share API
  const handleSharePalette = useCallback(async () => {
    if (!shareTargetRef.current) return

    try {
      // Capture the hidden element with high resolution
      const blob = await domToBlob(shareTargetRef.current, {
        style: { opacity: '1' }, // Override opacity for capture
        scale: 2 // Higher resolution for sharper text
      })

      if (!blob) return

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
    }
  }, [toast])

  // Reset
  const handleReset = useCallback(() => {
    setImagePreview(null)
    setImageDimensions(null)
    setExtractedColors([])
    setMessage('')
  }, [])

  return (
    <FullPageDropZone
      onFileDrop={handleFileSelect}
      accept='image/*'
    >
      <CorkBoardBackground className='left-1/2 -mb-12 -mt-6 w-screen -translate-x-1/2 border-b border-gray-200 px-4 py-12 dark:border-gray-700 sm:px-6 sm:py-20 lg:px-8'>
        <div className='mx-auto flex min-h-[calc(100vh-64px)] max-w-screen-md flex-col px-4'>
          {/* Header */}
          {!imagePreview && (
            <div className='mb-16 text-center'>
              <h1 className='text-3xl font-bold'>{tool?.name ?? 'iromide'}</h1>
              <p className='mt-2 text-gray-500 dark:text-gray-400'>
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
                <div className='mb-12'>
                  <div className='flex justify-center gap-6'>
                    {sampleImages.map((sample, index) => (
                      <div key={index} className='relative'>
                        <MaskingTape className='absolute -top-4 left-1/2 z-10 -translate-x-1/2' />
                        <PolaroidFrame
                          image={{
                            src: sample.src,
                            alt: `Sample ${index + 1}`,
                            className: 'max-h-32 sm:max-h-[800px] w-auto max-w-[calc(min(1200px,85vw))]',
                          }}
                          rotation={index === 0 ? -3 : index === 1 ? 2 : -1}
                        >
                          <div className='flex gap-2'>
                            {sample.colors.slice(0, 6).map((color, i) => (
                              <div
                                key={i}
                                className='size-6 rounded-full shadow-sm sm:size-8'
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </PolaroidFrame>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upload Area */}
                <label className='group flex w-full max-w-lg cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white p-12 transition-colors hover:border-gray-400 dark:border-gray-600 dark:bg-atom-one-dark dark:hover:border-gray-500'>
                  <div className='mb-4 rounded-full bg-gray-100 p-4 transition-colors group-hover:bg-gray-200 dark:bg-atom-one-dark-light dark:group-hover:bg-atom-one-dark-lighter'>
                    <PhotoIcon className='size-8 text-gray-600 dark:text-gray-400' />
                  </div>
                  <span className='mb-1 font-semibold'>
                    あなたの画像で試す
                  </span>
                  <input
                    type='file'
                    accept='image/*'
                    onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
                    className='hidden'
                  />
                </label>
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
                <div className='flex flex-1 flex-col items-center justify-center gap-4'>
                  {/* Hidden Share Target - for image capture */}
                  <div ref={shareTargetRef} className='pointer-events-none fixed left-0 top-0 opacity-0'>
                    <CorkBoardBackground className='p-10'>
                      <div className='relative flex justify-center'>
                        {/* Decorative Masking Tape */}
                        <MaskingTape className='absolute -top-4 left-1/2 z-10 -translate-x-1/2' />

                        <PolaroidFrame
                          image={{
                            src: isFlipped && wafflePreview ? wafflePreview : imagePreview!,
                            alt: isFlipped ? 'Waffle chart' : 'Uploaded'
                          }}
                          rotation={isFlipped ? -resultRotation : resultRotation}
                        >
                          <div className='flex flex-col items-center gap-2'>
                            <div className='flex gap-2'>
                              {extractedColors.map((color, index) => (
                                <div
                                  key={index}
                                  className='size-8 rounded-full shadow-sm'
                                  style={{ backgroundColor: color.hex }}
                                />
                              ))}
                            </div>
                            {message && (
                              <p className='text-center text-sm font-medium antialiased sm:text-lg'>
                                {message}
                              </p>
                            )}
                          </div>
                        </PolaroidFrame>
                      </div>
                    </CorkBoardBackground>
                  </div>

                  {/* Visible Flip Card */}
                  <div className='mb-8 flex justify-center'>
                    <div className='relative [perspective:1000px]'>
                      {/* Decorative Masking Tape - hidden during flip animation */}
                      <MaskingTape className={`absolute -top-4 left-1/2 z-10 -translate-x-1/2 transition-opacity ${isFlipping ? 'opacity-0' : 'opacity-100'}`} />

                      {/* Flip Container - clickable to flip */}
                      <button
                        onClick={handleFlip}
                        className='cursor-pointer transition-transform duration-500 '
                        style={{
                          transformStyle: 'preserve-3d',
                          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                        }}
                      >
                        {/* Front - Polaroid Image */}
                        <PolaroidFrame
                          image={{
                            src: imagePreview!,
                            alt: 'Uploaded'
                          }}
                          rotation={resultRotation}
                          style={{ backfaceVisibility: 'hidden' }}
                        >
                          <div className='flex flex-col items-center gap-2'>
                            <div className='flex gap-2'>
                              {extractedColors.map((color, index) => (
                                <div
                                  key={index}
                                  className='size-6 rounded-full shadow-sm sm:size-8'
                                  style={{ backgroundColor: color.hex }}
                                />
                              ))}
                            </div>
                            {message && (
                              <p
                                className='text-center text-sm font-medium antialiased sm:text-lg'
                              >
                                {message}
                              </p>
                            )}
                          </div>
                        </PolaroidFrame>

                        {/* Back - Waffle Chart */}
                        {wafflePreview && (
                          <PolaroidFrame
                            image={{
                              src: wafflePreview,
                              alt: 'Waffle chart',
                            }}
                            className='absolute inset-0'
                            style={{
                              backfaceVisibility: 'hidden',
                              transform: `rotateY(180deg) rotate(${-resultRotation}deg)`
                            }}
                          >
                            <div className='flex flex-col items-center gap-2'>
                              <div className='flex gap-2'>
                                {extractedColors.map((color, index) => (
                                  <div
                                    key={index}
                                    className='size-6 rounded-full shadow-sm sm:size-8'
                                    style={{ backgroundColor: color.hex }}
                                  />
                                ))}
                              </div>
                              {message && (
                                <p className='text-center text-sm font-medium antialiased sm:text-lg'>
                                  {message}
                                </p>
                              )}
                            </div>
                          </PolaroidFrame>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Color Palette */}
                  <ColorPalette colors={extractedColors} onColorClick={handleCopyColor} />

                  {/* Message Input */}
                  <div className='mb-6 w-full max-w-md'>
                    <input
                      type='text'
                      value={message}
                      onChange={(e) => setMessage(e.target.value.slice(0, 25))}
                      placeholder='メッセージを追加（25文字まで）'
                      className='w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-center text-sm outline-none transition-colors focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-gray-600 dark:bg-atom-one-dark-light'
                    />
                  </div>

                  {/* Actions */}
                  <div className='flex flex-col items-center gap-6'>
                    <button
                      onClick={handleSharePalette}
                      className='rounded-full bg-sky-500 px-6 py-3 font-medium text-white transition-colors hover:bg-sky-600'
                    >
                      シェアする
                    </button>
                    <button
                      onClick={handleReset}
                      className='rounded-full px-6 py-3 font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-atom-one-dark-lighter'
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
