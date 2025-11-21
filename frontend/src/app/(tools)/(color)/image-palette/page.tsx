'use client'

import { PhotoIcon } from '@heroicons/react/24/outline'
import html2canvas from 'html2canvas'
import { useCallback, useEffect, useRef, useState } from 'react'

import { WavingHandIcon } from '@/components/icons/waving-hand-icon'
import { FullPageDropZone } from '@/components/ui/full-page-drop-zone'
import { Spinner } from '@/components/ui/spinner'
import { useToast } from '@/components/ui/toast'
import { getToolById } from '@/config/tools'
import { useColorHistory } from '@/contexts/color-history-context'
import type { ExtractedColor } from '@/lib/api/colors'
import { extractColorsFromImage, } from '@/lib/api/colors'
import { generateWaffleChartBlob } from '@/lib/color/waffle-chart'
import { validateImageFile } from '@/lib/file/file-validation'

// Cork board background with noise texture and vignette
function CorkBoardBackground ({
  children,
  className = ''
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`relative bg-stone-100 dark:bg-atom-one-dark ${className}`}>
      {/* Noise texture overlay using SVG filter */}
      <div
        className='pointer-events-none absolute inset-0 opacity-5'
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
        }}
      />

      {/* Light highlight (top-right) and vignette (bottom-left) for depth */}
      <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(255,255,255,0.4)_0%,transparent_50%,rgba(0,0,0,0.05)_100%)] dark:bg-[radial-gradient(circle_at_100%_0%,rgba(255,255,255,0.08)_0%,transparent_50%,rgba(0,0,0,0.2)_100%)]' />

      <div className='relative'>
        {children}
      </div>
    </div>
  )
}

