# Card JSON Schema (for TOCFL decks)

This document defines the JSON structure for vocabulary cards used by the app and seed bundles. It aligns with `docs/tocfl-coach/DATA_MODEL.md` and adds a few optional fields for StudyWan specifics (e.g., German gloss).

## File location
- Schema: `data/schema/cards.schema.json`
- Seeds: `data/seed/band-A/level1.json` (example)

## Fields
- `id` (string): Stable identifier (UUID or slug). Example: `"A1-0001"`.
- `trad` (string, required): Traditional form. Example: `"你好"`.
- `simp` (string, optional): Simplified form. Example: `"你好"`.
- `pinyin` (string, required): Hanyu Pinyin with tone marks or numbers. Example: `"nǐ hǎo"`.
- `zhuyin` (string, optional): Zhuyin/Bopomofo. Example: `"ㄋ一ˇ ㄏㄠˇ"`.
- `pos` (string, optional): Part of speech tag. Example: `"interj"`.
- `hint` (string, optional): Mnemonic/association for recall.
- `gloss_en` (string, required): English gloss. Example: `"hello"`.
- `gloss_de` (string, optional): German gloss. Example: `"hallo"`.
- `variant_tw` (string, optional): Taiwan-preferred form when different.
- `variant_cn` (string, optional): Mainland-preferred form when different.
- `examples` (array<object>, optional): Example sentences to reinforce usage. Each item: `{ zh, en?, zhuyin?, pinyin?, audio? }`.

## Conventions for hints and etymology
Use `hint` for learner‑friendly mnemonics or usage cues; keep ≤140 chars. Use `etymology` for short origin notes. Prefer Taiwan usage in examples.

Examples
- 我 (wǒ):
  - etymology: “我 originally depicted a weapon (a halberd) carried by oneself. Imagine ‘I carry my spear’—the weapon becomes a symbol for self.”
- 請勿飲食 (qǐng wù yǐnshí):
  - hint: “請(please) + 勿(do not) + 飲食(eat/drink): polite prohibition used on MRT, buses, museums.”
- 禁止吸煙 (jìnzhǐ xīyān):
  - hint: “禁止(forbid) + 吸煙(smoking). Ubiquitous in indoor spaces and public transport.”

Style
- Traditional‑first; add Mainland variants via `variant_cn` and explain in hint when relevant.
- Avoid long academic etymologies; link detailed sources in `culturalNote.sourceUrls` if needed.
- `band` (string, required): `"A"|"B"|"C"`.
- `level` (integer, required): 1–6 (TOCFL levels).
- `topic` (string, optional): Semantic category/topic when available.
- `tags` (array<string>, optional): Free-form tags. Examples: `"tw-usage:計程車"`, `"variant:出租車"`.
- `source` (object, optional): Provenance metadata: `{ name, url }`.
- `audio` (object, optional): `{ url, voice, license }` when bundled.

Notes:
- The backend model can map `band` to an integer if desired; keep the JSON as human-friendly `"A"|"B"|"C"`.
- Keep `pinyin` normalized (tone marks preferred). Use numbers only if needed for tooling.
- Use `tags` to record Taiwan/Mainland variants, e.g., `tw-usage:計程車`, `cn-usage:出租車`.

## Example
See `data/seed/band-A/level1.json` for a small A1 sample.
