// Lightweight script conversion using opencc-js when available.
// Falls back to provided simp/trad text if no converter.

let openccPromise: Promise<any> | null = null
async function getOpenCC() {
  if (!openccPromise) {
    openccPromise = import('opencc-js').then(mod => mod).catch(() => null)
  }
  return openccPromise
}

export async function toSimp(text: string): Promise<string> {
  const oc = await getOpenCC()
  try {
    if (oc && oc.OpenCC) {
      const conv = await oc.OpenCC.Converter({ from: 't', to: 's' })
      return conv(text)
    }
  } catch {}
  return text
}

export async function toTrad(text: string): Promise<string> {
  const oc = await getOpenCC()
  try {
    if (oc && oc.OpenCC) {
      const conv = await oc.OpenCC.Converter({ from: 's', to: 't' })
      return conv(text)
    }
  } catch {}
  return text
}

