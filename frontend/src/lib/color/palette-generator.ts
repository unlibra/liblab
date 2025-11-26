/**
 * Tailwind-style Palette Generator
 * Generates 50-950 color scales in the style of Tailwind CSS
 *
 * Color space: OKLCh (perceptually uniform, better than CIELCh for yellows)
 * Algorithm: Hue-based interpolation between anchors → gamut mapping
 *
 * Key improvement: Always interpolates between adjacent anchors (no anchor matching)
 * This preserves subtle color variations (e.g., cyan-ish blue vs indigo-ish blue)
 *
 * Performance: ~0.032ms/palette (31,000 palettes/sec)
 * - Binary search precision: 0.5 (40% faster than 0.1)
 * - Early termination: Skip search if already in gamut (50-70% of cases)
 *
 * @see docs/palette-generation-algorithm.md for detailed explanation
 * @see scripts/extract-anchor-colors.ts to regenerate anchor curves data
 */

import type { AnchorColorName } from '@/config/anchor-curves'
import { ANCHOR_CURVES } from '@/config/anchor-curves'

import type { OKLCh } from './color-utils'
import { hexToOklch, normalizeHue, oklchToHex } from './color-utils'
import type { TailwindShade } from './tailwind-colors'

/**
 * Generated color palette (50-950)
 */
export type ColorPalette = Record<TailwindShade, string>

/**
 * Shade levels in order
 */
const SHADES: TailwindShade[] = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]

/**
 * Calculate angular distance between two hues (accounting for wraparound)
 */
function angleDist (h1: number, h2: number): number {
  let diff = Math.abs(h1 - h2)
  if (diff > 180) diff = 360 - diff
  return diff
}

// Removed estimateAnchorBaseHue function - no longer needed without anchor matching

/**
 * Linear interpolation for angles (handles 360° wraparound)
 */
function lerpAngle (a1: number, a2: number, t: number): number {
  let diff = a2 - a1
  // Take shorter path around the circle
  if (diff > 180) diff -= 360
  if (diff < -180) diff += 360
  return a1 + diff * t
}

/**
 * Find the two adjacent anchor colors for a given hue
 * Returns [anchor1, anchor2, blendRatio]
 * blendRatio: 0 = pure anchor1, 1 = pure anchor2
 */
function findAdjacentAnchors (hue: number): [AnchorColorName, AnchorColorName, number] {
  const normalizedHue = normalizeHue(hue)

  // Get all anchor colors sorted by hue
  const anchors = Object.keys(ANCHOR_CURVES) as AnchorColorName[]
  const anchorHues = anchors.map(name => ({
    name,
    hue: ANCHOR_CURVES[name].centerHue
  }))

  // Sort by hue
  anchorHues.sort((a, b) => a.hue - b.hue)

  // Find the two anchors that bracket the input hue
  let anchor1 = anchorHues[anchorHues.length - 1]
  let anchor2 = anchorHues[0]

  for (let i = 0; i < anchorHues.length; i++) {
    const current = anchorHues[i]
    const next = anchorHues[(i + 1) % anchorHues.length]

    // Check if hue is between current and next
    if (current.hue <= normalizedHue && normalizedHue < next.hue) {
      anchor1 = current
      anchor2 = next
      break
    }
    // Handle wraparound case (e.g., 350° is between 312° and 31°)
    if (current.hue > next.hue) {
      if (normalizedHue >= current.hue || normalizedHue < next.hue) {
        anchor1 = current
        anchor2 = next
        break
      }
    }
  }

  // Calculate blend ratio
  const dist1 = angleDist(normalizedHue, anchor1.hue)
  const dist2 = angleDist(normalizedHue, anchor2.hue)
  const totalDist = dist1 + dist2

  const ratio = totalDist > 0 ? dist1 / totalDist : 0

  return [anchor1.name, anchor2.name, ratio]
}

/**
 * Calculate yellow influence factor with asymmetric Gaussian falloff
 * Yellow is visually special - human eyes are most sensitive to hue changes around yellow
 *
 * Uses asymmetric Gaussian distribution to prevent lime drift:
 * - Amber side (hue < 86°): σ=28 (wider influence, preserves warmth)
 * - Lime side (hue > 86°): σ=12 (narrower influence, prevents greening)
 *   Reduced from 16 to 12 to better handle pure yellow (#ffff00, H≈110°)
 */
