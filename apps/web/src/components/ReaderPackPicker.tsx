import { useEffect, useState } from 'react'

type StoryMeta = { id: string; title: string; band: 'A'|'B'|'C'; level: number; topic?: string; path: string }

export function ReaderPackPicker(props: {
  onStart: (opts: { band: 'A'|'B'; level: 1|2; topic: string|'All'; mcq: 'detail'|'gist' }) => void
}) {
  const [manifest, setManifest] = useState<StoryMeta[]>([])
  const [level, setLevel] = useState<1|2>(1)
  const [topic, setTopic] = useState<string|'All'>('All')
  const [mcq, setMcq] = useState<'detail'|'gist'>('detail')

  useEffect(() => {
    const url = new URL('stories/manifest.json', (import.meta as any).env.BASE_URL).toString()
    fetch(url).then(r => r.json()).then(setManifest).catch(() => setManifest([]))
  }, [])

  const topics = Array.from(new Set(manifest.filter(m => m.band === 'A' && m.level === level).map(m => m.topic || 'misc')))

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
      <label>Level:
        <select value={level} onChange={e => setLevel(Number(e.target.value) as 1|2)}>
          <option value={1}>A1</option>
          <option value={2}>A2</option>
        </select>
      </label>
      <label>Topic:
        <select value={topic} onChange={e => setTopic(e.target.value as any)}>
          <option value={'All'}>All</option>
          {topics.map(t => (<option key={t} value={t}>{t}</option>))}
        </select>
      </label>
      <label>MCQ:
        <select value={mcq} onChange={e => setMcq(e.target.value as any)}>
          <option value={'detail'}>Detail (word appears)</option>
          <option value={'gist'}>Gist (topic)</option>
        </select>
      </label>
      <button onClick={() => props.onStart({ band: 'A', level, topic, mcq })}>Start Reader Pack</button>
    </div>
  )
}

