# Localization (UI)

This app is Traditional-first. The UI now supports a minimal language toggle (English, Deutsch, 繁體中文) via a simple loader that fetches JSON files under `apps/web/public/locales/<lang>/common.json`.

Planned: migrate to i18next/react-i18next when adding more strings and ICU formatting. For now, the Settings dialog exposes a language selector and a small set of UI strings are translated.

Files:
- `apps/web/public/locales/en/common.json`
- `apps/web/public/locales/de/common.json`
- `apps/web/public/locales/zh-TW/common.json`
- `apps/web/src/lib/i18n.ts` (temporary lightweight loader)

To extend:
- Add keys to the JSON files.
- Replace literals in components with `t('key')`.
- Once i18next is installed, replace the loader with proper i18n wiring.

