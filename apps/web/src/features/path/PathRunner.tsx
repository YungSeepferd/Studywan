import type { PathStep } from '../../lib/store/pathProgress'
import type { PathNode } from '../../lib/schema'
import type { NodeStatus } from '../../lib/pathStatus'

const STEP_LABEL: Record<PathStep, string> = {
  study: 'Study (SRS subset)',
  quick: 'Quick Test',
  reader: 'Reader (stories)',
  listen: 'Listening Drills',
  grammar: 'Grammar',
}

export type PathStoryLink = {
  id: string
  title: string
  path: string
  topic?: string
  completedAt?: number
}

function formatTimestamp(ts?: number) {
  if (!ts) return null
  try {
    return new Date(ts).toLocaleString()
  } catch {
    return null
  }
}

export function PathRunner(props: {
  node: PathNode
  status: NodeStatus | null
  stories: PathStoryLink[]
  storiesLoading: boolean
  onOpenStory: (storyId: string) => void
  onRefreshStatus: () => void
  onStartStudy: () => void
  onStartQuickTest: () => void
  onStartReader: () => void
  onStartListening: () => void
  onStartGrammar: () => void
  onBack: () => void
}) {
  const n = props.node
  const status = props.status
  const stories = props.stories
  const storiesLoading = props.storiesLoading

  const resumeStep = status?.nextRequiredStep ?? null
  const resumeHandlers: Record<PathStep, () => void> = {
    study: props.onStartStudy,
    quick: props.onStartQuickTest,
    reader: props.onStartReader,
    listen: props.onStartListening,
    grammar: props.onStartGrammar,
  }
  const resumeHandler = resumeStep ? resumeHandlers[resumeStep] : null

  const srsRequirement = n.gates.srsCoverageMin ?? 0
  const srsReqPct = Math.round(srsRequirement * 100)
  const quickRequirement = n.gates.quickTestMin ?? 0
  const listenRequirement = n.gates.listeningMin ?? 0

  const coveragePct = status ? Math.round(status.coverage * 100) : null
  const quickPercent = typeof status?.quick.percent === 'number' ? Math.round(status.quick.percent) : null
  const listenPercent = typeof status?.listen.percent === 'number' ? Math.round(status.listen.percent) : null

  let quickDisabled = false
  if (srsRequirement > 0) quickDisabled = !(status?.srsMet)
  if (!status && srsRequirement > 0) quickDisabled = true

  let readerDisabled = false
  if (quickRequirement > 0) readerDisabled = !(status?.quick.met)
  if (!status && quickRequirement > 0) readerDisabled = true

  const listeningDisabled = readerDisabled

  let grammarDisabled = false
  if (listenRequirement > 0) grammarDisabled = !(status?.listen.met)
  if (!status && listenRequirement > 0) grammarDisabled = true

  const studyUpdated = formatTimestamp(status?.study.updatedAt)
  const quickUpdated = formatTimestamp(status?.quick.updatedAt)
  const readerUpdated = formatTimestamp(status?.reader.updatedAt)
  const listenUpdated = formatTimestamp(status?.listen.updatedAt)
  const grammarUpdated = formatTimestamp(status?.grammar.updatedAt)

  const coverageLine = !status
    ? 'Checking status…'
    : status.deckSize
      ? `${status.studiedCount}/${status.deckSize} studied (${coveragePct ?? 0}%) • req ${srsReqPct}%${studyUpdated ? ` • ${studyUpdated}` : ''}`
      : 'Deck empty'
  const coverageColor = !status ? '#888' : status.srsMet ? '#0a0' : '#c00'

  const quickLine = !status
    ? 'Status pending…'
    : status.quick.attempts
      ? `Last: ${status.quick.lastScore ?? 0}/${status.quick.lastTotal ?? 0}${quickPercent !== null ? ` (${quickPercent}%)` : ''} • req ${quickRequirement}%${quickUpdated ? ` • ${quickUpdated}` : ''}`
      : 'Not attempted yet'
  const quickColor = !status ? '#888' : quickRequirement > 0 ? (status.quick.met ? '#0a0' : '#c00') : '#666'

  const readerLine = !status
    ? 'Status pending…'
    : status.reader.attempts
      ? `Attempts: ${status.reader.attempts}${readerUpdated ? ` • ${readerUpdated}` : ''}`
      : 'Not attempted yet'
  const readerColor = !status ? '#888' : readerDisabled ? '#c00' : '#666'

  const listenLine = !status
    ? 'Status pending…'
    : status.listen.attempts
      ? `Last: ${status.listen.lastScore ?? 0}/${status.listen.lastTotal ?? 0}${listenPercent !== null ? ` (${listenPercent}%)` : ''} • req ${listenRequirement}%${listenUpdated ? ` • ${listenUpdated}` : ''}`
      : 'Not attempted yet'
  const listenColor = !status ? '#888' : listenRequirement > 0 ? (status.listen.met ? '#0a0' : '#c00') : '#666'

  const grammarLine = !status
    ? 'Status pending…'
    : status.grammar.attempts
      ? `Attempts: ${status.grammar.attempts}${grammarUpdated ? ` • ${grammarUpdated}` : ''}`
      : 'Not attempted yet'
  const grammarColor = !status ? '#888' : grammarDisabled ? '#c00' : '#666'

  const quickHelp = srsRequirement > 0 && status && !status.srsMet
    ? `Needs SRS coverage ≥ ${srsReqPct}%`
    : null
  const readerHelp = quickRequirement > 0 && status && !status.quick.met
    ? `Requires Quick Test ≥ ${quickRequirement}%`
    : null
  const listenHelp = quickRequirement > 0 && status && !status.quick.met
    ? `Quick Test gate unmet (${quickRequirement}%)`
    : listenRequirement > 0 && status && !status.listen.met
      ? `Needs Listening ≥ ${listenRequirement}%`
      : null
  const grammarHelp = listenRequirement > 0 && status && !status.listen.met
    ? `Requires Listening ≥ ${listenRequirement}%`
    : null

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <div>
          <div style={{ fontWeight: 600 }}>{n.title}</div>
          <div style={{ color: '#666', fontSize: 12 }}>Deck: {n.content.deckId}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {resumeStep && resumeHandler && (
            <button onClick={resumeHandler}>
              Resume {STEP_LABEL[resumeStep]}
            </button>
          )}
          <button onClick={props.onRefreshStatus}>Refresh status</button>
          <button onClick={props.onBack}>Back</button>
        </div>
      </div>
      <div>Sequence:</div>
      <div style={{ display: 'grid', gap: 10 }}>
        <div>
          <button onClick={props.onStartStudy}>1) Study (SRS subset)</button>
          <div style={{ color: coverageColor, fontSize: 12, marginTop: 4 }}>{coverageLine}</div>
        </div>
        <div>
          <button onClick={props.onStartQuickTest} disabled={quickDisabled}>2) Quick Test</button>
          <div style={{ color: quickColor, fontSize: 12, marginTop: 4 }}>{quickLine}</div>
          {quickHelp && <div style={{ color: '#c00', fontSize: 12 }}>{quickHelp}</div>}
        </div>
        <div>
          <button onClick={props.onStartReader} disabled={readerDisabled}>3) Reader (stories)</button>
          <div style={{ color: readerColor, fontSize: 12, marginTop: 4 }}>{readerLine}</div>
          {readerHelp && <div style={{ color: '#c00', fontSize: 12 }}>{readerHelp}</div>}
        </div>
        <div>
          <button onClick={props.onStartListening} disabled={listeningDisabled}>4) Listening Drills</button>
          <div style={{ color: listenColor, fontSize: 12, marginTop: 4 }}>{listenLine}</div>
          {listenHelp && <div style={{ color: '#c00', fontSize: 12 }}>{listenHelp}</div>}
        </div>
        <div>
          <button onClick={props.onStartGrammar} disabled={grammarDisabled}>5) Grammar</button>
          <div style={{ color: grammarColor, fontSize: 12, marginTop: 4 }}>{grammarLine}</div>
          {grammarHelp && <div style={{ color: '#c00', fontSize: 12 }}>{grammarHelp}</div>}
        </div>
      </div>
      <div style={{ display: 'grid', gap: 8 }}>
        <div>Stories:</div>
        {storiesLoading ? (
          <div style={{ color: '#666', fontSize: 12 }}>Loading linked stories…</div>
        ) : stories.length ? (
          stories.map((story) => {
            const completedAt = formatTimestamp(story.completedAt)
            const statusLabel = story.completedAt ? `Completed${completedAt ? ` • ${completedAt}` : ''}` : 'Pending'
            const statusColor = story.completedAt ? '#0a0' : '#c00'
            return (
              <div key={story.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', border: '1px solid #eee', borderRadius: 8, padding: '8px 12px' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{story.title}</div>
                  <div style={{ color: '#666', fontSize: 12 }}>{story.topic ? `${story.topic} • ` : ''}<span style={{ color: statusColor }}>{statusLabel}</span></div>
                </div>
                <button onClick={() => props.onOpenStory(story.id)}>Open</button>
              </div>
            )
          })
        ) : (
          <div style={{ color: '#666', fontSize: 12 }}>No linked stories for this node.</div>
        )}
      </div>
      <div style={{ color: '#666', fontSize: 12 }}>Gates: QT ≥ {quickRequirement} • Listening ≥ {listenRequirement} • SRS ≥ {srsReqPct}%</div>
    </div>
  )
}
