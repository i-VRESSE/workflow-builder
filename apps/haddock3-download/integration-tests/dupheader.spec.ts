import { expect, test } from '@playwright/test'
import AdmZip from 'adm-zip'
import dedent from 'ts-dedent'

test.describe('given an uploaded archive with a workflow.cfg file with a duplicated header', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000')

    const archive = new AdmZip()
    archive.addFile('some.pdb', Buffer.from('some dummy pdb content', 'utf8'))
    archive.addFile('workflow.cfg', Buffer.from(dedent`
            run_dir = 'run1'

            molecules = [
              'some.pdb'
            ]

            [caprieval]

            [caprieval]
        `, 'utf8'))

    // Upload workflow archive
    await page.locator('text="Upload" >> input[type="file"]')
      .setInputFiles({ name: 'workflow.zip', mimeType: 'application/zip', buffer: archive.toBuffer() })
  })

  test('it should show uplaoded file', async ({ page }) => {
    // Click Files tab
    await page.locator('text=Files').click()
    // validate file button is present
    await page.waitForSelector('button:has-text("some.pdb")')
  })

  test('should have both headers and added index number', async ({ page }) => {
    // Click Text tab
    await page.locator('text=Text').click()
    // debug
    // await page.pause()

    const highlightedCode = await page.locator('#highlightedcode pre')
    const lines = await highlightedCode.allTextContents()
    const content = lines.join('\n')
    const expected = dedent`
      1
      2molecules = [
      3  'some.pdb',
      4]
      5
      6run_dir = 'run1'
      7
      8[caprieval]
      9
      10['caprieval.2']
      11

    `
    expect(content).toEqual(expected)
  })
})
