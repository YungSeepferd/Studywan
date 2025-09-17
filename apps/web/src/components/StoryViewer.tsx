import { useEffect, useMemo, useState } from 'react'
import type { Card, Prefs } from '../lib/types'
import { highlightText, highlightTokens, type Segment } from '../lib/highlight'
import { getPronunciation } from '../lib/romanization'
import { PopoverFloating } from './ui/PopoverFloating'
import * as Tooltip from '@radix-ui/react-tooltip'
import { withBase } from '../lib/url'
import { playOnce } from '../lib/audio'
import { segment as segmentText } from '../lib/segmentation'

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
  exampleSentences?: { zh: string; en?: string; zhuyin?: string; pinyin?: string }[]
  questions?: { id?: string; type?: 'detail'|'gist'|'vocabulary'|'inference'; prompt: string; options?: string[]; answer?: string|number; explanation?: string }[]
}

export function StoryViewer(props: { storyPath: string; prefs: Prefs; onClose: () => void; cards?: Card[] }) {
  const [story, setStory] = useState<Story | null>(null)
  const [played, setPlayed] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const script = props.prefs.scriptMode
  const [openIdx, setOpenIdx] = useState<number | null>(null)
  const [selectedInfo, setSelectedInfo] = useState<{ text: string; pron: string; gloss?: string | undefined } | null>(null)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const url = withBase(props.storyPath)
    fetch(url).then(r => r.json()).then(setStory).catch(() => setErr('Failed to load story'))
  }, [props.storyPath])

  const text = useMemo(() => {
    if (!story) return ''
    return script === 'trad' ? (story.body || '') : (story.bodySimp || story.body)
  }, [story, script])

  const highlightTargets = useMemo(() => {
    if (!story) return [] as string[]
    return (story.vocabRefs || [])
      .map(id => (props.cards || []).find(c => c.id === id))
      .filter(Boolean)
      .map(c => script === 'trad' ? (c as Card).trad : ((c as Card).simp || (c as Card).trad)) as string[]
  }, [story, props.cards, script])

  const [segs, setSegs] = useState<Segment[]>([])

  useEffect(() => {
    if (!story) { setSegs([]); return }
    const fallback = highlightText(text, highlightTargets)
    setSegs(fallback)
    let alive = true
    ;(async () => {
      try {
        const tokens = await segmentText(text)
        if (!alive) return
        if (!tokens.length) { setSegs(fallback); return }
        const tokenSegs = highlightTokens(tokens, highlightTargets)
        setSegs(tokenSegs.length ? tokenSegs : fallback)
      } catch {
        if (alive) setSegs(fallback)
      }
    })()
    return () => { alive = false }
  }, [text, highlightTargets, story])

  function playOnceHandler() {
    if (played || !story?.audioUrl) return
    const url = withBase(story.audioUrl)
    try {
      playOnce(url, () => setPlayed(true))
    } catch {
      setErr('Audio failed to play')
    }
  }

  if (err) return <div style={{ color: '#c00' }}>{err}</div>
  if (!story) return <div>Loading story…</div>
  function check() { setChecked(true) }
  return (
    <div style={{ border: '1px solid #ddd', padding: 16, borderRadius: 8, maxWidth: 720 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong>{story.title} ({story.bandLabel || `${story.band}${story.level}`})</strong>
        <button onClick={props.onClose}>Close</button>
      </div>
      <div style={{ whiteSpace: 'pre-wrap', marginTop: 12, fontSize: 18 }}>
        {segs.map((s, idx) => {
          if (!s.highlight) return <span key={idx}>{s.text}</span>
          return (
            <PopoverFloating
              key={idx}
              open={openIdx === idx}
              onOpenChange={(o) => setOpenIdx(o ? idx : null)}
              trigger={
                <button
                  onClick={async () => {
                    const card = (props.cards || []).find(c => (script === 'trad' ? c.trad : (c.simp || c.trad)) === s.text)
                    const pron = card ? await getPronunciation(card, props.prefs) : ''
                    setSelectedInfo({ text: s.text, pron, gloss: card?.gloss_en })
                    setOpenIdx(idx)
                  }}
                  style={{ background: 'transparent', border: 'none', padding: 0, margin: 0, cursor: 'pointer', backgroundColor: '#fff3cd' }}
                  aria-haspopup="dialog"
                  aria-expanded={openIdx === idx}
                >
                  {s.text}
                </button>
              }
            >
              <div>
                <div><strong>{selectedInfo?.text}</strong> <span style={{ color: '#555' }}>{selectedInfo?.pron}</span></div>
                {selectedInfo?.gloss && <div style={{ color: '#666', maxWidth: 280 }}>{selectedInfo.gloss}</div>}
              </div>
            </PopoverFloating>
          )
        })}
      </div>
      <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
        <Tooltip.Provider>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button onClick={playOnceHandler} disabled={played || !story.audioUrl}>{played ? 'Played' : 'Play once'}</button>
            </Tooltip.Trigger>
            <Tooltip.Content side="top" sideOffset={4}>
              <div style={{ background: '#111', color: '#fff', padding: '4px 8px', borderRadius: 4, fontSize: 12 }}>One play only — exam style</div>
            </Tooltip.Content>
          </Tooltip.Root>
        </Tooltip.Provider>
        {!story.audioUrl && <span style={{ color: '#666', fontSize: 12 }}>(No audio)</span>}
      </div>
      {/* Inline panel removed in favor of popovers; keep external links below if desired */}
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

      {story.questions?.length ? (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Questions</div>
          <div style={{ display: 'grid', gap: 10 }}>
            {story.questions.map((q, qi) => (
              <div key={qi}>
                <div style={{ marginBottom: 6 }}>{qi + 1}. {q.prompt}</div>
                <div style={{ display: 'grid', gap: 6 }}>
                  {(q.options || []).map((opt, oi) => {
                    const isCorrect = typeof q.answer === 'number' ? oi === q.answer : opt === q.answer
                    const chosen = answers[qi] === oi
                    const bg = checked && chosen ? (isCorrect ? '#daf5d7' : '#ffd6d6') : 'transparent'
                    return (
                      <label key={oi} style={{ display: 'flex', alignItems: 'center', gap: 6, background: bg }}>
                        <input type="radio" name={`q${qi}`} checked={answers[qi] === oi} onChange={() => setAnswers(a => ({ ...a, [qi]: oi }))} />
                        {opt}
                      </label>
                    )
                  })}
                </div>
                {checked && q.explanation && (
                  <div style={{ color: '#666', fontSize: 12, marginTop: 4 }}>Explanation: {q.explanation}</div>
                )}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 8 }}>
            <button onClick={check}>Check answers</button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
