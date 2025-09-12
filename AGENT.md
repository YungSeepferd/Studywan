# Agent Operating Guide (StudyWan)

## Purpose
This repository contains planning docs and ingestion tools for building a Traditional-first, TOCFL-aligned app (Bands A–B). This guide explains how an agent should operate on this repo to reach the MVP.

## Ground Rules
- Always read the documentation index before making changes:
  - Root: `README.md` → Documentation Index
  - Specs: `docs/tocfl-coach/*` (MVP, Roadmap, Components, Algorithms)
  - Splits: `docs/tocfl-coach/LEVEL_SPLITS.md`
  - References: `docs/ENGINEERING_REFERENCES.md`
  - Codex setup: `docs/CODEX_SETUP.md`
- Respect licensing: do not bundle closed dictionary/audio content without permission.
- Prioritize MVP scope: Flashcards + Quick Test; toggles (Trad/Simp, Zhuyin/Pinyin); local SRS; CSV/PDF import; GitHub Pages hosting.
- Keep changes minimal and focused; if structure changes, update the relevant docs in the same PR.

## Folder Map
- `docs/tocfl-coach/`: specs, data model, SRS, UX, ingestion.
- `data/schema/`: JSON schema for cards.
- `data/seed/`: seed JSON bundles (e.g., `band-A/level1.json`).
- `data/raw/`: PDF-extracted text intermediates (ignored from VCS if large).
- `data/staging/`: TSV intermediates.
- `tools/ingest/`: ingestion scripts (PDF→text, text→TSV, TSV→JSON, grammar).
- `apps/web/`: Vite + React app (MVP shell).

## Ingestion Workflow
1) Convert PDFs to text:
   - `make extract-a1-text` (uses `tools/ingest/pdf_to_text.sh`)
   - If it fails, install poppler (`pdftotext`) or `pdfminer.six`.
2) Convert text to TSV:
   - `make parse-a1-tsv` (heuristic parser; adjust as needed).
3) Convert TSV to JSON (schema-conformant):
   - `make ingest-a1` → writes `data/seed/band-A/level1.json`.
4) Splits:
   - Topic splits: `make split-a1-topics` / `split-a2-topics`
   - Packs: `make pack-a1` (and others)
   - A1 program (A1a/A1b/A1c): `make a1-program`
4) Grammar (optional):
   - `python3 tools/ingest/grammar_pdf_to_md.py --in <text> --out content/grammar/band-A/grammar.md`.

## MVP Implementation Steps
1) Frontend scaffold exists in `apps/web` (see `docs/tocfl-coach/DEV_SETUP.md`).
2) Load `apps/web/public/data/*` decks; implement components per `docs/tocfl-coach/COMPONENTS.md`.
3) Implement SRS (SM-2) per `docs/tocfl-coach/ALGORITHMS_SRS.md`.
4) Implement Quick Test (10/20/50) with once-through audio behavior from `DRILLS_LISTENING_READING.md`.
5) Add toggles (Trad/Simp, Zhuyin/Pinyin) and persist prefs locally.
6) Ship to GitHub Pages.

## Quality Gates
- Validate seed JSON against `data/schema/cards.schema.json`.
- Run minimal validator: `make validate-seed` for quick checks.
- Manual smoke: verify toggles, SRS math, timer constraints.
- See `docs/tocfl-coach/QA_TESTPLAN.md` for app-level checks.

## Notes for Agents
- Tools may require local dependencies. When not available, create the outputs via alternative path (manual TSV) and proceed.
- Keep intermediate artifacts (`data/raw`, `data/staging`) small or excluded from commits if large.
