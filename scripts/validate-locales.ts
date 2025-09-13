#!/usr/bin/env node
import fs from 'fs'
import path from 'path'

const root = path.join('apps', 'web', 'public', 'locales')
const langs = fs.readdirSync(root).filter((d) => fs.statSync(path.join(root, d)).isDirectory())
const files = ['common.json']

function flatKeys(obj: any, prefix = ''): string[] {
  const out: string[] = []
  for (const k of Object.keys(obj)) {
    const key = prefix ? `${prefix}.${k}` : k
    const v = obj[k]
    if (v && typeof v === 'object' && !Array.isArray(v)) out.push(...flatKeys(v, key))
    else out.push(key)
  }
  return out
}

let issues = 0
for (const f of files) {
  const dicts = langs.map((l) => ({ l, data: JSON.parse(fs.readFileSync(path.join(root, l, f), 'utf8')) }))
  const base = new Set(flatKeys(dicts[0].data))
  for (const d of dicts.slice(1)) {
    const keys = new Set(flatKeys(d.data))
    for (const k of base) if (!keys.has(k)) { console.error(`[missing] ${d.l}/${f}: ${k}`); issues++ }
    for (const k of keys) if (!base.has(k)) { console.error(`[extra] ${d.l}/${f}: ${k}`); issues++ }
  }
}

if (issues) { process.exit(1) }
console.log('Locales OK')

