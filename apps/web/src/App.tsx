import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import type { Card, Prefs, SrsMap } from './lib/types'
import { loadSrsMap, saveSrsMap } from './lib/storage'
import { DeckPicker } from './components/DeckPicker'
import { StudyCard } from './components/StudyCard'
import { SwipeCard } from './components/SwipeCard'
import { QuickTest } from './components/QuickTest'
import { ListeningDrills } from './components/ListeningDrills'
import { ReaderPack } from './components/ReaderPack'
import { ExamSim } from './components/ExamSim'
import { GrammarDrills } from './components/GrammarDrills'
import { ReaderPackPicker } from './components/ReaderPackPicker'
import { StoryViewer } from './components/StoryViewer'
import { About } from './components/About'
import { CommandPalette } from './components/CommandPalette'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Dashboard } from './components/Dashboard'
import { SettingsDialog } from './components/SettingsDialog'
import { OfflineBadge } from './components/OfflineBadge'
import { initialState, isDue, schedule, type Grade } from './lib/srs'
import { PathView } from './features/path/PathView'
import { PathRunner, type PathStoryLink } from './features/path/PathRunner'
import type { PathNode } from './lib/schema'
import { withBase } from './lib/url'
import { logSession } from './lib/store/history'
import { markStarted, markStep } from './lib/store/pathProgress'
import { getNodeStoryProgress, markStoryCompleted } from './lib/store/storyProgress'
import { computeNodeStatus, type NodeStatus } from './lib/pathStatus'
import { getDeckPathById } from './lib/decks'
import { loadGrammarDeck, loadGrammarDeckManifest } from './lib/grammar'
import { loadStoryManifest, getStoryMetaById, type StoryMeta } from './lib/stories'

import { usePrefs } from './state/usePrefs'

