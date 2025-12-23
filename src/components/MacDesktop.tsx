import React, { useState, useEffect, useCallback } from 'react';
import MacDock from './MacDock';
import MacMenuBar from './MacMenuBar';
import MacTerminalWindow from './MacTerminalWindow';
import MacSafariWindow from './MacSafariWindow';
import MacFinderWindow from './MacFinderWindow';
import MacMusicWindow from './MacMusicWindow';
import MacEmailWindow from './MacEmailWindow';
import MacCalendarWindow from './MacCalendarWindow';
import MacSystemPreferencesWindow from './MacSystemPreferencesWindow';
import MacPhotosWindow from './MacPhotosWindow';
import MacFaceTimeWindow from './MacFaceTimeWindow';
import MacTextPadWindow from './MacTextPadWindow';
import MacGitHubStatsWindow from './MacGitHubStatsWindow';
import MacSocialsWindow from './MacSocialsWindow';
import MacStatsWindow from './MacStatsWindow';
import MacCalculatorWindow from './MacCalculatorWindow';
import MacClockWindow from './MacClockWindow';
import MacWeatherWindow from './MacWeatherWindow';
import MacStickiesWindow from './MacStickiesWindow';
import HanzoAIWindow from './HanzoAIWindow';
import LuxWalletWindow from './LuxWalletWindow';
import ZooAssistantWindow from './ZooAssistantWindow';
import ApplicationsPopover from './dock/ApplicationsPopover';
import DownloadsPopover from './dock/DownloadsPopover';
import AnimatedBackground from './AnimatedBackground';
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

interface MacDesktopProps {
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

const MacDesktop: React.FC<MacDesktopProps> = ({ children }) => {
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

  // Active app for menu bar
  const [activeApp, setActiveApp] = useState<AppType>('Finder');

  // Context menu state
  const [contextMenu, setContextMenu] = useState<ContextMenuPosition | null>(null);
  const [showSortSubmenu, setShowSortSubmenu] = useState(false);
  const [showViewSubmenu, setShowViewSubmenu] = useState(false);

  // Desktop customization settings
  const [theme, setTheme] = useState('wireframe');
  const [customBgUrl, setCustomBgUrl] = useState('');

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

  // Background theme handlers
  const handleChangeBackground = (newTheme: string) => {
    setTheme(newTheme);
    setContextMenu(null);
  };

  // Apply custom document styles
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

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
      {/* Mac Menu Bar - always on top */}
      <MacMenuBar 
        appName={activeApp} 
        onQuitApp={handleQuitCurrentApp}
        onOpenSettings={handleOpenSettings}
      />

      {/* Animated Background */}
      <AnimatedBackground theme={theme} customImageUrl={customBgUrl} />

      {/* Content Area */}
      <div className="relative z-10 w-full h-full pt-[25px] pb-24 overflow-auto">
        {children}
      </div>

      {/* Application Windows */}
      {showFinder && (
        <MacFinderWindow
          onClose={() => handleCloseApp(setShowFinder)}
          onFocus={() => handleFocusApp('Finder')}
        />
      )}

      {showTerminal && (
        <MacTerminalWindow
          onClose={() => handleCloseApp(setShowTerminal)}
          onFocus={() => handleFocusApp('Terminal')}
        />
      )}

      {showSafari && (
        <MacSafariWindow 
          onClose={() => handleCloseApp(setShowSafari)}
          onFocus={() => handleFocusApp('Safari')}
        />
      )}

      {showMusic && (
        <MacMusicWindow 
          onClose={() => handleCloseApp(setShowMusic)}
          onFocus={() => handleFocusApp('Music')}
        />
      )}

      {showEmail && (
        <MacEmailWindow 
          onClose={() => handleCloseApp(setShowEmail)}
          onFocus={() => handleFocusApp('Mail')}
        />
      )}

      {showCalendar && (
        <MacCalendarWindow 
          onClose={() => handleCloseApp(setShowCalendar)}
          onFocus={() => handleFocusApp('Calendar')}
        />
      )}

      {showSystemPreferences && (
        <MacSystemPreferencesWindow 
          onClose={() => handleCloseApp(setShowSystemPreferences)}
          onFocus={() => handleFocusApp('System Preferences')}
        />
      )}

      {showPhotos && (
        <MacPhotosWindow 
          onClose={() => handleCloseApp(setShowPhotos)}
          onFocus={() => handleFocusApp('Photos')}
        />
      )}

      {showFaceTime && (
        <MacFaceTimeWindow 
          onClose={() => handleCloseApp(setShowFaceTime)}
          onFocus={() => handleFocusApp('FaceTime')}
        />
      )}

      {showTextPad && (
        <MacTextPadWindow 
          onClose={() => handleCloseApp(setShowTextPad)}
          onFocus={() => handleFocusApp('Notes')}
        />
      )}

      {showGitHubStats && (
        <MacGitHubStatsWindow 
          onClose={() => handleCloseApp(setShowGitHubStats)}
          onFocus={() => handleFocusApp('GitHub Stats')}
        />
      )}

      {showSocials && (
        <MacSocialsWindow 
          onClose={() => handleCloseApp(setShowSocials)}
          onFocus={() => handleFocusApp('Messages')}
        />
      )}

      {showStats && (
        <MacStatsWindow 
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
        <MacCalculatorWindow 
          onClose={() => handleCloseApp(setShowCalculator)}
        />
      )}

      {showClock && (
        <MacClockWindow 
          onClose={() => handleCloseApp(setShowClock)}
        />
      )}

      {showWeather && (
        <MacWeatherWindow 
          onClose={() => handleCloseApp(setShowWeather)}
        />
      )}

      {showStickies && (
        <MacStickiesWindow 
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
          />
          <ContextMenuSeparator />
          <ContextMenuItem
            icon={<Info className="w-4 h-4" />}
            label="Get Info"
            shortcut="⌘I"
          />
          <ContextMenuItem
            icon={<Image className="w-4 h-4" />}
            label="Change Desktop Background..."
            onClick={() => setShowSystemPreferences(true)}
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
                <ContextMenuItem label="Name" />
                <ContextMenuItem label="Kind" />
                <ContextMenuItem label="Date Last Opened" />
                <ContextMenuItem label="Date Added" />
                <ContextMenuItem label="Date Modified" />
                <ContextMenuItem label="Date Created" />
                <ContextMenuItem label="Size" />
                <ContextMenuItem label="Tags" />
              </div>
            )}
          </div>
          <ContextMenuItem
            icon={<Trash2 className="w-4 h-4" />}
            label="Clean Up"
          />
          <ContextMenuItem
            icon={<Grid3X3 className="w-4 h-4" />}
            label="Clean Up By"
            hasSubmenu
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
                <ContextMenuItem label="as Icons" />
                <ContextMenuItem label="as List" />
                <ContextMenuItem label="as Columns" />
                <ContextMenuItem label="as Gallery" />
              </div>
            )}
          </div>
          <ContextMenuSeparator />
          <ContextMenuItem
            icon={<Layout className="w-4 h-4" />}
            label="Use Stacks"
          />
          <ContextMenuItem
            icon={<Monitor className="w-4 h-4" />}
            label="Show View Options"
            shortcut="⌘J"
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

      {/* Mac Dock */}
      <MacDock
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

export default MacDesktop;
