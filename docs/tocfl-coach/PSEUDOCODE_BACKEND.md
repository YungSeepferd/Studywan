# Minimal Backend (Supabase)

-- SQL (abbrev.)
create table cards (
  id uuid primary key,
  trad text, simp text, pinyin text, zhuyin text,
  band int, level int, pos text, gloss text, tags text[]
);

create table reviews (
  id uuid primary key,
  user_id uuid references auth.users,
  card_id uuid references cards,
  grade int, interval int, ef float, due date, last_reviewed_at timestamptz
);

create table user_prefs (
  user_id uuid primary key references auth.users,
  script_mode text check (script_mode in ('trad','simp')),
  romanization text check (romanization in ('zhuyin','pinyin')),
  font text, audio_speed float default 1.0
);

-- Row Level Security: user_id = auth.uid() on reviews/user_prefs.

# REST (auto via PostgREST)
GET /cards?band=eq.1&level=eq.1
POST /reviews
PATCH /user_prefs

