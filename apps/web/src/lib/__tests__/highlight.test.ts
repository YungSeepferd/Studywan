import { describe, it, expect } from 'vitest'
import { highlightText, highlightTokens } from '../../lib/highlight'

describe('highlight utilities', () => {
  it('highlights longest substring match first', () => {
    const segs = highlightText('計程車很好', ['計程車', '計程'])
    expect(segs.map(s => s.text).join('')).toBe('計程車很好')
    const highlighted = segs.filter(s => s.highlight)
    expect(highlighted.length).toBe(1)
    expect(highlighted[0]?.text).toBe('計程車')
  })

  it('highlights matching tokens when segmentation provides multi-character tokens', () => {
    const tokens = ['計程車', '很', '好']
    const segs = highlightTokens(tokens, ['計程車'])
    expect(segs.map(s => s.text)).toEqual(['計程車', '很好'])
    expect(segs[0]?.highlight).toBe(true)
    expect(segs[1]?.highlight).toBe(false)
  })

  it('highlights consecutive tokens when targets span multiple single-character tokens', () => {
    const tokens = ['請', '勿', '飲', '食']
    const segs = highlightTokens(tokens, ['請勿飲食'])
    expect(segs.map(s => s.text)).toEqual(['請勿飲食'])
    expect(segs[0]?.highlight).toBe(true)
  })
})