// Shared Polaroid Frame component with optional content in bottom margin
function PolaroidFrame ({
  src,
  alt,
  rotation = 0,
  className = '',
  style = {},
  children
}: {
  src: string
  alt: string
  rotation?: number
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}) {
  return (
    <div
      // Root element: handles positioning and rotation only
      className={`${className}`}
      style={{ transform: `rotate(${rotation}deg)`, ...style }}
    >
      {/* Inner element: handles Polaroid appearance and internal coordinates */}
      <div className='relative bg-white p-4 shadow-xl dark:bg-gray-100'>

        {/* Paper texture */}
        <div className='pointer-events-none absolute inset-0 bg-gray-50 opacity-[0.02]' />

        <div className='relative flex justify-center overflow-hidden'>
          {/* Photo */}
          <img
            src={src}
            alt={alt}
            className='max-h-96 w-auto object-cover shadow-inner'
          />

          {/* Film gloss effect */}
          <div className='pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-50' />
        </div>

        {/* Bottom margin content */}
        {children && (
          <div className='mt-4 flex justify-center'>
            {children}
          </div>
        )}

        {/* Outer frame thin line */}
        <div className='pointer-events-none absolute inset-0 rounded-sm ring-1 ring-black/5' />
      </div>
    </div>
  )
}

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
  const tool = getToolById('image-palette')
  const toast = useToast()
  const { addColor } = useColorHistory()
  const shareTargetRef = useRef<HTMLDivElement>(null)

  // State
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [extractedColors, setExtractedColors] = useState<ExtractedColor[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [wafflePreview, setWafflePreview] = useState<string | null>(null)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isFlipping, setIsFlipping] = useState(false)

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
    if (extractedColors.length === 0) {
      setWafflePreview(null)
      return
    }

    generateWaffleChartBlob(extractedColors, 400).then((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob)
        setWafflePreview(url)
      }
    })
  }, [extractedColors])

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

    // Create preview URL
    const previewUrl = URL.createObjectURL(file)
    setImagePreview(previewUrl)

    // Extract colors using backend API
    try {
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
      // Capture the share target element
      const canvas = await html2canvas(shareTargetRef.current, {
        backgroundColor: null, // Use background from CorkBoardBackground
        scale: 2, // Higher resolution for better quality
        useCORS: true
      })

      // Convert to blob
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/png')
      })

      if (!blob) return

      const file = new File([blob], 'palette.png', { type: 'image/png' })

      // Check if Web Share API with files is supported
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'カラーパレット',
            text: '8px.appで作成したカラーパレット'
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
      console.error('html2canvas failed:', err)
    }
  }, [toast])

  // Reset
  const handleReset = useCallback(() => {
    setImagePreview(null)
    setExtractedColors([])
  }, [])

  return (
    <FullPageDropZone
      onFileDrop={handleFileSelect}
      accept='image/*'
    >
      <CorkBoardBackground className='left-1/2 -mb-12 -mt-6 w-screen -translate-x-1/2 px-4 py-12 sm:px-6 lg:px-8'>
        <div className='mx-auto flex min-h-screen max-w-screen-md flex-col px-4'>
          {/* Header */}
          {!imagePreview && (
            <div className='py-8 text-center'>
              <h1 className='text-3xl font-bold'>{tool?.name ?? 'イメージパレット+'}</h1>
              <p className='mt-2 text-gray-500 dark:text-gray-400'>
                {tool?.description ?? ''}
              </p>
            </div>
          )}

          {/* Main Content */}
          {!imagePreview && !isProcessing
            ? (
              // Upload State
              <div className='flex items-center justify-center'>
                <label className='group flex w-full max-w-lg cursor-pointer flex-col items-center justify-center rounded-3xl border-[3px] border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 p-16 transition-all hover:border-sky-400 hover:from-sky-50 hover:to-indigo-50 dark:border-gray-600 dark:from-atom-one-dark dark:to-atom-one-dark-light dark:hover:border-sky-500 dark:hover:from-atom-one-dark-light dark:hover:to-atom-one-dark-lighter'>
                  <div className='mb-6 rounded-full p-6 transition-transform group-hover:scale-110'>
                    <PhotoIcon className='size-12 text-gray-400 transition-colors group-hover:text-sky-500' />
                  </div>
                  <span className='mb-2 text-lg font-semibold text-gray-700 dark:text-gray-300'>
                    画像を選択
                  </span>
                  <span className='text-sm text-gray-500 dark:text-gray-400'>
                    またはドラッグ＆ドロップ
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
                  {/* Hidden Share Target - for html2canvas capture */}
                  <div ref={shareTargetRef} className='absolute -left-[200vw]'>
                    <CorkBoardBackground className='p-10'>
                      <div className='relative flex justify-center'>
                        {/* Decorative Masking Tape */}
                        <div className='absolute -top-4 left-1/2 z-10 h-8 w-24 -translate-x-1/2 bg-yellow-200/75 shadow-sm backdrop-blur-sm' />

                        <PolaroidFrame
                          src={isFlipped && wafflePreview ? wafflePreview : imagePreview!}
                          alt={isFlipped ? 'Waffle chart' : 'Uploaded'}
                          rotation={isFlipped ? 2 : -2}
                        >
                          <div className='flex gap-2'>
                            {extractedColors.map((color, index) => (
                              <div
                                key={index}
                                className='size-8 rounded-full shadow-sm'
                                style={{ backgroundColor: color.hex }}
                              />
                            ))}
                          </div>
                        </PolaroidFrame>
                      </div>
                    </CorkBoardBackground>
                  </div>

                  {/* Visible Flip Card */}
                  <div className='mb-8 flex justify-center'>
                    <div className='relative [perspective:1000px]'>
                      {/* Flip Button */}
                      <button
                        onClick={handleFlip}
                        className='absolute -bottom-2 -right-2 z-20 transition-transform hover:scale-110 active:scale-95'
                        title={isFlipped ? '画像を表示' : 'パレットを表示'}
                      >
                        <WavingHandIcon className='size-16' />
                      </button>

                      {/* Decorative Masking Tape - hidden during flip animation */}
                      <div className={`absolute -top-4 left-1/2 z-10 h-8 w-24 -translate-x-1/2 bg-yellow-200/75 shadow-sm backdrop-blur-sm transition-opacity ${isFlipping ? 'opacity-0' : 'opacity-100'}`} />

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
                          src={imagePreview!}
                          alt='Uploaded'
                          rotation={-2}
                          style={{ backfaceVisibility: 'hidden' }}
                        >
                          <div className='flex gap-2'>
                            {extractedColors.map((color, index) => (
                              <div
                                key={index}
                                className='size-6 rounded-full shadow-sm sm:size-8'
                                style={{ backgroundColor: color.hex }}
                              />
                            ))}
                          </div>
                        </PolaroidFrame>

                        {/* Back - Waffle Chart */}
                        {wafflePreview && (
                          <PolaroidFrame
                            src={wafflePreview}
                            alt='Waffle chart'
                            className='absolute inset-0'
                            style={{
                              backfaceVisibility: 'hidden',
                              transform: 'rotateY(180deg) rotate(2deg)'
                            }}
                          >
                            <div className='flex gap-2'>
                              {extractedColors.map((color, index) => (
                                <div
                                  key={index}
                                  className='size-6 rounded-full shadow-sm sm:size-8'
                                  style={{ backgroundColor: color.hex }}
                                />
                              ))}
                            </div>
                          </PolaroidFrame>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Color Palette */}
                  <ColorPalette colors={extractedColors} onColorClick={handleCopyColor} />

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
