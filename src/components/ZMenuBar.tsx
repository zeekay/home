import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Wifi,
  Battery,
  BatteryCharging,
  Search,
  Volume2,
  VolumeX,
  Volume1,
  Bluetooth,
  BluetoothOff,
  Moon,
  Sun,
  Airplay,
  Keyboard,
  Music,
  Pause,
  Play,
  SkipForward,
  SkipBack,
  Check,
  ChevronRight,
  Camera,
  Accessibility,
  MonitorSmartphone,
  Layers,
} from 'lucide-react';
import { Slider } from "@/components/ui/slider";

// Z Logo for menu bar
const ZMenuLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 100 100"
    className={cn("w-4 h-4", className)}
    fill="currentColor"
  >
    <path d="M 15 15 H 85 V 30 L 35 70 H 85 V 85 H 15 V 70 L 65 30 H 15 Z" />
  </svg>
);

// Control Center icon - two horizontal toggle switches (macOS style)
const ControlCenterIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 18 18"
    className={cn("w-[15px] h-[15px]", className)}
    fill="currentColor"
  >
    <defs>
      <mask id="toggleMask">
        <rect width="18" height="18" fill="white" />
        {/* Top toggle knob hole (left side - off) */}
        <circle cx="4.5" cy="4.5" r="2.5" fill="black" />
        {/* Bottom toggle knob hole (right side - on) */}
        <circle cx="13.5" cy="13.5" r="2.5" fill="black" />
      </mask>
    </defs>
    <g mask="url(#toggleMask)">
      {/* Top toggle track */}
      <rect x="0" y="1" width="18" height="7" rx="3.5" />
      {/* Bottom toggle track */}
      <rect x="0" y="10" width="18" height="7" rx="3.5" />
    </g>
  </svg>
);

interface ZMenuBarProps {
  className?: string;
  appName?: string;
  onQuitApp?: () => void;
  onOpenSettings?: () => void;
  onAboutMac?: () => void;
  onAboutApp?: (appName: string) => void;
  onMinimize?: () => void;
  onSleep?: () => void;
  onRestart?: () => void;
  onShutdown?: () => void;
  onLockScreen?: () => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
}

interface MenuItemType {
  label?: string;
  shortcut?: string;
  type?: 'separator';
  hasSubmenu?: boolean;
  checked?: boolean;
  isSearch?: boolean;
  disabled?: boolean;
}

interface MenuType {
  label: string;
  bold?: boolean;
  items: MenuItemType[];
}

