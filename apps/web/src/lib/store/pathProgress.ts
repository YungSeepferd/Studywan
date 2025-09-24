export type PathStep = 'study' | 'quick' | 'reader' | 'listen' | 'grammar'

export type StepAttempt = {
  score?: number
  total?: number
  completedAt: number
}

const HISTORY_LIMIT = 20
const PATH_STEPS: PathStep[] = ['study', 'quick', 'reader', 'listen', 'grammar']

export type StepProgress = {
  attempts: number
  lastScore?: number
  lastTotal?: number
  updatedAt: number
  history: StepAttempt[]
}

export type NodeProgress = {
  startedAt?: number
  steps: Partial<Record<PathStep, StepProgress>>
}

type StoredProgressMap = Record<string, NodeProgress | undefined | null | LegacyNodeProgress>

type LegacyStepProgress = {
  attempts?: number
  lastScore?: number
  lastTotal?: number
  updatedAt?: number
  history?: StepAttempt[]
}

type LegacyNodeProgress = {
  startedAt?: number
  steps?: Partial<Record<PathStep, LegacyStepProgress>>
}

const KEY = 'pathProgress'

function readAll(): StoredProgressMap {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}') as StoredProgressMap
  } catch {
    return {}
  }
}

function writeAll(map: StoredProgressMap) {
  try {
    localStorage.setItem(KEY, JSON.stringify(map))
  } catch {}
}

function normalizeStepProgress(step?: LegacyStepProgress | StepProgress): StepProgress {
  const normalized: StepProgress = {
    attempts: typeof step?.attempts === 'number' ? step.attempts : 0,
    updatedAt: typeof step?.updatedAt === 'number' ? step.updatedAt : 0,
    history: Array.isArray(step?.history) ? sanitizeHistory(step.history) : [],
  }

  if (typeof step?.lastScore === 'number') normalized.lastScore = step.lastScore
  if (typeof step?.lastTotal === 'number') normalized.lastTotal = step.lastTotal

  if (!normalized.history.length && normalized.updatedAt > 0) {
    const attempt: StepAttempt = { completedAt: normalized.updatedAt }
    if (typeof normalized.lastScore === 'number') attempt.score = normalized.lastScore
    if (typeof normalized.lastTotal === 'number') attempt.total = normalized.lastTotal
    normalized.history = [attempt]
  }

  return normalized
}

function sanitizeHistory(history: StepAttempt[]): StepAttempt[] {
  const sanitized: StepAttempt[] = []
  history.forEach((item) => {
    if (!item || typeof item !== 'object') return
    if (typeof item.completedAt !== 'number') return
    const attempt: StepAttempt = { completedAt: item.completedAt }
    if (typeof item.score === 'number') attempt.score = item.score
    if (typeof item.total === 'number') attempt.total = item.total
    sanitized.push(attempt)
  })
  return sanitized.slice(-HISTORY_LIMIT)
}

function normalizeNodeProgress(node?: NodeProgress | LegacyNodeProgress | null): NodeProgress | undefined {
  if (!node) return undefined
  const normalized: NodeProgress = { steps: {} }
  if (typeof node.startedAt === 'number') normalized.startedAt = node.startedAt
  const source = node.steps || {}
  PATH_STEPS.forEach(step => {
    const value = source[step]
    if (value) normalized.steps[step] = normalizeStepProgress(value)
  })
  return normalized
}

export function getNodeProgress(nodeId: string): NodeProgress | undefined {
  const all = readAll()
  return normalizeNodeProgress(all[nodeId])
}

export function markStarted(nodeId: string) {
  const all = readAll()
  const cur = normalizeNodeProgress(all[nodeId]) || { steps: {} }
  if (!cur.startedAt) cur.startedAt = Date.now()
  all[nodeId] = cur
  writeAll(all)
}

export function markStep(nodeId: string, step: PathStep, score?: number, total?: number) {
  const all = readAll()
  const cur = normalizeNodeProgress(all[nodeId]) || { steps: {} }
  const now = Date.now()
  const progress = normalizeStepProgress(cur.steps[step])
  progress.attempts += 1
  progress.updatedAt = now
  if (typeof score === 'number') progress.lastScore = score
  if (typeof total === 'number') progress.lastTotal = total
  const attempt: StepAttempt = { completedAt: now }
  if (typeof score === 'number') attempt.score = score
  if (typeof total === 'number') attempt.total = total
  progress.history = [...progress.history, attempt].slice(-HISTORY_LIMIT)
  cur.steps[step] = progress
  if (!cur.startedAt) cur.startedAt = now
  all[nodeId] = cur
  writeAll(all)
}

