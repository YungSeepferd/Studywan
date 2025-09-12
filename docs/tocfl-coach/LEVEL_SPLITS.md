# Level Splits (Recommended)

This project uses the official SC-TOP “華語八千詞表” workbook to partition content. We expose both full level decks and topic-based splits for easier pacing.

## Bands and Levels
- Pre-A1: 準備級一級 (Novice 1), 準備級二級 (Novice 2)
- Band A: 入門級 (Level 1), 基礎級 (Level 2)
- Band B: 進階級 (Level 3), 高階級 (Level 4)
- Band C: 流利級 (Level 5)

Note: The current workbook includes up to Level 5.

## Files
- Full decks
  - `data/seed/band-A/level1.json`
  - `data/seed/band-A/level2.json`
  - `data/seed/band-B/level3.json`
  - `data/seed/band-B/level4.json`
  - `data/seed/band-C/level5.json`
- Novice/pre-A1
  - `data/seed/band-A/novice1.json`
  - `data/seed/band-A/novice2.json`
- Topic splits (A1/A2)
  - `data/seed/band-A/level1_topics/*.json`
  - `data/seed/band-A/level2_topics/*.json`

## A1 Splitting Guidance
For learners who want smaller chunks under A1:
- Start with Novice 1 → Novice 2
- Then work through A1 topics in this order:
  1) 個人資料 (personal info)
  2) 房屋與家庭、環境 (home/family/environment)
  3) 教育 (school)
  4) 飲食 / 購物 (food/shopping)
  5) 旅行 (travel)
  6) 與他人的關係 / 閒暇時間、娛樂 (relationships/leisure)
  7) 其他, 日常生活, 健康及身體照護 (as needed)

These topic names and partitions come from the `任務領域` (Context) column in the official workbook.

## How We Generated These
- XLSX → TSV: `tools/ingest/xlsx_to_tsv.py`
- Normalize TSV: `tools/ingest/map_xlsx_tsv.py`
- TSV → JSON: `tools/ingest/tsv_to_json.js`
- Split by topic: `tools/ingest/split_by_topic.js`

Make targets:
- `make xlsx-all` (all levels)
- `make split-a1-topics` and `make split-a2-topics`
 - `make a1-program` (A1a/A1b/A1c grouped decks)
 - `make pack-a1` / `make pack-a2` (fixed-size packs)
