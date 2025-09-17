import { HanziStroke } from './HanziStroke'

function isCjk(ch: string) {
  const code = ch.codePointAt(0) || 0
  return (
    (code >= 0x4e00 && code <= 0x9fff) ||
    (code >= 0x3400 && code <= 0x4dbf)
  )
}

export function MultiCharStrokes(props: { text: string; max?: number; size?: number }) {
  const max = props.max ?? 4
  const chars = Array.from(props.text || '').filter(isCjk).slice(0, max)
  if (!chars.length) return null
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {chars.map((c, i) => (
        <div key={i}>
          <HanziStroke char={c} size={props.size ?? 120} />
        </div>
      ))}
    </div>
  )
}

