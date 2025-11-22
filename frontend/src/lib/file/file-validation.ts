/**
 * File validation utilities
 * File type validation using magic numbers (file signatures)
 */

export type SupportedImageType = 'png' | 'jpeg' | 'gif' | 'webp' | 'svg' | 'avif' | 'heif' | 'heic' | 'tiff' | 'bmp'

export interface FileValidationResult {
  isValid: boolean
  detectedType?: SupportedImageType
  error?: string
}

/**
 * Validate file type using magic numbers
 *
 * Supported formats:
 * - PNG, JPEG, GIF, WebP, SVG, AVIF, HEIF, HEIC, TIFF, BMP
 *
 * @param file - File to validate
 * @returns Validation result
 */
export async function validateImageFileType (file: File): Promise<FileValidationResult> {
  try {
    // Read first 16 bytes of file (covers all formats)
    const buffer = await file.slice(0, 16).arrayBuffer()
    const bytes = new Uint8Array(buffer)

    // Check magic number
    const detectedType = detectImageType(bytes)

    if (detectedType) {
      return {
        isValid: true,
        detectedType
      }
    }

    return {
      isValid: false,
      error: 'サポートされていない画像形式です'
    }
  } catch (err) {
    return {
      isValid: false,
      error: 'ファイルの検証中にエラーが発生しました'
    }
  }
}

/**
 * Detect image type from byte array
 */
function detectImageType (bytes: Uint8Array): SupportedImageType | null {
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (bytes.length >= 8 &&
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4E &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0D &&
      bytes[5] === 0x0A &&
      bytes[6] === 0x1A &&
      bytes[7] === 0x0A) {
    return 'png'
  }

  // JPEG: FF D8 FF
  if (bytes.length >= 3 &&
      bytes[0] === 0xFF &&
      bytes[1] === 0xD8 &&
      bytes[2] === 0xFF) {
    return 'jpeg'
  }

  // GIF: 47 49 46 38 (GIF8)
  if (bytes.length >= 4 &&
      bytes[0] === 0x47 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x38) {
    return 'gif'
  }

  // WebP: 52 49 46 46 ... 57 45 42 50 (RIFF....WEBP)
  if (bytes.length >= 12 &&
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46 &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50) {
    return 'webp'
  }

  // AVIF: ... 66 74 79 70 61 76 69 66 (....ftypavif) at offset 4
  if (bytes.length >= 12 &&
      bytes[4] === 0x66 &&
      bytes[5] === 0x74 &&
      bytes[6] === 0x79 &&
      bytes[7] === 0x70 &&
      bytes[8] === 0x61 &&
      bytes[9] === 0x76 &&
      bytes[10] === 0x69 &&
      bytes[11] === 0x66) {
    return 'avif'
  }

  // HEIF: ... 66 74 79 70 68 65 69 66 (....ftypheif) at offset 4
  // HEIC: ... 66 74 79 70 68 65 69 63 (....ftypheic) at offset 4
  if (bytes.length >= 12 &&
      bytes[4] === 0x66 &&
      bytes[5] === 0x74 &&
      bytes[6] === 0x79 &&
      bytes[7] === 0x70) {
    if (bytes[8] === 0x68 &&
        bytes[9] === 0x65 &&
        bytes[10] === 0x69 &&
        bytes[11] === 0x66) {
      return 'heif'
    }
    if (bytes[8] === 0x68 &&
        bytes[9] === 0x65 &&
        bytes[10] === 0x69 &&
        bytes[11] === 0x63) {
      return 'heic'
    }
  }

  // TIFF (Little Endian): 49 49 2A 00
  if (bytes.length >= 4 &&
      bytes[0] === 0x49 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x2A &&
      bytes[3] === 0x00) {
    return 'tiff'
  }

  // TIFF (Big Endian): 4D 4D 00 2A
  if (bytes.length >= 4 &&
      bytes[0] === 0x4D &&
      bytes[1] === 0x4D &&
      bytes[2] === 0x00 &&
      bytes[3] === 0x2A) {
    return 'tiff'
  }

  // BMP: 42 4D (BM)
  if (bytes.length >= 2 &&
      bytes[0] === 0x42 &&
      bytes[1] === 0x4D) {
    return 'bmp'
  }

  // SVG: Text-based so check beginning
  // Starts with < (0x3C), or UTF-8 BOM + <
  if (bytes.length >= 1 && bytes[0] === 0x3C) {
    return 'svg'
  }

  // UTF-8 BOM (EF BB BF) followed by <
  if (bytes.length >= 4 &&
      bytes[0] === 0xEF &&
      bytes[1] === 0xBB &&
      bytes[2] === 0xBF &&
      bytes[3] === 0x3C) {
    return 'svg'
  }

  return null
}

/**
 * Basic file validation (size, MIME type)
 */
export function validateFileBasic (
  file: File,
  options: {
    maxSize?: number // bytes
    allowedMimeTypes?: string[]
  } = {}
): string | null {
  const { maxSize, allowedMimeTypes } = options

  // ファイルサイズチェック
  if (maxSize && file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(0)
    return `ファイルサイズが大きすぎます（最大${maxSizeMB}MB）`
  }

  // MIME type check (first stage)
  if (allowedMimeTypes && allowedMimeTypes.length > 0) {
    const isAllowed = allowedMimeTypes.some(type => {
      if (type.endsWith('/*')) {
        const category = type.split('/')[0]
        return file.type.startsWith(`${category}/`)
      }
      return file.type === type
    })

    if (!isAllowed) {
      return '許可されていないファイル形式です'
    }
  }

  return null
}

/**
 * Complete validation of image files
 * Basic check + magic number check
 */
export async function validateImageFile (
  file: File,
  options: {
    maxSize?: number
    maxDimensions?: { width: number, height: number }
  } = {}
): Promise<string | null> {
  // 基本的なバリデーション
  const basicError = validateFileBasic(file, {
    maxSize: options.maxSize,
    allowedMimeTypes: ['image/*']
  })

  if (basicError) {
    return basicError
  }

  // マジックナンバーチェック
  const typeValidation = await validateImageFileType(file)
  if (!typeValidation.isValid) {
    return typeValidation.error || 'サポートされていない画像形式です'
  }

  // Image dimensions check (optional)
  if (options.maxDimensions) {
    try {
      const dimensions = await getImageDimensions(file)
      if (dimensions.width > options.maxDimensions.width ||
          dimensions.height > options.maxDimensions.height) {
        return `画像サイズが大きすぎます（最大${options.maxDimensions.width}×${options.maxDimensions.height}px）`
      }
    } catch {
      // Error if image cannot be loaded
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
