export type Segment = { text: string; highlight: boolean }

// Build highlighted segments by greedy matching of targets at each position.
export function highlightText(text: string, targets: string[]): Segment[] {
  const segs: Segment[] = []
  if (!text) return segs
  const tset = [...new Set(targets.filter(Boolean) as string[])].sort((a, b) => b.length - a.length) // longest first
  let i = 0
  while (i < text.length) {
    let matched = ''
    for (const t of tset) {
      if (!t) continue
      if (text.startsWith(t, i)) { matched = t; break }
    }
    if (matched) {
      pushSeg(segs, matched, true)
      i += matched.length
    } else {
      pushSeg(segs, text.charAt(i), false)
      i += 1
    }
  }
  return segs
}

function pushSeg(segs: Segment[], text: string, highlight: boolean) {
  const last = segs[segs.length - 1]
  if (last && last.highlight === highlight) last.text += text
  else segs.push({ text, highlight })
}
