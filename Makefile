SHELL := /bin/bash

.PHONY: doctor
doctor:
	@bash tools/doctor.sh

.PHONY: ingest-a1
ingest-a1:
	@node tools/ingest/tsv_to_json.js --band A --level 1 --in data/staging/a1.tsv --out data/seed/band-A/level1.json

.PHONY: extract-a1-text
extract-a1-text:
	@bash tools/ingest/pdf_to_text.sh "TOCFL PDFs/TOCFL level 1-2 vocabulary.pdf" data/raw/a_band.txt

.PHONY: parse-a1-tsv
parse-a1-tsv:
	@python3 tools/ingest/text_to_tsv.py --in data/raw/a_band.txt --out data/staging/a1.tsv --level 1 --topic general

.PHONY: pipeline-a1
pipeline-a1: extract-a1-text parse-a1-tsv ingest-a1

# XLSX direct pipeline (preferred for official 8,000 list)
.PHONY: xlsx-a1
xlsx-a1:
	@python3 tools/ingest/xlsx_to_tsv.py --in "TOCFL PDFs/華語八千詞表20240923.xlsx" --sheet "入門級(Level 1)" --out data/staging/a1_from_xlsx.tsv
	@python3 tools/ingest/map_xlsx_tsv.py --in data/staging/a1_from_xlsx.tsv --out data/staging/a1.tsv --level 1
	@node tools/ingest/tsv_to_json.js --band A --level 1 --in data/staging/a1.tsv --out data/seed/band-A/level1.json

.PHONY: xlsx-a2
xlsx-a2:
	@python3 tools/ingest/xlsx_to_tsv.py --in "TOCFL PDFs/華語八千詞表20240923.xlsx" --sheet "基礎級(Level 2)" --out data/staging/a2_from_xlsx.tsv
	@python3 tools/ingest/map_xlsx_tsv.py --in data/staging/a2_from_xlsx.tsv --out data/staging/a2.tsv --level 2
	@node tools/ingest/tsv_to_json.js --band A --level 2 --in data/staging/a2.tsv --out data/seed/band-A/level2.json

.PHONY: xlsx-b1
xlsx-b1:
	@python3 tools/ingest/xlsx_to_tsv.py --in "TOCFL PDFs/華語八千詞表20240923.xlsx" --sheet "進階級(Level 3)" --out data/staging/b1_from_xlsx.tsv
	@python3 tools/ingest/map_xlsx_tsv.py --in data/staging/b1_from_xlsx.tsv --out data/staging/b1.tsv --level 3
	@node tools/ingest/tsv_to_json.js --band B --level 3 --in data/staging/b1.tsv --out data/seed/band-B/level3.json

.PHONY: xlsx-b2
xlsx-b2:
	@python3 tools/ingest/xlsx_to_tsv.py --in "TOCFL PDFs/華語八千詞表20240923.xlsx" --sheet "高階級(Level 4)" --out data/staging/b2_from_xlsx.tsv
	@python3 tools/ingest/map_xlsx_tsv.py --in data/staging/b2_from_xlsx.tsv --out data/staging/b2.tsv --level 4
	@node tools/ingest/tsv_to_json.js --band B --level 4 --in data/staging/b2.tsv --out data/seed/band-B/level4.json

.PHONY: xlsx-c1
xlsx-c1:
	@python3 tools/ingest/xlsx_to_tsv.py --in "TOCFL PDFs/華語八千詞表20240923.xlsx" --sheet "流利級(Level 5)" --out data/staging/c1_from_xlsx.tsv
	@python3 tools/ingest/map_xlsx_tsv.py --in data/staging/c1_from_xlsx.tsv --out data/staging/c1.tsv --level 5
	@node tools/ingest/tsv_to_json.js --band C --level 5 --in data/staging/c1.tsv --out data/seed/band-C/level5.json

.PHONY: xlsx-all
xlsx-all: xlsx-a1 xlsx-a2 xlsx-b1 xlsx-b2 xlsx-c1

