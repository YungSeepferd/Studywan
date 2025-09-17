import { describe, it, expect } from 'vitest'
import type { Card, SrsMap } from '../../lib/types'
import { __test } from '../../lib/pathStatus'

describe('pathStatus calculateCoverage', () => {
  it('counts cards with reps or interval progress', () => {
    const cards: Card[] = [
      { id: 'A', trad: '一', pinyin: 'yī', band: 'A', level: 1 },
      { id: 'B', trad: '二', pinyin: 'èr', band: 'A', level: 1 },
      { id: 'C', trad: '三', pinyin: 'sān', band: 'A', level: 1 },
    ]
    const map: SrsMap = {
      A: { ef: 2.5, interval: 1, reps: 1, due: Date.now() },
      B: { ef: 2.5, interval: 0, reps: 0, due: Date.now() },
      C: { ef: 2.5, interval: 6, reps: 2, due: Date.now() },
    }
    const { studied, coverage } = __test.calculateCoverage(cards, map)
    expect(studied).toBe(2)
    expect(coverage).toBeCloseTo(2 / 3)
  })

  it('handles empty decks', () => {
    const { studied, coverage } = __test.calculateCoverage([], {})
    expect(studied).toBe(0)
    expect(coverage).toBe(0)
  })
})

