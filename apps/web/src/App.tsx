import { useEffect, useMemo, useState } from 'react'

type Card = {
  id: string
  trad: string
  simp?: string
  pinyin: string
  zhuyin?: string
  pos?: string
  gloss_en?: string
  band: 'A'|'B'|'C'
  level: number
  topic?: string
}

type Prefs = {
  scriptMode: 'trad'|'simp'
  romanization: 'zhuyin'|'pinyin'
}

const defaultPrefs: Prefs = {
  scriptMode: 'trad',
  romanization: 'zhuyin'
}

function usePrefs() {
  const [prefs, setPrefs] = useState<Prefs>(() => {
    try { const s = localStorage.getItem('prefs'); if (s) return JSON.parse(s); } catch {}
    return defaultPrefs
  })
  useEffect(() => { localStorage.setItem('prefs', JSON.stringify(prefs)) }, [prefs])
  return [prefs, setPrefs] as const
}

export default function App() {
  const [prefs, setPrefs] = usePrefs()
  const [cards, setCards] = useState<Card[]>([])
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    // Load A1 deck; you can swap path to topic splits or packs
    const url = new URL('data/band-A/level1.json', (import.meta as any).env.BASE_URL).toString()
    fetch(url)
      .then(r => r.json())
      .then(setCards)
      .catch(() => setCards([]))
  }, [])

  const card = cards[idx]
  const displayHanzi = useMemo(() => {
    if (!card) return ''
    return prefs.scriptMode === 'trad' ? card.trad : (card.simp || card.trad)
  }, [card, prefs.scriptMode])

  const displayPron = useMemo(() => {
    if (!card) return ''
    return prefs.romanization === 'zhuyin' ? (card.zhuyin || '') : card.pinyin
  }, [card, prefs.romanization])

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Noto Sans TC, Arial', padding: 16 }}>
      <header style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
        <strong>StudyWan MVP</strong>
        <label>
          Script:
          <select value={prefs.scriptMode} onChange={e => setPrefs(p => ({...p, scriptMode: e.target.value as any}))}>
            <option value="trad">Traditional</option>
            <option value="simp">Simplified</option>
          </select>
        </label>
        <label>
          Pronunciation:
          <select value={prefs.romanization} onChange={e => setPrefs(p => ({...p, romanization: e.target.value as any}))}>
            <option value="zhuyin">Zhuyin</option>
            <option value="pinyin">Pinyin</option>
          </select>
        </label>
        <span style={{ color: '#666' }}>Cards: {cards.length}</span>
      </header>

      {card ? (
        <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 24, maxWidth: 640 }}>
          <div style={{ fontSize: 64, lineHeight: 1.2, marginBottom: 12 }}>{displayHanzi}</div>
          <div style={{ fontSize: 20, color: '#555', marginBottom: 12 }}>{displayPron}</div>
          <div style={{ fontSize: 14, color: '#777' }}>
            <span>POS: {card.pos || '—'}</span>
            <span style={{ marginLeft: 12 }}>Topic: {card.topic || '—'}</span>
          </div>
          <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
            <button onClick={() => setIdx(i => Math.max(0, i - 1))}>Prev</button>
            <button onClick={() => setIdx(i => Math.min(cards.length - 1, i + 1))}>Next</button>
          </div>
        </div>
      ) : (
        <p>Loading cards…</p>
      )}

      <section style={{ marginTop: 24 }}>
        <p style={{ color: '#777' }}>
          Tip: Put decks under <code>apps/web/public/data/…</code> and update the fetch path.
          Try using topic splits from <code>level1_topics/</code> for smaller sets.
        </p>
      </section>
    </div>
  )
}
