import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Wifi,
  WifiOff,
  Battery,
  BatteryCharging,
  BatteryLow,
  BatteryMedium,
  BatteryFull,
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
  Bell,
  Clock,
  User,
  Minus,
} from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { FocusModeQuickToggle, FocusModeIndicator } from '@/components/FocusModeSelector';
import { RecordingIndicator } from '@/components/ScreenRecorder';
import { Slider } from "@/components/ui/slider";
import { useRecents } from '@/contexts/RecentsContext';
import { useUser } from '@/contexts/UserContext';

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
        <circle cx="4.5" cy="4.5" r="2.5" fill="black" />
        <circle cx="13.5" cy="13.5" r="2.5" fill="black" />
      </mask>
    </defs>
    <g mask="url(#toggleMask)">
      <rect x="0" y="1" width="18" height="7" rx="3.5" />
      <rect x="0" y="10" width="18" height="7" rx="3.5" />
    </g>
  </svg>
);

// Time Machine icon
const TimeMachineIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={cn("w-[15px] h-[15px]", className)} fill="currentColor">
    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M12 6v6l4 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M7 4l-2-2M17 4l2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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

// Menu item type definitions with submenu support
interface MenuItemType {
  label?: string;
  shortcut?: string;
  type?: 'separator';
  hasSubmenu?: boolean;
  submenuItems?: MenuItemType[];
  checked?: boolean;
  mixed?: boolean;
  isSearch?: boolean;
  disabled?: boolean;
  action?: string;
}

interface MenuType {
  label: string;
  bold?: boolean;
  items: MenuItemType[];
}

// Services submenu
const servicesSubmenu: MenuItemType[] = [
  { label: 'No Services Apply', disabled: true },
  { type: 'separator' },
  { label: 'Services Settings...', action: 'services-settings' },
];

// Find submenu
const findSubmenu: MenuItemType[] = [
  { label: 'Find...', shortcut: '⌘F', action: 'find' },
  { label: 'Find and Replace...', shortcut: '⌥⌘F', action: 'find-replace' },
  { label: 'Find Next', shortcut: '⌘G', action: 'find-next' },
  { label: 'Find Previous', shortcut: '⇧⌘G', action: 'find-previous' },
  { label: 'Use Selection for Find', shortcut: '⌘E', action: 'find-selection' },
  { label: 'Jump to Selection', shortcut: '⌘J', action: 'jump-selection' },
];

// Share submenu
const shareSubmenu: MenuItemType[] = [
  { label: 'Mail', action: 'share-mail' },
  { label: 'Messages', action: 'share-messages' },
  { label: 'AirDrop', action: 'share-airdrop' },
  { label: 'Notes', action: 'share-notes' },
  { type: 'separator' },
  { label: 'Add to Photos', action: 'share-photos' },
  { label: 'Copy Link', action: 'share-copy-link' },
  { type: 'separator' },
  { label: 'More...', action: 'share-more' },
];

// User Agent submenu for Safari
const userAgentSubmenu: MenuItemType[] = [
  { label: 'Default (Automatic)', checked: true, action: 'ua-default' },
  { type: 'separator' },
  { label: 'Safari - macOS', action: 'ua-safari-mac' },
  { label: 'Safari - iOS', action: 'ua-safari-ios' },
  { label: 'Safari - iPadOS', action: 'ua-safari-ipad' },
  { type: 'separator' },
  { label: 'Google Chrome - macOS', action: 'ua-chrome-mac' },
  { label: 'Google Chrome - Windows', action: 'ua-chrome-win' },
  { label: 'Microsoft Edge - macOS', action: 'ua-edge-mac' },
  { label: 'Firefox - macOS', action: 'ua-firefox-mac' },
];

