import { useEffect, useMemo, useState } from 'react'
import type { Card, Prefs } from '../lib/types'

type Q = {
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

function buildQuestions(cards: Card[], count: number): Q[] {
  const base = pickN(cards, Math.min(count, cards.length))
  return base.map((c) => {
    const distractors = pickN(cards.filter(x => x.id !== c.id), 3)
    const opts = pickN([c, ...distractors], 4)
    return { correct: c, options: opts }
  })
}

export function QuickTest(props: {
  cards: Card[]
  prefs: Prefs
  count: number
  onDone: (score: number, total: number) => void
}) {
  const [qs, setQs] = useState<Q[]>([])
  const [i, setI] = useState(0)
  const [score, setScore] = useState(0)
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    setQs(buildQuestions(props.cards, props.count))
    setI(0)
    setScore(0)
    setSeconds(0)
  }, [props.cards, props.count])

  useEffect(() => {
    const t = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const q = qs[i]
  const prompt = q?.correct.pinyin

  function choose(c: Card) {
    if (!q) return
    if (c.id === q.correct.id) setScore(s => s + 1)
    if (i + 1 >= qs.length) props.onDone(score + (c.id === q.correct.id ? 1 : 0), qs.length)
    else setI(i + 1)
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ color: '#666' }}>Question {i + 1}/{qs.length} • Time: {seconds}s</div>
      {q ? (
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ fontSize: 20 }}>Select the correct Hanzi for: <strong>{prompt}</strong></div>
          <div style={{ display: 'grid', gap: 8 }}>
            {q.options.map((opt) => {
              const hanzi = props.prefs.scriptMode === 'trad' ? opt.trad : (opt.simp || opt.trad)
              return (
                <button key={opt.id} onClick={() => choose(opt)}>{hanzi}</button>
              )
            })}
          </div>
        </div>
      ) : (
        <div>Preparing questions…</div>
      )}
    </div>
  )
}
