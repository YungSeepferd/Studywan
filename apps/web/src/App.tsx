import { useEffect, useMemo, useState } from 'react'
import type { Card, Prefs, SrsMap } from './lib/types'
import { loadSrsMap, saveSrsMap } from './lib/storage'
import { DeckPicker } from './components/DeckPicker'
import { StudyCard } from './components/StudyCard'
import { QuickTest } from './components/QuickTest'
import { ReaderPack } from './components/ReaderPack'
import { ReaderPackPicker } from './components/ReaderPackPicker'
import { StoryViewer } from './components/StoryViewer'
import { About } from './components/About'
import { initialState, isDue, schedule, type Grade } from './lib/srs'

import { usePrefs } from './state/usePrefs'

export default function App() {
  const { prefs, setPrefs } = usePrefs()
  const [view, setView] = useState<'pick' | 'study' | 'quicktest' | 'story' | 'readerpack'>('pick')
  const [deckPath, setDeckPath] = useState<string>('')
  const [cards, setCards] = useState<Card[]>([])
  const [queue, setQueue] = useState<Card[]>([])
  const [index, setIndex] = useState(0)
  const [srsMap, setSrsMap] = useState<SrsMap>({})
  const [qtCount, setQtCount] = useState(10)
  const [storyPath, setStoryPath] = useState<string>('')
  const [sessionStats, setSessionStats] = useState({ correct: 0, wrong: 0 })
  const [showSummary, setShowSummary] = useState(false)
  const [errorBank, setErrorBank] = useState<Record<string, true>>(() => ({}))
  const [showAbout, setShowAbout] = useState(false)

  // persistence handled by PrefsProvider

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
    // session stats
    if (g < 3) setSessionStats(s => ({ ...s, wrong: s.wrong + 1 }))
    else setSessionStats(s => ({ ...s, correct: s.correct + 1 }))
    // leech handling
    if (g < 3 && (next.lapses ?? 0) >= 3) {
      setErrorBank(b => ({ ...b, [current.id]: true }))
      try { localStorage.setItem(`errorBank:${key}`, JSON.stringify({ ...errorBank, [current.id]: true })) } catch {}
    }
    // Move forward
    setIndex(i => Math.min(queue.length - 1, i + 1))
  }

  const dueCount = useMemo(() => {
    const now = Date.now()
    return cards.reduce((n, c) => {
      const s = srsMap[c.id]
      return n + (s ? (isDue(s, now) ? 1 : 0) : 0)
    }, 0)
  }, [cards, srsMap])
  const newCount = useMemo(() => cards.filter(c => !srsMap[c.id]).length, [cards, srsMap])

  // Keyboard shortcuts for grading
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (view !== 'study') return
      if (e.key === '1') grade(0)
      else if (e.key === '2') grade(3)
      else if (e.key === '3') grade(4)
      else if (e.key === '4') grade(5)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [view, current, srsMap])

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
        <button onClick={() => setShowAbout(true)} aria-label="About and licences">About</button>
        <button onClick={() => {
          const ids = Object.keys(errorBank)
          if (!ids.length) { alert('No leeches yet.'); return }
          const eq = cards.filter(c => ids.includes(c.id))
          if (!eq.length) { alert('No error-bank cards in this deck.'); return }
          setQueue(eq)
          setIndex(0)
          setView('study')
        }} aria-label="Open error bank">Error Bank</button>
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
          <ReaderPackPicker onStart={(opts) => {
            // Store opts in URL/hash or state; here, store in local state via sessionStorage
            sessionStorage.setItem('readerpack_opts', JSON.stringify(opts))
            setView('readerpack')
          }} />
        </div>
      )}
      {view === 'study' && current && (
        <div style={{ display: 'grid', gap: 16 }}>
          <StudyCard card={current} prefs={prefs} onGrade={grade} onOpenStory={() => openStoryForCard(current)} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setIndex(i => Math.max(0, i - 1))}>Prev</button>
            <button onClick={() => setIndex(i => Math.min(queue.length - 1, i + 1))}>Next</button>
            <button onClick={() => setView('pick')}>Change Deck</button>
            <button onClick={() => setShowSummary(true)}>End Session</button>
            <button onClick={() => {
              const dataStr = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ deck: deckPath, srs: srsMap, errorBank }))
              const a = document.createElement('a')
              a.href = dataStr
              a.download = 'studywan-progress.json'
              a.click()
            }}>Export Progress</button>
            <label style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
              Import Progress
              <input type="file" accept="application/json" onChange={async (e) => {
                const f = e.target.files?.[0]
                if (!f) return
                const text = await f.text()
                try {
                  const obj = JSON.parse(text)
                  if (obj.srs) {
                    setSrsMap(obj.srs)
                    saveSrsMap(deckPath, obj.srs)
                  }
                  if (obj.errorBank) setErrorBank(obj.errorBank)
                } catch {
                  alert('Invalid progress file')
                }
              }} />
            </label>
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
          {(() => {
            try {
              const raw = sessionStorage.getItem('readerpack_opts') || '{}'
              const opts = JSON.parse(raw) as { level?: 1|2; topic?: string|'All'; mcq?: 'detail'|'gist' }
              const level = opts.level || 1
              return (
                <ReaderPack level={level} topic={opts.topic || 'All'} mcq={opts.mcq || 'detail'} prefs={prefs} cards={cards} onWrongCard={(card) => {
                  const key = deckPath
                  const prev = srsMap[card.id] || initialState()
                  const next = schedule(prev, 0)
                  const updated = { ...srsMap, [card.id]: next }
                  setSrsMap(updated)
                  saveSrsMap(key, updated)
                }} onDone={(score, total) => { alert(`Reader Pack Score: ${score}/${total}`); setView('pick') }} />
              )
            } catch {
              return <div>Error loading reader pack options</div>
            }
          })()}
          <div>
            <button onClick={() => setView('pick')}>Back</button>
          </div>
        </div>
      )}

      {view === 'story' && storyPath && (
        <StoryViewer storyPath={storyPath} prefs={prefs} onClose={() => setView('study')} />
      )}

      {showSummary && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'grid', placeItems: 'center' }}>
          <div style={{ background: '#fff', padding: 16, borderRadius: 8, minWidth: 320 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Session Summary</div>
            <div>Correct: {sessionStats.correct}</div>
            <div>Wrong: {sessionStats.wrong}</div>
            <div>Due now: {dueCount}</div>
            <div>New remaining: {newCount}</div>
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <button onClick={() => { setSessionStats({ correct: 0, wrong: 0 }); setShowSummary(false) }}>Close</button>
              <button onClick={() => { setView('pick'); setShowSummary(false) }}>Return to menu</button>
            </div>
          </div>
        </div>
      )}

      {showAbout && <About onClose={() => setShowAbout(false)} />}
    </div>
  )
}
