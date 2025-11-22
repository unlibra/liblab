/**
 * Favicon generator utility
 * Generates ICO files from images using PNG embedding (modern approach)
 * Also supports generating modern favicon formats (2025 best practices)
 */

import type { ImageProcessingOptions } from './image-processing'
import { processImage } from './image-processing'

export type FaviconSize = 16 | 24 | 32 | 48 | 64 | 128 | 256

export const AVAILABLE_SIZES: FaviconSize[] = [16, 24, 32, 48, 64, 128, 256]
export const DEFAULT_SIZES: FaviconSize[] = [16, 32]

// Output Set - represents what user selects in UI
export type OutputSetId = 'favicon' | 'apple-touch-icon' | 'android-icon'

export interface OutputFile {
  name: string
  size: number | 'custom'
}

export interface OutputSet {
  id: OutputSetId
  label: string
  description: string
  files: OutputFile[]
}

export const OUTPUT_SETS: OutputSet[] = [
  {
    id: 'favicon',
    label: 'favicon.ico',
    description: '従来のブラウザ用',
    files: [{ name: 'favicon.ico', size: 'custom' }]
  },
  {
    id: 'apple-touch-icon',
    label: 'Apple Touch Icon',
    description: 'iOS用 (180×180)',
    files: [{ name: 'apple-touch-icon.png', size: 180 }]
  },
  {
    id: 'android-icon',
    label: 'Android Icon',
    description: 'Android/PWA用 (192×192, 512×512)',
    files: [
      { name: 'icon-192.png', size: 192 },
      { name: 'icon-512.png', size: 512 }
    ]
  }
]

export const DEFAULT_OUTPUT_SETS: OutputSetId[] = ['favicon']

/**
 * Generate ICO file from PNG blobs
 * ICO file structure:
 * - ICONDIR (6 bytes): File header
 * - ICONDIRENTRY[] (16 bytes each): Metadata for each image
 * - PNG data: Actual PNG image data
 */
async function generateICO (pngBlobs: Array<{ size: number, blob: Blob }>): Promise<Blob> {
  const numImages = pngBlobs.length

  // Calculate offsets and sizes
  const iconDirSize = 6 // ICONDIR header
  const iconDirEntrySize = 16 // per image
  const headerSize = iconDirSize + iconDirEntrySize * numImages

  // Get all PNG data as ArrayBuffers
  const pngDataArray = await Promise.all(
    pngBlobs.map(async ({ blob }) => new Uint8Array(await blob.arrayBuffer()))
  )

  // Calculate total file size
  const totalSize = headerSize + pngDataArray.reduce((sum, data) => sum + data.length, 0)

  // Create output buffer
  const buffer = new ArrayBuffer(totalSize)
  const view = new DataView(buffer)
  const uint8View = new Uint8Array(buffer)

  let offset = 0

  // Write ICONDIR header
  view.setUint16(offset, 0, true) // Reserved (must be 0)
  offset += 2
  view.setUint16(offset, 1, true) // Type (1 = ICO)
  offset += 2
  view.setUint16(offset, numImages, true) // Number of images
  offset += 2

  // Write ICONDIRENTRY for each image
  let imageDataOffset = headerSize
  for (let i = 0; i < numImages; i++) {
    const size = pngBlobs[i].size
    const pngData = pngDataArray[i]

    view.setUint8(offset, size === 256 ? 0 : size) // Width (0 means 256)
    offset += 1
    view.setUint8(offset, size === 256 ? 0 : size) // Height (0 means 256)
    offset += 1
    view.setUint8(offset, 0) // Color palette (0 for PNG)
    offset += 1
    view.setUint8(offset, 0) // Reserved (must be 0)
    offset += 1
    view.setUint16(offset, 1, true) // Color planes (should be 1)
    offset += 2
    view.setUint16(offset, 32, true) // Bits per pixel (32 for PNG)
    offset += 2
    view.setUint32(offset, pngData.length, true) // Image data size
    offset += 4
    view.setUint32(offset, imageDataOffset, true) // Image data offset
    offset += 4

    imageDataOffset += pngData.length
  }

  // Write PNG data
  for (const pngData of pngDataArray) {
    uint8View.set(pngData, offset)
    offset += pngData.length
  }

  return new Blob([buffer], { type: 'image/x-icon' })
}

/**
 * Generate favicon ICO file from image file
 */
export async function generateFavicon (
  image: HTMLImageElement,
  sizes: FaviconSize[],
  options: ImageProcessingOptions = {}
): Promise<Blob> {
  // Resize to each size and convert to PNG (square)
  const pngBlobs = await Promise.all(
    sizes.map(async (size) => ({
      size,
      blob: await processImage(image, size, undefined, options)
    }))
  )

  // Generate ICO file
  return generateICO(pngBlobs)
}

/**
 * Generate files for a single output set
 */
export async function generateOutputSet (
  image: HTMLImageElement,
  outputSet: OutputSet,
  options: {
    sizes?: FaviconSize[] // Only for favicon.ico
    borderRadiusPercent?: number
    backgroundColor?: string
  } = {}
): Promise<Array<{ name: string, blob: Blob }>> {
  const { sizes = DEFAULT_SIZES, borderRadiusPercent = 0, backgroundColor } = options

  const results: Array<{ name: string, blob: Blob }> = []

  for (const file of outputSet.files) {
    let blob: Blob

    if (file.name === 'favicon.ico') {
      // Generate ICO with selected sizes
      blob = await generateFavicon(image, sizes, {
        borderRadiusPercent,
        backgroundColor
      })
    } else {
      // For PNG formats
      const size = file.size as number

      // apple-touch-icon always needs background color (default: white)
      const effectiveBackgroundColor = file.name === 'apple-touch-icon.png'
        ? (backgroundColor || '#ffffff')
        : backgroundColor

      // apple-touch-icon: iOS applies rounded corners automatically, so don't apply border radius
      const effectiveBorderRadius = file.name === 'apple-touch-icon.png'
        ? 0
        : borderRadiusPercent

      blob = await processImage(image, size, undefined, {
        borderRadiusPercent: effectiveBorderRadius,
        backgroundColor: effectiveBackgroundColor
      })
    }

    results.push({ name: file.name, blob })
  }

  return results
}
