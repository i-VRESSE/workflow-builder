// run this with node docs/playwright_screencast.js

const { chromium } = require('playwright');

(async () => {
  // open browser and page
  const browser = await chromium.launch({
    headless: false
  })
  const context = await browser.newContext({ recordVideo: { dir: 'docs/videos/' } })
  const page = await context.newPage()

  // await page.goto('https://wonderful-noether-53a9e8.netlify.app/');
  await page.goto('http://localhost:3000/')

  // workflow example steps
  await page.locator('text=docking-protein-ligand').click()
  await page.locator('button:has-text("2. rigidbody")').click()
  await page.locator('#expander4sampling svg').click()
  await page.locator('input[type="number"]').click()
  await page.locator('input[type="number"]').fill('2')
  await page.locator('text=Submit').click()
  await page.locator('text=Text').click()

  // close browser
  await context.close()
  await browser.close()
})()
