export type Card = {
  id: string
  trad: string
  simp?: string
  pinyin: string
  zhuyin?: string
  pos?: string
  // Optional mnemonic hint for learners
  hint?: string
  // Regional variants when different across Taiwan/Mainland
  variant_tw?: string
  variant_cn?: string
  // Example sentences (Traditional-first)
  examples?: Array<{
    zh: string
    en?: string
    zhuyin?: string
    pinyin?: string
    audio?: string
  }>
  gloss_en?: string
  band: 'A' | 'B' | 'C'
  level: number
  topic?: string
}

export type Prefs = {
  scriptMode: 'trad' | 'simp'
  romanization: 'zhuyin' | 'pinyin'
  toneColors?: boolean
  highContrast?: boolean
  language?: 'en' | 'de' | 'zh-TW'
}

export type SrsState = {
  ef: number
  interval: number // in days
  reps: number
  due: number // timestamp (ms)
  lapses?: number
}

export type SrsMap = Record<string, SrsState>

export type GrammarCard = {
  id: string
  pattern: string // e.g., "A 跟 B 一樣 + adj"
  structure?: string
  example: { zh: string; en?: string }
  explanation?: string
  band: 'A' | 'B' | 'C'
  level: number
}
