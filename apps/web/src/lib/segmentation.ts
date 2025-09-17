// Segmentation wrapper with graceful fallbacks.
// Tries HanziJS ('hanzi'), then nodejieba; falls back to per-character.

type SegLib = {
  start?: () => void
  segment?: (text: string) => string[]
  decomposition?: (char: string) => { components?: string[] }
}

function dynImport(name: string): Promise<any> {
  // avoid bundler static analysis
  // eslint-disable-next-line no-new-func
  const dyn = new Function('s', 'return import(s)') as (s: string) => Promise<any>
  return dyn(name)
}

export async function segment(text: string): Promise<string[]> {
  if (!text) return []
  try {
    const mod = await dynImport('nodejieba').catch(() => null)
    const j = mod ? (mod.default ?? mod) : null
    if (j && typeof j.cut === 'function') {
      const out = j.cut(text)
      if (Array.isArray(out) && out.length) return out
    }
  } catch {}
  try {
    const mod = await dynImport('hanzi').catch(() => null)
    const h: SegLib | null = mod ? (mod.default ?? mod) : null
    if (h && typeof h.start === 'function' && typeof h.segment === 'function') {
      try { h.start?.() } catch {}
      const out = h.segment?.(text)
      if (Array.isArray(out) && out.length) return out
    }
  } catch {}
  return [...text]
}

export async function decompose(char: string): Promise<string[]> {
  if (!char) return []
  try {
    const mod = await dynImport('hanzi').catch(() => null)
    const h: SegLib | null = mod ? (mod.default ?? mod) : null
    if (h && typeof h.start === 'function' && typeof (h as any).decomposition === 'function') {
      try { h.start?.() } catch {}
      const info = (h as any).decomposition(char)
      const comps: string[] = info?.components || []
      return Array.isArray(comps) ? comps : []
    }
  } catch {}
  return []
}
