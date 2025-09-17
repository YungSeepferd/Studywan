export type PathStep = 'study' | 'quick' | 'reader' | 'listen' | 'grammar'

export type StepProgress = {
  attempts: number
  lastScore?: number
  lastTotal?: number
  updatedAt: number
}

export type NodeProgress = {
  startedAt?: number
  steps: Record<PathStep, StepProgress>
}

type ProgressMap = Record<string, NodeProgress>

const KEY = 'pathProgress'

function readAll(): ProgressMap {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}') } catch { return {} }
}

function writeAll(map: ProgressMap) {
  try { localStorage.setItem(KEY, JSON.stringify(map)) } catch {}
}

export function getNodeProgress(nodeId: string): NodeProgress | undefined {
  const all = readAll()
  return all[nodeId]
}

export function markStarted(nodeId: string) {
  const all = readAll()
  const cur: NodeProgress = all[nodeId] || { steps: {} as Record<PathStep, StepProgress> }
  if (!cur.startedAt) cur.startedAt = Date.now()
  all[nodeId] = cur
  writeAll(all)
}

export function markStep(nodeId: string, step: PathStep, score?: number, total?: number) {
  const all = readAll()
  const cur: NodeProgress = all[nodeId] || { steps: {} as Record<PathStep, StepProgress> }
  const sp: StepProgress = cur.steps[step] || { attempts: 0, updatedAt: 0 }
  sp.attempts += 1
  sp.updatedAt = Date.now()
  if (typeof score === 'number') sp.lastScore = score
  if (typeof total === 'number') sp.lastTotal = total
  cur.steps[step] = sp
  all[nodeId] = cur
  writeAll(all)
}

