'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const MAX_HISTORY_SIZE = 5
const DEFAULT_COLORS = ['#8b5cf6', '#ef4444', '#f59e0b', '#22c55e', '#0ea5e9']

interface ColorHistoryContextType {
  colors: string[]
  addColor: (color: string) => void
  clearHistory: () => void
}

const ColorHistoryContext = createContext<ColorHistoryContextType | undefined>(undefined)

export function ColorHistoryProvider ({ children }: { children: React.ReactNode }) {
  const [colors, setColors] = useState<string[]>(DEFAULT_COLORS)
  const [mounted, setMounted] = useState(false)

  // Load history from localStorage on mount
  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('color-history')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setColors(parsed)
        }
      } catch (err) {
        console.error('Failed to load color history:', err)
      }
    }
  }, [])

  // Save to localStorage when colors change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('color-history', JSON.stringify(colors))
    }
  }, [colors, mounted])

  const addColor = useCallback((color: string) => {
    setColors(prev => {
      // Remove duplicates and add to front
      const filtered = prev.filter(c => c.toLowerCase() !== color.toLowerCase())
      const newColors = [color, ...filtered]
      // Keep only MAX_HISTORY_SIZE items
      return newColors.slice(0, MAX_HISTORY_SIZE)
    })
  }, [])

  const clearHistory = useCallback(() => {
    setColors(DEFAULT_COLORS)
  }, [])

  return (
    <ColorHistoryContext.Provider value={{ colors, addColor, clearHistory }}>
      {children}
    </ColorHistoryContext.Provider>
  )
}

export function useColorHistory () {
  const context = useContext(ColorHistoryContext)
  if (!context) {
    throw new Error('useColorHistory must be used within ColorHistoryProvider')
  }
  return context
}
