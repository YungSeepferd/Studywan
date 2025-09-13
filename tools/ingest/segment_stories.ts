#!/usr/bin/env ts-node
/* Segment story bodies and optionally output tokenized versions.
   Uses nodejieba if available; falls back to per-char.

   Usage:
     ts-node tools/ingest/segment_stories.ts --in data/stories/story.json --out data/stories/story.seg.json
*/
import fs from 'fs'

type Args = { in: string; out: string }
function parseArgs(): Args {
  const a = process.argv.slice(2); const out: any = {}
  for (let i = 0; i < a.length; i += 2) out[a[i].replace(/^--/,'')] = a[i+1]
  return out as Args
}

async function segment(text: string): Promise<string[]> {
  try {
    // dynamic import to avoid bundler/static resolution
    const dyn = new Function('s', 'return import(s)') as any
    const jieba = await dyn('nodejieba')
    return jieba.cut(text)
  } catch {
    return [...text]
  }
}

async function main() {
  const args = parseArgs()
  if (!args.in || !args.out) throw new Error('Required: --in story.json --out story.seg.json')
  const story = JSON.parse(fs.readFileSync(args.in, 'utf8'))
  const tokens = await segment(story.body || '')
  story.tokens = tokens
  fs.writeFileSync(args.out, JSON.stringify(story, null, 2), 'utf8')
  console.log(`Segmented -> ${args.out}`)
}

main().catch(e => { console.error(e); process.exit(1) })

