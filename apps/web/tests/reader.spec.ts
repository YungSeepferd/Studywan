import { test, expect } from '@playwright/test'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const storiesDir = path.resolve(__dirname, '../public/stories')

function loadStory(id: string) {
  const manifest = JSON.parse(readFileSync(path.join(storiesDir, 'manifest.json'), 'utf8')) as Array<{ id: string; path: string }>
  const entry = manifest.find((s) => s.id === id)
  if (!entry) throw new Error(`Story ${id} missing from manifest`)
  const storyPath = path.resolve(__dirname, '../public', entry.path)
  const data = JSON.parse(readFileSync(storyPath, 'utf8'))
  return { entry, data }
}

test.describe('Reader script handling', () => {
  test('renders script-aware tokens and text', async ({ page }) => {
    const { entry, data } = loadStory('story-a2-transport-001')
    await page.route('**/stories/manifest.json', async (route) => {
      await route.fulfill({ json: [entry] })
    })
    await page.route(`**/*${path.basename(entry.path)}`, async (route) => {
      await route.fulfill({ json: data })
    })

    await page.goto('/')

    const card = {
      id: 'A1-0010',
      trad: '捷運',
      simp: '地铁',
      pinyin: 'jié yùn',
      band: 'A',
      level: 1,
      gloss_en: 'metro',
    }
    await page.evaluate((payload) => {
      window.__STUDYWAN_E2E__?.setCards(payload.cards)
    }, { cards: [card] })

    await page.getByLabel('Level:').selectOption('2')
    await page.getByRole('button', { name: 'Start Reader Pack' }).click()

    const readerText = page.getByTestId('reader-text')
    await expect(readerText).toBeVisible()

    await expect(readerText).toContainText('捷運')
    await expect(readerText).toContainText('計程車')

    await page.getByLabel('Script:').selectOption('simp')
    await expect(readerText).toContainText('地铁')
    await expect(readerText).toContainText('出租车')
    await expect(readerText).not.toContainText('捷運')

    const highlightButton = readerText.getByRole('button').first()
    await highlightButton.click()
    await expect(page.getByText(/出租车|計程車/)).toBeVisible()
  })
})