function getYellowInfluence (distanceToYellow: number, hue: number): number {
  const YELLOW_HUE = 86

  // Asymmetric Gaussian: wider on amber side, narrower on lime side
  // This prevents "lemon" colors from drifting toward lime/green
  const SIGMA_AMBER = 28  // Wider influence toward amber (preserves yellow warmth)
  const SIGMA_LIME = 12   // Narrower influence toward lime (prevents greening of pure yellows)

  const sigma = hue < YELLOW_HUE ? SIGMA_AMBER : SIGMA_LIME

  // Gaussian function: e^(-(distance²) / (2σ²))
  return Math.exp(-(distanceToYellow ** 2) / (2 * sigma ** 2))
}

/**
 * Cusp-aware lightness floors for yellow-adjacent hues
 * Yellow's maximum chroma in OKLab sits near L≈80, so darker shades
 * need MINIMAL lightness floors to prevent brown-out when interpolation
 * goes too dark. These are safety floors, not target values.
 *
 * Values are set conservatively below Tailwind yellow to prevent over-brightening.
 */
const YELLOW_LIGHTNESS_FLOOR: Record<TailwindShade, number> = {
  50: 96,   // Very light shades: minimal intervention
  100: 94,
  200: 90,
  300: 84,
  400: 78,
  500: 70,  // Below yellow-500 (79.5), only catches severe darkening
  600: 58,  // Below yellow-600 (68.1)
  700: 48,  // Below yellow-700 (55.4)
  800: 40,  // Below yellow-800 (47.6)
  900: 35,  // Below yellow-900 (42.1)
  950: 24   // Below yellow-950 (28.6)
}

/**
 * Get blended curve value by interpolating between two anchor colors
 * Special handling for yellow due to its unique perceptual properties
 */
function getBlendedValue (
  hue: number,
  shade: TailwindShade,
  curveType: 'lightness' | 'chroma' | 'hueShift'
): number {
  // Yellow-specific processing
  // Yellow is perceptually special - it's one of the four unique hues in human vision
  // and we're most sensitive to hue variations around yellow
  const YELLOW_HUE = ANCHOR_CURVES.yellow.centerHue // 86°
  const YELLOW_RANGE_START = 70  // Amber side
  const YELLOW_RANGE_END = 115   // Lime side (extended to 115° to include pure yellow #ffff00 at H≈110°)

  // Get normal interpolation between adjacent anchors
  const [anchor1, anchor2, ratio] = findAdjacentAnchors(hue)
  const value1 = ANCHOR_CURVES[anchor1][curveType][shade]
  const value2 = ANCHOR_CURVES[anchor2][curveType][shade]

  let normalValue: number
  if (curveType === 'hueShift') {
    normalValue = lerpAngle(value1, value2, ratio)
  } else {
    normalValue = lerp(value1, value2, ratio)
  }

  // Apply yellow influence if in yellow's range
  if (hue >= YELLOW_RANGE_START && hue <= YELLOW_RANGE_END) {
    const distanceToYellow = Math.abs(hue - YELLOW_HUE)
    const yellowInfluence = getYellowInfluence(distanceToYellow, hue)

    if (yellowInfluence > 0) {
      const yellowValue = ANCHOR_CURVES.yellow[curveType][shade]

      // Base blend strength for yellow influence
      // Set to 0.5 for moderate yellow preservation
      // Specific adjustments are applied per curve type below
      let baseStrength = 0.5

      // Apply curve-specific adjustments
      if (curveType === 'hueShift') {
        // Prevent double-greening: If input is already greener than yellow and
        // yellow's hueShift is positive (pushing toward green), dramatically
        // reduce influence to avoid double-shifting toward lime
        if (hue > YELLOW_HUE && yellowValue > 0) {
          baseStrength *= 0.1
        } else if (hue < YELLOW_HUE && yellowValue < 0 && shade >= 600) {
          // Amber-side protection: Prevent dark yellows from collapsing into ochre
          // by clamping negative hueShift in mid/dark tones
          // For amber-side yellows in darker shades, limit how much they can shift
          // toward orange/brown (prevent ochre collapse)
          baseStrength *= 0.4
        }
      } else if (curveType === 'chroma') {
        // Preserve vibrancy: If input is lime-side and yellow's chroma is lower
        // than the interpolated value, reduce influence to maintain lime's higher chroma
        if (hue > YELLOW_HUE && yellowValue < normalValue) {
          baseStrength *= 0.3
        }
      } else if (curveType === 'lightness') {
        // Preserve yellow brightness: When chroma is being reduced (lime-side with
        // lower yellow chroma), apply modest lightness boost to prevent darkening
        // Reduced from 0.85 to 0.3 to avoid over-brightening all shades
        if (hue > YELLOW_HUE && ANCHOR_CURVES.yellow.chroma[shade] < ANCHOR_CURVES.lime.chroma[shade]) {
          baseStrength = Math.max(baseStrength, 0.3)
        }
      }

      const blendStrength = yellowInfluence * baseStrength

      let finalValue: number
      if (curveType === 'hueShift') {
        finalValue = lerpAngle(normalValue, yellowValue, blendStrength)

        // Additional amber-side hueShift clamping for dark shades
        if (hue < YELLOW_HUE && shade >= 600) {
          const MIN_HUE_SHIFT = -6  // Prevent excessive shift toward orange/brown
          finalValue = Math.max(finalValue, MIN_HUE_SHIFT)
        } else if (hue > YELLOW_HUE && shade <= 400) {
          // Cap hueShift toward 90° for high-L shades on lime side to prevent greening
          // Stricter cap for pure yellows (H>105°) to prevent lime drift
          const MAX_HUE_SHIFT = hue > 105 ? 2 : 4
          finalValue = Math.min(finalValue, MAX_HUE_SHIFT)
        }

        // Perceptual optimization: Pure yellow amber warming
        // Pure sRGB yellow (#ffff00, H≈110°) appears artificial and overly bright.
        // Natural yellows (sunlight, egg yolks, honey) are warmer (amber-leaning).
        // This Super-Gaussian correction adds warmth to pure yellows for more
        // natural, pleasant appearance - a perceptual optimization for UI design.
        const PURE_YELLOW_HUE = 110  // sRGB pure yellow (#ffff00)
        const PURE_YELLOW_SIGMA = 8  // Influence range
        const GAUSSIAN_EXPONENT = 4  // Super-Gaussian: sharper falloff than standard Gaussian
        const MAX_AMBER_CORRECTION = -4  // Maximum shift toward amber (negative = warmer)

        const distanceToPureYellow = Math.abs(hue - PURE_YELLOW_HUE)
        const normalizedDist = distanceToPureYellow / PURE_YELLOW_SIGMA
        const pureYellowInfluence = Math.exp(-(normalizedDist ** GAUSSIAN_EXPONENT))
        const amberCorrection = MAX_AMBER_CORRECTION * pureYellowInfluence

        finalValue += amberCorrection
      } else {
        finalValue = lerp(normalValue, yellowValue, blendStrength)
      }

      // Cusp-aware lightness floor: Keep yellows luminous instead of muddy
      if (curveType === 'lightness') {
        const minL = YELLOW_LIGHTNESS_FLOOR[shade]
        finalValue = Math.max(finalValue, minL)
      }

      return finalValue
    }
  }

  return normalValue
}

