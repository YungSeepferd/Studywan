// Simple tone coloring helpers for Pinyin (diacritics) and Zhuyin marks
// Colors chosen for subtlety and contrast; adjust via high-contrast mode in UI if needed

const toneColor = {
  1: '#2563eb', // blue
  2: '#16a34a', // green
  3: '#f59e0b', // amber
  4: '#dc2626', // red
  5: '#6b7280', // neutral (gray)
}

export function colorPinyin(pinyin: string, highContrast = false): (string | { text: string; color: string })[] {
  // Heuristic: detect tone by diacritics on vowels
  // āáǎà (1..4), ēéěè, īíǐì, ōóǒò, ūúǔù, ǖǘǚǜ
  const tones: Record<string, number> = {
    'ā': 1, 'ē': 1, 'ī': 1, 'ō': 1, 'ū': 1, 'ǖ': 1,
    'á': 2, 'é': 2, 'í': 2, 'ó': 2, 'ú': 2, 'ǘ': 2,
    'ǎ': 3, 'ě': 3, 'ǐ': 3, 'ǒ': 3, 'ǔ': 3, 'ǚ': 3,
    'à': 4, 'è': 4, 'ì': 4, 'ò': 4, 'ù': 4, 'ǜ': 4,
  }
  const out: (string | { text: string; color: string })[] = []
  for (const ch of pinyin) {
    const t = tones[ch]
    if (t) out.push({ text: ch, color: highContrast ? '#000' : toneColor[t as 1|2|3|4] })
    else out.push(ch)
  }
  return out
}

export function colorZhuyin(zhuyin: string, highContrast = false): (string | { text: string; color: string })[] {
  // Zhuyin tone marks: ˙ (neutral), ˊ (2), ˇ (3), ˋ (4). First tone often unmarked.
  const markTone: Record<string, number> = { 'ˊ': 2, 'ˇ': 3, 'ˋ': 4 }
  const out: (string | { text: string; color: string })[] = []
  for (const ch of zhuyin) {
    const t = markTone[ch]
    if (t) out.push({ text: ch, color: highContrast ? '#000' : toneColor[t as 2|3|4] })
    else out.push(ch)
  }
  return out
}

