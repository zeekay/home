import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({
    headless: false,
    args: ['--disable-blink-features=AutomationControlled']
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  try {
    console.log('=== MAIL APP COMPREHENSIVE AUDIT ===\n');

    // Step 1: Navigate and boot
    console.log('[1] Navigating to http://localhost:8080...');
    await page.goto('http://localhost:8080', { waitUntil: 'domcontentloaded' }).catch(e => console.log('Nav error (expected):', e.message));

    console.log('[2] Waiting for boot sequence (8 seconds)...');
    await page.waitForTimeout(8000);

    await page.screenshot({ path: 'audit/01-boot-complete.png', fullPage: true });
    console.log('   Screenshot saved: 01-boot-complete.png\n');

    // Step 2: Find and open Mail
    console.log('[3] Searching for Mail app...');

    // List all visible text on page
    const bodyText = await page.locator('body').textContent();
    const hasMail = bodyText.includes('Mail');
    console.log(`   Mail mentioned on page: ${hasMail}`);

    // Find clickable elements with Mail text
    const mailElements = await page.locator('text=/Mail/i').all();
    console.log(`   Found ${mailElements.length} elements with "Mail" text`);

    // Try to find and click a clickable Mail button/icon
    const clickableMailElement = page.locator('[role="button"], button, [class*="app"], div[class*="icon"]').filter({ hasText: /Mail/i }).first();

    if (await clickableMailElement.isVisible().catch(() => false)) {
      console.log('[4] Clicking Mail app...');
      await clickableMailElement.click();
      await page.waitForTimeout(2000);
    } else {
      console.log('[4] Mail app not found as clickable element\n');
    }

    await page.screenshot({ path: 'audit/02-mail-launch-attempt.png', fullPage: true });
    console.log('   Screenshot saved: 02-mail-launch-attempt.png\n');

    // Step 3: Check for Mail window
    console.log('[5] Checking for Mail window elements...');
    const windowElements = await page.locator('[class*="window"], [class*="Window"], [data-window-id]').all();
    console.log(`   Found ${windowElements.length} window elements`);

    // Look for Mail-specific elements
    const mailCompose = await page.locator('text=/Compose|New Message/i, [aria-label*="compose" i]').all();
    console.log(`   Found ${mailCompose.length} compose-related elements`);

    const mailbox = await page.locator('text=/Inbox|Drafts|Sent|Trash/i').all();
    console.log(`   Found ${mailbox.length} mailbox-related elements\n`);

    // Step 4: Check HTML structure
    console.log('[6] Analyzing DOM structure...');
    const html = await page.content();
    console.log(`   Page HTML length: ${html.length} characters`);
    console.log(`   Contains "Mail": ${html.includes('Mail')}`);
    console.log(`   Contains "Inbox": ${html.includes('Inbox')}`);
    console.log(`   Contains "Compose": ${html.includes('Compose')}`);
    console.log(`   Contains "ZMailWindow": ${html.includes('ZMailWindow')}`);
    console.log(`   Contains "MailApp": ${html.includes('MailApp')}\n`);

    // Step 5: Look for window manager classes
    console.log('[7] Checking for window manager...');
    const windowContainers = await page.locator('[id*="window"], [class*="window"], [data-testid*="window"]').count();
    console.log(`   Found ${windowContainers} window-related DOM elements\n`);

    // Step 6: Try to find Mail in application launcher
    console.log('[8] Looking for application menu/launcher...');
    const appsButton = await page.locator('[aria-label*="app" i], [title*="app" i]').first();
    if (await appsButton.isVisible().catch(() => false)) {
      console.log('   Found applications button, clicking...');
      await appsButton.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'audit/03-app-menu.png', fullPage: true });
      console.log('   Screenshot saved: 03-app-menu.png\n');
    }

    // Step 7: Interactive testing
    console.log('[9] Testing interactions...');

    // Try double-clicking different areas to launch apps
    const dockArea = await page.locator('[class*="dock"]').first();
    if (await dockArea.isVisible().catch(() => false)) {
      console.log('   Found dock area');
      const dockBounds = await dockArea.boundingBox();
      if (dockBounds) {
        console.log(`   Dock dimensions: ${dockBounds.width}x${dockBounds.height}`);
      }
    }

    // Try keyboard shortcut to open Mail (common is Cmd+N for new in Mail)
    console.log('   Testing keyboard shortcuts...');

    // Step 8: List all interactive elements
    console.log('\n[10] Cataloging all clickable elements...');
    const allButtons = await page.locator('button, [role="button"], a, [onclick]').all();
    console.log(`   Total clickable elements: ${allButtons.length}`);

    // Get text content of first 10 buttons
    const buttonTexts = [];
    for (let i = 0; i < Math.min(10, allButtons.length); i++) {
      const text = await allButtons[i].textContent().catch(() => '(no text)');
      buttonTexts.push(text.trim().substring(0, 30));
    }
    console.log(`   Sample button texts: ${buttonTexts.join(', ')}\n`);

    // Final screenshot
    await page.screenshot({ path: 'audit/04-full-page.png', fullPage: true });
    console.log('Final screenshot saved: 04-full-page.png');

    console.log('\n=== AUDIT COMPLETE ===');
    console.log('Keeping browser open for 120 seconds for manual inspection...');

    await page.waitForTimeout(120000);

  } catch (error) {
    console.error('Error during audit:', error.message);
  } finally {
    await browser.close();
    console.log('Browser closed.');
  }
})();
