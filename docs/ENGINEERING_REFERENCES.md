# Engineering References

Curated links to official documentation for the tools and standards used in this project. Use these for best practices and implementation details.

## Core Frontend
- React: https://react.dev
- Vite: https://vitejs.dev
- Vite + GitHub Pages (deploy): https://vitejs.dev/guide/static-deploy.html#github-pages

## Web Platform APIs
- Web Storage API (localStorage): https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API
- HTMLAudioElement (audio playback): https://developer.mozilla.org/en-US/docs/Web/API/HTMLAudioElement

## Build, Deploy, CI
- GitHub Pages: https://docs.github.com/en/pages
- GitHub Actions → Deploy to Pages: https://docs.github.com/en/actions/deployment/deploying-to-github-pages

## Backend/Cloud (Optional)
- Supabase (Docs): https://supabase.com/docs
- Supabase Row Level Security (RLS): https://supabase.com/docs/guides/auth/row-level-security
- PostgreSQL RLS (CREATE POLICY): https://www.postgresql.org/docs/current/ddl-rowsecurity.html
- PostgREST (Auto REST over Postgres): https://postgrest.org/en/stable/

## Data & Validation
- JSON Schema (Draft-07): https://json-schema.org/specification-links.html#draft-7

## Ingestion Utilities
- Poppler pdftotext: https://www.freedesktop.org/wiki/Software/poppler/
- pdftotext manual: https://www.manpagez.com/man/1/pdftotext/
- pdfminer.six (Python): https://pdfminersix.readthedocs.io/
- Node.js `fs` API: https://nodejs.org/api/fs.html
- Node.js `path` API: https://nodejs.org/api/path.html
- Python `argparse`: https://docs.python.org/3/library/argparse.html
- Python `re` (regex): https://docs.python.org/3/library/re.html

## SRS Algorithms (Reference)
- SM-2 (SuperMemo): https://www.supermemo.com/en/archives1990-2015/english/ol/sm2
- FSRS (Open Spaced Repetition): https://github.com/open-spaced-repetition/fsrs4anki

## Accessibility & i18n (Helpful)
- WAI-ARIA Authoring Practices: https://www.w3.org/TR/wai-aria-practices/
- Intl (ECMAScript Internationalization API): https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl

## Fonts & CJK Rendering (Helpful)
- Noto Sans CJK / Noto Sans TC: https://fonts.google.com/noto/specimen/Noto+Sans+TC

## Agentic Coding
- Codex CLI (open-source agent interface): https://github.com/openai/codex

## UI Libraries & Interactions
- Radix UI Primitives: https://www.radix-ui.com/primitives/docs/overview/getting-started
- Floating UI (React): https://floating-ui.com/docs/react
- Motion (Framer Motion successor): https://motion.dev/
- @use-gesture/react: https://use-gesture.netlify.app/
- cmdk (Command palette): https://github.com/pacocoursey/cmdk

## Adoption Plan & Next Steps (Project‑specific)

Status (what’s in use now)
- Radix + Floating UI power popovers/tooltips in Reader/Story; cmdk for the command palette.
- Motion + @use-gesture handle swipe‑to‑grade and animations.
- Zod validates card/story data; validators wired via scripts/validate-data.ts.
- vite-plugin-pwa configured; runtime caching for audio/images.
- Minimal i18n loader with public locale JSON (en, de, zh‑TW).
- Hanzi Writer used via a lightweight wrapper (HanziStroke); MultiCharStrokes renders multi‑character terms.

Adopt/refine next
- Segmentation (nodejieba):
  - Install and integrate in tools/ingest/segment_stories.ts.
  - Switch Reader/Story highlighter to segmented tokens; add unit tests to ensure longest‑match highlighting.
- i18n (i18next/react‑i18next):
  - Replace minimal loader; move top‑level strings (Settings, DeckPicker, CommandPalette) first.
  - Add a locale key parity check to CI (scripts/validate-locales.ts exists).
- Charts (Recharts):
  - Add time‑series (reviews/day, accuracy trend) and unit completion charts to Dashboard.
- E2E tests (Playwright):
  - Cover study → grade, Reader popovers + quiz, Listening once‑through, Exam 35/50 skeleton, and new Curriculum Path runner.
- Optional sync (Supabase):
  - Keep offline‑first; add opt‑in sync for path progress, SRS state, error bank.
- PWA polish:
  - Verify offline reading/listening end‑to‑end; add an “Offline ready” badge (component exists); ensure manifest icons.
- Accessibility:
  - Ensure focus order and ARIA labels on interactive components; respect prefers‑reduced‑motion; verify high‑contrast in popovers/modals.

Notes on recent refinements
- Strokes: MultiCharStrokes now renders multiple characters (e.g., signage like 請勿飲食); consider adding per‑character zoom and handwriting quizzes later.
- Signs path: Signs deck and sign‑aligned micro‑stories are seeded; integrate into a single Curriculum Path for a guided experience.

## External Datasets & Tools

| Resource | Why it matters | Links |
|---|---|---|
| SC‑TOP official vocab lists (8,000 words) | Canonical band/level‑tagged Traditional lists from the test creators; ensure alignment with Bands A–C | Downloads: https://tocfl.edu.tw/tocfl/index.php/exam/download |
| TOCFL 14,425 vocab list (community) | Extended list merging SC‑TOP and NAER; useful for coverage checks beyond 8K | Repo: https://github.com/nutchanonj/TOCFL_14425_vocab_list |
| CC‑CEDICT (MDBG) | Open Chinese‑English dictionary (Traditional/Simplified + Pinyin); fallback for glosses/definitions | Info/Downloads: https://www.mdbg.net/chinese/dictionary?page=cc-cedict |
| MOE (Taiwan) dictionaries | Authoritative Traditional definitions and Zhuyin for Taiwan users; check licensing before bundling | Portal: https://dict.revised.moe.edu.tw/ |
| Make Me a Hanzi | Character data: strokes (SVG), decomposition, radicals; great for component view and handwriting practice | Repo: https://github.com/skishore/makemeahanzi |
| Hanzi Writer (JS) | Stroke order animations + quizzes leveraging Make Me a Hanzi data | Site: https://hanziwriter.org • Repo: https://github.com/chanind/hanzi-writer |
| pinyin‑zhuyin (npm) | Convert Pinyin with tone marks ↔ Zhuyin for the pronunciation toggle | npm: https://www.npmjs.com/package/pinyin-zhuyin |
| OpenCC | High‑quality Traditional/Simplified conversion (incl. HK/TW variants); JS/WebAssembly and native bindings | Project: https://github.com/BYVoid/OpenCC • JS: https://github.com/nk2028/opencc-js |

### How to use them
- Data ingestion: import SC‑TOP 8K lists first for A–C; optionally merge 14,425 list for advanced content.
- Dictionary/definitions: prefer MOE for TW definitions/Zhuyin; fall back to CC‑CEDICT for EN glosses.
- Script conversion: use OpenCC for Trad↔Simp; use pinyin‑zhuyin for Pinyin↔Zhuyin.
- Character features: use Make Me a Hanzi data + Hanzi Writer to show strokes and run writing quizzes.

### Licensing notes
- CC‑CEDICT: CC‑BY‑SA — attribute appropriately if redistributed.
- Make Me a Hanzi: mixed licences per file — check COPYING in the repo.
- OpenCC: Apache‑2.0.
- MOE dictionaries: verify current terms before bundling content; prefer on‑device fetching or metadata where uncertain.
