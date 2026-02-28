const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('Navigating to http://localhost:8080...');
  await page.goto('http://localhost:8080');
  
  console.log('Waiting for boot sequence to auto-complete (up to 10 seconds)...');
  const startTime = Date.now();
  let bootCompleted = false;
  
  try {
    // Wait for the desktop to appear
    await page.waitForSelector('body', { timeout: 10000 });
    
    // Check for boot completion by looking for common desktop elements
    const desktopExists = await page.evaluate(() => {
      const root = document.getElementById('root');
      return root && root.children.length > 0;
    });
    
    if (desktopExists) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`Boot sequence completed in ${elapsed} seconds`);
      bootCompleted = true;
    }
  } catch (e) {
    console.log('Boot sequence did not complete within 10 seconds');
  }
  
  // Take screenshot of boot
  console.log('Taking screenshot of boot screen...');
  await page.screenshot({ path: '/tmp/boot_screen.png' });
  console.log('Boot screenshot saved to /tmp/boot_screen.png');
  
  // If boot completed, try to find and click App Store
  if (bootCompleted) {
    console.log('Boot completed successfully. Looking for App Store in dock...');
    
    try {
      await page.waitForTimeout(1000);
      
      // Get all buttons to find App Store
      const buttons = await page.$$eval('button', buttons => 
        buttons.map(b => ({ text: b.textContent, ariaLabel: b.getAttribute('aria-label'), classes: b.className }))
      );
      
      console.log('Found buttons:', buttons.slice(0, 5));
      
      // Try to find App Store button
      const appStoreButton = await page.$eval('button', button => button.textContent);
      console.log('First button content:', appStoreButton);
      
      // Look for dock container
      const dockInfo = await page.evaluate(() => {
        const dock = document.querySelector('[class*="dock"], [class*="Dock"]');
        if (dock) {
          const buttons = dock.querySelectorAll('button');
          return {
            found: true,
            buttonCount: buttons.length,
            buttons: Array.from(buttons).map(b => b.textContent || b.getAttribute('aria-label'))
          };
        }
        return { found: false };
      });
      
      console.log('Dock info:', dockInfo);
      
      await page.waitForTimeout(2000);
      
      // Take screenshot of current screen
      console.log('Taking screenshot of current screen...');
      await page.screenshot({ path: '/tmp/appstore_screen.png' });
      console.log('Current screenshot saved to /tmp/appstore_screen.png');
    } catch (e) {
      console.log(`Error analyzing page: ${e.message}`);
    }
  }
  
  await browser.close();
  console.log('\nTest complete.');
})();
