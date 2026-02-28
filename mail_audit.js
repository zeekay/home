const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  console.log('Navigating to localhost:8080...');
  await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
  
  // Wait for boot to complete
  console.log('Waiting for boot sequence to complete...');
  await page.waitForTimeout(8000);
  
  // Take boot complete screenshot
  await page.screenshot({ path: 'audit/01-boot-complete.png' });
  console.log('Screenshot: 01-boot-complete.png');
  
  // Look for dock/applications and click Mail
  console.log('Attempting to find and launch Mail app...');
  
  // Try different selectors for Mail
  const mailSelectors = [
    'text=/Mail/i',
    '[aria-label*="Mail"]',
    'button:has-text("Mail")',
  ];
  
  let mailFound = false;
  for (const selector of mailSelectors) {
    const element = page.locator(selector).first();
    if (await element.isVisible().catch(() => false)) {
      console.log(`Found Mail with selector: ${selector}`);
      await element.click();
      mailFound = true;
      await page.waitForTimeout(2000);
      break;
    }
  }
  
  if (!mailFound) {
    console.log('Mail not found in dock, checking desktop...');
  }
  
  await page.screenshot({ path: 'audit/02-desktop-view.png' });
  console.log('Screenshot: 02-desktop-view.png');
  
  // Get page content info
  const title = await page.title();
  console.log(`Page title: ${title}`);
  
  // Check for window manager/open windows
  const windows = await page.locator('[class*="window"], [class*="Window"], [data-window]').count();
  console.log(`Found ${windows} window elements`);
  
  // Wait to allow manual interaction
  console.log('Browser open - allowing 60 seconds for interaction...');
  await page.waitForTimeout(60000);
  
  await browser.close();
})();
