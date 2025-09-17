import { describe, it, expect } from 'vitest'
import { segment } from '../../lib/segmentation'

describe('segmentation', () => {
  it('returns tokens whose join equals input', async () => {
    const input = '我們都是陌生人。'
    const tokens = await segment(input)
    expect(Array.isArray(tokens)).toBe(true)
    expect(tokens.join('')).toBe(input)
  })
})

