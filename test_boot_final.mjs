import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const viewport = { width: 1440, height: 900 };
  await page.setViewportSize(viewport);

  console.log('=== BOOT SEQUENCE TEST ===\n');
  console.log('Step 1: Navigating to http://localhost:8080...');
  await page.goto('http://localhost:8080', { waitUntil: 'domcontentloaded' });

  console.log('Step 2: Taking screenshot of initial boot screen...');
  await page.screenshot({ path: '/tmp/boot_initial.png' });
  console.log('Initial boot screenshot saved');

  console.log('\nStep 3: Waiting for boot sequence to auto-complete (max 15 seconds, no user clicks)...');
  const startTime = Date.now();
  let bootCompleted = false;

  try {
    // Wait for boot completion - look for desktop elements instead
    // The boot sequence likely prevents rendering until complete
    await page.waitForFunction(() => {
      const root = document.getElementById('root');
      if (!root) return false;

      // Check if we've moved past boot sequence
      // Boot likely complete when we see more complex UI structures
      const allDivs = root.querySelectorAll('div');
      return allDivs.length > 50; // Desktop UI has many more elements
    }, { timeout: 15000 });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`Boot auto-completed in ${elapsed} seconds (no user interaction)`);
    bootCompleted = true;
  } catch (e) {
    console.log('Boot sequence did not complete within 15 seconds');
    console.log('Continuing anyway to see current state...');
  }

  // Take screenshot of boot in progress
  console.log('\nStep 4: Taking screenshot of current state...');
  await page.screenshot({ path: '/tmp/boot_progress.png' });
  console.log('Progress screenshot saved');

  // Wait a bit more and check again
  console.log('\nStep 5: Waiting additional 3 seconds for UI to settle...');
  await page.waitForTimeout(3000);

  console.log('Step 6: Taking screenshot of desktop...');
  await page.screenshot({ path: '/tmp/boot_desktop.png' });
  console.log('Desktop screenshot saved');

  // Analyze what's on the screen
  const pageInfo = await page.evaluate(() => {
    const root = document.getElementById('root');
    const allElements = root ? root.querySelectorAll('*') : [];

    return {
      rootExists: !!root,
      elementCount: allElements.length,
      bodyClasses: document.body.className,
      rootClasses: root ? root.className : 'N/A'
    };
  });

  console.log('\nPage structure info:');
  console.log(JSON.stringify(pageInfo, null, 2));

  // Try clicking on dock area to find App Store
  console.log('\nStep 7: Looking for interactive elements (dock buttons)...');

  const dockElements = await page.evaluate(() => {
    const root = document.getElementById('root');
    const allButtons = root ? root.querySelectorAll('button, [role="button"], [tabindex="0"]') : [];

    return {
      buttonCount: allButtons.length,
      elements: Array.from(allButtons).map((el, i) => ({
        index: i,
        tag: el.tagName,
        text: el.textContent?.trim().substring(0, 30),
        ariaLabel: el.getAttribute('aria-label'),
        dataTestId: el.getAttribute('data-testid'),
        role: el.getAttribute('role'),
        visible: el.offsetHeight > 0 && el.offsetWidth > 0
      })).slice(0, 20)
    };
  });

  console.log('\nFound interactive elements:');
  console.log(JSON.stringify(dockElements, null, 2));

  // Try to find App Store
  console.log('\nStep 8: Searching for App Store...');
  const appStoreIndex = await page.evaluate(() => {
    const root = document.getElementById('root');
    const allButtons = root ? root.querySelectorAll('button, [role="button"]') : [];

    for (let i = 0; i < allButtons.length; i++) {
      const el = allButtons[i];
      const text = (el.textContent || '').toLowerCase();
      const ariaLabel = (el.getAttribute('aria-label') || '').toLowerCase();

      if (text.includes('app store') || ariaLabel.includes('app store')) {
        return i;
      }
    }
    return -1;
  });

  let appStoreOpened = false;
  if (appStoreIndex >= 0) {
    console.log(`App Store found at index ${appStoreIndex}. Clicking...`);
    try {
      const allButtons = await page.$$('button, [role="button"]');
      if (allButtons[appStoreIndex]) {
        await allButtons[appStoreIndex].click();
        console.log('Successfully clicked App Store');
        appStoreOpened = true;

        await page.waitForTimeout(2000);
        console.log('Taking screenshot of App Store window...');
        await page.screenshot({ path: '/tmp/appstore_opened.png' });
      }
    } catch (e) {
      console.log(`Error clicking App Store: ${e.message}`);
    }
  } else {
    console.log('App Store button not found in DOM');
  }

  // Final summary
  console.log('\n=== TEST RESULTS ===');
  console.log(`Boot auto-completed: ${bootCompleted ? 'YES ✓' : 'UNCLEAR - see screenshots'}`);
  console.log(`Desktop rendered: ${pageInfo.elementCount > 50 ? 'YES ✓' : 'PARTIAL - still rendering'}`);
  console.log(`App Store found and clicked: ${appStoreOpened ? 'YES ✓' : 'NOT FOUND'}`);
  console.log(`\nScreenshots saved:`);
  console.log('  1. /tmp/boot_initial.png - Initial page load');
  console.log('  2. /tmp/boot_progress.png - Boot sequence in progress');
  console.log('  3. /tmp/boot_desktop.png - Desktop after waiting');
  if (appStoreOpened) {
    console.log('  4. /tmp/appstore_opened.png - App Store window');
  }

  await browser.close();
})();
