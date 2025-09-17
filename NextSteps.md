# Next Steps (Roadmap Execution)

This plan focuses on elevating StudyWan from MVP to a guided, path‑based experience with robust practice and analytics.

## Milestone M1 — Curriculum Path (2–3 weeks)
- Data: create `data/curriculum/path.json` with ~6–10 A1 units (include Signs).
- Schema: add Zod types + loader; store per‑unit progress in localStorage/IndexedDB.
- UI: PathView and PathRunner exist; enforce gating (Quick/Listening/SRS), add resume and mastery checks UI.
- Highlighting: integrate `nodejieba` in `tools/ingest/segment_stories.ts`; switch Reader/Story highlighting to token spans; add unit tests.
- Analytics: expose basic unit stats (time spent, attempts, best score).

Acceptance
- Path page lists units with status; clicking runs the sequencer.
- Mastery gates enforced (Quick Test ≥80, Listening ≥70, SRS coverage ≥60%).
- Token‑based highlighting passes unit tests.

## Milestone M2 — Alternative Practice + Charts (3–4 weeks)
- Spiral Review: mixed quick sessions across recently completed units.
- Cloze: auto‑generate blanks from story sentences using GrammarCard patterns.
- Typing Mode: typed Hanzi/Pinyin/Zhuyin targets for production practice.
- Handwriting: per‑character zoom modal (HanziWriter) for all characters of a term.
- Dashboard: add Recharts time‑series (reviews/day, accuracy trend) and unit completion charts.

Acceptance
- Each completed unit exposes 3+ practice modes.
- Dashboard shows at least 2 charts and unit completion summaries.

## Milestone M3 — i18n + E2E + Audio (2–3 weeks)
- Migrate minimal i18n to i18next/react‑i18next; externalize core strings.
- Add Playwright E2E for: path navigation, mastery, alternative practice, resume.
- Seed a small set of Taiwan‑accent audio samples under `apps/web/public/audio/`; verify PWA caching and Listening Drills flow.

Acceptance
- Language picker switches core UI copy (en/de/zh‑TW) without missing keys.
- E2E suite runs green locally and in CI.
- Listening Drills play cached audio offline.

## Milestone M4 — Data Growth + Sync (ongoing)
- Ingest SC‑TOP A2/B1/B2 fully; create program splits; update manifests.
- Optional Supabase opt‑in sync for path progress, SRS, error bank (privacy first).
- Licensing & Attribution page: document dictionary, audio, and story sources.

Acceptance
- A2/B1/B2 units appear in the Path; decks/stories load dynamically.
- Sync is off by default and safe to enable; Attribution page present.

Notes
- CI is in place (lint, typecheck, tests, data + locale validation) and Pages deploy is configured with `VITE_BASE=/StudyWan/`.
- Keep Traditional‑first and Zhuyin default; maintain Signs deck + stories as on‑ramp content.
