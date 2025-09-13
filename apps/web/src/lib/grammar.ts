export function scorePattern(pattern: string, filled: string[]): boolean {
  const parts = pattern.split(' ')
  const ans = filled.map((f, i) => (parts[i] === '+' ? '+' : f)).join(' ')
  return ans === parts.join(' ')
}

