#!/usr/bin/env node
// Minimal validation for deck JSONs without external deps
// Checks required fields: id, trad, pinyin, band, level
// Usage: node tools/ingest/validate_deck.js --in data/seed/band-A/level1.json

const fs = require('fs');

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i += 2) out[args[i].replace(/^--/, '')] = args[i + 1];
  return out;
}

function main() {
  const { in: inFile } = parseArgs();
  if (!inFile) {
    console.error('Required: --in <deck.json>');
    process.exit(1);
  }
  const arr = JSON.parse(fs.readFileSync(inFile, 'utf8'));
  let ok = 0, bad = 0;
  const errs = [];
  for (const c of arr) {
    const missing = [];
    if (!c.id) missing.push('id');
    if (!c.trad) missing.push('trad');
    if (!c.pinyin) missing.push('pinyin');
    if (!c.band) missing.push('band');
    if (typeof c.level !== 'number') missing.push('level');
    if (missing.length) {
      bad++;
      errs.push({ id: c.id, missing });
    } else {
      ok++;
    }
  }
  console.log(`Checked ${arr.length} cards: OK=${ok}, Bad=${bad}`);
  if (bad) {
    console.log('Examples of issues:', errs.slice(0, 5));
    process.exit(2);
  }
}

main();

