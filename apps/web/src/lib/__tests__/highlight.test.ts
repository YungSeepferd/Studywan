import { describe, it, expect } from 'vitest'
import { highlightText } from '../../lib/highlight'

describe('highlightText', () => {
  it('highlights longest match first', () => {
    const segs = highlightText('計程車很好', ['計程車', '計程'])
    const joined = segs.map(s => typeof s === 'string' ? s : s.text).join('')
    expect(joined).toBe('計程車很好')
    const highlightSegs = segs.filter((s: any) => (s && typeof s !== 'string' && (s.highlight === true)))
    expect(highlightSegs.length).toBe(1)
    expect((highlightSegs[0] as any).text).toBe('計程車')
  })
})
