# Frontend Components (React)

Current key components
- App.tsx: orchestrates modes (Pick, Study, QuickTest, ReaderPack, Story, Listening, Exam, Grammar, Dashboard)
- DeckPicker: loads from `public/data/decks/manifest.json`
- StudyCard: shows Hanzi, Zhuyin/Pinyin, English gloss, hint/etymology, swipe‑to‑grade controls
  - HanziStroke/MultiCharStrokes: stroke animations for one or multiple characters
- SwipeCard: gesture wrapper for grading (uses Motion + @use‑gesture)
- QuickTest: timed MCQ; counts 10/20/50
- ReaderPack: story‑based comprehension; popovers show pronunciation + gloss for targets
- StoryViewer: micro‑story reader; once‑through audio; post‑story questions
- ListeningDrills: once‑through audio prompt; timed responses
- ExamSim: 35 listening + 50 reading (skeleton) under a 60‑minute timer
- GrammarDrills: reorder/fill‑pattern practice based on GrammarCard items
- Dashboard: counters (due, learned), session Export/Import, accuracy
- CommandPalette: cmdk‑powered actions to jump between flows
- SettingsDialog: toggles (Trad/Simp, Zhuyin/Pinyin, tone colours, high‑contrast); diagnostics

Planned/Upcoming
- PathView/PathRunner: a single Curriculum Path (A→B) runner sequencing Study → QuickTest → Reader → Listening → Grammar → Mastery check
- Segmentation highlighter: nodejieba‑based tokens for robust highlighting
- Charts: Recharts graphs in Dashboard
- i18n: i18next integration across Settings/DeckPicker/Palette/Path UI

Strokes rendering
- MultiCharStrokes shows up to 4 characters by default; useful for signage and multi‑character words.
- Consider adding per‑character zoom and handwriting practice steps later.
