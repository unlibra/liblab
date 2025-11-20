'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { useToast } from '@/components/ui/toast'
import { useColorHistory } from '@/contexts/color-history-context'

import { PaletteIcon } from './icons/palette-icon'

export function ColorHistoryFAB () {
  const { colors, addColor } = useColorHistory()
  const toast = useToast()
  const [isExpanded, setIsExpanded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close when clicking outside
  useEffect(() => {
    if (!isExpanded) return

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsExpanded(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isExpanded])

  const handleCopyColor = useCallback(async (color: string) => {
    try {
      await navigator.clipboard.writeText(color.toUpperCase())
      addColor(color) // Move clicked color to front of history
      toast.success('クリップボードにコピーしました')
    } catch (err) {
      console.error('Failed to copy color:', err)
      toast.error('コピーに失敗しました')
    }
  }, [toast, addColor])

  const handleToggle = useCallback(() => {
    setIsExpanded(prev => !prev)
  }, [])

  // Calculate position for each color on the arc
  // Arc spans from bottom-left to top (counterclockwise from bottom-right FAB)
  const getColorPosition = useCallback((index: number, total: number) => {
    if (total === 0) return { x: 0, y: 0 }

    const radius = 100 // Distance from center in pixels
    const startAngle = 190 // Start from bottom-left (190 degrees)
    const endAngle = 80 // End at top (80 degrees)
    const arcSpan = startAngle - endAngle // 110 degrees span

    // Distribute colors evenly along the arc (counterclockwise)
    const angle = startAngle - (arcSpan / (total - 1 || 1)) * index
    const radian = (angle * Math.PI) / 180

    // Calculate x, y position (inverted y for screen coordinates)
    const x = radius * Math.cos(radian)
    const y = -radius * Math.sin(radian)

    return { x, y }
  }, [])

  return (
    <div ref={containerRef} className='fixed bottom-6 right-6 z-50'>
      <div className='relative'>
        {/* Color circles on arc */}
        {colors.map((color, index) => {
          const { x, y } = getColorPosition(index, colors.length)
          return (
            <div
              key={color}
              className='absolute transition-all'
              style={{
                transform: isExpanded
                  ? `translate(${x}px, ${y}px) scale(1)`
                  : 'translate(0, 0) scale(0)',
                opacity: isExpanded ? 1 : 0,
                transitionDelay: isExpanded ? `${index * 16}ms` : '0ms',
                bottom: '4px',
                right: '4px'
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleCopyColor(color)
                }}
                className='size-10 rounded-full border-2 border-white shadow-lg outline-none transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 active:scale-95 dark:border-gray-700'
                style={{ backgroundColor: color }}
                title={color.toUpperCase()}
                tabIndex={-1}
              />
            </div>
          )
        })}

        {/* Main FAB button */}
        <button
          onClick={handleToggle}
          className='relative flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-sky-600 text-white shadow-lg outline-none transition-shadow hover:shadow-xl'
          title='カラー履歴'
          tabIndex={-1}
        >
          <PaletteIcon className={`size-7 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
      </div>
    </div>
  )
}
