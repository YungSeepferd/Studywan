# Roadmap

## Progress Snapshot
- Flashcards + Quick Test implemented; SRS with swipe‑to‑grade
- Reader Packs with popover glosses; story quizzes added
- Listening Drills and Exam Simulation (35 listening / 50 reading skeleton)
- Grammar Drills scaffold (A1)
- Dashboard counters + session export/import
- PWA scaffold with offline caching (audio/images)

## MVP (2–3 weeks)
- Data: Band A/B wordlists → JSON bundles.
- Study: Flashcards + Quick Test (listening/reading).
- Toggles: Trad/Simp, Zhuyin/Pinyin.
- Storage: localStorage; CSV import.
- Deploy: GitHub Pages.

## v1 (6–8 weeks)
- Supabase auth + sync.
- Timed drills with once-through audio; per-band presets.
- Taiwan usage flags; component view; tone-sandhi checks.
- Progress dashboards; error bank.
 - Curriculum Path (A→B) baseline: 6–10 A1 units, gating, resume.

## v2 (3 months)
- B2 reading packs; cloze and headline-match items.
- Recording mic checks (self-assessment).
- FSRS scheduling; analytics → personalized pacing.
- “Exam Day” simulator (full section timing; score ranges).
 - Alternative practice for completed units: Spiral Review, Cloze, Typing, Handwriting, Listening‑only.

## Directions (long-run)
- Reader with levelled texts (A→B); add GLOSSIKA-style shadowing.
- Character path (HanziHero-style components) integrated w/ vocab.
- Cross-strait toggle (TW/Mainland) for usage & readings.
- Mobile PWA; offline audio packs.

## Near‑term Next Steps
- Integrate nodejieba segmentation in story build; unify highlighting; add tests.
- Migrate minimal i18n to i18next for key views (Settings, DeckPicker, Palette).
- Add Recharts time‑series to Dashboard; unit completion analytics.
- Implement Curriculum Path files (`data/curriculum/path.json`), schema, and PathView/PathRunner.
- Add Playwright E2E for path navigation, mastery checks, and resume.
- Seed additional sign‑aligned stories and expand the Signs deck.
