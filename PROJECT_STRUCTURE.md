# Project Structure

This document outlines the structure for the StudyWan project, focusing on a single, interactive curriculum path that sequences TOCFL content (A→B) into a guided journey. It also covers alternative practice modes for “played‑through” content.

## Content Organization

### TOCFL Levels

The content will be organized according to the six TOCFL levels:

1. Band A (Levels 1-2)
   - Novice (入門級)
   - Level 1 (基礎級)

2. Band B (Levels 3-4)
   - Level 2 (進階級)
   - Level 3 (高階級)

3. Band C (Levels 5-6)
   - Level 4 (流利級)
   - Level 5 (精通級)

### Content Categories

Each level will include:

- Vocabulary Lists
- Grammar Points
- Reading Materials
- Listening Exercises
- Writing Prompts
- Speaking Practice
- Cultural Notes

### Taiwanese Dialect Integration

Taiwanese dialect content will be organized as:

1. Basic Pronunciation
   - Tonal System
   - Sound Changes
   - Common Differences from Mandarin

2. Vocabulary Integration
   - Common Expressions
   - Daily Usage
   - Regional Variations

3. Cultural Context
   - Local Customs
   - Historical Background
   - Modern Usage

## Curriculum Path (single journey)

### Goals
- Present one clear learning journey (A→B) with units that bundle vocab, stories, listening, and grammar.
- Gate progress using mastery checks (Quick Test, Listening score, SRS coverage), but allow free exploration.
- Offer alternative practice for already completed units (spiral review, cloze, typing, handwriting, listening‑only).

### Data Model (proposed)
- File: `data/curriculum/path.json`
- Node (Unit/Lesson) fields:
  - `id`, `title`, `band`, `level`, `topic` (optional), `estMinutes`, `xp`
  - `content`: references by id ⇒ `{ deckId, storyIds[], grammarDeckId?, audioPackId? }`
  - `gates`: mastery requirements ⇒ e.g. `{ quickTestMin: 80, listeningMin: 70, srsCoverageMin: 0.6 }`
  - `next`: array of next node ids (linear or branching)
  - `tags`: e.g. ["signs", "greeting", "transport"]
- Edge: implied by `next`
- Progress: `localStorage` or IndexedDB ⇒ `{ nodeId: { done, scores, attempts, startedAt, completedAt } }`

### UI (proposed)
- Path view: a linear/branching stepper with Unit cards. Each Unit opens a Runner that sequences:
  1) Study (SRS subset for the unit)
  2) Quick Test (10–20 items)
  3) Reader Pack (story + popovers + questions)
  4) Listening Drills (once‑through)
  5) Grammar Drill (1–3 items)
  6) Mastery Check (aggregated score vs. gates)
- Alternative practice for completed Units:
  - Spiral review (mix across recent units)
  - Cloze (gap‑fill on story sentences)
  - Typing mode (IME typing or bopomofo → Hanzi mapping)
  - Handwriting practice (HanziWriter for all chars)
  - Listening‑only (gist/detail without text)

### Integration with current code
- Use existing manifest ids (`apps/web/public/data/decks/manifest.json`) inside `path.json` for `deckId`.
- Stories already carry `questions`; grammar has a small A1 deck; Listening Drills & Exam exist.
- Use `apps/web/src/lib/store/history.ts` to log per‑unit attempts.
- Add `apps/web/src/features/path/` components: PathView, UnitCard, PathRunner.

### Validation & analytics
- Add Zod schema for path nodes (extend `apps/web/src/lib/schema.ts`).
- Add selectors for: unit accuracy, attempts, time spent; expose XP, streak, weak areas by topic.

## Technical Structure

The technical architecture (current + planned refinements):

- Frontend: React + Vite (already in place)
- UI: Radix UI + Floating UI (popovers, tooltips, dialogs)
- Animation/gestures: Motion + @use‑gesture (swipes, transitions)
- Data validation: Zod (cards, stories; add `path.json` schema)
- Testing: Vitest (unit); add Playwright (E2E for path/flows)
- PWA: vite‑plugin‑pwa; runtime caching for audio/images
- i18n: lightweight loader now; migrate to i18next/react‑i18next
- Segmentation: nodejieba (planned in build step for story highlights)
- Charts: Recharts (planned for dashboard time‑series)
- Auth/Sync: Supabase (optional, opt‑in)

## Data Organization

### Character Data Structure

Characters will include:

- Traditional Form
- Zhuyin
- Pinyin
- German Translation
- Usage Examples
- Taiwanese Pronunciation (where applicable)
- TOCFL Level Classification

### Exercise Types

1. Recognition
2. Writing Practice
3. Contextual Usage
4. Listening Comprehension
5. Speaking Exercises
6. Grammar/Cloze/Reorder
7. Spiral Review (mixed across path)
8. Typing/Hanzi handwriting practice

## Played‑through Content: Alternative Practice
- Spiral Review: Create periodic mixed packs from recently completed units.
- Cloze: Remove target words from stories, require fill‑in (align to GrammarCard patterns).
- Typing: Switch input targets to typed Hanzi/Pinyin/Zhuyin to reinforce production.
- Handwriting: Use `MultiCharStrokes` to practice every character, not just the first.
- Listening‑only: Audio prompt with choices, no text support.

## Next Steps & TODOs
1. Define `data/curriculum/path.json` with 6–10 A1 units (include the Signs unit).
2. Add Zod schema + loader for path nodes; store progress under `localStorage:path:`.
3. Implement PathView and PathRunner (sequence existing flows; simple gating). 
4. Add “Played‑through” menu for completed nodes (Spiral/Cloze/Typing/Handwriting/Listening‑only).
5. Integrate nodejieba into `tools/ingest/segment_stories.ts`; add segmentation tests; use segmented tokens for highlighting.
6. Add Recharts to Dashboard: reviews/day, accuracy trend, unit completion times.
7. Migrate top‑level strings to i18next; ensure path UI is localised (en, de, zh‑TW).
8. Add Playwright E2E: path navigation, unit mastery, alternative practice, resume state.
9. Optional: Supabase opt‑in for syncing path progress and error bank.

## Milestones
- M1: Path skeleton (A1 units, Runner, gating) + basic analytics
- M2: Alternative practice modes + segmentation‑based highlighting
- M3: i18n migration + Dashboard charts + E2E tests
- M4: A2/B1 expansion + optional sync

## Future Considerations

- Mobile Application Development
- Offline Content Access
- Progress Tracking System
- Community Features
- Content Creation Tools

This structure is subject to revision as the project develops.