// App-specific menu configurations
const getAppMenus = (appName: string): MenuType[] => {
  const baseAppMenu: MenuItemType[] = [
    { label: `About ${appName}`, shortcut: '' },
    { type: 'separator' } as MenuItemType,
    { label: 'Settings...', shortcut: '⌘,' },
    { type: 'separator' } as MenuItemType,
    { label: 'Services', shortcut: '', hasSubmenu: true },
    { type: 'separator' } as MenuItemType,
    { label: `Hide ${appName}`, shortcut: '⌘H' },
    { label: 'Hide Others', shortcut: '⌥⌘H' },
    { label: 'Show All', shortcut: '' },
    { type: 'separator' } as MenuItemType,
    { label: `Quit ${appName}`, shortcut: '⌘Q' },
  ];

  const baseWindowMenu: MenuItemType[] = [
    { label: 'Minimize', shortcut: '⌘M' },
    { label: 'Zoom', shortcut: '' },
    { label: 'Move Window to Left Side of Screen', shortcut: '' },
    { label: 'Move Window to Right Side of Screen', shortcut: '' },
    { type: 'separator' } as MenuItemType,
    { label: 'Cycle Through Windows', shortcut: '⌘`' },
    { type: 'separator' } as MenuItemType,
    { label: 'Bring All to Front', shortcut: '' },
  ];

  const baseHelpMenu: MenuItemType[] = [
    { label: 'Search', shortcut: '', isSearch: true },
    { type: 'separator' } as MenuItemType,
    { label: `${appName} Help`, shortcut: '' },
  ];

  // Terminal-specific menus
  if (appName === 'Terminal') {
    return [
      { label: 'Terminal', bold: true, items: baseAppMenu },
      {
        label: 'Shell',
        items: [
          { label: 'New Window', shortcut: '⌘N' },
          { label: 'New Tab', shortcut: '⌘T' },
          { type: 'separator' } as MenuItemType,
          { label: 'Split Horizontally', shortcut: '⌘D' },
          { label: 'Split Vertically', shortcut: '⇧⌘D' },
          { type: 'separator' } as MenuItemType,
          { label: 'Close', shortcut: '⌘W' },
          { label: 'Close Tab', shortcut: '⇧⌘W' },
          { type: 'separator' } as MenuItemType,
          { label: 'Export Text As...', shortcut: '' },
          { type: 'separator' } as MenuItemType,
          { label: 'Print', shortcut: '⌘P' },
        ]
      },
      {
        label: 'Edit',
        items: [
          { label: 'Undo', shortcut: '⌘Z' },
          { label: 'Redo', shortcut: '⇧⌘Z' },
          { type: 'separator' } as MenuItemType,
          { label: 'Cut', shortcut: '⌘X' },
          { label: 'Copy', shortcut: '⌘C' },
          { label: 'Paste', shortcut: '⌘V' },
          { label: 'Paste Escaped Text', shortcut: '⌃⌘V' },
          { label: 'Paste Selection', shortcut: '⇧⌘V' },
          { label: 'Select All', shortcut: '⌘A' },
          { type: 'separator' } as MenuItemType,
          { label: 'Clear to Previous Mark', shortcut: '⌘L' },
          { label: 'Clear to Start', shortcut: '⌥⌘L' },
          { label: 'Clear Scrollback', shortcut: '' },
          { type: 'separator' } as MenuItemType,
          { label: 'Find...', shortcut: '⌘F' },
          { label: 'Find Next', shortcut: '⌘G' },
          { label: 'Find Previous', shortcut: '⇧⌘G' },
        ]
      },
      {
        label: 'View',
        items: [
          { label: 'Show Tab Bar', shortcut: '⇧⌘T' },
          { label: 'Show All Tabs', shortcut: '⇧⌘\\' },
          { type: 'separator' } as MenuItemType,
          { label: 'Default Font Size', shortcut: '⌘0' },
          { label: 'Bigger', shortcut: '⌘+' },
          { label: 'Smaller', shortcut: '⌘-' },
          { type: 'separator' } as MenuItemType,
          { label: 'Allow Mouse Reporting', shortcut: '', checked: true },
          { label: 'Enable Alternate Screen', shortcut: '', checked: true },
          { type: 'separator' } as MenuItemType,
          { label: 'Enter Full Screen', shortcut: '⌃⌘F' },
        ]
      },
      {
        label: 'Profiles',
        items: [
          { label: 'Default', shortcut: '', checked: true },
          { label: 'Basic', shortcut: '' },
          { label: 'Grass', shortcut: '' },
          { label: 'Homebrew', shortcut: '' },
          { label: 'Man Page', shortcut: '' },
          { label: 'Ocean', shortcut: '' },
          { label: 'Pro', shortcut: '' },
          { type: 'separator' } as MenuItemType,
          { label: 'Open Profiles...', shortcut: '' },
        ]
      },
      { label: 'Window', items: baseWindowMenu },
      { label: 'Help', items: baseHelpMenu },
    ];
  }

  // Safari-specific menus
  if (appName === 'Safari') {
    return [
      { label: 'Safari', bold: true, items: baseAppMenu },
      {
        label: 'File',
        items: [
          { label: 'New Window', shortcut: '⌘N' },
          { label: 'New Private Window', shortcut: '⇧⌘N' },
          { label: 'New Tab', shortcut: '⌘T' },
          { type: 'separator' } as MenuItemType,
          { label: 'Open Location...', shortcut: '⌘L' },
          { label: 'Open File...', shortcut: '⌘O' },
          { type: 'separator' } as MenuItemType,
          { label: 'Close Window', shortcut: '⌘W' },
          { label: 'Close All Windows', shortcut: '⌥⌘W' },
          { label: 'Close Tab', shortcut: '⇧⌘W' },
          { type: 'separator' } as MenuItemType,
          { label: 'Save As...', shortcut: '⌘S' },
          { type: 'separator' } as MenuItemType,
          { label: 'Share', shortcut: '', hasSubmenu: true },
          { label: 'Print...', shortcut: '⌘P' },
        ]
      },
      {
        label: 'Edit',
        items: [
          { label: 'Undo', shortcut: '⌘Z' },
          { label: 'Redo', shortcut: '⇧⌘Z' },
          { type: 'separator' } as MenuItemType,
          { label: 'Cut', shortcut: '⌘X' },
          { label: 'Copy', shortcut: '⌘C' },
          { label: 'Paste', shortcut: '⌘V' },
          { label: 'Paste and Match Style', shortcut: '⌥⇧⌘V' },
          { label: 'Select All', shortcut: '⌘A' },
          { type: 'separator' } as MenuItemType,
          { label: 'Find', shortcut: '', hasSubmenu: true },
        ]
      },
      {
        label: 'View',
        items: [
          { label: 'Show Tab Overview', shortcut: '⇧⌘\\' },
          { label: 'Show All Tabs', shortcut: '' },
          { type: 'separator' } as MenuItemType,
          { label: 'Stop', shortcut: '⌘.' },
          { label: 'Reload Page', shortcut: '⌘R' },
          { type: 'separator' } as MenuItemType,
          { label: 'Actual Size', shortcut: '⌘0' },
          { label: 'Zoom In', shortcut: '⌘+' },
          { label: 'Zoom Out', shortcut: '⌘-' },
          { type: 'separator' } as MenuItemType,
          { label: 'Show Reader', shortcut: '⇧⌘R' },
          { type: 'separator' } as MenuItemType,
          { label: 'Enter Full Screen', shortcut: '⌃⌘F' },
        ]
      },
      {
        label: 'History',
        items: [
          { label: 'Back', shortcut: '⌘[' },
          { label: 'Forward', shortcut: '⌘]' },
          { type: 'separator' } as MenuItemType,
          { label: 'Home', shortcut: '⇧⌘H' },
          { type: 'separator' } as MenuItemType,
          { label: 'Show All History', shortcut: '⌘Y' },
          { label: 'Clear History...', shortcut: '' },
          { type: 'separator' } as MenuItemType,
          { label: 'Recently Closed', shortcut: '', hasSubmenu: true },
          { label: 'Reopen Last Closed Tab', shortcut: '⇧⌘T' },
        ]
      },
      {
        label: 'Bookmarks',
        items: [
          { label: 'Show Bookmarks', shortcut: '⌥⌘B' },
          { label: 'Edit Bookmarks', shortcut: '' },
          { type: 'separator' } as MenuItemType,
          { label: 'Add Bookmark...', shortcut: '⌘D' },
          { label: 'Add Bookmark for These Tabs...', shortcut: '' },
          { type: 'separator' } as MenuItemType,
          { label: 'Favorites', shortcut: '', hasSubmenu: true },
        ]
      },
      {
        label: 'Develop',
        items: [
          { label: 'Show Web Inspector', shortcut: '⌥⌘I' },
          { label: 'Show JavaScript Console', shortcut: '⌥⌘C' },
          { label: 'Show Page Source', shortcut: '⌥⌘U' },
          { type: 'separator' } as MenuItemType,
          { label: 'User Agent', shortcut: '', hasSubmenu: true },
          { type: 'separator' } as MenuItemType,
          { label: 'Empty Caches', shortcut: '⌥⌘E' },
          { label: 'Disable Caches', shortcut: '' },
        ]
      },
      { label: 'Window', items: baseWindowMenu },
      { label: 'Help', items: baseHelpMenu },
    ];
  }

  // Default Finder-style menus for other apps
  return [
    { label: appName, bold: true, items: baseAppMenu },
    {
      label: 'File',
      items: [
        { label: 'New Window', shortcut: '⌘N' },
        { label: 'New Tab', shortcut: '⌘T' },
        { type: 'separator' } as MenuItemType,
        { label: 'Open...', shortcut: '⌘O' },
        { label: 'Open Recent', shortcut: '', hasSubmenu: true },
        { type: 'separator' } as MenuItemType,
        { label: 'Close Window', shortcut: '⌘W' },
        { label: 'Close All', shortcut: '⌥⌘W' },
      ]
    },
    {
      label: 'Edit',
      items: [
        { label: 'Undo', shortcut: '⌘Z' },
        { label: 'Redo', shortcut: '⇧⌘Z' },
        { type: 'separator' } as MenuItemType,
        { label: 'Cut', shortcut: '⌘X' },
        { label: 'Copy', shortcut: '⌘C' },
        { label: 'Paste', shortcut: '⌘V' },
        { label: 'Paste and Match Style', shortcut: '⌥⇧⌘V' },
        { label: 'Select All', shortcut: '⌘A' },
        { type: 'separator' } as MenuItemType,
        { label: 'Find', shortcut: '', hasSubmenu: true },
      ]
    },
    {
      label: 'View',
      items: [
        { label: 'as Icons', shortcut: '⌘1', checked: true },
        { label: 'as List', shortcut: '⌘2' },
        { label: 'as Columns', shortcut: '⌘3' },
        { label: 'as Gallery', shortcut: '⌘4' },
        { type: 'separator' } as MenuItemType,
        { label: 'Show Tab Bar', shortcut: '⇧⌘T' },
        { label: 'Show All Tabs', shortcut: '⇧⌘\\' },
        { type: 'separator' } as MenuItemType,
        { label: 'Show Path Bar', shortcut: '⌥⌘P' },
        { label: 'Show Status Bar', shortcut: '⌘/' },
        { label: 'Show Sidebar', shortcut: '⌥⌘S', checked: true },
        { type: 'separator' } as MenuItemType,
        { label: 'Enter Full Screen', shortcut: '⌃⌘F' },
      ]
    },
    {
      label: 'Go',
      items: [
        { label: 'Back', shortcut: '⌘[' },
        { label: 'Forward', shortcut: '⌘]' },
        { label: 'Enclosing Folder', shortcut: '⌘↑' },
        { type: 'separator' } as MenuItemType,
        { label: 'Recents', shortcut: '⇧⌘F' },
        { label: 'Documents', shortcut: '⇧⌘O' },
        { label: 'Desktop', shortcut: '⇧⌘D' },
        { label: 'Downloads', shortcut: '⌥⌘L' },
        { label: 'Home', shortcut: '⇧⌘H' },
        { label: 'Computer', shortcut: '⇧⌘C' },
        { label: 'Applications', shortcut: '⇧⌘A' },
        { type: 'separator' } as MenuItemType,
        { label: 'Go to Folder...', shortcut: '⇧⌘G' },
      ]
    },
    { label: 'Window', items: baseWindowMenu },
    { label: 'Help', items: baseHelpMenu },
  ];
};