.PHONY: split-a1-topics
split-a1-topics:
	@node tools/ingest/split_by_topic.js --in data/seed/band-A/level1.json --outdir data/seed/band-A/level1_topics

.PHONY: split-a2-topics
split-a2-topics:
	@node tools/ingest/split_by_topic.js --in data/seed/band-A/level2.json --outdir data/seed/band-A/level2_topics

# Novice (pre-A1) extraction from XLSX
.PHONY: xlsx-novice1
xlsx-novice1:
	@python3 tools/ingest/xlsx_to_tsv.py --in "TOCFL PDFs/華語八千詞表20240923.xlsx" --sheet "準備級一級(Novice 1)" --out data/staging/nov1_from_xlsx.tsv
	@python3 tools/ingest/map_xlsx_tsv.py --in data/staging/nov1_from_xlsx.tsv --out data/staging/nov1.tsv --level 0
	@node tools/ingest/tsv_to_json.js --band A --level 0 --in data/staging/nov1.tsv --out data/seed/band-A/novice1.json

.PHONY: xlsx-novice2
xlsx-novice2:
	@python3 tools/ingest/xlsx_to_tsv.py --in "TOCFL PDFs/華語八千詞表20240923.xlsx" --sheet "準備級二級(Novice 2)" --out data/staging/nov2_from_xlsx.tsv
	@python3 tools/ingest/map_xlsx_tsv.py --in data/staging/nov2_from_xlsx.tsv --out data/staging/nov2.tsv --level 0
	@node tools/ingest/tsv_to_json.js --band A --level 0 --in data/staging/nov2.tsv --out data/seed/band-A/novice2.json

.PHONY: pack-a1
pack-a1:
	@node tools/ingest/pack_deck.js --in data/seed/band-A/level1.json --outdir data/seed/band-A/level1_packs --size 50

.PHONY: pack-a2
pack-a2:
	@node tools/ingest/pack_deck.js --in data/seed/band-A/level2.json --outdir data/seed/band-A/level2_packs --size 50

.PHONY: pack-b1
pack-b1:
	@node tools/ingest/pack_deck.js --in data/seed/band-B/level3.json --outdir data/seed/band-B/level3_packs --size 50

.PHONY: pack-b2
pack-b2:
	@node tools/ingest/pack_deck.js --in data/seed/band-B/level4.json --outdir data/seed/band-B/level4_packs --size 50

.PHONY: pack-c1
pack-c1:
	@node tools/ingest/pack_deck.js --in data/seed/band-C/level5.json --outdir data/seed/band-C/level5_packs --size 50

.PHONY: a1-program
a1-program:
	@node tools/ingest/group_topics.js --in data/seed/band-A/level1.json --config data/programs/a1_topics_program.json --outdir data/seed/band-A/a1_program

.PHONY: a2-program
a2-program:
	@node tools/ingest/group_topics.js --in data/seed/band-A/level2.json --config data/programs/a2_topics_program.json --outdir data/seed/band-A/a2_program

.PHONY: b1-program
b1-program:
	@node tools/ingest/group_topics.js --in data/seed/band-B/level3.json --config data/programs/b1_topics_program.json --outdir data/seed/band-B/b1_program

.PHONY: b2-program
b2-program:
	@node tools/ingest/group_topics.js --in data/seed/band-B/level4.json --config data/programs/b2_topics_program.json --outdir data/seed/band-B/b2_program

.PHONY: merge-a1-cedict
merge-a1-cedict:
	@node tools/ingest/merge_dicts.js --in data/seed/band-A/level1.json --cedict data/dicts/cedict_ts.u8 --out data/seed/band-A/level1_enriched.json

.PHONY: merge-a1-cedict-moe
merge-a1-cedict-moe:
	@node tools/ingest/merge_dicts.js --in data/seed/band-A/level1.json --cedict data/dicts/cedict_ts.u8 --moe-tsv data/dicts/moe.tsv --moe-word word --moe-zhuyin zhuyin --moe-def def --out data/seed/band-A/level1_enriched.json

