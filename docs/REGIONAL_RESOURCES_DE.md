# TOCFL in Germany (Resources)

This page aggregates links and pointers for candidates based in Germany. Use these to refine content, dates, and center information in the app. If a link is offline, check again later or ask maintainers to update.

## Official Links
- Taipei Representative Office in the Federal Republic of Germany (TOCFL info): https://www.roc-taiwan.org/de_de/post/1749.html (currently shows a maintenance page at time of fetch)
- SC-TOP (TOCFL official): https://tocfl.edu.tw/
- Taiwan Mandarin Educational Resources Center (LMIT): https://lmit.edu.tw/lc/tocfl

## Recommended Data To Track (for app UX)
- Test centers in DE: city, venue, capacity, contact email/phone
- Session calendar: registration open/close dates; exam dates per band
- Fees per section (Listening/Reading) and full-test options
- Registration portal URL and instructions
- Mock tests (links) endorsed by local center
- Accessibility and accommodations process

## App Integration Ideas
- Show upcoming sessions by city and band on the DeckPicker view.
- Add “German locale” toggle to surface German UI and `gloss_de` fields when available.
- Provide a “Read before test day” checklist with local center requirements (ID, arrival time, headphones policy).

## How to Update
1) Verify the DE page (link above) and extract: centers, dates, fees, registration.
2) Store structured data under `data/regions/de/centers.json` and `data/regions/de/sessions.json` (to be defined when we implement the feature).
3) Add a link to the About/Help page in the web app.

