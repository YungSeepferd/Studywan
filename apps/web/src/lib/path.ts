import { withBase } from './url'
import { PathDocSchema, type PathDoc, type PathNode } from './schema'

export async function loadPath(): Promise<PathDoc> {
  const url = withBase('curriculum/path.json')
  const raw = await fetch(url).then(r => {
    if (!r.ok) throw new Error(`Failed to load curriculum path: ${r.status}`)
    return r.json()
  })
  const parsed = PathDocSchema.parse(raw)
  return parsed
}

export function getNode(doc: PathDoc, id: string): PathNode | undefined {
  return doc.nodes.find(n => n.id === id)
}

