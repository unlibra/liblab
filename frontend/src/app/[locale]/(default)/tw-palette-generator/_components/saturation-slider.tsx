import type { ChangeEvent } from 'react'
import { useCallback, useMemo } from 'react'

import { hexToOklch, oklchToHex } from '@/lib/utils/color'

export type SaturationSliderProps = {
  label?: string
  value: number
  min?: number
  max?: number
  inputColor: string // Input color as hex to determine hue
  onChange: (value: number) => void
  className?: string
}

export function SaturationSlider ({
  label,
  value,
  min = 0,
  max = 50,
  inputColor,
  onChange,
  className = ''
}: SaturationSliderProps) {
  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value))
  }, [onChange])

  const thumbBg = '#fff'

  // Generate gradient from gray to saturated color based on input color's hue
  const gradientBackground = useMemo(() => {
    const oklch = hexToOklch(inputColor)
    if (!oklch) return 'linear-gradient(to right, #888, #888)'

    // Use middle lightness for the gradient
    const midLightness = 55

    // Create stops from 0 saturation (gray) to max saturation
    const stops = []
    const numStops = 5

    for (let i = 0; i <= numStops; i++) {
      const position = (i / numStops) * 100
      const chroma = (position / 100) * max

      const hex = oklchToHex({
        l: midLightness,
        c: chroma,
        h: oklch.h
      })

      stops.push(`${hex} ${position}%`)
    }

    return `linear-gradient(to right, ${stops.join(', ')})`
  }, [inputColor, max])

  return (
    <div className={`space-y-2 ${className}`}>
      <style jsx>{`
        input[type="range"] {
          height: 8px;
          padding: 0;
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: ${thumbBg};
          border: 2px solid rgb(100, 116, 139);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          cursor: pointer;
        }

        input[type="range"]:focus-visible::-webkit-slider-thumb {
          box-shadow: 0 0 0 4px rgba(100, 116, 139, 0.3);
        }

        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border: 2px solid rgb(100, 116, 139);
          border-radius: 50%;
          background: ${thumbBg};
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          cursor: pointer;
        }

        input[type="range"]:focus-visible::-moz-range-thumb {
          box-shadow: 0 0 0 4px rgba(100, 116, 139, 0.3);
        }
      `}
      </style>
      {label && (
        <div className='flex items-center justify-between'>
          <label className='text-sm font-medium'>
            {label}
          </label>
          <span className='text-sm text-gray-600 dark:text-gray-400'>
            {value}
          </span>
        </div>
      )}
      <div className='relative'>
        <input
          type='range'
          min={min}
          max={max}
          value={value}
          onChange={handleChange}
          style={{
            background: gradientBackground
          }}
          className='h-2 w-full cursor-pointer appearance-none rounded-full outline-none'
          aria-label={label || '彩度を調整'}
        />
      </div>
    </div>
  )
}
