export type SessionType = 'study' | 'quicktest' | 'listening' | 'exam' | 'reader'
export type SessionLog = {
  id: string
  type: SessionType
  deck?: string
  startedAt: number
  endedAt: number
  score?: number
  total?: number
}

const KEY = 'sessionHistory'

export function logSession(entry: SessionLog) {
  try {
    const raw = localStorage.getItem(KEY)
    const list: SessionLog[] = raw ? JSON.parse(raw) : []
    list.push(entry)
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch {}
}

export function getHistory(): SessionLog[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}

export function exportHistory(): string {
  return JSON.stringify(getHistory(), null, 2)
}

export function importHistory(json: string) {
  try { localStorage.setItem(KEY, json) } catch {}
}

