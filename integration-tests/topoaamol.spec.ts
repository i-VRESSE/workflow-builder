import { expect, Page, test } from '@playwright/test'
import AdmZip from 'adm-zip'
import { readFile } from 'fs/promises'

test.describe('given 1 molecule and a topoaa node with segment id defined', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000')
    // Click button:has-text("Global parameters")
    await page.locator('button:has-text("Global parameters")').click()
    // Click input[type="text"]
    await page.locator('input[type="text"]').click()
    // Fill input[type="text"]
    await page.locator('input[type="text"]').fill('x')
    // Upload e2a-hpr_1GGR.pdb
    const file1 = await readFile('./integration-tests/data/e2a-hpr_1GGR.pdb')
    await page.locator('text=Input MoleculesThe input molecules that will be used for docking.* >> input[type="file"]')
      .setInputFiles({ name: 'e2a-hpr_1GGR.pdb', mimeType: 'chemical/x-pdb', buffer: file1 })
    // Click text=Submit
    await page.locator('text=Submit').click()
    // Click text=Cancel
    await page.locator('text=Cancel').click()
    // Click button:has-text("topoaa")
    await page.locator('button:has-text("topoaa")').click()
    // Click #expander4molecule svg
    await page.locator('#expander4molecule svg').click()
    // Click #expander4input_molecules svg
    await page.locator('#expander4input_molecules svg').click()
    // Click div:nth-child(3) > div > div > .card > .card-body
    await page.locator('div:nth-child(3) > div > div > .card > .card-body').click()
    // Click label:has-text("Number of HISD residue")
    await page.locator('label:has-text("Number of HISD residue")').click()
    // Click input[type="text"]
    await page.locator('input[type="text"]').click()
    // Fill input[type="text"]
    await page.locator('input[type="text"]').fill('B')
    // Click text=Submit
    await page.locator('text=Submit').click()
    // Click text=Text
    await page.locator('text=Text').click()
  })

  test('should have "[topoaa.mol1]" header', async ({ page }) => {
    await expectHighlightedCodeToContain(page, '[topoaa.mol1]')
  })

  test.describe('given downloaded archive', () => {
    let path = ''
    test.beforeEach(async ({ page }) => {
      const [download] = await Promise.all([
        // It is important to call waitForEvent before click to set up waiting.
        page.waitForEvent('download'),
        // Triggers the download.
        page.locator('text=Download archive').click()
      ])
      // wait for download to complete
      path = await download.path() ?? ''
      expect(path).not.toBeNull()
    })

    test('archive should contain workflow.cfg with "[topoaa.mol1]" header', () => {
      const archive = new AdmZip(path)
      const tomlstring = archive.readAsText('workflow.cfg')

      expect(tomlstring).toContain('[topoaa.mol1]')
    })

    test.describe('given workflow is cleared and archive is uploaded', () => {
      test.beforeEach(async ({ page }) => {
        // Click text=Clear
        await page.locator('text=Clear').click()
        // Upload workflow archive
        const file1 = await readFile(path)
        await page.locator('text="Upload" >> input[type="file"]')
          .setInputFiles({ name: 'workflow.zip', mimeType: 'application/zip', buffer: file1 })

        await page.waitForSelector('button:has-text("e2a-hpr_1GGR.pdb")')
      })

      test('should have "[topoaa.mol1]" heade', async ({ page }) => {
        await expectHighlightedCodeToContain(page, '[topoaa.mol1]')
      })
    })
  })
})

async function expectHighlightedCodeToContain (page: Page, thing: string): Promise<void> {
  const highlightedCode = await page.locator('#highlightedcode pre')
  const lines = await highlightedCode.allTextContents()
  const content = lines.join('\n')
  expect(content).toContain(thing)
}
