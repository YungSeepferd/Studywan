# Dictionary Merge (Optional Enrichment)

This step enriches cards with English glosses from CC‑CEDICT and Zhuyin (and optionally definitions) from MOE TSVs. It is optional and depends on you having local copies of those datasets.

## Inputs (place locally)
- CC‑CEDICT file: `data/dicts/cedict_ts.u8` (from MDBG)
- MOE TSV: `data/dicts/moe.tsv` with headers (default) `word\tzhuyin\tdef` (you can change column names via flags)

## Command

Enrich A1 deck with CC‑CEDICT only:

make merge-a1-cedict

Enrich A1 deck with CC‑CEDICT + MOE TSV:

make merge-a1-cedict-moe

Outputs: `data/seed/band-A/level1_enriched.json`

Alternatively, using the TypeScript tool (no Makefile needed):

tsx scripts/fetch-dicts.ts \
  --in data/seed/band-A/level1.json \
  --out data/seed/band-A/level1_enriched.json \
  --cedict data/dicts/cedict_ts.u8 \
  --moe-tsv data/dicts/moe.tsv --moe-word word --moe-zhuyin zhuyin --moe-def def

## Notes
- Only fills empty fields; existing `gloss_en`/`zhuyin` are preserved.
- Adds `tags`: `src:cedict`, `src:moe` when enrichment occurs.
- Do not redistribute dictionary contents if license disallows bundling; prefer on-device enrichment during build if needed.
