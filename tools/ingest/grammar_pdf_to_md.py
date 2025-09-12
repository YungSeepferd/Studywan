#!/usr/bin/env python3
"""
Grammar extractor (placeholder): converts a PDF-derived text file to Markdown sections.
This script uses simple heading detection; adjust patterns for your grammar PDFs.

Usage:
  python3 tools/ingest/grammar_pdf_to_md.py \
    --in data/raw/grammar_a_band.txt \
    --out content/grammar/band-A/grammar.md
"""
import argparse
import io
import os
import re

H1 = re.compile(r"^(?:Lesson|Unit|章|課)\s*([0-9一二三四五六七八九十]+).*", re.IGNORECASE)
H2 = re.compile(r"^(?:Grammar|文法|語法|Pattern|句型)[:：]?\s*(.*)")

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--in', dest='inp', required=True)
    ap.add_argument('--out', dest='out', required=True)
    args = ap.parse_args()

    with io.open(args.inp, 'r', encoding='utf-8', errors='ignore') as f:
        lines = [ln.rstrip() for ln in f]

    out_lines = ["# Grammar Notes (Band A)", ""]
    for ln in lines:
        if not ln.strip():
            continue
        if H1.match(ln):
            out_lines.append(f"\n## {ln.strip()}\n")
        elif H2.match(ln):
            m = H2.match(ln)
            title = m.group(1).strip() or ln.strip()
            out_lines.append(f"\n### {title}\n")
        else:
            out_lines.append(ln)

    os.makedirs(os.path.dirname(args.out), exist_ok=True)
    with io.open(args.out, 'w', encoding='utf-8') as w:
        w.write("\n".join(out_lines) + "\n")
    print(f"Wrote {args.out}")

if __name__ == '__main__':
    main()

