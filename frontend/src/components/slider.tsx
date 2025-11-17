import type { ChangeEvent } from 'react'
import { useEffect, useState } from 'react'

export type SliderProps = {
  label?: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  onChange: (value: number) => void
  description?: string
  className?: string
}

export function Slider ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
  description,
  className = ''
}: SliderProps) {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Check initial dark mode
    setIsDark(document.documentElement.classList.contains('dark'))

    // Watch for dark mode changes
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'))
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    return () => observer.disconnect()
  }, [])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value))
  }

  const percentage = ((value - min) / (max - min)) * 100

  const trackColor = isDark ? 'rgb(75, 85, 99)' : 'rgb(226, 232, 240)'
  const thumbBg = isDark ? 'rgb(31, 41, 55)' : '#fff'

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
          border: 2px solid rgb(59, 130, 246);
          cursor: pointer;
          box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.25);
        }

        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border: 2px solid rgb(59, 130, 246);
          border-radius: 50%;
          background: ${thumbBg};
          cursor: pointer;
          box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.25);
        }
      `}
      </style>
      {label && (
        <div className='flex items-center justify-between'>
          <label className='text-sm font-medium'>
            {label}
          </label>
          <span className='text-sm text-gray-600 dark:text-gray-400'>
            {value}{unit}
          </span>
        </div>
      )}
      {!label && (
        <div className='flex items-center justify-end'>
          <span className='text-sm text-gray-600 dark:text-gray-400'>
            {value}{unit}
          </span>
        </div>
      )}
      <div className='relative'>
        <input
          type='range'
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          style={{
            background: `linear-gradient(to right, rgb(59, 130, 246) 0%, rgb(59, 130, 246) ${percentage}%, ${trackColor} ${percentage}%, ${trackColor} 100%)`
          }}
          className='h-2 w-full cursor-pointer appearance-none rounded-full'
        />
      </div>
      {description && (
        <p className='text-xs text-gray-600 dark:text-gray-400'>
          {description}
        </p>
      )}
    </div>
  )
}
