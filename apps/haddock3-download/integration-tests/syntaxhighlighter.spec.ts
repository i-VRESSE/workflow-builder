import { test, expect } from '@playwright/test'

test('Verify that [object Object] bug does not show up (issue #74)', async ({ page }) => {
  await page.goto('http://localhost:3000')

  // debugger
  // await page.pause()

  // Load the example
  await page.locator('text=docking-protein-ligand').click()

  // validate that file is used
  await page.locator('text=Files').click()
  await page.waitForSelector('button:has-text("data/target.pdb")')

  // change to 'text' tab
  await page.locator('text=Text').click()

  // verify that the [object Object] text does not show up
  // see https://github.com/i-VRESSE/workflow-builder/issues/74
  const highlightedCode = await page.locator('#highlightedcode pre')
  await expect(highlightedCode).not.toContainText('[object Object]')
})
