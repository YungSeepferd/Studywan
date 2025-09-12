#!/usr/bin/env python3
"""
Heuristic parser: textual lines -> TSV (trad, simp, pinyin, gloss_en, level, topic)

Input: a text file produced from PDF (layout-preserving preferred)
Output: TSV to stdout or file (use > redirect)

Usage:
  python3 tools/ingest/text_to_tsv.py \
    --in data/raw/a_band.txt \
    --out data/staging/a1.tsv \
    --level 1 \
    --topic general

Notes:
- This script includes simple heuristics and may need tweaks per source.
- It attempts to detect columns separated by multiple spaces or tabs.
"""
import argparse
import io
import os
import re
import sys

RE_HAN = re.compile(r"[\u4E00-\u9FFF]+")
RE_PINYIN_MARKS = re.compile(r"[a-zA-Zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]+(\s+[a-zA-Zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]+)*")

def split_columns(line: str):
    # Prefer tab split; else split by 2+ spaces
    if "\t" in line:
        parts = [p.strip() for p in line.split("\t") if p.strip()]
    else:
        parts = [p.strip() for p in re.split(r"\s{2,}", line) if p.strip()]
    return parts

def guess_row(parts):
    # Try to map [trad, simp?, pinyin, gloss]
    trad = None
    simp = None
    pinyin = None
    gloss = None

    # Heuristic: first hanzi chunk -> trad
    for i, p in enumerate(parts):
        if RE_HAN.search(p):
            trad = p
            idx_trad = i
            break
    else:
        return None

    # Remaining: try to find pinyin-like segment
    rem = parts[:idx_trad] + parts[idx_trad+1:]
    for i, p in enumerate(rem):
        if RE_PINYIN_MARKS.fullmatch(p.replace('·',' ').replace("'"," ")):
            pinyin = p
            rem.pop(i)
            break

    # Simplified: if another hanzi chunk remains, assume simp
    for i, p in enumerate(rem):
        if RE_HAN.search(p):
            simp = p
            rem.pop(i)
            break

    # Gloss: join the rest
    if rem:
        gloss = " ".join(rem)

    return trad, simp, pinyin, gloss

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--in', dest='inp', required=True)
    ap.add_argument('--out', dest='out', required=True)
    ap.add_argument('--level', type=int, required=True)
    ap.add_argument('--topic', default='general')
    args = ap.parse_args()

    with io.open(args.inp, 'r', encoding='utf-8', errors='ignore') as f:
        lines = [ln.strip() for ln in f if ln.strip()]

    rows = []
    for ln in lines:
        parts = split_columns(ln)
        if not parts or len(parts) < 2:
            continue
        guess = guess_row(parts)
        if not guess:
            continue
        trad, simp, pinyin, gloss = guess
        if not trad or not gloss:
            continue
        rows.append((trad, simp or '', pinyin or '', gloss))

    os.makedirs(os.path.dirname(args.out), exist_ok=True)
    with io.open(args.out, 'w', encoding='utf-8') as w:
        w.write('trad\tsimp\tpinyin\tgloss_en\tlevel\ttopic\n')
        for trad, simp, pinyin, gloss in rows:
            w.write(f"{trad}\t{simp}\t{pinyin}\t{gloss}\t{args.level}\t{args.topic}\n")

    print(f"Wrote {args.out} ({len(rows)} rows)")

if __name__ == '__main__':
    main()

