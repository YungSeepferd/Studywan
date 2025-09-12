import type { Card, Prefs } from './types'

let lib: any = null
async function loadLib() {
  if (!lib) {
    lib = await import('pinyin-zhuyin').catch(() => null)
  }
  return lib
}

export async function getPronunciation(card: Card, prefs: Prefs): Promise<string> {
  if (prefs.romanization === 'pinyin') return card.pinyin
  // zhuyin preferred
  if (card.zhuyin && card.zhuyin.trim()) return card.zhuyin
  const l = await loadLib()
  if (l && l.pinyinToZhuyin) {
    try { return l.pinyinToZhuyin(card.pinyin || '') } catch {}
  }
  return ''
}

