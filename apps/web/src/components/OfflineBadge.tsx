import { useEffect, useState } from 'react'

export function OfflineBadge() {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => setReady(true)).catch(() => {})
    }
  }, [])
  if (!ready) return null
  return (
    <div aria-live="polite" style={{ position: 'fixed', right: 12, bottom: 12, background: '#16a34a', color: '#fff', padding: '6px 10px', borderRadius: 6, fontSize: 12 }}>
      Offline ready
    </div>
  )
}
