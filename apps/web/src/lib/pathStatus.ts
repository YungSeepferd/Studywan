import type { PathNode } from './schema'
import type { Card, SrsMap } from './types'
import { loadDeckCardsById } from './decks'
import { loadSrsMap } from './storage'
import { getNodeProgress, type NodeProgress, type StepProgress, type PathStep, type StepAttempt } from './store/pathProgress'

type StepSummary = {
  attempts: number
  lastScore?: number
  lastTotal?: number
  percent?: number
  met?: boolean
  updatedAt?: number
  history?: StepAttempt[]
}

export type NodeStatus = {
  deckPath: string
  deckSize: number
  studiedCount: number
  coverage: number
  srsRequirement: number
  srsMet: boolean
  progress?: NodeProgress
  study: StepSummary
  quick: StepSummary & { requirement: number }
  reader: StepSummary
  listen: StepSummary & { requirement: number }
  grammar: StepSummary
  nextRequiredStep: PathStep | null
}

function summarize(step: StepProgress | undefined): StepSummary {
  if (!step) return { attempts: 0 }
  const { attempts, lastScore, lastTotal, updatedAt, history } = step
  const summary: StepSummary = { attempts, history, updatedAt }
  if (typeof lastScore === 'number') summary.lastScore = lastScore
  if (typeof lastTotal === 'number') summary.lastTotal = lastTotal
  if (
    typeof summary.lastScore === 'number' &&
    typeof summary.lastTotal === 'number' &&
    summary.lastTotal > 0
  ) {
    summary.percent = (summary.lastScore / summary.lastTotal) * 100
  }
  return summary
}

function calculateCoverage(cards: Card[], map: SrsMap): { studied: number; coverage: number } {
  if (!cards.length) return { studied: 0, coverage: 0 }
  const studied = cards.reduce((count, card) => {
    const state = map[card.id]
    if (!state) return count
    const reps = state.reps ?? 0
    const interval = state.interval ?? 0
    return reps > 0 || interval > 0 ? count + 1 : count
  }, 0)
  return { studied, coverage: studied / cards.length }
}

export function getNextRequiredStep(status: NodeStatus): PathStep | null {
  if (status.study.attempts === 0 || !status.srsMet) return 'study'
  if (status.quick.attempts === 0 || !status.quick.met) return 'quick'
  if (status.reader.attempts === 0) return 'reader'
  if (status.listen.attempts === 0 || !status.listen.met) return 'listen'
  if (status.grammar.attempts === 0) return 'grammar'
  return null
}

export async function computeNodeStatus(node: PathNode): Promise<NodeStatus> {
  const { cards, meta } = await loadDeckCardsById(node.content.deckId)
  const srsMap = loadSrsMap(meta.path)
  const { studied, coverage } = calculateCoverage(cards, srsMap)
  const srsRequirement = node.gates.srsCoverageMin ?? 0
  const srsMet = coverage >= srsRequirement && cards.length > 0

  const progress = getNodeProgress(node.id)
  const study = summarize(progress?.steps?.study)
  const quick = summarize(progress?.steps?.quick)
  const reader = summarize(progress?.steps?.reader)
  const listen = summarize(progress?.steps?.listen)
  const grammar = summarize(progress?.steps?.grammar)

  const quickRequirement = node.gates.quickTestMin ?? 0
  const listenRequirement = node.gates.listeningMin ?? 0

  if (quickRequirement > 0) quick.met = (quick.percent ?? 0) >= quickRequirement
  else quick.met = quick.attempts > 0 || quickRequirement === 0

  if (listenRequirement > 0) listen.met = (listen.percent ?? 0) >= listenRequirement
  else listen.met = listen.attempts > 0 || listenRequirement === 0

  const status: NodeStatus = {
    deckPath: meta.path,
    deckSize: cards.length,
    studiedCount: studied,
    coverage,
    srsRequirement,
    srsMet,
    study,
    quick: { ...quick, requirement: quickRequirement },
    reader,
    listen: { ...listen, requirement: listenRequirement },
    grammar,
    nextRequiredStep: null,
  }

  if (progress) status.progress = progress
  status.nextRequiredStep = getNextRequiredStep(status)

  return status
}

// Exported for tests.
export const __test = { calculateCoverage, getNextRequiredStep }
