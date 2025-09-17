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

// Highlight based on precomputed tokens while preserving token boundaries.
export function highlightTokens(tokens: string[], targets: string[]): Segment[] {
  const segs: Segment[] = []
  if (!tokens.length) return segs
  const tset = [...new Set(targets.filter(Boolean) as string[])].sort((a, b) => b.length - a.length)
  let i = 0
  while (i < tokens.length) {
    let matchedText = ''
    let matchedCount = 0
    for (const target of tset) {
      if (!target) continue
      let built = ''
      let j = i
      while (j < tokens.length && built.length < target.length) {
        const token = tokens[j] ?? ''
        built += token
        j += 1
        if (built === target) {
          matchedText = built
          matchedCount = j - i
          break
        }
      }
      if (matchedCount) break
    }
    if (matchedCount) {
      pushSeg(segs, matchedText, true)
      i += matchedCount
    } else {
      const token = tokens[i] ?? ''
      pushSeg(segs, token, false)
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
