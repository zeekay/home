import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSystem } from '@/App';
import { ANIMATION_DURATIONS } from '@/utils/animationConstants';
import { playSound } from '@/lib/sounds';
import ZDock from './ZDock';
import ZMenuBar from './ZMenuBar';
// Lightweight windows loaded synchronously
import ZFinderWindow from './ZFinderWindow';
import ZEmailWindow from './ZEmailWindow';
import ZTextPadWindow from './ZTextPadWindow';
// ZSocialsWindow kept for contacts - Messages uses X/Twitter DMs
import ZCalculatorWindow from './ZCalculatorWindow';
import ZClockWindow from './ZClockWindow';
import ZStickiesWindow from './ZStickiesWindow';
// Heavy windows loaded lazily for code splitting
import {
  LazyZTerminalWindow,
  LazyZSafariWindow,
  LazyZMusicWindow,
  LazyZCalendarWindow,
  LazyZSystemPreferencesWindow,
  LazyZPhotosWindow,
  LazyZFaceTimeWindow,
  LazyZGitHubStatsWindow,
  LazyZWeatherWindow,
  LazyZNotesWindow,
  LazyHanzoAIWindow,
  LazyLuxWalletWindow,
  LazyZooAssistantWindow,
  LazyZCodeWindow,
  LazyZAppStoreWindow,
  LazyZMessagesWindow,
  LazyZShortcutsWindow,
} from './LazyWindows';
import ApplicationsPopover from './dock/ApplicationsPopover';
import DownloadsPopover from './dock/DownloadsPopover';
import AboutZosWindow from './AboutZosWindow';
import AnimatedBackground from './AnimatedBackground';
import AppSwitcher from './AppSwitcher';
import MissionControl from './MissionControl';
import SpotlightSearch from './SpotlightSearch';
import ForceQuitDialog from './ForceQuitDialog';
import DesktopContextMenu from './DesktopContextMenu';
import ClipboardManager from './ClipboardManager';
import ScreenshotToolbar from './ScreenshotToolbar';
import AboutAppDialog from './AboutAppDialog';
import {
  useWindowManager,
  useDesktopSettings,
  useOverlays,
  toast,
  type AppType,
} from '@/hooks';
import {
  useGlobalShortcuts,
  createSystemShortcuts,
  type ShortcutDefinition,
} from '@/contexts/GlobalShortcutsContext';
import { useTerminal } from '@/contexts/TerminalContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useFocusMode } from '@/contexts/FocusModeContext';
import { useDropTarget, type DragItem, type DragFileItem, type DragOperation } from '@/contexts/DragDropContext';
import { useWidgets } from '@/contexts/WidgetContext';
import { WidgetsLayer } from './widgets';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface ZDesktopProps {
  children: React.ReactNode;
}

// Mapping from AppType to dock app identifier
const APP_TO_DOCK_ID: Partial<Record<AppType, string>> = {
  'Finder': 'finder',
  'Terminal': 'terminal',
  'Safari': 'safari',
  'Music': 'music',
  'Messages': 'socials',
  'Mail': 'mail',
  'Calendar': 'calendar',
  'Photos': 'photos',
  'FaceTime': 'facetime',
  'TextEdit': 'textedit',
  'Notes': 'notes',
  'Hanzo AI': 'hanzo',
  'Lux Wallet': 'lux',
  'Zoo': 'zoo',
  'Xcode': 'xcode',
  'App Store': 'appstore',
  'Shortcuts': 'shortcuts',
};

