#!/usr/bin/env node
// Build grouped decks (A1a/A1b/A1c) based on topic lists from a config.
// Usage: node tools/ingest/group_topics.js \
//   --in data/seed/band-A/level1.json \
//   --config data/programs/a1_topics_program.json \
//   --outdir data/seed/band-A/a1_program

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

function main() {
  const { in: inFile, config, outdir } = parseArgs();
  if (!inFile || !config || !outdir) {
    console.error('Required: --in <deck.json> --config <program.json> --outdir <dir>');
    process.exit(1);
  }
  const deck = JSON.parse(fs.readFileSync(inFile, 'utf8'));
  const prog = JSON.parse(fs.readFileSync(config, 'utf8'));
  fs.mkdirSync(outdir, { recursive: true });

  const byTopic = new Map();
  for (const card of deck) {
    const t = card.topic || '其他';
    if (!byTopic.has(t)) byTopic.set(t, []);
    byTopic.get(t).push(card);
  }

  const summary = [];
  for (const groupName of Object.keys(prog)) {
    const topics = prog[groupName];
    const out = [];
    for (const t of topics) {
      const arr = byTopic.get(t) || [];
      out.push(...arr);
    }
    const outPath = path.join(outdir, `${groupName}.json`);
    fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8');
    summary.push({ group: groupName, topics, count: out.length });
  }
  console.log('Wrote groups:', summary);
}

main();

