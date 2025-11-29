import { Slider } from '@/components/ui/slider'
import { TogglePill } from '@/components/ui/toggle-pill'
import type { FaviconSize } from '@/lib/generators/favicon'
import { AVAILABLE_SIZES } from '@/lib/generators/favicon'
import { useTranslations } from '@/lib/i18n/client'

import type { OutputSetId } from '../_lib/favicon-presets'
import { DEFAULT_SIZES, OUTPUT_SETS } from '../_lib/favicon-presets'

export interface FaviconOptionsPanelProps {
  selectedSets: Set<OutputSetId>
  selectedSizes: Set<FaviconSize>
  borderRadius: number
  backgroundColor: string
  useBackground: boolean
  onSetToggle: (setId: OutputSetId) => void
  onSizeToggle: (size: FaviconSize) => void
  onBorderRadiusChange: (value: number) => void
  onBackgroundColorChange: (color: string) => void
  onUseBackgroundChange: (use: boolean) => void
  checkboxIdSuffix?: string
}

export function FaviconOptionsPanel ({
  selectedSets,
  selectedSizes,
  borderRadius,
  backgroundColor,
  useBackground,
  onSetToggle,
  onSizeToggle,
  onBorderRadiusChange,
  onBackgroundColorChange,
  onUseBackgroundChange,
  checkboxIdSuffix = ''
}: FaviconOptionsPanelProps) {
  const t = useTranslations()
  const checkboxId = `use-background${checkboxIdSuffix}`

  return (
    <div className='space-y-6'>
      {/* Format Selection */}
      <div>
        <div className='mb-3'>
          <span className='block text-sm font-semibold'>
            {t('faviconGenerator.fileFormat')}
          </span>
        </div>
        <div className='flex flex-wrap gap-2'>
          {OUTPUT_SETS.map((outputSet) => (
            <TogglePill
              key={outputSet.id}
              pressed={selectedSets.has(outputSet.id)}
              onClick={() => onSetToggle(outputSet.id)}
              ariaLabel={`${selectedSets.has(outputSet.id) ? 'Deselect' : 'Select'} ${outputSet.label}`}
            >
              {outputSet.label}
            </TogglePill>
          ))}
        </div>
        <div className='mt-4 text-xs text-gray-600 dark:text-gray-400'>
          {OUTPUT_SETS.map((set) => (
            <div key={set.id}>
              <strong>{set.label}:</strong> {t(`faviconGenerator.formatDescriptions.${set.id}`)}
            </div>
          ))}
        </div>
      </div>

      <div className='border-t border-gray-200 dark:border-gray-700' />

      {/* Size Selection - Only show if favicon is selected */}
      {selectedSets.has('favicon') && (
        <>
          <div>
            <div className='mb-3'>
              <span className='block text-sm font-semibold'>
                {t('faviconGenerator.faviconSizes')}
              </span>
            </div>

            <div className='space-y-4'>
              {/* 推奨サイズ */}
              <div>
                <div className='mb-2 text-xs font-medium text-gray-700 dark:text-gray-300'>
                  {t('faviconGenerator.recommendedSizes')}
                </div>
                <div className='flex flex-wrap gap-2'>
                  {DEFAULT_SIZES.map((size) => (
                    <TogglePill
                      key={size}
                      pressed={selectedSizes.has(size)}
                      onClick={() => onSizeToggle(size)}
                      ariaLabel={`${selectedSizes.has(size) ? 'Deselect' : 'Select'} ${size}x${size}`}
                    >
                      {size}×{size}
                    </TogglePill>
                  ))}
                </div>
              </div>

              {/* 追加サイズ */}
              <div>
                <div className='mb-2 text-xs font-medium text-gray-600 dark:text-gray-400'>
                  {t('faviconGenerator.otherSizes')}
                </div>
                <div className='flex flex-wrap gap-2'>
                  {AVAILABLE_SIZES.filter(s => !DEFAULT_SIZES.includes(s)).map((size) => (
                    <TogglePill
                      key={size}
                      pressed={selectedSizes.has(size)}
                      onClick={() => onSizeToggle(size)}
                      ariaLabel={`${selectedSizes.has(size) ? 'Deselect' : 'Select'} ${size}x${size}`}
                    >
                      {size}×{size}
                    </TogglePill>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className='border-t border-gray-200 dark:border-gray-700' />
        </>
      )}

      {/* Border Radius */}
      <div>
        <div className='mb-3'>
          <span className='block text-sm font-semibold'>
            {t('faviconGenerator.borderRadius')}
          </span>
          <p className='mt-1 text-xs text-gray-600 dark:text-gray-400'>
            {t('faviconGenerator.borderRadiusHint')}
          </p>
        </div>
        <Slider
          label=''
          value={borderRadius}
          min={0}
          max={100}
          unit='%'
          onChange={onBorderRadiusChange}
          description=''
        />
      </div>

      <div className='border-t border-gray-200 dark:border-gray-700' />

      {/* Background Color */}
      <div>
        <div className='mb-3'>
          <span className='block text-sm font-semibold'>
            {t('faviconGenerator.backgroundColorSetting')}
          </span>
          <p className='mt-1 text-xs text-gray-600 dark:text-gray-400'>
            {t('faviconGenerator.backgroundColorHint')}
          </p>
        </div>
        <div className='space-y-3'>
          <div className='flex items-center gap-2'>
            <input
              type='checkbox'
              id={checkboxId}
              checked={useBackground}
              onChange={(e) => onUseBackgroundChange(e.target.checked)}
              className='size-4 accent-sky-600 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500'
            />
            <label htmlFor={checkboxId} className='text-sm font-medium'>
              {t('faviconGenerator.addBackgroundColor')}
            </label>
          </div>
          <div className='flex items-center gap-3'>
            <input
              type='color'
              value={backgroundColor}
              onChange={(e) => onBackgroundColorChange(e.target.value)}
              disabled={!useBackground}
              className='size-10 cursor-pointer bg-transparent outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-sky-500 disabled:cursor-default disabled:opacity-20'
              aria-label={t('faviconGenerator.selectBackgroundColor')}
            />
            <input
              type='text'
              name='hex-input'
              value={backgroundColor}
              onChange={(e) => onBackgroundColorChange(e.target.value)}
              disabled={!useBackground}
              placeholder='#000000'
              className='flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 font-mono outline-none transition-colors focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-sky-500 disabled:opacity-40 dark:border-gray-600 dark:bg-atom-one-dark-light'
              aria-label={t('faviconGenerator.backgroundColorCode')}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
