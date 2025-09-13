import { useEffect, useState } from 'react'
import { Command } from 'cmdk'
import { withBase } from '../lib/url'

type DeckMeta = { id: string; title: string; band: 'A'|'B'|'C'; level: number; path: string; topic?: string }

type Props = {
  open: boolean
  onOpenChange: (o: boolean) => void
  onPickDeck: (path: string) => void
  onStartQuickTest: (n: number) => void
  onStartReaderPack: () => void
  onStartListening: () => void
  onStartExam: () => void
  onOpenDashboard: () => void
  onStartGrammar: () => void
  onToggleScript: () => void
  onToggleRomanization: () => void
  onOpenErrorBank: () => void
  onShowAbout: () => void
}

export function CommandPalette(p: Props) {
  const [search, setSearch] = useState('')
  const [decks, setDecks] = useState<DeckMeta[]>([])

  useEffect(() => {
    const url = withBase('data/decks/manifest.json')
    fetch(url).then(r => r.json()).then((d: DeckMeta[]) => setDecks(d)).catch(() => setDecks([]))
  }, [])

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: p.open ? 'auto' : 'none' }} aria-hidden={!p.open}>
      {p.open && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }} onClick={() => p.onOpenChange(false)} />
      )}
      <div style={{ position: 'absolute', left: '50%', top: '15%', transform: 'translateX(-50%)', width: 'min(720px, 92vw)' }}>
        {p.open && (
          <Command label="Command Menu" shouldFilter>
            <div style={{ background: '#111', color: '#fff', borderRadius: 8, overflow: 'hidden' }}>
              <Command.Input
                autoFocus
                value={search}
                onValueChange={setSearch}
                placeholder="Type a command or deck name…"
                style={{ width: '100%', padding: '12px 14px', border: 'none', outline: 'none', background: 'transparent', color: '#fff' }}
              />
              <Command.List style={{ maxHeight: 360, overflow: 'auto', background: '#fff', color: '#111' }}>
                <Command.Empty>No results.</Command.Empty>
                <Command.Group heading="Actions">
                  <Command.Item onSelect={() => { p.onStartQuickTest(10); p.onOpenChange(false) }}>Quick Test — 10</Command.Item>
                  <Command.Item onSelect={() => { p.onStartQuickTest(20); p.onOpenChange(false) }}>Quick Test — 20</Command.Item>
                  <Command.Item onSelect={() => { p.onStartQuickTest(50); p.onOpenChange(false) }}>Quick Test — 50</Command.Item>
                  <Command.Item onSelect={() => { p.onStartReaderPack(); p.onOpenChange(false) }}>Start Reader Pack</Command.Item>
                  <Command.Item onSelect={() => { p.onStartListening(); p.onOpenChange(false) }}>Start Listening Drills</Command.Item>
                  <Command.Item onSelect={() => { p.onStartExam(); p.onOpenChange(false) }}>Start Exam Simulation</Command.Item>
                  <Command.Item onSelect={() => { p.onOpenDashboard(); p.onOpenChange(false) }}>Open Dashboard</Command.Item>
                  <Command.Item onSelect={() => { p.onStartGrammar(); p.onOpenChange(false) }}>Start Grammar Drills</Command.Item>
                  <Command.Item onSelect={() => { p.onToggleScript(); p.onOpenChange(false) }}>Toggle Script (Trad/Simp)</Command.Item>
                  <Command.Item onSelect={() => { p.onToggleRomanization(); p.onOpenChange(false) }}>Toggle Pronunciation (Zhuyin/Pinyin)</Command.Item>
                  <Command.Item onSelect={() => { p.onOpenErrorBank(); p.onOpenChange(false) }}>Open Error Bank</Command.Item>
                  <Command.Item onSelect={() => { p.onShowAbout(); p.onOpenChange(false) }}>Show About</Command.Item>
                </Command.Group>
                <Command.Group heading="Decks">
                  {decks.map(d => (
                    <Command.Item key={d.path} onSelect={() => { p.onPickDeck(d.path); p.onOpenChange(false) }}>{d.title}</Command.Item>
                  ))}
                </Command.Group>
              </Command.List>
            </div>
          </Command>
        )}
      </div>
    </div>
  )
}
