# Next Steps (Execution Queue)

Immediate (Task 1)
- Add CI workflow for typecheck/lint/tests and data validation
- Add Pages deploy workflow; set Vite base to '/Studywan/'
- Extend Card/Story schemas (examples, variants, hints, questions) — done
- Add dict merge TS script and strict A1 gloss validator — done

Short-term (Task 2–6)
- Data validator (AJV/Zod) for cards/stories; add npm script — added (scripts/validate-data.ts)
- Deck manifest and dynamic DeckPicker — wired; added A2/B1/B2 stubs
- Central prefs store and global toggles — present
- SRS session summary and leech handling — present
- ReaderPack polish: wrong→SRS, gist/detail mix, return-to-menu — baseline
- Listening Drills scaffold — added
- Exam Simulation scaffold — added
- Dashboard (basic counters) — added

MVP hardening (Task 7–9)
- PWA install/offline cache
- Offline audio/image caching via Workbox runtimeCaching — added
- Accessibility: tone colours, high-contrast, ARIA labels, shortcuts
- Licensing & attribution UI

Optional/Future (Task 10)
- Error bank, CSV import/export, tests, B-level readers, Supabase sync
