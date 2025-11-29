/**
 * UI-specific metadata for SVGO options
 * Core types are defined in @/lib/generators/svgo
 */

import type { SvgoOptions } from '@/lib/generators/svgo'

// Plugin names (displayed as-is in UI)
export const PLUGIN_DESCRIPTIONS: Record<keyof SvgoOptions, string> = {
  floatPrecision: 'floatPrecision',
  transformPrecision: 'transformPrecision',
  removeDoctype: 'removeDoctype',
  removeComments: 'removeComments',
  removeMetadata: 'removeMetadata',
  removeTitle: 'removeTitle',
  removeDesc: 'removeDesc',
  removeUselessDefs: 'removeUselessDefs',
  removeEditorsNSData: 'removeEditorsNSData',
  removeEmptyAttrs: 'removeEmptyAttrs',
  removeHiddenElems: 'removeHiddenElems',
  removeEmptyText: 'removeEmptyText',
  removeEmptyContainers: 'removeEmptyContainers',
  removeViewBox: 'removeViewBox',
  cleanupEnableBackground: 'cleanupEnableBackground',
  minifyStyles: 'minifyStyles',
  convertStyleToAttrs: 'convertStyleToAttrs',
  convertColors: 'convertColors',
  convertPathData: 'convertPathData',
  convertTransform: 'convertTransform',
  removeUnknownsAndDefaults: 'removeUnknownsAndDefaults',
  removeNonInheritableGroupAttrs: 'removeNonInheritableGroupAttrs',
  removeUselessStrokeAndFill: 'removeUselessStrokeAndFill',
  removeUnusedNS: 'removeUnusedNS',
  cleanupIds: 'cleanupIds',
  cleanupNumericValues: 'cleanupNumericValues',
  cleanupListOfValues: 'cleanupListOfValues',
  moveElemsAttrsToGroup: 'moveElemsAttrsToGroup',
  moveGroupAttrsToElems: 'moveGroupAttrsToElems',
  collapseGroups: 'collapseGroups',
  removeRasterImages: 'removeRasterImages',
  mergePaths: 'mergePaths',
  convertShapeToPath: 'convertShapeToPath',
  sortAttrs: 'sortAttrs',
  removeDimensions: 'removeDimensions',
  keepScripts: 'keepScripts',
  keepStyleElement: 'keepStyleElement'
}

// Plugin groups for organized UI (labels/descriptions come from i18n)
export const PLUGIN_GROUPS = [
  {
    id: 'cleanup' as const,
    plugins: [
      'removeDoctype',
      'removeComments',
      'removeMetadata',
      'removeEditorsNSData',
      'removeEmptyAttrs',
      'removeHiddenElems',
      'removeEmptyText',
      'removeEmptyContainers',
      'removeUselessDefs',
      'removeUnusedNS',
      'removeRasterImages'
    ] as Array<keyof SvgoOptions>
  },
  {
    id: 'optimization' as const,
    plugins: [
      'cleanupIds',
      'cleanupNumericValues',
      'cleanupListOfValues',
      'cleanupEnableBackground',
      'minifyStyles',
      'convertStyleToAttrs',
      'convertColors',
      'convertPathData',
      'convertTransform',
      'removeUnknownsAndDefaults',
      'removeNonInheritableGroupAttrs',
      'removeUselessStrokeAndFill'
    ] as Array<keyof SvgoOptions>
  },
  {
    id: 'structural' as const,
    plugins: [
      'moveElemsAttrsToGroup',
      'moveGroupAttrsToElems',
      'collapseGroups',
      'mergePaths',
      'convertShapeToPath',
      'sortAttrs'
    ] as Array<keyof SvgoOptions>
  },
  {
    id: 'advanced' as const,
    plugins: [
      'removeTitle',
      'removeDesc',
      'removeViewBox',
      'removeDimensions'
    ] as Array<keyof SvgoOptions>
  },
  {
    id: 'dangerous' as const,
    plugins: [
      'keepScripts',
      'keepStyleElement'
    ] as Array<keyof SvgoOptions>
  }
] as const
