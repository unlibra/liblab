import type { ChangeEvent } from 'react'
import { useCallback, useMemo } from 'react'

import { hexToOklch } from '@/lib/color/color-utils'
import { getColorNames, tailwindColors } from '@/lib/color/tailwind-colors'

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
  className = ''
}: HueSliderProps) {
  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value))
  }, [onChange])

  const thumbBg = '#fff'

  // Generate gradient using Tailwind colors for visual consistency
  // Shows absolute hue values from 0° to 360°
  const gradientBackground = useMemo(() => {
    // Get all chromatic Tailwind colors with their hues
    const colorNames = getColorNames().filter(name =>
      !['slate', 'gray', 'zinc', 'neutral', 'stone'].includes(name)
    )

    const colorHues = colorNames.map(name => {
      const hex = tailwindColors[name][500]
      const colorOklch = hexToOklch(hex)
      return {
        name,
        hue: colorOklch?.h ?? 0,
        hex
      }
    })

    const stops = []

    // Create 13 color stops evenly distributed from 0° to 360°
    for (let i = 0; i <= 12; i++) {
      // Calculate the position percentage (0% to 100%)
      const position = (i / 12) * 100

      // Calculate absolute hue at this position (0° to 360°)
      const targetHue = (position / 100) * 360

      // Find the closest Tailwind color by hue
      let closestColor = colorHues[0]
      let minDistance = Math.abs(targetHue - colorHues[0].hue)

      for (const color of colorHues) {
        // Calculate hue distance (accounting for circular nature of hue)
        const distance1 = Math.abs(targetHue - color.hue)
        const distance2 = 360 - distance1
        const distance = Math.min(distance1, distance2)

        if (distance < minDistance) {
          minDistance = distance
          closestColor = color
        }
      }

      stops.push(`${closestColor.hex} ${position}%`)
    }

    return `linear-gradient(to right, ${stops.join(', ')})`
  }, [])

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
            {value}°
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
          aria-label={label || '色相を調整'}
        />
      </div>
    </div>
  )
}
