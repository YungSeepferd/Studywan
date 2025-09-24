import { describe, it, expect } from 'vitest'
import type { Prefs } from '../../lib/types'
import { selectStoryTokens } from '../../lib/storyTokens'

const baseStory = {
  body: '計程車很好玩',
  bodySimp: '出租车很好玩',
  tokens: ['計', '程', '車', '很', '好', '玩'],
  tokensTrad: ['計程車', '很', '好玩'],
  tokensSimp: ['出租车', '很', '好玩'],
}

const tradPrefs = { scriptMode: 'trad', romanization: 'pinyin' } as Prefs
const simpPrefs = { scriptMode: 'simp', romanization: 'pinyin' } as Prefs

describe('selectStoryTokens', () => {
  it('returns Traditional tokens for Traditional mode', () => {
    expect(selectStoryTokens(baseStory, tradPrefs)).toEqual(['計程車', '很', '好玩'])
  })

  it('returns Simplified tokens for Simplified mode when provided', () => {
    expect(selectStoryTokens(baseStory, simpPrefs)).toEqual(['出租车', '很', '好玩'])
  })

  it('falls back to Traditional tokens when story lacks simplified body', () => {
    const story = {
      body: baseStory.body,
      tokens: baseStory.tokens,
      tokensTrad: baseStory.tokensTrad,
    }
    expect(selectStoryTokens(story, simpPrefs)).toEqual(['計程車', '很', '好玩'])
  })

  it('returns empty array when no tokens exist and simplified data is present', () => {
    const story = { body: '計程車', bodySimp: '出租车' }
    expect(selectStoryTokens(story, simpPrefs)).toEqual([])
  })
})
