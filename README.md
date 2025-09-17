# StudyWan (學灣)

Language learning app for TOCFL 1–2 vocabulary.

A comprehensive Traditional Mandarin learning platform designed specifically for German speakers, with a focus on TOCFL (Test of Chinese as a Foreign Language) preparation and Taiwanese dialect integration.

## Project Vision

StudyWan aims to bridge the gap in Traditional Chinese language learning resources for German speakers, particularly focusing on:

- TOCFL exam preparation
- Taiwanese dialect understanding and usage
- Traditional Chinese character mastery
- Practical language application in a Taiwanese context

## Features (Current)

- 🎯 TOCFL‑aligned decks (A1 base; A2/B1/B2 stubs) + Signs deck
- 🧠 SRS reviews with swipe‑to‑grade (Motion + @use‑gesture)
- ⚡ Quick Test MCQ; Reader Packs with popover glosses (Radix + Floating UI)
- 🗣️ Listening Drills (once‑through prompt) and Exam Simulation (35/50 skeleton)
- 🧩 Grammar Drills (reorder/fill pattern; seeds for A1)
- 🔄 Progress dashboard with session Export/Import
- 🀄 Traditional‑first UI; Zhuyin default with Pinyin toggle; optional tone colours
- 📦 PWA scaffold with offline caching for audio/images (vite‑plugin‑pwa)
- 🌐 Minimal i18n loader and locale files (en, de, zh‑TW)

## Project Status

- MVP shell is implemented and deployable (Vite + Pages).
- Core study modes are wired (SRS, Quick Test, Reader, Listening, Exam, Grammar).
- Data ingestion tooling and validators are available.

## Getting Started

Run locally (apps/web):

1) Install deps: `cd apps/web && npm i`
2) Dev server: `npm run dev`
3) Typecheck/tests: `npm run typecheck && npm test`
4) Validate data: `npm run validate:data` (set `STRICT_A1_GLOSSES=1` for A1 gloss enforcement)

Data and content:
- Deck manifest is served from `apps/web/public/data/decks/manifest.json`
- Signs deck: `apps/web/public/data/band-A/signs/signs-a1.json`
- Stories + manifest: `apps/web/public/stories/`
- Dict merge tool: `scripts/fetch-dicts.ts` (CC‑CEDICT/MOE)

### Using the Signs deck
1) Open the app and choose the deck: “A1 Signs (Taiwan Signage)”. Study cards show English gloss and a short hint/etymology under the pronunciation.
2) Read sign‑aligned micro‑stories (MRT etiquette; mall signage) and answer the post‑story questions.

Screenshot: docs/images/signs-deck.png (placeholder)

- `CONTRIBUTING.md` for contribution guidelines
- `PROJECT_STRUCTURE.md` for technical documentation and project organization

## Documentation Index
- Project overview (TOCFL Coach): `docs/tocfl-coach/README.md`
- MVP spec: `docs/tocfl-coach/SPEC_MVP.md`
- Roadmap: `docs/tocfl-coach/ROADMAP.md`
- Data model: `docs/tocfl-coach/DATA_MODEL.md`
- SRS algorithms: `docs/tocfl-coach/ALGORITHMS_SRS.md`
- Components (frontend): `docs/tocfl-coach/COMPONENTS.md`
- Pseudocode (frontend): `docs/tocfl-coach/PSEUDOCODE_FRONTEND.md`
- Pseudocode (backend): `docs/tocfl-coach/PSEUDOCODE_BACKEND.md`
- Exam mappings: `docs/tocfl-coach/EXAM_MAPPINGS.md`
- Listening/Reading drills: `docs/tocfl-coach/DRILLS_LISTENING_READING.md`
- Content sourcing: `docs/tocfl-coach/CONTENT_SOURCING.md`
- Localization: `docs/tocfl-coach/LOCALIZATION.md`
- UX copy: `docs/tocfl-coach/UX_COPY_EN.md`
- Test format refs: `docs/tocfl-coach/TEST_FORMAT_REFERENCES.md`
- Dev setup (Vite + Pages): `docs/tocfl-coach/DEV_SETUP.md`
- Privacy & security: `docs/tocfl-coach/PRIVACY_SECURITY.md`
- QA plan: `docs/tocfl-coach/QA_TESTPLAN.md`
- Competitor research: `docs/tocfl-coach/RESEARCH_COMPETITORS.md`
- Ingestion guide: `docs/tocfl-coach/INGESTION.md`
- Dictionary merge (optional): `docs/tocfl-coach/DICT_MERGE.md`
 - Localization: `docs/tocfl-coach/LOCALIZATION.md`
- Official links (SC‑TOP/CCCC): `docs/tocfl-coach/OFFICIAL_LINKS.md`
- Card schema (guide): `docs/tocfl-coach/CARDS_SCHEMA.md`
- Card schema (JSON): `data/schema/cards.schema.json`
- Story schema (JSON): `data/schema/story.schema.json`
- Level splits (Novice/A1 topics): `docs/tocfl-coach/LEVEL_SPLITS.md`
- Stories & culture: `docs/tocfl-coach/STORIES_AND_CULTURE.md`
- Engineering references (official docs): `docs/ENGINEERING_REFERENCES.md`
- Codex CLI setup: `docs/CODEX_SETUP.md`
- Regional resources (Germany): `docs/REGIONAL_RESOURCES_DE.md`
- Agent operating guide: `AGENT.md`

## Contributing

We welcome contributions! See `CONTRIBUTING.md` for guidelines.

## License

MIT — see `LICENSE` for details.

---
StudyWan (學灣) combines "study" with "wan" (灣) from Taiwan (台灣), representing our focus on Traditional Chinese and Taiwanese dialect learning.
