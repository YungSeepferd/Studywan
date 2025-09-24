import { describe, it, expect } from 'vitest'
import type { Card, SrsMap } from '../../lib/types'
import type { NodeStatus } from '../../lib/pathStatus'
import { __test } from '../../lib/pathStatus'

const { calculateCoverage, getNextRequiredStep } = __test

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
    const { studied, coverage } = calculateCoverage(cards, map)
    expect(studied).toBe(2)
    expect(coverage).toBeCloseTo(2 / 3)
  })

  it('handles empty decks', () => {
    const { studied, coverage } = calculateCoverage([], {})
    expect(studied).toBe(0)
    expect(coverage).toBe(0)
  })
})

describe('getNextRequiredStep', () => {
  const baseStatus: NodeStatus = {
    deckPath: 'deck.json',
    deckSize: 20,
    studiedCount: 0,
    coverage: 0,
    srsRequirement: 0.5,
    srsMet: false,
    study: { attempts: 0 },
    quick: { attempts: 0, requirement: 70, met: false },
    reader: { attempts: 0 },
    listen: { attempts: 0, requirement: 60, met: false },
    grammar: { attempts: 0 },
    nextRequiredStep: null,
  }

  function clone(overrides: Partial<NodeStatus>): NodeStatus {
    return {
      ...baseStatus,
      study: { ...baseStatus.study },
      quick: { ...baseStatus.quick },
      reader: { ...baseStatus.reader },
      listen: { ...baseStatus.listen },
      grammar: { ...baseStatus.grammar },
      ...overrides,
    }
  }

  it('requires study until coverage met', () => {
    expect(getNextRequiredStep(baseStatus)).toBe('study')
    const afterStudy = clone({
      srsMet: true,
      coverage: 0.6,
      study: { attempts: 1 },
    })
    expect(getNextRequiredStep(afterStudy)).toBe('quick')
  })

  it('requires quick test until threshold passed', () => {
    const status = clone({
      srsMet: true,
      coverage: 0.6,
      study: { attempts: 2 },
      quick: { attempts: 1, requirement: 70, met: false },
    })
    expect(getNextRequiredStep(status)).toBe('quick')
    status.quick.met = true
    status.reader.attempts = 0
    expect(getNextRequiredStep(status)).toBe('reader')
  })

  it('falls through to listening and grammar', () => {
    const status = clone({
      srsMet: true,
      coverage: 0.7,
      study: { attempts: 3 },
      quick: { attempts: 2, requirement: 70, met: true },
      reader: { attempts: 1 },
      listen: { attempts: 1, requirement: 60, met: false },
    })
    expect(getNextRequiredStep(status)).toBe('listen')
    status.listen.met = true
    status.grammar.attempts = 0
    expect(getNextRequiredStep(status)).toBe('grammar')
    status.grammar.attempts = 1
    expect(getNextRequiredStep(status)).toBeNull()
  })
})

