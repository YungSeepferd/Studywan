#!/usr/bin/env python3
"""
Map raw XLSX-extracted TSV (from xlsx_to_tsv.py) to canonical TSV for JSON ingestion.

Assumes Level sheets with columns:
  A: 任務領域 / Context (topic)
  B: 詞彙 / Vocabulary (Traditional)
  C: 漢語拼音 / Pinyin
  D: 詞類 / Parts of Speech

Drops the first two header rows (Chinese, English labels) and writes TSV with headers:
  trad	simp	pinyin	gloss_en	pos	level	topic

Usage:
  python3 tools/ingest/map_xlsx_tsv.py \
    --in data/staging/a1_from_xlsx.tsv \
    --out data/staging/a1_canon.tsv \
    --level 1
"""
import argparse
import io
import os

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--in', dest='inp', required=True)
    ap.add_argument('--out', dest='out', required=True)
    ap.add_argument('--level', type=int, required=True)
    args = ap.parse_args()

    with io.open(args.inp, 'r', encoding='utf-8') as f:
        lines = [ln.rstrip('\n') for ln in f]

    # Drop first two header rows if they contain header hints
    data_lines = lines
    if data_lines and ('詞彙' in data_lines[0] or '任務' in data_lines[0] or 'Context' in data_lines[0]):
        data_lines = data_lines[1:]
    if data_lines and ('Vocabulary' in data_lines[0] or 'Pinyin' in data_lines[0] or 'Parts of Speech' in data_lines[0]):
        data_lines = data_lines[1:]

    out_rows = []
    for ln in data_lines:
        if not ln.strip():
            continue
        parts = ln.split('\t')
        # Ensure at least 4 columns
        while len(parts) < 4:
            parts.append('')
        topic, trad, pinyin, pos = parts[0:4]
        out_rows.append((trad, '', pinyin, '', pos, str(args.level), topic))

    os.makedirs(os.path.dirname(args.out), exist_ok=True)
    with io.open(args.out, 'w', encoding='utf-8') as w:
        w.write('trad\tsimp\tpinyin\tgloss_en\tpos\tlevel\ttopic\n')
        for r in out_rows:
            w.write('\t'.join(r) + '\n')

    print(f"Wrote {args.out} ({len(out_rows)} rows)")

if __name__ == '__main__':
    main()