export default function App() {
  const { prefs, setPrefs } = usePrefs()
  const [view, setView] = useState<'pick' | 'study' | 'quicktest' | 'story' | 'readerpack' | 'listening' | 'exam' | 'dashboard' | 'grammar' | 'path' | 'pathRunner'>('pick')
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
  const [showCmd, setShowCmd] = useState(false)
  const prefersReduced = useReducedMotion()
  const [showSettings, setShowSettings] = useState(false)
  const [pathNode, setPathNode] = useState<PathNode | null>(null)
  const [inPathMode, setInPathMode] = useState(false)
  const [reviewedCount, setReviewedCount] = useState(0)
  const [pathStatus, setPathStatus] = useState<NodeStatus | null>(null)
  const [pathStatusKey, setPathStatusKey] = useState(0)
  const [storyManifest, setStoryManifest] = useState<StoryMeta[] | null>(null)
  const [storyContext, setStoryContext] = useState<{ nodeId?: string; storyId: string } | null>(null)
  const [storyProgressKey, setStoryProgressKey] = useState(0)
  const [activeGrammarDeckId, setActiveGrammarDeckId] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const api = {
      setView: (nextView: typeof view) => {
        setView(nextView)
      },
      setCards: (data: Card[]) => {
        setCards(data)
        setQueue(data.slice(0, Math.min(20, data.length)))
        setIndex(0)
      },
      setPrefs: (next: Partial<Prefs>) => setPrefs(p => ({ ...p, ...next })),
      showStory: (story: { path: string }) => {
        setStoryContext(null)
        setStoryPath(story.path)
        setView('story')
      },
    }
    ;(window as any).__STUDYWAN_E2E__ = api
    return () => {
      if ((window as any).__STUDYWAN_E2E__ === api) delete (window as any).__STUDYWAN_E2E__
    }
  }, [setPrefs, setView])

  const invalidatePathStatus = useCallback(() => {
    setPathStatusKey(k => k + 1)
  }, [])

  useEffect(() => {
    let active = true
    loadStoryManifest().then((list) => {
      if (active) setStoryManifest(list)
    }).catch(() => {
      if (active) setStoryManifest([])
    })
    return () => { active = false }
  }, [])

  function GrammarLoader(props: { onDone: () => void; deckId?: string }) {
    const [list, setList] = useState<any[] | null>(null)
    const [title, setTitle] = useState<string>('')
    useEffect(() => {
      let active = true
      async function load() {
        try {
          const manifest = await loadGrammarDeckManifest()
          if (!manifest.length) throw new Error('No grammar decks')
          const fallback = props.deckId
            ? manifest.find(entry => entry.id === props.deckId)
            : manifest.find(entry => entry.id === 'grammar-a1-general') || manifest[0]
          const target = fallback || manifest[0]
          if (!target) throw new Error('No grammar deck available')
          const deck = await loadGrammarDeck(target.id)
          if (!active) return
          setList(deck.items as any)
          setTitle(deck.meta.title || deck.meta.id)
        } catch {
          if (active) {
            setList([])
            setTitle('')
          }
        }
      }
      load()
      return () => { active = false }
    }, [props.deckId])
    if (list === null) return <div>Loading…</div>
    if (!list.length) return <div>Grammar content unavailable.</div>
    return (
      <div style={{ display: 'grid', gap: 12 }}>
        {title && <div style={{ fontWeight: 600 }}>{title}</div>}
        <GrammarDrills items={list as any} onDone={props.onDone} />
      </div>
    )
  }

  // persistence handled by PrefsProvider

  async function loadDeck(path: string, subsetLimit?: number) {
    const url = withBase(path)
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
    const base = q.length ? q : data.slice(0, 20)
    setQueue(subsetLimit ? base.slice(0, subsetLimit) : base)
    setIndex(0)
    setView('study')
  }

  async function startPathStudy(n: PathNode) {
    try {
      const p = await getDeckPathById(n.content.deckId)
      setInPathMode(true)
      setPathNode(n)
      markStarted(n.id)
      invalidatePathStatus()
      setReviewedCount(0)
      await loadDeck(p, 15)
    } catch {
      alert('Failed to start unit study — check deck manifest and path.json')
    }
  }

  function onPick(path: string) {
    loadDeck(path).catch(() => {
      alert('Failed to load deck. Ensure the file exists under public/data.')
    })
  }

  const current = queue[index]

  async function openStoryForCard(c: Card) {
    try {
      const manifestUrl = withBase('stories/manifest.json')
      const list: { id: string; path: string; vocabRefs?: string[] }[] = await fetch(manifestUrl).then(r => r.json())
      const hit = list.find(item => (item.vocabRefs || []).includes(c.id))
      if (!hit) { alert('No linked story for this card yet.'); return }
      setStoryContext(null)
      setStoryPath(hit.path)
      setView('story')
    } catch {
      alert('Failed to load stories manifest')
    }
  }

  const pathStories = useMemo<PathStoryLink[]>(() => {
    if (!pathNode || !(pathNode.content?.storyIds?.length)) return []
    if (!storyManifest) return []
    const progress = getNodeStoryProgress(pathNode.id)
    return pathNode.content.storyIds
      .map((id) => {
        const meta = storyManifest.find(entry => entry.id === id)
        if (!meta) return null
        const state = progress[id]
        return {
          id,
          title: meta.title || id,
          path: meta.path,
          topic: meta.topic,
          completedAt: state?.completedAt,
        } as PathStoryLink
      })
      .filter(Boolean) as PathStoryLink[]
  }, [pathNode, storyManifest, storyProgressKey])

  const pathStoriesLoading = Boolean(pathNode && storyManifest === null)

  const openPathStory = useCallback(async (storyId: string) => {
    try {
      let meta = storyManifest?.find(entry => entry.id === storyId)
      if (!meta) meta = await getStoryMetaById(storyId)
      if (!meta) { alert('Story metadata missing.'); return }
      setStoryContext(pathNode ? { nodeId: pathNode.id, storyId } : { storyId })
      setStoryPath(meta.path)
      setView('story')
    } catch {
      alert('Failed to load story metadata')
    }
  }, [pathNode, storyManifest])

  useEffect(() => {
    if (!pathNode) {
      setPathStatus(null)
      return
    }
    let active = true
    computeNodeStatus(pathNode).then((status) => {
      if (active) setPathStatus(status)
    }).catch(() => {
      if (active) setPathStatus(null)
    })
    return () => { active = false }
  }, [pathNode, pathStatusKey])

  const grade = useCallback((g: Grade) => {
    if (!current) return
    const key = deckPath
    const prev = srsMap[current.id] || initialState()
    const next = schedule(prev, g)
    const updated = { ...srsMap, [current.id]: next }
    setSrsMap(updated)
    saveSrsMap(key, updated)
    setReviewedCount(c => c + 1)
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
  }, [current, deckPath, srsMap, errorBank, queue.length])

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
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault(); setShowCmd(s => !s); return
      }
      if (view !== 'study') return
      if (e.key === '1') grade(0)
      else if (e.key === '2') grade(3)
      else if (e.key === '3') grade(4)
      else if (e.key === '4') grade(5)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [view, grade])

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
        <button onClick={() => setShowSettings(true)} aria-label="Open settings" title="Settings">Settings</button>
        <button onClick={() => setShowAbout(true)} aria-label="About and licences" title="About / Licences">About</button>
        <button onClick={() => {
          const ids = Object.keys(errorBank)
          if (!ids.length) { alert('No leeches yet.'); return }
          const eq = cards.filter(c => ids.includes(c.id))
          if (!eq.length) { alert('No error-bank cards in this deck.'); return }
          setQueue(eq)
          setIndex(0)
          setView('study')
        }} aria-label="Open error bank" title="Error Bank (review leeches)">Error Bank</button>
        
        <span style={{ marginLeft: 'auto', color: '#888', fontSize: 12 }}>Tip: Press ⌘K / Ctrl+K</span>
        {(import.meta as any).env?.DEV && (
          <span style={{ color: '#777', fontSize: 12, border: '1px solid #eee', padding: '2px 6px', borderRadius: 6 }}>
            BASE: {String((import.meta as any).env?.BASE_URL ?? '/')}
          </span>
        )}
      </header>

      {view === 'pick' && (
        <div style={{ display: 'grid', gap: 16 }}>
          <ErrorBoundary>
            <DeckPicker onPick={onPick} />
          </ErrorBoundary>
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
          <ErrorBoundary>
            <ReaderPackPicker onStart={(opts) => {
              // Store opts in URL/hash or state; here, store in local state via sessionStorage
              sessionStorage.setItem('readerpack_opts', JSON.stringify(opts))
              setView('readerpack')
            }} />
          </ErrorBoundary>
        </div>
      )}
      {view === 'study' && current && (
        <div style={{ display: 'grid', gap: 16 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: prefersReduced ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: prefersReduced ? 0 : -8 }}
              transition={{ duration: prefersReduced ? 0 : 0.2 }}
            >
              <SwipeCard onGrade={grade}>
                <StudyCard card={current} prefs={prefs} onGrade={grade} onOpenStory={() => openStoryForCard(current)} />
              </SwipeCard>
            </motion.div>
          </AnimatePresence>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={() => setIndex(i => Math.max(0, i - 1))}>Prev</button>
            <button onClick={() => setIndex(i => Math.min(queue.length - 1, i + 1))}>Next</button>
            <button onClick={() => setView('pick')}>Change Deck</button>
            <button onClick={() => {
              if (pathNode) {
                markStep(pathNode.id, 'study', reviewedCount, queue.length)
                invalidatePathStatus()
              }
              setShowSummary(true)
            }}>End Session</button>
            {pathNode && (
              <button onClick={() => {
                markStep(pathNode.id, 'study', reviewedCount, queue.length)
                invalidatePathStatus()
                setView('pathRunner')
              }}>Back to Path</button>
            )}
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
            logSession({ id: `qt-${Date.now()}`, type: 'quicktest', deck: deckPath, startedAt: Date.now(), endedAt: Date.now(), score, total })
            if (pathNode) {
              markStep(pathNode.id, 'quick', score, total)
              invalidatePathStatus()
            }
            alert(`Score: ${score}/${total}`)
            setView(pathNode ? 'pathRunner' : 'pick')
          }} />
          <div>
            <button onClick={() => { setInPathMode(false); setPathNode(null); setView('pick') }}>Back</button>
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
                }} onDone={(score, total) => {
                  logSession({ id: `rp-${Date.now()}`, type: 'reader', deck: deckPath, startedAt: Date.now(), endedAt: Date.now(), score, total })
                  if (pathNode) {
                    markStep(pathNode.id, 'reader', score, total)
                    invalidatePathStatus()
                  }
                  alert(`Reader Pack Score: ${score}/${total}`)
                  setView(pathNode ? 'pathRunner' : 'pick')
                }} />
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

      {view === 'listening' && (
        <div style={{ display: 'grid', gap: 16 }}>
          <ListeningDrills cards={cards.length ? cards : queue} prefs={prefs} count={10} onDone={(score, total) => {
            logSession({ id: `ls-${Date.now()}`, type: 'listening', deck: deckPath, startedAt: Date.now(), endedAt: Date.now(), score, total })
            if (pathNode) {
              markStep(pathNode.id, 'listen', score, total)
              invalidatePathStatus()
            }
            alert(`Listening Score: ${score}/${total}`)
            setView(pathNode ? 'pathRunner' : 'pick')
          }} />
          <div>
            <button onClick={() => setView('pick')}>Back</button>
          </div>
        </div>
      )}

      {view === 'story' && storyPath && (
        <ErrorBoundary>
          <StoryViewer
            storyPath={storyPath}
            prefs={prefs}
            cards={cards}
            onClose={() => {
              if (storyContext?.nodeId) {
                markStoryCompleted(storyContext.nodeId, storyContext.storyId)
                setStoryProgressKey(k => k + 1)
              }
              const nextView = storyContext?.nodeId && inPathMode ? 'pathRunner' : 'study'
              setStoryContext(null)
              setStoryPath('')
              setView(nextView)
            }}
          />
        </ErrorBoundary>
      )}

      {view === 'exam' && (
        <div style={{ display: 'grid', gap: 16 }}>
          <ExamSim cards={cards.length ? cards : queue} prefs={prefs} onDone={(score, total, pass) => {
            logSession({ id: `ex-${Date.now()}`, type: 'exam', deck: deckPath, startedAt: Date.now(), endedAt: Date.now(), score, total })
            alert(`Exam: ${score}/${total} • ${pass ? 'Pass' : 'Fail'}`)
            setView(pathNode ? 'pathRunner' : 'pick')
          }} />
          <div>
            <button onClick={() => setView('pick')}>Exit</button>
          </div>
        </div>
      )}

      {view === 'dashboard' && (
        <div style={{ display: 'grid', gap: 16 }}>
          <Dashboard cards={cards.length ? cards : queue} srsMap={srsMap} />
          <div>
            <button onClick={() => setView('pick')}>Back</button>
          </div>
        </div>
      )}

      {view === 'path' && (
        <div style={{ display: 'grid', gap: 16 }}>
          <PathView onOpenUnit={(n) => { setPathNode(n); setInPathMode(true); setView('pathRunner') }} />
          <div>
            <button onClick={() => { setInPathMode(false); setPathNode(null); setView('pick') }}>Back</button>
          </div>
        </div>
      )}

      {view === 'pathRunner' && pathNode && (
        <div style={{ display: 'grid', gap: 16 }}>
          <PathRunner
            node={pathNode}
            status={pathStatus}
            stories={pathStories}
            storiesLoading={pathStoriesLoading}
            onOpenStory={openPathStory}
            onRefreshStatus={invalidatePathStatus}
            onBack={() => setView('path')}
            onStartStudy={() => { startPathStudy(pathNode) }}
            onStartQuickTest={() => { setQtCount(10); setView('quicktest') }}
            onStartReader={() => { setView('readerpack') }}
            onStartListening={() => { setView('listening') }}
            onStartGrammar={() => { setActiveGrammarDeckId(pathNode?.content?.grammarDeckId); setView('grammar') }}
          />
        </div>
      )}

      {view === 'grammar' && (
        <div style={{ display: 'grid', gap: 16 }}>
          <GrammarLoader
            {...(activeGrammarDeckId ? { deckId: activeGrammarDeckId } : {})}
            onDone={() => {
              if (pathNode) {
                markStep(pathNode.id, 'grammar')
                invalidatePathStatus()
              }
              setActiveGrammarDeckId(undefined)
              setView(pathNode ? 'pathRunner' : 'pick')
            }}
          />
          <div>
            <button onClick={() => { setActiveGrammarDeckId(undefined); setView('pick') }}>Back</button>
          </div>
        </div>
      )}

      {showSummary && (
        <div style={{ position: 'fixed', inset: 0, display: 'grid', placeItems: 'center' }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReduced ? 0 : 0.2 }}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }}
            onClick={() => setShowSummary(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: prefersReduced ? 1 : 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: prefersReduced ? 1 : 0.98 }}
            transition={{ duration: prefersReduced ? 0 : 0.2 }}
            style={{ background: '#fff', padding: 16, borderRadius: 8, minWidth: 320, position: 'relative' }}
          >
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Session Summary</div>
            <div>Correct: {sessionStats.correct}</div>
            <div>Wrong: {sessionStats.wrong}</div>
            <div>Due now: {dueCount}</div>
            <div>New remaining: {newCount}</div>
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <button onClick={() => { setSessionStats({ correct: 0, wrong: 0 }); setShowSummary(false) }}>Close</button>
              <button onClick={() => { setView('pick'); setShowSummary(false) }}>Return to menu</button>
            </div>
          </motion.div>
        </div>
      )}

      {showAbout && <About onClose={() => setShowAbout(false)} />}
      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />

      <CommandPalette
        open={showCmd}
        onOpenChange={setShowCmd}
        onPickDeck={onPick}
        onStartQuickTest={(n) => { setQtCount(n); setView('quicktest') }}
        onStartReaderPack={() => { setView('readerpack') }}
        onStartListening={() => { setView('listening') }}
        onStartExam={() => { setView('exam') }}
        onOpenDashboard={() => { setView('dashboard') }}
        onStartGrammar={() => { setActiveGrammarDeckId(undefined); setView('grammar') }}
        onOpenPath={() => { setView('path') }}
        onToggleScript={() => setPrefs(p => ({ ...p, scriptMode: p.scriptMode === 'trad' ? 'simp' : 'trad' }))}
        onToggleRomanization={() => setPrefs(p => ({ ...p, romanization: p.romanization === 'zhuyin' ? 'pinyin' : 'zhuyin' }))}
        onOpenErrorBank={() => {
          const ids = Object.keys(errorBank)
          const eq = cards.filter(c => ids.includes(c.id))
          if (!ids.length || !eq.length) { alert('No error bank items for this deck'); return }
          setQueue(eq); setIndex(0); setView('study')
        }}
        onShowAbout={() => setShowAbout(true)}
      />
      <OfflineBadge />
    </div>
  )
}
