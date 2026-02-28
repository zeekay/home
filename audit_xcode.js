const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.createContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  
  try {
    // Navigate to localhost
    await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
    console.log('✓ App loaded');
    
    // Wait for boot sequence to complete (about 8 seconds)
    console.log('⏳ Waiting for boot sequence...');
    await page.waitForTimeout(8000);
    
    // Take initial screenshot
    await page.screenshot({ path: '/tmp/01_desktop.png' });
    console.log('✓ Screenshot 1: Full Desktop');
    
    // Look for Xcode window or launcher
    const allButtons = await page.locator('button').count();
    console.log(`Found ${allButtons} total buttons on page`);
    
    // Try to find and click Xcode
    const xcodeDockIcon = await page.locator('[class*="dock" i] button:has-text("Xcode"), button[title*="Xcode" i], [data-app="xcode"]').first();
    if (await xcodeDockIcon.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('✓ Found Xcode in dock');
      await xcodeDockIcon.click();
    } else {
      // Try alternative selectors
      const buttons = await page.locator('button').all();
      for (const btn of buttons) {
        const text = await btn.textContent();
        if (text && text.toLowerCase().includes('xcode')) {
          console.log('✓ Found Xcode button, clicking...');
          await btn.click();
          break;
        }
      }
    }
    
    await page.waitForTimeout(2000);
    await page.screenshot({ path: '/tmp/02_after_click.png' });
    console.log('✓ Screenshot 2: After interaction');
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await page.close();
    await context.close();
    await browser.close();
  }
})();