const ZMenuBar: React.FC<ZMenuBarProps> = ({
  className,
  appName = "Finder",
  onQuitApp,
  onOpenSettings,
  onAboutMac,
  onAboutApp,
  onMinimize,
  onSleep,
  onRestart,
  onShutdown,
  onLockScreen,
  darkMode = false,
  onToggleDarkMode,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [batteryLevel, setBatteryLevel] = useState(87);
  const [isCharging, setIsCharging] = useState(false);
  const [wifiEnabled, setWifiEnabled] = useState(true);
  useState('Home Network'); // Reserved for wifi network name
  const [bluetoothEnabled, setBluetoothEnabled] = useState(true);
  const [volume, setVolume] = useState([75]);
  const [brightness, setBrightness] = useState([80]);
  const [focusEnabled, setFocusEnabled] = useState(false);
  const [airDropEnabled, setAirDropEnabled] = useState(true);
  const [stageManagerEnabled, setStageManagerEnabled] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [screenMirroringEnabled, setScreenMirroringEnabled] = useState(false);
  const [accessibilityEnabled, setAccessibilityEnabled] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [menuBarActive, setMenuBarActive] = useState(false);
  const menuBarRef = useRef<HTMLDivElement>(null);
  const [activeSystemMenu, setActiveSystemMenu] = useState<string | null>(null);

  // Cmd+drag reordering state
  const [isCmdPressed, setIsCmdPressed] = useState(false);
  const [draggedMenuIndex, setDraggedMenuIndex] = useState<number | null>(null);
  const [menuOrder, setMenuOrder] = useState<number[]>([]);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const dragStartX = useRef<number>(0);
  const isDragging = useRef<boolean>(false);

  // Get app-specific menus
  const menuItems = getAppMenus(appName);

  // Initialize menu order when menuItems change
  // We intentionally only depend on length to avoid reinitializing on every render
  useEffect(() => {
    setMenuOrder(menuItems.map((_, i) => i));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuItems.length]);

  // Track Cmd key state and handle global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        setIsCmdPressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.metaKey && !e.ctrlKey) {
        setIsCmdPressed(false);
        setDraggedMenuIndex(null);
        setDropTargetIndex(null);
        isDragging.current = false;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Close menus when window loses focus
  useEffect(() => {
    const handleWindowBlur = () => {
      setActiveMenu(null);
      setActiveSystemMenu(null);
      setMenuBarActive(false);
    };
    window.addEventListener('blur', handleWindowBlur);
    return () => window.removeEventListener('blur', handleWindowBlur);
  }, []);

  // Drag handlers for menu reordering
  const handleMenuDragStart = (e: React.MouseEvent, orderIndex: number) => {
    if (!isCmdPressed) return;
    e.preventDefault();
    setDraggedMenuIndex(orderIndex);
    dragStartX.current = e.clientX;
    isDragging.current = true;
  };

  const handleMenuDragMove = (e: React.MouseEvent) => {
    if (!isDragging.current || draggedMenuIndex === null) return;
    
    // Find the element we're hovering over
    const menuButtons = menuBarRef.current?.querySelectorAll('[data-menu-index]');
    if (!menuButtons) return;
    
    let targetIndex: number | null = null;
    menuButtons.forEach((button) => {
      const rect = button.getBoundingClientRect();
      const idx = parseInt(button.getAttribute('data-menu-index') || '-1');
      if (e.clientX >= rect.left && e.clientX <= rect.right) {
        targetIndex = idx;
      }
    });
    
    if (targetIndex !== null && targetIndex !== draggedMenuIndex) {
      setDropTargetIndex(targetIndex);
    }
  };

  const handleMenuDragEnd = () => {
    if (draggedMenuIndex !== null && dropTargetIndex !== null && draggedMenuIndex !== dropTargetIndex) {
      // Reorder the menu
      const newOrder = [...menuOrder];
      const draggedItem = newOrder[draggedMenuIndex];
      newOrder.splice(draggedMenuIndex, 1);
      newOrder.splice(dropTargetIndex, 0, draggedItem);
      setMenuOrder(newOrder);
    }
    setDraggedMenuIndex(null);
    setDropTargetIndex(null);
    isDragging.current = false;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Try to get battery info (Battery API types)
    interface BatteryManager extends EventTarget {
      level: number;
      charging: boolean;
    }
    interface NavigatorWithBattery extends Navigator {
      getBattery?: () => Promise<BatteryManager>;
    }
    const nav = navigator as NavigatorWithBattery;
    if (nav.getBattery) {
      nav.getBattery().then((battery) => {
        setBatteryLevel(Math.round(battery.level * 100));
        setIsCharging(battery.charging);
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
        battery.addEventListener('chargingchange', () => {
          setIsCharging(battery.charging);
        });
      });
    }

    return () => clearInterval(timer);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
        setMenuBarActive(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const luxMenuItems: MenuItemType[] = [
    { label: 'About zOS' },
    { type: 'separator' },
    { label: 'System Settings...' },
    { label: 'App Store...' },
    { type: 'separator' },
    { label: 'Recent Items', hasSubmenu: true },
    { type: 'separator' },
    { label: 'Force Quit...', shortcut: '⌥⌘⎋' },
    { type: 'separator' },
    { label: 'Sleep' },
    { label: 'Restart...' },
    { label: 'Shut Down...' },
    { type: 'separator' },
    { label: 'Lock Screen', shortcut: '⌃⌘Q' },
    { label: 'Log Out Z...', shortcut: '⇧⌘Q' },
  ];

  const handleMenuClick = (index: number) => {
    if (activeMenu === index) {
      setActiveMenu(null);
      setMenuBarActive(false);
    } else {
      setActiveMenu(index);
      setMenuBarActive(true);
    }
  };

  const handleMenuHover = (index: number) => {
    if (menuBarActive) {
      setActiveMenu(index);
    }
  };

  const VolumeIcon = () => {
    if (volume[0] === 0) return <VolumeX className="w-[15px] h-[15px] opacity-90" />;
    if (volume[0] < 50) return <Volume1 className="w-[15px] h-[15px] opacity-90" />;
    return <Volume2 className="w-[15px] h-[15px] opacity-90" />;
  };

  const menuButtonClass = "h-[22px] px-[10px] flex items-center rounded-[5px] mx-[1px] hover:bg-white/20 outline-none focus:outline-none focus:ring-0 transition-colors duration-75";
  const systemTrayButtonClass = "h-[22px] px-[7px] flex items-center rounded-[5px] mx-[1px] hover:bg-white/20 outline-none focus:outline-none focus:ring-0 transition-colors duration-75";

  // Handle menu item click with action routing
  const handleMenuItemClick = (label: string) => {
    setActiveMenu(null);
    setActiveSystemMenu(null);
    setMenuBarActive(false);

    // ========================================
    // App Menu Actions
    // ========================================

    // About {appName} - call onAboutApp
    if (label === `About ${appName}`) {
      if (onAboutApp) {
        onAboutApp(appName);
      } else {
        toast.info(`About ${appName}`, {
          description: `${appName} is part of zOS`
        });
      }
      return;
    }

    // Quit app
    if (label === `Quit ${appName}` && onQuitApp) {
      onQuitApp();
      return;
    }

    // Settings
    if ((label === 'Settings...' || label === 'System Settings...') && onOpenSettings) {
      onOpenSettings();
      return;
    }

    // About zOS (system menu)
    if (label === 'About zOS' && onAboutMac) {
      onAboutMac();
      return;
    }

    // Minimize
    if (label === 'Minimize' && onMinimize) {
      onMinimize();
      return;
    }

    // Hide {appName} - minimize/hide window
    if (label === `Hide ${appName}`) {
      if (onMinimize) {
        onMinimize();
      }
      // Also dispatch custom event for window manager
      window.dispatchEvent(new CustomEvent('zos:hide-app', { detail: { appName } }));
      return;
    }

    // Hide Others - minimize all other windows
    if (label === 'Hide Others') {
      window.dispatchEvent(new CustomEvent('zos:hide-others', { detail: { appName } }));
      toast.info('Hide Others', { description: 'All other windows minimized' });
      return;
    }

    // Show All - restore all windows
    if (label === 'Show All') {
      window.dispatchEvent(new CustomEvent('zos:show-all'));
      toast.info('Show All', { description: 'All windows restored' });
      return;
    }

    // Sleep, Restart, Shutdown, Lock Screen
    if (label === 'Sleep' && onSleep) {
      onSleep();
      return;
    }
    if (label === 'Restart...' && onRestart) {
      onRestart();
      return;
    }
    if (label === 'Shut Down...' && onShutdown) {
      onShutdown();
      return;
    }
    if (label === 'Lock Screen' && onLockScreen) {
      onLockScreen();
      return;
    }
    if (label === 'Log Out Z...' && onLockScreen) {
      onLockScreen();
      return;
    }

    // Force Quit - dispatch Cmd+Option+Escape
    if (label === 'Force Quit...') {
      window.dispatchEvent(new CustomEvent('zos:force-quit-dialog'));
      toast.info('Force Quit Applications', { description: 'Use Cmd+Option+Escape to open Force Quit' });
      return;
    }

    // ========================================
    // File Menu Actions
    // ========================================

    if (label === 'New Window') {
      window.dispatchEvent(new CustomEvent('zos:new-window', { detail: { appName } }));
      toast.info('New Window', { description: 'Cmd+N' });
      return;
    }

    if (label === 'New Tab') {
      window.dispatchEvent(new CustomEvent('zos:new-tab', { detail: { appName } }));
      toast.info('New Tab', { description: 'Cmd+T' });
      return;
    }

    if (label === 'New Private Window') {
      window.dispatchEvent(new CustomEvent('zos:new-private-window', { detail: { appName } }));
      toast.info('New Private Window', { description: 'Shift+Cmd+N' });
      return;
    }

    if (label === 'Close Window' || label === 'Close') {
      window.dispatchEvent(new CustomEvent('zos:close-window', { detail: { appName } }));
      if (onQuitApp) {
        onQuitApp();
      }
      return;
    }

    if (label === 'Close Tab') {
      window.dispatchEvent(new CustomEvent('zos:close-tab', { detail: { appName } }));
      toast.info('Close Tab', { description: 'Shift+Cmd+W' });
      return;
    }

    if (label === 'Close All Windows' || label === 'Close All') {
      window.dispatchEvent(new CustomEvent('zos:close-all', { detail: { appName } }));
      toast.info('Close All Windows', { description: 'Option+Cmd+W' });
      return;
    }

    if (label === 'Save As...') {
      toast.info('Save As...', { description: 'Cmd+S' });
      return;
    }

    if (label === 'Open...' || label === 'Open File...') {
      toast.info('Open File...', { description: 'Cmd+O' });
      return;
    }

    if (label === 'Open Location...') {
      toast.info('Open Location...', { description: 'Cmd+L' });
      return;
    }

    if (label === 'Print...' || label === 'Print') {
      window.print();
      return;
    }

    // ========================================
    // Edit Menu Actions
    // ========================================

    if (label === 'Undo') {
      document.execCommand('undo');
      return;
    }
    if (label === 'Redo') {
      document.execCommand('redo');
      return;
    }
    if (label === 'Cut') {
      document.execCommand('cut');
      return;
    }
    if (label === 'Copy') {
      document.execCommand('copy');
      return;
    }
    if (label === 'Paste' || label === 'Paste Escaped Text' || label === 'Paste Selection' || label === 'Paste and Match Style') {
      navigator.clipboard.readText().then(text => {
        document.execCommand('insertText', false, text);
      }).catch(() => {
        document.execCommand('paste');
      });
      return;
    }
    if (label === 'Select All') {
      document.execCommand('selectAll');
      return;
    }

    // Find actions
    if (label === 'Find...' || label === 'Find') {
      window.dispatchEvent(new CustomEvent('zos:find', { detail: { appName } }));
      toast.info('Find', { description: 'Use Cmd+F to search' });
      return;
    }
    if (label === 'Find Next') {
      window.dispatchEvent(new CustomEvent('zos:find-next', { detail: { appName } }));
      toast.info('Find Next', { description: 'Use Cmd+G to find next' });
      return;
    }
    if (label === 'Find Previous') {
      window.dispatchEvent(new CustomEvent('zos:find-previous', { detail: { appName } }));
      toast.info('Find Previous', { description: 'Use Shift+Cmd+G to find previous' });
      return;
    }

    // Terminal-specific Edit actions
    if (label === 'Clear to Previous Mark') {
      window.dispatchEvent(new CustomEvent('zos:terminal-clear-mark', { detail: { appName } }));
      toast.info('Clear to Previous Mark', { description: 'Cmd+L' });
      return;
    }
    if (label === 'Clear to Start') {
      window.dispatchEvent(new CustomEvent('zos:terminal-clear-start', { detail: { appName } }));
      toast.info('Clear to Start', { description: 'Option+Cmd+L' });
      return;
    }
    if (label === 'Clear Scrollback') {
      window.dispatchEvent(new CustomEvent('zos:terminal-clear-scrollback', { detail: { appName } }));
      toast.info('Clear Scrollback', { description: 'Terminal scrollback cleared' });
      return;
    }

    // Terminal Shell actions
    if (label === 'Export Text As...') {
      window.dispatchEvent(new CustomEvent('zos:terminal-export', { detail: { appName } }));
      toast.info('Export Text As...', { description: 'Export terminal output to file' });
      return;
    }
    if (label === 'Split Horizontally') {
      window.dispatchEvent(new CustomEvent('zos:terminal-split-h', { detail: { appName } }));
      toast.info('Split Horizontally', { description: 'Cmd+D' });
      return;
    }
    if (label === 'Split Vertically') {
      window.dispatchEvent(new CustomEvent('zos:terminal-split-v', { detail: { appName } }));
      toast.info('Split Vertically', { description: 'Shift+Cmd+D' });
      return;
    }

    // ========================================
    // View Menu Actions
    // ========================================

    if (label === 'Zoom In' || label === 'Bigger') {
      const currentZoom = parseFloat(document.body.style.zoom || '1');
      document.body.style.zoom = String(Math.min(currentZoom + 0.1, 2));
      return;
    }
    if (label === 'Zoom Out' || label === 'Smaller') {
      const currentZoom = parseFloat(document.body.style.zoom || '1');
      document.body.style.zoom = String(Math.max(currentZoom - 0.1, 0.5));
      return;
    }
    if (label === 'Actual Size' || label === 'Default Font Size') {
      document.body.style.zoom = '1';
      return;
    }
    if (label === 'Enter Full Screen') {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        document.documentElement.requestFullscreen();
      }
      return;
    }

    // Safari-specific View actions
    if (label === 'Reload Page') {
      window.dispatchEvent(new CustomEvent('zos:safari-reload', { detail: { appName } }));
      toast.info('Reload Page', { description: 'Cmd+R' });
      return;
    }
    if (label === 'Stop') {
      window.dispatchEvent(new CustomEvent('zos:safari-stop', { detail: { appName } }));
      toast.info('Stop Loading', { description: 'Cmd+.' });
      return;
    }
    if (label === 'Show Reader') {
      window.dispatchEvent(new CustomEvent('zos:safari-reader', { detail: { appName } }));
      toast.info('Show Reader', { description: 'Shift+Cmd+R' });
      return;
    }
    if (label === 'Show Tab Bar') {
      toast.info('Show Tab Bar', { description: 'Shift+Cmd+T' });
      return;
    }
    if (label === 'Show All Tabs' || label === 'Show Tab Overview') {
      toast.info('Show All Tabs', { description: 'Shift+Cmd+\\' });
      return;
    }

    // View options (for Finder)
    if (label === 'as Icons' || label === 'as List' || label === 'as Columns' || label === 'as Gallery') {
      toast.info(`View ${label}`, { description: `Changed view mode` });
      return;
    }
    if (label === 'Show Path Bar') {
      toast.info('Show Path Bar', { description: 'Option+Cmd+P' });
      return;
    }
    if (label === 'Show Status Bar') {
      toast.info('Show Status Bar', { description: 'Cmd+/' });
      return;
    }
    if (label === 'Show Sidebar') {
      toast.info('Show Sidebar', { description: 'Option+Cmd+S' });
      return;
    }

    // Terminal View options
    if (label === 'Allow Mouse Reporting' || label === 'Enable Alternate Screen') {
      toast.info(label, { description: 'Terminal option toggled' });
      return;
    }

    // ========================================
    // Safari Develop Menu
    // ========================================

    if (label === 'Show Web Inspector') {
      window.dispatchEvent(new CustomEvent('zos:safari-inspector', { detail: { appName } }));
      toast.info('Show Web Inspector', { description: 'Option+Cmd+I' });
      return;
    }
    if (label === 'Show JavaScript Console') {
      window.dispatchEvent(new CustomEvent('zos:safari-console', { detail: { appName } }));
      toast.info('Show JavaScript Console', { description: 'Option+Cmd+C' });
      return;
    }
    if (label === 'Show Page Source') {
      window.dispatchEvent(new CustomEvent('zos:safari-source', { detail: { appName } }));
      toast.info('Show Page Source', { description: 'Option+Cmd+U' });
      return;
    }
    if (label === 'Empty Caches') {
      window.dispatchEvent(new CustomEvent('zos:safari-empty-caches', { detail: { appName } }));
      toast.info('Empty Caches', { description: 'Option+Cmd+E - Caches cleared' });
      return;
    }
    if (label === 'Disable Caches') {
      toast.info('Disable Caches', { description: 'Cache disabled for debugging' });
      return;
    }

    // ========================================
    // History Menu (Safari)
    // ========================================

    if (label === 'Back') {
      window.dispatchEvent(new CustomEvent('zos:safari-back', { detail: { appName } }));
      toast.info('Back', { description: 'Cmd+[' });
      return;
    }
    if (label === 'Forward') {
      window.dispatchEvent(new CustomEvent('zos:safari-forward', { detail: { appName } }));
      toast.info('Forward', { description: 'Cmd+]' });
      return;
    }
    if (label === 'Home') {
      window.dispatchEvent(new CustomEvent('zos:safari-home', { detail: { appName } }));
      toast.info('Home', { description: 'Shift+Cmd+H' });
      return;
    }
    if (label === 'Show All History') {
      toast.info('Show All History', { description: 'Cmd+Y' });
      return;
    }
    if (label === 'Clear History...') {
      toast.info('Clear History', { description: 'Browsing history will be cleared' });
      return;
    }
    if (label === 'Reopen Last Closed Tab') {
      window.dispatchEvent(new CustomEvent('zos:safari-reopen-tab', { detail: { appName } }));
      toast.info('Reopen Last Closed Tab', { description: 'Shift+Cmd+T' });
      return;
    }

    // ========================================
    // Bookmarks Menu (Safari)
    // ========================================

    if (label === 'Show Bookmarks') {
      toast.info('Show Bookmarks', { description: 'Option+Cmd+B' });
      return;
    }
    if (label === 'Edit Bookmarks') {
      toast.info('Edit Bookmarks', { description: 'Edit your bookmarks' });
      return;
    }
    if (label === 'Add Bookmark...') {
      toast.info('Add Bookmark', { description: 'Cmd+D' });
      return;
    }
    if (label === 'Add Bookmark for These Tabs...') {
      toast.info('Add Bookmark for These Tabs', { description: 'Bookmark all open tabs' });
      return;
    }

    // ========================================
    // Go Menu (Finder)
    // ========================================

    if (label === 'Enclosing Folder') {
      toast.info('Enclosing Folder', { description: 'Cmd+Up Arrow' });
      return;
    }
    if (label === 'Recents') {
      toast.info('Recents', { description: 'Shift+Cmd+F' });
      return;
    }
    if (label === 'Documents') {
      toast.info('Documents', { description: 'Shift+Cmd+O' });
      return;
    }
    if (label === 'Desktop') {
      toast.info('Desktop', { description: 'Shift+Cmd+D' });
      return;
    }
    if (label === 'Downloads') {
      toast.info('Downloads', { description: 'Option+Cmd+L' });
      return;
    }
    if (label === 'Computer') {
      toast.info('Computer', { description: 'Shift+Cmd+C' });
      return;
    }
    if (label === 'Applications') {
      toast.info('Applications', { description: 'Shift+Cmd+A' });
      return;
    }
    if (label === 'Go to Folder...') {
      toast.info('Go to Folder...', { description: 'Shift+Cmd+G' });
      return;
    }

    // ========================================
    // Window Menu Actions
    // ========================================

    if (label === 'Zoom') {
      window.dispatchEvent(new CustomEvent('zos:window-zoom', { detail: { appName } }));
      toast.info('Zoom', { description: 'Window zoomed to fit content' });
      return;
    }

    if (label === 'Move Window to Left Side of Screen') {
      window.dispatchEvent(new CustomEvent('zos:window-left', { detail: { appName } }));
      toast.info('Move Window Left', { description: 'Window moved to left side' });
      return;
    }

    if (label === 'Move Window to Right Side of Screen') {
      window.dispatchEvent(new CustomEvent('zos:window-right', { detail: { appName } }));
      toast.info('Move Window Right', { description: 'Window moved to right side' });
      return;
    }

    if (label === 'Cycle Through Windows') {
      window.dispatchEvent(new CustomEvent('zos:cycle-windows', { detail: { appName } }));
      toast.info('Cycle Through Windows', { description: 'Cmd+` to cycle windows' });
      return;
    }

    if (label === 'Bring All to Front') {
      window.dispatchEvent(new CustomEvent('zos:bring-all-front', { detail: { appName } }));
      window.focus();
      toast.info('Bring All to Front', { description: 'All windows brought to front' });
      return;
    }

    // ========================================
    // Profiles Menu (Terminal)
    // ========================================

    if (label === 'Default' || label === 'Basic' || label === 'Grass' || label === 'Homebrew' || label === 'Man Page' || label === 'Ocean' || label === 'Pro') {
      window.dispatchEvent(new CustomEvent('zos:terminal-profile', { detail: { profile: label } }));
      toast.info(`Profile: ${label}`, { description: 'Terminal profile changed' });
      return;
    }
    if (label === 'Open Profiles...') {
      toast.info('Open Profiles', { description: 'Manage terminal profiles' });
      return;
    }

    // ========================================
    // Help Menu
    // ========================================

    if (label === `${appName} Help`) {
      toast.info(`${appName} Help`, { description: 'Help documentation' });
      return;
    }

    // ========================================
    // Generic fallback for unhandled actions
    // ========================================

    // If nothing matched, show a toast for the action
    toast.info(label, { description: 'Menu action' });
  };

  const renderMenuItem = (item: MenuItemType, itemIndex: number) => {
    if (item.type === 'separator') {
      return <div key={itemIndex} className="h-[1px] bg-white/10 my-[6px] mx-3" />;
    }
    if (item.isSearch) {
      return (
        <div key={itemIndex} className="px-2 py-1.5">
          <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg">
            <Search className="w-3.5 h-3.5 text-white/50" />
            <input
              type="text"
              placeholder="Search"
              className="flex-1 bg-transparent text-white text-[13px] outline-none placeholder:text-white/50"
            />
          </div>
        </div>
      );
    }
    if (item.hasSubmenu) {
      return (
        <div
          key={itemIndex}
          className={cn(
            "flex items-center justify-between mx-1.5 px-3 py-[6px] rounded-[5px] hover:bg-blue-500 cursor-pointer transition-colors",
            item.disabled && "opacity-40 cursor-default hover:bg-transparent"
          )}
        >
          <span>{item.label}</span>
          <ChevronRight className="w-3 h-3 opacity-50" />
        </div>
      );
    }
    return (
      <div
        key={itemIndex}
        className={cn(
          "flex items-center justify-between mx-1.5 px-3 py-[6px] rounded-[5px] hover:bg-blue-500 cursor-pointer transition-colors",
          item.disabled && "opacity-40 cursor-default hover:bg-transparent"
        )}
        onClick={() => item.label && handleMenuItemClick(item.label)}
      >
        <span className="flex items-center gap-2">
          {item.checked && <Check className="w-3.5 h-3.5" />}
          {item.label}
        </span>
        {item.shortcut && (
          <span className="text-white/50 ml-4">{item.shortcut}</span>
        )}
      </div>
    );
  };

  return (
    <div
      ref={menuBarRef}
      className={cn(
        'fixed top-[3px] left-[4px] right-[4px] z-[10000]',
        'h-[28px] px-2',
        'flex items-center justify-between',
        'bg-black/50 backdrop-blur-2xl saturate-150',
        'rounded-[9px]',
        'text-white/90 text-[13px] font-medium tracking-[-0.01em]',
        'select-none',
        className
      )}
    >
      {/* Left side - Logo and menus */}
      <div className="flex items-center h-full">
        {/* Z Logo (system menu) */}
        <div className="relative h-full">
          <button
            className={cn(menuButtonClass, "px-[8px]", activeMenu === -1 && "bg-white/20")}
            onClick={() => handleMenuClick(-1)}
            onMouseEnter={() => handleMenuHover(-1)}
            aria-label="System menu"
            aria-expanded={activeMenu === -1}
            aria-haspopup="menu"
          >
            <ZMenuLogo className="w-[14px] h-[14px] text-white opacity-90" />
          </button>
          {activeMenu === -1 && (
            <div className="absolute top-full left-0 mt-[5px] min-w-[230px] bg-black/80 backdrop-blur-xl border border-white/20 rounded-[10px] shadow-2xl text-white/90 text-[13px] p-1">
              {luxMenuItems.map((item, index) => renderMenuItem(item, index))}
            </div>
          )}
        </div>

        {/* App menus - rendered in menuOrder */}
        {menuOrder.map((originalIndex, orderIndex) => {
          const menu = menuItems[originalIndex];
          if (!menu) return null;
          
          return (
            <div 
              key={originalIndex} 
              className="relative h-full"
              onMouseMove={handleMenuDragMove}
              onMouseUp={handleMenuDragEnd}
              onMouseLeave={() => {
                if (isDragging.current) {
                  handleMenuDragEnd();
                }
              }}
            >
              <button
                data-menu-index={orderIndex}
                className={cn(
                  menuButtonClass,
                  menu.bold && "font-bold",
                  activeMenu === originalIndex && "bg-white/20",
                  isCmdPressed && "cursor-grab",
                  draggedMenuIndex === orderIndex && "opacity-50 cursor-grabbing",
                  dropTargetIndex === orderIndex && draggedMenuIndex !== null && "ring-2 ring-blue-500 ring-opacity-50"
                )}
                onClick={() => !isDragging.current && handleMenuClick(originalIndex)}
                onMouseEnter={() => !isDragging.current && handleMenuHover(originalIndex)}
                onMouseDown={(e) => handleMenuDragStart(e, orderIndex)}
              >
                {menu.label}
              </button>
              {activeMenu === originalIndex && !isDragging.current && (
                <div className="absolute top-full left-0 mt-[5px] min-w-[230px] bg-black/80 backdrop-blur-xl border border-white/20 rounded-[10px] shadow-2xl text-white/90 text-[13px] p-1 max-h-[80vh] overflow-y-auto">
                  {menu.items.map((item, itemIndex) => renderMenuItem(item, itemIndex))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Right side - System tray */}
      <div className="flex items-center h-full gap-0">
        {/* Bluetooth */}
        <div className="relative h-full">
          <button
            className={cn(systemTrayButtonClass, activeSystemMenu === 'bluetooth' && "bg-white/20")}
            onClick={() => setActiveSystemMenu(activeSystemMenu === 'bluetooth' ? null : 'bluetooth')}
            aria-label={`Bluetooth ${bluetoothEnabled ? 'enabled' : 'disabled'}`}
            aria-expanded={activeSystemMenu === 'bluetooth'}
          >
            {bluetoothEnabled ? (
              <Bluetooth className="w-[15px] h-[15px] opacity-90" />
            ) : (
              <BluetoothOff className="w-[15px] h-[15px] opacity-50" />
            )}
          </button>
          {activeSystemMenu === 'bluetooth' && (
            <div className="absolute top-full right-0 mt-[5px] min-w-[280px] bg-black/80 backdrop-blur-xl border border-white/20 rounded-[10px] shadow-2xl text-white/90 text-[13px] p-1">
              <div className="px-3 py-2 flex items-center justify-between">
                <span className="font-semibold">Bluetooth</span>
                <button
                  onClick={() => setBluetoothEnabled(!bluetoothEnabled)}
                  className={cn(
                    "w-10 h-6 rounded-full transition-colors relative",
                    bluetoothEnabled ? "bg-blue-500" : "bg-white/20"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                    bluetoothEnabled ? "left-5" : "left-1"
                  )} />
                </button>
              </div>
              <div className="h-[1px] bg-white/10 my-1" />
              <div className="px-3 py-1 text-white/50 text-xs">Devices</div>
              <div className="px-3 py-2 flex items-center gap-3 rounded-md hover:bg-blue-500 cursor-pointer">
                <Keyboard className="w-4 h-4" />
                <div className="flex-1">
                  <p>Magic Keyboard</p>
                  <p className="text-white/50 text-xs">Connected</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-500" />
              </div>
              <div className="h-[1px] bg-white/10 my-1" />
              <div className="px-3 py-1.5 rounded-md hover:bg-blue-500 cursor-pointer">
                Bluetooth Settings...
              </div>
            </div>
          )}
        </div>

        {/* Battery */}
        <div className="relative h-full">
          <button
            className={cn(systemTrayButtonClass, activeSystemMenu === 'battery' && "bg-white/20")}
            onClick={() => setActiveSystemMenu(activeSystemMenu === 'battery' ? null : 'battery')}
            aria-label={`Battery ${batteryLevel}%${isCharging ? ', charging' : ''}`}
            aria-expanded={activeSystemMenu === 'battery'}
          >
            <div className="flex items-center gap-1">
              {isCharging ? (
                <BatteryCharging className="w-[18px] h-[18px] opacity-90" />
              ) : (
                <Battery className="w-[18px] h-[18px] opacity-90" />
              )}
            </div>
          </button>
          {activeSystemMenu === 'battery' && (
            <div className="absolute top-full right-0 mt-[5px] min-w-[200px] bg-black/80 backdrop-blur-xl border border-white/20 rounded-[10px] shadow-2xl text-white/90 text-[13px] p-1">
              <div className="px-3 py-2">
                <p className="font-semibold">Battery</p>
                <p className="text-white/60">{batteryLevel}% {isCharging ? '(Charging)' : ''}</p>
              </div>
              <div className="h-[1px] bg-white/10 my-1" />
              <div className="px-3 py-1.5 rounded-md hover:bg-blue-500 cursor-pointer">
                Battery Settings...
              </div>
            </div>
          )}
        </div>

        {/* Volume */}
        <div className="relative h-full">
          <button
            className={cn(systemTrayButtonClass, activeSystemMenu === 'volume' && "bg-white/20")}
            onClick={() => setActiveSystemMenu(activeSystemMenu === 'volume' ? null : 'volume')}
            aria-label={`Volume ${volume[0]}%`}
            aria-expanded={activeSystemMenu === 'volume'}
          >
            <VolumeIcon />
          </button>
          {activeSystemMenu === 'volume' && (
            <div className="absolute top-full right-0 mt-[5px] min-w-[200px] bg-black/80 backdrop-blur-xl border border-white/20 rounded-[10px] shadow-2xl text-white/90 text-[13px] p-1">
              <div className="px-3 py-2">
                <p className="font-semibold mb-2">Sound</p>
                <Slider
                  value={volume}
                  onValueChange={setVolume}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="h-[1px] bg-white/10 my-1" />
              <div className="px-3 py-1.5 rounded-md hover:bg-blue-500 cursor-pointer">
                Sound Settings...
              </div>
            </div>
          )}
        </div>

        {/* Control Center - two horizontal toggle switches icon like macOS */}
        <div className="relative h-full">
          <button
            className={cn(systemTrayButtonClass, activeSystemMenu === 'control' && "bg-white/20")}
            onClick={() => setActiveSystemMenu(activeSystemMenu === 'control' ? null : 'control')}
            aria-label="Control Center"
            aria-expanded={activeSystemMenu === 'control'}
          >
              <ControlCenterIcon className="w-[15px] h-[15px] opacity-90" />
          </button>
          {activeSystemMenu === 'control' && (
            <div className="absolute top-full right-0 mt-[1px] w-[320px] bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl text-white/90 text-[13px] p-3">
              {/* Top Row - Connectivity */}
              <div className="flex gap-2 mb-2">
                <div className="flex-1 bg-white/10 rounded-2xl p-2 flex gap-2">
                  <button
                    onClick={() => setWifiEnabled(!wifiEnabled)}
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                      wifiEnabled ? "bg-blue-500" : "bg-white/10 hover:bg-white/15"
                    )}
                    aria-label={`Wi-Fi ${wifiEnabled ? 'on' : 'off'}`}
                    aria-pressed={wifiEnabled}
                  >
                    <Wifi className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setBluetoothEnabled(!bluetoothEnabled)}
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                      bluetoothEnabled ? "bg-blue-500" : "bg-white/10 hover:bg-white/15"
                    )}
                    aria-label={`Bluetooth ${bluetoothEnabled ? 'on' : 'off'}`}
                    aria-pressed={bluetoothEnabled}
                  >
                    <Bluetooth className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setAirDropEnabled(!airDropEnabled)}
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                      airDropEnabled ? "bg-blue-500" : "bg-white/10 hover:bg-white/15"
                    )}
                    aria-label={`AirDrop ${airDropEnabled ? 'on' : 'off'}`}
                    aria-pressed={airDropEnabled}
                  >
                    <Airplay className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Second Row - Focus and Now Playing */}
              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => setFocusEnabled(!focusEnabled)}
                  className={cn(
                    "flex-1 p-3 rounded-2xl text-left transition-colors",
                    focusEnabled ? "bg-purple-500" : "bg-white/10 hover:bg-white/15"
                  )}
                  aria-label={`Focus mode ${focusEnabled ? 'on' : 'off'}`}
                  aria-pressed={focusEnabled}
                >
                  <Moon className="w-5 h-5 mb-1" />
                  <p className="text-sm font-semibold">Focus</p>
                  <p className="text-xs opacity-70">{focusEnabled ? "On" : "Off"}</p>
                </button>

                <div className="flex-1 bg-white/10 rounded-2xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-md bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center">
                      <Music className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">Not Playing</p>
                      <p className="text-xs opacity-50 truncate">Music</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <button className="p-1 hover:bg-white/10 rounded" aria-label="Previous track">
                      <SkipBack className="w-4 h-4" />
                    </button>
                    <button
                      className="p-1 hover:bg-white/10 rounded"
                      onClick={() => setIsPlaying(!isPlaying)}
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button className="p-1 hover:bg-white/10 rounded" aria-label="Next track">
                      <SkipForward className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Third Row - Stage Manager, Screen Mirroring */}
              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => setStageManagerEnabled(!stageManagerEnabled)}
                  className={cn(
                    "flex-1 p-3 rounded-2xl text-left transition-colors",
                    stageManagerEnabled ? "bg-blue-500" : "bg-white/10 hover:bg-white/15"
                  )}
                >
                  <Layers className="w-5 h-5 mb-1" />
                  <p className="text-xs font-semibold">Stage Manager</p>
                </button>

                <button
                  onClick={() => setScreenMirroringEnabled(!screenMirroringEnabled)}
                  className={cn(
                    "flex-1 p-3 rounded-2xl text-left transition-colors",
                    screenMirroringEnabled ? "bg-blue-500" : "bg-white/10 hover:bg-white/15"
                  )}
                >
                  <MonitorSmartphone className="w-5 h-5 mb-1" />
                  <p className="text-xs font-semibold">Screen Mirroring</p>
                  <p className="text-xs opacity-70">{screenMirroringEnabled ? "On" : "Off"}</p>
                </button>
              </div>

              {/* Fourth Row - Small buttons */}
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setAccessibilityEnabled(!accessibilityEnabled)}
                  className={cn(
                    "flex-1 p-3 rounded-2xl transition-colors flex flex-col items-center",
                    accessibilityEnabled ? "bg-blue-500" : "bg-white/10 hover:bg-white/15"
                  )}
                  title="Accessibility Shortcuts"
                >
                  <Accessibility className="w-5 h-5" />
                  <p className="text-[10px] mt-1 opacity-70">Accessibility</p>
                </button>
                <button
                  onClick={() => setCameraEnabled(!cameraEnabled)}
                  className={cn(
                    "flex-1 p-3 rounded-2xl transition-colors flex flex-col items-center",
                    cameraEnabled ? "bg-green-500" : "bg-white/10 hover:bg-white/15"
                  )}
                  title={cameraEnabled ? "Camera In Use" : "Camera Off"}
                >
                  <Camera className="w-5 h-5" />
                  <p className="text-[10px] mt-1 opacity-70">{cameraEnabled ? "In Use" : "Camera"}</p>
                </button>
                <button
                  onClick={onToggleDarkMode}
                  className={cn(
                    "flex-1 p-3 rounded-2xl transition-colors flex flex-col items-center",
                    darkMode ? "bg-indigo-500" : "bg-white/10 hover:bg-white/15"
                  )}
                  title={darkMode ? "Dark Mode On" : "Dark Mode Off"}
                >
                  {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  <p className="text-[10px] mt-1 opacity-70">{darkMode ? "Dark" : "Light"}</p>
                </button>
              </div>

              {/* Display Slider */}
              <div className="bg-white/10 rounded-2xl p-3 mb-2">
                <div className="flex items-center gap-3">
                  <Sun className="w-4 h-4 opacity-50" />
                  <Slider
                    value={brightness}
                    onValueChange={setBrightness}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <Sun className="w-5 h-5" />
                </div>
              </div>

              {/* Sound Slider */}
              <div className="bg-white/10 rounded-2xl p-3 mb-2">
                <div className="flex items-center gap-3">
                  <VolumeX className="w-4 h-4 opacity-50" />
                  <Slider
                    value={volume}
                    onValueChange={setVolume}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <Volume2 className="w-5 h-5" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Spotlight Search */}
        <button
          className={cn(systemTrayButtonClass)}
          onClick={() => {
            // Trigger Spotlight via keyboard event dispatch
            const event = new KeyboardEvent('keydown', { key: ' ', metaKey: true, bubbles: true });
            document.dispatchEvent(event);
          }}
          aria-label="Spotlight Search"
        >
          <Search className="w-[14px] h-[14px] opacity-90" />
        </button>

        {/* Date/Time - far right */}
        <div className="relative h-full">
          <button
            className={cn(systemTrayButtonClass, "px-[10px]", activeSystemMenu === 'datetime' && "bg-white/20")}
            onClick={() => setActiveSystemMenu(activeSystemMenu === 'datetime' ? null : 'datetime')}
            aria-label="Date and time"
            aria-expanded={activeSystemMenu === 'datetime'}
          >
            <span className="text-[13px] opacity-90">{formatTime(currentTime)}</span>
          </button>
          {activeSystemMenu === 'datetime' && (
            <div className="absolute top-full right-0 mt-[5px] min-w-[280px] bg-black/80 backdrop-blur-xl border border-white/20 rounded-[10px] shadow-2xl text-white/90 text-[13px] p-1">
              <div className="px-3 py-2 text-center">
                <p className="text-2xl font-light">
                  {currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                </p>
                <p className="text-white/60">
                  {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div className="h-[1px] bg-white/10 my-1" />
              <div className="px-3 py-1.5 rounded-md hover:bg-blue-500 cursor-pointer">
                Open Date & Time Settings...
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside handler overlay when menus are active */}
      {(activeMenu !== null || activeSystemMenu !== null) && (
        <div
          className="fixed inset-0 z-[-1]"
          onClick={() => {
            setActiveMenu(null);
            setActiveSystemMenu(null);
            setMenuBarActive(false);
          }}
        />
      )}
    </div>
  );
};

export default ZMenuBar;
