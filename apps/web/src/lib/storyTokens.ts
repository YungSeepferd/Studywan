import type { Prefs } from './types'

type TokenCarrier = {
  body?: string
  bodySimp?: string
  tokens?: string[]
  tokensTrad?: string[]
  tokensSimp?: string[]
}

/**
 * Select the best available token array for the requested script.
 * Simplified readers fall back to Traditional tokens only when
 * no simplified body exists (legacy story) or tokens are missing.
 */
export function selectStoryTokens(story: TokenCarrier, prefs: Prefs): string[] {
  if (!story) return []
  const tradTokens = story.tokensTrad?.length ? story.tokensTrad : story.tokens || []
  const simpTokens = story.tokensSimp?.length ? story.tokensSimp : []
  if (prefs.scriptMode === 'trad') return tradTokens
  if (prefs.scriptMode === 'simp') {
    if (simpTokens.length) return simpTokens
    if (!story.bodySimp || !story.bodySimp.length) return tradTokens
  }
  return []
}

/**
 * Small helper to detect whether we should attempt runtime segmentation.
 * When we already have script-aligned tokens, skip the extra work.
 */
export function needsSegmentationFallback(tokens: string[]): boolean {
  return !tokens.length
}

