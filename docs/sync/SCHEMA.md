# Sync Schema (Planned)

This document outlines the optional cloud sync schema for StudyWan using Supabase (Postgres + storage). Sync is opt-in and offline-first; no data leaves the device unless enabled in Settings.

## Entities
- `profiles` — user id, email, created_at
- `decks` — deck id, title, level, topic, path (reference only)
- `srs_state` — user id, deck id, card id, ef, interval, reps, due, lapses
- `error_bank` — user id, deck id, card id
- `sessions` — user id, type (study|quicktest|listening|exam|reader), deck id, started_at, ended_at, score, total, payload jsonb

## Conflict resolution
- Last write wins per `(user_id, deck_id, card_id)` for `srs_state`.
- `sessions` are append-only; no conflicts.

## Notes
- Authentication via magic link (email) using Supabase Auth.
- Client caches all tables locally and syncs on connectivity change.
- Due to licensing of decks/dictionaries, sync stores only user-generated state.

