import { withBase } from './url'

export type GrammarExample = {
  zh: string
  en?: string
}

export type GrammarItem = {
  id: string
  pattern: string
  example?: GrammarExample
  band?: string
  level?: number
  note?: string
}

export type GrammarDeckMeta = {
  id: string
  title?: string
  level?: number
  path: string
}

export type GrammarDeck = {
  meta: GrammarDeckMeta
  items: GrammarItem[]
}

let manifestCache: GrammarDeckMeta[] | null = null
let manifestPromise: Promise<GrammarDeckMeta[]> | null = null

async function fetchManifest(): Promise<GrammarDeckMeta[]> {
  const url = withBase('data/grammar/manifest.json')
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to load grammar manifest: ${res.status}`)
  return (await res.json()) as GrammarDeckMeta[]
}

export async function loadGrammarDeckManifest(): Promise<GrammarDeckMeta[]> {
  if (manifestCache) return manifestCache
  if (!manifestPromise) {
    manifestPromise = fetchManifest().then((list) => {
      manifestCache = list
      return list
    }).finally(() => {
      manifestPromise = null
    })
  }
  return manifestPromise
}

export async function getGrammarDeckMeta(id: string): Promise<GrammarDeckMeta | undefined> {
  const manifest = await loadGrammarDeckManifest()
  return manifest.find((entry) => entry.id === id)
}

export async function loadGrammarDeck(id: string): Promise<GrammarDeck> {
  const meta = await getGrammarDeckMeta(id)
  if (!meta) throw new Error(`Grammar deck id not found: ${id}`)
  const url = withBase(meta.path)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to load grammar deck ${id}: ${res.status}`)
  const items = (await res.json()) as GrammarItem[]
  return { meta, items }
}

export function scorePattern(pattern: string, filled: string[]): boolean {
  const expected = pattern.split(' ').filter(p => p && p !== '+')
  const answers = filled.filter(Boolean)
  if (answers.length !== expected.length) return false
  return expected.every((token, idx) => answers[idx] === token)
}

export function clearGrammarManifestCache() {
  manifestCache = null
}

