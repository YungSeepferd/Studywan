import type { Card, Prefs } from './types'

let lib: any = null
async function loadLib() {
  if (!lib) {
    try {
      // Avoid bundler static analysis by using dynamic Function
      // eslint-disable-next-line no-new-func
      const dyn = new Function('s', 'return import(s)') as (s: string) => Promise<any>
      lib = await dyn('pinyin-zhuyin')
    } catch {
      lib = null
    }
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
