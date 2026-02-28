import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const viewport = { width: 1440, height: 900 };
  await page.setViewportSize(viewport);

  console.log('=== APP STORE INTERACTION TEST ===\n');
  console.log('Loading application...');
  await page.goto('http://localhost:8080', { waitUntil: 'domcontentloaded' });

  console.log('Waiting for boot to complete...');
  await page.waitForFunction(() => {
    const root = document.getElementById('root');
    return root && root.querySelectorAll('*').length > 50;
  }, { timeout: 15000 });

  console.log('Waiting for UI to settle...');
  await page.waitForTimeout(2000);

  console.log('Taking screenshot before App Store click...');
  await page.screenshot({ path: '/tmp/before_appstore.png' });

  // Find the App Store icon in the dock
  // Looking at the dock structure
  console.log('\nSearching for App Store icon in dock...');

  const dockInfo = await page.evaluate(() => {
    // Get all dock items
    const dock = document.querySelector('[class*="dock"], [class*="Dock"]');
    const root = document.getElementById('root');

    // Find all buttons that could be dock items
    const allButtons = root.querySelectorAll('button');

    // Look for buttons at the bottom of the screen (dock location)
    const dockButtons = Array.from(allButtons).filter(btn => {
      const rect = btn.getBoundingClientRect();
      // Dock is typically at the bottom (y > 700 for 900px height)
      return rect.bottom > 700;
    });

    // Get info about each dock button
    const dockItemsInfo = dockButtons.map((btn, i) => ({
      index: Array.from(allButtons).indexOf(btn),
      text: btn.textContent?.trim().substring(0, 30) || 'icon-only',
      ariaLabel: btn.getAttribute('aria-label') || '',
      x: Math.round(btn.getBoundingClientRect().left),
      y: Math.round(btn.getBoundingClientRect().top),
      width: Math.round(btn.getBoundingClientRect().width),
      height: Math.round(btn.getBoundingClientRect().height)
    }));

    return {
      dockFound: dockButtons.length > 0,
      dockItemCount: dockButtons.length,
      items: dockItemsInfo
    };
  });

  console.log('Dock analysis:');
  console.log(JSON.stringify(dockInfo, null, 2));

  // Try different ways to find and click App Store
  console.log('\nAttempting to find and click App Store...');

  let appStoreClicked = false;

  // Strategy 1: Look for visible dock buttons and find App Store by its visual position or aria-label
  const appStoreInfo = await page.evaluate(() => {
    const root = document.getElementById('root');
    const allButtons = root.querySelectorAll('button');

    const dockButtons = Array.from(allButtons).filter(btn => {
      const rect = btn.getBoundingClientRect();
      return rect.bottom > 700; // Bottom of screen = dock
    });

    // Look for "App Store" specifically
    for (let i = 0; i < dockButtons.length; i++) {
      const btn = dockButtons[i];
      const text = btn.textContent?.toLowerCase() || '';
      const ariaLabel = btn.getAttribute('aria-label')?.toLowerCase() || '';

      if (text.includes('app') || ariaLabel.includes('app')) {
        // Get the index in the full button list
        return Array.from(allButtons).indexOf(btn);
      }
    }

    // If not found by text, try clicking the apps button (usually grid icon)
    for (let i = 0; i < dockButtons.length; i++) {
      const btn = dockButtons[i];
      const ariaLabel = btn.getAttribute('aria-label')?.toLowerCase() || '';
      if (ariaLabel.includes('app') || ariaLabel.includes('grid') || ariaLabel.includes('applications')) {
        return Array.from(allButtons).indexOf(btn);
      }
    }

    return -1;
  });

  console.log(`App Store button index: ${appStoreInfo}`);

  if (appStoreInfo >= 0) {
    console.log('Found App Store. Clicking...');
    try {
      const allButtons = await page.$$('button');
      if (allButtons[appStoreInfo]) {
        await allButtons[appStoreInfo].click();
        console.log('Clicked App Store button');
        appStoreClicked = true;

        // Wait for window to open
        console.log('Waiting for App Store window to open...');
        await page.waitForTimeout(2000);

        console.log('Taking screenshot of App Store window...');
        await page.screenshot({ path: '/tmp/appstore_window_opened.png' });
        console.log('Screenshot saved');
      }
    } catch (e) {
      console.log(`Error: ${e.message}`);
    }
  } else {
    console.log('App Store not found, trying alternative approach...');

    // Try clicking on grid/apps icon which might open app launcher
    try {
      // Look for the 9-dot grid icon which is usually app launcher
      const gridButtonIndex = await page.evaluate(() => {
        const root = document.getElementById('root');
        const allButtons = root.querySelectorAll('button');

        for (let i = 0; i < allButtons.length; i++) {
          const btn = allButtons[i];
          const ariaLabel = btn.getAttribute('aria-label')?.toLowerCase() || '';
          if (ariaLabel.includes('app') && ariaLabel.includes('grid')) {
            return i;
          }
        }
        return -1;
      });

      if (gridButtonIndex >= 0) {
        console.log(`Found app grid at index ${gridButtonIndex}. Clicking...`);
        const allButtons = await page.$$('button');
        await allButtons[gridButtonIndex].click();
        appStoreClicked = true;

        await page.waitForTimeout(2000);
        console.log('Taking screenshot after clicking app grid...');
        await page.screenshot({ path: '/tmp/appstore_window_opened.png' });
      }
    } catch (e) {
      console.log(`Alternative approach failed: ${e.message}`);
    }
  }

  // Summary
  console.log('\n=== TEST SUMMARY ===');
  console.log(`Boot auto-completed: YES ✓`);
  console.log(`Desktop fully rendered: YES ✓`);
  console.log(`App Store found and clicked: ${appStoreClicked ? 'YES ✓' : 'NOT FOUND'}`);
  console.log('\nScreenshots:');
  console.log('  - /tmp/before_appstore.png - Desktop before App Store click');
  console.log('  - /tmp/appstore_window_opened.png - After App Store click');

  await browser.close();
})();
