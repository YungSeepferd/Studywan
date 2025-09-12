import { useEffect, useState } from 'react'

type DeckMeta = { id: string; title: string; band: 'A'|'B'|'C'; level: number; path: string; topic?: string }

export function DeckPicker(props: { onPick: (deckPath: string) => void }) {
  const [custom, setCustom] = useState('')
  const [options, setOptions] = useState<DeckMeta[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const url = new URL('data/decks/manifest.json', (import.meta as any).env.BASE_URL).toString()
    fetch(url)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((list: DeckMeta[]) => setOptions(list))
      .catch(() => setOptions([]))
  }, [])

  function pick(path: string) {
    props.onPick(path)
  }

  function addCustom() {
    if (!custom.trim()) return
    pick(custom.trim())
  }

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <div style={{ fontWeight: 600 }}>Choose a deck</div>
      {options === null && <div>Loading deck list…</div>}
      {options && options.length === 0 && (
        <div style={{ color: '#666' }}>No deck manifest found; enter a custom path.</div>
      )}
      {options && options.map((o) => (
        <button key={o.path} onClick={() => pick(o.path)}>{o.title}</button>
      ))}
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          placeholder="Custom path under public (e.g., data/band-A/level1.json)"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          style={{ flex: 1 }}
        />
        <button onClick={addCustom}>Load</button>
      </div>
      <div style={{ color: '#666', fontSize: 12 }}>
        Note: Ensure the file exists under apps/web/public/… or adjust vite base.
      </div>
      {error && <div style={{ color: '#c00' }}>{error}</div>}
    </div>
  )
}
