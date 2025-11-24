/**
 * File validation utilities
 * Simple MIME type validation (detailed validation is done on backend)
 */

export interface FileValidationResult {
  isValid: boolean
  error?: string
}

/**
 * Validate file size
 * Common utility for all file types
 */
export function validateFileSize (file: File, maxSize: number): string | null {
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(0)
    return `ファイルサイズが大きすぎます（最大${maxSizeMB}MB）`
  }
  return null
}

/**
 * Validate file type using MIME type and file extension
 *
 * Note: Detailed format validation (magic numbers, corruption check, etc.)
 * is performed on the backend. This is just a quick pre-check for UX.
 *
 * Some browsers don't recognize HEIC/HEIF MIME types, so we also check extensions.
 *
 * @param file - File to validate
 * @returns Validation result
 */
export function validateImageFileType (file: File): FileValidationResult {
  // Check MIME type (set by browser based on file extension/content)
  if (file.type.startsWith('image/')) {
    return {
      isValid: true
    }
  }

  // Fallback: Check file extension for formats that browsers may not recognize
  // (HEIC/HEIF often have no MIME type or application/octet-stream)
  const extension = file.name.split('.').pop()?.toLowerCase()
  const supportedExtensions = ['heic', 'heif', 'avif']

  if (extension && supportedExtensions.includes(extension)) {
    return {
      isValid: true
    }
  }

  return {
    isValid: false,
    error: '画像ファイルを選択してください'
  }
}

/**
 * Validate SVG file
 * MIME type check + size check
 */
export function validateSvgFile (
  file: File,
  options: { maxSize?: number } = {}
): string | null {
  // MIME type check (SVG specific)
  if (file.type !== 'image/svg+xml') {
    return 'SVGファイルのみアップロードできます'
  }

  // File size check
  if (options.maxSize) {
    const sizeError = validateFileSize(file, options.maxSize)
    if (sizeError) return sizeError
  }

  return null
}

/**
 * Complete validation of image files
 * MIME type check + size check + optional dimension check
 */
export async function validateImageFile (
  file: File,
  options: {
    maxSize?: number
    maxDimensions?: { width: number, height: number }
  } = {}
): Promise<string | null> {
  // MIME type check
  const typeValidation = validateImageFileType(file)
  if (!typeValidation.isValid) {
    return typeValidation.error || 'サポートされていない画像形式です'
  }

  // File size check
  if (options.maxSize) {
    const sizeError = validateFileSize(file, options.maxSize)
    if (sizeError) return sizeError
  }

  // Image dimensions check (optional)
  // Skip for formats that browsers don't natively support (HEIC/HEIF/AVIF)
  // Backend will validate dimensions for these formats
  if (options.maxDimensions) {
    try {
      const dimensions = await getImageDimensions(file)
      if (dimensions.width > options.maxDimensions.width ||
          dimensions.height > options.maxDimensions.height) {
        return `画像サイズが大きすぎます（最大${options.maxDimensions.width}×${options.maxDimensions.height}px）`
      }
    } catch {
      // Error if image cannot be loaded (only for formats browser should support)
      return '画像の読み込みに失敗しました'
    }
  }

  return null
}

/**
 * Get image dimensions
 */
async function getImageDimensions (file: File): Promise<{ width: number, height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({ width: img.width, height: img.height })
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }

    img.src = url
  })
}
