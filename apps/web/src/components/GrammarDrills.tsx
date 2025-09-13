import { useMemo, useState } from 'react'
import type { GrammarCard } from '../lib/types'
import { scorePattern } from '../lib/grammar'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = a[i]!
    a[i] = a[j]!
    a[j] = tmp
  }
  return a
}

export function GrammarDrills(props: {
  items: GrammarCard[]
  onDone: (score: number, total: number) => void
}) {
  const [i, setI] = useState(0)
  const [score, setScore] = useState(0)
  const current = props.items[i]
  const parts = useMemo(() => (current?.pattern || '').split(' '), [current])
  const tokens = useMemo(() => shuffle(parts.filter(p => p && p !== '+')), [current])
  const [filled, setFilled] = useState<string[]>(Array(parts.length).fill(''))
  const [used, setUsed] = useState<Record<number, boolean>>({})
  const blanks = parts.map((p) => (p === '+' ? '+' : '___'))

  function fill(idx: number, tokenIdx: number) {
    if (used[tokenIdx]) return
    const next = filled.slice()
    next[idx] = tokens[tokenIdx] as string
    setFilled(next)
    setUsed({ ...used, [tokenIdx]: true })
  }

  function submit() {
    if (!current) return
    const correct = scorePattern(current.pattern, filled)
    if (correct) setScore(s => s + 1)
    if (i + 1 >= props.items.length) props.onDone(score + (correct ? 1 : 0), props.items.length)
    else { setI(i + 1); setFilled(Array(parts.length).fill('')); setUsed({}) }
  }

  if (!current) return <div>Loading grammar items…</div>

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ color: '#666' }}>Item {i + 1}/{props.items.length}</div>
      <div>Arrange tokens to match the pattern:</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {blanks.map((b, idx) => (
          <button key={idx} onClick={() => {}} disabled style={{ padding: '6px 8px' }}>{filled[idx] || b}</button>
        ))}
      </div>
      <div>Tokens:</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {tokens.map((t, idx) => (
          <button key={idx} disabled={!!used[idx]} onClick={() => {
            // fill next empty slot
            const nextSlot = parts.findIndex((p, k) => p !== '+' && !filled[k])
            if (nextSlot >= 0) fill(nextSlot, idx)
          }}>{t}</button>
        ))}
      </div>
      <div>
        <div style={{ color: '#666', marginBottom: 8 }}>Example: {current.example.zh}</div>
        <button onClick={submit}>Submit</button>
      </div>
    </div>
  )
}
