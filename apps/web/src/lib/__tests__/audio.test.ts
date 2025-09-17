import { describe, it, expect } from 'vitest'
import { playOnce } from '../../lib/audio'

describe('audio playOnce', () => {
  it('invokes onEnd in non-browser environments', async () => {
    const result = await new Promise<boolean>((resolve) => {
      const stop = playOnce('fake-url.mp3', () => resolve(true))
      expect(typeof stop).toBe('function')
    })
    expect(result).toBe(true)
  })
})

