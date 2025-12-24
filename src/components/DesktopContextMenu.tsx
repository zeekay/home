import React, { useState } from 'react';
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

// Menu dimensions for edge detection
const MENU_WIDTH = 220;
const MENU_HEIGHT = 400;
const SUBMENU_WIDTH = 180;

interface ContextMenuPosition {
  x: number;
  y: number;
}

interface DesktopContextMenuProps {
  position: ContextMenuPosition | null;
  onClose: () => void;
  onOpenSettings: () => void;
  onChangeBackground: (theme: string) => void;
  onShowInfo: (title: string, description: string) => void;
}

const DesktopContextMenu: React.FC<DesktopContextMenuProps> = ({
  position,
  onClose,
  onOpenSettings,
  onChangeBackground,
  onShowInfo,
}) => {
  const [showSortSubmenu, setShowSortSubmenu] = useState(false);
  const [showViewSubmenu, setShowViewSubmenu] = useState(false);

  if (!position) return null;

  const MenuItem: React.FC<{
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

  const Separator = () => <div className="h-[1px] bg-white/10 my-[6px] mx-3" />;

  const handleAction = (action: () => void) => {
    onClose();
    action();
  };

  return (
    <div
      className="fixed z-[20000] min-w-[220px] bg-black/80 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl text-white/90 text-[13px] py-1.5 font-medium"
      style={{
        left: position.x,
        top: position.y,
        transform: `translate(${position.x + MENU_WIDTH > window.innerWidth ? '-100%' : '0'}, ${position.y + MENU_HEIGHT > window.innerHeight ? '-100%' : '0'})`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <MenuItem
        icon={<FolderOpen className="w-4 h-4" />}
        label="New Folder"
        shortcut="⇧⌘N"
        onClick={() => handleAction(() => onShowInfo(
          'New Folder',
          'This is a web-based demo. File system operations like creating folders are simulated. Open Terminal and use "mkdir" to create virtual folders.'
        ))}
      />
      <Separator />
      <MenuItem
        icon={<Info className="w-4 h-4" />}
        label="Get Info"
        shortcut="⌘I"
        onClick={() => handleAction(() => onShowInfo(
          'Desktop Info',
          'This is a virtual zOS-style desktop environment built with React + TypeScript. It simulates macOS-like functionality in the browser.'
        ))}
      />
      <MenuItem
        icon={<Image className="w-4 h-4" />}
        label="Change Desktop Background..."
        onClick={() => handleAction(onOpenSettings)}
      />
      <Separator />
      
      {/* Sort By Submenu */}
      <div
        className="relative"
        onMouseEnter={() => { setShowSortSubmenu(true); setShowViewSubmenu(false); }}
      >
        <MenuItem icon={<SortAsc className="w-4 h-4" />} label="Sort By" hasSubmenu />
        {showSortSubmenu && (
          <div className="absolute left-full top-0 ml-1 min-w-[180px] bg-black/80 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl text-white/90 text-[13px] py-1.5">
            {['Name', 'Kind', 'Date Last Opened', 'Date Added', 'Date Modified', 'Date Created', 'Size', 'Tags'].map(item => (
              <MenuItem key={item} label={item} onClick={onClose} />
            ))}
          </div>
        )}
      </div>
      
      <MenuItem icon={<Trash2 className="w-4 h-4" />} label="Clean Up" onClick={onClose} />
      <MenuItem icon={<Grid3X3 className="w-4 h-4" />} label="Clean Up By" hasSubmenu onClick={onClose} />
      <Separator />
      
      {/* View Options Submenu */}
      <div
        className="relative"
        onMouseEnter={() => { setShowViewSubmenu(true); setShowSortSubmenu(false); }}
      >
        <MenuItem icon={<Eye className="w-4 h-4" />} label="View Options" hasSubmenu />
        {showViewSubmenu && (
          <div className="absolute left-full top-0 ml-1 min-w-[180px] bg-black/80 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl text-white/90 text-[13px] py-1.5">
            {['as Icons', 'as List', 'as Columns', 'as Gallery'].map(item => (
              <MenuItem key={item} label={item} onClick={onClose} />
            ))}
          </div>
        )}
      </div>
      <Separator />
      
      <MenuItem icon={<Layout className="w-4 h-4" />} label="Use Stacks" onClick={onClose} />
      <MenuItem
        icon={<Monitor className="w-4 h-4" />}
        label="Show View Options"
        shortcut="⌘J"
        onClick={() => handleAction(onOpenSettings)}
      />
      <Separator />
      
      {/* Background Themes */}
      <div className="px-3 py-1.5 text-white/40 text-xs uppercase tracking-wider">
        Background Theme
      </div>
      {['wireframe', 'gradient', 'particles', 'matrix', 'black'].map(theme => (
        <MenuItem
          key={theme}
          label={theme.charAt(0).toUpperCase() + theme.slice(1).replace('black', 'Solid Black')}
          onClick={() => handleAction(() => onChangeBackground(theme))}
        />
      ))}
    </div>
  );
};

export default DesktopContextMenu;
