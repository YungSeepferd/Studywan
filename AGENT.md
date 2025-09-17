# Agent Operating Guide (StudyWan)

This guide adapts the Codex CLI agent best practices to the StudyWan repo. It reflects the current code and docs so changes remain safe, focused, and auditable.

## Mission & Scope
- Ship a Traditional‑first TOCFL learning app (A→B, future C) with decks, stories, listening drills, grammar, and an end‑to‑end Curriculum Path.
- Keep code and docs in sync. When you change behavior, update README, ToDo, NextSteps, Roadmap, Components, and Project Structure.

## Operating Principles (Codex style)
- Be concise and action‑oriented; use short preambles before grouped tool calls.
- Plan when work spans multiple steps (use one in‑progress item); otherwise, move quickly.
- Prefer `rg` for search, read files in ≤250‑line chunks, and use `apply_patch` for edits.
- Keep diffs small and scoped; avoid drive‑by refactors.
- Test the code you touch first; don’t fix unrelated tests.

## Safety, Sandbox, Approvals
- Default sandbox: workspace‑write. Network is restricted; only escalate for intentional installs (document why).
- Approval policy: on‑failure. Prefer local tooling and staged scripts (see Makefile and scripts/).
- Never run destructive commands that the user didn’t ask for. Use `apply_patch` and small, auditable diffs.

## Repository Map
- `apps/web/`: Vite + React app. Modes: Study (SRS), QuickTest, ReaderPack, Story, Listening, Exam, Grammar, Dashboard, Settings, Command Palette.
- `apps/web/public/`: runtime assets — data (decks, stories, manifests), audio, locales, icons.
- `data/`: schema, seed/staging, programs (topic groupings), stories, (planned) curriculum path.
- `tools/ingest/`: TSV→JSON, topic grouping, dict merge, story segmentation (planned).
- `docs/`: product/engineering specs and guides.

## Ready‑Now Playbook
1) Web app: `cd apps/web && npm i && npm run dev`
2) Typecheck/tests: `npm run typecheck && npm test`
3) Validate data: `npm run validate:data` (env `STRICT_A1_GLOSSES=1` to enforce A1 glosses)
4) PWA: set `VITE_ENABLE_PWA=true`, ensure correct `VITE_BASE` for Pages.

## Current Feature Map
- SRS Study (swipe‑to‑grade), Quick Test (MCQ), Reader popovers, Story with post‑story questions.
- Listening Drills (once‑through), Exam Simulation (35 listening / 50 reading skeleton).
- Grammar Drills (reorder/fill patterns); Dashboard counters + Session Export/Import.
- Signs deck (A1) and sign‑aligned micro‑stories; minimal i18n loader; PWA with offline audio/image caching.

## Data & Content Rules
- Traditional‑first; Zhuyin default, Pinyin toggle; Simplified via OpenCC when needed.
- Cards: include `gloss_en`; prefer concise `hint` and short `etymology` per CARDS_SCHEMA.md conventions.
- Stories: link vocab via `vocabRefs`; add `questions` (gist/detail/vocab/inference); add `bodySimp` when appropriate.
- Dictionaries & licensing: prefer MOE for TW defs/Zhuyin; fall back to CC‑CEDICT for glosses; don’t bundle licensed datasets.

## Ingestion Workflow (A bands)
1) PDF→text: `make extract-a1-text` (poppler) or Python/pdfminer fallback.
2) text→TSV: `make parse-a1-tsv`
3) TSV→JSON: `make ingest-a1` → `data/seed/band-A/level1.json`
4) Topic splits / packs / programs: `make split-a1-topics` / `pack-a1` / `a1-program` (see Makefile for A2/B1/B2)
5) Dict merge: `make merge-dicts-ts` (scripts/fetch-dicts.ts)
6) Copy to public: `make web-copy-decks` / `make web-copy-stories`

## Curriculum Path (planned → implement incrementally)
- Data: `data/curriculum/path.json` nodes with `{ id, title, band, level, content:{ deckId, storyIds[], grammarDeckId? }, gates:{ quickTestMin, listeningMin, srsCoverageMin }, next:[] }`.
- UI: PathView (overview) + PathRunner (Study → Quick Test → Reader → Listening → Grammar → Mastery check) with resume and gating.
- Progress: localStorage/IndexedDB; reuse `lib/store/history`.
- Alternative practice for completed units: Spiral Review, Cloze, Typing, Handwriting (HanziWriter), Listening‑only.

## Engineering Next Steps (prioritized)
1) Segmentation: add `nodejieba` to story build; switch highlighters to token spans; add tests.
2) i18n: migrate minimal loader to i18next/react‑i18next; move Settings/DeckPicker/Palette first; keep locale parity checks.
3) Charts: add Recharts to Dashboard (reviews/day, accuracy trend, unit completion).
4) E2E: Playwright for study, reader popovers + quiz, listening once‑through, exam skeleton, and Path runner.
5) Audio: seed Taiwan‑accent audio under `apps/web/public/audio/` and reference from Listening/Stories; confirm PWA caching.
6) Optional sync: Supabase opt‑in for path/SRS/error bank (schema in `docs/sync/SCHEMA.md`).

## Quality Gates & CI
- Data schemas (Zod) for cards/stories (and path when added). Run `npm --prefix apps/web run validate:data`.
- Unit tests: Vitest for SRS, highlight, pronunciation, gesture thresholds, grammar scoring, deck loader.
- CI: `.github/workflows/ci.yml` runs typecheck, unit tests, data validation, and locale parity checks.
- Accessibility: ARIA labels, focus order, prefers‑reduced‑motion, high‑contrast coverage in popovers/modals.

## Change Management
- Small, auditable diffs via `apply_patch`. Avoid unrelated refactors.
- When you touch features, update docs: README, ToDo, NextSteps, Roadmap, Components, Project Structure.
- Don’t add license headers unless requested; don’t commit large or licensed datasets.

## Troubleshooting
- Vitest/tinypool teardown can fail in constrained sandboxes; verify locally.
- If you must install packages, isolate the step and document why; prefer scripts/Makefile entries.

