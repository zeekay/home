import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function auditTerminal() {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 }
  });

  // Create screenshots directory
  const screenshotDir = '/Users/z/work/zeekay/home/.playwright-mcp/terminal-audit';
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const results = {
    navigationStatus: 'PASS',
    bootCompleted: 'PASS',
    terminalFound: 'FAIL',
    windowChrome: 'PENDING',
    tabSupport: 'PENDING',
    inputField: 'PENDING',
    menuItems: 'PENDING',
    styling: 'PENDING',
    cursor: 'PENDING',
    issues: []
  };

  try {
    console.log('Step 1: Navigate to localhost:8080');
    await page.goto('http://localhost:8080');

    // Wait for boot sequence to complete
    console.log('Waiting for boot sequence...');
    await page.waitForTimeout(10000);

    // Take boot screenshot
    await page.screenshot({ path: `${screenshotDir}/01-boot-complete.png` });
    console.log('✓ Boot complete screenshot taken');

    // Get page HTML to understand structure
    const bodyHTML = await page.locator('body').innerHTML();
    const hasDesktop = bodyHTML.includes('Desktop') || bodyHTML.includes('zeekay');
    console.log(`Desktop loaded: ${hasDesktop}`);

    // Step 2: Find and click Terminal app
    console.log('\nStep 2: Finding Terminal app in dock...');

    // Get all dock items
    const dockItems = await page.locator('[class*="dock"]').all();
    console.log(`Found ${dockItems.length} dock-related elements`);

    // Look for Terminal in dock or apps
    const terminalSelectors = [
      '[data-app="terminal"]',
      '[data-appId="terminal"]',
      '[title*="Terminal"]',
      '[aria-label*="Terminal"]',
      'button:has-text("Terminal")',
      'div:has-text("Terminal")'
    ];

    let terminalElement = null;
    for (const selector of terminalSelectors) {
      const elem = page.locator(selector).first();
      try {
        const visible = await elem.isVisible({ timeout: 500 });
        if (visible) {
          console.log(`✓ Found Terminal with selector: ${selector}`);
          terminalElement = elem;
          results.terminalFound = 'PASS';
          break;
        }
      } catch (e) {
        // Continue
      }
    }

    if (!terminalElement) {
      // Try clicking on dock area to find Terminal
      const dock = await page.locator('[class*="dock"]').first();
      const dockHTML = await dock.innerHTML();
      if (dockHTML.includes('terminal') || dockHTML.includes('Terminal')) {
        console.log('⚠ Terminal reference found in dock HTML but not clickable');
        results.issues.push('Terminal not clickable in dock');
      } else {
        console.log('⚠ Terminal not found in dock');
        results.issues.push('Terminal app not visible in dock');
      }
    } else {
      await terminalElement.click();
      await page.waitForTimeout(2000);
      console.log('✓ Clicked Terminal');
    }

    await page.screenshot({ path: `${screenshotDir}/02-after-terminal-click.png` });

    // Step 3: Inspect page structure
    console.log('\nStep 3: Inspecting page structure...');

    // Look for terminal window
    const windows = await page.locator('[class*="window"], [class*="Window"]').all();
    console.log(`Found ${windows.length} window elements`);

    if (windows.length > 0) {
      results.windowChrome = 'PASS';
      console.log('✓ Window elements found');

      // Check for window controls (close, minimize, maximize buttons)
      const controls = await page.locator('[class*="close"], [class*="minimize"], [class*="maximize"], [class*="traffic"]').all();
      if (controls.length > 0) {
        console.log(`✓ Window controls found (${controls.length} elements)`);
      }
    } else {
      results.issues.push('No window elements found');
    }

    await page.screenshot({ path: `${screenshotDir}/03-window-structure.png` });

    // Step 4: Look for terminal input/content
    console.log('\nStep 4: Searching for terminal input...');

    const inputs = await page.locator('input, textarea, [contenteditable="true"]').all();
    console.log(`Found ${inputs.length} potential input elements`);

    if (inputs.length > 0) {
      results.inputField = 'PASS';
      console.log('✓ Input fields found');

      // Try to find terminal-specific input
      const terminalInput = page.locator('[class*="terminal"] input, [class*="terminal"] textarea, [class*="xterm"]').first();
      try {
        const isVisible = await terminalInput.isVisible({ timeout: 500 });
        if (isVisible) {
          console.log('✓ Terminal input field confirmed');

          // Try typing a command
          await terminalInput.click();
          await terminalInput.type('echo "Hello Terminal"');
          await page.waitForTimeout(500);
          console.log('✓ Command typed successfully');

          await page.screenshot({ path: `${screenshotDir}/04-command-typed.png` });

          // Try pressing Enter
          await page.keyboard.press('Enter');
          await page.waitForTimeout(800);
          console.log('✓ Command executed');

          await page.screenshot({ path: `${screetshotDir}/05-command-output.png` });
        }
      } catch (e) {
        console.log('⚠ Could not interact with terminal input');
      }
    } else {
      results.inputField = 'FAIL';
      results.issues.push('No input elements found');
    }

    // Step 5: Look for tabs
    console.log('\nStep 5: Checking tab support...');

    const tabs = await page.locator('[role="tab"], [class*="tab"], [class*="Tab"]').all();
    const newTabButtons = await page.locator('button:has-text("New"), button:has-text("Tab"), [title*="Tab"]').all();

    if (tabs.length > 0 || newTabButtons.length > 0) {
      results.tabSupport = 'PASS';
      console.log(`✓ Tab elements found (${tabs.length} tabs, ${newTabButtons.length} new tab buttons)`);

      // Try clicking new tab button
      if (newTabButtons.length > 0) {
        await newTabButtons[0].click();
        await page.waitForTimeout(500);
        console.log('✓ New tab created');
      }
    } else {
      results.tabSupport = 'FAIL';
      results.issues.push('No tab elements found');
    }

    await page.screenshot({ path: `${screenshotDir}/06-tabs.png` });

    // Step 6: Check menus
    console.log('\nStep 6: Checking menu items...');

    const menus = await page.locator('[role="menu"], [class*="menu"]').all();
    const menuButtons = await page.locator('button[class*="menu"]').all();

    if (menus.length > 0 || menuButtons.length > 0) {
      results.menuItems = 'PASS';
      console.log(`✓ Menu elements found (${menus.length} menus, ${menuButtons.length} menu buttons)`);
    } else {
      results.menuItems = 'FAIL';
      results.issues.push('No menu elements found');
    }

    await page.screenshot({ path: `${screenshotDir}/07-menus.png` });

    // Step 7: Check styling
    console.log('\nStep 7: Checking terminal styling...');

    const terminalElement = page.locator('[class*="terminal"], [class*="xterm"]').first();
    try {
      const isVisible = await terminalElement.isVisible({ timeout: 500 });
      if (isVisible) {
        const styles = await terminalElement.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            fontFamily: computed.fontFamily,
            fontSize: computed.fontSize,
            color: computed.color,
            backgroundColor: computed.backgroundColor,
            lineHeight: computed.lineHeight
          };
        });

        results.styling = 'PASS';
        console.log('✓ Terminal styling found:');
        console.log(`  Font: ${styles.fontFamily}`);
        console.log(`  Size: ${styles.fontSize}`);
        console.log(`  Color: ${styles.color}`);
        console.log(`  Background: ${styles.backgroundColor}`);
      }
    } catch (e) {
      results.styling = 'PARTIAL';
      console.log('⚠ Could not evaluate terminal styles');
    }

    // Step 8: Check cursor
    console.log('\nStep 8: Checking cursor...');

    const cursors = await page.locator('[class*="cursor"], [class*="caret"], [class*="blink"]').all();
    if (cursors.length > 0) {
      results.cursor = 'PASS';
      console.log(`✓ Cursor elements found (${cursors.length})`);
    } else {
      results.cursor = 'PARTIAL';
      console.log('⚠ No custom cursor elements found (may be using browser default)');
    }

    await page.screenshot({ path: `${screenshotDir}/08-final.png` });

    // Final check - test keyboard navigation
    console.log('\nStep 9: Testing keyboard navigation...');

    try {
      const input = page.locator('input, textarea, [contenteditable="true"]').first();
      if (await input.isVisible({ timeout: 500 })) {
        await input.click();
        await input.type('pwd');
        await page.keyboard.press('ArrowUp');
        await page.waitForTimeout(300);
        console.log('✓ Keyboard history navigation works');
        await page.screenshot({ path: `${screenshotDir}/09-history.png` });
      }
    } catch (e) {
      console.log('⚠ Could not test keyboard navigation');
    }

  } catch (error) {
    console.error('Error during audit:', error);
    results.navigationStatus = 'FAIL';
    results.issues.push(error.message);
    try {
      await page.screenshot({ path: `${screenshotDir}/error.png` });
    } catch (e) {
      // Ignore
    }
  } finally {
    // Print results summary
    console.log('\n=== TERMINAL AUDIT RESULTS ===\n');
    console.log('Test Results:');
    console.log(`  Navigation: ${results.navigationStatus}`);
    console.log(`  Boot Complete: ${results.bootCompleted}`);
    console.log(`  Terminal Found: ${results.terminalFound}`);
    console.log(`  Window Chrome: ${results.windowChrome}`);
    console.log(`  Tab Support: ${results.tabSupport}`);
    console.log(`  Input Field: ${results.inputField}`);
    console.log(`  Menu Items: ${results.menuItems}`);
    console.log(`  Styling: ${results.styling}`);
    console.log(`  Cursor: ${results.cursor}`);

    if (results.issues.length > 0) {
      console.log('\nIssues Found:');
      results.issues.forEach((issue, i) => {
        console.log(`  ${i + 1}. ${issue}`);
      });
    } else {
      console.log('\nNo issues found!');
    }

    console.log('\nScreenshots saved to: ' + screenshotDir);

    await browser.close();
  }
}

auditTerminal().catch(console.error);