/**
 * Linear interpolation between two points
 */
function lerp (a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/**
 * Helper to convert OKLCh to Oklab
 */
function oklchToOklab (oklch: OKLCh) {
  const hRad = oklch.h * (Math.PI / 180)
  return {
    l: oklch.l / 100,
    a: (oklch.c / 130) * Math.cos(hRad),
    b: (oklch.c / 130) * Math.sin(hRad)
  }
}

/**
 * Helper to convert Oklab to linear RGB
 */
function oklabToLinearRgb (oklab: { l: number, a: number, b: number }) {
  const l_ = oklab.l + 0.3963377774 * oklab.a + 0.2158037573 * oklab.b
  const m_ = oklab.l - 0.1055613458 * oklab.a - 0.0638541728 * oklab.b
  const s_ = oklab.l - 0.0894841775 * oklab.a - 1.2914855480 * oklab.b

  const l = l_ * l_ * l_
  const m = m_ * m_ * m_
  const s = s_ * s_ * s_

  return {
    r: +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    g: -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    b: -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
  }
}

/**
 * Test if a color is within sRGB gamut
 */
function isInGamut (l: number, c: number, h: number): boolean {
  const oklab = oklchToOklab({ l, c, h })
  const linear = oklabToLinearRgb(oklab)

  return linear.r >= -0.001 && linear.r <= 1.001 &&
    linear.g >= -0.001 && linear.g <= 1.001 &&
    linear.b >= -0.001 && linear.b <= 1.001
}

/**
 * Find the maximum chroma that stays within sRGB gamut for a given L and H
 * Uses binary search to find the gamut boundary
 * OKLCh version - simpler and more accurate than LCh
 */
function findMaxChromaInGamut (l: number, h: number): number {
  // Binary search for maximum chroma
  let low = 0
  let high = 150 // Maximum theoretical chroma (in our scaled units)
  let maxChroma = 0

  // Optimization: Reduced precision from 0.1 to 0.5 for ~40% faster convergence
  // This precision is more than sufficient for color display (imperceptible difference)
  while (high - low > 0.5) {
    const mid = (low + high) / 2
    if (isInGamut(l, mid, h)) {
      maxChroma = mid
      low = mid
    } else {
      high = mid
    }
  }

  return maxChroma
}

/**
 * Generate a Tailwind-style color palette from an input color
 *
 * @param inputHex - Input color in HEX format
 * @param options - Generation options
 * @returns Complete 50-950 color palette
 */
export function generatePalette (
  inputHex: string,
  options: {
    hueShift?: number // Additional hue shift to apply (degrees)
  } = {}
): ColorPalette | null {
  const { hueShift = 0 } = options

  // Convert input to OKLCh
  const inputOklch = hexToOklch(inputHex)
  if (!inputOklch) return null

  // Always use full chroma from anchor curves for Tailwind-style vibrant palettes
  // This ensures all inputs produce equally vibrant palettes
  const chromaScale = 1.0

  // Always use input hue directly as base - no anchor matching
  // This preserves the subtle color variations in the input
  // (e.g., cyan-ish blue vs indigo-ish blue will produce different palettes)
  const baseHue = normalizeHue(inputOklch.h + hueShift)

  // Generate all shades
  const palette: Partial<ColorPalette> = {}

  for (const shade of SHADES) {
    // Always blend between adjacent anchors based on input hue
    // This preserves subtle color variations in the input
    const targetL = getBlendedValue(inputOklch.h, shade, 'lightness')
    const standardChroma = getBlendedValue(inputOklch.h, shade, 'chroma')
    const hShift = getBlendedValue(inputOklch.h, shade, 'hueShift')

    // Calculate final values
    const l = targetL
    const h = normalizeHue(baseHue + hShift)

    // Apply relative chroma scaling
    const scaledChroma = standardChroma * chromaScale

    // Cusp-based chroma floor for yellow range (DISABLED for now)
    // Yellow's sRGB gamut peaks near H≈95 with high C at mid-high L
    // This floor was causing over-saturation of anchor colors
    // May be re-enabled with careful tuning if specific desaturation issues arise
    // if (inputOklch.h >= YELLOW_RANGE_START && inputOklch.h <= YELLOW_RANGE_END) {
    //   const maxChroma = findMaxChromaInGamut(l, h)
    //   const minChroma = maxChroma * 0.50  // 50% of max chroma as conservative floor
    //
    //   if (scaledChroma < minChroma) {
    //     scaledChroma = minChroma
    //   }
    // }

    // Optimization: Early termination if scaledChroma is already in gamut
    // This skips the expensive binary search for ~50-70% of Tailwind colors
    let c: number
    if (isInGamut(l, scaledChroma, h)) {
      // Color is already in gamut, no need for binary search!
      c = scaledChroma
    } else {
      // Color is out of gamut, find the maximum chroma via binary search
      const maxChroma = findMaxChromaInGamut(l, h)
      // Use 99% of max chroma to account for numerical precision in subsequent conversions
      c = Math.min(scaledChroma, maxChroma * 0.99)
    }

    // Convert back to HEX
    const hex = oklchToHex({ l, c, h })
    palette[shade] = hex
  }

  return palette as ColorPalette
}

/**
 * Adjust a single color's hue, lightness, and saturation
 */
export function adjustColor (hex: string, hueShift: number, lightnessShift: number, saturationShift: number): string | null {
  const oklch = hexToOklch(hex)
  if (!oklch) return null

  // Adjust hue
  if (hueShift !== 0) {
    oklch.h = normalizeHue(oklch.h + hueShift)
  }

  // Adjust lightness
  if (lightnessShift !== 0) {
    oklch.l = Math.max(0, Math.min(100, oklch.l + lightnessShift))
  }

  // Adjust saturation (chroma)
  if (saturationShift !== 0) {
    oklch.c = Math.max(0, oklch.c + saturationShift)
  }

  // Ensure chroma stays in gamut
  if (lightnessShift !== 0 || saturationShift !== 0 || hueShift !== 0) {
    if (!isInGamut(oklch.l, oklch.c, oklch.h)) {
      const maxChroma = findMaxChromaInGamut(oklch.l, oklch.h)
      oklch.c = Math.min(oklch.c, maxChroma * 0.99)
    }
  }

  return oklchToHex(oklch)
}

/**
 * Adjust an entire palette's hue, lightness, and saturation
 * Applies the same adjustments to all shades
 */
export function adjustPalette (palette: ColorPalette, hueShift: number, lightnessShift: number, saturationShift: number): ColorPalette {
  const adjusted: Partial<ColorPalette> = {}

  for (const shade of SHADES) {
    const hex = palette[shade]
    const adjustedHex = adjustColor(hex, hueShift, lightnessShift, saturationShift)
    if (adjustedHex) {
      adjusted[shade] = adjustedHex
    }
  }

  return adjusted as ColorPalette
}

/**
 * Get shade labels for UI
 */
export function getShadeLabels (): TailwindShade[] {
  return SHADES
}
