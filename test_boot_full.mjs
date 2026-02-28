import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const viewport = { width: 1440, height: 900 };
  await page.setViewportSize(viewport);

  console.log('Navigating to http://localhost:8080...');
  await page.goto('http://localhost:8080', { waitUntil: 'domcontentloaded' });

  console.log('Waiting for boot sequence to auto-complete (up to 10 seconds, no user input)...');
  const startTime = Date.now();
  let bootCompleted = false;

  try {
    // Wait for the root element to have content
    await page.waitForFunction(() => {
      const root = document.getElementById('root');
      return root && root.children.length > 0;
    }, { timeout: 10000 });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`Root element loaded in ${elapsed} seconds (no user interaction needed)`);
    bootCompleted = true;
  } catch (e) {
    console.log('Boot sequence did not complete within 10 seconds');
  }

  // Take screenshot showing boot sequence
  console.log('Taking screenshot of boot sequence...');
  await page.screenshot({ path: '/tmp/boot_sequence.png' });
  console.log('Boot screenshot saved to /tmp/boot_sequence.png');

  // Wait for desktop to fully render
  console.log('\nWaiting for desktop UI to fully render...');
  await page.waitForTimeout(2000);

  // Take another screenshot to see desktop
  console.log('Taking screenshot of rendered desktop...');
  await page.screenshot({ path: '/tmp/desktop_full.png' });
  console.log('Desktop screenshot saved to /tmp/desktop_full.png');

  // Analyze page structure
  const pageInfo = await page.evaluate(() => {
    const root = document.getElementById('root');
    const buttons = document.querySelectorAll('button');
    const allElements = document.querySelectorAll('*');

    const buttonInfo = Array.from(buttons).map(b => ({
      text: b.textContent?.trim().substring(0, 50),
      ariaLabel: b.getAttribute('aria-label'),
      dataTestId: b.getAttribute('data-testid'),
      title: b.getAttribute('title'),
      classes: b.className.substring(0, 100)
    }));

    return {
      rootExists: !!root,
      totalElements: allElements.length,
      buttonCount: buttons.length,
      buttons: buttonInfo.slice(0, 15)
    };
  });

  console.log('\nPage structure (first 15 buttons):');
  console.log(JSON.stringify(pageInfo, null, 2));

  // Try to find and click App Store
  console.log('\n=== Looking for App Store ===');
  const appStoreInfo = await page.evaluate(() => {
    const buttons = document.querySelectorAll('button');
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      const text = button.textContent?.toLowerCase() || '';
      const ariaLabel = button.getAttribute('aria-label')?.toLowerCase() || '';
      const dataAppId = button.getAttribute('data-app-id')?.toLowerCase() || '';

      if (
        text.includes('app') ||
        ariaLabel.includes('app') ||
        dataAppId.includes('app')
      ) {
        return {
          found: true,
          index: i,
          text: button.textContent?.trim(),
          ariaLabel: button.getAttribute('aria-label'),
          dataAppId: button.getAttribute('data-app-id')
        };
      }
    }
    return { found: false };
  });

  console.log('App Store search result:', JSON.stringify(appStoreInfo, null, 2));

  if (appStoreInfo.found) {
    console.log(`Found App Store! Clicking button at index ${appStoreInfo.index}...`);
    const buttons = await page.$$('button');
    await buttons[appStoreInfo.index].click();
    console.log('Clicked App Store');

    await page.waitForTimeout(2000);

    // Take screenshot of App Store window
    console.log('Taking screenshot of App Store window...');
    await page.screenshot({ path: '/tmp/appstore_window.png' });
    console.log('App Store screenshot saved to /tmp/appstore_window.png');
  } else {
    console.log('App Store not found in buttons. Taking screenshot of current state...');
    await page.screenshot({ path: '/tmp/appstore_window.png' });
  }

  // Final summary
  console.log('\n=== TEST SUMMARY ===');
  console.log(`Boot auto-completed (no click needed): ${bootCompleted ? 'YES' : 'NO'}`);
  console.log(`App Store found and clickable: ${appStoreInfo.found ? 'YES' : 'NO'}`);
  console.log('\nScreenshots captured:');
  console.log('  1. /tmp/boot_sequence.png - Boot sequence with terminal and progress bar');
  console.log('  2. /tmp/desktop_full.png - Full rendered desktop');
  console.log('  3. /tmp/appstore_window.png - App Store window (if opened)');

  await browser.close();
  console.log('\nTest complete.');
})();
