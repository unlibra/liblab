'use client'

import { CloudArrowUpIcon } from '@heroicons/react/24/outline'
import type { DragEvent, ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'

export interface FullPageDropZoneProps {
  onFileDrop: (file: File) => void
  validateFile?: (file: File) => string | null
  accept?: string // e.g., "image/*"
  children: ReactNode
}

export function FullPageDropZone ({
  onFileDrop,
  validateFile,
  accept,
  children
}: FullPageDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const dragCounterRef = useRef(0)

  useEffect(() => {
    const handleDragEnter = () => {
      dragCounterRef.current++
      setIsDragging(true)
    }

    const handleDragLeave = () => {
      dragCounterRef.current--
      if (dragCounterRef.current === 0) {
        setIsDragging(false)
      }
    }

    const handleDrop = () => {
      dragCounterRef.current = 0
      setIsDragging(false)
    }

    const handleDragOver = (e: globalThis.DragEvent) => {
      e.preventDefault()
    }

    window.addEventListener('dragenter', handleDragEnter)
    window.addEventListener('dragleave', handleDragLeave)
    window.addEventListener('drop', handleDrop)
    window.addEventListener('dragover', handleDragOver)

    return () => {
      window.removeEventListener('dragenter', handleDragEnter)
      window.removeEventListener('dragleave', handleDragLeave)
      window.removeEventListener('drop', handleDrop)
      window.removeEventListener('dragover', handleDragOver)
    }
  }, [])

  const handleDropOnDiv = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    // Reset drag counter and state
    dragCounterRef.current = 0
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (!file) return

    // Validate file type if accept prop is provided
    if (accept && !isFileTypeAccepted(file, accept)) {
      return
    }

    // Validate file with custom validator
    if (validateFile) {
      const error = validateFile(file)
      if (error) {
        return
      }
    }

    onFileDrop(file)
  }

  return (
    <div onDrop={handleDropOnDiv} className='relative'>
      {children}

      {/* Drag Overlay */}
      {isDragging && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-blue-500/20 backdrop-blur-sm'>
          <div className='flex flex-col items-center gap-4 rounded-2xl border-4 border-dashed border-blue-500 bg-white/90 px-12 py-16 dark:bg-gray-800/90'>
            <CloudArrowUpIcon className='size-16 text-blue-500' />
            <p className='text-xl font-semibold text-gray-700 dark:text-gray-200'>
              ドロップして画像をアップロード
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper function to check if file type is accepted
function isFileTypeAccepted (file: File, accept: string): boolean {
  const acceptedTypes = accept.split(',').map(type => type.trim())

  return acceptedTypes.some(type => {
    if (type.endsWith('/*')) {
      // e.g., "image/*"
      const category = type.split('/')[0]
      return file.type.startsWith(`${category}/`)
    }
    // e.g., ".png", ".jpg"
    if (type.startsWith('.')) {
      return file.name.toLowerCase().endsWith(type.toLowerCase())
    }
    // Exact mime type match
    return file.type === type
  })
}
