'use client'

import { ArrowPathIcon } from '@heroicons/react/24/outline'
import type { ChangeEvent } from 'react'
import { useMemo } from 'react'

import { hexToLch, lchToHex, normalizeHue } from '@/lib/color/color-utils'

export type HueSliderProps = {
  label?: string
  value: number
  min: number
  max: number
  inputColor: string // Input color as hex
  onChange: (value: number) => void
  onReset?: () => void
  className?: string
}

export function HueSlider ({
  label,
  value,
  min,
  max,
  inputColor,
  onChange,
  onReset,
  className = ''
}: HueSliderProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value))
  }

  const handleReset = () => {
    if (onReset) {
      onReset()
    } else {
      onChange(0)
    }
  }

  const thumbBg = '#fff'

  // Generate gradient using actual color adjustment logic
  // This ensures the gradient matches the actual palette output
  const gradientBackground = useMemo(() => {
    const lch = hexToLch(inputColor)
    if (!lch) return 'linear-gradient(to right, #888, #888)'

    const stops = []

    // Create 13 color stops evenly distributed
    for (let i = 0; i <= 12; i++) {
      // Calculate the position percentage (0% to 100%)
      const position = (i / 12) * 100

      // Calculate the hue shift at this position
      // Position 0% (left edge) = no shift (0°)
      // Position 50% (center) = +180° shift
      // Position 100% (right edge) = +360° shift (full rotation)
      const hueShift = (position / 100) * 360

      // Apply hue shift to the original color
      const shiftedLch = {
        l: lch.l,
        c: lch.c,
        h: normalizeHue(lch.h + hueShift)
      }

      const hexColor = lchToHex(shiftedLch)
      stops.push(`${hexColor} ${position}%`)
    }

    return `linear-gradient(to right, ${stops.join(', ')})`
  }, [inputColor])

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
        <div className='mb-2 flex items-center justify-between'>
          <label className='text-sm font-medium'>
            {label}
          </label>
          <button
            onClick={handleReset}
            className='rounded p-1 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200'
            aria-label='リセット'
          >
            <ArrowPathIcon className='size-4' />
          </button>
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
          aria-label={label || '色相を調整'}
        />
      </div>
    </div>
  )
}
