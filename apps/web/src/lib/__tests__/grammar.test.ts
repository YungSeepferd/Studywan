import { describe, it, expect } from 'vitest'
import { scorePattern } from '../../lib/grammar'

describe('scorePattern', () => {
  it('accepts correct token order', () => {
    const pattern = 'A 跟 B 一樣 + adj'
    const filled = ['A', '跟', 'B', '一樣', 'adj']
    expect(scorePattern(pattern, filled)).toBe(true)
  })
  it('rejects incorrect token order', () => {
    const pattern = '有/沒有 + N'
    const filled = ['沒有', '有/', 'N']
    expect(scorePattern(pattern, filled)).toBe(false)
  })
})

