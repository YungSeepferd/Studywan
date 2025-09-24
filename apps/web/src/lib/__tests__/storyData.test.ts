import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

describe('story token integrity', () => {
  const storiesDir = path.resolve(__dirname, '../../../public/stories')
  const storyFiles = readdirSync(storiesDir).filter((f) => f.endsWith('.json') && f !== 'manifest.json')

  for (const file of storyFiles) {
    const data = JSON.parse(readFileSync(path.join(storiesDir, file), 'utf8')) as {
      body: string
      bodySimp?: string
      tokens?: string[]
      tokensTrad?: string[]
      tokensSimp?: string[]
    }
    it(`reconstructs ${file}`, () => {
      const tradTokens = data.tokensTrad?.length ? data.tokensTrad : data.tokens || []
      if (tradTokens.length) {
        expect(tradTokens.join('')).toBe(data.body)
      }
      if (data.bodySimp) {
        expect(data.tokensSimp && data.tokensSimp.length ? data.tokensSimp.join('') : tradTokens.join('')).toBe(data.bodySimp)
      }
    })
  }
})
