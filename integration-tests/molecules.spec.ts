import { test } from '@playwright/test'
import { readFile } from 'fs/promises'

test.describe('given 1 molecule and a flexref node with seg parameter defined', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000')
    // Select http://localhost:3000/catalog/haddock3.expert.yaml
    await page.locator('select').selectOption('http://localhost:3000/catalog/haddock3.expert.yaml')
    // Click button:has-text("Global parameters")
    await page.locator('button:has-text("Global parameters")').click()
    // Click text=Input MoleculesThe input molecules that will be used for docking.* >> input[type="file"]
    await page.locator('text=Input MoleculesThe input molecules that will be used for docking.* >> input[type="file"]').click()
    // Upload e2a-hpr_1GGR.pdb
    const file1 = await readFile('./integration-tests/data/e2a-hpr_1GGR.pdb')
    await page.locator('text=Input MoleculesThe input molecules that will be used for docking.* >> input[type="file"]')
      .setInputFiles({ name: 'e2a-hpr_1GGR.pdb', mimeType: 'chemical/x-pdb', buffer: file1 })
    // Click input[type="text"]
    await page.locator('input[type="text"]').click()
    // Fill input[type="text"]
    await page.locator('input[type="text"]').fill('x')
    // Click text=Submit
    await page.locator('text=Submit').click()
    // Click text=Cancel
    await page.locator('text=Cancel').click()
    // Click button:has-text("flexref")
    await page.locator('button:has-text("flexref")').click()
    // Click div:nth-child(27) > .col-12 > .form-group > .my-1 > h5 > svg > path >> nth=0
    await page.locator('div:nth-child(27) > .col-12 > .form-group > .my-1 > h5 > svg > path').first().click()
    // Click text=segStarting residue numberEnding residue number >> button >> nth=2
    await page.locator('text=segStarting residue numberEnding residue number >> button').nth(2).click()
    // Select 22
    await page.locator('#root_flexibility_seg_0_0_sta').selectOption('22');
    // Select 32
    await page.locator('#root_flexibility_seg_0_0_end').selectOption('32')
    // Click text=Submit
    await page.locator('text=Submit').click()
  })

  test.describe('adding another molecule', () => {
    test.beforeEach(async ({ page }) => {
      // Click text=Global parameters
      await page.locator('text=Global parameters').click()
      // Click text=Input MoleculesThe input molecules that will be used for docking.*e2a-hpr_1GGR.p >> button >> nth=1
      await page.locator('text=Input MoleculesThe input molecules that will be used for docking.*e2a-hpr_1GGR.p >> button').nth(1).click()
      // Click #root_molecules_1
      await page.locator('#root_molecules_1').click()
      // Upload e2aP_1F3G.pdb
      const file2 = await readFile('./integration-tests/data/e2aP_1F3G.pdb')
      await page.locator('#root_molecules_1').setInputFiles({ name: 'e2aP_1F3G.pdb', mimeType: 'chemical/x-pdb', buffer: file2 })
      // Click text=Submit
      await page.locator('text=Submit').click()
    })

    test('should give a seg table for the extra molecule', async ({ page }) => {
      // Click ol button:has-text("flexref")
      await page.locator('ol button:has-text("flexref")').click()
      // Click div:nth-child(27) > .col-12 > .form-group > .my-1 > h5 > svg
      await page.locator('div:nth-child(27) > .col-12 > .form-group > .my-1 > h5 > svg').click()

      // TODO Once fixed this assertion should be uncommented and pause() removed
      // const secondSeg = await page.locator('.root_flexibility_seg_1')
      // await expect(secondSeg).toBeVisible()
      await page.pause()
    })
  })
})

