# Codex CLI Setup and Best Practices

This repo is optimized for working with Codex CLI (open-source agentic coding interface). Follow these guidelines to get the best results when using the VS Code extension or CLI.

## References
- Codex CLI: https://github.com/openai/codex
- Engineering references: `docs/ENGINEERING_REFERENCES.md`

## Recommended Config (sample)
Create a local config (do not commit) at `~/.codex/config.toml`:

```
[ui]
confirm_escalations = true       # approve network / writes as needed
show_plans = true                # render plan updates

[sandbox]
filesystem = "workspace-write"   # allow writing within workspace
network = "restricted"           # explicit approval for network

[agent]
preamble_style = "concise"       # short, grouped preambles
max_read_lines = 200             # avoid reading >250 lines at once
prefer_search = "rg"             # use ripgrep for code search
```

## Workflow Tips
- Always check `README.md` → Documentation Index first.
- Use ripgrep for search (fast): `rg -n "term" -S`.
- Read files in <= 200 line chunks to avoid truncation.
- Use `update_plan` to show intent on multi-step tasks; keep 1 item in-progress.
- Group related shell actions under one preamble.
- Use `apply_patch` for all file edits; avoid ad-hoc editors.
- Escalate network calls (e.g., `curl`) with a clear 1-line justification.
- Don’t over-edit: keep changes minimal and focused; update docs when structure changes.

## Repo Conventions That Help Codex
- Clear docs under `docs/tocfl-coach/` and `docs/ENGINEERING_REFERENCES.md`.
- Make targets for common flows (ingestion, splits, packs, copy-to-web).
- Web app fetch uses Vite’s `import.meta.env.BASE_URL` for Pages compatibility.
- Seed data and schema are under `data/` with simple, documented fields.

## Common Tasks
- Ingest A1/A2 from XLSX:
  - `make xlsx-a1 xlsx-a2`
- Create topic splits and A1 program decks:
  - `make split-a1-topics a1-program`
- Validate and copy to web app:
  - `make validate-seed web-copy-a1 web-copy-a1-topics`

## Agent Quick Reference (Crib Sheet)

This section lists the most common Codex moves you’ll use in this repo, with copy‑pasteable snippets.

Search repo (fast)
- Find a function/type usage: `rg -n "getPronunciation|CardSchema" -S`
- Locate deck/story manifests: `rg -n "manifest\.json|stories/manifest" -S`
- Grep for a card id: `rg -n "\"A1-0001\"" apps/web/public/data -S`

Read files in chunks (≤250 lines)
- `sed -n '1,200p' apps/web/src/lib/romanization.ts`
- `sed -n '1,200p' apps/web/src/components/StoryViewer.tsx`

Make surgical edits (apply_patch)

Add or update files using the patch envelope:
```
*** Begin Patch
*** Update File: apps/web/src/lib/types.ts
@@
 export type Prefs = {
   scriptMode: 'trad' | 'simp'
   romanization: 'zhuyin' | 'pinyin'
   toneColors?: boolean
   highContrast?: boolean
+  language?: 'en' | 'de' | 'zh-TW'
 }
*** End Patch
```

Create a new file:
```
*** Begin Patch
*** Add File: apps/web/src/lib/__tests__/deckLoader.test.ts
+import { describe, it, expect } from 'vitest'
+// ...test content...
*** End Patch
```

Update the plan (multi‑step tasks)
- Keep one item `in_progress`, others `pending`/`completed`.
- Example steps for a feature:
  1) “Add deck manifest entries”
  2) “Seed signs deck JSON”
  3) “Write loader tests”

Run validations & tests
- Unit tests: `npm --prefix apps/web test`
- Typecheck: `npm --prefix apps/web run typecheck`
- Data validation (strict A1 glosses): `STRICT_A1_GLOSSES=1 npm --prefix apps/web run validate:data`

Common repo paths
- Deck manifest: `apps/web/public/data/decks/manifest.json`
- Signs deck: `apps/web/public/data/band-A/signs/signs-a1.json`
- Stories (public): `apps/web/public/stories/*.json` (manifest there too)
- Web app src: `apps/web/src/**`
- Ingestion tools: `tools/ingest/**`
- Validators/schemas: `apps/web/src/lib/schema.ts`, `scripts/validate-data.ts`

When to escalate (network/installs)
- npm install or fetching large datasets → explain why (e.g., “Install nodejieba for story segmentation”). Otherwise prefer offline/local scripts.

