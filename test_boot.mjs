import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log('Navigating to http://localhost:8080...');
  await page.goto('http://localhost:8080', { waitUntil: 'domcontentloaded' });

  console.log('Waiting for boot sequence to auto-complete (up to 10 seconds)...');
  const startTime = Date.now();
  let bootCompleted = false;

  try {
    // Wait for the root element to have content (indicates app has loaded)
    await page.waitForFunction(() => {
      const root = document.getElementById('root');
      return root && root.children.length > 0;
    }, { timeout: 10000 });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`Boot sequence completed in ${elapsed} seconds`);
    bootCompleted = true;
  } catch (e) {
    console.log('Boot sequence did not complete within 10 seconds');
    console.log('Error:', e.message);
  }

  // Take screenshot of boot
  console.log('Taking screenshot of boot screen...');
  await page.screenshot({ path: '/tmp/boot_screen.png' });
  console.log('Boot screenshot saved to /tmp/boot_screen.png');

  // Analyze the page structure
  const pageInfo = await page.evaluate(() => {
    const root = document.getElementById('root');
    const buttons = document.querySelectorAll('button');
    const docks = document.querySelectorAll('[class*="dock"], [class*="Dock"]');

    return {
      rootExists: !!root,
      rootHasChildren: root ? root.children.length > 0 : false,
      buttonCount: buttons.length,
      dockCount: docks.length,
      firstFewButtons: Array.from(buttons).slice(0, 5).map(b => ({
        text: b.textContent?.trim(),
        ariaLabel: b.getAttribute('aria-label'),
        classes: b.className
      }))
    };
  });

  console.log('\nPage structure analysis:');
  console.log(JSON.stringify(pageInfo, null, 2));

  // If boot completed, try to find and click App Store
  if (bootCompleted) {
    console.log('\nBoot completed successfully. Looking for App Store in dock...');

    try {
      await page.waitForTimeout(1000);

      // Look for App Store in the dock
      const appStoreFound = await page.evaluate(() => {
        const buttons = document.querySelectorAll('button');
        for (const button of buttons) {
          const text = button.textContent?.toLowerCase() || '';
          const ariaLabel = button.getAttribute('aria-label')?.toLowerCase() || '';
          const title = button.getAttribute('title')?.toLowerCase() || '';

          if (text.includes('app store') || ariaLabel.includes('app store') || title.includes('app store')) {
            return true;
          }
        }
        return false;
      });

      if (appStoreFound) {
        console.log('Found App Store button. Clicking...');
        await page.click('button:has-text("App Store"), button[aria-label*="App Store"]');
        console.log('Clicked App Store');
      } else {
        console.log('App Store button not found in DOM');
      }

      await page.waitForTimeout(2000);

      // Take screenshot
      console.log('Taking screenshot of current screen...');
      await page.screenshot({ path: '/tmp/appstore_screen.png' });
      console.log('Current screenshot saved to /tmp/appstore_screen.png');
    } catch (e) {
      console.log(`Could not interact with App Store: ${e.message}`);

      // Still take a screenshot
      await page.screenshot({ path: '/tmp/appstore_screen.png' });
      console.log('Screenshot taken despite error');
    }
  }

  // Summary
  console.log('\n=== TEST SUMMARY ===');
  console.log(`Boot auto-completed: ${bootCompleted ? 'YES' : 'NO'}`);
  console.log('Screenshots saved to:');
  console.log('  - /tmp/boot_screen.png');
  console.log('  - /tmp/appstore_screen.png');

  await browser.close();
  console.log('\nTest complete.');
})();
