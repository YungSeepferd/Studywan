import { withBase } from './url'

export type StoryMeta = {
  id: string
  title?: string
  band?: 'A' | 'B' | 'C'
  level?: number
  topic?: string
  path: string
  vocabRefs?: string[]
}

let manifestCache: StoryMeta[] | null = null
let manifestPromise: Promise<StoryMeta[]> | null = null

async function fetchManifest(): Promise<StoryMeta[]> {
  const url = withBase('stories/manifest.json')
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to load stories manifest: ${res.status}`)
  return (await res.json()) as StoryMeta[]
}

export async function loadStoryManifest(): Promise<StoryMeta[]> {
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

export async function getStoryMetaById(id: string): Promise<StoryMeta | undefined> {
  const manifest = await loadStoryManifest()
  return manifest.find((entry) => entry.id === id)
}

export function clearStoryManifestCache() {
  manifestCache = null
}

