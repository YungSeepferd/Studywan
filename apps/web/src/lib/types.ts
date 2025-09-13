export type Card = {
  id: string
  trad: string
  simp?: string
  pinyin: string
  zhuyin?: string
  pos?: string
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
}

export type SrsState = {
  ef: number
  interval: number // in days
  reps: number
  due: number // timestamp (ms)
  lapses?: number
}

export type SrsMap = Record<string, SrsState>
