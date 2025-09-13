import * as Dialog from '@radix-ui/react-dialog'
import { useState } from 'react'
import { usePrefs } from '../state/usePrefs'
import { setLanguage, t } from '../lib/i18n'
import { withBase } from '../lib/url'

export function SettingsDialog(props: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { prefs, setPrefs } = usePrefs()
  const [deckStatus, setDeckStatus] = useState<string>('—')
  const [storyStatus, setStoryStatus] = useState<string>('—')

  async function checkData() {
    try {
      const d = await fetch(withBase('data/decks/manifest.json')).then(r => r.ok)
      setDeckStatus(d ? 'OK' : 'Fail')
    } catch { setDeckStatus('Fail') }
    try {
      const s = await fetch(withBase('stories/manifest.json')).then(r => r.ok)
      setStoryStatus(s ? 'OK' : 'Fail')
    } catch { setStoryStatus('Fail') }
  }

  return (
    <Dialog.Root open={props.open} onOpenChange={props.onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)' }} />
        <Dialog.Content style={{ position: 'fixed', top: '15%', left: '50%', transform: 'translateX(-50%)', background: '#fff', borderRadius: 8, width: 'min(720px, 92vw)', padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Dialog.Title>{t('settings')}</Dialog.Title>
            <Dialog.Close asChild><button aria-label="Close">×</button></Dialog.Close>
          </div>
          <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
            <div>
              <label>{t('script')}: </label>
              <select value={prefs.scriptMode} onChange={e => setPrefs(p => ({ ...p, scriptMode: e.target.value as any }))}>
                <option value="trad">{t('traditional')}</option>
                <option value="simp">{t('simplified')}</option>
              </select>
            </div>
            <div>
              <label>{t('romanization')}: </label>
              <select value={prefs.romanization} onChange={e => setPrefs(p => ({ ...p, romanization: e.target.value as any }))}>
                <option value="zhuyin">{t('zhuyin')}</option>
                <option value="pinyin">{t('pinyin')}</option>
              </select>
            </div>
            <div>
              <label>{t('language')}: </label>
              <select value={prefs.language || 'en'} onChange={async e => { const l = e.target.value as any; await setLanguage(l); setPrefs(p => ({ ...p, language: l })) }}>
                <option value="en">English</option>
                <option value="de">Deutsch</option>
                <option value="zh-TW">繁體中文</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <input type="checkbox" checked={!!prefs.toneColors} onChange={e => setPrefs(p => ({ ...p, toneColors: e.target.checked }))} /> Tone colors
              </label>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginLeft: 12 }}>
                <input type="checkbox" checked={!!prefs.highContrast} onChange={e => setPrefs(p => ({ ...p, highContrast: e.target.checked }))} /> High contrast
              </label>
            </div>
            <div style={{ borderTop: '1px solid #eee', paddingTop: 8 }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>{t('diagnostics')}</div>
              <button onClick={checkData}>{t('checkData')}</button>
              <div style={{ color: '#666', marginTop: 6 }}>{t('deckManifest')}: {deckStatus} • {t('storyManifest')}: {storyStatus}</div>
              {(import.meta as any).env?.DEV && (
                <div style={{ color: '#777', fontSize: 12, marginTop: 6 }}>BASE: {(import.meta as any).env?.BASE_URL ?? '/'}</div>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
