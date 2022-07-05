import { test, expect } from '@playwright/test'

test('Verify that [object Object] bug does not show up (issue #74)', async ({ page }) => {
  await page.goto('http://localhost:3000')

  // Load the example
  await page.locator('text=docking-protein-ligand').click();

  // Click 'text' and ensure the files appear
  await page.locator('text=Text').click();
  await page.waitForSelector('button:has-text("data/target.pdb")');

  // verify that the [object Object] text does not show up
  // see https://github.com/i-VRESSE/workflow-builder/issues/74
  const highlightedCode = await page.locator('#highlightedcode pre');
  await expect(highlightedCode).not.toContainText('[object Object]')

})
