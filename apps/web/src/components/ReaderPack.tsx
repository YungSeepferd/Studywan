import { useEffect, useMemo, useState } from 'react'
import type { Card, Prefs } from '../lib/types'
import { highlightText, type Segment } from '../lib/highlight'
import { getPronunciation } from '../lib/romanization'
import { PopoverFloating } from './ui/PopoverFloating'
import { withBase } from '../lib/url'

type StoryMeta = { id: string; title: string; band: 'A'|'B'|'C'; level: number; topic?: string; path: string; vocabRefs?: string[] }
type Story = { id: string; title: string; band: 'A'|'B'|'C'; level: number; body: string; bodySimp?: string; vocabRefs: string[]; audioUrl?: string }

function pickN<T>(arr: T[], n: number): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = a[i]!
    a[i] = a[j]!
    a[j] = tmp
  }
  return a.slice(0, n)
}

export function ReaderPack(props: {
  level: 1 | 2
  prefs: Prefs
  cards: Card[]
  onDone: (score: number, total: number) => void
  topic?: string | 'All'
  mcq?: 'detail' | 'gist'
  onWrongCard?: (card: Card) => void
}) {
  const [list, setList] = useState<StoryMeta[]>([])
  const [stories, setStories] = useState<Story[]>([])
  const [i, setI] = useState(0)
  const [score, setScore] = useState(0)
  const [played, setPlayed] = useState(false)
  const [openIdx, setOpenIdx] = useState<number | null>(null)
  const [info, setInfo] = useState<{ text: string; pron: string; gloss?: string | undefined } | null>(null)

  useEffect(() => {
    const url = withBase('stories/manifest.json')
    fetch(url).then(r => r.json()).then((items: StoryMeta[]) => {
      let filtered = items.filter(it => it.band === 'A' && it.level === props.level)
      if (props.topic && props.topic !== 'All') filtered = filtered.filter(it => (it.topic || 'misc') === props.topic)
      setList(filtered)
    }).catch(() => setList([]))
  }, [props.level, props.topic])

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

  const segs: Segment[] = useMemo(() => {
    if (!story) return []
    const targets = (story.vocabRefs || [])
      .map(id => props.cards.find(c => c.id === id))
      .filter(Boolean)
      .map(c => props.prefs.scriptMode === 'trad' ? (c as Card).trad : ((c as Card).simp || (c as Card).trad)) as string[]
    return highlightText(text, targets)
  }, [text, story, props.cards, props.prefs.scriptMode])

  function playOnce() {
    if (played || !story?.audioUrl) return
    const a = new Audio(withBase(story.audioUrl))
    a.addEventListener('ended', () => setPlayed(true), { once: true })
    a.play().catch(() => {/* ignore */})
  }

  // MCQ options
  const options = useMemo(() => {
    if (!story) return [] as string[]
    const type = props.mcq || 'detail'
    if (type === 'gist') {
      // Pick topic gist MCQ
      const correct = (list.find(m => m.id === story.id)?.topic) || 'misc'
      const distractTopics = Array.from(new Set(list.map(m => m.topic || 'misc'))).filter(t => t !== correct)
      const opts = pickN([correct, ...distractTopics], 3)
      return opts
    }
    // detail: Which word appears in the story?
    const cardMap = new Map(props.cards.map(c => [c.id, c]))
    const refs = (story.vocabRefs || []).map(id => cardMap.get(id)).filter(Boolean) as Card[]
    const correctCard = refs.length ? refs[0]! : null
    const distractors = pickN(props.cards.filter(c => !story.vocabRefs?.includes(c.id)), 10)
    const words = [] as string[]
    if (correctCard) words.push(props.prefs.scriptMode === 'trad' ? correctCard.trad : (correctCard.simp || correctCard.trad))
    for (const d of distractors) {
      if (words.length >= 3) break
      words.push(props.prefs.scriptMode === 'trad' ? d.trad : (d.simp || d.trad))
    }
    return pickN(words, Math.min(3, words.length))
  }, [story, props.cards, props.prefs.scriptMode, props.mcq, list])

  function answer(opt: string) {
    const type = props.mcq || 'detail'
    let isCorrect = false
    let correctCard: Card | null = null
    if (type === 'gist') {
      const correct = (list.find(m => m.id === story?.id)?.topic) || 'misc'
      isCorrect = opt === correct
    } else {
      const correctWord = (() => {
        if (!story) return ''
        const cardMap = new Map(props.cards.map(c => [c.id, c]))
        const refs = (story.vocabRefs || []).map(id => cardMap.get(id)).filter(Boolean) as Card[]
        correctCard = refs.length ? refs[0]! : null
        return correctCard ? (props.prefs.scriptMode === 'trad' ? correctCard.trad : (correctCard.simp || correctCard.trad)) : ''
      })()
      isCorrect = opt === correctWord
    }
    if (isCorrect) setScore(s => s + 1)
    else if (correctCard && props.onWrongCard) props.onWrongCard(correctCard)
    if (i + 1 >= stories.length) props.onDone(score + (isCorrect ? 1 : 0), stories.length)
    else { setI(i + 1); setPlayed(false) }
  }

  if (!stories.length) return <div>Loading reader pack…</div>

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ color: '#666' }}>Story {i + 1}/{stories.length} • Score: {score}</div>
      <div style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8 }}>
        <div style={{ marginBottom: 8, fontWeight: 600 }}>{story?.title}</div>
        <div style={{ whiteSpace: 'pre-wrap', fontSize: 18 }}>
          {segs.map((s, idx) => {
            if (!s.highlight) return <span key={idx}>{s.text}</span>
            return (
              <PopoverFloating
                key={idx}
                open={openIdx === idx}
                onOpenChange={(o) => setOpenIdx(o ? idx : null)}
                trigger={
                  <button
                    onClick={async () => {
                      const card = (story?.vocabRefs || [])
                        .map(id => props.cards.find(c => c.id === id))
                        .find(c => (props.prefs.scriptMode === 'trad' ? c?.trad : (c?.simp || c?.trad)) === s.text)
                      const pron = card ? await getPronunciation(card!, props.prefs) : ''
                      setInfo({ text: s.text, pron, gloss: card?.gloss_en })
                      setOpenIdx(idx)
                    }}
                    style={{ background: 'transparent', border: 'none', padding: 0, margin: 0, cursor: 'pointer', backgroundColor: '#fff3cd' }}
                    aria-haspopup="dialog"
                    aria-expanded={openIdx === idx}
                  >
                    {s.text}
                  </button>
                }
              >
                <div>
                  <div><strong>{info?.text || s.text}</strong> <span style={{ color: '#555' }}>{info?.pron || ''}</span></div>
                  {info?.gloss && <div style={{ color: '#666', maxWidth: 280 }}>{info.gloss}</div>}
                </div>
              </PopoverFloating>
            )
          })}
        </div>
        <div style={{ marginTop: 8 }}>
          <button onClick={playOnce} disabled={played || !story?.audioUrl}>{played ? 'Played' : 'Play once'}</button>
        </div>
      </div>
      <div>
        <div style={{ marginBottom: 6 }}>
          { (props.mcq || 'detail') === 'detail' ? '哪一個詞出現在這個故事裡？(Which appears in the story?)' : '這個故事主要是關於哪個主題？(What is the main topic?)' }
        </div>
        <div style={{ display: 'grid', gap: 8 }}>
          {options.map((opt, idx) => (
            <button key={idx} onClick={() => answer(opt)}>{opt}</button>
          ))}
        </div>
      </div>
    </div>
  )
}
