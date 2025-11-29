'use client'

import { DocumentPlusIcon } from '@heroicons/react/24/outline'
import type { DragEvent, ReactNode } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { useTranslations } from '@/lib/i18n/client'

import { useToast } from './toast'

export interface FullPageDropZoneProps {
  onFileDrop: (file: File) => void
  validateFile?: (file: File) => string | null | Promise<string | null>
  accept?: string // e.g., "image/*"
  children: ReactNode
}

export function FullPageDropZone ({
  onFileDrop,
  validateFile,
  accept,
  children
}: FullPageDropZoneProps) {
  const t = useTranslations()
  const [isDragging, setIsDragging] = useState(false)
  const dragCounterRef = useRef(0)
  const toast = useToast()

  const handleDragEnter = useCallback((e: globalThis.DragEvent) => {
    e.preventDefault()

    // Ignore drag events from interactive elements (sliders, inputs, etc.)
    const target = e.target as HTMLElement
    if (target.tagName === 'INPUT' || target.closest('input[type="range"]')) {
      return
    }

    // Check if dragged content includes files
    if (!e.dataTransfer?.types.includes('Files')) {
      return
    }

    dragCounterRef.current++
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    dragCounterRef.current--
    if (dragCounterRef.current === 0) {
      setIsDragging(false)
    }
  }, [])

  const handleDrop = useCallback((e: globalThis.DragEvent) => {
    e.preventDefault()
    dragCounterRef.current = 0
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: globalThis.DragEvent) => {
    e.preventDefault()
  }, [])

  useEffect(() => {
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
  }, [handleDragEnter, handleDragLeave, handleDrop, handleDragOver])

  const handleDropOnDiv = useCallback(async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    // Reset drag counter and state
    dragCounterRef.current = 0
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (!file) return

    // Validate file type if accept prop is provided
    if (accept && !isFileTypeAccepted(file, accept)) {
      toast.error(t('common.unsupportedFileType'))
      return
    }

    // Validate file with custom validator
    if (validateFile) {
      try {
        const error = await validateFile(file)
        if (error) {
          toast.error(error)
          return
        }
      } catch (err) {
        // Validator threw an error - treat as validation failure
        console.error('File validation error:', err)
        toast.error(t('common.fileValidationError'))
        return
      }
    }

    onFileDrop(file)
  }, [accept, validateFile, onFileDrop, toast, t])

  return (
    <div onDrop={handleDropOnDiv} className='relative'>
      {children}

      {/* Drag Overlay */}
      {isDragging && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-blue-500/10 p-8 backdrop-blur'>
          <div className='flex size-full flex-col items-center justify-center gap-4 rounded-2xl border-4 border-dashed border-blue-500'>
            <DocumentPlusIcon className='size-12' />
            <p className='text-xl font-semibold'>
              {t('common.dropToUpload')}
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
