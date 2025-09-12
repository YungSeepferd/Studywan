import type { SrsMap, Prefs } from './types'

export function loadPrefs(): Prefs {
  try {
    const raw = localStorage.getItem('prefs')
    if (raw) return JSON.parse(raw)
  } catch {}
  return { scriptMode: 'trad', romanization: 'zhuyin' }
}

export function savePrefs(p: Prefs) {
  localStorage.setItem('prefs', JSON.stringify(p))
}

function deckKeyKey(deckKey: string) {
  return `srs:${deckKey}`
}

export function loadSrsMap(deckKey: string): SrsMap {
  try {
    const raw = localStorage.getItem(deckKeyKey(deckKey))
    if (raw) return JSON.parse(raw)
  } catch {}
  return {}
}

export function saveSrsMap(deckKey: string, map: SrsMap) {
  localStorage.setItem(deckKeyKey(deckKey), JSON.stringify(map))
}

