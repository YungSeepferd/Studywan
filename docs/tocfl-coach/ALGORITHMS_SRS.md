# SRS & Scheduling

## SM-2 (baseline)
Pseudocode:
initialize card: ef=2.5, interval=1, reps=0
onReview(grade):
  if grade < 3: reps=0; interval=1
  else:
    if reps==0: interval=1
    elif reps==1: interval=6
    else: interval = round(interval * ef)
    ef = ef + (0.1 - (5-grade)*(0.08 + (5-grade)*0.02))
    ef = clamp(ef, 1.3, 2.8)
  due = today + interval; reps++

## FSRS (upgrade path)
- Keep per-card stability/difficulty.
- Optimize intervals via regression on `reviews`.
- Exportable as JSON weights.

## Tone drill generator
- Given hanzi + pinyin, produce minimal-pair choices:
  pick same syllable with tones 1–4; shuffle; ensure one correct.
- Optional sandhi check: tweak 一/不; 3→2 before 3rd tone.

