import { test, expect } from '@playwright/test';
import { readFile } from 'fs/promises';

test('sanity test', async ({ page }) => {
  await page.goto('http://localhost:3000');
  const title = page.locator('h1');
  await expect(title).toContainText('workflow builder');
});

test('start with one molecule, add flexref settings, then go back and add another molecule, there is no extra array item for seg', async ({ page }) => {
  await page.goto('http://localhost:3000');
  // Select http://localhost:3000/catalog/haddock3.expert.yaml
  await page.locator('select').selectOption('http://localhost:3000/catalog/haddock3.expert.yaml');
  // Click button:has-text("Global parameters")
  await page.locator('button:has-text("Global parameters")').click();
  // Click text=Input MoleculesThe input molecules that will be used for docking.* >> input[type="file"]
  await page.locator('text=Input MoleculesThe input molecules that will be used for docking.* >> input[type="file"]').click();
  // Upload e2a-hpr_1GGR.pdb
  const file1 = await readFile('./integration-tests/data/e2a-hpr_1GGR.pdb')
  await page.locator('text=Input MoleculesThe input molecules that will be used for docking.* >> input[type="file"]')
    .setInputFiles({name: 'e2a-hpr_1GGR.pdb', mimeType: 'chemical/x-pdb', buffer: file1});
  // Click input[type="text"]
  await page.locator('input[type="text"]').click();
  // Fill input[type="text"]
  await page.locator('input[type="text"]').fill('x');
  // Click text=Submit
  await page.locator('text=Submit').click();
  // Click text=Cancel
  await page.locator('text=Cancel').click();
  // Click button:has-text("flexref")
  await page.locator('button:has-text("flexref")').click();
  // Click div:nth-child(27) > .col-12 > .form-group > .my-1 > h5 > svg > path >> nth=0
  await page.locator('div:nth-child(27) > .col-12 > .form-group > .my-1 > h5 > svg > path').first().click();
  // Click text=segStarting residue numberEnding residue number >> button >> nth=2
  await page.locator('text=segStarting residue numberEnding residue number >> button').nth(2).click();
  // Select 22
  await page.locator('text=Starting residue number192021222324252627282930313233343536373839404142434445464 >> select').selectOption('22');
  // Select 32
  await page.locator('text=Ending residue number19202122232425262728293031323334353637383940414243444546474 >> select').selectOption('32');
  // Click text=Submit
  await page.locator('text=Submit').click();
  // Click text=Global parameters
  await page.locator('text=Global parameters').click();
  // Click text=Input MoleculesThe input molecules that will be used for docking.*e2a-hpr_1GGR.p >> button >> nth=1
  await page.locator('text=Input MoleculesThe input molecules that will be used for docking.*e2a-hpr_1GGR.p >> button').nth(1).click();
  // Click #root_molecules_1
  await page.locator('#root_molecules_1').click();
  // Upload e2aP_1F3G.pdb
  const file2 = await readFile('./integration-tests/data/e2aP_1F3G.pdb')
  await page.locator('#root_molecules_1').setInputFiles({name: 'e2aP_1F3G.pdb', mimeType: 'chemical/x-pdb', buffer: file2});
  // Click text=Submit
  await page.locator('text=Submit').click();
  // Click ol button:has-text("flexref")
  await page.locator('ol button:has-text("flexref")').click();
  // Click div:nth-child(27) > .col-12 > .form-group > .my-1 > h5 > svg
  await page.locator('div:nth-child(27) > .col-12 > .form-group > .my-1 > h5 > svg').click();

  await page.pause()

  expect('TODO', 'Seg parameter should have 2 tables').toBeTruthy()
});