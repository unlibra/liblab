/**
 * Extract curves for 10 anchor colors for interpolation-based palette generation
 * Anchor colors: red, orange, amber, yellow, lime, green, cyan, blue, purple, pink
 * Using OKLCh color space for better perceptual uniformity
 */

import { hexToOklch } from '../src/lib/color/color-utils'
import type { TailwindColorName, TailwindShade } from '../src/lib/color/tailwind-colors'
import { getShades, tailwindColors } from '../src/lib/color/tailwind-colors'

// 10 anchor colors for interpolation
const ANCHOR_COLORS: TailwindColorName[] = ['red', 'orange', 'amber', 'yellow', 'lime', 'green', 'cyan', 'blue', 'purple', 'pink']

interface AnchorCurve {
  name: TailwindColorName
  centerHue: number
  lightness: Record<TailwindShade, number>
  chroma: Record<TailwindShade, number>
  hueShift: Record<TailwindShade, number>
}

function extractAnchorCurves (): AnchorCurve[] {
  const results: AnchorCurve[] = []

  for (const colorName of ANCHOR_COLORS) {
    // Get center hue (shade 500)
    const hex500 = tailwindColors[colorName][500]
    const oklch500 = hexToOklch(hex500)
    if (!oklch500) continue

    const centerHue = oklch500.h

    // Extract curves
    const lightness: Partial<Record<TailwindShade, number>> = {}
    const chroma: Partial<Record<TailwindShade, number>> = {}
    const hueShift: Partial<Record<TailwindShade, number>> = {}

    const shades = getShades()
    for (const shade of shades) {
      const hex = tailwindColors[colorName][shade]
      const oklch = hexToOklch(hex)
      if (!oklch) continue

      lightness[shade] = oklch.l
      chroma[shade] = oklch.c

      // Calculate hue shift from shade 500
      if (shade !== 500) {
        let shift = oklch.h - centerHue
        // Handle hue wraparound
        if (shift > 180) shift -= 360
        if (shift < -180) shift += 360
        hueShift[shade] = shift
      } else {
        hueShift[shade] = 0.0
      }
    }

    results.push({
      name: colorName,
      centerHue,
      lightness: lightness as Record<TailwindShade, number>,
      chroma: chroma as Record<TailwindShade, number>,
      hueShift: hueShift as Record<TailwindShade, number>
    })
  }

  return results
}

function main () {
  console.log('/**')
  console.log(' * 10 Anchor Colors for Interpolation-based Palette Generation')
  console.log(' * These curves will be blended based on input color hue')
  console.log(' *')
  console.log(' * To update anchor curves in the codebase:')
  console.log(' * 1. Run: npx tsx scripts/extract-anchor-colors.ts > temp-anchors.txt')
  console.log(' * 2. Copy the ANCHOR_CURVES export from temp-anchors.txt')
  console.log(' * 3. Update the ANCHOR_CURVES object in: src/config/anchor-curves.ts')
  console.log(' * 4. Test: npx tsx scripts/test-10-anchors.ts')
  console.log(' */')
  console.log('')

  const anchors = extractAnchorCurves()

  // Generate TypeScript code
  console.log('export type AnchorColorName = \'red\' | \'orange\' | \'amber\' | \'yellow\' | \'lime\' | \'green\' | \'cyan\' | \'blue\' | \'purple\' | \'pink\'\n')

  console.log('export interface AnchorCurves {')
  console.log('  centerHue: number')
  console.log('  lightness: Record<TailwindShade, number>')
  console.log('  chroma: Record<TailwindShade, number>')
  console.log('  hueShift: Record<TailwindShade, number>')
  console.log('}\n')

  console.log('export const ANCHOR_CURVES: Record<AnchorColorName, AnchorCurves> = {')

  for (const anchor of anchors) {
    console.log(`  ${anchor.name}: {`)
    console.log(`    centerHue: ${anchor.centerHue.toFixed(1)},`)

    // Lightness
    console.log('    lightness: {')
    const shades = getShades()
    for (const shade of shades) {
      if (anchor.lightness[shade] !== undefined) {
        console.log(`      ${shade}: ${anchor.lightness[shade].toFixed(1)},`)
      }
    }
    console.log('    },')

    // Chroma
    console.log('    chroma: {')
    for (const shade of shades) {
      if (anchor.chroma[shade] !== undefined) {
        console.log(`      ${shade}: ${anchor.chroma[shade].toFixed(1)},`)
      }
    }
    console.log('    },')

    // Hue Shift
    console.log('    hueShift: {')
    for (const shade of shades) {
      if (anchor.hueShift[shade] !== undefined) {
        console.log(`      ${shade}: ${anchor.hueShift[shade].toFixed(1)},`)
      }
    }
    console.log('    }')

    console.log('  },')
  }

  console.log('}\n')

  // Summary table
  console.log('// Summary of anchor colors:')
  console.log('// Color  | Center Hue | Hue Shift Range      | Notes')
  console.log('// -------|------------|----------------------|------')

  for (const anchor of anchors) {
    const shades = getShades()
    const shifts = shades.map(s => anchor.hueShift[s]).filter(s => s !== undefined)
    const minShift = Math.min(...shifts)
    const maxShift = Math.max(...shifts)

    console.log(
      `// ${anchor.name.padEnd(6)} | ` +
      `${anchor.centerHue.toFixed(1).padStart(9)}° | ` +
      `${minShift.toFixed(1).padStart(6)}° to ${maxShift.toFixed(1).padStart(6)}° | `
    )
  }
}

main()
