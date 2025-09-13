import { withBase } from './url'

type Dict = Record<string, string>
let current: Dict = {}
let lang: string = 'en'

export async function setLanguage(l: 'en' | 'de' | 'zh-TW') {
  lang = l
  try {
    const url = withBase(`locales/${l}/common.json`)
    const raw = await fetch(url).then(r => r.json())
    current = raw as Dict
  } catch {
    current = {}
  }
}

export function t(key: string): string {
  return current[key] || key
}

export function getLang() { return lang }
