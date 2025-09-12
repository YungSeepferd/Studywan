import { useEffect, useMemo, useState } from 'react'
import type { Card, Prefs } from '../lib/types'
import { highlightText, type Segment } from '../lib/highlight'
import { getPronunciation } from '../lib/romanization'

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

export function StoryViewer(props: { storyPath: string; prefs: Prefs; onClose: () => void; cards?: Card[] }) {
  const [story, setStory] = useState<Story | null>(null)
  const [played, setPlayed] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const script = props.prefs.scriptMode
  const [selected, setSelected] = useState<string | null>(null)
  const [selectedInfo, setSelectedInfo] = useState<{ text: string; pron: string; gloss?: string | undefined } | null>(null)

  useEffect(() => {
    const url = new URL(props.storyPath, (import.meta as any).env.BASE_URL).toString()
    fetch(url).then(r => r.json()).then(setStory).catch(() => setErr('Failed to load story'))
  }, [props.storyPath])

  const text = useMemo(() => {
    if (!story) return ''
    return script === 'trad' ? (story.body || '') : (story.bodySimp || story.body)
  }, [story, script])

  const segs: Segment[] = useMemo(() => {
    if (!story) return []
    const targets = (story.vocabRefs || [])
      .map(id => (props.cards || []).find(c => c.id === id))
      .filter(Boolean)
      .map(c => script === 'trad' ? (c as Card).trad : ((c as Card).simp || (c as Card).trad)) as string[]
    return highlightText(text, targets)
  }, [text, story, props.cards, script])

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
      <div style={{ whiteSpace: 'pre-wrap', marginTop: 12, fontSize: 18 }}>
        {segs.map((s, idx) => s.highlight ? (
          <span key={idx} style={{ background: '#fff3cd', cursor: 'pointer' }} onClick={async () => {
            setSelected(s.text)
            // find card and build info
            const card = (props.cards || []).find(c => (script === 'trad' ? c.trad : (c.simp || c.trad)) === s.text)
            const pron = card ? await getPronunciation(card, props.prefs) : ''
            setSelectedInfo({ text: s.text, pron, gloss: card?.gloss_en })
          }}>{s.text}</span>
        ) : (
          <span key={idx}>{s.text}</span>
        ))}
      </div>
      <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
        <button onClick={playOnce} disabled={played || !story.audioUrl}>{played ? 'Played' : 'Play once'}</button>
        {!story.audioUrl && <span style={{ color: '#666', fontSize: 12 }}>(No audio)</span>}
      </div>
      {selectedInfo && (
        <div style={{ marginTop: 8, border: '1px solid #eee', padding: 8, borderRadius: 6, background: '#fafafa' }}>
          <div><strong>{selectedInfo.text}</strong> <span style={{ color: '#555' }}>{selectedInfo.pron}</span></div>
          {selectedInfo.gloss && <div style={{ color: '#666' }}>{selectedInfo.gloss}</div>}
          <div style={{ marginTop: 6, fontSize: 12 }}>
            Links: 
            <a href={`https://dict.revised.moe.edu.tw/`} target="_blank" rel="noreferrer">MOE</a>
            {' | '}
            <a href={`https://dict.idioms.moe.edu.tw/`} target="_blank" rel="noreferrer">成語典</a>
            {' | '}
            <a href={`https://www.moc.gov.tw/en/`} target="_blank" rel="noreferrer">MOC</a>
          </div>
        </div>
      )}
      {story.cultureRefs?.length ? (
        <div style={{ marginTop: 12, color: '#666' }}>See also: {story.cultureRefs.map((u, i) => (
          <a key={i} href={u} target="_blank" rel="noreferrer">[{i+1}]</a>
        ))}</div>
      ) : null}
      {/* Glossary drawer */}
      {story.vocabRefs?.length ? (
        <div style={{ marginTop: 12 }}>
          <details>
            <summary>Glossary</summary>
            <div style={{ marginTop: 6, display: 'grid', gap: 4 }}>
              {(story.vocabRefs || []).map((id) => {
                const card = (props.cards || []).find(c => c.id === id)
                if (!card) return null
                const hanzi = script === 'trad' ? card.trad : (card.simp || card.trad)
                return (
                  <div key={id} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <div><strong>{hanzi}</strong> <span style={{ color: '#666' }}>{card.pinyin}</span></div>
                    <div style={{ color: '#666' }}>{card.gloss_en || ''}</div>
                  </div>
                )
              })}
            </div>
          </details>
        </div>
      ) : null}
    </div>
  )
}
