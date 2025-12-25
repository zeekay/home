import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSystem } from '@/App';
import { ANIMATION_DURATIONS } from '@/utils/animationConstants';
import ZDock from './ZDock';
import ZMenuBar from './ZMenuBar';
// Lightweight windows loaded synchronously
import ZFinderWindow from './ZFinderWindow';
import ZEmailWindow from './ZEmailWindow';
import ZTextPadWindow from './ZTextPadWindow';
import ZSocialsWindow from './ZSocialsWindow';
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
} from './LazyWindows';
import ApplicationsPopover from './dock/ApplicationsPopover';
import DownloadsPopover from './dock/DownloadsPopover';
import AboutZosWindow from './AboutZosWindow';
import AnimatedBackground from './AnimatedBackground';
import AppSwitcher from './AppSwitcher';
import SpotlightSearch from './SpotlightSearch';
import ForceQuitDialog from './ForceQuitDialog';
import DesktopContextMenu from './DesktopContextMenu';
import {
  useWindowManager,
  useDesktopSettings,
  useOverlays,
  useKeyboardShortcuts,
  toast,
  type AppType,
  type KeyboardShortcut,
} from '@/hooks';
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
};

const ZDesktop: React.FC<ZDesktopProps> = ({ children }) => {
  // System controls
  const { sleep, restart, shutdown, lockScreen } = useSystem();

  // Custom hooks for state management
  const windows = useWindowManager();
  const settings = useDesktopSettings();
  const overlays = useOverlays();

  // Info dialog state
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [infoDialogContent, setInfoDialogContent] = useState({ title: '', description: '' });

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

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

  // Close all menus when clicking elsewhere - uses refs to avoid frequent re-registration
  useEffect(() => {
    const handleClick = () => {
      setContextMenu(null);
      closeApplicationsRef.current();
      closeDownloadsRef.current();
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
    toast({ title: 'Screenshot Captured', description: 'Full screen screenshot saved to Desktop.' });
  }, []);

  const handleScreenshotSelection = useCallback(() => {
    toast({ title: 'Screenshot Selection', description: 'Click and drag to select an area for screenshot.' });
  }, []);

  const handleForceQuitApp = useCallback((appName: AppType) => {
    windows.closeWindow(appName);
    toast({ title: 'Force Quit', description: `${appName} has been force quit.` });
  }, [windows]);

  // Keyboard shortcuts
  const shortcuts: KeyboardShortcut[] = useMemo(() => [
    { key: 'n', meta: true, action: () => windows.openWindow('Notes'), description: 'New Note' },
    { key: ',', meta: true, action: handleOpenSettings, description: 'Open Settings' },
    { key: 'q', meta: true, action: handleQuitCurrentApp, description: 'Quit App' },
    { key: 'w', meta: true, action: handleQuitCurrentApp, description: 'Close Window' },
    { key: 'm', meta: true, action: handleMinimizeWindow, description: 'Minimize Window' },
    { key: 'h', meta: true, action: handleHideApp, description: 'Hide App' },
    { key: 'Tab', meta: true, action: () => { if (windows.openApps.length > 0) { overlays.openAppSwitcher(); } }, description: 'App Switcher' },
    { key: ' ', meta: true, action: overlays.openSpotlight, description: 'Spotlight Search' },
    { key: '3', meta: true, shift: true, action: handleScreenshot, description: 'Screenshot' },
    { key: '4', meta: true, shift: true, action: handleScreenshotSelection, description: 'Screenshot Selection' },
    { key: 'Escape', meta: true, alt: true, action: overlays.openForceQuit, description: 'Force Quit' },
    { key: 'q', meta: true, ctrl: true, action: lockScreen, description: 'Lock Screen' },
    { key: 'f', meta: true, action: overlays.openSpotlight, description: 'Find' },
    { key: 'o', meta: true, action: () => windows.openWindow('Finder'), description: 'Open Finder' },
    { key: 'Escape', action: overlays.closeAllOverlays, description: 'Close Overlay', preventDefault: false },
  ], [windows, overlays, handleOpenSettings, handleQuitCurrentApp, handleMinimizeWindow, handleHideApp, handleScreenshot, handleScreenshotSelection, lockScreen]);

  useKeyboardShortcuts({ shortcuts });

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
        onSleep={sleep}
        onRestart={restart}
        onShutdown={shutdown}
        onLockScreen={lockScreen}
        darkMode={settings.colorScheme === 'dark'}
        onToggleDarkMode={settings.toggleDarkMode}
      />

      {/* Background */}
      <AnimatedBackground theme={settings.theme} customImageUrl={settings.customBgUrl} />

      {/* Content Area - Click to focus Finder */}
      <div 
        className="relative z-10 w-full h-full pt-[25px] pb-24 overflow-hidden"
        onClick={(e) => {
          // Only focus Finder if clicking directly on the desktop background (not on windows)
          if (e.target === e.currentTarget) {
            windows.focusWindow('Finder');
          }
        }}
      >
        {children}
      </div>

      {/* Application Windows */}
      {windows.isOpen('Finder') && (
        <ZFinderWindow onClose={() => windows.closeWindow('Finder')} onFocus={() => windows.focusWindow('Finder')} />
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
          theme={settings.theme}
          customBgUrl={settings.customBgUrl}
          onThemeChange={settings.setTheme}
          onCustomBgUrlChange={settings.setCustomBgUrl}
          colorScheme={settings.colorScheme}
          windowTransparency={settings.windowTransparency}
          fontSize={settings.fontSize}
          onColorSchemeChange={settings.setColorScheme}
          onWindowTransparencyChange={settings.setWindowTransparency}
          onFontSizeChange={settings.setFontSize}
          dockPosition={settings.dockPosition}
          dockSize={settings.dockSize}
          dockMagnification={settings.dockMagnification}
          dockMagnificationSize={settings.dockMagnificationSize}
          dockAutoHide={settings.dockAutoHide}
          onDockPositionChange={settings.setDockPosition}
          onDockSizeChange={settings.setDockSize}
          onDockMagnificationChange={settings.setDockMagnification}
          onDockMagnificationSizeChange={settings.setDockMagnificationSize}
          onDockAutoHideChange={settings.setDockAutoHide}
        />
      )}
      {windows.isOpen('Photos') && (
        <LazyZPhotosWindow onClose={() => windows.closeWindow('Photos')} onFocus={() => windows.focusWindow('Photos')} />
      )}
      {windows.isOpen('FaceTime') && (
        <LazyZFaceTimeWindow onClose={() => windows.closeWindow('FaceTime')} onFocus={() => windows.focusWindow('FaceTime')} />
      )}
      {windows.isOpen('TextEdit') && (
        <ZTextPadWindow onClose={() => windows.closeWindow('TextEdit')} onFocus={() => windows.focusWindow('TextEdit')} />
      )}
      {windows.isOpen('GitHub Stats') && (
        <LazyZGitHubStatsWindow onClose={() => windows.closeWindow('GitHub Stats')} onFocus={() => windows.focusWindow('GitHub Stats')} />
      )}
      {windows.isOpen('Messages') && (
        <ZSocialsWindow onClose={() => windows.closeWindow('Messages')} onFocus={() => windows.focusWindow('Messages')} />
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
      />

      <DownloadsPopover
        isOpen={overlays.downloads}
        onClose={overlays.closeDownloads}
        onOpenFinder={() => windows.openWindow('Finder')}
      />

      {/* About Window */}
      {overlays.about && <AboutZosWindow onClose={overlays.closeAbout} />}

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
        activeApps={activeDockApps}
        launchingApp={launchingApp}
        introAnimation={introPhase === 'dock'}
      />
    </div>
  );
};

export default ZDesktop;
