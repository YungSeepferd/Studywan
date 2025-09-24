import { test, expect } from '@playwright/test'
import path from 'node:path'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const storyId = 'story-a2-transport-001'
const storyData = JSON.parse(readFileSync(path.resolve(__dirname, '../public/stories', `${storyId}.json`), 'utf8'))
const mockCards = storyData.vocabRefs.map((id) => ({
  id,
  trad: id === 'A1-0010' ? '捷運' : '計程車',
  simp: id === 'A1-0010' ? '地铁' : '出租车',
  pinyin: id === 'A1-0010' ? 'jié yùn' : 'jì chéng chē',
  band: 'A',
  level: 1,
  gloss_en: id === 'A1-0010' ? 'metro' : 'taxi',
}))

test.describe('StoryViewer end-to-end', () => {
  test('popovers, listening gate, and script toggles work together', async ({ page }) => {
    await page.route('**/stories/manifest.json', async (route) => {
      await route.fulfill({ json: [{ id: storyId, path: `stories/${storyId}.json` }] })
    })
    await page.route('**/stories/story-a2-transport-001.json', async (route) => {
      await route.fulfill({ json: storyData })
    })

    await page.goto('/')

    await page.evaluate(([cards]) => {
      window.__STUDYWAN_E2E__?.setCards(cards)
      window.__STUDYWAN_E2E__?.setView('story')
      window.__STUDYWAN_E2E__?.showStory({ path: 'stories/story-a2-transport-001.json' })
    }, [mockCards])

    const viewerText = page.getByTestId('story-viewer-text')
    await expect(viewerText).toBeVisible()
    await expect(viewerText).toContainText('捷運')

    const highlight = viewerText.getByRole('button').first()
    await highlight.click()
    await expect(page.getByRole('dialog')).toContainText(/metro|taxi/)

    await page.getByLabel('Script:').selectOption('simp')
    await expect(viewerText).toContainText('地铁')

    await page.getByRole('button', { name: 'Close' }).click()
  })
})
