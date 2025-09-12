import { useEffect, useMemo, useState } from 'react'
import type { Card, Prefs, SrsMap } from './lib/types'
import { loadPrefs, savePrefs, loadSrsMap, saveSrsMap } from './lib/storage'
import { DeckPicker } from './components/DeckPicker'
import { StudyCard } from './components/StudyCard'
import { QuickTest } from './components/QuickTest'
import { ReaderPack } from './components/ReaderPack'
import { StoryViewer } from './components/StoryViewer'
import { initialState, isDue, schedule, type Grade } from './lib/srs'

export default function App() {
  const [prefs, setPrefs] = useState<Prefs>(() => loadPrefs())
  const [view, setView] = useState<'pick' | 'study' | 'quicktest' | 'story' | 'readerpack'>('pick')
  const [deckPath, setDeckPath] = useState<string>('')
  const [cards, setCards] = useState<Card[]>([])
  const [queue, setQueue] = useState<Card[]>([])
  const [index, setIndex] = useState(0)
  const [srsMap, setSrsMap] = useState<SrsMap>({})
  const [qtCount, setQtCount] = useState(10)
  const [storyPath, setStoryPath] = useState<string>('')

  useEffect(() => { savePrefs(prefs) }, [prefs])

  async function loadDeck(path: string) {
    const url = new URL(path, (import.meta as any).env.BASE_URL).toString()
    const data: Card[] = await fetch(url).then(r => {
      if (!r.ok) throw new Error(`Failed to load deck: ${r.status}`)
      return r.json()
    })
    const key = path
    const map = loadSrsMap(key)
    const now = Date.now()
    const due = data.filter(c => {
      const s = map[c.id]
      return s ? s.due <= now : false
    })
    const newCards = data.filter(c => !map[c.id]).slice(0, 20)
    const q = [...due, ...newCards]
    setDeckPath(path)
    setCards(data)
    setSrsMap(map)
    setQueue(q.length ? q : data.slice(0, 20))
    setIndex(0)
    setView('study')
  }

  function onPick(path: string) {
    loadDeck(path).catch(() => {
      alert('Failed to load deck. Ensure the file exists under public/data.')
    })
  }

  const current = queue[index]

  async function openStoryForCard(c: Card) {
    try {
      const manifestUrl = new URL('stories/manifest.json', (import.meta as any).env.BASE_URL).toString()
      const list: { id: string; path: string; vocabRefs?: string[] }[] = await fetch(manifestUrl).then(r => r.json())
      const hit = list.find(item => (item.vocabRefs || []).includes(c.id))
      if (!hit) { alert('No linked story for this card yet.'); return }
      setStoryPath(hit.path)
      setView('story')
    } catch {
      alert('Failed to load stories manifest')
    }
  }

  function grade(g: Grade) {
    if (!current) return
    const key = deckPath
    const prev = srsMap[current.id] || initialState()
    const next = schedule(prev, g)
    const updated = { ...srsMap, [current.id]: next }
    setSrsMap(updated)
    saveSrsMap(key, updated)
    // Move forward
    setIndex(i => Math.min(queue.length - 1, i + 1))
  }

  const dueCount = useMemo(() => {
    const now = Date.now()
    return cards.reduce((n, c) => n + (srsMap[c.id] ? (isDue(srsMap[c.id], now) ? 1 : 0) : 0), 0)
  }, [cards, srsMap])
  const newCount = useMemo(() => cards.filter(c => !srsMap[c.id]).length, [cards, srsMap])

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Noto Sans TC, Arial', padding: 16 }}>
      <header style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
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
        {view === 'study' && (
          <span style={{ color: '#666' }}>
            Deck: {deckPath} | Queue: {queue.length} | Due: {dueCount} | New: {newCount}
          </span>
        )}
      </header>

      {view === 'pick' && (
        <div style={{ display: 'grid', gap: 16 }}>
          <DeckPicker onPick={onPick} />
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <label>Quick Test size:
              <select value={qtCount} onChange={e => setQtCount(Number(e.target.value))}>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </label>
            <button onClick={() => setView('quicktest')} disabled={!cards.length}>Start Quick Test</button>
            <span style={{ color: '#666' }}>Tip: pick a deck first to populate Quick Test.</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <label>Reader Pack (A1/A2):</label>
            <button onClick={() => setView('readerpack')} disabled={!cards.length}>Start A1 Pack</button>
            <span style={{ color: '#666' }}>Picks a few A1/A2 micro-stories with MCQs.</span>
          </div>
        </div>
      )}
      {view === 'study' && current && (
        <div style={{ display: 'grid', gap: 16 }}>
          <StudyCard card={current} prefs={prefs} onGrade={grade} onOpenStory={() => openStoryForCard(current)} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setIndex(i => Math.max(0, i - 1))}>Prev</button>
            <button onClick={() => setIndex(i => Math.min(queue.length - 1, i + 1))}>Next</button>
            <button onClick={() => setView('pick')}>Change Deck</button>
          </div>
        </div>
      )}

      {view === 'study' && !current && (
        <div>
          <p>Queue finished for now. You can change deck or reload to build a new queue.</p>
          <button onClick={() => setView('pick')}>Change Deck</button>
        </div>
      )}

      {view === 'quicktest' && (
        <div style={{ display: 'grid', gap: 16 }}>
          <QuickTest cards={cards.length ? cards : queue} prefs={prefs} count={qtCount} onDone={(score, total) => {
            alert(`Score: ${score}/${total}`)
            setView('pick')
          }} />
          <div>
            <button onClick={() => setView('pick')}>Back</button>
          </div>
        </div>
      )}

      {view === 'readerpack' && (
        <div style={{ display: 'grid', gap: 16 }}>
          <ReaderPack level={1} prefs={prefs} cards={cards} onDone={(score, total) => { alert(`Reader Pack (A1) Score: ${score}/${total}`); setView('pick') }} />
          <ReaderPack level={2} prefs={prefs} cards={cards} onDone={(score, total) => { alert(`Reader Pack (A2) Score: ${score}/${total}`); setView('pick') }} />
          <div>
            <button onClick={() => setView('pick')}>Back</button>
          </div>
        </div>
      )}

      {view === 'story' && storyPath && (
        <StoryViewer storyPath={storyPath} prefs={prefs} onClose={() => setView('study')} />
      )}
    </div>
  )
}
