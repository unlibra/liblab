'use client'

import { ClipboardDocumentIcon } from '@heroicons/react/24/outline'
import { useCallback, useEffect, useState } from 'react'

import { Breadcrumb } from '@/components/ui/breadcrumb'
import { HueSlider } from '@/components/ui/hue-slider'
import { CircleSpinner } from '@/components/ui/spinner'
import { useToast } from '@/components/ui/toast'
import { getToolById } from '@/config/tools'
import { hexToCmyk, hexToHsl, hexToOklch, hexToRgb, normalizeHue, oklchToHex } from '@/lib/color/color-utils'
import type { ColorPalette } from '@/lib/color/palette-generator'
import { adjustPaletteHue, generatePalette, getShadeLabels } from '@/lib/color/palette-generator'
import type { TailwindColorName, TailwindShade } from '@/lib/color/tailwind-colors'
import { getColorNames, getShades, isGrayScale, tailwindColors } from '@/lib/color/tailwind-colors'

export default function TailwindPaletteGeneratorPage () {
  const tool = getToolById('tw-palette-generator')
  const toast = useToast()

  // State
  const [inputColor, setInputColor] = useState('#3b82f6') // Default: Tailwind blue-500
  const [palette, setPalette] = useState<ColorPalette | null>(null)
  const [hueShift, setHueShift] = useState(0) // 0 = no shift
  const [basePalette, setBasePalette] = useState<ColorPalette | null>(null)

  // Auto-generate palette with debounce when inputColor changes
  useEffect(() => {
    const timer = setTimeout(() => {
      const generated = generatePalette(inputColor)
      if (generated) {
        setBasePalette(generated)
        setPalette(generated)
        setHueShift(0) // Reset to no shift
      }
    }, 100) // 100ms debounce (optimized for responsive UX)

    return () => clearTimeout(timer)
  }, [inputColor])

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

  // Copy color to clipboard
  const handleCopyColor = useCallback(async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex.toUpperCase())
      toast.success('クリップボードにコピーしました')
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
                <h2 className='mb-4 text-lg font-semibold'>カラー入力</h2>
                <div className='flex gap-3'>
                  <input
                    type='color'
                    value={inputColor}
                    onChange={(e) => setInputColor(e.target.value)}
                    className='h-12 w-20 cursor-pointer rounded border border-gray-300 focus:outline-none dark:border-gray-600'
                  />
                  <input
                    type='text'
                    value={inputColor}
                    onChange={(e) => setInputColor(e.target.value)}
                    placeholder='#3b82f6'
                    className='flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 font-mono text-sm focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200'
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
                  inputColor={inputColor}
                  onChange={handleHueShiftChange}
                />
              </div>

              {/* Tailwind Color Picker */}
              <div className='rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-atom-one-dark-light'>
                <h2 className='mb-4 text-lg font-semibold'>カラーパレットから選択</h2>
                {/* Header Row */}
                <div className='mb-3 flex items-center gap-1'>
                  <div className='w-20 shrink-0 text-xs font-medium text-gray-600 dark:text-gray-400'>
                    {/* Color name placeholder */}
                  </div>
                  {getShades().map((shade) => (
                    <div
                      key={shade}
                      className='flex size-9 shrink-0 items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400'
                    >
                      {shade}
                    </div>
                  ))}
                </div>

                {/* Chromatic Colors */}
                <div className='space-y-3'>
                  {getColorNames().filter(name => !isGrayScale(name)).map((colorName) => (
                    <div key={colorName} className='flex items-center gap-1'>
                      <div className='w-20 shrink-0 text-xs font-medium text-gray-600 dark:text-gray-400'>
                        {colorName}
                      </div>
                      <div className='flex gap-1'>
                        {getShades().map((shade) => {
                          const hex = tailwindColors[colorName][shade]

                          return (
                            <button
                              key={shade}
                              onClick={() => handleTailwindColorSelect(colorName, shade)}
                              className='group relative size-9 shrink-0 rounded transition-transform hover:scale-110 focus:outline-none'
                              style={{ backgroundColor: hex }}
                              title='クリックで選択'
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
                    <div key={colorName} className='flex items-center gap-1'>
                      <div className='w-20 shrink-0 text-xs font-medium text-gray-600 dark:text-gray-400'>
                        {colorName}
                      </div>
                      <div className='flex gap-1'>
                        {getShades().map((shade) => {
                          const hex = tailwindColors[colorName][shade]

                          return (
                            <button
                              key={shade}
                              onClick={() => handleTailwindColorSelect(colorName, shade)}
                              className='group relative size-9 shrink-0 rounded transition-transform hover:scale-110 focus:outline-none'
                              style={{ backgroundColor: hex }}
                              title='クリックで選択'
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
              <h2 className='mb-4 text-lg font-semibold'>生成されたパレット</h2>

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
                          onClick={() => {
                            const oklch = hexToOklch(inputColor)
                            if (!oklch) return
                            const adjustedHex = hueShift === 0
                              ? inputColor
                              : oklchToHex({
                                l: oklch.l,
                                c: oklch.c,
                                h: normalizeHue(oklch.h + hueShift)
                              })
                            handleCopyColor(adjustedHex)
                          }}
                          className='h-12 w-12 flex-shrink-0 cursor-pointer rounded shadow-sm transition-transform hover:scale-110'
                          style={{
                            backgroundColor: (() => {
                              const oklch = hexToOklch(inputColor)
                              if (!oklch || hueShift === 0) return inputColor
                              return oklchToHex({
                                l: oklch.l,
                                c: oklch.c,
                                h: normalizeHue(oklch.h + hueShift)
                              })
                            })()
                          }}
                          title='クリックでコピー'
                        />
                        <div className='flex flex-1 items-center gap-4'>
                          {(() => {
                            const oklch = hexToOklch(inputColor)
                            if (!oklch) return null
                            const adjustedHex = hueShift === 0
                              ? inputColor
                              : oklchToHex({
                                l: oklch.l,
                                c: oklch.c,
                                h: normalizeHue(oklch.h + hueShift)
                              })
                            const rgb = hexToRgb(adjustedHex)
                            const hsl = hexToHsl(adjustedHex)
                            const cmyk = hexToCmyk(adjustedHex)

                            return (
                              <>
                                <div className='font-mono text-sm font-semibold text-gray-900 dark:text-gray-100'>
                                  {adjustedHex.toUpperCase()}
                                </div>
                                <div className='flex-1 space-y-0 text-xs leading-tight text-gray-500 dark:text-gray-500'>
                                  {rgb && (
                                    <div className='font-mono'>
                                      rgb({rgb.r}, {rgb.g}, {rgb.b})
                                    </div>
                                  )}
                                  {hsl && (
                                    <div className='font-mono'>
                                      hsl({hsl.h}°, {hsl.s}%, {hsl.l}%)
                                    </div>
                                  )}
                                  {cmyk && (
                                    <div className='font-mono'>
                                      cmyk({cmyk.c}%, {cmyk.m}%, {cmyk.y}%, {cmyk.k}%)
                                    </div>
                                  )}
                                </div>
                              </>
                            )
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Color Swatches */}
                    <div className='mb-4 space-y-1'>
                      {getShadeLabels().map((shade) => {
                        const hex = palette[shade]
                        const rgb = hexToRgb(hex)
                        const hsl = hexToHsl(hex)
                        const cmyk = hexToCmyk(hex)

                        return (
                          <div
                            key={shade}
                            className='flex items-center gap-2 rounded px-1 py-1'
                          >
                            {/* Color Preview */}
                            <button
                              onClick={() => handleCopyColor(hex)}
                              className='h-10 w-10 flex-shrink-0 cursor-pointer rounded shadow-sm transition-transform hover:scale-110'
                              style={{ backgroundColor: hex }}
                              title='クリックでコピー'
                            />

                            {/* Shade Label */}
                            <div className='w-12 font-mono text-sm font-semibold text-gray-700 dark:text-gray-300'>
                              {shade}
                            </div>

                            {/* HEX Value */}
                            <div className='font-mono text-sm font-semibold text-gray-900 dark:text-gray-100'>
                              {hex.toUpperCase()}
                            </div>

                            {/* Other Color Spaces */}
                            <div className='ml-auto space-y-0 text-xs leading-tight text-gray-500 dark:text-gray-500'>
                              {rgb && (
                                <div className='font-mono'>
                                  rgb({rgb.r}, {rgb.g}, {rgb.b})
                                </div>
                              )}
                              {hsl && (
                                <div className='font-mono'>
                                  hsl({hsl.h}°, {hsl.s}%, {hsl.l}%)
                                </div>
                              )}
                              {cmyk && (
                                <div className='font-mono'>
                                  cmyk({cmyk.c}%, {cmyk.m}%, {cmyk.k}%)
                                </div>
                              )}
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
