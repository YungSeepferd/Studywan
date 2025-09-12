import { useEffect, useRef, useState } from 'react'

export function HanziStroke(props: { char: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    let writer: any = null
    let mounted = true
    ;(async () => {
      try {
        const HanziWriter: any = (await import('hanzi-writer')).default as any
        if (!mounted || !ref.current) return
        writer = HanziWriter.create(ref.current, props.char, {
          width: 200,
          height: 200,
          showOutline: true,
          showCharacter: true,
          padding: 5,
          strokeColor: '#0070f3'
        })
        writer.loopCharacterAnimation()
      } catch (e: any) {
        setErr('Stroke data not available. Install dependencies and reload.')
      }
    })()
    return () => { mounted = false; try { writer && writer.hideCharacter(); } catch {} }
  }, [props.char])

  return (
    <div>
      <div ref={ref} />
      {err && <div style={{ color: '#c00', fontSize: 12 }}>{err}</div>}
    </div>
  )
}
