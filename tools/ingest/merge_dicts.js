#!/usr/bin/env node
// Merge CC-CEDICT and/or MOE TSV metadata into a deck JSON.
// - Fills missing gloss_en from CC-CEDICT
// - Fills missing zhuyin from MOE TSV (or retains existing)
// - Adds simple `source` tags when enrichment occurs
//
// Usage examples:
//   node tools/ingest/merge_dicts.js \
//     --in data/seed/band-A/level1.json \
//     --cedict data/dicts/cedict_ts.u8 \
//     --out data/seed/band-A/level1_enriched.json
//
//   node tools/ingest/merge_dicts.js \
//     --in data/seed/band-A/level1.json \
//     --moe-tsv data/dicts/moe.tsv --moe-word word --moe-zhuyin zhuyin --moe-def def \
//     --out data/seed/band-A/level1_enriched.json
//
const fs = require('fs')
const path = require('path')

function parseArgs() {
  const args = process.argv.slice(2)
  const out = {}
  for (let i = 0; i < args.length; i += 2) {
    const k = args[i]
    const v = args[i + 1]
    if (!v || v.startsWith('--')) throw new Error(`Missing value for ${k}`)
    out[k.replace(/^--/, '')] = v
  }
  return out
}

function loadCedict(file) {
  // CC-CEDICT format: trad simp [pinyin] /def1/def2/
  const map = new Map()
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
    map.get(trad).push({ pinyin, gloss })
  }
  return map
}

function loadMoeTsv(file, colWord='word', colZhuyin='zhuyin', colDef='def') {
  const map = new Map()
  if (!file) return map
  const raw = fs.readFileSync(file, 'utf8')
  const lines = raw.split(/\r?\n/).filter(Boolean)
  if (!lines.length) return map
  const headers = lines[0].split('\t').map(h => h.trim())
  const idxWord = headers.indexOf(colWord)
  const idxZy = headers.indexOf(colZhuyin)
  const idxDef = headers.indexOf(colDef)
  for (const ln of lines.slice(1)) {
    const cells = ln.split('\t')
    const w = (cells[idxWord] || '').trim()
    if (!w) continue
    const zy = (cells[idxZy] || '').trim()
    const def = (cells[idxDef] || '').trim()
    map.set(w, { zhuyin: zy, def })
  }
  return map
}

function main() {
  const { in: inFile, out: outFile, cedict, 'moe-tsv': moeTsv, 'moe-word': moeWord, 'moe-zhuyin': moeZhuyin, 'moe-def': moeDef } = parseArgs()
  if (!inFile || !outFile) {
    console.error('Required: --in <deck.json> --out <enriched.json> [--cedict path] [--moe-tsv path --moe-word word --moe-zhuyin zhuyin --moe-def def]')
    process.exit(1)
  }
  const deck = JSON.parse(fs.readFileSync(inFile, 'utf8'))
  const ced = cedict ? loadCedict(cedict) : new Map()
  const moe = moeTsv ? loadMoeTsv(moeTsv, moeWord, moeZhuyin, moeDef) : new Map()

  let enriched = 0
  const out = deck.map(card => {
    let changed = false
    const next = { ...card }
    if ((!next.gloss_en || next.gloss_en === '') && ced.size) {
      const hit = ced.get(next.trad)
      if (hit && hit.length) {
        next.gloss_en = hit[0].gloss
        next.tags = Array.isArray(next.tags) ? next.tags : []
        if (!next.tags.includes('src:cedict')) next.tags.push('src:cedict')
        changed = true
      }
    }
    if ((!next.zhuyin || next.zhuyin === '') && moe.size) {
      const z = moe.get(next.trad)
      if (z && z.zhuyin) {
        next.zhuyin = z.zhuyin
        next.tags = Array.isArray(next.tags) ? next.tags : []
        if (!next.tags.includes('src:moe')) next.tags.push('src:moe')
        changed = true
      }
    }
    if (changed) enriched++
    return next
  })

  fs.mkdirSync(path.dirname(outFile), { recursive: true })
  fs.writeFileSync(outFile, JSON.stringify(out, null, 2), 'utf8')
  console.log(`Enriched ${enriched}/${deck.length} cards -> ${outFile}`)
}

main()

