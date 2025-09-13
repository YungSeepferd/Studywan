#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import { CardSchema, StorySchema } from '../apps/web/src/lib/schema'

type Issue = { file: string; index?: number; message: string }

function readJson(file: string): any {
  const raw = fs.readFileSync(file, 'utf8')
  try {
    return JSON.parse(raw)
  } catch (e) {
    throw new Error(`Invalid JSON in ${file}`)
  }
}

function listFiles(dir: string, filter: (f: string) => boolean): string[] {
  if (!fs.existsSync(dir)) return []
  const out: string[] = []
  for (const entry of fs.readdirSync(dir)) {
    const p = path.join(dir, entry)
    const stat = fs.statSync(p)
    if (stat.isDirectory()) out.push(...listFiles(p, filter))
    else if (filter(p)) out.push(p)
  }
  return out
}

function containsSimplified(text: string): boolean {
  // Heuristic: detect common simplified characters
  const simplifiedSample = '们车这后发见国问长觉师时气电汉广冲见处体药门风鱼鸟马龙丽业'
  return [...text].some(ch => simplifiedSample.includes(ch))
}

async function main() {
  const cardDirs = [
    'data/seed/band-A',
    'data/seed/band-B',
    'data/seed/band-C',
  ]
  const storyDir = 'data/stories'
  const issues: Issue[] = []

  // Validate decks
  const deckFiles: string[] = []
  for (const d of cardDirs) deckFiles.push(...listFiles(d, f => f.endsWith('.json')))
  for (const f of deckFiles) {
    try {
      const data = readJson(f)
      if (Array.isArray(data)) {
        data.forEach((c, i) => {
          const res = CardSchema.safeParse(c)
          if (!res.success) {
            issues.push({ file: f, index: i, message: res.error.errors.map(e => e.message).join('; ') })
          } else {
            // Optional simplified leakage check for Traditional-first decks
            const t = res.data.trad || ''
            if (containsSimplified(t)) {
              issues.push({ file: f, index: i, message: 'Potential Simplified char in trad field' })
            }
            // Optional stricter checks for A1 gloss completion
            if (process.env.STRICT_A1_GLOSSES === '1') {
              if (res.data.band === 'A' && res.data.level === 1) {
                const gloss = (res.data.gloss_en ?? '').trim()
                if (!gloss) {
                  issues.push({ file: f, index: i, message: 'Missing gloss_en for A1 card' })
                }
              }
            }
          }
        })
      } else {
        issues.push({ file: f, message: 'Deck JSON should be an array' })
      }
    } catch (e: any) {
      issues.push({ file: f, message: e.message })
    }
  }

  // Validate stories
  const storyFiles = listFiles(storyDir, f => f.endsWith('.json'))
  for (const f of storyFiles) {
    try {
      const data = readJson(f)
      const res = StorySchema.safeParse(data)
      if (!res.success) {
        issues.push({ file: f, message: res.error.errors.map(e => e.message).join('; ') })
      } else if (res.data.body && containsSimplified(res.data.body)) {
        issues.push({ file: f, message: 'Potential Simplified char in Traditional body' })
      }
    } catch (e: any) {
      issues.push({ file: f, message: e.message })
    }
  }

  if (issues.length) {
    console.error(`Validation finished with ${issues.length} issue(s):`)
    for (const it of issues) {
      console.error(`- ${it.file}${it.index !== undefined ? `[#${it.index}]` : ''}: ${it.message}`)
    }
    process.exit(1)
  }
  console.log('Validation OK: all card and story data passed')
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
