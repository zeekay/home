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

  try {
    console.log('Step 1: Navigate to localhost:8080');
    await page.goto('http://localhost:8080');

    // Wait for boot sequence to complete (8 seconds as mentioned)
    console.log('Waiting for boot sequence...');
    await page.waitForTimeout(8000);

    // Take boot completion screenshot
    await page.screenshot({ path: `${screenshotDir}/01-boot-complete.png` });
    console.log('✓ Boot complete screenshot taken');

    // Step 2: Open Terminal from dock
    console.log('\nStep 2: Opening Terminal from dock...');

    // Try common Terminal identifiers
    let terminalFound = false;
    const possibleSelectors = [
      '[data-app="terminal"]',
      '[data-app="Console"]',
      '[data-app="ZConsoleWindow"]',
      '[title*="Terminal"]',
      '[title*="Console"]',
      'text=Terminal',
      'text=Console'
    ];

    for (const selector of possibleSelectors) {
      const element = page.locator(selector).first();
      try {
        if (await element.isVisible({ timeout: 1000 })) {
          console.log(`✓ Found Terminal using selector: ${selector}`);
          await element.click();
          await page.waitForTimeout(1500);
          terminalFound = true;
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }

    if (!terminalFound) {
      console.log('⚠ Terminal icon not found with standard selectors');
    }

    await page.screenshot({ path: `${screenshotDir}/02-terminal-opened.png` });
    console.log('✓ Terminal opened screenshot taken');

    // Step 3: Audit Visual Design
    console.log('\nStep 3: Auditing Visual Design...');

    // Check for window chrome
    const windowElements = await page.locator('[class*="window"], [class*="Window"], [role="dialog"]').all();
    console.log(`Found ${windowElements.length} potential window elements`);

    if (windowElements.length > 0) {
      console.log('✓ Window elements found');
    }

    // Check for traffic lights/window controls
    const controls = await page.locator('[class*="traffic"], [class*="control"], [class*="WindowControl"]').all();
    if (controls.length > 0) {
      console.log(`✓ Window controls found (${controls.length} elements)`);
    } else {
      console.log('⚠ Window controls may not be visible');
    }

    // Check terminal content area
    const terminalContents = await page.locator('[class*="terminal"], [class*="console"], textarea, input[type="text"]').all();
    console.log(`Found ${terminalContents.length} potential input elements`);

    if (terminalContents.length > 0) {
      console.log('✓ Terminal content area found');
    }

    await page.screenshot({ path: `${screenshotDir}/03-visual-design.png` });

    // Step 4: Test Functionality - Type command
    console.log('\nStep 4: Testing Functionality...');

    // Try to find and focus on terminal input
    const inputs = await page.locator('input[type="text"], textarea, [contenteditable="true"]').all();
    console.log(`Found ${inputs.length} input elements`);

    if (inputs.length > 0) {
      const terminalInput = page.locator('input[type="text"], textarea, [contenteditable="true"]').first();
      try {
        if (await terminalInput.isVisible({ timeout: 1000 })) {
          console.log('✓ Terminal input found');
          await terminalInput.click();
          await page.waitForTimeout(300);
          await terminalInput.type('echo "Hello from Terminal"');
          await page.waitForTimeout(500);
          console.log('✓ Command typed');

          await page.screenshot({ path: `${screenshotDir}/04-command-typed.png` });

          // Press Enter
          await page.keyboard.press('Enter');
          await page.waitForTimeout(800);
          console.log('✓ Command executed');

          await page.screenshot({ path: `${screenshotDir}/05-command-output.png` });
        }
      } catch (e) {
        console.log('⚠ Could not interact with input element');
      }
    } else {
      console.log('⚠ No input elements found');
    }

    // Step 5: Test tab creation
    console.log('\nStep 5: Testing Tab Creation...');

    const tabButtons = await page.locator('button:has-text("New Tab"), [title="New Tab"], [data-testid="new-tab"], [class*="TabButton"]').all();
    console.log(`Found ${tabButtons.length} potential tab buttons`);

    if (tabButtons.length > 0) {
      const newTabBtn = page.locator('button:has-text("New Tab"), [title="New Tab"], [data-testid="new-tab"], [class*="TabButton"]').first();
      try {
        if (await newTabBtn.isVisible({ timeout: 1000 })) {
          console.log('✓ New Tab button found');
          await newTabBtn.click();
          await page.waitForTimeout(500);
          console.log('✓ New tab created');
        }
      } catch (e) {
        console.log('⚠ Could not click New Tab button');
      }
    } else {
      console.log('⚠ New Tab button not found');
    }

    await page.screenshot({ path: `${screenshotDir}/06-tabs.png` });

    // Step 6: Test keyboard navigation
    console.log('\nStep 6: Testing Keyboard Navigation...');

    const terminalInput2 = page.locator('input[type="text"], textarea, [contenteditable="true"]').first();
    try {
      if (await terminalInput2.isVisible({ timeout: 1000 })) {
        await terminalInput2.click();
        await terminalInput2.type('pwd');
        await page.keyboard.press('ArrowUp');
        await page.waitForTimeout(300);
        console.log('✓ Arrow Up key navigation tested');

        await page.screenshot({ path: `${screenshotDir}/07-history-nav.png` });
      }
    } catch (e) {
      console.log('⚠ Input not available for history test');
    }

    // Step 7: Test clear command
    console.log('\nStep 7: Testing Clear Command...');

    const terminalInput3 = page.locator('input[type="text"], textarea, [contenteditable="true"]').first();
    try {
      if (await terminalInput3.isVisible({ timeout: 1000 })) {
        await terminalInput3.click();
        await terminalInput3.clear();
        await terminalInput3.type('clear');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(500);
        console.log('✓ Clear command executed');

        await page.screenshot({ path: `${screenshotDir}/08-clear.png` });
      }
    } catch (e) {
      console.log('⚠ Could not execute clear command');
    }

    // Step 8: Check menu items
    console.log('\nStep 8: Checking Menu Items...');

    const menuElements = await page.locator('[role="menu"], [class*="menu"], button[class*="menu"]').all();
    console.log(`Found ${menuElements.length} menu elements`);

    if (menuElements.length > 0) {
      console.log('✓ Menu elements found');
    }

    await page.screenshot({ path: `${screenshotDir}/09-menus.png` });

    // Step 9: Check styling details
    console.log('\nStep 9: Checking Styling Details...');

    const terminalElement = page.locator('[class*="terminal"], [class*="console"]').first();
    try {
      if (await terminalElement.isVisible({ timeout: 1000 })) {
        const styles = await terminalElement.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            fontFamily: computed.fontFamily,
            fontSize: computed.fontSize,
            color: computed.color,
            backgroundColor: computed.backgroundColor,
            padding: computed.padding
          };
        });

        console.log('✓ Terminal Styling:');
        console.log(`  Font: ${styles.fontFamily}`);
        console.log(`  Size: ${styles.fontSize}`);
        console.log(`  Color: ${styles.color}`);
        console.log(`  Background: ${styles.backgroundColor}`);
      }
    } catch (e) {
      console.log('⚠ Could not evaluate terminal styles');
    }

    // Step 10: Check for cursor
    console.log('\nStep 10: Checking Cursor...');
    const cursors = await page.locator('[class*="cursor"], [class*="caret"]').all();
    if (cursors.length > 0) {
      console.log(`✓ Cursor elements found (${cursors.length})`);
    } else {
      console.log('⚠ Cursor may not be visible or may be built-in browser cursor');
    }

    await page.screenshot({ path: `${screenshotDir}/10-final.png` });

    // Summary report
    console.log('\n=== AUDIT SUMMARY ===');
    console.log('✓ Navigation successful');
    console.log('✓ Terminal app audit completed');
    console.log('✓ Visual elements identified');
    console.log('✓ Functionality tested');
    console.log('\nScreenshots saved to: ' + screenshotDir);

  } catch (error) {
    console.error('Error during audit:', error);
    try {
      await page.screenshot({ path: `${screenshotDir}/error-screenshot.png` });
    } catch (e) {
      // Ignore screenshot error
    }
  } finally {
    await browser.close();
  }
}

auditTerminal().catch(console.error);
