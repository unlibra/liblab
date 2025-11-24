import { Field, Label, Switch } from '@headlessui/react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid'
import { useCallback } from 'react'

import { Slider } from '@/components/ui/slider'
import type { PresetId, SvgoOptions } from '@/lib/image/svgo-optimizer'
import { PRESETS } from '@/lib/image/svgo-optimizer'

import { PLUGIN_DESCRIPTIONS, PLUGIN_GROUPS } from './svgo-options'

type SvgOptionsPanelProps = {
  options: SvgoOptions
  onOptionsChange: (options: SvgoOptions) => void
  selectedPreset: PresetId | null
  onPresetChange: (presetId: PresetId) => void
}

export function SvgOptionsPanel ({ options, onOptionsChange, selectedPreset, onPresetChange }: SvgOptionsPanelProps) {
  const handleToggle = useCallback((key: keyof SvgoOptions) => {
    onOptionsChange({
      ...options,
      [key]: !options[key]
    })
  }, [options, onOptionsChange])

  const handleSliderChange = useCallback((key: keyof SvgoOptions, value: number) => {
    onOptionsChange({
      ...options,
      [key]: value
    })
  }, [options, onOptionsChange])

  const handleFloatPrecisionChange = useCallback((value: number) => {
    handleSliderChange('floatPrecision', value)
  }, [handleSliderChange])

  const handleTransformPrecisionChange = useCallback((value: number) => {
    handleSliderChange('transformPrecision', value)
  }, [handleSliderChange])

  return (
    <div className='space-y-6'>
      {/* Preset Selection */}
      <div>
        <div className='mb-3'>
          <span className='block text-sm font-semibold'>
            プリセット
          </span>
        </div>
        <div className='flex flex-wrap gap-2'>
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onPresetChange(preset.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 ${
                selectedPreset === preset.id
                  ? 'bg-sky-500 text-white hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-500'
                  : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
              }`}
              aria-label={`${preset.label}を選択`}
              aria-pressed={selectedPreset === preset.id}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Numeric Options */}
      <div>
        <div className='mb-3'>
          <span className='block text-sm font-semibold'>
            精度設定
          </span>
          <p className='mt-1 text-xs text-gray-600 dark:text-gray-400'>
            数値の精度を調整します。値が低いほど圧縮率が高くなりますが、精度が低下します。
          </p>
        </div>

        <div className='space-y-4'>
          <Slider
            label={PLUGIN_DESCRIPTIONS.floatPrecision}
            value={options.floatPrecision}
            min={0}
            max={10}
            onChange={handleFloatPrecisionChange}
          />
          <Slider
            label={PLUGIN_DESCRIPTIONS.transformPrecision}
            value={options.transformPrecision}
            min={0}
            max={10}
            onChange={handleTransformPrecisionChange}
          />
        </div>
      </div>

      {/* Plugin Groups */}
      {PLUGIN_GROUPS.map((group) => {
        const isDangerous = group.id === 'dangerous'

        return (
          <div key={group.id}>
            <div className='border-t border-gray-200 dark:border-gray-700' />

            <div className={`mt-6 ${isDangerous ? 'rounded-lg border border-amber-500 bg-amber-50 p-4 dark:border-amber-600 dark:bg-amber-950/30' : ''}`}>
              <div className='mb-3'>
                <span className='flex items-center gap-2 text-sm font-medium'>
                  {isDangerous && (
                    <ExclamationTriangleIcon className='size-5 shrink-0' />
                  )}
                  {group.label}
                </span>
                {group.description && (
                  <p className='mt-1 text-xs font-medium text-gray-600 dark:text-gray-400'>
                    {group.description}
                  </p>
                )}
              </div>

              <div className='space-y-3'>
                {group.plugins.map((key) => (
                  <Field key={key} as='div' className='flex items-center justify-between gap-4'>
                    <Label className='flex-1 cursor-pointer text-sm'>
                      {PLUGIN_DESCRIPTIONS[key]}
                    </Label>
                    <Switch
                      checked={options[key] as boolean}
                      onChange={() => handleToggle(key)}
                      className={`${
                        options[key]
                          ? isDangerous
                            ? 'bg-amber-500 dark:bg-amber-600'
                            : 'bg-sky-500 dark:bg-sky-600'
                          : 'bg-gray-300 dark:bg-gray-600'
                      } relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-atom-one-dark`}
                    >
                      <span
                        aria-hidden='true'
                        className={`${
                          options[key] ? 'translate-x-4' : 'translate-x-0'
                        } pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
                      />
                    </Switch>
                  </Field>
                ))}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
