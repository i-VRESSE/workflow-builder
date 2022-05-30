import { test, expect } from '@playwright/test'

test('sanity test', async ({ page }) => {
  await page.goto('http://localhost:3000')
  const title = page.locator('h1')
  await expect(title).toContainText('workflow builder')
})
