#!/usr/bin/env node
// Precompute story fields (e.g., bodySimp) using OpenCC if available.
// Usage:
//   node tools/stories/build_story.js --in data/stories/story-a2-transport-001.json --out apps/web/public/stories/story-a2-transport-001.json
//   node tools/stories/build_story.js --manifest data/stories/manifest.json --indir data/stories --outdir apps/web/public/stories

const fs = require('fs')
const path = require('path')

async function toSimp(text) {
  try {
    const oc = await import('opencc-js')
    if (oc && oc.OpenCC) {
      const conv = await oc.OpenCC.Converter({ from: 't', to: 's' })
      return conv(text)
    }
  } catch {}
  return text
}

async function processOne(inp, outp) {
  const story = JSON.parse(fs.readFileSync(inp, 'utf8'))
  if (!story.bodySimp || story.bodySimp.trim() === '') {
    story.bodySimp = await toSimp(story.body || '')
  }
  fs.mkdirSync(path.dirname(outp), { recursive: true })
  fs.writeFileSync(outp, JSON.stringify(story, null, 2), 'utf8')
  console.log(`Wrote ${outp}`)
}

async function main() {
  const args = process.argv.slice(2)
  const opts = {}
  for (let i = 0; i < args.length; i += 2) opts[args[i].replace(/^--/, '')] = args[i + 1]
  if (opts.in && opts.out) {
    await processOne(opts.in, opts.out)
    return
  }
  if (opts.manifest && opts.indir && opts.outdir) {
    const list = JSON.parse(fs.readFileSync(opts.manifest, 'utf8'))
    for (const item of list) {
      const inp = path.join(opts.indir, path.basename(item.path))
      const outp = path.join(opts.outdir, path.basename(item.path))
      // eslint-disable-next-line no-await-in-loop
      await processOne(inp, outp)
    }
    // copy manifest
    fs.mkdirSync(opts.outdir, { recursive: true })
    fs.copyFileSync(opts.manifest, path.join(opts.outdir, 'manifest.json'))
    console.log('Copied manifest')
    return
  }
  console.error('Usage: --in <file> --out <file> OR --manifest <file> --indir <dir> --outdir <dir>')
  process.exit(1)
}

main()

