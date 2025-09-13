export function withBase(p: string, base?: string): string {
  const b = base ?? (import.meta as any).env?.BASE_URL ?? '/'
  const path = p || ''
  if (b.endsWith('/') && path.startsWith('/')) return b + path.slice(1)
  if (!b.endsWith('/') && !path.startsWith('/')) return b + '/' + path
  return b + path
}
