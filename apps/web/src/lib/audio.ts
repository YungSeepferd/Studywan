// Audio wrapper built on Howler if available; falls back to HTML5 Audio.
// In non-browser/test environments, invokes onEnd immediately.

export type Stopper = () => void

function dynImport(name: string): Promise<any> {
  // eslint-disable-next-line no-new-func
  const dyn = new Function('s', 'return import(s)') as (s: string) => Promise<any>
  return dyn(name)
}

export function playOnce(url: string, onEnd: () => void): Stopper {
  // If no window (tests/SSR), just call onEnd async and return no-op stopper
  if (typeof window === 'undefined') {
    setTimeout(() => { try { onEnd() } catch {} }, 0)
    return () => {}
  }
  // Try Howler first
  try {
    // dynamic import to avoid bundler errors when not installed
    let stopped = false
    dynImport('howler').then((mod) => {
      if (stopped) return
      const Howl = (mod as any).Howl
      if (typeof Howl === 'function') {
        const sound = new Howl({ src: [url], html5: true, onend: onEnd })
        sound.play()
        ;(window as any).__lastHowl = sound
      } else {
        // Fallback to HTMLAudioElement
        const a = new Audio(url)
        a.addEventListener('ended', onEnd, { once: true })
        a.play().catch(() => {})
        ;(window as any).__lastAudio = a
      }
    }).catch(() => {
      const a = new Audio(url)
      a.addEventListener('ended', onEnd, { once: true })
      a.play().catch(() => {})
      ;(window as any).__lastAudio = a
    })
    return () => {
      stopped = true
      try {
        const sound = (window as any).__lastHowl
        if (sound && typeof sound.stop === 'function') sound.stop()
      } catch {}
      try {
        const a: HTMLAudioElement | undefined = (window as any).__lastAudio
        if (a) { a.pause(); a.src = '' }
      } catch {}
    }
  } catch {
    // Fallback: HTML5 Audio or immediate end
    try {
      const a = new Audio(url)
      a.addEventListener('ended', onEnd, { once: true })
      a.play().catch(() => {})
      return () => { try { a.pause(); (a as any).src = '' } catch {} }
    } catch {
      setTimeout(() => { try { onEnd() } catch {} }, 0)
      return () => {}
    }
  }
}