const ZDesktop: React.FC<ZDesktopProps> = ({ children }) => {
  // System controls
  const { sleep, restart, shutdown, lockScreen } = useSystem();

  // Custom hooks for state management
  const windows = useWindowManager();
  const settings = useDesktopSettings();
  const overlays = useOverlays();
  const { queueCommand } = useTerminal();
  const { addNotification } = useNotifications();
  const { activeMode, modes, activateMode } = useFocusMode();

  // Info dialog state
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [infoDialogContent, setInfoDialogContent] = useState({ title: '', description: '' });

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  // About app dialog state
  const [aboutApp, setAboutApp] = useState<string | null>(null);

  // Finder initial path (for deep linking to Trash, etc.)
  const [finderInitialPath, setFinderInitialPath] = useState<string[] | undefined>(undefined);

  // Intro animation state - triggers after boot completes
  const [introPhase, setIntroPhase] = useState<'waiting' | 'dock' | 'window' | 'complete'>('waiting');
  const [launchingApp, setLaunchingApp] = useState<string | null>(null);

  // Auto open TextEdit with welcome message after boot
  // Using ref to avoid stale closure - openWindow is stable via useCallback
  const openWindowRef = React.useRef(windows.openWindow);
  openWindowRef.current = windows.openWindow;

  // Check if just finished booting (only run intro once per session)
  useEffect(() => {
    const hasRunIntro = sessionStorage.getItem('zos-intro-complete');
    if (!hasRunIntro) {
      // Start intro sequence after a brief delay
      const timer = setTimeout(() => {
        setIntroPhase('dock');
      }, ANIMATION_DURATIONS.INTRO_START_DELAY);
      return () => clearTimeout(timer);
    } else {
      setIntroPhase('complete');
    }
  }, []);

  // Sequence: dock animation -> window open
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    if (introPhase === 'dock') {
      // After dock animation plays, open window
      timer = setTimeout(() => {
        setIntroPhase('window');
        setLaunchingApp('textedit');
        openWindowRef.current('TextEdit');
        // Mark intro as complete
        sessionStorage.setItem('zos-intro-complete', 'true');
      }, ANIMATION_DURATIONS.INTRO_WINDOW_DELAY);
    } else if (introPhase === 'window') {
      // Clear launching state after bounce animation
      timer = setTimeout(() => {
        setLaunchingApp(null);
        setIntroPhase('complete');
      }, ANIMATION_DURATIONS.APP_LAUNCH);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [introPhase]);

  // Send sample notifications on first load (demo purposes)
  useEffect(() => {
    if (introPhase === 'complete') {
      const hasSentNotifications = sessionStorage.getItem('zos-demo-notifications');
      if (!hasSentNotifications) {
        sessionStorage.setItem('zos-demo-notifications', 'true');
        // Delay notifications to not interrupt intro
        const timer = setTimeout(() => {
          addNotification({
            type: 'app',
            title: 'Welcome to zOS',
            body: 'Click the bell icon in the menu bar to view notifications and today widgets.',
            appName: 'System',
          });
          setTimeout(() => {
            addNotification({
              type: 'calendar',
              title: 'Team Standup',
              body: 'Starting in 30 minutes',
              appName: 'Calendar',
            });
          }, 2000);
          setTimeout(() => {
            addNotification({
              type: 'github',
              title: 'New PR Review',
              body: 'zeekay requested your review on "Add notification center"',
              appName: 'GitHub',
            });
          }, 4000);
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [introPhase, addNotification]);

  // Handle app launch with bounce animation
  const handleAppLaunch = useCallback((appId: string, openFn?: () => void) => {
    setLaunchingApp(appId);
    openFn?.();
    // Clear launching state after animation
    const timer = setTimeout(() => setLaunchingApp(null), ANIMATION_DURATIONS.DOCK_BOUNCE);
    return () => clearTimeout(timer);
  }, []);

  // Handle right-click context menu
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  // Stable references for event handlers to prevent memory leak from frequent re-registration
  const closeApplicationsRef = React.useRef(overlays.closeApplications);
  const closeDownloadsRef = React.useRef(overlays.closeDownloads);
  const closeAllOverlaysRef = React.useRef(overlays.closeAllOverlays);
  
  // Keep refs updated
  closeApplicationsRef.current = overlays.closeApplications;
  closeDownloadsRef.current = overlays.closeDownloads;
  closeAllOverlaysRef.current = overlays.closeAllOverlays;

  // Listen for Mission Control trigger from hot corner and swipe gestures
  useEffect(() => {
    const handleMissionControlTrigger = () => {
      overlays.openMissionControl();
    };

    window.addEventListener('zos:mission-control-trigger', handleMissionControlTrigger);
    return () => {
      window.removeEventListener('zos:mission-control-trigger', handleMissionControlTrigger);
    };
  }, [overlays]);

  // Close all menus when clicking elsewhere - uses refs to avoid frequent re-registration
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Don't close if clicking within dock or popover elements
      const isInDock = target.closest('[data-dock]');
      const isInPopover = target.closest('[data-popover]');

      setContextMenu(null);

      // Only close popovers if click is outside both dock and popover
      if (!isInDock && !isInPopover) {
        closeApplicationsRef.current();
        closeDownloadsRef.current();
      }
    };

    const handleWindowBlur = () => {
      setContextMenu(null);
      closeAllOverlaysRef.current();
    };

    document.addEventListener('click', handleClick);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('click', handleClick);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, []); // Empty deps - uses refs for stable handlers

  // App action handlers
  const handleQuitCurrentApp = useCallback(() => {
    if (windows.activeApp) {
      windows.closeWindow(windows.activeApp);
    }
  }, [windows]);

  const handleOpenSettings = useCallback(() => {
    windows.openWindow('System Preferences');
  }, [windows]);

  const handleMinimizeWindow = useCallback(() => {
    toast({ title: 'Window Minimized', description: `${windows.activeApp} window minimized.` });
  }, [windows.activeApp]);

  const handleHideApp = useCallback(() => {
    handleQuitCurrentApp();
    toast({ title: 'App Hidden', description: `${windows.activeApp} has been hidden.` });
  }, [windows.activeApp, handleQuitCurrentApp]);

  const handleScreenshot = useCallback(() => {
    playSound('screenshot');
    toast({ title: 'Screenshot Captured', description: 'Full screen screenshot saved to Desktop.' });
  }, []);

  const handleScreenshotSelection = useCallback(() => {
    playSound('screenshot');
    toast({ title: 'Screenshot Selection', description: 'Click and drag to select an area for screenshot.' });
  }, []);

  const handleToggleFocusMode = useCallback(() => {
    if (activeMode) {
      activateMode(null);
      toast({ title: 'Focus', description: 'Focus mode turned off.' });
    } else {
      // Activate DND by default
      const dnd = modes.find(m => m.id === 'dnd');
      activateMode(dnd?.id ?? modes[0]?.id ?? null);
      toast({ title: 'Focus', description: `${dnd?.name ?? 'Focus mode'} enabled.` });
    }
  }, [activeMode, modes, activateMode]);

  const handleForceQuitApp = useCallback((appName: AppType) => {
    windows.closeWindow(appName);
    toast({ title: 'Force Quit', description: `${appName} has been force quit.` });
  }, [windows]);

  // Handle desktop drop (files dropped on desktop create shortcuts/copies)
  const handleDesktopDrop = useCallback((item: DragItem, operation: DragOperation) => {
    if (item.itemType === 'url') {
      const url = item.data as string;
      toast({
        title: 'URL Dropped',
        description: `Created shortcut to ${url.substring(0, 40)}...`,
      });
    } else {
      const fileData = item.data as DragFileItem;
      const action = operation === 'copy' ? 'Copied' : operation === 'link' ? 'Created alias for' : 'Moved';
      toast({
        title: `${action} ${fileData.name}`,
        description: `${action} to Desktop`,
      });
    }
  }, []);

  // Desktop drop target
  const desktopDropTarget = useDropTarget(
    'desktop',
    ['file', 'folder', 'image', 'url'],
    handleDesktopDrop
  );

  // Screenshot toolbar state
  const [showScreenshotToolbar, setShowScreenshotToolbar] = useState(false);

  // Window switcher for same app (Cmd+`)
  const handleWindowSwitcher = useCallback(() => {
    // Cycle through windows of the same app
    if (windows.activeApp) {
      toast({ title: 'Window Switcher', description: `Cycling ${windows.activeApp} windows` });
    }
  }, [windows.activeApp]);

  // Show desktop (minimize all)
  const handleShowDesktop = useCallback(() => {
    windows.openApps.forEach(app => {
      windows.minimizeWindow(app);
    });
    toast({ title: 'Show Desktop', description: 'All windows minimized' });
  }, [windows]);

  // Dashboard/Widgets toggle
  const { toggleEditMode } = useWidgets();
  const handleDashboard = useCallback(() => {
    toggleEditMode();
    toast({ title: 'Widgets', description: 'Toggle widget edit mode' });
  }, [toggleEditMode]);

  // Screenshot toolbar
  const handleScreenshotToolbar = useCallback(() => {
    setShowScreenshotToolbar(true);
    toast({ title: 'Screenshot Toolbar', description: 'Select screenshot mode' });
  }, []);

  // Help
  const handleHelp = useCallback(() => {
    toast({ title: 'Help', description: 'Press Cmd+Space to search for help' });
  }, []);

  // File operations (placeholder handlers for app-specific behavior)
  const handleSaveFile = useCallback(() => {
    toast({ title: 'Save', description: 'Document saved' });
  }, []);

  const handleSaveAs = useCallback(() => {
    toast({ title: 'Save As', description: 'Opening save dialog...' });
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Edit operations (let browser handle, just provide visual feedback)
  const handleUndo = useCallback(() => {
    // Browser handles actual undo
  }, []);

  const handleRedo = useCallback(() => {
    // Browser handles actual redo
  }, []);

  const handleCut = useCallback(() => {
    // Browser handles actual cut
  }, []);

  const handleCopy = useCallback(() => {
    // Browser handles actual copy
  }, []);

  const handlePaste = useCallback(() => {
    // Browser handles actual paste
  }, []);

  const handleSelectAll = useCallback(() => {
    // Browser handles actual select all
  }, []);

  const handleFindNext = useCallback(() => {
    toast({ title: 'Find Next', description: 'Use Cmd+G to find next occurrence' });
  }, []);

  // Global Shortcuts registration
  const { register } = useGlobalShortcuts();

  // Create and register all system shortcuts
  const systemShortcuts = useMemo(() => createSystemShortcuts({
    spotlight: overlays.openSpotlight,
    appSwitcher: () => { if (windows.openApps.length > 0) { overlays.openAppSwitcher(); } },
    windowSwitcher: handleWindowSwitcher,
    hideApp: handleHideApp,
    minimizeWindow: handleMinimizeWindow,
    closeWindow: handleQuitCurrentApp,
    quitApp: handleQuitCurrentApp,
    preferences: handleOpenSettings,
    help: handleHelp,
    lockScreen,
    screenshot: handleScreenshot,
    screenshotSelection: handleScreenshotSelection,
    screenshotToolbar: handleScreenshotToolbar,
    showDesktop: handleShowDesktop,
    dashboard: handleDashboard,
    newDocument: () => windows.openWindow('Notes'),
    openFile: () => windows.openWindow('Finder'),
    saveFile: handleSaveFile,
    saveAs: handleSaveAs,
    print: handlePrint,
    undo: handleUndo,
    redo: handleRedo,
    cut: handleCut,
    copy: handleCopy,
    paste: handlePaste,
    selectAll: handleSelectAll,
    find: overlays.openSpotlight,
    findNext: handleFindNext,
    missionControl: overlays.toggleMissionControl,
    forceQuit: overlays.openForceQuit,
    clipboardManager: overlays.toggleClipboard,
    toggleFocusMode: handleToggleFocusMode,
  }), [
    overlays, windows, handleWindowSwitcher, handleHideApp, handleMinimizeWindow,
    handleQuitCurrentApp, handleOpenSettings, handleHelp, lockScreen, handleScreenshot,
    handleScreenshotSelection, handleScreenshotToolbar, handleShowDesktop, handleDashboard,
    handleSaveFile, handleSaveAs, handlePrint, handleUndo, handleRedo, handleCut,
    handleCopy, handlePaste, handleSelectAll, handleFindNext, handleToggleFocusMode,
  ]);

  // Register all shortcuts on mount
  useEffect(() => {
    const unregisters = systemShortcuts.map(s => register(s));

    // Also add Escape to close overlays (low priority, doesn't preventDefault)
    const escapeUnregister = register({
      id: 'global:escape-close',
      key: 'Escape',
      modifiers: [],
      action: overlays.closeAllOverlays,
      description: 'Close Overlay',
      category: 'global',
      priority: 10,
      preventDefault: false,
    });

    // Command palette alias (Cmd+K)
    const cmdKUnregister = register({
      id: 'global:cmd-k',
      key: 'k',
      modifiers: ['meta'],
      action: overlays.openSpotlight,
      description: 'Command Palette',
      category: 'global',
      priority: 90,
    });

    return () => {
      unregisters.forEach(u => u());
      escapeUnregister();
      cmdKUnregister();
    };
  }, [systemShortcuts, register, overlays]);

  // Compute active dock apps from window state
  const activeDockApps = useMemo(() => {
    return windows.openApps
      .map(app => APP_TO_DOCK_ID[app])
      .filter(Boolean) as string[];
  }, [windows.openApps]);

  // Apply dark mode class
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden" onContextMenu={handleContextMenu}>
      {/* Menu Bar */}
      <ZMenuBar
        appName={windows.activeApp ?? undefined}
        onQuitApp={handleQuitCurrentApp}
        onOpenSettings={handleOpenSettings}
        onAboutMac={overlays.openAbout}
        onAboutApp={(app) => setAboutApp(app)}
        onSleep={sleep}
        onRestart={restart}
        onShutdown={shutdown}
        onLockScreen={lockScreen}
        darkMode={settings.colorScheme === 'dark'}
        onToggleDarkMode={settings.toggleDarkMode}
      />

      {/* Background */}
      <AnimatedBackground theme={settings.theme} customImageUrl={settings.customBgUrl} />

      {/* Widgets Layer - Behind windows, above background */}
      <div className="absolute inset-0 z-[5] pointer-events-auto">
        <WidgetsLayer />
      </div>

      {/* Content Area - Click to focus Finder, supports drag & drop */}
      <div
        ref={desktopDropTarget.ref}
        className={`relative z-10 w-full h-full pt-[25px] pb-24 overflow-hidden transition-colors ${
          desktopDropTarget.isOver && desktopDropTarget.canDrop ? 'bg-blue-500/5' : ''
        }`}
        onClick={(e) => {
          // Only focus Finder if clicking directly on the desktop background (not on windows)
          if (e.target === e.currentTarget) {
            windows.focusWindow('Finder');
          }
        }}
        onDragOver={desktopDropTarget.onDragOver}
        onDragEnter={desktopDropTarget.onDragEnter}
        onDragLeave={desktopDropTarget.onDragLeave}
        onDrop={desktopDropTarget.onDrop}
      >
        {children}
      </div>

      {/* Application Windows */}
      {windows.isOpen('Finder') && (
        <ZFinderWindow 
          onClose={() => {
            windows.closeWindow('Finder');
            setFinderInitialPath(undefined);
          }} 
          onFocus={() => windows.focusWindow('Finder')} 
          initialPath={finderInitialPath}
        />
      )}
      {windows.isOpen('Terminal') && (
        <LazyZTerminalWindow onClose={() => windows.closeWindow('Terminal')} onFocus={() => windows.focusWindow('Terminal')} />
      )}
      {windows.isOpen('Safari') && (
        <LazyZSafariWindow onClose={() => windows.closeWindow('Safari')} onFocus={() => windows.focusWindow('Safari')} />
      )}
      {windows.isOpen('Music') && (
        <LazyZMusicWindow onClose={() => windows.closeWindow('Music')} onFocus={() => windows.focusWindow('Music')} />
      )}
      {windows.isOpen('Mail') && (
        <ZEmailWindow onClose={() => windows.closeWindow('Mail')} onFocus={() => windows.focusWindow('Mail')} />
      )}
      {windows.isOpen('Calendar') && (
        <LazyZCalendarWindow onClose={() => windows.closeWindow('Calendar')} onFocus={() => windows.focusWindow('Calendar')} />
      )}
      {windows.isOpen('System Preferences') && (
        <LazyZSystemPreferencesWindow
          onClose={() => windows.closeWindow('System Preferences')}
          onFocus={() => windows.focusWindow('System Preferences')}
        />
      )}
      {windows.isOpen('Photos') && (
        <LazyZPhotosWindow onClose={() => windows.closeWindow('Photos')} onFocus={() => windows.focusWindow('Photos')} />
      )}
      {windows.isOpen('FaceTime') && (
        <LazyZFaceTimeWindow onClose={() => windows.closeWindow('FaceTime')} onFocus={() => windows.focusWindow('FaceTime')} />
      )}
      {windows.isOpen('TextEdit') && (
        <ZTextPadWindow
          onClose={() => windows.closeWindow('TextEdit')}
          onFocus={() => windows.focusWindow('TextEdit')}
          onOpenHanzo={() => windows.openWindow('Hanzo AI')}
          onOpenLux={() => windows.openWindow('Lux Wallet')}
          onOpenZoo={() => windows.openWindow('Zoo')}
          onOpenTerminal={(command) => {
            if (command) {
              queueCommand(command);
            }
            windows.openWindow('Terminal');
          }}
        />
      )}
      {windows.isOpen('GitHub Stats') && (
        <LazyZGitHubStatsWindow onClose={() => windows.closeWindow('GitHub Stats')} onFocus={() => windows.focusWindow('GitHub Stats')} />
      )}
      {windows.isOpen('Messages') && (
        <LazyZMessagesWindow onClose={() => windows.closeWindow('Messages')} onFocus={() => windows.focusWindow('Messages')} />
      )}
      {windows.isOpen('Activity Monitor') && (
        <LazyZGitHubStatsWindow onClose={() => windows.closeWindow('Activity Monitor')} onFocus={() => windows.focusWindow('Activity Monitor')} />
      )}
      {windows.isOpen('Hanzo AI') && (
        <LazyHanzoAIWindow onClose={() => windows.closeWindow('Hanzo AI')} onFocus={() => windows.focusWindow('Hanzo AI')} />
      )}
      {windows.isOpen('Lux Wallet') && (
        <LazyLuxWalletWindow onClose={() => windows.closeWindow('Lux Wallet')} onFocus={() => windows.focusWindow('Lux Wallet')} />
      )}
      {windows.isOpen('Zoo') && (
        <LazyZooAssistantWindow onClose={() => windows.closeWindow('Zoo')} onFocus={() => windows.focusWindow('Zoo')} />
      )}
      {windows.isOpen('Xcode') && (
        <LazyZCodeWindow onClose={() => windows.closeWindow('Xcode')} onFocus={() => windows.focusWindow('Xcode')} />
      )}
      {windows.isOpen('Calculator') && (
        <ZCalculatorWindow onClose={() => windows.closeWindow('Calculator')} />
      )}
      {windows.isOpen('Clock') && (
        <ZClockWindow onClose={() => windows.closeWindow('Clock')} />
      )}
      {windows.isOpen('Weather') && (
        <LazyZWeatherWindow onClose={() => windows.closeWindow('Weather')} />
      )}
      {windows.isOpen('Stickies') && (
        <ZStickiesWindow onClose={() => windows.closeWindow('Stickies')} />
      )}
      {windows.isOpen('Notes') && (
        <LazyZNotesWindow onClose={() => windows.closeWindow('Notes')} onFocus={() => windows.focusWindow('Notes')} />
      )}
      {windows.isOpen('App Store') && (
        <LazyZAppStoreWindow onClose={() => windows.closeWindow('App Store')} />
      )}
      {windows.isOpen('Shortcuts') && (
        <LazyZShortcutsWindow onClose={() => windows.closeWindow('Shortcuts')} onFocus={() => windows.focusWindow('Shortcuts')} />
      )}

      {/* Dock Popovers */}
      <ApplicationsPopover
        isOpen={overlays.applications}
        onClose={overlays.closeApplications}
        onOpenNotes={() => windows.openWindow('Notes')}
        onOpenGitHub={() => windows.openWindow('GitHub Stats')}
        onOpenStats={() => windows.openWindow('Activity Monitor')}
        onOpenSettings={() => windows.openWindow('System Preferences')}
        onOpenHanzo={() => windows.openWindow('Hanzo AI')}
        onOpenLux={() => windows.openWindow('Lux Wallet')}
        onOpenZoo={() => windows.openWindow('Zoo')}
        onOpenCalculator={() => windows.openWindow('Calculator')}
        onOpenClock={() => windows.openWindow('Clock')}
        onOpenWeather={() => windows.openWindow('Weather')}
        onOpenStickies={() => windows.openWindow('Stickies')}
        onOpenXcode={() => windows.openWindow('Xcode')}
        onOpenAppStore={() => windows.openWindow('App Store')}
        onOpenShortcuts={() => windows.openWindow('Shortcuts')}
      />

      <DownloadsPopover
        isOpen={overlays.downloads}
        onClose={overlays.closeDownloads}
        onOpenFinder={() => windows.openWindow('Finder')}
      />

      {/* About Window */}
      {overlays.about && <AboutZosWindow onClose={overlays.closeAbout} />}

      {/* About App Dialog */}
      <AboutAppDialog
        appName={aboutApp ?? ''}
        isOpen={aboutApp !== null}
        onClose={() => setAboutApp(null)}
      />

      {/* Overlays */}
      <AppSwitcher
        isOpen={overlays.appSwitcher}
        onClose={overlays.closeAppSwitcher}
        openApps={windows.openApps}
        currentApp={windows.activeApp ?? 'Finder'}
        onSelectApp={(app) => { windows.openWindow(app); overlays.closeAppSwitcher(); }}
      />

      <SpotlightSearch
        isOpen={overlays.spotlight}
        onClose={overlays.closeSpotlight}
        onOpenApp={windows.openWindow}
        onQuitApp={handleQuitCurrentApp}
        onOpenSettings={handleOpenSettings}
      />

      <ForceQuitDialog
        isOpen={overlays.forceQuit}
        onClose={overlays.closeForceQuit}
        openApps={windows.openApps}
        onForceQuit={handleForceQuitApp}
      />

      <ClipboardManager
        isOpen={overlays.clipboard}
        onClose={overlays.closeClipboard}
      />

      <MissionControl
        isOpen={overlays.missionControl}
        onClose={overlays.closeMissionControl}
        openApps={windows.openApps}
        onSelectApp={windows.openWindow}
        onFocusWindow={windows.focusWindow}
      />

      {/* Screenshot Toolbar */}
      <ScreenshotToolbar
        isOpen={showScreenshotToolbar}
        onClose={() => setShowScreenshotToolbar(false)}
      />

      {/* Context Menu */}
      <DesktopContextMenu
        position={contextMenu}
        onClose={() => setContextMenu(null)}
        onOpenSettings={handleOpenSettings}
        onChangeBackground={settings.setTheme}
        onShowInfo={(title, description) => {
          setInfoDialogContent({ title, description });
          setShowInfoDialog(true);
        }}
      />

      {/* Info Dialog */}
      <Dialog open={showInfoDialog} onOpenChange={setShowInfoDialog}>
        <DialogContent className="bg-black/90 backdrop-blur-xl border-white/20 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">{infoDialogContent.title}</DialogTitle>
            <DialogDescription className="text-white/70">{infoDialogContent.description}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Dock */}
      <ZDock
        onFinderClick={() => handleAppLaunch('finder', () => windows.openWindow('Finder'))}
        onTerminalClick={() => handleAppLaunch('terminal', () => windows.openWindow('Terminal'))}
        onTextEditClick={() => handleAppLaunch('textedit', () => windows.openWindow('TextEdit'))}
        onSafariClick={() => handleAppLaunch('safari', () => windows.openWindow('Safari'))}
        onMusicClick={() => handleAppLaunch('music', () => windows.openWindow('Music'))}
        onSocialsClick={() => handleAppLaunch('socials', () => windows.openWindow('Messages'))}
        onMailClick={() => handleAppLaunch('mail', () => windows.openWindow('Mail'))}
        onCalendarClick={() => handleAppLaunch('calendar', () => windows.openWindow('Calendar'))}
        onPhotosClick={() => handleAppLaunch('photos', () => windows.openWindow('Photos'))}
        onFaceTimeClick={() => handleAppLaunch('facetime', () => windows.openWindow('FaceTime'))}
        onHanzoClick={() => handleAppLaunch('hanzo', () => windows.openWindow('Hanzo AI'))}
        onLuxClick={() => handleAppLaunch('lux', () => windows.openWindow('Lux Wallet'))}
        onZooClick={() => handleAppLaunch('zoo', () => windows.openWindow('Zoo'))}
        onApplicationsClick={overlays.toggleApplications}
        onDownloadsClick={overlays.toggleDownloads}
        onTrashClick={() => {
          setFinderInitialPath(['Trash']);
          windows.openWindow('Finder');
        }}
        activeApps={activeDockApps}
        launchingApp={launchingApp}
        introAnimation={introPhase === 'dock'}
      />
    </div>
  );
};

export default ZDesktop;
