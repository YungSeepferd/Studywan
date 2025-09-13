import { describe, it, expect } from 'vitest'
import { initialState, schedule } from '../../lib/srs'

describe('srs schedule', () => {
  it('grades again resets reps and sets due to +1 day', () => {
    const s = initialState(0)
    const next = schedule(s, 0, 0)
    expect(next.reps).toBe(0)
    expect(next.interval).toBe(1)
    expect(next.due).toBeGreaterThan(0)
  })
  it('good promotes interval and reps', () => {
    const s0 = initialState(0)
    const s1 = schedule(s0, 4, 0)
    expect(s1.reps).toBe(1)
    expect(s1.interval).toBe(1)
    const s2 = schedule(s1, 4, 0)
    expect(s2.reps).toBe(2)
    expect(s2.interval).toBe(6)
  })
})

