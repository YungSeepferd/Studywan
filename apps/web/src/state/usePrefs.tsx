import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { Prefs } from '../lib/types'

const defaultPrefs: Prefs = { scriptMode: 'trad', romanization: 'zhuyin', toneColors: false, highContrast: false }

type Ctx = { prefs: Prefs; setPrefs: React.Dispatch<React.SetStateAction<Prefs>> }
const PrefsCtx = createContext<Ctx | null>(null)

export function PrefsProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<Prefs>(() => {
    try {
      const s = localStorage.getItem('prefs')
      if (s) return { ...defaultPrefs, ...JSON.parse(s) }
    } catch {}
    return defaultPrefs
  })
  useEffect(() => {
    try { localStorage.setItem('prefs', JSON.stringify(prefs)) } catch {}
  }, [prefs])
  const value = useMemo(() => ({ prefs, setPrefs }), [prefs])
  return <PrefsCtx.Provider value={value}>{children}</PrefsCtx.Provider>
}

export function usePrefs() {
  const ctx = useContext(PrefsCtx)
  if (!ctx) throw new Error('usePrefs must be used within PrefsProvider')
  return ctx
}
