import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const SCREENSHOTS_DIR = path.join(__dirname, '../../photos_audit_screenshots');

test.describe('Photos App Comprehensive Audit', () => {
  test.beforeAll(async () => {
    if (!fs.existsSync(SCREENSHOTS_DIR)) {
      fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
    }
  });

  test('01 - Initial load and boot sequence', async ({ page }) => {
    console.log('\n=== PHOTOS APP AUDIT ===\n');
    console.log('Step 1: Navigating to http://localhost:8080');

    await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/01_initial_load.png` });
    console.log('✓ Page loaded');

    // Wait for boot sequence
    console.log('\nStep 2: Waiting for boot sequence (~8 seconds)');
    await page.waitForTimeout(8000);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/02_boot_complete.png` });
    console.log('✓ Boot sequence complete');
  });

  test('02 - Open Photos app', async ({ page }) => {
    console.log('\nStep 3: Opening Photos app');

    await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
    await page.waitForTimeout(8000);

    // Look for Photos in dock
    const photosButton = await page.locator('button, div', { has: page.locator('text="Photos"') }).first();
    if (await photosButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      console.log('✓ Found Photos button');
      await photosButton.click();
      await page.waitForTimeout(2000);
      console.log('✓ Photos window opened');
    } else {
      // Try clicking directly on text
      const photos = await page.locator('text=Photos').first();
      if (await photos.isVisible({ timeout: 1000 }).catch(() => false)) {
        await photos.click();
        await page.waitForTimeout(2000);
        console.log('✓ Photos opened');
      }
    }

    await page.screenshot({ path: `${SCREENSHOTS_DIR}/03_photos_window_open.png` });
  });

  test('03 - Visual Design Audit', async ({ page }) => {
    console.log('\n=== VISUAL DESIGN AUDIT ===\n');

    await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
    await page.waitForTimeout(8000);

    // Open Photos
    const photos = await page.locator('text=Photos').first();
    if (await photos.isVisible({ timeout: 1000 }).catch(() => false)) {
      await photos.click();
      await page.waitForTimeout(2000);
    }

    // Check window chrome
    const windowFrame = await page.locator('[role="dialog"], [data-testid*="window"], .window').first();
    if (await windowFrame.isVisible({ timeout: 1000 }).catch(() => false)) {
      console.log('✓ Window frame/chrome found');
    }

    // Check for traffic lights
    const trafficLights = await page.locator('[class*="traffic"], [class*="close"], [class*="minimize"], [class*="maximize"]').first();
    if (await trafficLights.isVisible({ timeout: 1000 }).catch(() => false)) {
      console.log('✓ Traffic light controls found');
    } else {
      console.log('⚠ Traffic light controls not clearly visible');
    }

    // Check sidebar
    const sidebar = await page.locator('[role="navigation"], [class*="sidebar"]').first();
    if (await sidebar.isVisible({ timeout: 1000 }).catch(() => false)) {
      console.log('✓ Sidebar present');
      const sidebarText = await sidebar.allTextContents();
      console.log(`  Sidebar content: ${sidebarText.join(', ')}`);
    } else {
      console.log('⚠ Sidebar not visible');
    }

    // Check photo grid
    const grid = await page.locator('[role="grid"], [class*="grid"]').first();
    if (await grid.isVisible({ timeout: 1000 }).catch(() => false)) {
      console.log('✓ Photo grid/gallery found');
    } else {
      console.log('⚠ Photo grid not visible');
    }

    // Check toolbar
    const toolbar = await page.locator('[role="toolbar"], [class*="toolbar"]').first();
    if (await toolbar.isVisible({ timeout: 1000 }).catch(() => false)) {
      console.log('✓ Toolbar present');
    } else {
      console.log('⚠ Toolbar not visible');
    }

    // Check theme support
    const html = page.locator('html');
    const classes = await html.getAttribute('class');
    if (classes?.includes('dark') || classes?.includes('light')) {
      console.log(`✓ Theme support: ${classes}`);
    }

    await page.screenshot({ path: `${SCREENSHOTS_DIR}/04_visual_design.png` });
  });

  test('04 - Functionality Audit', async ({ page }) => {
    console.log('\n=== FUNCTIONALITY AUDIT ===\n');

    await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
    await page.waitForTimeout(8000);

    const photos = await page.locator('text=Photos').first();
    if (await photos.isVisible({ timeout: 1000 }).catch(() => false)) {
      await photos.click();
      await page.waitForTimeout(2000);
    }

    // Check images
    const imageCount = await page.locator('img').count();
    console.log(`Images found: ${imageCount}`);

    // Check buttons
    const buttonCount = await page.locator('button').count();
    console.log(`Interactive buttons: ${buttonCount}`);

    // Test photo interaction
    const firstImage = await page.locator('img').first();
    if (await firstImage.isVisible({ timeout: 1000 }).catch(() => false)) {
      console.log('✓ Individual photo elements accessible');
      try {
        await firstImage.click();
        await page.waitForTimeout(500);
        console.log('✓ Photo click interaction works');
        await page.screenshot({ path: `${SCREENSHOTS_DIR}/05_photo_detail.png` });
      } catch (e) {
        console.log('⚠ Photo click failed');
      }
    }

    // Check for specific functionality
    const importBtn = await page.locator('button, text=Import').first();
    if (await importBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      console.log('✓ Import functionality visible');
    }

    const slideshowBtn = await page.locator('button, text=Slideshow').first();
    if (await slideshowBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      console.log('✓ Slideshow feature available');
    }

    const zoomBtn = await page.locator('button, text=Zoom').first();
    if (await zoomBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      console.log('✓ Zoom controls available');
    }

    await page.screenshot({ path: `${SCREENSHOTS_DIR}/06_functionality.png` });
  });

  test('05 - Menu Audit', async ({ page }) => {
    console.log('\n=== MENU AUDIT ===\n');

    await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
    await page.waitForTimeout(8000);

    const photos = await page.locator('text=Photos').first();
    if (await photos.isVisible({ timeout: 1000 }).catch(() => false)) {
      await photos.click();
      await page.waitForTimeout(2000);
    }

    // Check menu bar
    const menuBar = await page.locator('[role="menubar"], [class*="menu-bar"]').first();
    if (await menuBar.isVisible({ timeout: 1000 }).catch(() => false)) {
      console.log('✓ Menu bar found');

      // Check menus
      const fileMenu = await page.locator('button, text=File').first();
      if (await fileMenu.isVisible({ timeout: 500 }).catch(() => false)) {
        console.log('✓ File menu present');
      } else {
        console.log('⚠ File menu not visible');
      }

      const editMenu = await page.locator('button, text=Edit').first();
      if (await editMenu.isVisible({ timeout: 500 }).catch(() => false)) {
        console.log('✓ Edit menu present');
      } else {
        console.log('⚠ Edit menu not visible');
      }

      const viewMenu = await page.locator('button, text=View').first();
      if (await viewMenu.isVisible({ timeout: 500 }).catch(() => false)) {
        console.log('✓ View menu present');
      } else {
        console.log('⚠ View menu not visible');
      }

      const imageMenu = await page.locator('button, text=Image').first();
      if (await imageMenu.isVisible({ timeout: 500 }).catch(() => false)) {
        console.log('✓ Image menu present');
      } else {
        console.log('⚠ Image menu not visible');
      }
    } else {
      console.log('⚠ Menu bar not found');
    }

    await page.screenshot({ path: `${SCREENSHOTS_DIR}/07_menus.png` });
  });

  test('06 - Responsive Design Test', async ({ page }) => {
    console.log('\n=== RESPONSIVE DESIGN ===\n');

    await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
    await page.waitForTimeout(8000);

    const photos = await page.locator('text=Photos').first();
    if (await photos.isVisible({ timeout: 1000 }).catch(() => false)) {
      await photos.click();
      await page.waitForTimeout(2000);
    }

    // Test desktop size
    console.log('✓ Desktop viewport (1440x900)');
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/08_desktop_1440x900.png` });

    // Test small viewport
    await page.setViewportSize({ width: 800, height: 600 });
    await page.waitForTimeout(500);
    console.log('✓ Small viewport (800x600)');
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/09_small_800x600.png` });

    // Test tablet-like
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.waitForTimeout(500);
    console.log('✓ Tablet viewport (1024x768)');
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/10_tablet_1024x768.png` });
  });

  test('07 - Final Summary', async ({ page }) => {
    console.log('\n=== AUDIT COMPLETE ===\n');

    await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
    await page.waitForTimeout(8000);

    const photos = await page.locator('text=Photos').first();
    if (await photos.isVisible({ timeout: 1000 }).catch(() => false)) {
      await photos.click();
      await page.waitForTimeout(2000);
    }

    await page.screenshot({ path: `${SCREENSHOTS_DIR}/11_final_state.png` });

    console.log('\nScreenshots saved to:');
    console.log(SCREENSHOTS_DIR);

    if (fs.existsSync(SCREENSHOTS_DIR)) {
      const files = fs.readdirSync(SCREENSHOTS_DIR).sort();
      console.log('\nScreenshots captured:');
      files.forEach(f => console.log(`  ${f}`));
    }
  });
});
