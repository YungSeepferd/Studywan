#!/usr/bin/env node
// Chunk a deck JSON into fixed-size packs, preserving order.
// Usage: node tools/ingest/pack_deck.js --in data/seed/band-A/level1.json --outdir data/seed/band-A/level1_packs --size 50

const fs = require('fs');
const path = require('path');

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { size: 50 };
  for (let i = 0; i < args.length; i += 2) {
    const k = args[i];
    const v = args[i + 1];
    out[k.replace(/^--/, '')] = v;
  }
  out.size = Number(out.size || 50);
  return out;
}

function main() {
  const { in: inFile, outdir, size } = parseArgs();
  if (!inFile || !outdir) {
    console.error('Required: --in <deck.json> --outdir <dir> [--size 50]');
    process.exit(1);
  }
  const cards = JSON.parse(fs.readFileSync(inFile, 'utf8'));
  fs.mkdirSync(outdir, { recursive: true });
  let start = 0;
  let idx = 1;
  const summary = [];
  while (start < cards.length) {
    const chunk = cards.slice(start, start + size);
    const name = `pack-${String(idx).padStart(2, '0')}.json`;
    const file = path.join(outdir, name);
    fs.writeFileSync(file, JSON.stringify(chunk, null, 2), 'utf8');
    summary.push({ file, count: chunk.length });
    start += size;
    idx++;
  }
  console.log('Wrote packs:', summary);
}

main();

