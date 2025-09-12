# Stories, Culture, and Character Enhancements

This document describes micro-stories, cultural notes, and character panels that complement the TOCFL‑aligned drills.

## Data Types (additive)
- Card (extensions): `components[]`, `variants[]`, `culturalNote{title,note,sourceUrls[]}`, `etymology`, `storyIds[]`
- Story: see `data/schema/story.schema.json`

## Content Types
- Micro‑stories (50–150 chars) bound to vocab items; Taiwan contexts (MRT, night markets, admin errands, LINE, receipts, food ordering)
- Cultural notes: TW vs CN usage, signage, festival customs, idiom backstories (成語典), character trivia
- Etymology snippets: Unihan fields + Make Me a Hanzi decomposition
- Reader packs per band: A: signs/ads; B: notices/announcements (w/ once‑through audio)

## Editorial Guidelines
- Register: everyday Taiwan usage; A band avoids complex idioms
- Length: A1 ≤60 chars; A2 ≤120; B1 ≤250; B2 ≤400
- Vocab density: ≥80% target band + recycled earlier bands
- Audio: once‑through playback
- Notes tone: concise; link out to MOE/成語典/MOC

## Pipeline
1) Draft story in Traditional; link `vocabRefs` (card ids)
2) Precompute `bodySimp` (OpenCC) via `tools/stories/build_story.js`
3) Optionally enrich cards with MOE/CC‑CEDICT (see `DICT_MERGE.md`)
4) Validate against `data/schema/story.schema.json`
5) Copy story JSON + manifest to `apps/web/public/stories/`

## App Integration
- StudyCard → “Read a micro‑story” (if linked): loads story, honors Trad/Simp + once‑through audio
- Character pane: Hanzi Writer strokes; components/variants/etymology from Make Me a Hanzi + Unihan (future)

## Files
- Schema: `data/schema/story.schema.json`
- Example story: `data/stories/story-a2-transport-001.json`
- Manifest: `data/stories/manifest.json`
- Precompute script: `tools/stories/build_story.js`

