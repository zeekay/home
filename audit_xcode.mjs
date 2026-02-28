import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.createContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  
  try {
    // Navigate to localhost
    await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
    console.log('✓ App loaded');
    
    // Wait for boot sequence
    console.log('⏳ Waiting for boot sequence...');
    await page.waitForTimeout(8000);
    
    // Take initial screenshot
    await page.screenshot({ path: '/tmp/01_desktop.png' });
    console.log('✓ Screenshot 1: Full Desktop');
    
    // Find Xcode button and click
    const buttons = await page.locator('button').all();
    let xcodeFoun = false;
    for (const btn of buttons) {
      const text = await btn.textContent();
      if (text && text.toLowerCase().includes('xcode')) {
        console.log('✓ Found Xcode button');
        await btn.click();
        xcodeFoun = true;
        break;
      }
    }
    
    if (!xcodeFoun) {
      console.log('⚠ Xcode not found in buttons, checking for window...');
    }
    
    await page.waitForTimeout(2000);
    await page.screenshot({ path: '/tmp/02_xcode_window.png' });
    console.log('✓ Screenshot 2: Xcode window');
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await page.close();
    await context.close();
    await browser.close();
  }
})();
