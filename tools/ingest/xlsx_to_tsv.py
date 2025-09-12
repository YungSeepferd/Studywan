#!/usr/bin/env python3
"""
XLSX → TSV converter (no external deps).

Reads an .xlsx (OpenXML) file, loads shared strings, and converts
the specified sheet to TSV using the first row as headers.

Usage:
  python3 tools/ingest/xlsx_to_tsv.py \
    --in "TOCFL PDFs/華語八千詞表20240923.xlsx" \
    --sheet "入門級(Level 1)" \
    --out data/staging/a1_from_xlsx.tsv

Notes:
- This is a generic reader. Column names are taken directly from the sheet.
- Subsequent mapping to our canonical headers happens in later steps.
"""
import argparse
import io
import re
import xml.etree.ElementTree as ET
from zipfile import ZipFile

NS_SS = {'ss': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}


def load_shared_strings(z: ZipFile):
    try:
        data = z.read('xl/sharedStrings.xml')
    except KeyError:
        return []
    root = ET.fromstring(data)
    strings = []
    for si in root.findall('ss:si', NS_SS):
        # Handle rich text runs <r><t>...</t></r> or simple <t>
        text_parts = []
        for t in si.findall('.//ss:t', NS_SS):
            text_parts.append(t.text or '')
        strings.append(''.join(text_parts))
    return strings


def load_sheet_map(z: ZipFile):
    # Map r:id -> worksheets/sheetX.xml
    rels = ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))
    rid_to_target = {}
    for rel in rels.findall('{http://schemas.openxmlformats.org/package/2006/relationships}Relationship'):
        rid_to_target[rel.get('Id')] = rel.get('Target')

    wb = ET.fromstring(z.read('xl/workbook.xml'))
    name_to_sheetpath = {}
    for sheet in wb.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}sheets/{http://schemas.openxmlformats.org/spreadsheetml/2006/main}sheet'):
        name = sheet.get('name')
        rid = sheet.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id')
        target = rid_to_target.get(rid)
        if target and target.startswith('worksheets/'):
            name_to_sheetpath[name] = 'xl/' + target
    return name_to_sheetpath


def col_to_index(a1_ref: str) -> int:
    # Convert A1 cell ref to 0-based column index
    m = re.match(r'([A-Z]+)([0-9]+)', a1_ref)
    if not m:
        return 0
    col = m.group(1)
    idx = 0
    for ch in col:
        idx = idx * 26 + (ord(ch) - ord('A') + 1)
    return idx - 1


def sheet_to_rows(z: ZipFile, sheet_path: str, shared):
    root = ET.fromstring(z.read(sheet_path))
    rows = []
    for row in root.findall('ss:sheetData/ss:row', NS_SS):
        # Determine the maximum column index in this row
        cells = row.findall('ss:c', NS_SS)
        if not cells:
            rows.append([])
            continue
        max_col = max(col_to_index(c.get('r')) for c in cells)
        out = [''] * (max_col + 1)
        for c in cells:
            ref = c.get('r')
            t = c.get('t')
            v = c.find('ss:v', NS_SS)
            idx = col_to_index(ref)
            if v is None:
                s = ''
            else:
                val = v.text or ''
                if t == 's':
                    # shared string index
                    try:
                        s = shared[int(val)]
                    except Exception:
                        s = ''
                else:
                    s = val
            out[idx] = s.strip()
        rows.append(out)
    return rows


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--in', dest='inp', required=True)
    ap.add_argument('--sheet', required=True)
    ap.add_argument('--out', required=True)
    args = ap.parse_args()

    with ZipFile(args.inp) as z:
        shared = load_shared_strings(z)
        sheet_map = load_sheet_map(z)
        sheet_path = sheet_map.get(args.sheet)
        if not sheet_path:
            raise SystemExit(f"Sheet not found: {args.sheet}; available: {', '.join(sheet_map)}")
        rows = sheet_to_rows(z, sheet_path, shared)

    # Trim trailing empties and skip blank rows
    trimmed = []
    for r in rows:
        while r and r[-1] == '':
            r.pop()
        if any(cell for cell in r):
            trimmed.append(r)

    # Write TSV
    import os
    os.makedirs(os.path.dirname(args.out), exist_ok=True)
    with io.open(args.out, 'w', encoding='utf-8') as w:
        for r in trimmed:
            w.write('\t'.join(r))
            w.write('\n')
    print(f"Wrote {args.out} ({len(trimmed)} rows)")

if __name__ == '__main__':
    main()

