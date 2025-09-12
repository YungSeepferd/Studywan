#!/usr/bin/env node
// Minimal TSV -> JSON card converter (no deps)
// Usage:
//   node tools/ingest/tsv_to_json.js --band A --level 1 --in data/staging/a1.tsv --out data/seed/band-A/level1.json

const fs = require('fs');
const path = require('path');

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i += 2) {
    const k = args[i];
    const v = args[i + 1];
    if (!v || v.startsWith('--')) throw new Error(`Missing value for ${k}`);
    out[k.replace(/^--/, '')] = v;
  }
  return out;
}

function readTSV(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const lines = raw.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return [];
  const headers = lines[0].split('\t');
  return lines.slice(1).map((line, idx) => {
    const cells = line.split('\t');
    const obj = {};
    headers.forEach((h, i) => obj[h.trim()] = (cells[i] || '').trim());
    obj.__line = idx + 2; // 1-based line number in file
    return obj;
  });
}

function toCard(row, band, level, idCounter) {
  const baseId = `${band}${level}-${String(idCounter).padStart(4, '0')}`;
  const card = {
    id: baseId,
    trad: row.trad || '',
    simp: row.simp || undefined,
    pinyin: row.pinyin || '',
    zhuyin: row.zhuyin || undefined,
    pos: row.pos || undefined,
    gloss_en: row.gloss_en || '',
    gloss_de: row.gloss_de || undefined,
    band,
    level: Number(level),
    topic: row.topic || undefined,
    tags: (row.tags ? row.tags.split(',').map(s => s.trim()).filter(Boolean) : []),
    source: row.source ? { name: row.source } : undefined
  };
  return card;
}

function main() {
  const { band, level, in: inFile, out: outFile } = parseArgs();
  if (!band || !level || !inFile || !outFile) {
    console.error('Required: --band A|B|C --level 1..6 --in <tsv> --out <json>');
    process.exit(1);
  }
  const rows = readTSV(inFile);
  const cards = [];
  let id = 1;
  for (const row of rows) {
    if (!row.trad || !row.pinyin) {
      console.warn(`Skip line ${row.__line}: missing trad or pinyin`);
      continue;
    }
    if (!('gloss_en' in row)) row.gloss_en = '';
    cards.push(toCard(row, band, level, id++));
  }
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(cards, null, 2), 'utf8');
  console.log(`Wrote ${cards.length} cards -> ${outFile}`);
}

main();