.PHONY: merge-dicts-ts
merge-dicts-ts:
	@echo "Merging with TypeScript tool..."
	@node -e "try{require('tsx')}catch(e){console.error('Please install tsx in apps/web to use this target: npm --prefix apps/web i -D tsx'); process.exit(1)}"
	@npm --prefix apps/web exec -- tsx ../../scripts/fetch-dicts.ts --in data/seed/band-A/level1.json --out data/seed/band-A/level1_enriched.json --cedict data/dicts/cedict_ts.u8 --moe-tsv data/dicts/moe.tsv --moe-word word --moe-zhuyin zhuyin --moe-def def

# Minimal validation for decks (schema-lite)
.PHONY: validate-seed
validate-seed:
	@node tools/ingest/validate_deck.js --in data/seed/band-A/level1.json

# Copy decks to web app public dir
.PHONY: web-copy-a1
web-copy-a1:
	@mkdir -p apps/web/public/data/band-A
	@cp -f data/seed/band-A/level1.json apps/web/public/data/band-A/level1.json

.PHONY: web-copy-a2
web-copy-a2:
	@mkdir -p apps/web/public/data/band-A
	@cp -f data/seed/band-A/level2.json apps/web/public/data/band-A/level2.json

.PHONY: web-copy-a1-topics
web-copy-a1-topics:
	@mkdir -p apps/web/public/data/band-A/level1_topics
	@cp -f data/seed/band-A/level1_topics/*.json apps/web/public/data/band-A/level1_topics/

.PHONY: web-copy-a1-program
web-copy-a1-program:
	@mkdir -p apps/web/public/data/band-A/a1_program
	@cp -f data/seed/band-A/a1_program/*.json apps/web/public/data/band-A/a1_program/

.PHONY: story-precompute-sample
story-precompute-sample:
	@node tools/stories/build_story.js --in data/stories/story-a2-transport-001.json --out apps/web/public/stories/story-a2-transport-001.json || echo 'opencc-js not installed; wrote raw copy'
	@mkdir -p apps/web/public/stories && cp -f data/stories/manifest.json apps/web/public/stories/manifest.json

.PHONY: web-copy-stories
web-copy-stories:
	@node tools/stories/build_story.js --manifest data/stories/manifest.json --indir data/stories --outdir apps/web/public/stories || (echo 'opencc-js not installed; copying as-is'; mkdir -p apps/web/public/stories; cp -f data/stories/*.json apps/web/public/stories/; cp -f data/stories/manifest.json apps/web/public/stories/manifest.json)

.PHONY: web-copy-decks
web-copy-decks:
	@mkdir -p apps/web/public/data/decks
	@cp -f data/decks/manifest.json apps/web/public/data/decks/manifest.json
	@mkdir -p apps/web/public/data/band-A
	@cp -f data/seed/band-A/level1.json apps/web/public/data/band-A/level1.json || true
	@cp -f data/seed/band-A/level2.json apps/web/public/data/band-A/level2.json || true
	@mkdir -p apps/web/public/data/band-A/level1_topics
	@cp -f data/seed/band-A/level1_topics/*.json apps/web/public/data/band-A/level1_topics/ 2>/dev/null || true
	@mkdir -p apps/web/public/data/band-A/a1_program
	@cp -f data/seed/band-A/a1_program/*.json apps/web/public/data/band-A/a1_program/ 2>/dev/null || true
	@mkdir -p apps/web/public/data/band-A/a2_program
	@cp -f data/seed/band-A/a2_program/*.json apps/web/public/data/band-A/a2_program/ 2>/dev/null || true
	@mkdir -p apps/web/public/data/band-B/b1_program
	@cp -f data/seed/band-B/b1_program/*.json apps/web/public/data/band-B/b1_program/ 2>/dev/null || true
	@mkdir -p apps/web/public/data/band-B/b2_program
	@cp -f data/seed/band-B/b2_program/*.json apps/web/public/data/band-B/b2_program/ 2>/dev/null || true
