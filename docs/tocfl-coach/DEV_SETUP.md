# Dev Setup (GitHub Pages + Vite)

1) App scaffold exists in `apps/web` (Vite + React). Run:
   - cd apps/web
   - npm install
   - npm run dev
2) Data bundles: place JSON under `apps/web/public/data/{band}/{level}.json`
   (A1 sample copied: `apps/web/public/data/band-A/level1.json`)
3) Implement components from `COMPONENTS.md`
4) GitHub Pages:
   - repo: <yourname>/tocfl-coach
   - set vite.config `base` to '/<repo>/' (e.g., '/StudyWan/')
   - Actions: deploy to gh-pages
5) Optional: Supabase
   - Create project; enable email auth
   - Create tables (`PSEUDOCODE_BACKEND.md`)
   - Set env vars; only call PostgREST on sign-in
