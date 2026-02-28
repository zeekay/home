import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const screenshotDir = '/tmp/finder_screenshots';
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

let screenshotCount = 0;
async function takeScreenshot(page, name) {
  screenshotCount++;
  const num = screenshotCount.toString().padStart(2, '0');
  const filename = num + '_' + name + '.png';
  const filepath = path.join(screenshotDir, filename);
  await page.screenshot({ path: filepath, fullPage: false });
  console.log('[Screenshot] ' + filename);
  return filepath;
}

async function analyzeElement(page, selector, description) {
  try {
    const element = await page.$(selector);
    if (element) {
      const boundingBox = await element.boundingBox();
      const isVisible = await element.isVisible();
      const classes = await element.getAttribute('class');
      console.log('  ✓ ' + description);
      console.log('    - Visible: ' + isVisible + ', Classes: ' + classes);
      return true;
    }
  } catch (e) {}
  return false;
}

async function runAudit() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({
    viewport: { width: 1400, height: 900 }
  });

  try {
    console.log('=== FINDER APP DEEP AUDIT ===\n');

    console.log('Step 1: Navigate to application');
    await page.goto('http://localhost:8081/', { waitUntil: 'domcontentloaded' });

    console.log('Step 2: Wait for boot sequence to complete (~8 seconds)...');
    await page.waitForTimeout(8000);
    await takeScreenshot(page, '01_boot_screen');

    console.log('Step 3: Look for "Press any key" and proceed');
    try {
      await page.click('body');
      await page.waitForTimeout(1000);
      await takeScreenshot(page, '02_after_boot_click');
    } catch (e) {
      console.log('  Could not click to proceed');
    }

    console.log('\nStep 4: Analyze desktop structure');
    const html = await page.content();

    // Check for dock
    console.log('\n--- DOCK STRUCTURE ---');
    const hasDock = html.includes('dock') || html.includes('Dock');
    console.log('Dock references found: ' + hasDock);

    // Look for all elements with "dock" in class
    const dockElements = await page.$$('[class*="dock"], [class*="Dock"]');
    console.log('Dock-like elements: ' + dockElements.length);

    // Look for visible buttons/clickables
    const buttons = await page.$$('button');
    console.log('Total button elements: ' + buttons.length);

    // Try to find and click Finder
    console.log('\nStep 5: Looking for Finder app...');
    let finderFound = false;

    // Method 1: Look for text "Finder"
    const finderText = await page.locator('text=/Finder/i').all();
    console.log('Elements with "Finder" text: ' + finderText.length);

    if (finderText.length > 0) {
      console.log('Found Finder reference, attempting to click');
      try {
        await finderText[0].click();
        await page.waitForTimeout(1500);
        finderFound = true;
        console.log('✓ Clicked Finder');
        await takeScreenshot(page, '03_finder_clicked');
      } catch (e) {
        console.log('Could not click Finder text element');
      }
    }

    // Method 2: Look for clickable elements with data attributes
    if (!finderFound) {
      const allElements = await page.$$('[data-app], [data-name], [data-id]');
      console.log('Elements with data attributes: ' + allElements.length);

      for (let i = 0; i < Math.min(5, allElements.length); i++) {
        const dataApp = await allElements[i].getAttribute('data-app');
        const dataName = await allElements[i].getAttribute('data-name');
        if (dataApp?.includes('finder') || dataName?.includes('finder')) {
          await allElements[i].click();
          await page.waitForTimeout(1500);
          finderFound = true;
          console.log('✓ Clicked Finder via data attribute');
          await takeScreenshot(page, '03_finder_clicked');
          break;
        }
      }
    }

    // Method 3: If still not found, try keyboard shortcut
    if (!finderFound) {
      console.log('Attempting keyboard shortcut to open Finder');
      await page.keyboard.press('Tab');
      await page.waitForTimeout(500);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1500);
      await takeScreenshot(page, '03_finder_keyboard_open');
    }

    console.log('\n--- FINDER WINDOW ANALYSIS ---');

    // Check for window elements
    const windows = await page.$$('[class*="window"], [class*="Window"], .z-window');
    console.log('Window elements found: ' + windows.length);

    // If we have windows, analyze them
    if (windows.length > 0) {
      for (let i = 0; i < windows.length; i++) {
        const title = await windows[i].getAttribute('data-title') ||
                     await windows[i].textContent().then(t => t.substring(0, 50));
        console.log('  Window ' + (i + 1) + ': ' + title);
      }
    }

    // Analyze specific Finder elements
    console.log('\n--- FINDER UI ELEMENTS ---');

    await analyzeElement(page, '[class*="sidebar"]', 'Sidebar');
    await analyzeElement(page, '[class*="toolbar"]', 'Toolbar');
    await analyzeElement(page, '[class*="content"]', 'Content area');
    await analyzeElement(page, '[class*="titlebar"]', 'Title bar');

    // Check for window controls (close, minimize, zoom)
    const windowControls = await page.$$('[class*="close"], [class*="minimize"], [class*="zoom"], [class*="control"]');
    console.log('Window control elements: ' + windowControls.length);

    // Check for sidebar items
    console.log('\n--- SIDEBAR ITEMS ---');
    const sidebarItems = await page.locator('[class*="sidebar"] button, [class*="sidebar"] [role="button"]').all();
    console.log('Sidebar buttons/items: ' + sidebarItems.length);

    for (let i = 0; i < Math.min(5, sidebarItems.length); i++) {
      const text = await sidebarItems[i].textContent();
      console.log('  - ' + text.trim().substring(0, 40));
    }

    // Check for toolbar/view options
    console.log('\n--- VIEW MODE BUTTONS ---');
    const viewButtons = await page.locator('button').filter({ hasText: /icon|list|column|columns|Icon|List|Column/i }).all();
    console.log('View mode buttons: ' + viewButtons.length);

    for (let i = 0; i < Math.min(5, viewButtons.length); i++) {
      const text = await viewButtons[i].textContent();
      console.log('  - ' + text.trim());
    }

    // Check for menu bar
    console.log('\n--- MENU BAR ---');
    const menuItems = await page.locator('[role="menubar"] [role="menuitem"], button:has-text(/File|Edit|View|Go|Window|Help/)').all();
    console.log('Menu items: ' + menuItems.length);

    for (let i = 0; i < Math.min(6, menuItems.length); i++) {
      const text = await menuItems[i].textContent();
      console.log('  - ' + text.trim());
    }

    // Check for file/folder list
    console.log('\n--- CONTENT AREA ---');
    const fileItems = await page.locator('[class*="file"], [class*="item"], [role="listitem"]').all();
    console.log('File/item elements: ' + fileItems.length);

    await takeScreenshot(page, '04_full_analysis');

    // Test interactions
    console.log('\n--- INTERACTION TESTS ---');

    // Test View menu if available
    const viewMenu = await page.locator('button:has-text("View"), [role="menuitem"]:has-text("View")').first();
    if (await viewMenu.isVisible().catch(() => false)) {
      console.log('Testing View menu...');
      await viewMenu.click();
      await page.waitForTimeout(500);
      await takeScreenshot(page, '05_view_menu_open');
      await page.keyboard.press('Escape');
    }

    // Test File menu if available
    const fileMenu = await page.locator('button:has-text("File"), [role="menuitem"]:has-text("File")').first();
    if (await fileMenu.isVisible().catch(() => false)) {
      console.log('Testing File menu...');
      await fileMenu.click();
      await page.waitForTimeout(500);
      await takeScreenshot(page, '06_file_menu_open');
      await page.keyboard.press('Escape');
    }

    // Test sidebar navigation if available
    const sidebarLinks = await page.locator('[class*="sidebar"] button').first();
    if (await sidebarLinks.isVisible().catch(() => false)) {
      console.log('Testing sidebar navigation...');
      await sidebarLinks.click();
      await page.waitForTimeout(500);
      await takeScreenshot(page, '07_sidebar_click');
    }

    // Final full screenshot
    await takeScreenshot(page, '08_final_state');

    console.log('\n=== AUDIT COMPLETE ===');

  } catch (error) {
    console.error('Error during audit:', error.message);
    console.error(error.stack);
  } finally {
    console.log('Screenshots saved to: ' + screenshotDir);
    console.log('Closing browser...');
    await browser.close();
  }
}

runAudit();
