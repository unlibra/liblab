import type { about as jaAbout } from '../ja/about'
import type { SameStructure } from '../type-utils'

export const about: SameStructure<typeof jaAbout> = {
  title: 'About / Portfolio',
  description: `Portfolio site by the developer.
A collection of past projects and works.`
} as const
