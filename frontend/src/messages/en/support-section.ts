import type { supportSection as jaSupportSection } from '../ja/support-section'
import type { SameStructure } from '../type-utils'

export const supportSection: SameStructure<typeof jaSupportSection> = {
  title: 'Your support means the world!',
  shareOnX: 'Share on X',
  sendTip: 'Send a Tip',
  share: 'Share'
} as const
