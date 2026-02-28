import { chromium } from 'playwright';
import fs from 'fs';

const screenshotsDir = '/tmp/notes_audit_screenshots';
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

let browser;
let pageInstance;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function takeScreenshot(name) {
  const filename = `${screenshotsDir}/${name}.png`;
  await pageInstance.screenshot({ path: filename, fullPage: true });
  console.log(`[SCREENSHOT] ${filename}`);
  return filename;
}

async function runAudit() {
  try {
    browser = await chromium.launch({ headless: false });
    const context = await browser.createContext({
      viewport: { width: 1440, height: 900 }
    });
    pageInstance = await context.newPage();

    console.log('[AUDIT] Starting Notes App Audit');
    console.log('=================================\n');

    // 1. Navigate to localhost:8080
    console.log('[STEP 1] Navigating to http://localhost:8080...');
    await pageInstance.goto('http://localhost:8080', { waitUntil: 'domcontentloaded', timeout: 15000 });

    // Wait for boot sequence to complete (~8 seconds)
    console.log('[STEP 1] Waiting for boot sequence to complete (~8 seconds)...');
    await sleep(8000);

    // Check for boot screen completion
    const bootCompleted = await pageInstance.evaluate(() => {
      const bootScreen = document.querySelector('[class*="boot"]') || document.querySelector('[class*="BootSequence"]');
      return !bootScreen || bootScreen.style.display === 'none' || bootScreen.style.opacity === '0';
    });

    console.log(`[STEP 1] Boot completed: ${bootCompleted}`);
    await takeScreenshot('01_initial_desktop');

    // 2. Open Notes app
    console.log('\n[STEP 2] Opening Notes app from dock or applications...');

    // Try to find Notes in dock first
    const dockItems = await pageInstance.$$('[class*="dock"] [class*="item"]');
    console.log(`[STEP 2] Found ${dockItems.length} dock items`);

    // Look for Notes app - try multiple selectors
    let notesOpened = false;

    // Try clicking on dock (Notes icon is often visible)
    const notesElements = await pageInstance.locator('text=/Notes/i').all();
    console.log(`[STEP 2] Found ${notesElements.length} "Notes" text elements`);

    if (notesElements.length > 0) {
      await notesElements[0].click({ timeout: 5000 });
      notesOpened = true;
      console.log('[STEP 2] Clicked Notes from found element');
    } else {
      // Try finding application grid or menu
      const appElements = await pageInstance.locator('[class*="app"]').locator('text=/Notes/i').all();
      if (appElements.length > 0) {
        await appElements[0].click();
        notesOpened = true;
        console.log('[STEP 2] Clicked Notes from app grid');
      }
    }

    if (!notesOpened) {
      console.log('[STEP 2] Attempting to find Notes via accessibility tree...');
      // Wait a bit and take screenshot to see current state
      await sleep(2000);
    }

    // Wait for Notes window to open
    await sleep(3000);
    await takeScreenshot('02_notes_opening');

    // Check if Notes window is visible
    const notesWindow = await pageInstance.locator('[class*="ZWindow"], [class*="window"]').filter({ hasText: /Notes/ }).first();
    const isVisible = await notesWindow.isVisible().catch(() => false);
    console.log(`[STEP 2] Notes window visible: ${isVisible}`);

    // 3. Audit Visual Design
    console.log('\n[STEP 3] AUDITING VISUAL DESIGN');
    console.log('--------------------------------');

    // Check window chrome (traffic lights)
    const windowControls = await pageInstance.locator('[class*="WindowControls"], [class*="traffic"]').all();
    console.log(`[STEP 3.1] Traffic lights found: ${windowControls.length > 0 ? 'YES' : 'NO'}`);

    // Check sidebar
    const sidebar = await pageInstance.locator('[class*="sidebar"], [class*="Sidebar"], [class*="panel"]').first();
    const sidebarVisible = await sidebar.isVisible().catch(() => false);
    console.log(`[STEP 3.2] Sidebar visible: ${sidebarVisible}`);

    // Check editor area
    const editorArea = await pageInstance.locator('[contenteditable="true"], textarea, [class*="editor"], [class*="content"]').first();
    const editorVisible = await editorArea.isVisible().catch(() => false);
    console.log(`[STEP 3.3] Editor area visible: ${editorVisible}`);

    // Check toolbar
    const toolbar = await pageInstance.locator('[class*="toolbar"], [class*="Toolbar"]').first();
    const toolbarVisible = await toolbar.isVisible().catch(() => false);
    console.log(`[STEP 3.4] Toolbar visible: ${toolbarVisible}`);

    // Check note list
    const notesList = await pageInstance.locator('[class*="notes-list"], [class*="list"], ul, [role="list"]').first();
    const notesListVisible = await notesList.isVisible().catch(() => false);
    console.log(`[STEP 3.5] Notes list visible: ${notesListVisible}`);

    await takeScreenshot('03_visual_design_overview');

    // 4. Test Functionality - Create a new note
    console.log('\n[STEP 4] TESTING FUNCTIONALITY');
    console.log('--------------------------------');
    console.log('[STEP 4.1] Creating a new note...');

    // Try File menu -> New Note
    const fileMenu = await pageInstance.locator('[class*="menu"]').filter({ hasText: /File/i }).first();
    if (await fileMenu.isVisible().catch(() => false)) {
      await fileMenu.click();
      await sleep(500);
      const newNoteOption = await pageInstance.locator('text=/New Note/i').first();
      if (await newNoteOption.isVisible().catch(() => false)) {
        await newNoteOption.click();
        console.log('[STEP 4.1] Created new note via File menu');
      }
    }

    // Alternative: Try keyboard shortcut (Cmd+N)
    await pageInstance.keyboard.press('Meta+N');
    await sleep(1000);
    await takeScreenshot('04_new_note_created');

    // 5. Test Editing
    console.log('[STEP 4.2] Testing note editing...');
    const textArea = await pageInstance.locator('[contenteditable="true"], textarea').first();

    if (await textArea.isVisible().catch(() => false)) {
      await textArea.click();
      await textArea.fill('Test Note: Lorem ipsum dolor sit amet, consectetur adipiscing elit.');
      await sleep(500);
      console.log('[STEP 4.2] Typed test content');
      await takeScreenshot('05_note_text_content');
    }

    // 6. Test Text Formatting
    console.log('[STEP 4.3] Testing text formatting...');

    // Select all text
    await pageInstance.keyboard.press('Meta+A');
    await sleep(300);

    // Try bold (Cmd+B)
    await pageInstance.keyboard.press('Meta+B');
    await sleep(300);
    await takeScreenshot('06_bold_formatting');

    // Try italic (Cmd+I)
    await pageInstance.keyboard.press('Meta+I');
    await sleep(300);
    await takeScreenshot('07_italic_formatting');

    // Try underline (Cmd+U)
    await pageInstance.keyboard.press('Meta+U');
    await sleep(300);
    await takeScreenshot('08_underline_formatting');

    // 7. Check Menus
    console.log('\n[STEP 5] CHECKING MENU ITEMS');
    console.log('--------------------------------');

    // Check available menus
    const menus = await pageInstance.locator('[class*="menu"]').all();
    console.log(`[STEP 5.1] Found ${menus.length} menu elements`);

    for (const menu of menus.slice(0, 5)) {
      const text = await menu.textContent();
      console.log(`  - ${text?.trim()}`);
    }

    // Try to open Edit menu
    const editMenu = await pageInstance.locator('text=/Edit/i').first();
    if (await editMenu.isVisible().catch(() => false)) {
      await editMenu.click();
      await sleep(500);
      await takeScreenshot('09_edit_menu_open');
      await pageInstance.keyboard.press('Escape');
    }

    // Try to open Format menu
    const formatMenu = await pageInstance.locator('text=/Format/i').first();
    if (await formatMenu.isVisible().catch(() => false)) {
      await formatMenu.click();
      await sleep(500);
      await takeScreenshot('10_format_menu_open');
      await pageInstance.keyboard.press('Escape');
    }

    // 8. Test Folder Management
    console.log('[STEP 4.4] Testing folder/collections management...');

    // Look for a "New Folder" button or menu option
    const newFolderBtn = await pageInstance.locator('text=/New Folder|Create Folder/i').first();
    if (await newFolderBtn.isVisible().catch(() => false)) {
      await newFolderBtn.click();
      await sleep(800);
      console.log('[STEP 4.4] New folder created');
      await takeScreenshot('11_folder_created');
    }

    // 9. Test Search
    console.log('[STEP 4.5] Testing search functionality...');

    const searchInput = await pageInstance.locator('[placeholder*="search" i], [placeholder*="Search" i], input[type="search"]').first();
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.click();
      await searchInput.fill('Lorem');
      await sleep(500);
      console.log('[STEP 4.5] Searched for "Lorem"');
      await takeScreenshot('12_search_results');
    }

    // 10. Test Delete
    console.log('[STEP 4.6] Testing delete functionality...');

    // Try keyboard shortcut (Cmd+Delete or just Delete)
    await pageInstance.keyboard.press('Delete');
    await sleep(500);
    await takeScreenshot('13_after_delete_attempt');

    // Final screenshot
    console.log('\n[STEP 6] Final state');
    await takeScreenshot('14_final_state');

    console.log('\n[AUDIT] Audit Complete!');
    console.log('=================================');
    console.log(`Screenshots saved to: ${screenshotsDir}`);

    await context.close();
    await browser.close();

  } catch (error) {
    console.error('[ERROR]', error.message);
    if (browser) await browser.close();
    process.exit(1);
  }
}

runAudit();
