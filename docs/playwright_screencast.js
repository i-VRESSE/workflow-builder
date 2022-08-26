// run this with node docs/playwright_screencast.js

const { chromium } = require('playwright');

(async () => {
  // open browser and page
  const browser = await chromium.launch({
    headless: false
  })
  const context = await browser.newContext({
    recordVideo: {
      dir: 'docs/temp',
      size: {
        width: 1600,
        height: 900
      }
    }
  })

  // start trace
  await context.tracing.start({ snapshots: true });

  const page = await context.newPage()
  await page.goto('https://wonderful-noether-53a9e8.netlify.app/');
  //await page.goto('http://localhost:3000/')

  // timeout duration between steps
  var t = 500;
  var t_long = 1500;

  // workflow example steps
  await page.waitForTimeout(t)
  await page.locator('text=docking-protein-ligand').click()
  await page.waitForTimeout(t_long)
  await page.locator('button:has-text("2. rigidbody")').click()
  await page.waitForTimeout(t)
  await page.locator('#expander4sampling svg').click()
  await page.waitForTimeout(t)
  await page.locator('input[type="number"]').click()
  await page.waitForTimeout(t)
  await page.locator('input[type="number"]').fill('2')
  await page.waitForTimeout(t)
  await page.locator('text=Submit').click()
  await page.waitForTimeout(t)
  await page.locator('text=Text').click()
  await page.waitForTimeout(t_long)

  // stop trace
  await context.tracing.stop({ path: 'docs/trace.zip' });

  // close browser
  await context.close()
  await browser.close()
})()
