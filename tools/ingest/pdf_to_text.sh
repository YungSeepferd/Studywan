#!/usr/bin/env bash
set -euo pipefail

# Convert a PDF to plain text with layout preserved if possible.
# Usage: tools/ingest/pdf_to_text.sh "TOCFL PDFs/TOCFL level 1-2 vocabulary.pdf" data/raw/a_band.txt

if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <input.pdf> <output.txt>" >&2
  exit 1
fi

IN="$1"
OUT="$2"
mkdir -p "$(dirname "$OUT")"

if command -v pdftotext >/dev/null 2>&1; then
  pdftotext -layout "$IN" "$OUT"
  echo "Wrote $OUT via pdftotext"
  exit 0
fi

# Fallback: try python pdfminer.six if available
if command -v python3 >/dev/null 2>&1; then
  python3 - <<'PY' "$IN" "$OUT"
import sys
try:
    from pdfminer.high_level import extract_text
except Exception as e:
    print('pdfminer.six not installed; please run: pip install pdfminer.six', file=sys.stderr)
    sys.exit(2)

inp, out = sys.argv[1], sys.argv[2]
txt = extract_text(inp)
open(out, 'w', encoding='utf-8').write(txt)
print(f'Wrote {out} via pdfminer.six')
PY
  rc=$?
  if [[ $rc -eq 0 ]]; then exit 0; fi
fi

echo "No PDF extractor found. Install poppler (pdftotext) or pdfminer.six." >&2
exit 3

