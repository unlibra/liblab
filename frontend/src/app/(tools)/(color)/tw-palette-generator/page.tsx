'use client'

import { Popover, PopoverButton, PopoverPanel, Transition } from '@headlessui/react'
import { ChevronDownIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline'
import { useCallback, useEffect, useState } from 'react'

import { Breadcrumb } from '@/components/ui/breadcrumb'
import { HueSlider } from '@/components/ui/hue-slider'
import { CircleSpinner } from '@/components/ui/spinner'
import { useToast } from '@/components/ui/toast'
import { getToolById } from '@/config/tools'
import { useColorHistory } from '@/contexts/color-history-context'
import { hexToCmyk, hexToHsl, hexToOklch, hexToRgb, normalizeHue, oklchToHex } from '@/lib/color/color-utils'
import type { ColorPalette } from '@/lib/color/palette-generator'
import { adjustPaletteHue, generatePalette, getShadeLabels } from '@/lib/color/palette-generator'
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
  const [hueShift, setHueShift] = useState(0) // 0 = no shift
  const [basePalette, setBasePalette] = useState<ColorPalette | null>(null)
  const [selectedFormat, setSelectedFormat] = useState<'hex' | 'rgb' | 'hsl' | 'cmyk'>('hex')

  // Normalize color: add # prefix if missing
  const normalizedInputColor = inputColor.startsWith('#') ? inputColor : `#${inputColor}`

  // Calculate adjusted original color (with hue shift applied)
  const adjustedOriginalColor = (() => {
    const oklch = hexToOklch(normalizedInputColor)
    if (!oklch || hueShift === 0) return normalizedInputColor
    return oklchToHex({
      l: oklch.l,
      c: oklch.c,
      h: normalizeHue(oklch.h + hueShift)
    })
  })()

  // Auto-generate palette with debounce when inputColor changes
  useEffect(() => {
    const timer = setTimeout(() => {
      const generated = generatePalette(normalizedInputColor)
      if (generated) {
        setBasePalette(generated)
        setPalette(generated)
        setHueShift(0) // Reset to no shift
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
  const handleHueShiftChange = useCallback((sliderValue: number) => {
    setHueShift(sliderValue)
    if (basePalette) {
      // Slider value directly represents hue shift (0 to 360 degrees)
      const adjusted = adjustPaletteHue(basePalette, sliderValue)
      setPalette(adjusted)
    }
  }, [basePalette])

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

  // Handle copy original color (with hue adjustment)
  const handleCopyOriginalColor = useCallback(() => {
    const oklch = hexToOklch(normalizedInputColor)
    if (!oklch) return
    const adjustedHex = hueShift === 0
      ? normalizedInputColor
      : oklchToHex({
        l: oklch.l,
        c: oklch.c,
        h: normalizeHue(oklch.h + hueShift)
      })
    handleCopyColor(adjustedHex)
  }, [normalizedInputColor, hueShift, handleCopyColor])

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

      <div className='mx-auto max-w-screen-xl'>
        <h1 className='mb-4 text-3xl font-bold'>{tool?.name ?? 'TWパレットジェネレーター'}</h1>
        <p className='mb-8 text-gray-600 dark:text-gray-400'>
          好きな色からTailwind CSS風の50-950のシェードを持つカラーパレットを生成します。
        </p>

        {/* Two Column Layout */}
        <div className='flex flex-col gap-8 lg:flex-row'>
          {/* Left Column - Input */}
          <div className='lg:w-1/2'>
            <div className='space-y-6'>
              {/* HEX Input */}
              <div className='rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-atom-one-dark-light'>
                <h6 className='mb-4 text-sm font-semibold'>カラー入力</h6>
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
              </div>

              {/* Hue Adjustment */}
              <div className='rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-atom-one-dark-light'>
                <HueSlider
                  label='色相調整'
                  value={hueShift}
                  min={0}
                  max={360}
                  inputColor={normalizedInputColor}
                  onChange={handleHueShiftChange}
                />
              </div>

              {/* Tailwind Color Picker */}
              <div className='rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-atom-one-dark-light'>
                <h6 className='mb-4 text-sm font-semibold'>カラーパレットから選択</h6>
                {/* Shade Header */}
                <div className='mb-3 flex gap-1 md:ml-20'>
                  {getShades().map((shade) => (
                    <div
                      key={shade}
                      className='flex size-6 shrink-0 items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400 max-sm:-rotate-90 sm:size-10 md:size-12 lg:size-7 xl:size-9'
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
                      <div className='flex gap-1'>
                        {getShades().map((shade) => {
                          const hex = tailwindColors[colorName][shade]

                          return (
                            <button
                              key={shade}
                              onClick={() => handleTailwindColorSelect(colorName, shade)}
                              className='group relative size-6 shrink-0 rounded transition-transform hover:scale-110 focus:outline-none active:scale-95 sm:size-10 md:size-12 lg:size-7 xl:size-9'
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
                      <div className='flex gap-1'>
                        {getShades().map((shade) => {
                          const hex = tailwindColors[colorName][shade]

                          return (
                            <button
                              key={shade}
                              onClick={() => handleTailwindColorSelect(colorName, shade)}
                              className='group relative size-6 shrink-0 rounded transition-transform hover:scale-110 focus:outline-none active:scale-95 sm:size-10 md:size-12 lg:size-7 xl:size-9'
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
              </div>
            </div>
          </div>

          {/* Right Column - Output (Always visible) */}
          <div className='lg:w-1/2'>
            <div className='rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-atom-one-dark-light'>
              <div className='mb-4 flex items-center justify-between'>
                <h6 className='text-sm font-semibold'>生成されたパレット</h6>
                <Popover className='relative'>
                  {({ open }) => (
                    <>
                      <PopoverButton className='flex items-center gap-1 rounded px-2 py-1 text-xs font-medium uppercase outline-none transition-colors hover:bg-gray-100 dark:hover:bg-gray-800'>
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
                                className={`block w-full rounded px-3 py-1.5 text-left text-sm uppercase outline-none transition-colors hover:bg-gray-100 dark:hover:bg-atom-one-dark-lighter ${
                                  selectedFormat === format ? 'bg-sky-50 font-medium text-sky-600 dark:bg-sky-900/20 dark:text-sky-400' : ''
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
              </div>

              {palette
                ? (
                  <>
                    {/* Original Color (hue-adjusted) */}
                    <div className='mb-4 rounded-lg border border-gray-200 p-3 dark:border-gray-700'>
                      <div className='mb-2 text-sm font-medium text-gray-600 dark:text-gray-400'>
                        オリジナルカラー
                      </div>
                      <div className='flex items-center gap-3'>
                        <button
                          onClick={handleCopyOriginalColor}
                          className='h-12 w-12 flex-shrink-0 cursor-pointer rounded shadow-sm transition-transform hover:scale-110 active:scale-95'
                          style={{ backgroundColor: adjustedOriginalColor }}
                          title='クリックでコピー'
                        />
                        <div className='flex flex-1 items-center gap-4'>
                          <div className='font-mono text-sm font-semibold text-gray-900 dark:text-gray-100'>
                            {getFormattedColor(adjustedOriginalColor)}
                          </div>
                        </div>
                      </div>
                    </div>

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
                              className='h-10 w-10 flex-shrink-0 cursor-pointer rounded shadow-sm transition-transform hover:scale-110 active:scale-95'
                              style={{ backgroundColor: hex }}
                              title='クリックでコピー'
                            />

                            {/* Shade Label */}
                            <div className='w-12 font-mono text-sm font-semibold text-gray-700 dark:text-gray-300'>
                              {shade}
                            </div>

                            {/* Formatted Color Value */}
                            <div className='font-mono text-sm font-semibold text-gray-900 dark:text-gray-100'>
                              {getFormattedColor(hex)}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Tailwind Config Snippet */}
                    <div className='rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900'>
                      <div className='mb-2 flex items-center justify-between'>
                        <h3 className='text-sm font-semibold text-gray-700 dark:text-gray-300'>Tailwind Config</h3>
                        <button
                          onClick={handleCopyAsTailwind}
                          className='rounded-lg p-1 text-xs font-medium text-gray-800 transition-colors hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700'
                        >
                          <ClipboardDocumentIcon className='size-5' aria-label='コピー' />
                        </button>
                      </div>
                      <pre className='overflow-x-auto rounded bg-white p-3 font-mono text-xs text-gray-800 dark:bg-gray-950 dark:text-gray-200'>
                        {`colors: {
  custom: {
${getShadeLabels().map(shade => `    ${shade}: '${palette[shade]}',`).join('\n')}
  }
}`}
                      </pre>
                    </div>
                  </>
                  )
                : (
                  <div className='flex h-96 items-center justify-center text-sky-500 dark:text-sky-400'>
                    <CircleSpinner className='h-8 w-8' />
                  </div>
                  )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
