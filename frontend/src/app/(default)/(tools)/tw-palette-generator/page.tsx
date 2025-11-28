'use client'

import { ArrowPathIcon, ClipboardDocumentIcon, PlusIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useCallback, useEffect, useState } from 'react'

import { HueSlider } from '@/components/tw-palette-generator/hue-slider'
import { LightnessSlider } from '@/components/tw-palette-generator/lightness-slider'
import { SaturationSlider } from '@/components/tw-palette-generator/saturation-slider'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { useToast } from '@/components/ui/toast'
import { getToolById } from '@/config/tools'
import { hexToOklch } from '@/lib/color/color-utils'
import type { ColorPalette } from '@/lib/color/palette-generator'
import {
  adjustColor,
  adjustPalette,
  generatePalette,
  getShadeLabels
} from '@/lib/color/palette-generator'
import type { TailwindColorName, TailwindShade } from '@/lib/color/tailwind-colors'
import { getColorNames, getShades, isGrayScale, tailwindColors } from '@/lib/color/tailwind-colors'

export default function TailwindPaletteGeneratorPage () {
  const tool = getToolById('tw-palette-generator')
  const toast = useToast()

  // Palette history type
  type PaletteHistoryItem = {
    id: string
    baseColor: string
    palette: ColorPalette
    timestamp: number
  }

  // State
  const [inputColor, setInputColor] = useState('#0ea5e9') // Default: Tailwind blue-500
  const [baseColor, setBaseColor] = useState(inputColor)
  const [palette, setPalette] = useState<ColorPalette>({ // Default: Tailwind sky
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49'
  })
  const [baseHue, setBaseHue] = useState(237) // Input color's H value
  const [targetHue, setTargetHue] = useState(237) // Current slider value
  const [baseLightness, setBaseLightness] = useState(68) // Input color's L value
  const [targetLightness, setTargetLightness] = useState(68) // Current slider value
  const [baseSaturation, setBaseSaturation] = useState(19) // Input color's C value
  const [targetSaturation, setTargetSaturation] = useState(19) // Current slider value
  const [basePalette, setBasePalette] = useState<ColorPalette | null>(null)
  const [paletteHistory, setPaletteHistory] = useState<PaletteHistoryItem[]>([])

  // Normalize color: add # prefix if missing
  const normalizedInputColor = inputColor.startsWith('#') ? inputColor : `#${inputColor}`

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('tw-palette-history')
      if (saved) {
        const parsed = JSON.parse(saved) as PaletteHistoryItem[]
        setPaletteHistory(parsed)
      }
    } catch (err) {
      console.error('Failed to load palette history:', err)
    }
  }, [])

  // Save history to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem('tw-palette-history', JSON.stringify(paletteHistory))
    } catch (err) {
      console.error('Failed to save palette history:', err)
    }
  }, [paletteHistory])

  // Auto-generate palette with debounce when inputColor changes
  useEffect(() => {
    const timer = setTimeout(() => {
      const generated = generatePalette(normalizedInputColor)
      const oklch = hexToOklch(normalizedInputColor)
      if (generated && oklch) {
        setBaseColor(normalizedInputColor)
        setBasePalette(generated)
        setPalette(generated)
        // Set base and target to input color's actual values
        setBaseHue(Math.round(oklch.h))
        setTargetHue(Math.round(oklch.h))
        setBaseLightness(Math.round(oklch.l))
        setTargetLightness(Math.round(oklch.l))
        setBaseSaturation(Math.round(oklch.c))
        setTargetSaturation(Math.round(oklch.c))
      }
    }, 100) // 100ms debounce (optimized for responsive UX)

    return () => clearTimeout(timer)
  }, [normalizedInputColor])

  // Handle color input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputColor(e.target.value)
  }, [])

  // Select Tailwind color
  const handleTailwindColorSelect = useCallback((name: TailwindColorName, shade: TailwindShade) => {
    const hex = tailwindColors[name][shade]
    setInputColor(hex)
  }, [])

  // Adjust hue
  const handleHueChange = useCallback((sliderValue: number) => {
    setTargetHue(sliderValue)
    if (basePalette) {
      const hueShift = sliderValue - baseHue
      const lightnessShift = targetLightness - baseLightness
      const saturationShift = targetSaturation - baseSaturation
      const adjustedColor = adjustColor(inputColor, hueShift, lightnessShift, saturationShift)
      setBaseColor(adjustedColor || inputColor)
      const adjustedPalette = adjustPalette(basePalette, hueShift, lightnessShift, saturationShift)
      setPalette(adjustedPalette)
    }
  }, [inputColor, basePalette, baseHue, targetLightness, baseLightness, targetSaturation, baseSaturation])

  // Adjust lightness
  const handleLightnessChange = useCallback((sliderValue: number) => {
    setTargetLightness(sliderValue)
    if (basePalette) {
      const hueShift = targetHue - baseHue
      const lightnessShift = sliderValue - baseLightness
      const saturationShift = targetSaturation - baseSaturation
      const adjustedColor = adjustColor(inputColor, hueShift, lightnessShift, saturationShift)
      setBaseColor(adjustedColor || inputColor)
      const adjustedPalette = adjustPalette(basePalette, hueShift, lightnessShift, saturationShift)
      setPalette(adjustedPalette)
    }
  }, [inputColor, basePalette, baseLightness, targetHue, baseHue, targetSaturation, baseSaturation])

  // Adjust saturation
  const handleSaturationChange = useCallback((sliderValue: number) => {
    setTargetSaturation(sliderValue)
    if (basePalette) {
      const hueShift = targetHue - baseHue
      const lightnessShift = targetLightness - baseLightness
      const saturationShift = sliderValue - baseSaturation
      const adjustedColor = adjustColor(inputColor, hueShift, lightnessShift, saturationShift)
      setBaseColor(adjustedColor || inputColor)
      const adjustedPalette = adjustPalette(basePalette, hueShift, lightnessShift, saturationShift)
      setPalette(adjustedPalette)
    }
  }, [inputColor, basePalette, targetLightness, baseLightness, baseSaturation, targetHue, baseHue])

  // Reset adjustments to base values
  const handleReset = useCallback(() => {
    setTargetHue(baseHue)
    setTargetLightness(baseLightness)
    setTargetSaturation(baseSaturation)
    if (basePalette) {
      setPalette(basePalette)
    }
    setBaseColor(inputColor)
  }, [baseHue, baseLightness, baseSaturation, basePalette, inputColor])

  // Copy color to clipboard
  const handleCopyColor = useCallback(async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex.toUpperCase())
      toast.success('カラーコードをコピーしました')
    } catch (err) {
      toast.error('コピーに失敗しました')
      console.error('Failed to copy:', err)
    }
  }, [toast])

  // Copy as Tailwind Config
  const handleCopyAsTailwind = useCallback(() => {
    if (!palette) return
    try {
      const tailwindConfig = `colors: {\n  custom: {\n${getShadeLabels()
        .map(shade => `    ${shade}: '${palette[shade]}',`)
        .join('\n')}\n  }\n}`
      navigator.clipboard.writeText(tailwindConfig)
      toast.success('Tailwind設定としてコピーしました')
    } catch (err) {
      toast.error('コピーに失敗しました')
      console.error(err)
    }
  }, [palette, toast])

  // Add current palette to history
  const handleAddToHistory = useCallback(() => {
    const MAX_HISTORY = 30
    const newItem: PaletteHistoryItem = {
      id: Date.now().toString(),
      baseColor,
      palette,
      timestamp: Date.now()
    }
    setPaletteHistory(prev => {
      const updated = [...prev, newItem]
      // Keep only the latest MAX_HISTORY items (remove oldest)
      return updated.slice(-MAX_HISTORY)
    })
    toast.success('ヒストリーに追加しました')
  }, [baseColor, palette, toast])

  // Remove palette from history
  const handleRemoveFromHistory = useCallback((id: string) => {
    setPaletteHistory(prev => prev.filter(item => item.id !== id))
  }, [])

  // Remove All palette from history
  const handleClearHistory = useCallback(() => {
    setPaletteHistory([])
  }, [])

  return (
    <>
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: tool?.name ?? 'tw-palette-generator' }
        ]}
      />

      <div className='mx-auto max-w-screen-sm lg:max-w-screen-xl'>
        <div className='mb-8 space-y-4'>
          <h1 className='text-2xl font-semibold'>{tool?.name ?? 'tw-palette-generator'}</h1>
          <p className='whitespace-pre-line text-gray-600 dark:text-gray-400'>
            {tool?.description ?? ''}
          </p>
        </div>

        {/* Two Column Layout */}
        <div className='flex flex-col gap-12 lg:grid lg:grid-cols-2'>
          {/* Left Column - Input */}
          <div className='space-y-8'>
            {/* HEX Input */}
            <section>
              <h6 className='mb-4 text-sm font-semibold'>ベースカラー選択</h6>
              <div className='flex gap-3'>
                <input
                  type='color'
                  value={normalizedInputColor}
                  onChange={handleInputChange}
                  className='h-10 w-20 cursor-pointer rounded bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-sky-500'
                  aria-label='色を選択'
                />
                <input
                  type='text'
                  value={inputColor}
                  onChange={handleInputChange}
                  placeholder='#3b82f6'
                  className='flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none transition-colors focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-gray-600 dark:bg-atom-one-dark-light'
                  aria-label='カラーコード'
                />
              </div>
            </section>

            {/* Tailwind Color Picker */}
            <section>
              {/* Shade Header */}
              <div className='mb-3 flex gap-1 md:ml-20'>
                {getShades().map((shade) => (
                  <div
                    key={shade}
                    className='flex flex-1 shrink-0 items-center justify-center font-mono text-xs font-medium text-gray-600 dark:text-gray-400 max-sm:-rotate-90'
                  >
                    {shade}
                  </div>
                ))}
              </div>
              {/* Chromatic Colors */}
              <div className='space-y-3'>
                {getColorNames().filter(name => !isGrayScale(name)).map((colorName) => (
                  <div key={colorName} className='md:flex md:items-center md:gap-2'>
                    <div className='mb-1 text-xs font-medium uppercase text-gray-600 dark:text-gray-400 md:mb-0 md:w-[72px] md:shrink-0'>
                      {colorName}
                    </div>
                    <div className='flex w-full gap-1'>
                      {getShades().map((shade) => {
                        const hex = tailwindColors[colorName][shade]

                        return (
                          <button
                            key={shade}
                            onClick={() => handleTailwindColorSelect(colorName, shade)}
                            className='group relative aspect-square h-full flex-1 shrink-0 rounded transition-transform hover:scale-110 focus:outline-none focus-visible:scale-110 active:scale-95'
                            style={{ backgroundColor: hex }}
                            title={`${colorName}-${shade}`}
                          >
                            <span className='sr-only'>{colorName}-{shade}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Grayscale Colors */}
              <div className='mt-6 space-y-3 border-t border-gray-200 pt-6 dark:border-gray-700'>
                {getColorNames().filter(name => isGrayScale(name)).map((colorName) => (
                  <div key={colorName} className='md:flex md:items-center md:gap-2'>
                    <div className='mb-1 text-xs font-medium uppercase text-gray-600 dark:text-gray-400 md:mb-0 md:w-16 md:shrink-0'>
                      {colorName}
                    </div>
                    <div className='flex w-full gap-1'>
                      {getShades().map((shade) => {
                        const hex = tailwindColors[colorName][shade]

                        return (
                          <button
                            key={shade}
                            onClick={() => handleTailwindColorSelect(colorName, shade)}
                            className=':scale-110 group relative aspect-square h-full flex-1 shrink-0 rounded transition-transform hover:scale-110 focus:outline-none active:scale-95 '
                            style={{ backgroundColor: hex }}
                            title={`${colorName}-${shade}`}
                          >
                            <span className='sr-only'>{colorName}-{shade}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column - Output */}
          <div className='space-y-10'>
            {/* Adjustments */}
            <section>
              <div className='mb-4 flex items-center justify-between'>
                <h6 className='text-sm font-semibold'>調整</h6>
                <button
                  onClick={handleReset}
                  className='rounded-lg p-1.5 outline-none transition-colors hover:bg-gray-100 focus-visible:bg-gray-100 dark:hover:bg-atom-one-dark-lighter focus-visible:dark:bg-atom-one-dark-lighter'
                  title='調整をリセット'
                  aria-label='調整をリセット'
                >
                  <ArrowPathIcon className='size-5' />
                </button>
              </div>
              <div className='space-y-4 px-4'>
                {/* Hue */}
                <HueSlider
                  label='色相'
                  value={targetHue}
                  min={0}
                  max={360}
                  inputColor={normalizedInputColor}
                  onChange={handleHueChange}
                />
                {/* Lightness */}
                <LightnessSlider
                  label='明度'
                  value={targetLightness}
                  onChange={handleLightnessChange}
                />
                {/* Saturation */}
                <SaturationSlider
                  label='彩度'
                  value={targetSaturation}
                  inputColor={normalizedInputColor}
                  onChange={handleSaturationChange}
                />
              </div>
            </section>
            <section>
              <div className='mb-4 flex items-center justify-between'>
                <h6 className='text-sm font-semibold'>生成されたパレット</h6>
                <button
                  onClick={handleAddToHistory}
                  className='rounded-lg p-1.5 outline-none transition-colors hover:bg-gray-100 focus-visible:bg-gray-100 dark:hover:bg-atom-one-dark-lighter focus-visible:dark:bg-atom-one-dark-lighter'
                  title='ヒストリーに保存'
                  aria-label='ヒストリーに保存'
                >
                  <PlusIcon className='size-5' />
                </button>
              </div>

              {/* Color Swatches - Horizontal Layout */}
              <div className='flex items-center gap-1'>
                {/* BASE Color */}
                <div className='flex flex-1 flex-col items-center gap-1 truncate'>
                  <button
                    onClick={() => handleCopyColor(baseColor)}
                    className='aspect-square w-full cursor-pointer rounded transition-transform hover:scale-110 focus:outline-none focus-visible:scale-110 active:scale-95'
                    style={{ backgroundColor: baseColor }}
                    title={`BASE - ${baseColor.toUpperCase()}`}
                    aria-label={`BASE ${baseColor.toUpperCase()} をコピー`}
                  >
                    <span className='sr-only'>BASE</span>
                  </button>
                  <div className='font-mono text-xs font-medium text-gray-600 dark:text-gray-400'>BASE</div>
                </div>
                {/* Palette Colors */}
                {getShadeLabels().map((shade) => {
                  const hex = palette[shade]
                  return (
                    <div key={shade} className='flex flex-1 flex-col items-center gap-1'>
                      <button
                        onClick={() => handleCopyColor(hex)}
                        className='aspect-square w-full cursor-pointer rounded transition-transform hover:scale-110 focus:outline-none focus-visible:scale-110 active:scale-95'
                        style={{ backgroundColor: hex }}
                        title={`${shade} - ${hex.toUpperCase()}`}
                        aria-label={`${shade} ${hex.toUpperCase()} をコピー`}
                      >
                        <span className='sr-only'>{shade}</span>
                      </button>
                      <div className='font-mono text-xs font-medium text-gray-600 dark:text-gray-400'>{shade}</div>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Palette History */}
            <section>
              <div className='mb-4 flex items-center justify-between'>
                <h6 className='text-sm font-semibold'>パレットヒストリー</h6>
                <button
                  onClick={handleClearHistory}
                  className='rounded-lg p-1.5 outline-none transition-colors hover:bg-gray-100 focus-visible:bg-gray-100 dark:hover:bg-atom-one-dark-lighter focus-visible:dark:bg-atom-one-dark-lighter'
                  title='ヒストリーを全削除'
                  aria-label='ヒストリーを全削除'
                >
                  <TrashIcon className='size-5' />
                </button>
              </div>
              {paletteHistory.length > 0
                ? (
                  <div className='flex flex-col-reverse gap-4'>
                    {paletteHistory.map((item) => (
                      <div key={item.id} className='flex items-center gap-1'>
                        {/* BASE Color */}
                        <button
                          onClick={() => handleCopyColor(item.baseColor)}
                          className='aspect-square w-full cursor-pointer rounded transition-transform hover:scale-110 focus:outline-none focus-visible:scale-110 active:scale-95'
                          style={{ backgroundColor: item.baseColor }}
                          title={`BASE - ${item.baseColor}`}
                          aria-label={`BASE ${item.baseColor} をコピー`}
                        >
                          <span className='sr-only'>BASE</span>
                        </button>
                        <div className='mx-1 h-6 w-px bg-gray-200 dark:bg-gray-700' />
                        {/* Palette Colors */}
                        {getShadeLabels().map((shade) => {
                          const hex = item.palette[shade]
                          return (
                            <button
                              key={shade}
                              onClick={() => handleCopyColor(hex)}
                              className='aspect-square w-full cursor-pointer rounded transition-transform hover:scale-110 focus:outline-none focus-visible:scale-110 active:scale-95'
                              style={{ backgroundColor: hex }}
                              title={`${shade} - ${hex}`}
                              aria-label={`${shade} ${hex} をコピー`}
                            >
                              <span className='sr-only'>{shade}</span>
                            </button>
                          )
                        })}
                        <button
                          onClick={() => handleRemoveFromHistory(item.id)}
                          className='rounded p-1 text-gray-600 transition-colors hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-600'
                          title='履歴から削除'
                          aria-label='履歴から削除'
                        >
                          <XMarkIcon className='size-4' />
                        </button>
                      </div>
                    ))}
                  </div>
                  )
                : <p className='text-center text-sm text-gray-600 dark:text-gray-400'>作成したカラーパレットを履歴に追加することができます</p>}
            </section>

            {/* Tailwind Config Snippet */}
            <section>
              <h6 className='mb-4 text-sm font-semibold'>Tailwind Config</h6>
              <div className='relative'>
                <pre className='overflow-x-auto rounded-lg bg-atom-one-dark p-3 font-mono text-xs text-gray-300 dark:bg-atom-one-dark-light dark:text-gray-300'>
                  {`colors: {
  custom: {
${getShadeLabels().map(shade => `    ${shade}: '${palette[shade]}',`).join('\n')}
  }
}`}
                </pre>
                <button
                  onClick={handleCopyAsTailwind}
                  className='absolute right-2 top-2 rounded-lg p-1 text-gray-300 transition-colors hover:bg-white/10 dark:text-gray-300'
                  title='Tailwind設定をコピー'
                  aria-label='Tailwind設定をコピー'
                >
                  <ClipboardDocumentIcon className='size-5' />
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  )
}
