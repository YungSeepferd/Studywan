import { useEffect, useMemo, useState } from 'react'
import type { Card, Prefs } from '../lib/types'

type StoryMeta = { id: string; title: string; band: 'A'|'B'|'C'; level: number; path: string; vocabRefs?: string[] }
type Story = { id: string; title: string; band: 'A'|'B'|'C'; level: number; body: string; bodySimp?: string; vocabRefs: string[]; audioUrl?: string }

function pickN<T>(arr: T[], n: number): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a.slice(0, n)
}

export function ReaderPack(props: {
  level: 1 | 2
  prefs: Prefs
  cards: Card[]
  onDone: (score: number, total: number) => void
}) {
  const [list, setList] = useState<StoryMeta[]>([])
  const [stories, setStories] = useState<Story[]>([])
  const [i, setI] = useState(0)
  const [score, setScore] = useState(0)
  const [played, setPlayed] = useState(false)

  useEffect(() => {
    const url = new URL('stories/manifest.json', (import.meta as any).env.BASE_URL).toString()
    fetch(url).then(r => r.json()).then((items: StoryMeta[]) => {
      const filtered = items.filter(it => it.band === 'A' && it.level === props.level)
      setList(filtered)
    }).catch(() => setList([]))
  }, [props.level])

  useEffect(() => {
    (async () => {
      const chosen = pickN(list, Math.min(5, list.length))
      const loaded: Story[] = []
      for (const m of chosen) {
        const url = new URL(m.path, (import.meta as any).env.BASE_URL).toString()
        // eslint-disable-next-line no-await-in-loop
        const s = await fetch(url).then(r => r.json()).catch(() => null)
        if (s) loaded.push(s)
      }
      setStories(loaded)
      setI(0)
      setScore(0)
      setPlayed(false)
    })()
  }, [list])

  const story = stories[i]
  const text = useMemo(() => {
    if (!story) return ''
    return props.prefs.scriptMode === 'trad' ? story.body : (story.bodySimp || story.body)
  }, [story, props.prefs.scriptMode])

  function playOnce() {
    if (played || !story?.audioUrl) return
    const url = new URL(story.audioUrl, (import.meta as any).env.BASE_URL).toString()
    const a = new Audio(url)
    a.addEventListener('ended', () => setPlayed(true), { once: true })
    a.play().catch(() => {/* ignore */})
  }

  // Build 3-item MCQ: Which of these appears in the story?
  const options = useMemo(() => {
    if (!story) return [] as string[]
    const cardMap = new Map(props.cards.map(c => [c.id, c]))
    const refs = (story.vocabRefs || []).map(id => cardMap.get(id)).filter(Boolean) as Card[]
    const correct = refs.length ? refs[0]! : null
    const distractors = pickN(props.cards.filter(c => !story.vocabRefs?.includes(c.id)), 10)
    const words = [] as string[]
    if (correct) words.push(props.prefs.scriptMode === 'trad' ? correct.trad : (correct.simp || correct.trad))
    for (const d of distractors) {
      if (words.length >= 3) break
      words.push(props.prefs.scriptMode === 'trad' ? d.trad : (d.simp || d.trad))
    }
    return pickN(words, Math.min(3, words.length))
  }, [story, props.cards, props.prefs.scriptMode])

  function answer(opt: string) {
    const correctWord = (() => {
      if (!story) return ''
      const cardMap = new Map(props.cards.map(c => [c.id, c]))
      const refs = (story.vocabRefs || []).map(id => cardMap.get(id)).filter(Boolean) as Card[]
      const correct = refs.length ? refs[0]! : null
      return correct ? (props.prefs.scriptMode === 'trad' ? correct.trad : (correct.simp || correct.trad)) : ''
    })()
    if (opt === correctWord) setScore(s => s + 1)
    if (i + 1 >= stories.length) props.onDone(score + (opt === correctWord ? 1 : 0), stories.length)
    else { setI(i + 1); setPlayed(false) }
  }

  if (!stories.length) return <div>Loading reader pack…</div>

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ color: '#666' }}>Story {i + 1}/{stories.length} • Score: {score}</div>
      <div style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8 }}>
        <div style={{ marginBottom: 8, fontWeight: 600 }}>{story?.title}</div>
        <div style={{ whiteSpace: 'pre-wrap', fontSize: 18 }}>{text}</div>
        <div style={{ marginTop: 8 }}>
          <button onClick={playOnce} disabled={played || !story?.audioUrl}>{played ? 'Played' : 'Play once'}</button>
        </div>
      </div>
      <div>
        <div style={{ marginBottom: 6 }}>哪一個詞出現在這個故事裡？(Which appears in the story?)</div>
        <div style={{ display: 'grid', gap: 8 }}>
          {options.map((opt, idx) => (
            <button key={idx} onClick={() => answer(opt)}>{opt}</button>
          ))}
        </div>
      </div>
    </div>
  )
}