// App-specific menu configurations
const getAppMenus = (appName: string): MenuType[] => {
  const baseAppMenu: MenuItemType[] = [
    { label: `About ${appName}`, action: `about-app` },
    { type: 'separator' },
    { label: 'Settings...', shortcut: '⌘,', action: 'settings' },
    { type: 'separator' },
    { label: 'Services', hasSubmenu: true, submenuItems: servicesSubmenu },
    { type: 'separator' },
    { label: `Hide ${appName}`, shortcut: '⌘H', action: 'hide' },
    { label: 'Hide Others', shortcut: '⌥⌘H', action: 'hide-others' },
    { label: 'Show All', action: 'show-all' },
    { type: 'separator' },
    { label: `Quit ${appName}`, shortcut: '⌘Q', action: 'quit' },
  ];

  const baseWindowMenu: MenuItemType[] = [
    { label: 'Minimize', shortcut: '⌘M', action: 'minimize' },
    { label: 'Zoom', action: 'zoom' },
    { label: 'Fill', action: 'fill' },
    { label: 'Center', action: 'center' },
    { type: 'separator' },
    { label: 'Move & Resize', hasSubmenu: true, submenuItems: [
      { label: 'Left', action: 'tile-left' },
      { label: 'Right', action: 'tile-right' },
      { label: 'Top', action: 'tile-top' },
      { label: 'Bottom', action: 'tile-bottom' },
      { type: 'separator' },
      { label: 'Top Left', action: 'tile-top-left' },
      { label: 'Top Right', action: 'tile-top-right' },
      { label: 'Bottom Left', action: 'tile-bottom-left' },
      { label: 'Bottom Right', action: 'tile-bottom-right' },
      { type: 'separator' },
      { label: 'Return to Previous Size', action: 'restore' },
    ]},
    { type: 'separator' },
    { label: 'Move to Built-in Retina Display', disabled: true },
    { type: 'separator' },
    { label: 'Cycle Through Windows', shortcut: '⌘`', action: 'cycle-windows' },
    { type: 'separator' },
    { label: 'Bring All to Front', action: 'bring-all-front' },
  ];

  const baseHelpMenu: MenuItemType[] = [
    { label: 'Search', isSearch: true },
    { type: 'separator' },
    { label: `${appName} Help`, action: 'help' },
  ];

  // Terminal-specific menus
  if (appName === 'Terminal') {
    return [
      { label: 'Terminal', bold: true, items: baseAppMenu },
      {
        label: 'Shell',
        items: [
          { label: 'New Window', shortcut: '⌘N', action: 'new-window' },
          { label: 'New Window with Profile', hasSubmenu: true, submenuItems: [
            { label: 'Default', action: 'new-window-default' },
            { label: 'Basic', action: 'new-window-basic' },
            { label: 'Grass', action: 'new-window-grass' },
            { label: 'Homebrew', action: 'new-window-homebrew' },
            { label: 'Man Page', action: 'new-window-manpage' },
            { label: 'Ocean', action: 'new-window-ocean' },
            { label: 'Pro', action: 'new-window-pro' },
          ]},
          { label: 'New Tab', shortcut: '⌘T', action: 'new-tab' },
          { label: 'New Tab with Profile', hasSubmenu: true, submenuItems: [
            { label: 'Default', action: 'new-tab-default' },
            { label: 'Basic', action: 'new-tab-basic' },
            { label: 'Grass', action: 'new-tab-grass' },
            { label: 'Homebrew', action: 'new-tab-homebrew' },
          ]},
          { type: 'separator' },
          { label: 'New Remote Connection...', action: 'new-remote' },
          { type: 'separator' },
          { label: 'Split Horizontally with Current Profile', shortcut: '⌘D', action: 'split-h' },
          { label: 'Split Vertically with Current Profile', shortcut: '⇧⌘D', action: 'split-v' },
          { type: 'separator' },
          { label: 'Close', shortcut: '⌘W', action: 'close' },
          { label: 'Close Tab', shortcut: '⇧⌘W', action: 'close-tab' },
          { label: 'Close Other Tabs', action: 'close-other-tabs' },
          { type: 'separator' },
          { label: 'Export Text As...', action: 'export' },
          { label: 'Export Selected Text As...', disabled: true },
          { type: 'separator' },
          { label: 'Print', shortcut: '⌘P', action: 'print' },
        ]
      },
      {
        label: 'Edit',
        items: [
          { label: 'Undo', shortcut: '⌘Z', action: 'undo' },
          { label: 'Redo', shortcut: '⇧⌘Z', action: 'redo' },
          { type: 'separator' },
          { label: 'Cut', shortcut: '⌘X', action: 'cut' },
          { label: 'Copy', shortcut: '⌘C', action: 'copy' },
          { label: 'Copy Special', hasSubmenu: true, submenuItems: [
            { label: 'Copy Plain Text', action: 'copy-plain' },
            { label: 'Copy with Styles', action: 'copy-styles' },
            { label: 'Copy as Rich Text', action: 'copy-rich' },
          ]},
          { label: 'Paste', shortcut: '⌘V', action: 'paste' },
          { label: 'Paste Escaped Text', shortcut: '⌃⌘V', action: 'paste-escaped' },
          { label: 'Paste Selection', shortcut: '⇧⌘V', action: 'paste-selection' },
          { label: 'Select All', shortcut: '⌘A', action: 'select-all' },
          { type: 'separator' },
          { label: 'Clear to Previous Mark', shortcut: '⌘L', action: 'clear-mark' },
          { label: 'Clear to Start', shortcut: '⌥⌘L', action: 'clear-start' },
          { label: 'Clear Scrollback', action: 'clear-scrollback' },
          { type: 'separator' },
          { label: 'Find', hasSubmenu: true, submenuItems: findSubmenu },
        ]
      },
      {
        label: 'View',
        items: [
          { label: 'Show Tab Bar', shortcut: '⇧⌘T', checked: true, action: 'show-tab-bar' },
          { label: 'Show All Tabs', shortcut: '⇧⌘\\', action: 'show-all-tabs' },
          { type: 'separator' },
          { label: 'Default Font Size', shortcut: '⌘0', action: 'font-default' },
          { label: 'Bigger', shortcut: '⌘+', action: 'font-bigger' },
          { label: 'Smaller', shortcut: '⌘-', action: 'font-smaller' },
          { type: 'separator' },
          { label: 'Scroll to Top', action: 'scroll-top' },
          { label: 'Scroll to Bottom', action: 'scroll-bottom' },
          { type: 'separator' },
          { label: 'Allow Mouse Reporting', checked: true, action: 'mouse-reporting' },
          { label: 'Enable Alternate Screen', checked: true, action: 'alt-screen' },
          { type: 'separator' },
          { label: 'Enter Full Screen', shortcut: '⌃⌘F', action: 'fullscreen' },
        ]
      },
      {
        label: 'Profiles',
        items: [
          { label: 'Default', checked: true, action: 'profile-default' },
          { label: 'Basic', action: 'profile-basic' },
          { label: 'Grass', action: 'profile-grass' },
          { label: 'Homebrew', action: 'profile-homebrew' },
          { label: 'Man Page', action: 'profile-manpage' },
          { label: 'Ocean', action: 'profile-ocean' },
          { label: 'Pro', action: 'profile-pro' },
          { type: 'separator' },
          { label: 'Show Profiles in Settings...', action: 'show-profiles' },
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
          { label: 'New Window', shortcut: '⌘N', action: 'new-window' },
          { label: 'New Private Window', shortcut: '⇧⌘N', action: 'new-private-window' },
          { label: 'New Tab', shortcut: '⌘T', action: 'new-tab' },
          { type: 'separator' },
          { label: 'Open Location...', shortcut: '⌘L', action: 'open-location' },
          { label: 'Open File...', shortcut: '⌘O', action: 'open-file' },
          { type: 'separator' },
          { label: 'Close Window', shortcut: '⌘W', action: 'close-window' },
          { label: 'Close All Windows', shortcut: '⌥⌘W', action: 'close-all' },
          { label: 'Close Tab', shortcut: '⇧⌘W', action: 'close-tab' },
          { type: 'separator' },
          { label: 'Save As...', shortcut: '⌘S', action: 'save-as' },
          { type: 'separator' },
          { label: 'Share...', hasSubmenu: true, submenuItems: shareSubmenu },
          { label: 'Export as PDF...', action: 'export-pdf' },
          { type: 'separator' },
          { label: 'Print...', shortcut: '⌘P', action: 'print' },
        ]
      },
      {
        label: 'Edit',
        items: [
          { label: 'Undo', shortcut: '⌘Z', action: 'undo' },
          { label: 'Redo', shortcut: '⇧⌘Z', action: 'redo' },
          { type: 'separator' },
          { label: 'Cut', shortcut: '⌘X', action: 'cut' },
          { label: 'Copy', shortcut: '⌘C', action: 'copy' },
          { label: 'Paste', shortcut: '⌘V', action: 'paste' },
          { label: 'Paste and Match Style', shortcut: '⌥⇧⌘V', action: 'paste-match-style' },
          { label: 'Delete', action: 'delete' },
          { label: 'Select All', shortcut: '⌘A', action: 'select-all' },
          { type: 'separator' },
          { label: 'AutoFill', hasSubmenu: true, submenuItems: [
            { label: 'Contact...', action: 'autofill-contact' },
            { label: 'Passwords...', action: 'autofill-passwords' },
            { label: 'Credit Cards...', action: 'autofill-cards' },
          ]},
          { type: 'separator' },
          { label: 'Find', hasSubmenu: true, submenuItems: findSubmenu },
          { type: 'separator' },
          { label: 'Spelling and Grammar', hasSubmenu: true, submenuItems: [
            { label: 'Show Spelling and Grammar', shortcut: '⌘:', action: 'show-spelling' },
            { label: 'Check Document Now', shortcut: '⌘;', action: 'check-spelling' },
            { type: 'separator' },
            { label: 'Check Spelling While Typing', checked: true, action: 'spell-while-type' },
            { label: 'Check Grammar With Spelling', checked: true, action: 'grammar-spelling' },
            { label: 'Correct Spelling Automatically', checked: true, action: 'auto-correct' },
          ]},
        ]
      },
      {
        label: 'View',
        items: [
          { label: 'Show Tab Overview', shortcut: '⇧⌘\\', action: 'tab-overview' },
          { type: 'separator' },
          { label: 'Stop', shortcut: '⌘.', action: 'stop' },
          { label: 'Reload Page', shortcut: '⌘R', action: 'reload' },
          { label: 'Reload Page From Origin', shortcut: '⌥⌘R', action: 'reload-origin' },
          { type: 'separator' },
          { label: 'Actual Size', shortcut: '⌘0', action: 'zoom-actual' },
          { label: 'Zoom In', shortcut: '⌘+', action: 'zoom-in' },
          { label: 'Zoom Out', shortcut: '⌘-', action: 'zoom-out' },
          { type: 'separator' },
          { label: 'Show Reader', shortcut: '⇧⌘R', action: 'show-reader' },
          { label: 'Show Reading List Sidebar', shortcut: '⌃⌘2', action: 'reading-list' },
          { type: 'separator' },
          { label: 'Show Status Bar', shortcut: '⌘/', checked: false, action: 'status-bar' },
          { label: 'Show Favorites Bar', shortcut: '⇧⌘B', checked: true, action: 'favorites-bar' },
          { label: 'Show Tab Bar', checked: true, action: 'tab-bar' },
          { label: 'Show Sidebar', shortcut: '⇧⌘L', action: 'sidebar' },
          { type: 'separator' },
          { label: 'Customize Toolbar...', action: 'customize-toolbar' },
          { type: 'separator' },
          { label: 'Enter Full Screen', shortcut: '⌃⌘F', action: 'fullscreen' },
        ]
      },
      {
        label: 'History',
        items: [
          { label: 'Back', shortcut: '⌘[', action: 'back' },
          { label: 'Forward', shortcut: '⌘]', action: 'forward' },
          { type: 'separator' },
          { label: 'Home', shortcut: '⇧⌘H', action: 'home' },
          { type: 'separator' },
          { label: 'Show All History', shortcut: '⌘Y', action: 'show-history' },
          { label: 'Clear History...', action: 'clear-history' },
          { type: 'separator' },
          { label: 'Recently Closed', hasSubmenu: true, submenuItems: [
            { label: 'Reopen Last Closed Tab', shortcut: '⇧⌘T', action: 'reopen-tab' },
            { label: 'Reopen Last Closed Window', action: 'reopen-window' },
            { type: 'separator' },
            { label: 'No Recently Closed Items', disabled: true },
          ]},
          { label: 'Reopen Last Closed Tab', shortcut: '⇧⌘T', action: 'reopen-tab' },
        ]
      },
      {
        label: 'Bookmarks',
        items: [
          { label: 'Show Start Page', action: 'start-page' },
          { label: 'Show Bookmarks', shortcut: '⌥⌘B', action: 'show-bookmarks' },
          { label: 'Edit Bookmarks', action: 'edit-bookmarks' },
          { type: 'separator' },
          { label: 'Add Bookmark...', shortcut: '⌘D', action: 'add-bookmark' },
          { label: 'Add to Favorites', action: 'add-favorite' },
          { label: 'Add Bookmark for These Tabs...', action: 'bookmark-tabs' },
          { type: 'separator' },
          { label: 'Favorites', hasSubmenu: true, submenuItems: [
            { label: 'Show Favorites', action: 'show-favorites' },
            { type: 'separator' },
            { label: 'Apple', action: 'fav-apple' },
            { label: 'GitHub', action: 'fav-github' },
            { label: 'YouTube', action: 'fav-youtube' },
          ]},
        ]
      },
      {
        label: 'Develop',
        items: [
          { label: 'Open Page With', hasSubmenu: true, submenuItems: [
            { label: 'Safari', checked: true, action: 'open-safari' },
            { label: 'Chrome', action: 'open-chrome' },
            { label: 'Firefox', action: 'open-firefox' },
          ]},
          { type: 'separator' },
          { label: 'Show Web Inspector', shortcut: '⌥⌘I', action: 'web-inspector' },
          { label: 'Show JavaScript Console', shortcut: '⌥⌘C', action: 'js-console' },
          { label: 'Show Page Source', shortcut: '⌥⌘U', action: 'page-source' },
          { label: 'Show Page Resources', shortcut: '⌥⌘A', action: 'page-resources' },
          { type: 'separator' },
          { label: 'Start Timeline Recording', shortcut: '⌃⌘T', action: 'timeline' },
          { label: 'Start Element Selection', shortcut: '⌃⌘C', action: 'element-select' },
          { label: 'Enter Responsive Design Mode', shortcut: '⌃⌘R', action: 'responsive-mode' },
          { type: 'separator' },
          { label: 'User Agent', hasSubmenu: true, submenuItems: userAgentSubmenu },
          { type: 'separator' },
          { label: 'Empty Caches', shortcut: '⌥⌘E', action: 'empty-caches' },
          { label: 'Disable Caches', action: 'disable-caches' },
          { type: 'separator' },
          { label: 'Disable Local File Restrictions', action: 'disable-local' },
          { label: 'Disable Cross-Origin Restrictions', action: 'disable-cors' },
        ]
      },
      { label: 'Window', items: baseWindowMenu },
      { label: 'Help', items: baseHelpMenu },
    ];
  }

  // Finder-specific menus
  if (appName === 'Finder') {
    return [
      { label: 'Finder', bold: true, items: baseAppMenu },
      {
        label: 'File',
        items: [
          { label: 'New Finder Window', shortcut: '⌘N', action: 'new-window' },
          { label: 'New Folder', shortcut: '⇧⌘N', action: 'new-folder' },
          { label: 'New Folder with Selection', shortcut: '⌃⌘N', disabled: true },
          { label: 'New Smart Folder', action: 'new-smart-folder' },
          { label: 'New Tab', shortcut: '⌘T', action: 'new-tab' },
          { type: 'separator' },
          { label: 'Open', shortcut: '⌘O', action: 'open' },
          { label: 'Open With', hasSubmenu: true, submenuItems: [
            { label: 'Default Application', action: 'open-default' },
            { label: 'TextEdit', action: 'open-textedit' },
            { label: 'Preview', action: 'open-preview' },
            { type: 'separator' },
            { label: 'Other...', action: 'open-other' },
          ]},
          { label: 'Close Window', shortcut: '⌘W', action: 'close-window' },
          { type: 'separator' },
          { label: 'Get Info', shortcut: '⌘I', action: 'get-info' },
          { label: 'Rename', action: 'rename', disabled: true },
          { label: 'Compress', action: 'compress', disabled: true },
          { label: 'Duplicate', shortcut: '⌘D', disabled: true },
          { label: 'Make Alias', shortcut: '⌃⌘A', disabled: true },
          { label: 'Quick Look', shortcut: '⌘Y', disabled: true },
          { label: 'Print', shortcut: '⌘P', disabled: true },
          { type: 'separator' },
          { label: 'Share', hasSubmenu: true, submenuItems: shareSubmenu },
          { type: 'separator' },
          { label: 'Move to Trash', shortcut: '⌘⌫', disabled: true },
          { type: 'separator' },
          { label: 'Tags...', action: 'tags' },
          { type: 'separator' },
          { label: 'Find', shortcut: '⌘F', action: 'find' },
        ]
      },
      {
        label: 'Edit',
        items: [
          { label: 'Undo', shortcut: '⌘Z', disabled: true },
          { label: 'Redo', shortcut: '⇧⌘Z', disabled: true },
          { type: 'separator' },
          { label: 'Cut', shortcut: '⌘X', disabled: true },
          { label: 'Copy', shortcut: '⌘C', disabled: true },
          { label: 'Paste', shortcut: '⌘V', disabled: true },
          { label: 'Select All', shortcut: '⌘A', action: 'select-all' },
          { type: 'separator' },
          { label: 'Show Clipboard', action: 'show-clipboard' },
        ]
      },
      {
        label: 'View',
        items: [
          { label: 'as Icons', shortcut: '⌘1', checked: true, action: 'view-icons' },
          { label: 'as List', shortcut: '⌘2', action: 'view-list' },
          { label: 'as Columns', shortcut: '⌘3', action: 'view-columns' },
          { label: 'as Gallery', shortcut: '⌘4', action: 'view-gallery' },
          { type: 'separator' },
          { label: 'Use Groups', shortcut: '⌃⌘0', action: 'use-groups' },
          { label: 'Sort By', hasSubmenu: true, submenuItems: [
            { label: 'Name', action: 'sort-name' },
            { label: 'Kind', action: 'sort-kind' },
            { label: 'Date Last Opened', action: 'sort-opened' },
            { label: 'Date Added', action: 'sort-added' },
            { label: 'Date Modified', checked: true, action: 'sort-modified' },
            { label: 'Date Created', action: 'sort-created' },
            { label: 'Size', action: 'sort-size' },
            { label: 'Tags', action: 'sort-tags' },
          ]},
          { type: 'separator' },
          { label: 'Clean Up', action: 'clean-up' },
          { label: 'Clean Up By', hasSubmenu: true, submenuItems: [
            { label: 'Name', action: 'cleanup-name' },
            { label: 'Kind', action: 'cleanup-kind' },
            { label: 'Date Modified', action: 'cleanup-modified' },
            { label: 'Size', action: 'cleanup-size' },
          ]},
          { type: 'separator' },
          { label: 'Show Tab Bar', shortcut: '⇧⌘T', action: 'show-tab-bar' },
          { label: 'Show All Tabs', shortcut: '⇧⌘\\', action: 'show-all-tabs' },
          { type: 'separator' },
          { label: 'Hide Sidebar', shortcut: '⌥⌘S', action: 'hide-sidebar' },
          { label: 'Show Preview', shortcut: '⇧⌘P', action: 'show-preview' },
          { type: 'separator' },
          { label: 'Hide Toolbar', shortcut: '⌥⌘T', action: 'hide-toolbar' },
          { label: 'Show Path Bar', shortcut: '⌥⌘P', action: 'show-path-bar' },
          { label: 'Show Status Bar', shortcut: '⌘/', action: 'show-status-bar' },
          { type: 'separator' },
          { label: 'Customize Toolbar...', action: 'customize-toolbar' },
          { type: 'separator' },
          { label: 'Show View Options', shortcut: '⌘J', action: 'view-options' },
          { type: 'separator' },
          { label: 'Enter Full Screen', shortcut: '⌃⌘F', action: 'fullscreen' },
        ]
      },
      {
        label: 'Go',
        items: [
          { label: 'Back', shortcut: '⌘[', action: 'back' },
          { label: 'Forward', shortcut: '⌘]', action: 'forward' },
          { label: 'Enclosing Folder', shortcut: '⌘↑', action: 'enclosing' },
          { type: 'separator' },
          { label: 'Recents', shortcut: '⇧⌘F', action: 'recents' },
          { label: 'Documents', shortcut: '⇧⌘O', action: 'documents' },
          { label: 'Desktop', shortcut: '⇧⌘D', action: 'desktop' },
          { label: 'Downloads', shortcut: '⌥⌘L', action: 'downloads' },
          { label: 'Home', shortcut: '⇧⌘H', action: 'home' },
          { label: 'Computer', shortcut: '⇧⌘C', action: 'computer' },
          { label: 'AirDrop', shortcut: '⇧⌘R', action: 'airdrop' },
          { label: 'Network', shortcut: '⇧⌘K', action: 'network' },
          { label: 'iCloud Drive', action: 'icloud' },
          { label: 'Applications', shortcut: '⇧⌘A', action: 'applications' },
          { label: 'Utilities', shortcut: '⇧⌘U', action: 'utilities' },
          { type: 'separator' },
          { label: 'Recent Folders', hasSubmenu: true, submenuItems: [
            { label: 'No Recent Folders', disabled: true },
          ]},
          { type: 'separator' },
          { label: 'Go to Folder...', shortcut: '⇧⌘G', action: 'go-to-folder' },
          { label: 'Connect to Server...', shortcut: '⌘K', action: 'connect-server' },
        ]
      },
      { label: 'Window', items: baseWindowMenu },
      { label: 'Help', items: baseHelpMenu },
    ];
  }

  // Default menus for other apps
  return [
    { label: appName, bold: true, items: baseAppMenu },
    {
      label: 'File',
      items: [
        { label: 'New', shortcut: '⌘N', action: 'new' },
        { label: 'New Window', shortcut: '⇧⌘N', action: 'new-window' },
        { label: 'New Tab', shortcut: '⌘T', action: 'new-tab' },
        { type: 'separator' },
        { label: 'Open...', shortcut: '⌘O', action: 'open' },
        { label: 'Open Recent', hasSubmenu: true, submenuItems: [
          { label: 'No Recent Items', disabled: true },
          { type: 'separator' },
          { label: 'Clear Menu', action: 'clear-recents' },
        ]},
        { type: 'separator' },
        { label: 'Close Window', shortcut: '⌘W', action: 'close-window' },
        { label: 'Close All', shortcut: '⌥⌘W', action: 'close-all' },
        { type: 'separator' },
        { label: 'Save...', shortcut: '⌘S', action: 'save' },
        { label: 'Save As...', shortcut: '⇧⌘S', action: 'save-as' },
        { type: 'separator' },
        { label: 'Share...', hasSubmenu: true, submenuItems: shareSubmenu },
        { type: 'separator' },
        { label: 'Print...', shortcut: '⌘P', action: 'print' },
      ]
    },
    {
      label: 'Edit',
      items: [
        { label: 'Undo', shortcut: '⌘Z', action: 'undo' },
        { label: 'Redo', shortcut: '⇧⌘Z', action: 'redo' },
        { type: 'separator' },
        { label: 'Cut', shortcut: '⌘X', action: 'cut' },
        { label: 'Copy', shortcut: '⌘C', action: 'copy' },
        { label: 'Paste', shortcut: '⌘V', action: 'paste' },
        { label: 'Paste and Match Style', shortcut: '⌥⇧⌘V', action: 'paste-match-style' },
        { label: 'Delete', action: 'delete' },
        { label: 'Select All', shortcut: '⌘A', action: 'select-all' },
        { type: 'separator' },
        { label: 'Find', hasSubmenu: true, submenuItems: findSubmenu },
      ]
    },
    {
      label: 'View',
      items: [
        { label: 'Show Tab Bar', shortcut: '⇧⌘T', action: 'show-tab-bar' },
        { label: 'Show All Tabs', shortcut: '⇧⌘\\', action: 'show-all-tabs' },
        { type: 'separator' },
        { label: 'Show Toolbar', shortcut: '⌥⌘T', action: 'show-toolbar' },
        { label: 'Customize Toolbar...', action: 'customize-toolbar' },
        { type: 'separator' },
        { label: 'Show Sidebar', shortcut: '⌥⌘S', action: 'show-sidebar' },
        { type: 'separator' },
        { label: 'Actual Size', shortcut: '⌘0', action: 'zoom-actual' },
        { label: 'Zoom In', shortcut: '⌘+', action: 'zoom-in' },
        { label: 'Zoom Out', shortcut: '⌘-', action: 'zoom-out' },
        { type: 'separator' },
        { label: 'Enter Full Screen', shortcut: '⌃⌘F', action: 'fullscreen' },
      ]
    },
    { label: 'Window', items: baseWindowMenu },
    { label: 'Help', items: baseHelpMenu },
  ];
};

