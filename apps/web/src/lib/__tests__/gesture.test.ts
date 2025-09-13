import { describe, it, expect } from 'vitest'
import { gradeFromSwipe } from '../../lib/gesture'

describe('gradeFromSwipe', () => {
  it('returns 5 for right swipe beyond threshold', () => {
    expect(gradeFromSwipe(100, 80)).toBe(5)
  })
  it('returns 0 for left swipe beyond threshold', () => {
    expect(gradeFromSwipe(-120, 80)).toBe(0)
  })
  it('returns null within threshold', () => {
    expect(gradeFromSwipe(20, 80)).toBeNull()
    expect(gradeFromSwipe(-60, 80)).toBeNull()
  })
})