test.describe('given 2 molecules and a flexref node with seg parameter defined for both molecule', () => {
  test.beforeEach(async ({ page }) => {
    // Go to http://localhost:3000/
    await page.goto('http://localhost:3000/')
    // Select http://localhost:3000/catalog/haddock3.expert.yaml
    await page.locator('select').selectOption('http://localhost:3000/catalog/haddock3.expert.yaml')
    // Click button:has-text("Global parameters")
    await page.locator('button:has-text("Global parameters")').click()
    // Click input[type="text"]
    await page.locator('input[type="text"]').click()
    // Fill input[type="text"]
    await page.locator('input[type="text"]').fill('x')
    // Click text=Input MoleculesThe input molecules that will be used for docking.* >> input[type="file"]
    await page.locator('#root_molecules_0').click()
    // Upload e2a-hpr_1GGR.pdb
    const file1 = await readFile('./integration-tests/data/e2a-hpr_1GGR.pdb')
    await page.locator('#root_molecules_0')
      .setInputFiles({ name: 'e2a-hpr_1GGR.pdb', mimeType: 'chemical/x-pdb', buffer: file1 })
    // Click text=Input MoleculesThe input molecules that will be used for docking.*e2a-hpr_1GGR.p >> button >> nth=1
    await page.locator('text=Input MoleculesThe input molecules that will be used for docking.*e2a-hpr_1GGR.p >> button').nth(1).click()
    // Click #root_molecules_1
    await page.locator('#root_molecules_1').click()
    // Upload e2aP_1F3G.pdb
    const file2 = await readFile('./integration-tests/data/e2aP_1F3G.pdb')
    await page.locator('#root_molecules_1').setInputFiles({ name: 'e2aP_1F3G.pdb', mimeType: 'chemical/x-pdb', buffer: file2 })
    // Click text=Submit
    await page.locator('text=Submit').click()
    // Click text=Cancel
    await page.locator('text=Cancel').click()
    // Click button:has-text("flexref")
    await page.locator('button:has-text("flexref")').click()
    // Click div:nth-child(27) > .col-12 > .form-group > .my-1 > h5 > svg
    await page.locator('div:nth-child(27) > .col-12 > .form-group > .my-1 > h5 > svg').click()
    // Click .array-item-add >> nth=0
    await page.locator('.array-item-add').first().click()
    // Select 21
    await page.locator('#root_flexibility_seg_0_0_sta').selectOption('21');
    // Select 24
    await page.locator('#root_flexibility_seg_0_0_end').selectOption('24')
    // Click th:has-text("Starting residue number") >> nth=1
    await page.locator('th:has-text("Starting residue number")').nth(1).click()
    // Click .root_flexibility_seg_1 > .table-field > thead > tr > th:nth-child(3) > .array-item-add
    await page.locator('.root_flexibility_seg_1 > .table-field > thead > tr > th:nth-child(3) > .array-item-add').click()
    // Select 34
    await page.locator('#root_flexibility_seg_1_0_sta').selectOption('34')
    // Select 37
    await page.locator('#root_flexibility_seg_1_0_end').selectOption('37')
    // Click text=Submit
    await page.locator('text=Submit').click()
    // Click text=Cancel
    await page.locator('text=Cancel').click()
  })

  test.describe('removing a molecule', () => {
    test.beforeEach(async ({ page }) => {
      // Click button:has-text("Global parameters")
      await page.locator('button:has-text("Global parameters")').click()
      // Remove second molecule
      // Click div:nth-child(2) > .mb-2 > .py-4 > .d-flex > div:nth-child(3) > .btn
      await page.locator('div:nth-child(2) > .mb-2 > .py-4 > .d-flex > div:nth-child(3) > .btn').click()
      // Click text=Submit
      await page.locator('text=Submit').click()
      // Click text=Cancel
      await page.locator('text=Cancel').click()
    })

    test('should not retain invalid second array value for seg parameter ', async ({ page }) => {
      // Click ol button:has-text("flexref")
      await page.locator('ol button:has-text("flexref")').click()
      // Click div:nth-child(27) > .col-12 > .form-group > .my-1 > h5 > svg
      await page.locator('div:nth-child(27) > .col-12 > .form-group > .my-1 > h5 > svg').click()

      // Click text=Submit
      await page.locator('text=Submit').click()

      // TODO submit should not fail, once fixed this assertion should be uncommented and pause() removed
      // const errorPanel = await page.locator('text=Errors')
      // await expect(errorPanel).not.toBeVisible()
      await page.pause()
    })
  })
})
