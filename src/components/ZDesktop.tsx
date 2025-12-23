import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSystem } from '@/App';
import ZDock from './ZDock';
import ZMenuBar from './ZMenuBar';
import ZTerminalWindow from './ZTerminalWindow';
import ZSafariWindow from './ZSafariWindow';
import ZFinderWindow from './ZFinderWindow';
import ZMusicWindow from './ZMusicWindow';
import ZEmailWindow from './ZEmailWindow';
import ZCalendarWindow from './ZCalendarWindow';
import ZSystemPreferencesWindow from './ZSystemPreferencesWindow';
import ZPhotosWindow from './ZPhotosWindow';
import ZFaceTimeWindow from './ZFaceTimeWindow';
import ZTextPadWindow from './ZTextPadWindow';
import ZGitHubStatsWindow from './ZGitHubStatsWindow';
import ZSocialsWindow from './ZSocialsWindow';
import ZStatsWindow from './ZStatsWindow';
import ZCalculatorWindow from './ZCalculatorWindow';
import ZClockWindow from './ZClockWindow';
import ZWeatherWindow from './ZWeatherWindow';
import ZStickiesWindow from './ZStickiesWindow';
import HanzoAIWindow from './HanzoAIWindow';
import LuxWalletWindow from './LuxWalletWindow';
import ZooAssistantWindow from './ZooAssistantWindow';
import ApplicationsPopover from './dock/ApplicationsPopover';
import DownloadsPopover from './dock/DownloadsPopover';
import AboutZosWindow from './AboutZosWindow';
import AnimatedBackground from './AnimatedBackground';
import AppSwitcher from './AppSwitcher';
import SpotlightSearch from './SpotlightSearch';
import ForceQuitDialog from './ForceQuitDialog';
import { useKeyboardShortcuts, KeyboardShortcut } from '@/hooks/useKeyboardShortcuts';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Image,
  FolderOpen,
  Info,
  Trash2,
  Monitor,
  Layout,
  SortAsc,
  Eye,
  Grid3X3,
  ChevronRight,
} from 'lucide-react';

interface ZDesktopProps {
  children: React.ReactNode;
}

interface ContextMenuPosition {
  x: number;
  y: number;
}

// App type for tracking active application
type AppType = 'Finder' | 'Terminal' | 'Safari' | 'Music' | 'Mail' | 'Calendar' | 
               'System Preferences' | 'Photos' | 'FaceTime' | 'Notes' | 
               'GitHub Stats' | 'Messages' | 'Activity Monitor' | 'Hanzo AI' | 
               'Lux Wallet' | 'Zoo' | 'Calculator' | 'Clock' | 'Weather' | 'Stickies';

