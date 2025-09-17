# TODO (Next Iteration)

M1 — Curriculum Path
- [ ] Define `data/curriculum/path.json` (A1 units incl. Signs)
- [ ] Add Zod schema + loader; persist per‑unit progress
- [ ] Enforce gating (Quick/Listening/SRS), add resume + mastery checks UI
- [ ] Compute SRS coverage from `srsMap` for unit decks; block/enable based on gates
- [ ] Wire segmentation tokens into Reader/Story highlighting; deprecate greedy highlighter
- [ ] Unit tests for tokenized highlighter + mastery checks

M2 — Practice + Analytics
- [ ] Spiral Review mode for completed units
- [ ] Cloze drill generator (story sentences)
- [ ] Typing practice toggle (Hanzi/Pinyin/Zhuyin)
- [ ] Handwriting modal for all characters in term
- [ ] Dashboard charts with Recharts (reviews/day, accuracy, completion)

M3 — i18n + E2E + Audio
- [ ] Migrate to i18next/react‑i18next; extract core strings
- [ ] Playwright E2E: path, mastery, practice, resume
- [ ] Seed Taiwan‑accent audio samples; verify PWA caching

M4 — Data + Sync + Attribution
- [ ] Ingest SC‑TOP A2/B1/B2 + program splits; update manifests
- [ ] Optional Supabase opt‑in sync (path/SRS/error bank)
- [ ] Licensing & Attribution page (dictionaries, audio, stories)
