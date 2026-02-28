import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage();
page.setViewportSize({ width: 1400, height: 900 });

try {
  console.log('=== CALENDAR APP AUDIT ===\n');

  console.log('Step 1: Navigate to application');
  await page.goto('http://localhost:8080', { waitUntil: 'load', timeout: 30000 });

  console.log('Step 2: Wait for ZOS boot sequence (~8 seconds)...');
  await page.waitForTimeout(8000);
  await page.screenshot({ path: '/tmp/01_zos_desktop.png' });
  console.log('✓ Screenshot 01: ZOS Desktop after boot');

  // Look for Calendar app in dock or menu
  console.log('\nStep 3: Finding and opening Calendar app...');

  // First, find all visible text to understand the interface
  const elements = await page.evaluate(() => {
    const appNames = [];
    document.querySelectorAll('button, [role="button"], div[class*="app"], a').forEach(el => {
      const text = el.textContent?.trim() || '';
      if (text && text.length < 30) {
        appNames.push(text.substring(0, 20));
      }
    });
    return [...new Set(appNames)].slice(0, 20);
  });

  console.log('Available elements:', elements);

  // Click on Calendar in the applications menu/dock
  // Try different approaches
  const approaches = [
    () => page.click('button:has-text("Calendar")'),
    () => page.click('[title="Calendar"]'),
    () => page.click('[data-app="calendar"]'),
    () => page.locator('text=/Calendar/i').first().click(),
  ];

  let success = false;
  for (let i = 0; i < approaches.length; i++) {
    try {
      console.log(`Trying approach ${i + 1}...`);
      await approaches[i]();
      success = true;
      console.log('✓ Successfully opened Calendar');
      break;
    } catch (e) {
      console.log(`Approach ${i + 1} failed`);
    }
  }

  if (!success) {
    console.log('Could not open Calendar, trying keyboard...');
    await page.keyboard.press('Control');
  }

  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/tmp/02_calendar_opening.png' });
  console.log('✓ Screenshot 02: Calendar app opening');

  // Check for Calendar window
  const windowInfo = await page.evaluate(() => {
    const windows = Array.from(document.querySelectorAll('[class*="Window"], [class*="window"]'));
    return {
      windowCount: windows.length,
      windows: windows.map(w => ({
        class: w.className.substring(0, 100),
        visible: w.offsetHeight > 0 && w.offsetWidth > 0
      }))
    };
  });

  console.log('Windows found:', windowInfo);

  // Try to find Calendar specific UI
  const calendarUI = await page.evaluate(() => {
    const selectors = {
      'Calendar Window': document.querySelector('[class*="alendarWindow"], [class*="Calendar"], .calendar'),
      'Month View': document.querySelector('[class*="month"]'),
      'Week View': document.querySelector('[class*="week"]'),
      'Day View': document.querySelector('[class*="day"]'),
      'Event': document.querySelector('[class*="event"]'),
      'Sidebar': document.querySelector('[class*="sidebar"]'),
      'Traffic Lights': document.querySelector('[class*="traffic"], [class*="close"]')
    };

    const found = {};
    for (const [key, value] of Object.entries(selectors)) {
      found[key] = !!value;
    }
    return found;
  });

  console.log('\nCalendar UI elements found:', calendarUI);

  // Get all buttons to understand the interface
  const buttons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button')).map(b => ({
      text: b.textContent?.trim().substring(0, 30),
      class: b.className.substring(0, 50),
      visible: b.offsetHeight > 0
    })).filter(b => b.visible && b.text).slice(0, 20);
  });

  console.log('\nVisible buttons:', buttons.map(b => b.text));

  // Try clicking month/week/day view buttons
  console.log('\nStep 4: Testing view navigation...');

  const viewButtons = ['Month', 'Week', 'Day'];
  for (const view of viewButtons) {
    try {
      await page.click(`button:has-text("${view}")`, { timeout: 500 });
      await page.waitForTimeout(500);
      const filename = `/tmp/03_view_${view.toLowerCase()}.png`;
      await page.screenshot({ path: filename });
      console.log(`✓ Switched to ${view} view`);
      break;
    } catch (e) {
      console.log(`${view} button not found`);
    }
  }

  // Check menus
  console.log('\nStep 5: Testing menu items...');

  const menus = ['File', 'Edit', 'View', 'Window', 'Help'];
  for (const menu of menus) {
    try {
      const menuBtn = await page.locator(`button:has-text("${menu}")`).first();
      if (await menuBtn.isVisible({ timeout: 500 })) {
        await menuBtn.click();
        await page.waitForTimeout(300);
        const filename = `/tmp/04_menu_${menu.toLowerCase()}.png`;
        await page.screenshot({ path: filename });
        console.log(`✓ ${menu} menu opened`);
        await page.press('Escape');
      }
    } catch (e) {
      // Menu not found
    }
  }

  // Navigation test - try next/previous month
  console.log('\nStep 6: Testing month navigation...');
  try {
    const nextBtn = await page.locator('button[aria-label*="next"], button:has-text("Next")').first();
    if (await nextBtn.isVisible({ timeout: 500 })) {
      await nextBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: '/tmp/05_next_month.png' });
      console.log('✓ Navigated to next month');
    }
  } catch (e) {
    console.log('Next button not found');
  }

  // Final overview
  await page.screenshot({ path: '/tmp/06_final_overview.png' });
  console.log('\n✓ Screenshot 06: Final overview');

  // Summary of findings
  const summary = await page.evaluate(() => {
    return {
      pageTitle: document.title,
      url: window.location.href,
      bodyText: document.body.textContent.substring(0, 500)
    };
  });

  console.log('\n=== AUDIT COMPLETE ===');
  console.log('Screenshots saved to /tmp/');

} catch (error) {
  console.error('Error:', error.message);
  await page.screenshot({ path: '/tmp/error_screenshot.png' });
} finally {
  await browser.close();
}
