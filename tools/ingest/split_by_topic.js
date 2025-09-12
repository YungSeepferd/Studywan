#!/usr/bin/env node
// Split a deck JSON by `topic` into multiple JSON files
// Usage: node tools/ingest/split_by_topic.js --in data/seed/band-A/level1.json --outdir data/seed/band-A/level1_topics

const fs = require('fs');
const path = require('path');

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i += 2) {
    out[args[i].replace(/^--/, '')] = args[i + 1];
  }
  return out;
}

function slugify(s) {
  return (s || 'misc')
    .toString()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-一-龯]+/g, '')
    .replace(/\-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

function main() {
  const { in: inFile, outdir } = parseArgs();
  if (!inFile || !outdir) {
    console.error('Required: --in <deck.json> --outdir <dir>');
    process.exit(1);
  }
  const cards = JSON.parse(fs.readFileSync(inFile, 'utf8'));
  const groups = new Map();
  for (const c of cards) {
    const key = c.topic || 'misc';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(c);
  }
  fs.mkdirSync(outdir, { recursive: true });
  const summary = [];
  for (const [topic, arr] of groups) {
    const slug = slugify(topic);
    const file = path.join(outdir, `${slug || 'topic'}.json`);
    fs.writeFileSync(file, JSON.stringify(arr, null, 2), 'utf8');
    summary.push({ topic, slug, count: arr.length, file });
  }
  summary.sort((a,b)=>a.topic.localeCompare(b.topic));
  console.log('Wrote topic splits:', summary);
}

main();

