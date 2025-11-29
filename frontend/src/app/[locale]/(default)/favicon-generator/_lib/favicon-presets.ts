import type { FaviconSize, OutputFile } from '@/lib/generators/favicon'

/**
 * UI preset configurations for Favicon Generator
 */

export const DEFAULT_SIZES: FaviconSize[] = [16, 32]

// Output Set - represents what user selects in UI
export type OutputSetId = 'favicon' | 'apple-touch-icon' | 'android-icon'

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
    description: '', // Translated via i18n key: faviconGenerator.formatDescriptions.favicon
    files: [{ name: 'favicon.ico', size: 'custom' }]
  },
  {
    id: 'apple-touch-icon',
    label: 'Apple Touch Icon',
    description: '', // Translated via i18n key: faviconGenerator.formatDescriptions.apple-touch-icon
    files: [{ name: 'apple-touch-icon.png', size: 180 }]
  },
  {
    id: 'android-icon',
    label: 'Android Icon',
    description: '', // Translated via i18n key: faviconGenerator.formatDescriptions.android-icon
    files: [
      { name: 'icon-192.png', size: 192 },
      { name: 'icon-512.png', size: 512 }
    ]
  }
]

export const DEFAULT_OUTPUT_SETS: OutputSetId[] = ['favicon']
