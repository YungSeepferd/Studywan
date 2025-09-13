import { describe, it, expect, beforeEach } from 'vitest'
import { withBase } from '../../lib/url'

describe('withBase', () => {
  const orig = (import.meta as any).env?.BASE_URL

  beforeEach(() => {
    ;(import.meta as any).env = { ...(import.meta as any).env, BASE_URL: '/' }
  })

  it('joins with root base', () => {
    ;(import.meta as any).env.BASE_URL = '/'
    expect(withBase('data/x.json')).toBe('/data/x.json')
    expect(withBase('/data/x.json')).toBe('/data/x.json')
  })

  it('joins with nested base', () => {
    expect(withBase('data/x.json', '/StudyWan/')).toBe('/StudyWan/data/x.json')
    expect(withBase('/data/x.json', '/StudyWan/')).toBe('/StudyWan/data/x.json')
  })
})
