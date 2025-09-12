import { useEffect, useState } from 'react'

type DeckOption = { label: string; path: string }

const builtins: DeckOption[] = [
  { label: 'A1 (Level 1)', path: 'data/band-A/level1.json' },
  { label: 'A2 (Level 2)', path: 'data/band-A/level2.json' },
  { label: 'A1 Program: A1a', path: 'data/band-A/a1_program/a1a.json' },
  { label: 'A1 Topic: 個人資料', path: 'data/band-A/level1_topics/個人資料.json' },
]

export function DeckPicker(props: {
  onPick: (deckPath: string) => void
}) {
  const [custom, setCustom] = useState('')
  const [options, setOptions] = useState<DeckOption[]>(builtins)

  useEffect(() => {
    // Could later fetch a manifest; for now, use builtins
    setOptions(builtins)
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
      {options.map((o) => (
        <button key={o.path} onClick={() => pick(o.path)}>{o.label}</button>
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
    </div>
  )
}

