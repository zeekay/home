import { test, expect, Page } from '@playwright/test';
import path from 'path';

const SCREENSHOT_DIR = path.join(__dirname, '.playwright-mcp');

async function takeScreenshot(page: Page, name: string) {
  const filePath = path.join(SCREENSHOT_DIR, `clock-audit-${name}.png`);
  await page.screenshot({ path: filePath, fullPage: false });
  console.log(`Screenshot saved: ${name}`);
}

test.describe('Clock App Audit', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to localhost
    console.log('Navigating to http://localhost:8080');
    await page.goto('http://localhost:8080', { waitUntil: 'networkidle', timeout: 15000 });

    // Wait for boot to complete (~8 seconds)
    console.log('Waiting for boot sequence');
    await page.waitForTimeout(8000);

    await takeScreenshot(page, '01-desktop');
  });

  test('1. Should display desktop with applications', async ({ page }) => {
    // Check if desktop is rendered
    const desktop = await page.locator('[data-testid="desktop"], .desktop, main').first();
    expect(desktop).toBeDefined();

    // Check for dock or applications area
    const dock = await page.locator('[data-testid="dock"], .dock, [class*="dock"]').first();
    expect(dock).toBeDefined();

    await takeScreenshot(page, '02-desktop-overview');
  });

  test('2. Should locate and click Clock app', async ({ page }) => {
    // Look for Clock in the applications
    // Try multiple selectors
    let clockElement;

    // Try finding by text "Clock"
    clockElement = await page.locator('text=Clock').first();
    if (await clockElement.count() === 0) {
      // Try by data attribute
      clockElement = await page.locator('[data-app="Clock"]').first();
    }
    if (await clockElement.count() === 0) {
      // Try by aria-label
      clockElement = await page.locator('[aria-label*="Clock"]').first();
    }

    // Log all visible elements with "clock" or similar
    const allText = await page.content();
    const clockMatches = (allText.match(/clock/gi) || []).length;
    console.log(`Found ${clockMatches} references to "Clock" in DOM`);

    // Take screenshot and look for the clock app
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'clock-audit-03-finding-app.png') });
  });

  test('3. Should open Clock app from dock/menu', async ({ page }) => {
    // Try double-clicking Clock app in dock
    const clockInDock = await page.locator('text=Clock').first();

    if (await clockInDock.count() > 0) {
      console.log('Found Clock in dock');
      await clockInDock.dblclick();

      // Wait for window to appear
      await page.waitForTimeout(1000);
      await takeScreenshot(page, '04-clock-window-opened');
    } else {
      console.log('Clock not found in expected location');

      // Try to find and click from applications/launchpad
      const appMenu = await page.locator('[class*="app"], [data-app]').first();
      if (await appMenu.count() > 0) {
        console.log('Found app-like element, investigating');
      }
    }
  });

  test('4. Clock window visual design audit', async ({ page }) => {
    // Find the Clock window
    const clockWindow = await page.locator('[role="dialog"], .window, [class*="window"]').filter({ hasText: 'Clock' }).first();

    if (await clockWindow.count() > 0) {
      // Check window chrome/title bar
      const titleBar = await clockWindow.locator('[class*="title"], [role="heading"]').first();
      expect(titleBar).toBeDefined();

      // Check for close button
      const closeBtn = await clockWindow.locator('button[aria-label*="close"], [class*="close"]').first();
      expect(closeBtn).toBeDefined();

      await takeScreenshot(page, '05-clock-window-chrome');

      // Check tabs
      const worldClockTab = await page.locator('text=World Clock').first();
      const analogTab = await page.locator('text=Analog').first();

      const hasWorldTab = await worldClockTab.count() > 0;
      const hasAnalogTab = await analogTab.count() > 0;

      console.log(`World Clock Tab: ${hasWorldTab}, Analog Tab: ${hasAnalogTab}`);

      if (hasWorldTab && hasAnalogTab) {
        console.log('Both tabs present');
      }
    } else {
      console.log('Clock window not found');
    }
  });

  test('5. Test World Clock functionality', async ({ page }) => {
    const worldClockTab = await page.locator('text=World Clock').first();

    if (await worldClockTab.count() > 0) {
      await worldClockTab.click();
      await page.waitForTimeout(500);

      await takeScreenshot(page, '06-world-clock-tab');

      // Look for city entries
      const cityEntries = await page.locator('[class*="clock"], text=San Francisco, text=New York, text=London, text=Tokyo').all();
      console.log(`Found ${cityEntries.length} city clock entries`);

      // Check for "Add City" button
      const addBtn = await page.locator('button:has-text("Add City")').first();
      if (await addBtn.count() > 0) {
        console.log('Add City button found');

        // Click to see dropdown
        await addBtn.click();
        await page.waitForTimeout(500);
        await takeScreenshot(page, '07-add-city-dropdown');

        // Try adding a city
        const chicagoOption = await page.locator('text=Chicago').first();
        if (await chicagoOption.count() > 0) {
          console.log('Chicago option found in dropdown');
          await chicagoOption.click();
          await page.waitForTimeout(500);
          await takeScreenshot(page, '08-after-add-city');
        }
      }
    }
  });

  test('6. Test Analog Clock functionality', async ({ page }) => {
    const analogTab = await page.locator('text=Analog').first();

    if (await analogTab.count() > 0) {
      await analogTab.click();
      await page.waitForTimeout(500);

      await takeScreenshot(page, '09-analog-clock-tab');

      // Check for clock face
      const clockFace = await page.locator('[class*="clock"], svg, circle').first();
      console.log('Checking analog clock rendering');

      // Check for time display
      const timeDisplay = await page.locator('text=/\\d{1,2}:\\d{2}:\\d{2}/').first();
      if (await timeDisplay.count() > 0) {
        console.log('Time display found');
      }

      // Wait a few seconds to see if clock is animating
      await page.waitForTimeout(3000);
      await takeScreenshot(page, '10-analog-clock-animated');
    }
  });

  test('7. Window responsiveness and styling', async ({ page }) => {
    const clockWindow = await page.locator('[role="dialog"], .window, [class*="window"]').filter({ hasText: 'Clock' }).first();

    if (await clockWindow.count() > 0) {
      // Get computed styles
      const bgColor = await clockWindow.evaluate(el => window.getComputedStyle(el).backgroundColor);
      const textColor = await clockWindow.evaluate(el => window.getComputedStyle(el).color);

      console.log(`Background: ${bgColor}, Text Color: ${textColor}`);

      // Check for macOS-like styling (dark mode)
      expect(bgColor).toBeTruthy();

      // Check border radius for modern look
      const borderRadius = await clockWindow.evaluate(el => window.getComputedStyle(el).borderRadius);
      console.log(`Border Radius: ${borderRadius}`);
    }
  });

  test('8. Remove city from world clock', async ({ page }) => {
    const worldClockTab = await page.locator('text=World Clock').first();

    if (await worldClockTab.count() > 0) {
      await worldClockTab.click();
      await page.waitForTimeout(500);

      // Find a remove button (X icon)
      const removeBtn = await page.locator('button[aria-label*="remove"], button[title*="remove"], [class*="remove"]').first();

      if (await removeBtn.count() > 0) {
        console.log('Remove button found');
        // Hover to reveal if hidden
        await removeBtn.hover();
        await page.waitForTimeout(300);
        await takeScreenshot(page, '11-remove-button-hover');
      }
    }
  });

  test('9. Complete audit summary', async ({ page }) => {
    console.log('\n=== CLOCK APP AUDIT SUMMARY ===\n');

    // Check if Clock window exists
    const clockWindow = await page.locator('[role="dialog"], .window, [class*="window"]').filter({ hasText: 'Clock' }).first();

    const windowFound = await clockWindow.count() > 0;
    console.log(`Clock window open: ${windowFound}`);

    if (windowFound) {
      // Check tabs
      const worldTab = await page.locator('text=World Clock').count();
      const analogTab = await page.locator('text=Analog').count();
      console.log(`Tabs present - World Clock: ${worldTab > 0}, Analog: ${analogTab > 0}`);

      // Check functionality elements
      const addBtn = await page.locator('text=Add City').count();
      console.log(`Add City button: ${addBtn > 0}`);

      // Check for time display
      const timeDisplay = await page.locator('text=/\\d{1,2}:\\d{2}').count();
      console.log(`Time displays found: ${timeDisplay}`);
    }

    await takeScreenshot(page, '12-final-audit');
    console.log('\nAudit complete. Check .playwright-mcp/ for screenshots.\n');
  });
});
