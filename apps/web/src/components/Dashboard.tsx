import type { Card, SrsMap } from '../lib/types'
import { isDue } from '../lib/srs'
import { getHistory, exportHistory, importHistory } from '../lib/store/history'
import { useState } from 'react'

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
  const [json, setJson] = useState('')

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <div style={{ fontWeight: 600 }}>Progress Dashboard</div>
      <div>Total cards in deck: {total}</div>
      <div>Learned (seen at least once): {learned}</div>
      <div>Due now: {dueNow}</div>
      <div>Scheduled (upcoming): {upcoming}</div>
      <div>Sessions: {totalSessions} • Accuracy: {accuracy}%</div>
      <div style={{ color: '#666', fontSize: 12 }}>Tip: full analytics and charts coming soon.</div>
      <div style={{ borderTop: '1px solid #eee', marginTop: 8, paddingTop: 8 }}>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>Export/Import Sessions</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
          <button onClick={() => setJson(exportHistory())}>Export</button>
          <button onClick={() => { try { importHistory(json); alert('Imported'); } catch { alert('Invalid JSON') } }}>Import</button>
        </div>
        <textarea
          style={{ width: '100%', minHeight: 120, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}
          placeholder="Session JSON will appear here on Export; paste to Import"
          value={json}
          onChange={e => setJson(e.target.value)}
        />
      </div>
    </div>
  )
}
