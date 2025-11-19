'use client'

import { useState } from 'react'

import { Breadcrumb } from '@/components/ui/breadcrumb'
import { getToolById } from '@/config/tools'
import { hexToRgb } from '@/lib/color/color-utils'
import type { ColorPalette } from '@/lib/color/palette-generator'
import { adjustPaletteHue, generatePalette, getShadeLabels } from '@/lib/color/palette-generator'
import type { TailwindColorName, TailwindShade } from '@/lib/color/tailwind-colors'
import { getColorNames, getShades, tailwindColors } from '@/lib/color/tailwind-colors'

export default function TailwindPaletteGeneratorPage () {
  const tool = getToolById('tw-palette-generator')
  // State
  const [inputColor, setInputColor] = useState('#3b82f6') // Default: Tailwind blue-500
  const [palette, setPalette] = useState<ColorPalette | null>(null)
  const [hueShift, setHueShift] = useState(0)
  const [basePalette, setBasePalette] = useState<ColorPalette | null>(null)

  // Generate palette from input
  const handleGenerate = () => {
    const generated = generatePalette(inputColor)
    if (generated) {
      setBasePalette(generated)
      setPalette(generated)
      setHueShift(0)
    }
  }

  // Select Tailwind color
  const handleTailwindColorSelect = (name: TailwindColorName, shade: TailwindShade) => {
    const hex = tailwindColors[name][shade]
    setInputColor(hex)

    // Auto-generate
    const generated = generatePalette(hex)
    if (generated) {
      setBasePalette(generated)
      setPalette(generated)
      setHueShift(0)
    }
  }

  // Adjust hue
  const handleHueShiftChange = (shift: number) => {
    setHueShift(shift)
    if (basePalette) {
      const adjusted = adjustPaletteHue(basePalette, shift)
      setPalette(adjusted)
    }
  }

  // Copy color to clipboard
  const handleCopyColor = async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex)
      // TODO: Show toast notification
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <>
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: tool?.name ?? 'TWパレットジェネレーター' }
        ]}
      />

      <div className='mx-auto max-w-screen-lg'>
        <h1 className='mb-4 text-3xl font-bold'>{tool?.name ?? 'TWパレットジェネレーター'}</h1>
        <p className='mb-8 text-gray-600 dark:text-gray-400'>
          好きな色からTailwind CSS風の50-950のシェードを持つカラーパレットを生成します。
        </p>

        <div className='space-y-8'>
          {/* Color Input Section */}
          <div className='rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-atom-one-dark-light'>
            <h2 className='mb-4 text-lg font-semibold'>カラー入力</h2>

            <div className='space-y-4'>
              {/* HEX Input */}
              <div>
                <label className='mb-2 block text-sm font-medium'>HEXカラーコード</label>
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
                  <button
                    onClick={handleGenerate}
                    className='rounded-full bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 focus:outline-none dark:bg-blue-700 dark:hover:bg-blue-600'
                  >
                    生成
                  </button>
                </div>
              </div>

              {/* Tailwind Color Picker */}
              <div>
                <label className='mb-2 block text-sm font-medium'>またはTailwindカラーを選択</label>
                <div className='max-h-96 overflow-y-auto rounded-lg border border-gray-200 p-4 dark:border-gray-700'>
                  <div className='space-y-3'>
                    {getColorNames().map((colorName) => (
                      <div key={colorName}>
                        <div className='mb-1 text-xs font-medium text-gray-600 dark:text-gray-400'>
                          {colorName}
                        </div>
                        <div className='flex flex-wrap gap-1'>
                          {getShades().map((shade) => {
                            const hex = tailwindColors[colorName][shade]

                            return (
                              <button
                                key={shade}
                                onClick={() => handleTailwindColorSelect(colorName, shade)}
                                className='group relative h-10 w-10 rounded transition-transform hover:scale-110 focus:outline-none'
                                style={{ backgroundColor: hex }}
                                title={`${colorName}-${shade}\n${hex}`}
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
          </div>

          {/* Generated Palette */}
          {palette && (
            <div className='rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-atom-one-dark-light'>
              <h2 className='mb-4 text-lg font-semibold'>生成されたパレット</h2>

              {/* Hue Adjustment */}
              <div className='mb-6'>
                <label className='mb-2 block text-sm font-medium'>
                  色相調整: {hueShift > 0 ? '+' : ''}{hueShift}°
                </label>
                <input
                  type='range'
                  min='-180'
                  max='180'
                  value={hueShift}
                  onChange={(e) => handleHueShiftChange(Number(e.target.value))}
                  className='w-full'
                />
                <div className='mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400'>
                  <span>-180°</span>
                  <span>0°</span>
                  <span>+180°</span>
                </div>
              </div>

              {/* Color Swatches */}
              <div className='space-y-2'>
                {getShadeLabels().map((shade) => {
                  const hex = palette[shade]
                  const rgb = hexToRgb(hex)

                  return (
                    <div
                      key={shade}
                      className='group flex items-center gap-4 rounded-lg border border-gray-200 p-3 transition-colors hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                    >
                      {/* Color Preview */}
                      <div
                        className='h-12 w-12 flex-shrink-0 rounded shadow-sm'
                        style={{ backgroundColor: hex }}
                      />

                      {/* Shade Label */}
                      <div className='min-w-[3rem] font-mono text-sm font-semibold text-gray-700 dark:text-gray-300'>
                        {shade}
                      </div>

                      {/* HEX Code */}
                      <div className='flex-1'>
                        <div className='font-mono text-sm font-medium text-gray-900 dark:text-gray-100'>
                          {hex.toUpperCase()}
                        </div>
                        {rgb && (
                          <div className='text-xs text-gray-500 dark:text-gray-400'>
                            rgb({rgb.r}, {rgb.g}, {rgb.b})
                          </div>
                        )}
                      </div>

                      {/* Copy Button */}
                      <button
                        onClick={() => handleCopyColor(hex)}
                        className='rounded bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 opacity-0 transition-opacity hover:bg-gray-200 group-hover:opacity-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                      >
                        Copy
                      </button>
                    </div>
                  )
                })}
              </div>

              {/* Export Options */}
              <div className='mt-6 flex gap-3'>
                <button
                  onClick={() => {
                    const cssVars = getShadeLabels()
                      .map(shade => `  --color-${shade}: ${palette[shade]};`)
                      .join('\n')
                    navigator.clipboard.writeText(`:root {\n${cssVars}\n}`)
                  }}
                  className='rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                >
                  Copy as CSS Variables
                </button>
                <button
                  onClick={() => {
                    const tailwindConfig = `colors: {\n  custom: {\n${getShadeLabels()
                      .map(shade => `    ${shade}: '${palette[shade]}',`)
                      .join('\n')}\n  }\n}`
                    navigator.clipboard.writeText(tailwindConfig)
                  }}
                  className='rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                >
                  Copy as Tailwind Config
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
