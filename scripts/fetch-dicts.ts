#!/usr/bin/env node
/*
  Merge CC-CEDICT and/or MOE TSV metadata into a deck JSON.
  - Fills missing gloss_en from CC-CEDICT
  - Fills missing zhuyin from MOE TSV (keeps existing if present)
  - Adds simple `tags` markers when enrichment occurs

  Usage:
    tsx scripts/fetch-dicts.ts \
      --in data/seed/band-A/level1.json \
      --out data/seed/band-A/level1_enriched.json \
      [--cedict data/dicts/cedict_ts.u8] \
      [--moe-tsv data/dicts/moe.tsv --moe-word word --moe-zhuyin zhuyin --moe-def def]
*/
import fs from 'fs'
import path from 'path'

type CedictEntry = { pinyin: string; gloss: string }
type MoeEntry = { zhuyin?: string; def?: string }

type CardIn = {
  id: string
  trad: string
  simp?: string
  pinyin?: string
  zhuyin?: string
  pos?: string
  gloss_en?: string
  band: 'A' | 'B' | 'C'
  level: number
  topic?: string
  tags?: string[]
}

type Args = {
  in: string
  out: string
  cedict?: string
  'moe-tsv'?: string
  'moe-word'?: string
  'moe-zhuyin'?: string
  'moe-def'?: string
}

function parseArgs(): Args {
  const args = process.argv.slice(2)
  const out: any = {}
  for (let i = 0; i < args.length; i++) {
    const k = args[i]
    if (!k.startsWith('--')) continue
    const key = k.replace(/^--/, '')
    const v = args[i + 1]
    if (!v || v.startsWith('--')) throw new Error(`Missing value for ${k}`)
    out[key] = v
    i++
  }
  return out as Args
}

function loadCedict(file?: string): Map<string, CedictEntry[]> {
  const map = new Map<string, CedictEntry[]>()
  if (!file) return map
  const raw = fs.readFileSync(file, 'utf8')
  const lines = raw.split(/\r?\n/)
  const re = /^(\S+)\s+(\S+)\s+\[(.+?)\]\s+\/(.+)\/$/
  for (const ln of lines) {
    if (!ln || ln.startsWith('#')) continue
    const m = re.exec(ln)
    if (!m) continue
    const trad = m[1]
    const pinyin = m[3]
    const defs = m[4].split('/').filter(Boolean)
    const gloss = defs[0] || ''
    if (!map.has(trad)) map.set(trad, [])
    map.get(trad)!.push({ pinyin, gloss })
  }
  return map
}

function loadMoeTsv(file?: string, colWord = 'word', colZhuyin = 'zhuyin', colDef = 'def'): Map<string, MoeEntry> {
  const map = new Map<string, MoeEntry>()
  if (!file) return map
  const raw = fs.readFileSync(file, 'utf8')
  const lines = raw.split(/\r?\n/).filter(Boolean)
  if (!lines.length) return map
  const headers = lines[0].split('\t').map(h => h.trim())
  const idxWord = headers.indexOf(colWord)
  const idxZy = headers.indexOf(colZhuyin)
  const idxDef = headers.indexOf(colDef)
  if (idxWord < 0) throw new Error(`MOE TSV missing column: ${colWord}`)
  for (const ln of lines.slice(1)) {
    const cells = ln.split('\t')
    const w = (cells[idxWord] || '').trim()
    if (!w) continue
    const zy = idxZy >= 0 ? (cells[idxZy] || '').trim() : undefined
    const def = idxDef >= 0 ? (cells[idxDef] || '').trim() : undefined
    map.set(w, { zhuyin: zy, def })
  }
  return map
}

function enrichDeck(
  deck: CardIn[],
  ced: Map<string, CedictEntry[]>,
  moe: Map<string, MoeEntry>
) {
  let cedCount = 0
  let moeCount = 0
  const out = deck.map((card) => {
    const next: CardIn = { ...card }
    // Ensure tags array
    const tags = Array.isArray(next.tags) ? next.tags.slice() : []

    // Fill gloss_en from CC-CEDICT if missing/empty
    if ((next.gloss_en ?? '') === '' && ced.size) {
      const hits = ced.get(next.trad)
      if (hits && hits.length) {
        next.gloss_en = hits[0].gloss
        if (!tags.includes('src:cedict')) tags.push('src:cedict')
        cedCount++
      }
    }

    // Fill zhuyin from MOE if missing
    if ((next.zhuyin ?? '') === '' && moe.size) {
      const m = moe.get(next.trad)
      if (m && m.zhuyin) {
        next.zhuyin = m.zhuyin
        if (!tags.includes('src:moe')) tags.push('src:moe')
        moeCount++
      }
    }

    next.tags = tags
    return next
  })
  return { out, cedCount, moeCount }
}

async function main() {
  const args = parseArgs()
  if (!args.in || !args.out) {
    console.error('Required: --in <deck.json> --out <enriched.json> [--cedict path] [--moe-tsv path --moe-word word --moe-zhuyin zhuyin --moe-def def]')
    process.exit(1)
  }
  const deck: CardIn[] = JSON.parse(fs.readFileSync(args.in, 'utf8'))
  const ced = loadCedict(args.cedict)
  const moe = loadMoeTsv(args['moe-tsv'], args['moe-word'], args['moe-zhuyin'], args['moe-def'])
  const { out, cedCount, moeCount } = enrichDeck(deck, ced, moe)
  fs.mkdirSync(path.dirname(args.out), { recursive: true })
  fs.writeFileSync(args.out, JSON.stringify(out, null, 2), 'utf8')
  console.log(`Enriched ${cedCount} glosses, ${moeCount} zhuyin entries -> ${args.out}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

