# Data Model (Supabase optional)

## Local (always)
- `UserPrefs`: { scriptMode, romanization, font, audioSpeed }
- `SrsState`: per-card review data (EF, interval, dueDate, streak)
- `Progress`: aggregates (per band; counts; lastSeenAt)

## Cloud (optional, Supabase)
Tables:
- `users`: id, email, created_at
- `cards`: id, hanzi, trad, simp, pinyin, zhuyin, pos, gloss, band, level, tags[]
- `audio`: id, card_id, url, voice, source
- `reviews`: id, user_id, card_id, grade(0–5), due, interval, ef, last_reviewed_at
- `user_prefs`: id, user_id, script_mode, romanization, font, audio_speed

Indexes:
- `cards(band, level)`, `reviews(user_id, due)`

Notes:
- Cards can reference MOE headwords; store Taiwan/Mainland variants via `tags` (`tw-usage:計程車`).