const ZDesktop: React.FC<ZDesktopProps> = ({ children }) => {
  // System controls
  const { sleep, restart, shutdown, lockScreen } = useSystem();

  // Window visibility states
  const [showFinder, setShowFinder] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [showSafari, setShowSafari] = useState(false);
  const [showMusic, setShowMusic] = useState(false);
  const [showSocials, setShowSocials] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showSystemPreferences, setShowSystemPreferences] = useState(false);
  const [showPhotos, setShowPhotos] = useState(false);
  const [showFaceTime, setShowFaceTime] = useState(false);
  const [showTextPad, setShowTextPad] = useState(false);
  const [showGitHubStats, setShowGitHubStats] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showHanzoAI, setShowHanzoAI] = useState(false);
  const [showLuxWallet, setShowLuxWallet] = useState(false);
  const [showZooAssistant, setShowZooAssistant] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showClock, setShowClock] = useState(false);
  const [showWeather, setShowWeather] = useState(false);
  const [showStickies, setShowStickies] = useState(false);
  const [showApplications, setShowApplications] = useState(false);
  const [showDownloads, setShowDownloads] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  // Keyboard shortcut overlay states
  const [showAppSwitcher, setShowAppSwitcher] = useState(false);
  const [showSpotlight, setShowSpotlight] = useState(false);
  const [showForceQuit, setShowForceQuit] = useState(false);

  // Info dialog state
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [infoDialogContent, setInfoDialogContent] = useState<{
    title: string;
    description: string;
  }>({ title: '', description: '' });

  // Active app for menu bar
  const [activeApp, setActiveApp] = useState<AppType>('Finder');

  // Context menu state
  const [contextMenu, setContextMenu] = useState<ContextMenuPosition | null>(null);
  const [showSortSubmenu, setShowSortSubmenu] = useState(false);
  const [showViewSubmenu, setShowViewSubmenu] = useState(false);

  // Desktop customization settings
  const [theme, setTheme] = useState('wireframe');
  const [customBgUrl, setCustomBgUrl] = useState('');

  // Appearance settings
  const [colorScheme, setColorScheme] = useState<'dark' | 'light' | 'auto'>('dark');
  const [windowTransparency, setWindowTransparency] = useState(20);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');

  // Dock settings
  const [dockPosition, setDockPosition] = useState<'bottom' | 'left' | 'right'>('bottom');
  const [dockSize, setDockSize] = useState(64);
  const [dockMagnification, setDockMagnification] = useState(true);
  const [dockMagnificationSize, setDockMagnificationSize] = useState(128);
  const [dockAutoHide, setDockAutoHide] = useState(false);

  // Auto open TextPad with welcome message on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTextPad(true);
      setActiveApp('Notes');
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Handle right-click context menu
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
    setShowSortSubmenu(false);
    setShowViewSubmenu(false);
  }, []);

  // Close context menu when clicking elsewhere
  useEffect(() => {
    const handleClick = () => {
      setContextMenu(null);
      setShowSortSubmenu(false);
      setShowViewSubmenu(false);
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // App toggle handlers with active app tracking
  const handleOpenApp = (setter: React.Dispatch<React.SetStateAction<boolean>>, appName: AppType) => {
    setter(true);
    setActiveApp(appName);
  };

  const handleCloseApp = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    setter(false);
    setActiveApp('Finder');
  };

  const handleFocusApp = (appName: AppType) => {
    setActiveApp(appName);
  };

  // Menu bar action handlers
  const handleQuitCurrentApp = useCallback(() => {
    // Close the current active app
    switch (activeApp) {
      case 'Finder': setShowFinder(false); break;
      case 'Terminal': setShowTerminal(false); break;
      case 'Safari': setShowSafari(false); break;
      case 'Music': setShowMusic(false); break;
      case 'Mail': setShowEmail(false); break;
      case 'Calendar': setShowCalendar(false); break;
      case 'System Preferences': setShowSystemPreferences(false); break;
      case 'Photos': setShowPhotos(false); break;
      case 'FaceTime': setShowFaceTime(false); break;
      case 'Notes': setShowTextPad(false); break;
      case 'GitHub Stats': setShowGitHubStats(false); break;
      case 'Messages': setShowSocials(false); break;
      case 'Activity Monitor': setShowStats(false); break;
      case 'Hanzo AI': setShowHanzoAI(false); break;
      case 'Lux Wallet': setShowLuxWallet(false); break;
      case 'Zoo': setShowZooAssistant(false); break;
      case 'Calculator': setShowCalculator(false); break;
      case 'Clock': setShowClock(false); break;
      case 'Weather': setShowWeather(false); break;
      case 'Stickies': setShowStickies(false); break;
    }
    setActiveApp('Finder');
  }, [activeApp]);

  const handleOpenSettings = useCallback(() => {
    handleOpenApp(setShowSystemPreferences, 'System Preferences');
  }, []);

  const handleOpenAbout = useCallback(() => {
    setShowAbout(true);
  }, []);

  // Background theme handlers
  const handleChangeBackground = (newTheme: string) => {
    setTheme(newTheme);
    setContextMenu(null);
  };

  // Apply custom document styles
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Get list of open apps for app switcher
  const openApps = useMemo((): AppType[] => {
    const apps: AppType[] = [];
    if (showFinder) apps.push('Finder');
    if (showTerminal) apps.push('Terminal');
    if (showSafari) apps.push('Safari');
    if (showMusic) apps.push('Music');
    if (showEmail) apps.push('Mail');
    if (showCalendar) apps.push('Calendar');
    if (showSystemPreferences) apps.push('System Preferences');
    if (showPhotos) apps.push('Photos');
    if (showFaceTime) apps.push('FaceTime');
    if (showTextPad) apps.push('Notes');
    if (showGitHubStats) apps.push('GitHub Stats');
    if (showSocials) apps.push('Messages');
    if (showStats) apps.push('Activity Monitor');
    if (showHanzoAI) apps.push('Hanzo AI');
    if (showLuxWallet) apps.push('Lux Wallet');
    if (showZooAssistant) apps.push('Zoo');
    if (showCalculator) apps.push('Calculator');
    if (showClock) apps.push('Clock');
    if (showWeather) apps.push('Weather');
    if (showStickies) apps.push('Stickies');
    return apps;
  }, [
    showFinder, showTerminal, showSafari, showMusic, showEmail, showCalendar,
    showSystemPreferences, showPhotos, showFaceTime, showTextPad, showGitHubStats,
    showSocials, showStats, showHanzoAI, showLuxWallet, showZooAssistant,
    showCalculator, showClock, showWeather, showStickies
  ]);

  // Handler to open app by name (for spotlight and app switcher)
  const handleOpenAppByName = useCallback((appName: AppType) => {
    switch (appName) {
      case 'Finder': handleOpenApp(setShowFinder, 'Finder'); break;
      case 'Terminal': handleOpenApp(setShowTerminal, 'Terminal'); break;
      case 'Safari': handleOpenApp(setShowSafari, 'Safari'); break;
      case 'Music': handleOpenApp(setShowMusic, 'Music'); break;
      case 'Mail': handleOpenApp(setShowEmail, 'Mail'); break;
      case 'Calendar': handleOpenApp(setShowCalendar, 'Calendar'); break;
      case 'System Preferences': handleOpenApp(setShowSystemPreferences, 'System Preferences'); break;
      case 'Photos': handleOpenApp(setShowPhotos, 'Photos'); break;
      case 'FaceTime': handleOpenApp(setShowFaceTime, 'FaceTime'); break;
      case 'Notes': handleOpenApp(setShowTextPad, 'Notes'); break;
      case 'GitHub Stats': handleOpenApp(setShowGitHubStats, 'GitHub Stats'); break;
      case 'Messages': handleOpenApp(setShowSocials, 'Messages'); break;
      case 'Activity Monitor': handleOpenApp(setShowStats, 'Activity Monitor'); break;
      case 'Hanzo AI': handleOpenApp(setShowHanzoAI, 'Hanzo AI'); break;
      case 'Lux Wallet': handleOpenApp(setShowLuxWallet, 'Lux Wallet'); break;
      case 'Zoo': handleOpenApp(setShowZooAssistant, 'Zoo'); break;
      case 'Calculator': handleOpenApp(setShowCalculator, 'Calculator'); break;
      case 'Clock': handleOpenApp(setShowClock, 'Clock'); break;
      case 'Weather': handleOpenApp(setShowWeather, 'Weather'); break;
      case 'Stickies': handleOpenApp(setShowStickies, 'Stickies'); break;
    }
  }, []);

  // Handler to force quit app by name
  const handleForceQuitApp = useCallback((appName: AppType) => {
    switch (appName) {
      case 'Finder': setShowFinder(false); break;
      case 'Terminal': setShowTerminal(false); break;
      case 'Safari': setShowSafari(false); break;
      case 'Music': setShowMusic(false); break;
      case 'Mail': setShowEmail(false); break;
      case 'Calendar': setShowCalendar(false); break;
      case 'System Preferences': setShowSystemPreferences(false); break;
      case 'Photos': setShowPhotos(false); break;
      case 'FaceTime': setShowFaceTime(false); break;
      case 'Notes': setShowTextPad(false); break;
      case 'GitHub Stats': setShowGitHubStats(false); break;
      case 'Messages': setShowSocials(false); break;
      case 'Activity Monitor': setShowStats(false); break;
      case 'Hanzo AI': setShowHanzoAI(false); break;
      case 'Lux Wallet': setShowLuxWallet(false); break;
      case 'Zoo': setShowZooAssistant(false); break;
      case 'Calculator': setShowCalculator(false); break;
      case 'Clock': setShowClock(false); break;
      case 'Weather': setShowWeather(false); break;
      case 'Stickies': setShowStickies(false); break;
    }
    if (activeApp === appName) {
      setActiveApp('Finder');
    }
    toast({
      title: 'Force Quit',
      description: `${appName} has been force quit.`,
    });
  }, [activeApp]);

  // Minimize current window handler
  const handleMinimizeWindow = useCallback(() => {
    toast({
      title: 'Window Minimized',
      description: `${activeApp} window minimized.`,
    });
  }, [activeApp]);

  // Hide current app handler
  const handleHideApp = useCallback(() => {
    handleQuitCurrentApp();
    toast({
      title: 'App Hidden',
      description: `${activeApp} has been hidden.`,
    });
  }, [activeApp, handleQuitCurrentApp]);

  // Screenshot handlers
  const handleScreenshot = useCallback(() => {
    toast({
      title: 'Screenshot Captured',
      description: 'Full screen screenshot saved to Desktop.',
    });
  }, []);

  const handleScreenshotSelection = useCallback(() => {
    toast({
      title: 'Screenshot Selection',
      description: 'Click and drag to select an area for screenshot.',
    });
  }, []);

  // Define keyboard shortcuts
  const shortcuts: KeyboardShortcut[] = useMemo(() => [
    // Cmd+N: New Note/TextPad window
    {
      key: 'n',
      meta: true,
      action: () => handleOpenApp(setShowTextPad, 'Notes'),
      description: 'New Note',
    },
    // Cmd+,: Open System Preferences
    {
      key: ',',
      meta: true,
      action: handleOpenSettings,
      description: 'Open Settings',
    },
    // Cmd+Q: Quit current app
    {
      key: 'q',
      meta: true,
      action: handleQuitCurrentApp,
      description: 'Quit App',
    },
    // Cmd+W: Close current window
    {
      key: 'w',
      meta: true,
      action: handleQuitCurrentApp,
      description: 'Close Window',
    },
    // Cmd+M: Minimize current window
    {
      key: 'm',
      meta: true,
      action: handleMinimizeWindow,
      description: 'Minimize Window',
    },
    // Cmd+H: Hide current app
    {
      key: 'h',
      meta: true,
      action: handleHideApp,
      description: 'Hide App',
    },
    // Cmd+Tab: App switcher
    {
      key: 'Tab',
      meta: true,
      action: () => {
        if (openApps.length > 0) {
          setShowAppSwitcher(true);
        }
      },
      description: 'App Switcher',
    },
    // Cmd+Space: Spotlight search
    {
      key: ' ',
      meta: true,
      action: () => setShowSpotlight(true),
      description: 'Spotlight Search',
    },
    // Cmd+Shift+3: Screenshot
    {
      key: '3',
      meta: true,
      shift: true,
      action: handleScreenshot,
      description: 'Screenshot',
    },
    // Cmd+Shift+4: Screenshot selection
    {
      key: '4',
      meta: true,
      shift: true,
      action: handleScreenshotSelection,
      description: 'Screenshot Selection',
    },
    // Cmd+Option+Esc: Force quit dialog
    {
      key: 'Escape',
      meta: true,
      alt: true,
      action: () => setShowForceQuit(true),
      description: 'Force Quit',
    },
  ], [
    handleOpenSettings, handleQuitCurrentApp, handleMinimizeWindow,
    handleHideApp, handleScreenshot, handleScreenshotSelection, openApps
  ]);

  // Register keyboard shortcuts
  useKeyboardShortcuts({ shortcuts });

  // Context menu item component
  const ContextMenuItem: React.FC<{
    icon?: React.ReactNode;
    label: string;
    shortcut?: string;
    onClick?: () => void;
    hasSubmenu?: boolean;
    onMouseEnter?: () => void;
    disabled?: boolean;
  }> = ({ icon, label, shortcut, onClick, hasSubmenu, onMouseEnter, disabled }) => (
    <div
      className={`flex items-center justify-between mx-1.5 px-3 py-[6px] rounded-[5px] cursor-pointer transition-colors ${
        disabled ? 'opacity-40 cursor-default' : 'hover:bg-blue-500'
      }`}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={onMouseEnter}
    >
      <span className="flex items-center gap-2.5">
        {icon && <span className="w-4 h-4 flex items-center justify-center opacity-70">{icon}</span>}
        <span>{label}</span>
      </span>
      {shortcut && <span className="text-white/50 ml-6 text-xs">{shortcut}</span>}
      {hasSubmenu && <ChevronRight className="w-3 h-3 opacity-50 ml-2" />}
    </div>
  );

  const ContextMenuSeparator = () => (
    <div className="h-[1px] bg-white/10 my-[6px] mx-3" />
  );

  return (
    <div className="relative w-full h-screen overflow-hidden" onContextMenu={handleContextMenu}>
      {/* zOS Menu Bar - always on top */}
      <ZMenuBar
        appName={activeApp}
        onQuitApp={handleQuitCurrentApp}
        onOpenSettings={handleOpenSettings}
        onAboutMac={handleOpenAbout}
        onSleep={sleep}
        onRestart={restart}
        onShutdown={shutdown}
        onLockScreen={lockScreen}
      />

      {/* Animated Background */}
      <AnimatedBackground theme={theme} customImageUrl={customBgUrl} />

      {/* Content Area */}
      <div className="relative z-10 w-full h-full pt-[25px] pb-24 overflow-auto">
        {children}
      </div>

      {/* Application Windows */}
      {showFinder && (
        <ZFinderWindow
          onClose={() => handleCloseApp(setShowFinder)}
          onFocus={() => handleFocusApp('Finder')}
        />
      )}

      {showTerminal && (
        <ZTerminalWindow
          onClose={() => handleCloseApp(setShowTerminal)}
          onFocus={() => handleFocusApp('Terminal')}
        />
      )}

      {showSafari && (
        <ZSafariWindow 
          onClose={() => handleCloseApp(setShowSafari)}
          onFocus={() => handleFocusApp('Safari')}
        />
      )}

      {showMusic && (
        <ZMusicWindow 
          onClose={() => handleCloseApp(setShowMusic)}
          onFocus={() => handleFocusApp('Music')}
        />
      )}

      {showEmail && (
        <ZEmailWindow 
          onClose={() => handleCloseApp(setShowEmail)}
          onFocus={() => handleFocusApp('Mail')}
        />
      )}

      {showCalendar && (
        <ZCalendarWindow 
          onClose={() => handleCloseApp(setShowCalendar)}
          onFocus={() => handleFocusApp('Calendar')}
        />
      )}

      {showSystemPreferences && (
        <ZSystemPreferencesWindow
          onClose={() => handleCloseApp(setShowSystemPreferences)}
          onFocus={() => handleFocusApp('System Preferences')}
          // Display settings
          theme={theme}
          customBgUrl={customBgUrl}
          onThemeChange={setTheme}
          onCustomBgUrlChange={setCustomBgUrl}
          // Appearance settings
          colorScheme={colorScheme}
          windowTransparency={windowTransparency}
          fontSize={fontSize}
          onColorSchemeChange={setColorScheme}
          onWindowTransparencyChange={setWindowTransparency}
          onFontSizeChange={setFontSize}
          // Dock settings
          dockPosition={dockPosition}
          dockSize={dockSize}
          dockMagnification={dockMagnification}
          dockMagnificationSize={dockMagnificationSize}
          dockAutoHide={dockAutoHide}
          onDockPositionChange={setDockPosition}
          onDockSizeChange={setDockSize}
          onDockMagnificationChange={setDockMagnification}
          onDockMagnificationSizeChange={setDockMagnificationSize}
          onDockAutoHideChange={setDockAutoHide}
        />
      )}

      {showPhotos && (
        <ZPhotosWindow 
          onClose={() => handleCloseApp(setShowPhotos)}
          onFocus={() => handleFocusApp('Photos')}
        />
      )}

      {showFaceTime && (
        <ZFaceTimeWindow 
          onClose={() => handleCloseApp(setShowFaceTime)}
          onFocus={() => handleFocusApp('FaceTime')}
        />
      )}

      {showTextPad && (
        <ZTextPadWindow 
          onClose={() => handleCloseApp(setShowTextPad)}
          onFocus={() => handleFocusApp('Notes')}
        />
      )}

      {showGitHubStats && (
        <ZGitHubStatsWindow 
          onClose={() => handleCloseApp(setShowGitHubStats)}
          onFocus={() => handleFocusApp('GitHub Stats')}
        />
      )}

      {showSocials && (
        <ZSocialsWindow 
          onClose={() => handleCloseApp(setShowSocials)}
          onFocus={() => handleFocusApp('Messages')}
        />
      )}

      {showStats && (
        <ZStatsWindow 
          onClose={() => handleCloseApp(setShowStats)}
          onFocus={() => handleFocusApp('Activity Monitor')}
        />
      )}

      {showHanzoAI && (
        <HanzoAIWindow 
          onClose={() => handleCloseApp(setShowHanzoAI)}
          onFocus={() => handleFocusApp('Hanzo AI')}
        />
      )}

      {showLuxWallet && (
        <LuxWalletWindow 
          onClose={() => handleCloseApp(setShowLuxWallet)}
          onFocus={() => handleFocusApp('Lux Wallet')}
        />
      )}

      {showZooAssistant && (
        <ZooAssistantWindow 
          onClose={() => handleCloseApp(setShowZooAssistant)}
          onFocus={() => handleFocusApp('Zoo')}
        />
      )}

      {showCalculator && (
        <ZCalculatorWindow 
          onClose={() => handleCloseApp(setShowCalculator)}
        />
      )}

      {showClock && (
        <ZClockWindow 
          onClose={() => handleCloseApp(setShowClock)}
        />
      )}

      {showWeather && (
        <ZWeatherWindow 
          onClose={() => handleCloseApp(setShowWeather)}
        />
      )}

      {showStickies && (
        <ZStickiesWindow 
          onClose={() => handleCloseApp(setShowStickies)}
        />
      )}

      {/* Applications Popover */}
      <ApplicationsPopover
        isOpen={showApplications}
        onClose={() => setShowApplications(false)}
        onOpenNotes={() => handleOpenApp(setShowTextPad, 'Notes')}
        onOpenGitHub={() => handleOpenApp(setShowGitHubStats, 'GitHub Stats')}
        onOpenStats={() => handleOpenApp(setShowStats, 'Activity Monitor')}
        onOpenSettings={() => handleOpenApp(setShowSystemPreferences, 'System Preferences')}
        onOpenHanzo={() => handleOpenApp(setShowHanzoAI, 'Hanzo AI')}
        onOpenLux={() => handleOpenApp(setShowLuxWallet, 'Lux Wallet')}
        onOpenZoo={() => handleOpenApp(setShowZooAssistant, 'Zoo')}
        onOpenCalculator={() => handleOpenApp(setShowCalculator, 'Calculator')}
        onOpenClock={() => handleOpenApp(setShowClock, 'Clock')}
        onOpenWeather={() => handleOpenApp(setShowWeather, 'Weather')}
        onOpenStickies={() => handleOpenApp(setShowStickies, 'Stickies')}
      />

      {/* Downloads Popover */}
      <DownloadsPopover
        isOpen={showDownloads}
        onClose={() => setShowDownloads(false)}
        onOpenFinder={() => { setShowFinder(true); handleFocusApp('Finder'); }}
      />

      {/* About zOS Window */}
      {showAbout && (
        <AboutZosWindow onClose={() => setShowAbout(false)} />
      )}

      {/* App Switcher Overlay */}
      <AppSwitcher
        isOpen={showAppSwitcher}
        onClose={() => setShowAppSwitcher(false)}
        openApps={openApps}
        currentApp={activeApp}
        onSelectApp={(app) => {
          handleOpenAppByName(app);
          setShowAppSwitcher(false);
        }}
      />

      {/* Spotlight Search Overlay */}
      <SpotlightSearch
        isOpen={showSpotlight}
        onClose={() => setShowSpotlight(false)}
        onOpenApp={handleOpenAppByName}
        onQuitApp={handleQuitCurrentApp}
        onOpenSettings={handleOpenSettings}
      />

      {/* Force Quit Dialog */}
      <ForceQuitDialog
        isOpen={showForceQuit}
        onClose={() => setShowForceQuit(false)}
        openApps={openApps}
        onForceQuit={handleForceQuitApp}
      />

      {/* Right-click Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-[20000] min-w-[220px] bg-black/80 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl text-white/90 text-[13px] py-1.5 font-medium"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
            transform: `translate(${contextMenu.x + 220 > window.innerWidth ? '-100%' : '0'}, ${contextMenu.y + 400 > window.innerHeight ? '-100%' : '0'})`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <ContextMenuItem
            icon={<FolderOpen className="w-4 h-4" />}
            label="New Folder"
            shortcut="⇧⌘N"
            onClick={() => {
              setContextMenu(null);
              setInfoDialogContent({
                title: 'New Folder',
                description: 'This is a web-based demo. File system operations like creating folders are simulated. Open Terminal and use "mkdir" to create virtual folders.'
              });
              setShowInfoDialog(true);
            }}
          />
          <ContextMenuSeparator />
          <ContextMenuItem
            icon={<Info className="w-4 h-4" />}
            label="Get Info"
            shortcut="⌘I"
            onClick={() => {
              setContextMenu(null);
              setInfoDialogContent({
                title: 'Desktop Info',
                description: 'This is a virtual zOS-style desktop environment built with React + TypeScript. It simulates macOS-like functionality in the browser.'
              });
              setShowInfoDialog(true);
            }}
          />
          <ContextMenuItem
            icon={<Image className="w-4 h-4" />}
            label="Change Desktop Background..."
            onClick={() => {
              setContextMenu(null);
              handleOpenApp(setShowSystemPreferences, 'System Preferences');
            }}
          />
          <ContextMenuSeparator />
          <div
            className="relative"
            onMouseEnter={() => {
              setShowSortSubmenu(true);
              setShowViewSubmenu(false);
            }}
          >
            <ContextMenuItem
              icon={<SortAsc className="w-4 h-4" />}
              label="Sort By"
              hasSubmenu
            />
            {showSortSubmenu && (
              <div
                className="absolute left-full top-0 ml-1 min-w-[180px] bg-black/80 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl text-white/90 text-[13px] py-1.5"
              >
                <ContextMenuItem label="Name" onClick={() => setContextMenu(null)} />
                <ContextMenuItem label="Kind" onClick={() => setContextMenu(null)} />
                <ContextMenuItem label="Date Last Opened" onClick={() => setContextMenu(null)} />
                <ContextMenuItem label="Date Added" onClick={() => setContextMenu(null)} />
                <ContextMenuItem label="Date Modified" onClick={() => setContextMenu(null)} />
                <ContextMenuItem label="Date Created" onClick={() => setContextMenu(null)} />
                <ContextMenuItem label="Size" onClick={() => setContextMenu(null)} />
                <ContextMenuItem label="Tags" onClick={() => setContextMenu(null)} />
              </div>
            )}
          </div>
          <ContextMenuItem
            icon={<Trash2 className="w-4 h-4" />}
            label="Clean Up"
            onClick={() => setContextMenu(null)}
          />
          <ContextMenuItem
            icon={<Grid3X3 className="w-4 h-4" />}
            label="Clean Up By"
            hasSubmenu
            onClick={() => setContextMenu(null)}
          />
          <ContextMenuSeparator />
          <div
            className="relative"
            onMouseEnter={() => {
              setShowViewSubmenu(true);
              setShowSortSubmenu(false);
            }}
          >
            <ContextMenuItem
              icon={<Eye className="w-4 h-4" />}
              label="View Options"
              hasSubmenu
            />
            {showViewSubmenu && (
              <div
                className="absolute left-full top-0 ml-1 min-w-[180px] bg-black/80 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl text-white/90 text-[13px] py-1.5"
              >
                <ContextMenuItem label="as Icons" onClick={() => setContextMenu(null)} />
                <ContextMenuItem label="as List" onClick={() => setContextMenu(null)} />
                <ContextMenuItem label="as Columns" onClick={() => setContextMenu(null)} />
                <ContextMenuItem label="as Gallery" onClick={() => setContextMenu(null)} />
              </div>
            )}
          </div>
          <ContextMenuSeparator />
          <ContextMenuItem
            icon={<Layout className="w-4 h-4" />}
            label="Use Stacks"
            onClick={() => setContextMenu(null)}
          />
          <ContextMenuItem
            icon={<Monitor className="w-4 h-4" />}
            label="Show View Options"
            shortcut="⌘J"
            onClick={() => {
              setContextMenu(null);
              handleOpenApp(setShowSystemPreferences, 'System Preferences');
            }}
          />
          <ContextMenuSeparator />
          <div className="px-3 py-1.5 text-white/40 text-xs uppercase tracking-wider">
            Background Theme
          </div>
          <ContextMenuItem
            label="Wireframe"
            onClick={() => handleChangeBackground('wireframe')}
          />
          <ContextMenuItem
            label="Gradient"
            onClick={() => handleChangeBackground('gradient')}
          />
          <ContextMenuItem
            label="Particles"
            onClick={() => handleChangeBackground('particles')}
          />
          <ContextMenuItem
            label="Matrix"
            onClick={() => handleChangeBackground('matrix')}
          />
          <ContextMenuItem
            label="Solid Black"
            onClick={() => handleChangeBackground('black')}
          />
        </div>
      )}

      {/* Info Dialog */}
      <Dialog open={showInfoDialog} onOpenChange={setShowInfoDialog}>
        <DialogContent className="bg-black/90 backdrop-blur-xl border-white/20 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">{infoDialogContent.title}</DialogTitle>
            <DialogDescription className="text-white/70">
              {infoDialogContent.description}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* zOS Dock */}
      <ZDock
        onFinderClick={() => handleOpenApp(setShowFinder, 'Finder')}
        onTerminalClick={() => handleOpenApp(setShowTerminal, 'Terminal')}
        onSafariClick={() => handleOpenApp(setShowSafari, 'Safari')}
        onMusicClick={() => handleOpenApp(setShowMusic, 'Music')}
        onSocialsClick={() => handleOpenApp(setShowSocials, 'Messages')}
        onMailClick={() => handleOpenApp(setShowEmail, 'Mail')}
        onCalendarClick={() => handleOpenApp(setShowCalendar, 'Calendar')}
        onPhotosClick={() => handleOpenApp(setShowPhotos, 'Photos')}
        onFaceTimeClick={() => handleOpenApp(setShowFaceTime, 'FaceTime')}
        onHanzoClick={() => handleOpenApp(setShowHanzoAI, 'Hanzo AI')}
        onLuxClick={() => handleOpenApp(setShowLuxWallet, 'Lux Wallet')}
        onZooClick={() => handleOpenApp(setShowZooAssistant, 'Zoo')}
        onApplicationsClick={() => setShowApplications(!showApplications)}
        onDownloadsClick={() => setShowDownloads(!showDownloads)}
        activeApps={[
          showFinder && 'finder',
          showTerminal && 'terminal',
          showSafari && 'safari',
          showMusic && 'music',
          showSocials && 'socials',
          showEmail && 'mail',
          showCalendar && 'calendar',
          showPhotos && 'photos',
          showFaceTime && 'facetime',
          showHanzoAI && 'hanzo',
          showLuxWallet && 'lux',
          showZooAssistant && 'zoo',
        ].filter(Boolean) as string[]}
      />
    </div>
  );
};

export default ZDesktop;
