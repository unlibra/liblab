import { Slider } from '@/components/slider'
import type { FaviconSize, OutputSetId } from '@/lib/favicon-generator'
import { AVAILABLE_SIZES, DEFAULT_SIZES, OUTPUT_SETS } from '@/lib/favicon-generator'

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
  const checkboxId = `use-background${checkboxIdSuffix}`

  return (
    <div className='space-y-6'>
      {/* Format Selection */}
      <div>
        <div className='mb-3'>
          <span className='block text-sm font-semibold'>
            ファイル形式
          </span>
        </div>
        <div className='flex flex-wrap gap-2'>
          {OUTPUT_SETS.map((outputSet) => (
            <button
              key={outputSet.id}
              onClick={() => onSetToggle(outputSet.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 ${selectedSets.has(outputSet.id)
                ? 'bg-sky-500 text-white hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-500'
                : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
                }`}
              aria-label={`${outputSet.label}を${selectedSets.has(outputSet.id) ? '選択解除' : '選択'}`}
              aria-pressed={selectedSets.has(outputSet.id)}
            >
              {outputSet.label}
            </button>
          ))}
        </div>
        <div className='mt-4 text-xs text-gray-600 dark:text-gray-400'>
          {OUTPUT_SETS.map((set) => (
            <div key={set.id}>
              <strong>{set.label}:</strong> {set.description}
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
                favicon.icoに含めるサイズ
              </span>
            </div>

            <div className='space-y-4'>
              {/* 推奨サイズ */}
              <div>
                <div className='mb-2 text-xs font-medium text-gray-700 dark:text-gray-300'>
                  推奨サイズ
                </div>
                <div className='flex flex-wrap gap-2'>
                  {DEFAULT_SIZES.map((size) => (
                    <button
                      key={size}
                      onClick={() => onSizeToggle(size)}
                      className={`rounded-full px-4 py-2 text-sm font-medium outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 ${selectedSizes.has(size)
                        ? 'bg-sky-500 text-white hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-500'
                        : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
                        }`}
                      aria-label={`${size}×${size}ピクセルを${selectedSizes.has(size) ? '選択解除' : '選択'}`}
                      aria-pressed={selectedSizes.has(size)}
                    >
                      {size}×{size}
                    </button>
                  ))}
                </div>
              </div>

              {/* 追加サイズ */}
              <div>
                <div className='mb-2 text-xs font-medium text-gray-600 dark:text-gray-400'>
                  その他サイズ
                </div>
                <div className='flex flex-wrap gap-2'>
                  {AVAILABLE_SIZES.filter(s => !DEFAULT_SIZES.includes(s)).map((size) => (
                    <button
                      key={size}
                      onClick={() => onSizeToggle(size)}
                      className={`rounded-full px-4 py-2 text-sm font-medium outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 ${selectedSizes.has(size)
                        ? 'bg-sky-500 text-white dark:bg-sky-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                        }`}
                      aria-label={`${size}×${size}ピクセルを${selectedSizes.has(size) ? '選択解除' : '選択'}`}
                      aria-pressed={selectedSizes.has(size)}
                    >
                      {size}×{size}
                    </button>
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
            角丸の調整
          </span>
          <p className='mt-1 text-xs text-gray-600 dark:text-gray-400'>
            アイコンの角を丸くします。Apple Touch IconはiOSが自動的に角丸にします。
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
            背景色の設定
          </span>
          <p className='mt-1 text-xs text-gray-600 dark:text-gray-400'>
            透過PNGに背景色を追加します。Apple Touch Iconは常に背景色が適用されます。
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
              背景色を追加する
            </label>
          </div>
          {useBackground && (
            <div className='flex items-center gap-3'>
              <input
                type='color'
                value={backgroundColor}
                onChange={(e) => onBackgroundColorChange(e.target.value)}
                className='h-10 w-20 cursor-pointer bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-sky-500'
                aria-label='背景色を選択'
              />
              <input
                type='text'
                value={backgroundColor}
                onChange={(e) => onBackgroundColorChange(e.target.value)}
                placeholder='#ffffff'
                className='flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition-colors focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-gray-600 dark:bg-atom-one-dark-light'
                aria-label='背景色のカラーコード'
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
