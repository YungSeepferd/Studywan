import type { Card, SrsMap } from '../lib/types'
import { isDue } from '../lib/srs'
import { getHistory } from '../lib/store/history'

export function Dashboard(props: { cards: Card[]; srsMap: SrsMap }) {
  const total = props.cards.length
  const learned = props.cards.filter(c => !!props.srsMap[c.id]).length
  const dueNow = props.cards.filter(c => {
    const s = props.srsMap[c.id]
    return s ? isDue(s, Date.now()) : false
  }).length
  const upcoming = Object.values(props.srsMap).filter(s => s && s.interval > 0).length
  const history = getHistory()
  const totalSessions = history.length
  const totalAnswered = history.reduce((n, h) => n + (h.total || 0), 0)
  const totalScore = history.reduce((n, h) => n + (h.score || 0), 0)
  const accuracy = totalAnswered ? Math.round((100 * totalScore) / totalAnswered) : 0

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <div style={{ fontWeight: 600 }}>Progress Dashboard</div>
      <div>Total cards in deck: {total}</div>
      <div>Learned (seen at least once): {learned}</div>
      <div>Due now: {dueNow}</div>
      <div>Scheduled (upcoming): {upcoming}</div>
      <div>Sessions: {totalSessions} • Accuracy: {accuracy}%</div>
      <div style={{ color: '#666', fontSize: 12 }}>Tip: full analytics and charts coming soon.</div>
    </div>
  )
}
