import type { Grade } from './srs'

export function gradeFromSwipe(mx: number, threshold = 80): Grade | null {
  if (mx > threshold) return 5
  if (mx < -threshold) return 0
  return null
}

