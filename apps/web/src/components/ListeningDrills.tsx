import { useEffect, useMemo, useRef, useState } from 'react'
import type { Card, Prefs } from '../lib/types'

type Item = {
  correct: Card
  options: Card[]
}

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

function buildItems(cards: Card[], count: number): Item[] {
  const base = pickN(cards, Math.min(count, cards.length))
  return base.map((c) => {
    const distractors = pickN(cards.filter(x => x.id !== c.id), 3)
    const opts = pickN([c, ...distractors], 4)
    return { correct: c, options: opts }
  })
}

export function ListeningDrills(props: {
  cards: Card[]
  prefs: Prefs
  count: number
  itemSeconds?: number
  onDone: (score: number, total: number) => void
}) {
  const [items, setItems] = useState<Item[]>([])
  const [i, setI] = useState(0)
  const [score, setScore] = useState(0)
  const [remaining, setRemaining] = useState(0)
  const [playedOnce, setPlayedOnce] = useState(false)
  const [chosen, setChosen] = useState<string | null>(null)
  const timer = useRef<number | null>(null)
  const perItem = props.itemSeconds ?? 10

  useEffect(() => {
    const it = buildItems(props.cards, props.count)
    setItems(it)
    setI(0)
    setScore(0)
    setRemaining(perItem)
    setPlayedOnce(false)
    setChosen(null)
  }, [props.cards, props.count, perItem])

  useEffect(() => {
    if (!playedOnce) return
    if (remaining <= 0) return
    timer.current = window.setTimeout(() => setRemaining((s) => s - 1), 1000)
    return () => { if (timer.current) window.clearTimeout(timer.current) }
  }, [playedOnce, remaining])

  const current = items[i]
  const prompt = useMemo(() => current?.correct.pinyin || '', [current])

  function playOnce() {
    if (!current || playedOnce) return
    setPlayedOnce(true)
    setRemaining(perItem)
    // Placeholder: if audio available in card, play it; else speechSynthesis for dev
    const uttText = current.correct.pinyin || ''
    try {
      if ('speechSynthesis' in window) {
        const utt = new SpeechSynthesisUtterance(uttText)
        utt.lang = 'zh-TW'
        window.speechSynthesis.speak(utt)
      }
    } catch {}
  }

  function choose(c: Card) {
    if (!current) return
    if (chosen) return
    setChosen(c.id)
    if (c.id === current.correct.id) setScore((s) => s + 1)
  }

  function next() {
    if (i + 1 >= items.length) {
      props.onDone(score, items.length)
      return
    }
    setI(i + 1)
    setPlayedOnce(false)
    setChosen(null)
    setRemaining(perItem)
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ color: '#666' }}>Item {i + 1}/{items.length} • Remaining: {playedOnce ? `${remaining}s` : '—'}</div>
      {current ? (
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={playOnce} disabled={playedOnce}>Play prompt</button>
            <span style={{ color: '#666' }}>(once only)</span>
          </div>
          <div style={{ fontSize: 12, color: '#888' }}>Dev hint: {prompt}</div>
          <div style={{ display: 'grid', gap: 8 }}>
            {current.options.map((opt) => {
              const label = props.prefs.scriptMode === 'trad' ? opt.trad : (opt.simp || opt.trad)
              const isCorrect = opt.id === current.correct.id
              const isChosen = chosen === opt.id
              const bg = chosen ? (isCorrect ? '#daf5d7' : isChosen ? '#ffd6d6' : '#fff') : '#fff'
              return (
                <button key={opt.id} onClick={() => choose(opt)} disabled={!playedOnce || !!chosen} style={{ background: bg }}>
                  {label}
                </button>
              )
            })}
          </div>
          <div>
            <button onClick={next} disabled={!playedOnce}>Next</button>
          </div>
        </div>
      ) : (
        <div>Preparing items…</div>
      )}
    </div>
  )
}

