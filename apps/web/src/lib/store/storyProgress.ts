export type StoryState = {
  completedAt: number
  attempts: number
}

export type NodeStoryProgress = Record<string, StoryState>

const KEY = 'storyProgress'

function readAll(): Record<string, NodeStoryProgress> {
  if (typeof localStorage === 'undefined') return {}
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return typeof parsed === 'object' && parsed ? parsed : {}
  } catch {
    return {}
  }
}

function writeAll(map: Record<string, NodeStoryProgress>) {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(KEY, JSON.stringify(map))
  } catch {}
}

function sanitizeNode(node?: NodeStoryProgress): NodeStoryProgress {
  if (!node || typeof node !== 'object') return {}
  const clean: NodeStoryProgress = {}
  for (const [storyId, state] of Object.entries(node)) {
    if (!state || typeof state !== 'object') continue
    const completedAt = typeof state.completedAt === 'number' ? state.completedAt : 0
    const attempts = typeof state.attempts === 'number' ? state.attempts : 0
    if (completedAt <= 0) continue
    clean[storyId] = { completedAt, attempts }
  }
  return clean
}

export function getNodeStoryProgress(nodeId: string): NodeStoryProgress {
  const all = readAll()
  return sanitizeNode(all[nodeId])
}

export function markStoryCompleted(nodeId: string, storyId: string) {
  if (!nodeId || !storyId) return
  const all = readAll()
  const node = sanitizeNode(all[nodeId])
  const prev = node[storyId]
  const now = Date.now()
  node[storyId] = {
    completedAt: now,
    attempts: (prev?.attempts ?? 0) + 1,
  }
  all[nodeId] = node
  writeAll(all)
}

export function clearStoryProgress() {
  if (typeof localStorage === 'undefined') return
  try { localStorage.removeItem(KEY) } catch {}
}

