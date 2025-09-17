import { withBase } from './url'
import type { Card } from './types'

export type DeckMeta = {
  id: string
  title?: string
  band?: string
  level?: number
  topic?: string
  path: string
}

let manifestCache: DeckMeta[] | null = null
let manifestPromise: Promise<DeckMeta[]> | null = null

async function fetchManifest(): Promise<DeckMeta[]> {
  const url = withBase('data/decks/manifest.json')
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to load deck manifest: ${res.status}`)
  const data = (await res.json()) as DeckMeta[]
  return data
}

export async function loadDeckManifest(): Promise<DeckMeta[]> {
  if (manifestCache) return manifestCache
  if (!manifestPromise) {
    manifestPromise = fetchManifest().then((data) => {
      manifestCache = data
      return data
    }).finally(() => {
      manifestPromise = null
    })
  }
  return manifestPromise
}

export async function getDeckMeta(id: string): Promise<DeckMeta> {
  const manifest = await loadDeckManifest()
  const entry = manifest.find((d) => d.id === id)
  if (!entry) throw new Error(`Deck id not found: ${id}`)
  return entry
}

export async function getDeckPathById(id: string): Promise<string> {
  const meta = await getDeckMeta(id)
  return meta.path
}

export async function loadDeckCardsById(id: string): Promise<{ cards: Card[]; meta: DeckMeta }> {
  const meta = await getDeckMeta(id)
  const url = withBase(meta.path)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to load deck ${id}: ${res.status}`)
  const cards = (await res.json()) as Card[]
  return { cards, meta }
}

