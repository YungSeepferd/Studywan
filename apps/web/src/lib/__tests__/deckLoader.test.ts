import { describe, it, expect } from 'vitest'

// Simple smoke tests against the manifests to ensure paths present

async function fetchJson(path: string) {
  // In tests we cannot fetch via HTTP; read file via dynamic import URL
  const fs = await import('node:fs')
  const p = new URL(`../../../public/${path}`, import.meta.url)
  const raw = fs.readFileSync(p, 'utf8')
  return JSON.parse(raw)
}

describe('deck manifest', () => {
  it('includes new A2/B1/B2 program entries', async () => {
    const fs = await import('node:fs')
    const path = new URL('../../../public/data/decks/manifest.json', import.meta.url)
    const list = JSON.parse(fs.readFileSync(path, 'utf8')) as Array<{ id: string; path: string }>
    const ids = list.map(x => x.id)
    expect(ids).toContain('A2a')
    expect(ids).toContain('B1a')
    expect(ids).toContain('B2a')
  })

  it('deck paths resolve to JSON arrays', async () => {
    const fs = await import('node:fs')
    const path = new URL('../../../public/data/decks/manifest.json', import.meta.url)
    const list = JSON.parse(fs.readFileSync(path, 'utf8')) as Array<{ id: string; path: string }>
    const targets = list.filter(x => ['A2a','B1a','B2a'].includes(x.id))
    for (const t of targets) {
      const data = await fetchJson(t.path)
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBeGreaterThan(0)
      expect(data[0].id).toBeTruthy()
    }
  })
})
