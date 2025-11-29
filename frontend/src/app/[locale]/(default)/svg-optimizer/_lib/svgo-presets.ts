import type { SvgoOptions } from '@/lib/generators/svgo'

/**
 * Preset configurations for SVG Optimizer UI
 */

export const PRESET_SAFE: SvgoOptions = {
  // Numeric values
  floatPrecision: 3,
  transformPrecision: 5,

  // Plugins (safe defaults)
  removeDoctype: true,
  removeComments: true,
  removeMetadata: true,
  removeTitle: false, // Keep title for accessibility
  removeDesc: false, // Keep description for accessibility
  removeUselessDefs: true,
  removeEditorsNSData: true,
  removeEmptyAttrs: true,
  removeHiddenElems: true,
  removeEmptyText: true,
  removeEmptyContainers: true,
  removeViewBox: false, // Keep viewBox for responsive SVGs
  cleanupEnableBackground: true,
  minifyStyles: true,
  convertStyleToAttrs: true,
  convertColors: true,
  convertPathData: true,
  convertTransform: true,
  removeUnknownsAndDefaults: true,
  removeNonInheritableGroupAttrs: true,
  removeUselessStrokeAndFill: true,
  removeUnusedNS: true,
  cleanupIds: true,
  cleanupNumericValues: true,
  cleanupListOfValues: true,
  moveElemsAttrsToGroup: true,
  moveGroupAttrsToElems: true,
  collapseGroups: true,
  removeRasterImages: false,
  mergePaths: true,
  convertShapeToPath: true,
  sortAttrs: false,
  removeDimensions: false,

  // Security (safe defaults)
  keepScripts: false,
  keepStyleElement: false
}

export const PRESET_SVGO_DEFAULT: SvgoOptions = {
  // Numeric values
  floatPrecision: 3,
  transformPrecision: 5,

  // SVGO's actual default preset
  removeDoctype: true,
  removeComments: true,
  removeMetadata: true,
  removeTitle: true, // SVGO removes by default
  removeDesc: true, // SVGO removes by default
  removeUselessDefs: true,
  removeEditorsNSData: true,
  removeEmptyAttrs: true,
  removeHiddenElems: true,
  removeEmptyText: true,
  removeEmptyContainers: true,
  removeViewBox: true, // SVGO removes by default
  cleanupEnableBackground: true,
  minifyStyles: true,
  convertStyleToAttrs: true,
  convertColors: true,
  convertPathData: true,
  convertTransform: true,
  removeUnknownsAndDefaults: true,
  removeNonInheritableGroupAttrs: true,
  removeUselessStrokeAndFill: true,
  removeUnusedNS: true,
  cleanupIds: true,
  cleanupNumericValues: true,
  cleanupListOfValues: true,
  moveElemsAttrsToGroup: true,
  moveGroupAttrsToElems: true,
  collapseGroups: true,
  removeRasterImages: false,
  mergePaths: true,
  convertShapeToPath: true,
  sortAttrs: false,
  removeDimensions: false,

  // Security (safe defaults)
  keepScripts: false,
  keepStyleElement: false
}

export const PRESET_MAXIMUM: SvgoOptions = {
  // Numeric values (lower precision = smaller file)
  floatPrecision: 1,
  transformPrecision: 3,

  // Maximum compression - enable everything
  removeDoctype: true,
  removeComments: true,
  removeMetadata: true,
  removeTitle: true,
  removeDesc: true,
  removeUselessDefs: true,
  removeEditorsNSData: true,
  removeEmptyAttrs: true,
  removeHiddenElems: true,
  removeEmptyText: true,
  removeEmptyContainers: true,
  removeViewBox: true,
  cleanupEnableBackground: true,
  minifyStyles: true,
  convertStyleToAttrs: true,
  convertColors: true,
  convertPathData: true,
  convertTransform: true,
  removeUnknownsAndDefaults: true,
  removeNonInheritableGroupAttrs: true,
  removeUselessStrokeAndFill: true,
  removeUnusedNS: true,
  cleanupIds: true,
  cleanupNumericValues: true,
  cleanupListOfValues: true,
  moveElemsAttrsToGroup: true,
  moveGroupAttrsToElems: true,
  collapseGroups: true,
  removeRasterImages: true, // Remove embedded images
  mergePaths: true,
  convertShapeToPath: true,
  sortAttrs: true,
  removeDimensions: true, // Remove width/height

  // Security (safe defaults)
  keepScripts: false,
  keepStyleElement: false
}

export const DEFAULT_SVGO_OPTIONS = PRESET_SAFE

export type PresetId = 'safe' | 'svgo-default' | 'maximum'

export const PRESETS = [
  {
    id: 'safe' as const,
    options: PRESET_SAFE
  },
  {
    id: 'svgo-default' as const,
    options: PRESET_SVGO_DEFAULT
  },
  {
    id: 'maximum' as const,
    options: PRESET_MAXIMUM
  }
] as const
