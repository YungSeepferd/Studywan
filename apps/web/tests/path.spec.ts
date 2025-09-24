import { test, expect } from '@playwright/test'

const pathDoc = {
  start: 'unit-1',
  nodes: [
    {
      id: 'unit-1',
      title: 'Mock Unit 1',
      band: 'A',
      level: 1,
      content: {
        deckId: 'mock-deck',
        storyIds: ['story-a1-greetings-001'],
      },
      gates: { quickTestMin: 80, listeningMin: 70, srsCoverageMin: 0.5 },
      next: [],
    },
  ],
}

const deckManifest = [
  { id: 'mock-deck', title: 'Mock Deck', band: 'A', level: 1, path: 'data/mock/mock-deck.json' },
]

const deckCards = [
  { id: 'mock-card-1', trad: '捷運', simp: '地铁', pinyin: 'jié yùn', gloss_en: 'metro', band: 'A', level: 1 },
  { id: 'mock-card-2', trad: '計程車', simp: '出租车', pinyin: 'jì chéng chē', gloss_en: 'taxi', band: 'A', level: 1 },
]

test.describe('Curriculum path gating', () => {
  test('requires SRS and quick test thresholds before unlocking steps', async ({ page }) => {
    await page.route('**/curriculum/path.json', async (route) => {
      await route.fulfill({ json: pathDoc })
    })
    await page.route('**/data/decks/manifest.json', async (route) => {
      await route.fulfill({ json: deckManifest })
    })
    await page.route('**/data/mock/mock-deck.json', async (route) => {
      await route.fulfill({ json: deckCards })
    })

    await page.goto('/')

    await page.evaluate(() => {
      window.__STUDYWAN_E2E__?.setView('path')
    })

    await expect(page.getByText('Curriculum Path')).toBeVisible()
    await page.getByRole('button', { name: 'Open', exact: true }).click()

    const quickButton = page.getByRole('button', { name: '2) Quick Test' })
    const readerButton = page.getByRole('button', { name: '3) Reader (stories)' })
    const listeningButton = page.getByRole('button', { name: '4) Listening Drills' })

    await expect(quickButton).toBeDisabled()
    await expect(readerButton).toBeDisabled()
    await expect(listeningButton).toBeDisabled()

    await page.evaluate(() => {
      const now = Date.now()
      localStorage.setItem('srs:data/mock/mock-deck.json', JSON.stringify({
        'mock-card-1': { reps: 1, interval: 1, ef: 2.5, due: now },
      }))
    })

    await page.getByRole('button', { name: 'Refresh status' }).click()
    await expect(quickButton).toBeEnabled()
    await expect(readerButton).toBeDisabled()
    await expect(listeningButton).toBeDisabled()

    await page.evaluate(() => {
      const now = Date.now()
      localStorage.setItem('pathProgress', JSON.stringify({
        'unit-1': {
          startedAt: now,
          steps: {
            quick: { attempts: 1, lastScore: 9, lastTotal: 10, updatedAt: now },
            listen: { attempts: 1, lastScore: 8, lastTotal: 10, updatedAt: now },
          },
        },
      }))
    })

    await page.getByRole('button', { name: 'Refresh status' }).click()
    await expect(readerButton).toBeEnabled()
    await expect(listeningButton).toBeEnabled()
  })
  test('study → status update via API helpers', async ({ page }) => {
    await page.route('**/curriculum/path.json', async (route) => {
      await route.fulfill({ json: pathDoc })
    })
    await page.route('**/data/decks/manifest.json', async (route) => {
      await route.fulfill({ json: deckManifest })
    })
    await page.route('**/data/mock/mock-deck.json', async (route) => {
      await route.fulfill({ json: deckCards })
    })

    await page.goto('/')
    await page.evaluate(() => {
      window.__STUDYWAN_E2E__?.setView('path')
      window.__STUDYWAN_E2E__?.setCards([
        { id: 'mock-card-1', trad: '捷運', simp: '地铁', pinyin: 'jié yùn', band: 'A', level: 1 },
        { id: 'mock-card-2', trad: '計程車', simp: '出租车', pinyin: 'jì chéng chē', band: 'A', level: 1 },
      ])
    })

    await page.getByRole('button', { name: 'Open', exact: true }).click()
    await expect(page.getByRole('button', { name: '1) Study (SRS subset)' })).toBeEnabled()

    await page.getByRole('button', { name: '1) Study (SRS subset)' }).click()
    await expect(page.getByText('Deck:', { exact: false })).toBeVisible()

    await page.evaluate(() => {
      const now = Date.now()
      localStorage.setItem('srs:data/mock/mock-deck.json', JSON.stringify({
        'mock-card-1': { reps: 3, interval: 2, ef: 2.4, due: now },
        'mock-card-2': { reps: 3, interval: 2, ef: 2.4, due: now },
      }))
      localStorage.setItem('pathProgress', JSON.stringify({
        'unit-1': {
          startedAt: now,
          steps: {
            study: { attempts: 1, lastScore: 20, lastTotal: 20, updatedAt: now },
            quick: { attempts: 1, lastScore: 18, lastTotal: 20, updatedAt: now },
            listen: { attempts: 1, lastScore: 16, lastTotal: 20, updatedAt: now },
          },
        },
      }))
    })

    await page.evaluate(() => {
      window.__STUDYWAN_E2E__?.setView('pathRunner')
    })
    const refreshButton = page.getByRole('button', { name: 'Refresh status' })
    await expect(refreshButton).toBeVisible()
    await refreshButton.click({ noWaitAfter: true })
    await expect(page.getByText(/2\/2 studied/)).toBeVisible()
    await expect(page.getByRole('button', { name: '2) Quick Test' })).toBeEnabled()
    await expect(page.getByRole('button', { name: '4) Listening Drills' })).toBeEnabled()
    await expect(page.getByRole('button', { name: '5) Grammar' })).toBeEnabled()
  })
})
