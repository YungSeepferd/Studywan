import { describe, it, expect } from 'vitest'
import fs from 'node:fs'

function readPublicJson(relPath: string): any {
  const p = new URL(`../../../public/${relPath}`, import.meta.url)
  return JSON.parse(fs.readFileSync(p, 'utf8'))
}

describe('A1 level1 gloss sanity', () => {
  const deck = readPublicJson('data/band-A/level1.json') as Array<any>

  function glossOf(id: string): string | undefined {
    return (deck.find((c) => c.id === id) || {}).gloss_en
  }

  it('爺爺/奶奶 have correct glosses', () => {
    expect(glossOf('A1-0002')).toMatch(/grandfather/i)
    expect(glossOf('A1-0003')).toMatch(/grandmother/i)
  })

  it('大人/老人/男生/女生 have sensible glosses', () => {
    expect(glossOf('A1-0006')).toMatch(/adult/i)
    expect(glossOf('A1-0007')).toMatch(/elderly|senior/i)
    expect(glossOf('A1-0009')).toMatch(/boy|male student/i)
    expect(glossOf('A1-0010')).toMatch(/girl|female student/i)
  })
})

