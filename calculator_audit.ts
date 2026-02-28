import { chromium, type Page } from 'playwright';

async function auditCalculator() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('=== CALCULATOR APP AUDIT ===\n');

    // Navigate to app
    console.log('[1] Navigating to http://localhost:8080...');
    await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
    console.log('✓ Page loaded');

    // Wait for boot sequence (look for desktop)
    console.log('[2] Waiting for boot sequence (~8 seconds)...');
    await page.waitForTimeout(8000);

    // Take initial screenshot
    await page.screenshot({ path: '/Users/z/work/zeekay/home/.playwright-mcp/calc_01_desktop.png' });
    console.log('✓ Screenshot: Initial desktop');

    // Check for visible windows and buttons
    const buttons = await page.locator('button').count();
    console.log(`✓ Found ${buttons} buttons on page\n`);

    // Try to find and click Calculator
    console.log('[3] Looking for Calculator app...');

    // Check dock for Calculator button
    const dockItems = await page.locator('[role="button"]').all();
    let calcFound = false;

    for (let i = 0; i < Math.min(dockItems.length, 20); i++) {
      const text = await dockItems[i].textContent();
      console.log(`  Button ${i}: "${text?.trim()}"`);
      if (text?.toLowerCase().includes('calc')) {
        console.log(`✓ Found Calculator button at position ${i}`);
        await dockItems[i].click();
        await page.waitForTimeout(1000);
        calcFound = true;
        break;
      }
    }

    if (!calcFound) {
      console.log('✗ Calculator not found in dock, trying to find window...');
      const windows = await page.locator('[role="dialog"], [role="region"]').all();
      console.log(`Found ${windows.length} potential windows`);
    }

    // Take screenshot of calculator window
    await page.screenshot({ path: '/Users/z/work/zeekay/home/.playwright-mcp/calc_02_calculator.png' });
    console.log('✓ Screenshot: Calculator window\n');

    // Audit visual design
    console.log('[4] VISUAL DESIGN AUDIT:');
    const calcWindow = await page.locator('[class*="calculator"], [class*="Calculator"]').first();
    if (await calcWindow.isVisible({ timeout: 1000 }).catch(() => false)) {
      const box = await calcWindow.boundingBox();
      if (box) {
        console.log(`✓ Window dimensions: ${box.width}x${box.height}`);
      }
      const styles = await calcWindow.evaluate(el => {
        const style = window.getComputedStyle(el);
        return {
          backgroundColor: style.backgroundColor,
          borderRadius: style.borderRadius,
          boxShadow: style.boxShadow,
          fontFamily: style.fontFamily
        };
      });
      console.log(`✓ Styles: ${JSON.stringify(styles)}`);
    }

    // Try to find display and buttons
    console.log('\n[5] COMPONENT AUDIT:');

    const displayArea = await page.locator('[class*="display"], input[type="text"]').first();
    if (await displayArea.isVisible({ timeout: 500 }).catch(() => false)) {
      console.log('✓ Display area found');
      const displayText = await displayArea.inputValue().catch(() => 'N/A');
      console.log(`  Display content: "${displayText}"`);
    } else {
      console.log('✗ Display area not found');
    }

    // Find number buttons
    const numberButtons = await page.locator('button:has-text(/^[0-9]$/)').count();
    console.log(`✓ Number buttons: ${numberButtons}`);

    const operatorButtons = await page.locator('button:has-text(/^[+*/-]$/)').count();
    console.log(`✓ Operator buttons: ${operatorButtons}`);

    const clearButton = await page.locator('button:has-text(/^(C|AC|Clear)$/)').count();
    console.log(`✓ Clear button(s): ${clearButton}`);

    // Test functionality
    console.log('\n[6] FUNCTIONALITY TESTS:');

    // Test 2+2
    console.log('  Test: 2 + 2 = ?');
    await page.locator('button:has-text("2")').first().click();
    await page.waitForTimeout(100);
    await page.locator('button:has-text("+")').first().click();
    await page.waitForTimeout(100);
    await page.locator('button:has-text("2")').first().click();
    await page.waitForTimeout(100);
    await page.locator('button:has-text("=")').first().click();
    await page.waitForTimeout(500);

    const result1 = await displayArea.inputValue().catch(() => '(not found)');
    console.log(`  Result: ${result1}`);

    // Clear and test subtraction
    await page.locator('button:has-text(/^(C|AC)$/)').first().click();
    await page.waitForTimeout(100);
    console.log('  Test: 10 - 5 = ?');
    await page.locator('button:has-text("1")').first().click();
    await page.waitForTimeout(50);
    await page.locator('button:has-text("0")').first().click();
    await page.waitForTimeout(100);
    await page.locator('button:has-text("-")').first().click();
    await page.waitForTimeout(100);
    await page.locator('button:has-text("5")').first().click();
    await page.waitForTimeout(100);
    await page.locator('button:has-text("=")').first().click();
    await page.waitForTimeout(500);

    const result2 = await displayArea.inputValue().catch(() => '(not found)');
    console.log(`  Result: ${result2}`);

    await page.screenshot({ path: '/Users/z/work/zeekay/home/.playwright-mcp/calc_03_after_calculation.png' });
    console.log('✓ Screenshot: After calculation\n');

    // Check menu items
    console.log('[7] MENU AUDIT:');
    const menuBar = await page.locator('[role="menubar"]').count();
    console.log(`Menu bars found: ${menuBar}`);

    if (menuBar > 0) {
      const menuButtons = await page.locator('[role="menuitem"]').count();
      console.log(`Menu items found: ${menuButtons}`);
    }

    console.log('\n=== AUDIT COMPLETE ===');

  } catch (error) {
    console.error('Error during audit:', error);
  } finally {
    await browser.close();
  }
}

auditCalculator();
