import { chromium } from 'playwright';
import fs from 'fs';

const screenshotsDir = '/tmp/notes_audit_screenshots';
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

let browser;
let page;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function takeScreenshot(name) {
  const filename = screenshotsDir + '/' + name + '.png';
  await page.screenshot({ path: filename, fullPage: true });
  console.log('[SCREENSHOT] ' + filename);
  return filename;
}

async function runAudit() {
  try {
    browser = await chromium.launch({ headless: false });
    page = await browser.newPage({
      viewport: { width: 1440, height: 900 }
    });

    console.log('[AUDIT] Starting Notes App Audit');
    console.log('=================================\n');

    // 1. Navigate to localhost:8080
    console.log('[STEP 1] Navigating to http://localhost:8080...');
    await page.goto('http://localhost:8080', { waitUntil: 'domcontentloaded', timeout: 15000 });

    // Wait for boot sequence to complete (8 seconds)
    console.log('[STEP 1] Waiting for boot sequence to complete (8 seconds)...');
    await sleep(8000);

    // Check for boot screen completion
    const bootCompleted = await page.evaluate(() => {
      const bootScreen = document.querySelector('[class*="boot"]') || document.querySelector('[class*="BootSequence"]');
      return !bootScreen || bootScreen.style.display === 'none' || bootScreen.style.opacity === '0';
    });

    console.log('[STEP 1] Boot completed: ' + bootCompleted);
    await takeScreenshot('01_initial_desktop');

    // 2. Open Notes app
    console.log('\n[STEP 2] Opening Notes app from dock or applications...');

    // Try to find Notes in dock first
    const dockItems = await page.$$('[class*="dock"] [class*="item"]');
    console.log('[STEP 2] Found ' + dockItems.length + ' dock items');

    // Look for Notes app - try multiple selectors
    let notesOpened = false;

    // Try clicking on dock (Notes icon is often visible)
    const notesElements = await page.locator('text=/Notes/i').all();
    console.log('[STEP 2] Found ' + notesElements.length + ' "Notes" text elements');

    if (notesElements.length > 0) {
      try {
        await notesElements[0].click({ timeout: 5000 });
        notesOpened = true;
        console.log('[STEP 2] Clicked Notes from found element');
      } catch (e) {
        console.log('[STEP 2] Failed to click Notes element');
      }
    }

    if (!notesOpened) {
      console.log('[STEP 2] Attempting to find Notes via accessibility tree...');
      await sleep(2000);
    }

    // Wait for Notes window to open
    await sleep(3000);
    await takeScreenshot('02_notes_opening');

    // Check if Notes window is visible
    try {
      const notesWindow = await page.locator('[class*="ZWindow"], [class*="window"]').filter({ hasText: /Notes/ }).first();
      const isVisible = await notesWindow.isVisible().catch(() => false);
      console.log('[STEP 2] Notes window visible: ' + isVisible);
    } catch (e) {
      console.log('[STEP 2] Could not find Notes window');
    }

    // 3. Audit Visual Design
    console.log('\n[STEP 3] AUDITING VISUAL DESIGN');
    console.log('--------------------------------');

    // Check window chrome (traffic lights)
    try {
      const windowControls = await page.locator('[class*="WindowControls"], [class*="traffic"]').all();
      console.log('[STEP 3.1] Traffic lights found: ' + (windowControls.length > 0 ? 'YES' : 'NO'));
    } catch (e) {
      console.log('[STEP 3.1] Could not check traffic lights');
    }

    // Check sidebar
    try {
      const sidebar = await page.locator('[class*="sidebar"], [class*="Sidebar"], [class*="panel"]').first();
      const sidebarVisible = await sidebar.isVisible().catch(() => false);
      console.log('[STEP 3.2] Sidebar visible: ' + sidebarVisible);
    } catch (e) {
      console.log('[STEP 3.2] Could not check sidebar');
    }

    // Check editor area
    try {
      const editorArea = await page.locator('[contenteditable="true"], textarea, [class*="editor"], [class*="content"]').first();
      const editorVisible = await editorArea.isVisible().catch(() => false);
      console.log('[STEP 3.3] Editor area visible: ' + editorVisible);
    } catch (e) {
      console.log('[STEP 3.3] Could not check editor area');
    }

    // Check toolbar
    try {
      const toolbar = await page.locator('[class*="toolbar"], [class*="Toolbar"]').first();
      const toolbarVisible = await toolbar.isVisible().catch(() => false);
      console.log('[STEP 3.4] Toolbar visible: ' + toolbarVisible);
    } catch (e) {
      console.log('[STEP 3.4] Could not check toolbar');
    }

    // Check note list
    try {
      const notesList = await page.locator('[class*="notes-list"], [class*="list"], ul, [role="list"]').first();
      const notesListVisible = await notesList.isVisible().catch(() => false);
      console.log('[STEP 3.5] Notes list visible: ' + notesListVisible);
    } catch (e) {
      console.log('[STEP 3.5] Could not check notes list');
    }

    await takeScreenshot('03_visual_design_overview');

    // 4. Test Functionality - Create a new note
    console.log('\n[STEP 4] TESTING FUNCTIONALITY');
    console.log('--------------------------------');
    console.log('[STEP 4.1] Creating a new note...');

    try {
      // Try keyboard shortcut (Cmd+N)
      await page.keyboard.press('Meta+N');
      await sleep(1000);
      console.log('[STEP 4.1] Pressed Cmd+N');
    } catch (e) {
      console.log('[STEP 4.1] Could not press Cmd+N');
    }

    await takeScreenshot('04_new_note_created');

    // 5. Test Editing
    console.log('[STEP 4.2] Testing note editing...');
    try {
      const textArea = await page.locator('[contenteditable="true"], textarea').first();

      if (await textArea.isVisible().catch(() => false)) {
        await textArea.click();
        await textArea.fill('Test Note: Lorem ipsum dolor sit amet, consectetur adipiscing elit.');
        await sleep(500);
        console.log('[STEP 4.2] Typed test content');
      }
    } catch (e) {
      console.log('[STEP 4.2] Could not type test content');
    }

    await takeScreenshot('05_note_text_content');

    // 6. Test Text Formatting
    console.log('[STEP 4.3] Testing text formatting...');

    try {
      // Select all text
      await page.keyboard.press('Meta+A');
      await sleep(300);

      // Try bold (Cmd+B)
      await page.keyboard.press('Meta+B');
      await sleep(300);
      console.log('[STEP 4.3] Applied bold formatting');
    } catch (e) {
      console.log('[STEP 4.3] Could not apply formatting');
    }

    await takeScreenshot('06_bold_formatting');

    try {
      // Try italic (Cmd+I)
      await page.keyboard.press('Meta+I');
      await sleep(300);
      console.log('[STEP 4.3] Applied italic formatting');
    } catch (e) {
      console.log('[STEP 4.3] Could not apply italic');
    }

    await takeScreenshot('07_italic_formatting');

    try {
      // Try underline (Cmd+U)
      await page.keyboard.press('Meta+U');
      await sleep(300);
      console.log('[STEP 4.3] Applied underline formatting');
    } catch (e) {
      console.log('[STEP 4.3] Could not apply underline');
    }

    await takeScreenshot('08_underline_formatting');

    // 7. Check Menus
    console.log('\n[STEP 5] CHECKING MENU ITEMS');
    console.log('--------------------------------');

    try {
      // Check available menus
      const menus = await page.locator('[class*="menu"]').all();
      console.log('[STEP 5.1] Found ' + menus.length + ' menu elements');

      for (const menu of menus.slice(0, 5)) {
        const text = await menu.textContent();
        if (text) console.log('  - ' + text.trim());
      }
    } catch (e) {
      console.log('[STEP 5.1] Could not check menus');
    }

    // Try to open Edit menu
    try {
      const editMenu = await page.locator('text=/Edit/i').first();
      if (await editMenu.isVisible().catch(() => false)) {
        await editMenu.click();
        await sleep(500);
        await takeScreenshot('09_edit_menu_open');
        await page.keyboard.press('Escape');
      }
    } catch (e) {
      console.log('[STEP 5.2] Could not open Edit menu');
    }

    // Try to open Format menu
    try {
      const formatMenu = await page.locator('text=/Format/i').first();
      if (await formatMenu.isVisible().catch(() => false)) {
        await formatMenu.click();
        await sleep(500);
        await takeScreenshot('10_format_menu_open');
        await page.keyboard.press('Escape');
      }
    } catch (e) {
      console.log('[STEP 5.3] Could not open Format menu');
    }

    // 8. Test Folder Management
    console.log('[STEP 4.4] Testing folder/collections management...');

    try {
      // Look for a "New Folder" button or menu option
      const newFolderBtn = await page.locator('text=/New Folder|Create Folder/i').first();
      if (await newFolderBtn.isVisible().catch(() => false)) {
        await newFolderBtn.click();
        await sleep(800);
        console.log('[STEP 4.4] New folder created');
        await takeScreenshot('11_folder_created');
      }
    } catch (e) {
      console.log('[STEP 4.4] Could not create folder');
    }

    // 9. Test Search
    console.log('[STEP 4.5] Testing search functionality...');

    try {
      const searchInput = await page.locator('[placeholder*="search" i], [placeholder*="Search" i], input[type="search"]').first();
      if (await searchInput.isVisible().catch(() => false)) {
        await searchInput.click();
        await searchInput.fill('Lorem');
        await sleep(500);
        console.log('[STEP 4.5] Searched for "Lorem"');
        await takeScreenshot('12_search_results');
      }
    } catch (e) {
      console.log('[STEP 4.5] Could not test search');
    }

    // 10. Test Delete
    console.log('[STEP 4.6] Testing delete functionality...');

    try {
      await page.keyboard.press('Delete');
      await sleep(500);
      console.log('[STEP 4.6] Pressed Delete key');
    } catch (e) {
      console.log('[STEP 4.6] Could not test delete');
    }

    await takeScreenshot('13_after_delete_attempt');

    // Final screenshot
    console.log('\n[STEP 6] Final state');
    await takeScreenshot('14_final_state');

    console.log('\n[AUDIT] Audit Complete!');
    console.log('=================================');
    console.log('Screenshots saved to: ' + screenshotsDir);

    await browser.close();

  } catch (error) {
    console.error('[ERROR]', error.message);
    if (browser) await browser.close();
    process.exit(1);
  }
}

runAudit();