// Notification Button component with badge
const NotificationButton: React.FC = () => {
  const { unreadCount, toggleNotificationCenter, isOpen } = useNotifications();

  const systemTrayButtonClass = "h-[22px] px-[7px] flex items-center rounded-[5px] mx-[1px] hover:bg-white/20 outline-none focus:outline-none focus:ring-0 transition-colors duration-75";

  return (
    <button
      className={cn(systemTrayButtonClass, isOpen && "bg-white/20")}
      onClick={toggleNotificationCenter}
      aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      data-notification-trigger
    >
      <div className="relative">
        <Bell className="w-[14px] h-[14px] opacity-90" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center px-0.5">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </div>
    </button>
  );
};

// User Avatar component for menu bar
const UserAvatar: React.FC<{ className?: string }> = ({ className }) => {
  const { currentUser, generateAvatarColor } = useUser();

  if (!currentUser) {
    return <User className={cn("w-[14px] h-[14px] opacity-90", className)} />;
  }

  if (currentUser.avatar) {
    return (
      <img
        src={currentUser.avatar}
        alt={currentUser.name}
        className={cn("w-5 h-5 rounded-full object-cover", className)}
      />
    );
  }

  const initials = currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const colorClass = generateAvatarColor(currentUser.name);

  return (
    <div className={cn(
      "w-5 h-5 rounded-full bg-gradient-to-br flex items-center justify-center text-[9px] font-semibold text-white",
      colorClass,
      className
    )}>
      {initials}
    </div>
  );
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
  const [showBatteryPercent, setShowBatteryPercent] = useState(true);
  const [wifiEnabled, setWifiEnabled] = useState(true);
  const [wifiNetworkName] = useState('Home Network');
  const [bluetoothEnabled, setBluetoothEnabled] = useState(true);
  const [volume, setVolume] = useState([75]);
  const [brightness, setBrightness] = useState([80]);
  const [airDropEnabled, setAirDropEnabled] = useState(true);
  const [stageManagerEnabled, setStageManagerEnabled] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [screenMirroringEnabled, setScreenMirroringEnabled] = useState(false);
  const [accessibilityEnabled, setAccessibilityEnabled] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [menuBarActive, setMenuBarActive] = useState(false);
  const menuBarRef = useRef<HTMLDivElement>(null);
  const [activeSystemMenu, setActiveSystemMenu] = useState<string | null>(null);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const submenuTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Context hooks
  const { clearRecents } = useRecents();
  const { currentUser } = useUser();

  // Get app-specific menus
  const menuItems = useMemo(() => getAppMenus(appName), [appName]);

  // Close menus when window loses focus
  useEffect(() => {
    const handleWindowBlur = () => {
      setActiveMenu(null);
      setActiveSystemMenu(null);
      setMenuBarActive(false);
      setOpenSubmenu(null);
    };
    window.addEventListener('blur', handleWindowBlur);
    return () => window.removeEventListener('blur', handleWindowBlur);
  }, []);

  // Battery and time updates
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

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
        battery.addEventListener('levelchange', () => setBatteryLevel(Math.round(battery.level * 100)));
        battery.addEventListener('chargingchange', () => setIsCharging(battery.charging));
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
        setOpenSubmenu(null);
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

  const luxMenuItems: MenuItemType[] = useMemo(() => [
    { label: 'About This Mac', action: 'about-mac' },
    { type: 'separator' },
    { label: 'System Settings...', action: 'system-settings' },
    { label: 'App Store...', action: 'app-store' },
    { type: 'separator' },
    { label: 'Recent Items', hasSubmenu: true, submenuItems: [
      { label: 'No Recent Items', disabled: true },
      { type: 'separator' },
      { label: 'Clear Menu', action: 'clear-recents' },
    ]},
    { type: 'separator' },
    { label: 'Force Quit...', shortcut: '⌥⌘⎋', action: 'force-quit' },
    { type: 'separator' },
    { label: 'Sleep', action: 'sleep' },
    { label: 'Restart...', action: 'restart' },
    { label: 'Shut Down...', action: 'shutdown' },
    { type: 'separator' },
    { label: 'Lock Screen', shortcut: '⌃⌘Q', action: 'lock-screen' },
    { label: `Log Out ${currentUser?.name ?? 'User'}...`, shortcut: '⇧⌘Q', action: 'logout' },
  ], [currentUser?.name]);

  const handleMenuClick = useCallback((index: number) => {
    if (activeMenu === index) {
      setActiveMenu(null);
      setMenuBarActive(false);
      setOpenSubmenu(null);
    } else {
      setActiveMenu(index);
      setMenuBarActive(true);
      setOpenSubmenu(null);
    }
  }, [activeMenu]);

  const handleMenuHover = useCallback((index: number) => {
    if (menuBarActive) {
      setActiveMenu(index);
      setOpenSubmenu(null);
    }
  }, [menuBarActive]);

  // Submenu hover handlers with delay
  const handleSubmenuEnter = useCallback((submenuId: string) => {
    if (submenuTimeoutRef.current) {
      clearTimeout(submenuTimeoutRef.current);
      submenuTimeoutRef.current = null;
    }
    setOpenSubmenu(submenuId);
  }, []);

  const handleSubmenuLeave = useCallback(() => {
    submenuTimeoutRef.current = setTimeout(() => {
      setOpenSubmenu(null);
    }, 150);
  }, []);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (submenuTimeoutRef.current) {
        clearTimeout(submenuTimeoutRef.current);
      }
    };
  }, []);

  const VolumeIcon = () => {
    if (volume[0] === 0) return <VolumeX className="w-[15px] h-[15px] opacity-90" />;
    if (volume[0] < 50) return <Volume1 className="w-[15px] h-[15px] opacity-90" />;
    return <Volume2 className="w-[15px] h-[15px] opacity-90" />;
  };

  const BatteryIcon = () => {
    if (isCharging) return <BatteryCharging className="w-[18px] h-[18px] opacity-90" />;
    if (batteryLevel <= 20) return <BatteryLow className="w-[18px] h-[18px] opacity-90 text-red-400" />;
    if (batteryLevel <= 50) return <BatteryMedium className="w-[18px] h-[18px] opacity-90" />;
    if (batteryLevel <= 80) return <Battery className="w-[18px] h-[18px] opacity-90" />;
    return <BatteryFull className="w-[18px] h-[18px] opacity-90" />;
  };

  const menuButtonClass = "h-[22px] px-[10px] flex items-center rounded-[5px] mx-[1px] hover:bg-white/20 outline-none focus:outline-none focus:ring-0 transition-colors duration-75";
  const systemTrayButtonClass = "h-[22px] px-[7px] flex items-center rounded-[5px] mx-[1px] hover:bg-white/20 outline-none focus:outline-none focus:ring-0 transition-colors duration-75";

  // Handle menu item click with action routing
  const handleMenuItemClick = useCallback((item: MenuItemType) => {
    if (item.disabled || item.hasSubmenu || item.isSearch) return;

    setActiveMenu(null);
    setActiveSystemMenu(null);
    setMenuBarActive(false);
    setOpenSubmenu(null);

    const action = item.action;
    const label = item.label || '';

    // System menu actions
    if (action === 'about-mac' && onAboutMac) { onAboutMac(); return; }
    if (action === 'system-settings' && onOpenSettings) { onOpenSettings(); return; }
    if (action === 'force-quit') { window.dispatchEvent(new CustomEvent('zos:force-quit-dialog')); return; }
    if (action === 'sleep' && onSleep) { onSleep(); return; }
    if (action === 'restart' && onRestart) { onRestart(); return; }
    if (action === 'shutdown' && onShutdown) { onShutdown(); return; }
    if (action === 'lock-screen' && onLockScreen) { onLockScreen(); return; }
    if (action === 'logout' && onLockScreen) { onLockScreen(); return; }

    // App menu actions
    if (action === 'about-app' && onAboutApp) { onAboutApp(appName); return; }
    if (action === 'settings' && onOpenSettings) { onOpenSettings(); return; }
    if (action === 'quit' && onQuitApp) { onQuitApp(); return; }
    if (action === 'hide') { onMinimize?.(); window.dispatchEvent(new CustomEvent('zos:hide-app', { detail: { appName } })); return; }
    if (action === 'hide-others') { window.dispatchEvent(new CustomEvent('zos:hide-others', { detail: { appName } })); toast.info('Hide Others'); return; }
    if (action === 'show-all') { window.dispatchEvent(new CustomEvent('zos:show-all')); toast.info('Show All'); return; }

    // Window actions
    if (action === 'minimize') { onMinimize?.(); return; }
    if (action === 'zoom') { window.dispatchEvent(new CustomEvent('zos:window-zoom', { detail: { appName } })); return; }
    if (action === 'tile-left') { window.dispatchEvent(new CustomEvent('zos:window-left', { detail: { appName } })); return; }
    if (action === 'tile-right') { window.dispatchEvent(new CustomEvent('zos:window-right', { detail: { appName } })); return; }
    if (action === 'cycle-windows') { window.dispatchEvent(new CustomEvent('zos:cycle-windows')); return; }
    if (action === 'bring-all-front') { window.dispatchEvent(new CustomEvent('zos:bring-all-front')); return; }
    if (action === 'fullscreen') {
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen();
      return;
    }

    // File actions
    if (action === 'new-window') { window.dispatchEvent(new CustomEvent('zos:new-window', { detail: { appName } })); return; }
    if (action === 'new-tab') { window.dispatchEvent(new CustomEvent('zos:new-tab', { detail: { appName } })); return; }
    if (action === 'close-window' || action === 'close') { onQuitApp?.(); return; }
    if (action === 'print') { window.print(); return; }

    // Edit actions
    if (action === 'undo') { document.execCommand('undo'); return; }
    if (action === 'redo') { document.execCommand('redo'); return; }
    if (action === 'cut') { document.execCommand('cut'); return; }
    if (action === 'copy') { document.execCommand('copy'); return; }
    if (action === 'paste') { navigator.clipboard.readText().then(t => document.execCommand('insertText', false, t)).catch(() => document.execCommand('paste')); return; }
    if (action === 'select-all') { document.execCommand('selectAll'); return; }

    // View actions
    if (action === 'zoom-in' || action === 'font-bigger') { document.body.style.zoom = String(Math.min(parseFloat(document.body.style.zoom || '1') + 0.1, 2)); return; }
    if (action === 'zoom-out' || action === 'font-smaller') { document.body.style.zoom = String(Math.max(parseFloat(document.body.style.zoom || '1') - 0.1, 0.5)); return; }
    if (action === 'zoom-actual' || action === 'font-default') { document.body.style.zoom = '1'; return; }

    // Clear recents
    if (action === 'clear-recents') { clearRecents(); toast.info('Recent Items Cleared'); return; }

    // Default fallback - show toast
    toast.info(label, { description: item.shortcut || '' });
  }, [appName, onAboutApp, onAboutMac, onLockScreen, onMinimize, onOpenSettings, onQuitApp, onRestart, onShutdown, onSleep, clearRecents]);

  // Render submenu recursively
  const renderSubmenu = useCallback((items: MenuItemType[], parentId: string, level: number = 0): React.ReactNode => {
    return (
      <div
        className="absolute min-w-[220px] vibrancy-menu rounded-lg shadow-2xl text-white/90 text-[13px] py-1 left-full top-0 -mt-1 ml-0.5"
        onMouseEnter={() => handleSubmenuEnter(parentId)}
        onMouseLeave={handleSubmenuLeave}
      >
        {items.map((item, idx) => {
          if (item.type === 'separator') {
            return <div key={idx} className="h-px bg-white/10 my-1 mx-3" />;
          }

          const submenuId = `${parentId}-${idx}`;
          const isSubmenuOpen = openSubmenu === submenuId;

          return (
            <div
              key={idx}
              className={cn(
                "relative flex items-center justify-between mx-1 px-3 py-[5px] rounded-md cursor-pointer transition-colors",
                item.disabled ? "opacity-40 cursor-default" : "hover:bg-blue-500/90"
              )}
              onClick={() => !item.disabled && !item.hasSubmenu && handleMenuItemClick(item)}
              onMouseEnter={() => item.hasSubmenu && handleSubmenuEnter(submenuId)}
              onMouseLeave={() => item.hasSubmenu && handleSubmenuLeave()}
            >
              <span className="flex items-center gap-2 min-w-0 flex-1">
                {item.checked && <Check className="w-3.5 h-3.5 shrink-0" />}
                {item.mixed && <Minus className="w-3.5 h-3.5 shrink-0" />}
                <span className="truncate">{item.label}</span>
              </span>
              <span className="flex items-center gap-2 shrink-0 ml-4">
                {item.shortcut && <span className="text-white/50 text-[12px]">{item.shortcut}</span>}
                {item.hasSubmenu && <ChevronRight className="w-3.5 h-3.5 opacity-50" />}
              </span>
              {item.hasSubmenu && item.submenuItems && isSubmenuOpen && renderSubmenu(item.submenuItems, submenuId, level + 1)}
            </div>
          );
        })}
      </div>
    );
  }, [openSubmenu, handleSubmenuEnter, handleSubmenuLeave, handleMenuItemClick]);

  const renderMenuItem = useCallback((item: MenuItemType, itemIndex: number, menuIndex: number) => {
    if (item.type === 'separator') {
      return <div key={itemIndex} className="h-px bg-white/10 my-1 mx-3" />;
    }
    if (item.isSearch) {
      return (
        <div key={itemIndex} className="px-2 py-1.5">
          <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg border border-white/10">
            <Search className="w-3.5 h-3.5 text-white/50" />
            <input type="text" placeholder="Search" className="flex-1 bg-transparent text-white text-[13px] outline-none placeholder:text-white/50" />
          </div>
        </div>
      );
    }

    const submenuId = `menu-${menuIndex}-${itemIndex}`;
    const isSubmenuOpen = openSubmenu === submenuId;

    return (
      <div
        key={itemIndex}
        className={cn(
          "relative flex items-center justify-between mx-1 px-3 py-[5px] rounded-md cursor-pointer transition-colors",
          item.disabled ? "opacity-40 cursor-default" : "hover:bg-blue-500/90"
        )}
        onClick={() => !item.disabled && !item.hasSubmenu && handleMenuItemClick(item)}
        onMouseEnter={() => item.hasSubmenu && handleSubmenuEnter(submenuId)}
        onMouseLeave={() => item.hasSubmenu && handleSubmenuLeave()}
      >
        <span className="flex items-center gap-2 min-w-0 flex-1">
          {item.checked && <Check className="w-3.5 h-3.5 shrink-0" />}
          {item.mixed && <Minus className="w-3.5 h-3.5 shrink-0" />}
          <span className="truncate">{item.label}</span>
        </span>
        <span className="flex items-center gap-2 shrink-0 ml-4">
          {item.shortcut && <span className="text-white/50 text-[12px]">{item.shortcut}</span>}
          {item.hasSubmenu && <ChevronRight className="w-3.5 h-3.5 opacity-50" />}
        </span>
        {item.hasSubmenu && item.submenuItems && isSubmenuOpen && renderSubmenu(item.submenuItems, submenuId, 0)}
      </div>
    );
  }, [openSubmenu, handleSubmenuEnter, handleSubmenuLeave, handleMenuItemClick, renderSubmenu]);

  return (
    <div
      ref={menuBarRef}
      className={cn(
        'fixed top-[3px] left-[4px] right-[4px] z-[10000]',
        'h-[28px] px-2',
        'flex items-center justify-between',
        'vibrancy-menubar',
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
          >
            <ZMenuLogo className="w-[14px] h-[14px] text-white opacity-90" />
          </button>
          {activeMenu === -1 && (
            <div className="absolute top-full left-0 mt-[5px] min-w-[240px] vibrancy-menu rounded-lg shadow-2xl text-white/90 text-[13px] py-1 max-h-[80vh] overflow-y-auto">
              {luxMenuItems.map((item, index) => renderMenuItem(item, index, -1))}
            </div>
          )}
        </div>

        {/* App menus */}
        {menuItems.map((menu, menuIndex) => (
          <div key={menuIndex} className="relative h-full">
            <button
              className={cn(menuButtonClass, menu.bold && "font-semibold", activeMenu === menuIndex && "bg-white/20")}
              onClick={() => handleMenuClick(menuIndex)}
              onMouseEnter={() => handleMenuHover(menuIndex)}
            >
              {menu.label}
            </button>
            {activeMenu === menuIndex && (
              <div className="absolute top-full left-0 mt-[5px] min-w-[240px] vibrancy-menu rounded-lg shadow-2xl text-white/90 text-[13px] py-1 max-h-[80vh] overflow-y-auto">
                {menu.items.map((item, itemIndex) => renderMenuItem(item, itemIndex, menuIndex))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Right side - System tray */}
      <div className="flex items-center h-full gap-0">
        {/* Bluetooth */}
        <div className="relative h-full">
          <button
            className={cn(systemTrayButtonClass, activeSystemMenu === 'bluetooth' && "bg-white/20")}
            onClick={() => setActiveSystemMenu(activeSystemMenu === 'bluetooth' ? null : 'bluetooth')}
            aria-label={`Bluetooth ${bluetoothEnabled ? 'enabled' : 'disabled'}`}
          >
            {bluetoothEnabled ? <Bluetooth className="w-[15px] h-[15px] opacity-90" /> : <BluetoothOff className="w-[15px] h-[15px] opacity-50" />}
          </button>
          {activeSystemMenu === 'bluetooth' && (
            <div className="absolute top-full right-0 mt-[5px] min-w-[280px] vibrancy-control rounded-2xl text-white/90 text-[13px] py-1">
              <div className="px-3 py-2 flex items-center justify-between">
                <span className="font-semibold">Bluetooth</span>
                <button onClick={() => setBluetoothEnabled(!bluetoothEnabled)} className={cn("w-10 h-6 rounded-full transition-colors relative", bluetoothEnabled ? "bg-blue-500" : "bg-white/20")}>
                  <div className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-transform", bluetoothEnabled ? "left-5" : "left-1")} />
                </button>
              </div>
              <div className="h-px bg-white/10 my-1" />
              <div className="px-3 py-1 text-white/50 text-xs">Devices</div>
              <div className="px-3 py-2 flex items-center gap-3 rounded-md hover:bg-blue-500/90 cursor-pointer mx-1">
                <Keyboard className="w-4 h-4" />
                <div className="flex-1"><p>Magic Keyboard</p><p className="text-white/50 text-xs">Connected</p></div>
                <div className="w-2 h-2 rounded-full bg-green-500" />
              </div>
              <div className="h-px bg-white/10 my-1" />
              <div className="px-3 py-1.5 rounded-md hover:bg-blue-500/90 cursor-pointer mx-1">Bluetooth Settings...</div>
            </div>
          )}
        </div>

        {/* Wi-Fi */}
        <div className="relative h-full">
          <button
            className={cn(systemTrayButtonClass, activeSystemMenu === 'wifi' && "bg-white/20")}
            onClick={() => setActiveSystemMenu(activeSystemMenu === 'wifi' ? null : 'wifi')}
            aria-label={`Wi-Fi ${wifiEnabled ? 'connected' : 'off'}`}
          >
            {wifiEnabled ? <Wifi className="w-[15px] h-[15px] opacity-90" /> : <WifiOff className="w-[15px] h-[15px] opacity-50" />}
          </button>
          {activeSystemMenu === 'wifi' && (
            <div className="absolute top-full right-0 mt-[5px] min-w-[280px] vibrancy-control rounded-2xl text-white/90 text-[13px] py-1">
              <div className="px-3 py-2 flex items-center justify-between">
                <span className="font-semibold">Wi-Fi</span>
                <button onClick={() => setWifiEnabled(!wifiEnabled)} className={cn("w-10 h-6 rounded-full transition-colors relative", wifiEnabled ? "bg-blue-500" : "bg-white/20")}>
                  <div className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-transform", wifiEnabled ? "left-5" : "left-1")} />
                </button>
              </div>
              {wifiEnabled && (
                <>
                  <div className="h-px bg-white/10 my-1" />
                  <div className="px-3 py-1 text-white/50 text-xs">Current Network</div>
                  <div className="px-3 py-2 flex items-center gap-3 rounded-md bg-blue-500/20 mx-1">
                    <Wifi className="w-4 h-4" /><span className="flex-1">{wifiNetworkName}</span><Check className="w-4 h-4" />
                  </div>
                </>
              )}
              <div className="h-px bg-white/10 my-1" />
              <div className="px-3 py-1.5 rounded-md hover:bg-blue-500/90 cursor-pointer mx-1">Wi-Fi Settings...</div>
            </div>
          )}
        </div>

        {/* Time Machine */}
        <button className={systemTrayButtonClass} onClick={() => toast.info('Time Machine', { description: 'Last backup: Today at 2:30 PM' })} aria-label="Time Machine">
          <TimeMachineIcon className="opacity-90" />
        </button>

        {/* Battery with percentage */}
        <div className="relative h-full">
          <button
            className={cn(systemTrayButtonClass, activeSystemMenu === 'battery' && "bg-white/20")}
            onClick={() => setActiveSystemMenu(activeSystemMenu === 'battery' ? null : 'battery')}
            aria-label={`Battery ${batteryLevel}%`}
          >
            <div className="flex items-center gap-1">
              {showBatteryPercent && <span className={cn("text-[11px] opacity-80", batteryLevel <= 20 && !isCharging && "text-red-400")}>{batteryLevel}%</span>}
              <BatteryIcon />
            </div>
          </button>
          {activeSystemMenu === 'battery' && (
            <div className="absolute top-full right-0 mt-[5px] min-w-[220px] vibrancy-control rounded-2xl text-white/90 text-[13px] py-1">
              <div className="px-3 py-2">
                <div className="flex items-center justify-between"><span className="font-semibold">Battery</span><span className={cn("font-semibold", batteryLevel <= 20 && !isCharging && "text-red-400")}>{batteryLevel}%</span></div>
                <p className="text-white/60 text-xs mt-1">{isCharging ? 'Power Source: Power Adapter' : 'Power Source: Battery'}</p>
              </div>
              <div className="h-px bg-white/10 my-1" />
              <div className="px-3 py-1.5 flex items-center justify-between rounded-md hover:bg-blue-500/90 cursor-pointer mx-1" onClick={() => setShowBatteryPercent(!showBatteryPercent)}>
                <span>Show Percentage</span>{showBatteryPercent && <Check className="w-4 h-4" />}
              </div>
              <div className="h-px bg-white/10 my-1" />
              <div className="px-3 py-1.5 rounded-md hover:bg-blue-500/90 cursor-pointer mx-1">Battery Settings...</div>
            </div>
          )}
        </div>

        {/* Volume */}
        <div className="relative h-full">
          <button className={cn(systemTrayButtonClass, activeSystemMenu === 'volume' && "bg-white/20")} onClick={() => setActiveSystemMenu(activeSystemMenu === 'volume' ? null : 'volume')} aria-label={`Volume ${volume[0]}%`}>
            <VolumeIcon />
          </button>
          {activeSystemMenu === 'volume' && (
            <div className="absolute top-full right-0 mt-[5px] min-w-[220px] vibrancy-control rounded-2xl text-white/90 text-[13px] py-1">
              <div className="px-3 py-2">
                <p className="font-semibold mb-2">Sound</p>
                <div className="flex items-center gap-2"><VolumeX className="w-4 h-4 opacity-50" /><Slider value={volume} onValueChange={setVolume} max={100} step={1} className="flex-1" /><Volume2 className="w-4 h-4" /></div>
              </div>
              <div className="h-px bg-white/10 my-1" />
              <div className="px-3 py-1 text-white/50 text-xs">Output Device</div>
              <div className="px-3 py-2 flex items-center gap-3 rounded-md bg-blue-500/20 mx-1"><span className="flex-1">Built-in Speakers</span><Check className="w-4 h-4" /></div>
              <div className="h-px bg-white/10 my-1" />
              <div className="px-3 py-1.5 rounded-md hover:bg-blue-500/90 cursor-pointer mx-1">Sound Settings...</div>
            </div>
          )}
        </div>

        {/* Control Center */}
        <div className="relative h-full">
          <button className={cn(systemTrayButtonClass, activeSystemMenu === 'control' && "bg-white/20")} onClick={() => setActiveSystemMenu(activeSystemMenu === 'control' ? null : 'control')} aria-label="Control Center">
            <ControlCenterIcon className="w-[15px] h-[15px] opacity-90" />
          </button>
          {activeSystemMenu === 'control' && (
            <div className="absolute top-full right-0 mt-[1px] w-[320px] vibrancy-control rounded-2xl text-white/90 text-[13px] p-3">
              {/* Connectivity */}
              <div className="flex gap-2 mb-2">
                <div className="flex-1 bg-white/10 rounded-2xl p-2 flex gap-2">
                  <button onClick={() => setWifiEnabled(!wifiEnabled)} className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-colors", wifiEnabled ? "bg-blue-500" : "bg-white/10 hover:bg-white/15")}><Wifi className="w-5 h-5" /></button>
                  <button onClick={() => setBluetoothEnabled(!bluetoothEnabled)} className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-colors", bluetoothEnabled ? "bg-blue-500" : "bg-white/10 hover:bg-white/15")}><Bluetooth className="w-5 h-5" /></button>
                  <button onClick={() => setAirDropEnabled(!airDropEnabled)} className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-colors", airDropEnabled ? "bg-blue-500" : "bg-white/10 hover:bg-white/15")}><Airplay className="w-5 h-5" /></button>
                </div>
              </div>
              {/* Focus and Now Playing */}
              <div className="flex gap-2 mb-2">
                <FocusModeQuickToggle />
                <div className="flex-1 bg-white/10 rounded-2xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-md bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center"><Music className="w-4 h-4" /></div>
                    <div className="flex-1 min-w-0"><p className="text-xs font-semibold truncate">Not Playing</p><p className="text-xs opacity-50 truncate">Music</p></div>
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <button className="p-1 hover:bg-white/10 rounded"><SkipBack className="w-4 h-4" /></button>
                    <button className="p-1 hover:bg-white/10 rounded" onClick={() => setIsPlaying(!isPlaying)}>{isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}</button>
                    <button className="p-1 hover:bg-white/10 rounded"><SkipForward className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
              {/* Stage Manager, Screen Mirroring */}
              <div className="flex gap-2 mb-2">
                <button onClick={() => setStageManagerEnabled(!stageManagerEnabled)} className={cn("flex-1 p-3 rounded-2xl text-left transition-colors", stageManagerEnabled ? "bg-blue-500" : "bg-white/10 hover:bg-white/15")}><Layers className="w-5 h-5 mb-1" /><p className="text-xs font-semibold">Stage Manager</p></button>
                <button onClick={() => setScreenMirroringEnabled(!screenMirroringEnabled)} className={cn("flex-1 p-3 rounded-2xl text-left transition-colors", screenMirroringEnabled ? "bg-blue-500" : "bg-white/10 hover:bg-white/15")}><MonitorSmartphone className="w-5 h-5 mb-1" /><p className="text-xs font-semibold">Screen Mirroring</p><p className="text-xs opacity-70">{screenMirroringEnabled ? "On" : "Off"}</p></button>
              </div>
              {/* Small buttons */}
              <div className="flex gap-2 mb-3">
                <button onClick={() => setAccessibilityEnabled(!accessibilityEnabled)} className={cn("flex-1 p-3 rounded-2xl transition-colors flex flex-col items-center", accessibilityEnabled ? "bg-blue-500" : "bg-white/10 hover:bg-white/15")}><Accessibility className="w-5 h-5" /><p className="text-[10px] mt-1 opacity-70">Accessibility</p></button>
                <button onClick={() => setCameraEnabled(!cameraEnabled)} className={cn("flex-1 p-3 rounded-2xl transition-colors flex flex-col items-center", cameraEnabled ? "bg-green-500" : "bg-white/10 hover:bg-white/15")}><Camera className="w-5 h-5" /><p className="text-[10px] mt-1 opacity-70">{cameraEnabled ? "In Use" : "Camera"}</p></button>
                <button onClick={onToggleDarkMode} className={cn("flex-1 p-3 rounded-2xl transition-colors flex flex-col items-center", darkMode ? "bg-indigo-500" : "bg-white/10 hover:bg-white/15")}>{darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}<p className="text-[10px] mt-1 opacity-70">{darkMode ? "Dark" : "Light"}</p></button>
              </div>
              {/* Display Slider */}
              <div className="bg-white/10 rounded-2xl p-3 mb-2"><div className="flex items-center gap-3"><Sun className="w-4 h-4 opacity-50" /><Slider value={brightness} onValueChange={setBrightness} max={100} step={1} className="flex-1" /><Sun className="w-5 h-5" /></div></div>
              {/* Sound Slider */}
              <div className="bg-white/10 rounded-2xl p-3"><div className="flex items-center gap-3"><VolumeX className="w-4 h-4 opacity-50" /><Slider value={volume} onValueChange={setVolume} max={100} step={1} className="flex-1" /><Volume2 className="w-5 h-5" /></div></div>
            </div>
          )}
        </div>

        {/* Screen Recording Indicator */}
        <RecordingIndicator />

        {/* Focus Mode Indicator */}
        <FocusModeIndicator />

        {/* Notification Center */}
        <NotificationButton />

        {/* Spotlight Search */}
        <button className={systemTrayButtonClass} onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', metaKey: true, bubbles: true }))} aria-label="Spotlight Search">
          <Search className="w-[14px] h-[14px] opacity-90" />
        </button>

        {/* User Avatar */}
        <div className="relative h-full">
          <button className={cn(systemTrayButtonClass, "px-[5px]", activeSystemMenu === 'user' && "bg-white/20")} onClick={() => setActiveSystemMenu(activeSystemMenu === 'user' ? null : 'user')} aria-label={`User: ${currentUser?.name ?? 'Guest'}`}>
            <UserAvatar />
          </button>
          {activeSystemMenu === 'user' && (
            <div className="absolute top-full right-0 mt-[5px] min-w-[200px] vibrancy-control rounded-2xl text-white/90 text-[13px] py-1">
              <div className="px-3 py-2 flex items-center gap-3"><UserAvatar className="w-8 h-8" /><div><p className="font-semibold">{currentUser?.name ?? 'Guest'}</p><p className="text-white/50 text-xs">{currentUser?.isAdmin ? 'Admin' : 'User'}</p></div></div>
              <div className="h-px bg-white/10 my-1" />
              <div className="px-3 py-1.5 rounded-md hover:bg-blue-500/90 cursor-pointer mx-1">Users & Groups...</div>
              <div className="h-px bg-white/10 my-1" />
              <div className="px-3 py-1.5 rounded-md hover:bg-blue-500/90 cursor-pointer mx-1" onClick={() => onLockScreen?.()}>Lock Screen</div>
              <div className="px-3 py-1.5 rounded-md hover:bg-blue-500/90 cursor-pointer mx-1" onClick={() => onLockScreen?.()}>Log Out {currentUser?.name ?? 'User'}...</div>
            </div>
          )}
        </div>

        {/* Date/Time */}
        <div className="relative h-full">
          <button className={cn(systemTrayButtonClass, "px-[10px]", activeSystemMenu === 'datetime' && "bg-white/20")} onClick={() => setActiveSystemMenu(activeSystemMenu === 'datetime' ? null : 'datetime')} aria-label="Date and time">
            <span className="text-[13px] opacity-90">{formatTime(currentTime)}</span>
          </button>
          {activeSystemMenu === 'datetime' && (
            <div className="absolute top-full right-0 mt-[5px] min-w-[280px] vibrancy-control rounded-2xl text-white/90 text-[13px] py-1">
              <div className="px-3 py-3 text-center">
                <p className="text-3xl font-light">{currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</p>
                <p className="text-white/60 mt-1">{currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </div>
              <div className="h-px bg-white/10 my-1" />
              <div className="px-3 py-1.5 rounded-md hover:bg-blue-500/90 cursor-pointer mx-1 flex items-center gap-2"><Clock className="w-4 h-4" /><span>Open Date & Time...</span></div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside handler */}
      {(activeMenu !== null || activeSystemMenu !== null) && (
        <div className="fixed inset-0 z-[-1]" onClick={() => { setActiveMenu(null); setActiveSystemMenu(null); setMenuBarActive(false); setOpenSubmenu(null); }} />
      )}
    </div>
  );
};

export default ZMenuBar;
