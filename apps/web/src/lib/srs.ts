import type { SrsState } from './types'

export type Grade = 0 | 3 | 4 | 5 // Again=0, Hard=3, Good=4, Easy=5

export function initialState(now = Date.now()): SrsState {
  return { ef: 2.5, interval: 0, reps: 0, due: now }
}

export function isDue(state: SrsState, now = Date.now()): boolean {
  return state.due <= now
}

export function addDays(ts: number, days: number): number {
  return ts + days * 24 * 60 * 60 * 1000
}

export function schedule(prev: SrsState, grade: Grade, now = Date.now()): SrsState {
  // SM-2 baseline with 0/3/4/5 mapping; if grade < 3, reset reps/interval
  let ef = prev.ef
  let reps = prev.reps
  let interval = prev.interval

  if (grade < 3) {
    reps = 0
    interval = 1
  } else {
    if (reps === 0) interval = 1
    else if (reps === 1) interval = 6
    else interval = Math.round(interval * ef)
    // EF update
    const q = grade
    ef = ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    if (ef < 1.3) ef = 1.3
    if (ef > 2.8) ef = 2.8
    reps = reps + 1
  }

  return { ef, interval, reps, due: addDays(now, interval) }
}

