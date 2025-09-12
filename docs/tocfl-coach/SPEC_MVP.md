# MVP: GitHub Pages + LocalStorage (+ optional Supabase sync)

## Goal
A1–B2 learners can study TOCFL words and quick-check progress in-browser.

## MVP Features
- Decks: Band A1/A2/B1/B2 built from official lists.
- Study modes:
  - Flashcards (Han→EN / EN→Han).
  - Quick test (10/20/50 questions).
  - Tone drill (minimal pairs; audio).
- Scripts: Toggle Traditional <-> Simplified.
- Pronunciation: Toggle Zhuyin <-> Pinyin.
- Storage: localStorage; optional sign-in for sync.
- Import: CSV/TSV import (from Pleco/Anki; your CSVs).

## Non-Goals (MVP)
- Full grammar course; free-text speaking scoring; AI chat.

## Architecture
- Frontend: React + Vite (SPA).
- Hosting: GitHub Pages.
- Data: Embedded JSON bundles per band; lazy loaded.
- Sync (optional): Supabase (Auth + PostgREST).

