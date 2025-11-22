'use client'

import { Popover, PopoverButton, PopoverPanel, Transition } from '@headlessui/react'
import { ChevronDownIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline'
import { useCallback, useEffect, useState } from 'react'

import { Breadcrumb } from '@/components/ui/breadcrumb'
import { HueSlider } from '@/components/ui/hue-slider'
import { LightnessSlider } from '@/components/ui/lightness-slider'
import { SaturationSlider } from '@/components/ui/saturation-slider'
import { useToast } from '@/components/ui/toast'
import { getToolById } from '@/config/tools'
import { useColorHistory } from '@/contexts/color-history-context'
import { hexToCmyk, hexToHsl, hexToOklch, hexToRgb } from '@/lib/color/color-utils'
import type { ColorPalette } from '@/lib/color/palette-generator'
import {
  adjustPaletteHue,
  adjustPaletteLightness,
  adjustPaletteSaturation,
  generatePalette,
  getShadeLabels
} from '@/lib/color/palette-generator'
import type { TailwindColorName, TailwindShade } from '@/lib/color/tailwind-colors'
import { getColorNames, getShades, isGrayScale, tailwindColors } from '@/lib/color/tailwind-colors'

export default function TailwindPaletteGeneratorPage () {
  const tool = getToolById('tw-palette-generator')
  const toast = useToast()
  const { addColor } = useColorHistory()

  // State
  const [inputColor, setInputColor] = useState('#0ea5e9') // Default: Tailwind blue-500
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
  const [baseHue, setBaseHue] = useState(198) // Input color's H value
  const [targetHue, setTargetHue] = useState(198) // Current slider value
  const [baseLightness, setBaseLightness] = useState(55) // Input color's L value
  const [baseSaturation, setBaseSaturation] = useState(90) // Input color's C value
  const [targetLightness, setTargetLightness] = useState(55) // Current slider value
  const [targetSaturation, setTargetSaturation] = useState(90) // Current slider value
  const [basePalette, setBasePalette] = useState<ColorPalette | null>(null)
  const [selectedFormat, setSelectedFormat] = useState<'hex' | 'rgb' | 'hsl' | 'cmyk'>('hex')

  // Normalize color: add # prefix if missing
  const normalizedInputColor = inputColor.startsWith('#') ? inputColor : `#${inputColor}`

  // Auto-generate palette with debounce when inputColor changes
  useEffect(() => {
    const timer = setTimeout(() => {
      const generated = generatePalette(normalizedInputColor)
      const oklch = hexToOklch(normalizedInputColor)
      if (generated && oklch) {
        setBasePalette(generated)
        setPalette(generated)
        // Set base and target to input color's actual values
        setBaseHue(Math.round(oklch.h))
        setTargetHue(Math.round(oklch.h))
        setBaseLightness(Math.round(oklch.l))
        setBaseSaturation(Math.round(oklch.c))
        setTargetLightness(Math.round(oklch.l))
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

  // Apply all adjustments to base palette
  const applyAdjustments = useCallback((
    base: ColorPalette,
    hue: number,
    lightnessShift: number,
    saturationShift: number
  ) => {
    let adjusted = base
    if (hue !== 0) {
      adjusted = adjustPaletteHue(adjusted, hue)
    }
    if (lightnessShift !== 0) {
      adjusted = adjustPaletteLightness(adjusted, lightnessShift)
    }
    if (saturationShift !== 0) {
      adjusted = adjustPaletteSaturation(adjusted, saturationShift)
    }
    return adjusted
  }, [])

  // Adjust hue
  const handleHueChange = useCallback((sliderValue: number) => {
    setTargetHue(sliderValue)
    if (basePalette) {
      const hueShift = sliderValue - baseHue
      const lightnessShift = targetLightness - baseLightness
      const saturationShift = targetSaturation - baseSaturation
      const adjusted = applyAdjustments(basePalette, hueShift, lightnessShift, saturationShift)
      setPalette(adjusted)
    }
  }, [basePalette, baseHue, targetLightness, baseLightness, targetSaturation, baseSaturation, applyAdjustments])

  // Adjust lightness
  const handleLightnessChange = useCallback((sliderValue: number) => {
    setTargetLightness(sliderValue)
    if (basePalette) {
      const hueShift = targetHue - baseHue
      const lightnessShift = sliderValue - baseLightness
      const saturationShift = targetSaturation - baseSaturation
      const adjusted = applyAdjustments(basePalette, hueShift, lightnessShift, saturationShift)
      setPalette(adjusted)
    }
  }, [basePalette, baseLightness, targetHue, baseHue, targetSaturation, baseSaturation, applyAdjustments])

  // Adjust saturation
  const handleSaturationChange = useCallback((sliderValue: number) => {
    setTargetSaturation(sliderValue)
    if (basePalette) {
      const hueShift = targetHue - baseHue
      const lightnessShift = targetLightness - baseLightness
      const saturationShift = sliderValue - baseSaturation
      const adjusted = applyAdjustments(basePalette, hueShift, lightnessShift, saturationShift)
      setPalette(adjusted)
    }
  }, [basePalette, targetLightness, baseLightness, baseSaturation, targetHue, baseHue, applyAdjustments])

  // Reset adjustments to base values
  const handleReset = useCallback(() => {
    setTargetHue(baseHue)
    setTargetLightness(baseLightness)
    setTargetSaturation(baseSaturation)
    if (basePalette) {
      setPalette(basePalette)
    }
  }, [baseHue, baseLightness, baseSaturation, basePalette])

  // Select format
  const handleSelectFormat = useCallback((format: 'hex' | 'rgb' | 'hsl' | 'cmyk') => {
    setSelectedFormat(format)
  }, [])

  // Get formatted color string
  const getFormattedColor = useCallback((hex: string) => {
    switch (selectedFormat) {
      case 'hex':
        return hex.toUpperCase()
      case 'rgb': {
        const rgb = hexToRgb(hex)
        return rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : hex.toUpperCase()
      }
      case 'hsl': {
        const hsl = hexToHsl(hex)
        return hsl ? `hsl(${hsl.h}°, ${hsl.s}%, ${hsl.l}%)` : hex.toUpperCase()
      }
      case 'cmyk': {
        const cmyk = hexToCmyk(hex)
        return cmyk ? `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)` : hex.toUpperCase()
      }
    }
  }, [selectedFormat])

  // Copy color to clipboard
  const handleCopyColor = useCallback(async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex.toUpperCase())
      addColor(hex)
      toast.success('クリップボードにコピーしました')
    } catch (err) {
      toast.error('コピーに失敗しました')
      console.error('Failed to copy:', err)
    }
  }, [toast, addColor])

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

  return (
    <>
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: tool?.name ?? 'TWパレットジェネレーター' }
        ]}
      />

      <div className='mx-auto max-w-screen-sm lg:max-w-screen-xl'>
        <div className='mb-8 space-y-4'>
          <h1 className='text-2xl font-semibold'>{tool?.name ?? 'TWパレットジェネレーター'}</h1>
          <p className='break-keep text-gray-600 dark:text-gray-400'>
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
                  className='h-10 w-20 cursor-pointer bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-sky-500'
                  aria-label='色を選択'
                />
                <input
                  type='text'
                  value={inputColor}
                  onChange={handleInputChange}
                  placeholder='#3b82f6'
                  className='flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition-colors focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-gray-600 dark:bg-atom-one-dark-light'
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
                  className='rounded-lg px-2 py-1 text-sm font-medium uppercase outline-none transition-colors hover:bg-gray-100 focus-visible:bg-gray-100 dark:hover:bg-atom-one-dark-lighter focus-visible:dark:bg-atom-one-dark-lighter'
                >
                  Reset
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
            <section className='mb-4 flex items-center justify-between'>
              <h6 className='text-sm font-semibold'>生成されたパレット</h6>
              <Popover className='relative'>
                {({ open }) => (
                  <>
                    <PopoverButton className='flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium uppercase outline-none transition-colors hover:bg-gray-100 focus-visible:bg-gray-100 dark:hover:bg-atom-one-dark-lighter focus-visible:dark:bg-atom-one-dark-lighter'>
                      {selectedFormat}
                      <ChevronDownIcon className={`size-4 transition-transform ${open ? 'rotate-180' : ''}`} />
                    </PopoverButton>
                    <Transition
                      enter='transition duration-100 ease-out'
                      enterFrom='transform scale-95 opacity-0'
                      enterTo='transform scale-100 opacity-100'
                      leave='transition duration-100 ease-out'
                      leaveFrom='transform scale-100 opacity-100'
                      leaveTo='transform scale-95 opacity-0'
                    >
                      <PopoverPanel className='absolute right-0 z-50 mt-2 w-32'>
                        <div className='overflow-hidden rounded-lg border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-700 dark:bg-atom-one-dark-light'>
                          {(['hex', 'rgb', 'hsl', 'cmyk'] as const).map((format) => (
                            <button
                              key={format}
                              onClick={() => handleSelectFormat(format)}
                              className={`block w-full rounded-lg px-3 py-1.5 text-left text-sm uppercase outline-none transition-colors ${selectedFormat === format ? 'bg-sky-50 font-medium dark:bg-atom-one-dark-lighter' : 'hover:bg-gray-100 focus-visible:bg-gray-100 dark:hover:bg-atom-one-dark-lighter dark:focus-visible:bg-atom-one-dark-lighter'
                                }`}
                            >
                              {format}
                            </button>
                          ))}
                        </div>
                      </PopoverPanel>
                    </Transition>
                  </>
                )}
              </Popover>
            </section>

            <>
              {/* Color Swatches */}
              <div className='mb-4 space-y-1'>
                {getShadeLabels().map((shade) => {
                  const hex = palette[shade]

                  return (
                    <div
                      key={shade}
                      className='flex items-center gap-2 rounded px-1 py-1'
                    >
                      {/* Color Preview */}
                      <button
                        onClick={() => handleCopyColor(hex)}
                        className='size-12 flex-shrink-0 cursor-pointer rounded shadow-sm outline-none transition-transform hover:scale-110 focus-visible:scale-110 active:scale-95'
                        style={{ backgroundColor: hex }}
                        title='クリックでコピー'
                      />

                      {/* Shade Label */}
                      <div className='w-12 font-mono text-sm'>
                        {shade}
                      </div>

                      {/* Formatted Color Value */}
                      <div className='font-mono text-sm font-medium'>
                        {getFormattedColor(hex)}
                      </div>
                    </div>
                  )
                })}
              </div>

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
                    title='コピー'
                    aria-label='コピー'
                  >
                    <ClipboardDocumentIcon className='size-5' aria-label='コピー' />
                  </button>
                </div>
              </section>
            </>
          </div>
        </div>
      </div>
    </>
  )
}
