import { LucideIcon } from 'lucide-react';
import React from 'react';

export interface DockItemType {
  id: string;
  icon?: LucideIcon;
  customIcon?: React.ReactNode;
  label: string;
  color?: string;
  onClick?: () => void;
  bgGradient?: string;
  useCustomIcon?: boolean; // Flag to indicate this uses a custom SVG icon
}

export interface DockCallbacks {
  onFinderClick?: () => void;
  onSafariClick?: () => void;
  onMailClick?: () => void;
  onPhotosClick?: () => void;
  onCalendarClick?: () => void;
  onSocialsClick?: () => void;
  onFaceTimeClick?: () => void;
  onMusicClick?: () => void;
  onTerminalClick?: () => void;
  onTextEditClick?: () => void;
  onHanzoClick?: () => void;
  onLuxClick?: () => void;
  onZooClick?: () => void;
}

// Main dock items - reduced set as per user request
// Other apps live in the Applications folder
export const createDockItems = (callbacks: DockCallbacks): DockItemType[] => {
  return [
    {
      id: 'finder',
      label: 'Finder',
      onClick: callbacks.onFinderClick,
      useCustomIcon: true,
    },
    { 
      id: 'safari',
      label: 'Safari', 
      onClick: callbacks.onSafariClick,
      useCustomIcon: true,
    },
    { 
      id: 'mail',
      label: 'Mail', 
      onClick: callbacks.onMailClick,
      useCustomIcon: true,
    },
    { 
      id: 'photos',
      label: 'Photos', 
      onClick: callbacks.onPhotosClick,
      useCustomIcon: true,
    },
    { 
      id: 'calendar',
      label: 'Calendar', 
      onClick: callbacks.onCalendarClick,
      useCustomIcon: true,
    },
    { 
      id: 'socials',
      label: 'Messages', 
      onClick: callbacks.onSocialsClick,
      useCustomIcon: true,
    },
    { 
      id: 'facetime',
      label: 'FaceTime', 
      onClick: callbacks.onFaceTimeClick,
      useCustomIcon: true,
    },
    { 
      id: 'music',
      label: 'Music', 
      onClick: callbacks.onMusicClick,
      useCustomIcon: true,
    },
    {
      id: 'terminal',
      label: 'Terminal',
      onClick: callbacks.onTerminalClick,
      useCustomIcon: true,
    },
    {
      id: 'textedit',
      label: 'TextEdit',
      onClick: callbacks.onTextEditClick,
      useCustomIcon: true,
    },
    // Separator would go here (handled in ZDock)
    {
      id: 'hanzo',
      label: 'Hanzo AI',
      onClick: callbacks.onHanzoClick,
      useCustomIcon: true,
    },
    {
      id: 'lux',
      label: 'Lux Wallet',
      onClick: callbacks.onLuxClick,
      useCustomIcon: true,
    },
    {
      id: 'zoo',
      label: 'Zoo',
      onClick: callbacks.onZooClick,
      useCustomIcon: true,
    },
  ];
};

// Apps that live in the Applications folder (not in main dock)
export const applicationItems = [
  { id: 'textpad', label: 'Notes', useCustomIcon: true },
  { id: 'github', label: 'GitHub Stats', useCustomIcon: true },
  { id: 'stats', label: 'Activity Monitor', useCustomIcon: true },
  { id: 'videos', label: 'Videos', useCustomIcon: true },
  { id: 'settings', label: 'System Preferences', useCustomIcon: true },
];
