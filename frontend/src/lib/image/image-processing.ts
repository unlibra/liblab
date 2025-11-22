/**
 * Image processing utilities
 * Provides reusable image processing functionality
 */

export type ImageProcessingOptions = {
  borderRadius?: number // pixel value
  borderRadiusPercent?: number // 0-100 (percentage, 100 = perfect circle)
  backgroundColor?: string // hex color (e.g., '#ffffff')
  preserveAspectRatio?: boolean // true = preserve aspect ratio, false = force square
}

/**
 * Load image from file
 */
export async function loadImageFromFile (file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }

    img.src = url
  })
}

/**
 * Resize image and apply processing
 * @param image HTMLImageElement
 * @param maxWidth Maximum width (output width if preserveAspectRatio=false)
 * @param maxHeight Maximum height (output height if preserveAspectRatio=false, defaults to maxWidth if omitted)
 * @param options Processing options
 */
export async function processImage (
  image: HTMLImageElement,
  maxWidth: number,
  maxHeight?: number,
  options: ImageProcessingOptions = {}
): Promise<Blob> {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }

  // If maxHeight is not specified, use maxWidth (square)
  const maxH = maxHeight ?? maxWidth

  // Calculate size
  let width = maxWidth
  let height = maxH

  if (options.preserveAspectRatio) {
    // Fit within maxWidth and maxHeight while preserving aspect ratio
    const widthRatio = maxWidth / image.width
    const heightRatio = maxH / image.height
    const scale = Math.min(widthRatio, heightRatio, 1) // Don't exceed 1 (don't upscale)

    width = Math.round(image.width * scale)
    height = Math.round(image.height * scale)
  }

  canvas.width = width
  canvas.height = height

  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  // Apply border radius (square only)
  let radius = 0
  let isCircle = false
  const minDimension = Math.min(width, height)

  if (!options.preserveAspectRatio) {
    if (options.borderRadius && options.borderRadius > 0) {
      radius = options.borderRadius
      // Treat as circle if radius >= maxWidth/2 in px
      if (radius >= maxWidth / 2) {
        radius = maxWidth / 2
        isCircle = true
      }
    } else if (options.borderRadiusPercent && options.borderRadiusPercent > 0) {
      // For percentage, 100% = perfect circle
      if (options.borderRadiusPercent >= 100) {
        radius = maxWidth / 2
        isCircle = true
      } else {
        // Calculate radius for percentages < 100%
        radius = (maxWidth / 2) * (options.borderRadiusPercent / 100)
      }
    }
  }

  if (radius > 0) {
    ctx.save()
    ctx.beginPath()

    if (isCircle) {
      // Draw perfect circle
      ctx.arc(width / 2, height / 2, minDimension / 2, 0, Math.PI * 2)
    } else {
      // Draw rounded rectangle
      ctx.moveTo(radius, 0)
      ctx.lineTo(width - radius, 0)
      ctx.quadraticCurveTo(width, 0, width, radius)
      ctx.lineTo(width, height - radius)
      ctx.quadraticCurveTo(width, height, width - radius, height)
      ctx.lineTo(radius, height)
      ctx.quadraticCurveTo(0, height, 0, height - radius)
      ctx.lineTo(0, radius)
      ctx.quadraticCurveTo(0, 0, radius, 0)
    }

    ctx.closePath()
    ctx.clip()

    // Apply background color (clipped region only)
    if (options.backgroundColor) {
      ctx.fillStyle = options.backgroundColor
      ctx.fillRect(0, 0, width, height)
    }

    // Draw image
    ctx.drawImage(image, 0, 0, width, height)

    ctx.restore()
  } else {
    // No border radius
    // Apply background color
    if (options.backgroundColor) {
      ctx.fillStyle = options.backgroundColor
      ctx.fillRect(0, 0, width, height)
    }

    // Draw image
    ctx.drawImage(image, 0, 0, width, height)
  }

  // Convert to PNG blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to create blob from canvas'))
        }
      },
      'image/png',
      1.0
    )
  })
}

/**
 * Resize image for cheki (object-fit: cover style)
 * @param image HTMLImageElement
 * @param targetWidth Target width
 * @param targetHeight Target height
 * @param backgroundColor Background color (default: white)
 */
export async function processImageForCheki (
  image: HTMLImageElement,
  targetWidth: number,
  targetHeight: number,
  backgroundColor: string = '#ffffff'
): Promise<Blob> {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }

  canvas.width = targetWidth
  canvas.height = targetHeight

  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  // Fill background color
  ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, targetWidth, targetHeight)

  // object-fit: cover behavior
  // Target aspect ratio
  const targetRatio = targetWidth / targetHeight
  // Original image aspect ratio
  const imageRatio = image.width / image.height

  if (imageRatio > targetRatio) {
    // Image is wider → use full height, center-crop width
    const sourceWidth = image.height * targetRatio
    const sourceX = (image.width - sourceWidth) / 2
    ctx.drawImage(
      image,
      sourceX, 0, sourceWidth, image.height, // Source crop area
      0, 0, targetWidth, targetHeight // Canvas draw area
    )
  } else {
    // Image is taller → use full width, center-crop height
    const sourceHeight = image.width / targetRatio
    const sourceY = (image.height - sourceHeight) / 2
    ctx.drawImage(
      image,
      0, sourceY, image.width, sourceHeight, // Source crop area
      0, 0, targetWidth, targetHeight // Canvas draw area
    )
  }

  // Convert to PNG blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to create blob from canvas'))
        }
      },
      'image/png',
      1.0
    )
  })
}

/**
 * Download blob
 */
export function downloadBlob (blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
