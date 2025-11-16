'use client'

import { ArrowUpTrayIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

import { CircleSpinner } from '@/components/spinner'

export interface FileUploadProps {
  accept: string // e.g., "image/*", ".pdf", ".png,.jpg"
  multiple?: boolean
  selectedFiles: File[]
  onFilesChange: (files: File[]) => void
  uploading?: boolean
  validateFile?: (file: File) => string | null // returns error message or null if valid
  maxFiles?: number
  dragDropText?: string
  clickText?: string
  showFileList?: boolean // whether to show the uploaded files list
}

export function FileUpload ({
  accept,
  multiple = false,
  selectedFiles,
  onFilesChange,
  uploading = false,
  validateFile,
  maxFiles,
  dragDropText = 'ファイルをドラッグ&ドロップ',
  clickText = 'またはクリックしてファイルを選択',
  showFileList = true
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)

  const processFiles = (files: File[]) => {
    if (files.length === 0) return

    // Check max files limit
    if (maxFiles && selectedFiles.length + files.length > maxFiles) {
      alert(`最大${maxFiles}個までのファイルをアップロードできます`)
      return
    }

    // Validate files if validation function is provided
    if (validateFile) {
      const invalidFile = files.find((file) => validateFile(file) !== null)
      if (invalidFile) {
        const errorMessage = validateFile(invalidFile)
        alert(errorMessage)
        return
      }
    }

    // Add to existing files or replace if single file mode
    if (multiple) {
      onFilesChange([...selectedFiles, ...files])
    } else {
      onFilesChange([files[0]])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    processFiles(Array.from(files))
    e.target.value = ''
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (uploading) return

    const files = Array.from(e.dataTransfer.files)
    processFiles(files)
  }

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    onFilesChange(newFiles)
  }

  return (
    <div>
      <label
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`mt-1 block cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors duration-200 ${
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950'
            : 'border-gray-300 transition-colors hover:border-blue-400 hover:bg-blue-50 dark:border-gray-600 dark:hover:border-blue-500 dark:hover:bg-blue-950'
        }`}
      >
        <input
          id='file-upload'
          type='file'
          accept={accept}
          multiple={multiple}
          className='hidden'
          onChange={handleFileSelect}
          disabled={uploading}
        />
        <div className='pointer-events-none flex flex-col items-center gap-3'>
          {uploading
            ? (
              <>
                <CircleSpinner className='size-8 text-blue-500' />
                <p className='text-sm font-medium'>
                  アップロード中
                </p>
              </>
              )
            : (
              <>
                <ArrowUpTrayIcon className='size-6 text-gray-500' />
                <div>
                  <p className='text-sm font-medium'>
                    {dragDropText}
                  </p>
                  <p className='text-xs text-gray-500'>
                    {clickText}
                  </p>
                </div>
              </>
              )}
        </div>
      </label>

      {/* Selected files list */}
      {showFileList && selectedFiles.length > 0 && (
        <div className='mt-4 space-y-1.5'>
          {selectedFiles.map((file, index) => (
            <div key={index} className='flex items-center justify-between rounded-md bg-blue-50 px-2.5 py-1.5 dark:bg-blue-950'>
              <div className='flex-1 truncate text-xs'>
                {file.name}
              </div>
              <button
                type='button'
                onClick={() => removeFile(index)}
                disabled={uploading}
                className='ml-1.5 rounded p-0.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              >
                <XMarkIcon className='size-3.5' />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
