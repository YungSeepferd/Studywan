import type { Card, Prefs } from '../lib/types'
import { getPronunciation } from '../lib/romanization'
import { toSimp } from '../lib/script'
import { useEffect, useState } from 'react'
import { colorPinyin, colorZhuyin } from '../lib/tones'
import { HanziStroke } from './HanziStroke'
import { MultiCharStrokes } from './MultiCharStrokes'

export function StudyCard(props: {
  card: Card
  prefs: Prefs
  onGrade: (grade: 0 | 3 | 4 | 5) => void
  onOpenStory?: () => void
}) {
  const { card, prefs } = props
  const [hanzi, setHanzi] = useState<string>(card.trad)
  const [pron, setPron] = useState<string>('')
  const [showStroke, setShowStroke] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      // Script conversion
      if (prefs.scriptMode === 'trad') setHanzi(card.trad)
      else if (card.simp) setHanzi(card.simp || card.trad)
      else setHanzi(await toSimp(card.trad))
      // Pronunciation
      const p = await getPronunciation(card, prefs)
      if (!cancelled) setPron(p)
    })()
    return () => { cancelled = true }
  }, [card, prefs])

  const toneColoredPron = (() => {
    if (!prefs.toneColors) return pron
    if (prefs.romanization === 'pinyin') return colorPinyin(pron, !!prefs.highContrast)
    return colorZhuyin(pron, !!prefs.highContrast)
  })()

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 24, maxWidth: 640 }}>
      <div style={{ fontSize: 64, lineHeight: 1.2, marginBottom: 12 }}>{hanzi}</div>
      <div style={{ fontSize: 20, color: '#555', marginBottom: 12 }}>
        {Array.isArray(toneColoredPron)
          ? toneColoredPron.map((seg, idx) => typeof seg === 'string' ? seg : (
              <span key={idx} style={{ color: seg.color }}>{seg.text}</span>
            ))
          : toneColoredPron}
      </div>
      {card.gloss_en && card.gloss_en.trim() && (
        <div style={{ fontSize: 16, color: '#333', marginBottom: 8 }}>
          {card.gloss_en}
        </div>
      )}
      {(card.hint || card.etymology) && (
        <div style={{ fontSize: 13, color: '#555', marginBottom: 8 }}>
          {(card.etymology || card.hint) as string}
        </div>
      )}
      <div style={{ fontSize: 14, color: '#777' }}>
        <span>POS: {card.pos || '—'}</span>
        <span style={{ marginLeft: 12 }}>Topic: {card.topic || '—'}</span>
      </div>
      <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={() => setShowStroke(s => !s)}>{showStroke ? 'Hide Strokes' : 'Show Strokes'}</button>
        {props.onOpenStory && (
          <button onClick={() => props.onOpenStory?.()}>Read a micro-story</button>
        )}
      </div>
      {showStroke && (
        <div style={{ marginTop: 8 }}>
          <MultiCharStrokes text={hanzi} max={4} size={120} />
        </div>
      )}
      <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button aria-label="Again (1)" onClick={() => props.onGrade(0)}>Again</button>
        <button aria-label="Hard (2)" onClick={() => props.onGrade(3)}>Hard</button>
        <button aria-label="Good (3)" onClick={() => props.onGrade(4)}>Good</button>
        <button aria-label="Easy (4)" onClick={() => props.onGrade(5)}>Easy</button>
      </div>
    </div>
  )
}
