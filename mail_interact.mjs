import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.connect({ wsEndpoint: process.env.WS_ENDPOINT || undefined });
  const pages = await browser.pages();
  const page = pages[0] || await browser.newPage();
  
  console.log('Analyzing current page...');
  
  // Check what's visible
  const buttons = await page.locator('button').all();
  console.log(`Found ${buttons.length} buttons on page`);
  
  // Take a screenshot
  await page.screenshot({ path: 'audit/03-current-state.png', fullPage: true });
  console.log('Screenshot saved: 03-current-state.png');
  
  // Look for Mail window or app
  const allText = await page.locator('body').textContent();
  if (allText.includes('Mail')) {
    console.log('Mail text found on page');
  }
  
  await browser.disconnect();
})();
