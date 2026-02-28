import { chromium } from 'playwright';

async function auditHanzoAI() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('\n=== HANZO AI DEEP AUDIT ===\n');

  try {
    // Step 1: Navigate to app
    console.log('1. NAVIGATION TEST');
    console.log('   Navigating to http://localhost:8080...');
    await page.goto('http://localhost:8080', { waitUntil: 'domcontentloaded' });

    // Wait for boot to complete - longer this time
    console.log('   Waiting for boot sequence (15 seconds total)...');

    // Wait for Z logo to disappear or for main content to appear
    for (let i = 0; i < 15; i++) {
      const hasContent = await page.locator('body').locator('*').count().catch(() => 0) > 10;
      if (hasContent) {
        console.log(`   Boot content loaded after ${i}s`);
        break;
      }
      await page.waitForTimeout(1000);
    }

    // Take screenshot of boot completion
    await page.screenshot({ path: '/tmp/1-boot-complete.png', fullPage: true });
    console.log('   ✓ Boot complete - screenshot saved\n');

    // Step 2: Get page structure
    console.log('2. PAGE STRUCTURE ANALYSIS');
    const bodyText = await page.textContent('body');
    console.log(`   Page text length: ${bodyText.length} characters`);

    if (bodyText.includes('Hanzo')) {
      console.log('   ✓ "Hanzo" found in page text');
    }
    if (bodyText.includes('Desktop') || bodyText.includes('desktop')) {
      console.log('   ✓ Desktop/window system detected');
    }

    // Look for application windows
    console.log('\n3. CHECKING FOR WINDOWS');
    const windowElements = await page.locator('div').all();
    console.log(`   Total div elements: ${windowElements.length}`);

    // Check for specific window structures
    const hanzoText = await page.locator('text=/Hanzo|hanzo|AI.*Chat/i').all();
    console.log(`   Found ${hanzoText.length} elements with Hanzo/Chat text`);

    // Look for the dock
    console.log('\n4. DOCK INSPECTION');
    const dockLike = await page.locator('[class*="dock"], [class*="Dock"], [class*="taskbar"]').all();
    console.log(`   Dock-like elements: ${dockLike.length}`);

    // Try clicking on an element that might open Hanzo
    console.log('\n5. INTERACTIVE ELEMENT CHECK');
    const buttons = await page.locator('button').all();
    console.log(`   Total buttons found: ${buttons.length}`);

    // Look for clickable items
    for (let i = 0; i < Math.min(5, buttons.length); i++) {
      const text = await buttons[i].textContent();
      const ariaLabel = await buttons[i].getAttribute('aria-label');
      if (text || ariaLabel) {
        console.log(`   Button ${i+1}: "${text || ariaLabel}"`);
      }
    }

    // Step 6: Check for chat or message input
    console.log('\n6. CHAT/INPUT ELEMENTS');
    const inputs = await page.locator('input, textarea, [contenteditable="true"]').all();
    console.log(`   Input elements found: ${inputs.length}`);

    // Look for visible interactive elements
    console.log('\n7. VISIBLE INTERACTIVE ELEMENTS');
    const visibleButtons = [];
    for (let i = 0; i < Math.min(10, buttons.length); i++) {
      const isVisible = await buttons[i].isVisible({ timeout: 500 }).catch(() => false);
      if (isVisible) {
        const text = await buttons[i].textContent();
        visibleButtons.push(text.trim());
      }
    }
    console.log(`   Visible buttons: ${visibleButtons.join(', ')}`);

    // Step 7: Look for app icons that might open Hanzo
    console.log('\n8. APPLICATION ICONS');
    const appLike = await page.locator('[class*="app"], [class*="App"], [data-app-id]').all();
    console.log(`   App-like elements: ${appLike.length}`);

    // Try to find and click Hanzo app
    console.log('\n9. ATTEMPTING TO OPEN HANZO AI');
    const potentialHanzo = await page.locator('text=/Hanzo|hanzo/i').first();
    if (await potentialHanzo.isVisible({ timeout: 1000 }).catch(() => false)) {
      console.log('   Found Hanzo element, clicking...');
      await potentialHanzo.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: '/tmp/2-after-hanzo-click.png', fullPage: true });
    } else {
      // Try clicking first button that might be in dock
      const firstButton = buttons[0];
      if (firstButton) {
        console.log('   Hanzo not directly visible, trying to find via dock...');
        const allText = await firstButton.textContent();
        console.log(`   Trying first button: "${allText}"`);
      }
    }

    // Final screenshot
    await page.screenshot({ path: '/tmp/final-page-state.png', fullPage: true });
    console.log('\n✓ Audit screenshots saved to /tmp/');

    // Print page HTML structure for debugging
    const html = await page.content();
    const hasHanzo = html.includes('Hanzo');
    const hasChat = html.includes('chat');
    console.log(`\n11. HTML CONTENT CHECK`);
    console.log(`   Contains "Hanzo": ${hasHanzo}`);
    console.log(`   Contains "chat": ${hasChat}`);
    console.log(`   HTML length: ${html.length} characters`);

  } catch (error) {
    console.error('Error during audit:', error.message);
    await page.screenshot({ path: '/tmp/error-screenshot.png', fullPage: true });
  }

  // Keep browser open for 10 seconds to allow inspection
  console.log('\nBrowser will remain open for 10 seconds for manual inspection...');
  await page.waitForTimeout(10000);

  await browser.close();
}

auditHanzoAI().catch(console.error);
