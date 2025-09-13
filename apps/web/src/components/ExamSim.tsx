import { useEffect, useState } from 'react'
import type { Card, Prefs } from '../lib/types'
import { ListeningDrills } from './ListeningDrills'
import { QuickTest } from './QuickTest'

export function ExamSim(props: {
  cards: Card[]
  prefs: Prefs
  onDone: (score: number, total: number, pass: boolean) => void
}) {
  const [phase, setPhase] = useState<'listen'|'read'>('listen')
  const [listenScore, setListenScore] = useState(0)
  const [listenTotal, setListenTotal] = useState(0)
  const [readScore, setReadScore] = useState(0)
  const [readTotal, setReadTotal] = useState(0)
  const [remaining, setRemaining] = useState(60 * 60) // 60 minutes

  useEffect(() => {
    const t = setInterval(() => setRemaining(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (remaining === 0) {
      const total = listenTotal + readTotal
      const score = listenScore + readScore
      const pass = total ? (score / total) >= 0.7 : false
      props.onDone(score, total, pass)
    }
  }, [remaining])

  if (phase === 'listen') {
    return (
      <div style={{ display: 'grid', gap: 12 }}>
        <div style={{ color: '#666' }}>Exam: Listening • Time left: {Math.floor(remaining/60)}m {remaining%60}s</div>
        <ListeningDrills cards={props.cards} prefs={props.prefs} count={10} onDone={(score, total) => {
          setListenScore(score)
          setListenTotal(total)
          setPhase('read')
        }} />
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ color: '#666' }}>Exam: Reading • Time left: {Math.floor(remaining/60)}m {remaining%60}s</div>
      <QuickTest cards={props.cards} prefs={props.prefs} count={15} onDone={(score, total) => {
        setReadScore(score)
        setReadTotal(total)
        const all = listenTotal + total
        const agg = listenScore + score
        const pass = all ? (agg / all) >= 0.7 : false
        props.onDone(agg, all, pass)
      }} />
    </div>
  )
}

