import { useEffect, useState } from 'react'
import type { PathDoc, PathNode } from '../../lib/schema'
import { loadPath } from '../../lib/path'
import { getNodeProgress } from '../../lib/store/pathProgress'

function formatTimestamp(ts?: number) {
  if (!ts) return null
  try {
    return new Date(ts).toLocaleString()
  } catch {
    return null
  }
}

export function PathView(props: { onOpenUnit: (node: PathNode) => void }) {
  const [doc, setDoc] = useState<PathDoc | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    loadPath().then(setDoc).catch(() => setErr('Failed to load curriculum path'))
  }, [])

  if (err) return <div style={{ color: '#c00' }}>{err}</div>
  if (!doc) return <div>Loading curriculum…</div>

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ fontWeight: 600 }}>Curriculum Path</div>
      {doc.nodes.map((n) => {
        const pg = getNodeProgress(n.id)
        const qt = pg?.steps?.quick
        const ls = pg?.steps?.listen
        const st = pg?.steps?.study
        const rd = pg?.steps?.reader
        const gr = pg?.steps?.grammar
        const recentTimestamps = [st?.updatedAt, qt?.updatedAt, rd?.updatedAt, ls?.updatedAt, gr?.updatedAt]
          .filter((value): value is number => typeof value === 'number' && value > 0)
        const latest = recentTimestamps.length ? Math.max(...recentTimestamps) : undefined
        const badges: string[] = []
        if (pg?.startedAt) badges.push('Started')
        if (st?.lastScore !== undefined && st?.lastTotal !== undefined) badges.push(`ST ${st.lastScore}/${st.lastTotal}`)
        if (qt?.lastScore !== undefined && qt?.lastTotal !== undefined) badges.push(`QT ${qt.lastScore}/${qt.lastTotal}`)
        if (ls?.lastScore !== undefined && ls?.lastTotal !== undefined) badges.push(`L ${ls.lastScore}/${ls.lastTotal}`)
        return (
        <div key={n.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 600 }}>{n.title}</div>
              <div style={{ color: '#666', fontSize: 12 }}>Band {n.band}{n.level} • Deck: {n.content.deckId}</div>
              {!!badges.length && (
                <div style={{ color: '#0a0', fontSize: 12, marginTop: 4 }}>{badges.join(' • ')}</div>
              )}
              {latest && (
                <div style={{ color: '#666', fontSize: 12, marginTop: 4 }}>Last activity: {formatTimestamp(latest)}</div>
              )}
            </div>
            <div>
              <button onClick={() => props.onOpenUnit(n)}>Open</button>
            </div>
          </div>
        </div>
        )
      })}
    </div>
  )
}
