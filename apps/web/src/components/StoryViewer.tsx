import { useEffect, useMemo, useState } from 'react'
import type { Prefs } from '../lib/types'

type Story = {
  id: string
  band: 'A'|'B'|'C'
  level: number
  bandLabel?: string
  title: string
  body: string
  bodySimp?: string
  vocabRefs: string[]
  audioUrl?: string
  cultureRefs?: string[]
}

export function StoryViewer(props: { storyPath: string; prefs: Prefs; onClose: () => void }) {
  const [story, setStory] = useState<Story | null>(null)
  const [played, setPlayed] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const script = props.prefs.scriptMode

  useEffect(() => {
    const url = new URL(props.storyPath, (import.meta as any).env.BASE_URL).toString()
    fetch(url).then(r => r.json()).then(setStory).catch(() => setErr('Failed to load story'))
  }, [props.storyPath])

  const text = useMemo(() => {
    if (!story) return ''
    return script === 'trad' ? (story.body || '') : (story.bodySimp || story.body)
  }, [story, script])

  function playOnce() {
    if (played || !story?.audioUrl) return
    const url = new URL(story.audioUrl, (import.meta as any).env.BASE_URL).toString()
    const a = new Audio(url)
    a.addEventListener('ended', () => setPlayed(true), { once: true })
    a.play().catch(() => setErr('Audio failed to play'))
  }

  if (err) return <div style={{ color: '#c00' }}>{err}</div>
  if (!story) return <div>Loading story…</div>
  return (
    <div style={{ border: '1px solid #ddd', padding: 16, borderRadius: 8, maxWidth: 720 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong>{story.title} ({story.bandLabel || `${story.band}${story.level}`})</strong>
        <button onClick={props.onClose}>Close</button>
      </div>
      <div style={{ whiteSpace: 'pre-wrap', marginTop: 12, fontSize: 18 }}>{text}</div>
      <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
        <button onClick={playOnce} disabled={played || !story.audioUrl}>{played ? 'Played' : 'Play once'}</button>
        {!story.audioUrl && <span style={{ color: '#666', fontSize: 12 }}>(No audio)</span>}
      </div>
      {story.cultureRefs?.length ? (
        <div style={{ marginTop: 12, color: '#666' }}>See also: {story.cultureRefs.map((u, i) => (
          <a key={i} href={u} target="_blank" rel="noreferrer">[{i+1}]</a>
        ))}</div>
      ) : null}
    </div>
  )
}

