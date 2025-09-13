import { describe, it, expect } from 'vitest'
import { getPronunciation } from '../../lib/romanization'
import type { Card, Prefs } from '../../lib/types'

const zhuyinPrefs: Prefs = { scriptMode: 'trad', romanization: 'zhuyin' }
const pinyinPrefs: Prefs = { scriptMode: 'trad', romanization: 'pinyin' }

describe('getPronunciation', () => {
  it('returns pinyin when preference is pinyin', async () => {
    const card: Card = {
      id: 'TEST-001',
      trad: '長',
      pinyin: 'cháng',
      zhuyin: 'ㄔㄤˊ',
      band: 'A',
      level: 1,
    }
    const res = await getPronunciation(card, pinyinPrefs)
    expect(res).toBe('cháng')
  })

  it('returns zhuyin when preference is zhuyin and zhuyin is present', async () => {
    const card: Card = {
      id: 'TEST-002',
      trad: '長',
      pinyin: 'zhǎng',
      zhuyin: 'ㄓㄤˇ',
      band: 'A',
      level: 1,
    }
    const res = await getPronunciation(card, zhuyinPrefs)
    expect(res).toBe('ㄓㄤˇ')
  })

  it('handles polyphonic entries by using card-specific reading', async () => {
    const hang: Card = {
      id: 'POLY-001',
      trad: '行',
      pinyin: 'háng',
      zhuyin: 'ㄏㄤˊ',
      band: 'A',
      level: 1,
    }
    const xing: Card = {
      id: 'POLY-002',
      trad: '行',
      pinyin: 'xíng',
      zhuyin: 'ㄒㄧㄥˊ',
      band: 'A',
      level: 1,
    }
    expect(await getPronunciation(hang, pinyinPrefs)).toBe('háng')
    expect(await getPronunciation(xing, pinyinPrefs)).toBe('xíng')
    expect(await getPronunciation(hang, zhuyinPrefs)).toBe('ㄏㄤˊ')
    expect(await getPronunciation(xing, zhuyinPrefs)).toBe('ㄒㄧㄥˊ')
  })
})

