import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  try {
    console.log("\n=== EXTENDED SAFARI APP AUDIT ===\n");

    console.log("Step 1: Navigate to app");
    await page.goto('http://localhost:8080', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(15000); // Wait for full boot

    console.log("Step 2: Screenshot desktop state");
    await page.screenshot({ path: '/tmp/audit_01_desktop.png', fullPage: false });

    // Get page HTML to understand structure
    const html = await page.content();
    console.log(`Page loaded. HTML length: ${html.length}`);

    console.log("\nStep 3: Find Safari in dock and click it");
    // The dock items are likely buttons or clickable divs
    const allText = await page.locator('*').allTextContents();
    console.log(`Total text nodes: ${allText.length}`);

    const safariIndex = allText.findIndex(t => t.trim() === 'Safari');
    console.log(`Safari found in text: ${safariIndex >= 0}`);

    // Try clicking Safari - look for Safari button/element
    const safariBtn = page.locator('button:has-text("Safari"), div:has-text("Safari")').first();
    const isVisible = await safariBtn.isVisible({ timeout: 1000 }).catch(() => false);

    if (isVisible) {
      console.log("   Clicking Safari...");
      await safariBtn.click();
      await page.waitForTimeout(2000);
    }

    await page.screenshot({ path: '/tmp/audit_02_after_safari_click.png', fullPage: false });

    console.log("\nStep 4: Analyze Safari window when it opens");

    // Wait for Safari window to appear
    await page.waitForTimeout(1000);

    // Get all windows on page
    const windows = await page.locator('[class*="window"]').count();
    console.log(`Window elements found: ${windows}`);

    // Look for Safari window title
    const titles = await page.locator('h2, h3, [class*="title"]').allTextContents();
    const hasSafariTitle = titles.some(t => t.includes('Safari'));
    console.log(`Safari window title found: ${hasSafariTitle}`);

    console.log("\nStep 5: Check for UI components");

    // Look for inputs
    const allInputs = await page.locator('input').count();
    console.log(`Total inputs: ${allInputs}`);

    // Check for specific Safari UI elements
    const addressBarInput = page.locator('input[type="text"]').first();
    const addressBarVisible = await addressBarInput.isVisible({ timeout: 500 }).catch(() => false);
    console.log(`Address bar input visible: ${addressBarVisible}`);

    // Check for buttons
    const buttons = await page.locator('button').count();
    console.log(`Total buttons: ${buttons}`);

    // Get button labels
    const buttonLabels = await page.locator('button').allTextContents();
    console.log(`Button labels found: ${buttonLabels.filter(l => l.length > 0).length}`);

    console.log("\nStep 6: Test Safari functionality");

    if (addressBarVisible) {
      console.log("   Testing URL entry...");
      await addressBarInput.click();
      await addressBarInput.fill('apple.com');
      console.log("   ✓ URL entered");
      await page.screenshot({ path: '/tmp/audit_03_url_entered.png', fullPage: false });

      await addressBarInput.press('Enter');
      await page.waitForTimeout(1500);
      console.log("   ✓ Navigation executed");
      await page.screenshot({ path: '/tmp/audit_04_after_nav.png', fullPage: false });
    }

    console.log("\nStep 7: Test keyboard shortcuts");

    // Test Cmd+T for new tab
    await page.keyboard.press('Meta+t');
    await page.waitForTimeout(800);
    console.log("   ✓ Cmd+T executed (new tab)");
    await page.screenshot({ path: '/tmp/audit_05_new_tab.png', fullPage: false });

    // Test Cmd+L to focus address bar
    await page.keyboard.press('Meta+l');
    await page.waitForTimeout(500);
    console.log("   ✓ Cmd+L executed (focus address bar)");

    // Test Cmd+R to reload
    await page.keyboard.press('Meta+r');
    await page.waitForTimeout(500);
    console.log("   ✓ Cmd+R executed (reload)");

    // Test Cmd+[ for back
    await page.keyboard.press('Meta+[');
    await page.waitForTimeout(500);
    console.log("   ✓ Cmd+[ executed (back)");

    // Test Cmd+] for forward
    await page.keyboard.press('Meta+]');
    await page.waitForTimeout(500);
    console.log("   ✓ Cmd+] executed (forward)");

    // Test Cmd+D for bookmark
    await page.keyboard.press('Meta+d');
    await page.waitForTimeout(500);
    console.log("   ✓ Cmd+D executed (bookmark)");

    await page.screenshot({ path: '/tmp/audit_06_after_shortcuts.png', fullPage: false });

    console.log("\nStep 8: Check Safari window structure");

    // Look for Safari specific UI components
    const sidebar = await page.locator('[class*="sidebar"]').isVisible({ timeout: 500 }).catch(() => false);
    console.log(`Sidebar visible: ${sidebar}`);

    const tabBar = await page.locator('[role="tablist"]').isVisible({ timeout: 500 }).catch(() => false);
    console.log(`Tab bar visible: ${tabBar}`);

    const bookmarksBar = await page.locator('[class*="bookmark"]').isVisible({ timeout: 500 }).catch(() => false);
    console.log(`Bookmarks bar visible: ${bookmarksBar}`);

    // Check for navigation controls
    const backBtn = await page.locator('button[title*="back"]').isVisible({ timeout: 500 }).catch(() => false);
    console.log(`Back button visible: ${backBtn}`);

    const forwardBtn = await page.locator('button[title*="forward"]').isVisible({ timeout: 500 }).catch(() => false);
    console.log(`Forward button visible: ${forwardBtn}`);

    const reloadBtn = await page.locator('button[title*="reload"]').isVisible({ timeout: 500 }).catch(() => false);
    console.log(`Reload button visible: ${reloadBtn}`);

    // Check for window controls
    const closeBtn = await page.locator('button[aria-label*="close"]').isVisible({ timeout: 500 }).catch(() => false);
    console.log(`Close button visible: ${closeBtn}`);

    const minimizeBtn = await page.locator('button[aria-label*="minimize"]').isVisible({ timeout: 500 }).catch(() => false);
    console.log(`Minimize button visible: ${minimizeBtn}`);

    const maximizeBtn = await page.locator('button[aria-label*="maximize"]').isVisible({ timeout: 500 }).catch(() => false);
    console.log(`Maximize button visible: ${maximizeBtn}`);

    console.log("\nStep 9: Final state");
    await page.screenshot({ path: '/tmp/audit_07_final.png', fullPage: false });

    console.log("\n=== AUDIT COMPLETE ===");
    console.log("\nScreenshots saved to /tmp/:");
    console.log("  1. audit_01_desktop.png - Initial desktop with dock");
    console.log("  2. audit_02_after_safari_click.png - After clicking Safari");
    console.log("  3. audit_03_url_entered.png - After entering URL");
    console.log("  4. audit_04_after_nav.png - After navigation");
    console.log("  5. audit_05_new_tab.png - After Cmd+T (new tab)");
    console.log("  6. audit_06_after_shortcuts.png - After testing shortcuts");
    console.log("  7. audit_07_final.png - Final state\n");

  } catch (error) {
    console.error("ERROR:", error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
})();
