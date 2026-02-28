import { chromium } from 'playwright';
import fs from 'fs';

async function auditLuxWallet() {
  const screenshotDir = '/tmp/lux_wallet_screenshots';
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  const reports = [];

  try {
    console.log('=== Lux Wallet Application Audit ===\n');

    // Step 1: Navigate to application
    console.log('1. Navigating to http://localhost:8080...');
    await page.goto('http://localhost:8080', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(8000); // Wait for boot sequence
    console.log('✓ Application loaded');

    // Take screenshot of main desktop
    await page.screenshot({ path: `${screenshotDir}/01_desktop_boot.png` });
    console.log('✓ Screenshot: Desktop boot screen');

    // Inspect page structure
    const bodyHTML = await page.evaluate(() => document.body.innerHTML.substring(0, 500));
    console.log('✓ Page structure loaded');

    // Step 2: Find windows on page
    console.log('\n2. Discovering application windows...');

    // Find all window containers
    const windows = await page.locator('[class*="window"], [role="dialog"]').all();
    console.log(`Found ${windows.length} window-like elements`);

    // Look for application buttons/launchers
    const buttons = await page.locator('button').all();
    console.log(`Found ${buttons.length} buttons on page`);

    // Look for specific text patterns
    const luxWalletText = await page.locator(':text("Lux Wallet")').all();
    console.log(`Found ${luxWalletText.length} "Lux Wallet" text elements`);

    // Let's check what's visible
    const allText = await page.evaluate(() => {
      return document.body.innerText.split('\n').filter(t => t.trim()).slice(0, 30);
    });
    console.log('\nVisible text on screen:');
    allText.forEach((text, i) => console.log(`  ${i + 1}. ${text.substring(0, 80)}`));

    // Try to find and click Lux Wallet button - check various selectors
    console.log('\n3. Looking for Lux Wallet launcher...');

    // Check for buttons with specific data attributes or text
    const luxBtn = await page.locator('button[title*="Lux"], button:has-text("Lux"), [data-app*="lux"]').first();
    const isLuxVisible = await luxBtn.isVisible({ timeout: 2000 }).catch(() => false);

    if (isLuxVisible) {
      console.log('✓ Lux Wallet button found');
      await luxBtn.click();
      await page.waitForTimeout(2000);
    } else {
      console.log('! Lux Wallet button not found with standard selectors');
      console.log('  Trying to search through all buttons...');

      // Get all button texts
      const buttonTexts = await page.locator('button').allTextContents();
      console.log('  Button texts found:', buttonTexts.slice(0, 20));
    }

    // Step 3: Check what's on screen now
    console.log('\n4. Capturing current screen state...');
    await page.screenshot({ path: `${screenshotDir}/02_after_navigation.png` });

    // Check for any window containers or content areas
    const mainContent = await page.locator('main, [role="main"], [class*="container"], [class*="content"]').first();
    const mainVisible = await mainContent.isVisible({ timeout: 2000 }).catch(() => false);

    if (mainVisible) {
      console.log('✓ Main content area found');
      const boundingBox = await mainContent.boundingBox();
      console.log(`  Dimensions: ${boundingBox?.width}x${boundingBox?.height}`);
    }

    // Step 4: Look for DeFi/Wallet specific elements
    console.log('\n5. Auditing Wallet UI Components...');

    // Balance display
    const balance = await page.locator(':text(/Balance|Total|Holdings|Assets|Portfolio/)').first();
    const balanceVisible = await balance.isVisible({ timeout: 2000 }).catch(() => false);
    console.log(`✓ Balance display: ${balanceVisible}`);

    // Send button
    const sendBtn = await page.locator('button:has-text("Send")').first();
    const sendVisible = await sendBtn.isVisible({ timeout: 2000 }).catch(() => false);
    console.log(`✓ Send button: ${sendVisible}`);

    // Receive button
    const receiveBtn = await page.locator('button:has-text("Receive")').first();
    const receiveVisible = await receiveBtn.isVisible({ timeout: 2000 }).catch(() => false);
    console.log(`✓ Receive button: ${receiveVisible}`);

    // Chain selector
    const chainSelector = await page.locator('[class*="chain"], select, [title*="chain"]').first();
    const chainVisible = await chainSelector.isVisible({ timeout: 2000 }).catch(() => false);
    console.log(`✓ Chain selector: ${chainVisible}`);

    // Transaction history
    const transactions = await page.locator('[class*="transaction"], [class*="history"]').first();
    const txnVisible = await transactions.isVisible({ timeout: 2000 }).catch(() => false);
    console.log(`✓ Transaction list: ${txnVisible}`);

    // Step 5: Check for Security Features
    console.log('\n6. Auditing Security Features...');

    // Lock button
    const lockBtn = await page.locator('button:has-text("Lock")').first();
    const lockVisible = await lockBtn.isVisible({ timeout: 2000 }).catch(() => false);
    console.log(`✓ Lock button: ${lockVisible}`);

    // Settings
    const settingsBtn = await page.locator('button[title*="Settings"], button:has-text("Settings")').first();
    const settingsVisible = await settingsBtn.isVisible({ timeout: 2000 }).catch(() => false);
    console.log(`✓ Settings button: ${settingsVisible}`);

    // Password field
    const passwordField = await page.locator('input[type="password"]').first();
    const passwordVisible = await passwordField.isVisible({ timeout: 2000 }).catch(() => false);
    console.log(`✓ Password field: ${passwordVisible}`);

    // Mnemonic warning
    const mnemonicWarning = await page.locator(':text(/Never share|Keep safe|Private|Secret|Backup/)').first();
    const warningVisible = await mnemonicWarning.isVisible({ timeout: 2000 }).catch(() => false);
    console.log(`✓ Mnemonic warning: ${warningVisible}`);

    // Step 6: macOS Window Chrome
    console.log('\n7. Auditing macOS Window Chrome...');

    // Look for traffic light buttons
    const trafficLights = await page.locator('[class*="traffic"], [class*="window-controls"], button[class*="close"]').all();
    console.log(`✓ Traffic light controls: ${trafficLights.length} found`);

    // Look for titlebar
    const titlebar = await page.locator('[class*="titlebar"], [class*="window-title"], [class*="chrome"]').first();
    const titlebarVisible = await titlebar.isVisible({ timeout: 2000 }).catch(() => false);
    console.log(`✓ Titlebar: ${titlebarVisible}`);

    // Step 7: Final comprehensive screenshot
    console.log('\n8. Capturing final screenshots...');
    await page.screenshot({ path: `${screenshotDir}/03_final_state.png` });
    console.log('✓ Full page screenshot captured');

    // Get page metrics
    const metrics = await page.evaluate(() => ({
      width: window.innerWidth,
      height: window.innerHeight,
      documentHeight: document.documentElement.scrollHeight,
      title: document.title,
    }));

    console.log(`\nPage Metrics:`);
    console.log(`  Window size: ${metrics.width}x${metrics.height}`);
    console.log(`  Document height: ${metrics.documentHeight}`);
    console.log(`  Page title: ${metrics.title}`);

    console.log('\n=== Audit Complete ===');
    console.log(`Screenshots saved to: ${screenshotDir}`);
    console.log('Files:');
    const files = fs.readdirSync(screenshotDir);
    files.forEach(f => console.log(`  - ${f}`));

  } catch (error) {
    console.error('Error during audit:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
}

auditLuxWallet();
