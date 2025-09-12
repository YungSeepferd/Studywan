export function About(props: { onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'grid', placeItems: 'center' }}>
      <div role="dialog" aria-modal="true" style={{ background: '#fff', padding: 16, borderRadius: 8, maxWidth: 640 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong>About / Licences</strong>
          <button onClick={props.onClose} aria-label="Close about">Close</button>
        </div>
        <div style={{ marginTop: 12, fontSize: 14, color: '#333' }}>
          <p>StudyWan — Traditional-first TOCFL A/B learning app.</p>
          <p>Third-party attributions:</p>
          <ul>
            <li>SC-TOP official vocab lists (Traditional) — used for decks</li>
            <li>OpenCC (Apache-2.0) — script conversion</li>
            <li>Hanzi Writer — stroke animations (Make Me a Hanzi data)</li>
            <li>CC-CEDICT (CC-BY-SA) — optional gloss enrichment</li>
            <li>MOE dictionaries — Traditional definitions/Zhuyin (check licensing before bundling)</li>
          </ul>
          <p>Source code: MIT License.</p>
        </div>
      </div>
    </div>
  )
}

