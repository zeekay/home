import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  try {
    console.log('Navigating to localhost:8080...');
    await page.goto('http://localhost:8080', { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});
    
    console.log('Waiting for boot sequence to complete...');
    await page.waitForTimeout(8000);
    
    await page.screenshot({ path: 'audit/01-boot-complete.png' });
    console.log('Screenshot: 01-boot-complete.png');
    
    // Try to find Mail in the dock/desktop
    console.log('Looking for Mail app...');
    const mailButton = page.locator('button, [role="button"], div[class*="app"]').filter({ hasText: /Mail/i }).first();
    
    if (await mailButton.isVisible().catch(() => false)) {
      console.log('Found Mail button, clicking...');
      await mailButton.click();
      await page.waitForTimeout(2000);
    } else {
      console.log('Mail button not found via selector');
    }
    
    await page.screenshot({ path: 'audit/02-desktop.png' });
    console.log('Screenshot: 02-desktop.png');
    
    // Get some page info
    const html = await page.content();
    const hasMailWindow = html.includes('mail') || html.includes('Mail');
    console.log(`Page contains mail references: ${hasMailWindow}`);
    
    console.log('Keeping browser open for 120 seconds for inspection...');
    await page.waitForTimeout(120000);
    
  } finally {
    await browser.close();
  }
})();
