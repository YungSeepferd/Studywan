# PDF → JSON Ingestion (TOCFL lists + grammar)

This guides converting the PDFs under `TOCFL PDFs/` into deck JSON bundles compatible with `data/schema/cards.schema.json`, and extracting grammar notes into Markdown.

## Overview
1) Convert PDFs to TSV (or text)
2) Normalize columns and enrich with Zhuyin
3) Map to card fields (band, level, tags)
4) Export per-level JSON into `data/seed/band-{A|B}/level{n}.json`

## 1) Convert PDF → text/TSV
Preferred: TSV to avoid CSV quoting issues.
- CLI script (auto-detects tool):
  tools/ingest/pdf_to_text.sh "TOCFL PDFs/TOCFL level 1-2 vocabulary.pdf" data/raw/a_band.txt

- If using a GUI PDF tool: export to TSV/CSV with columns: trad, simp, pinyin, gloss_en, level, topic.

## 2) Normalize
- Ensure tone marks in `pinyin` (prefer marks over numbers)
- Add `zhuyin` if available (MOE or your source); otherwise leave blank
- Tag Taiwan/Mainland variants via `tags` (e.g., tw-usage, cn-variant)

## 3) Map columns
Minimal TSV headers (tab-separated):
trad\tsimp\tpinyin\tgloss_en\tlevel\ttopic

Optional: gloss_de, pos

## 3.5) Convert text → TSV (if you exported plain text)
  python3 tools/ingest/text_to_tsv.py \
    --in data/raw/a_band.txt \
    --out data/staging/a1.tsv \
    --level 1 \
    --topic general

## 4) Build JSON (TSV → JSON)
Use the helper script for TSV → JSON:
- Script: `tools/ingest/tsv_to_json.js`
- Example:
  node tools/ingest/tsv_to_json.js \
    --band A --level 1 \
    --in data/staging/a1.tsv \
    --out data/seed/band-A/level1.json

## 5) Grammar (optional)
- Convert grammar PDF to text (Step 1) then run:
  python3 tools/ingest/grammar_pdf_to_md.py \
    --in data/raw/grammar_a_band.txt \
    --out content/grammar/band-A/grammar.md

## 6) Optional Splits (recommended for pacing)
- Topic splits (A1/A2):
  make split-a1-topics
  make split-a2-topics
- Fixed-size packs:
  make pack-a1
  make pack-a2
- Programmatic grouping (A1a/A1b/A1c):
  make a1-program

## Validation
Editors can validate JSON against `data/schema/cards.schema.json`.

## Notes
- Do not bundle closed-content definitions/audio without permission.
- Keep `source` metadata where possible (PDF filename or URL).
