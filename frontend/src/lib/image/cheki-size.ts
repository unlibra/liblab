/**
 * Cheki size and aspect ratio determination
 */

export type ChekiAspectRatio = 'portrait' | 'square' | 'landscape'

export type ChekiSize = {
  width: number
  height: number
  aspectRatio: ChekiAspectRatio
}

export type ChekiPadding = {
  left: number
  right: number
  top: number
  bottom: number
}

// Size patterns (based on longer side, multiples of 16)
const SIZE_BREAKPOINTS = [400, 640, 800, 1024, 1280]

/**
 * Determine aspect ratio of image
 */
export function determineAspectRatio (
  width: number,
  height: number
): ChekiAspectRatio {
  const ratio = width / height

  // Near-square (0.9 ~ 1.1)
  if (ratio >= 0.9 && ratio <= 1.1) {
    return 'square'
  }

  // Landscape
  if (ratio > 1.1) {
    return 'landscape'
  }

  // Portrait
  return 'portrait'
}

/**
 * Determine appropriate cheki size
 */
export function determineChekiSize (
  width: number,
  height: number
): ChekiSize {
  const aspectRatio = determineAspectRatio(width, height)

  // Determine size based on longer side
  const longerSide = Math.max(width, height)

  // Find nearest breakpoint (upscale small images to minimum size)
  let targetSize = SIZE_BREAKPOINTS[0]
  for (const breakpoint of SIZE_BREAKPOINTS) {
    if (longerSide <= breakpoint) {
      targetSize = breakpoint
      break
    }
    targetSize = breakpoint
  }

  // Determine width and height based on aspect ratio
  let targetWidth: number
  let targetHeight: number

  if (aspectRatio === 'portrait') {
    // Portrait: longer side is height, width based on 46mm
    targetHeight = targetSize
    targetWidth = Math.round(targetSize * (46 / 62))
  } else if (aspectRatio === 'square') {
    // Square: same width and height
    targetWidth = targetSize
    targetHeight = targetSize
  } else {
    // Landscape: longer side is width, height based on 62mm
    targetWidth = targetSize
    targetHeight = Math.round(targetSize * (62 / 99))
  }

  return {
    width: targetWidth,
    height: targetHeight,
    aspectRatio
  }
}

/**
 * Calculate cheki padding
 * Based on actual cheki film proportions
 */
export function calculateChekiPadding (
  imageWidth: number,
  imageHeight: number,
  aspectRatio: ChekiAspectRatio
): ChekiPadding {
  // Padding ratios (percentage of image size)
  const paddingRatios = {
    portrait: {
      horizontal: 0.087, // 4mm / 46mm = 8.70%
      top: 0.129, // 8mm / 62mm = 12.9%
      bottom: 0.258 // 16mm / 62mm = 25.8%
    },
    square: {
      horizontal: 0.0806, // 5mm / 62mm = 8.06%
      top: 0.129, // 8mm / 62mm = 12.9%
      bottom: 0.258 // 16mm / 62mm = 25.8%
    },
    landscape: {
      horizontal: 0.0455, // 4.5mm / 99mm = 4.55%
      top: 0.129, // 8mm / 62mm = 12.9%
      bottom: 0.258 // 16mm / 62mm = 25.8%
    }
  }

  const ratios = paddingRatios[aspectRatio]

  return {
    left: Math.round(imageWidth * ratios.horizontal),
    right: Math.round(imageWidth * ratios.horizontal),
    top: Math.round(imageHeight * ratios.top),
    bottom: Math.round(imageHeight * ratios.bottom)
  }
}
