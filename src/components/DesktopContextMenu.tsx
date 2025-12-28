// Enhanced Desktop Context Menu
// Full macOS-style context menu for desktop interactions
// Backward compatible with position-based rendering

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Image,
  FolderOpen,
  FileText,
  Info,
  Trash2,
  Monitor,
  SortAsc,
  SortDesc,
  Eye,
  EyeOff,
  Grid3X3,
  ChevronRight,
  Plus,
  Move,
  Settings,
  Palette,
  Import,
  Share2,
  Mail,
  MessageSquare,
  Send,
  Printer,
  Copy,
  ClipboardPaste,
  FileType,
  Calendar,
  Clock,
  HardDrive,
  Tag,
  Sparkles,
  RefreshCw,
  Layers,
  LayoutGrid,
  List,
  Columns,
  GalleryHorizontal,
  ArrowUp,
  ArrowDown,
  Maximize,
} from 'lucide-react';
import { useWidgets } from '@/contexts/WidgetContext';
import type { SortBy, ViewMode, DesktopSettings } from '@/types/contextMenu';

// Menu dimensions for edge detection
const MENU_WIDTH = 260;
const MENU_HEIGHT = 600;
const SUBMENU_WIDTH = 200;

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
  // Optional extended props
  onNewFolder?: () => void;
  onNewFile?: () => void;
  onPaste?: () => void;
  onCleanUp?: () => void;
  settings?: Partial<DesktopSettings>;
  onSettingsChange?: (settings: Partial<DesktopSettings>) => void;
}

// MenuItem component
interface MenuItemProps {
  icon?: React.ReactNode;
  label: string;
  shortcut?: string;
  onClick?: () => void;
  hasSubmenu?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  disabled?: boolean;
  checked?: boolean;
  danger?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  label,
  shortcut,
  onClick,
  hasSubmenu,
  onMouseEnter,
  onMouseLeave,
  disabled,
  checked,
  danger,
}) => (
  <div
    className={`flex items-center justify-between mx-1.5 px-3 py-[6px] rounded-[5px] cursor-pointer transition-colors duration-75 ${
      disabled ? 'opacity-40 cursor-default' : danger ? 'hover:bg-red-500/80' : 'hover:bg-blue-500'
    } ${danger ? 'text-red-400' : ''}`}
    onClick={disabled ? undefined : onClick}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
  >
    <span className="flex items-center gap-2.5">
      {checked !== undefined && (
        <span className="w-4 h-4 flex items-center justify-center">
          {checked && <span className="text-blue-400">✓</span>}
        </span>
      )}
      {icon && checked === undefined && (
        <span className="w-4 h-4 flex items-center justify-center opacity-70">{icon}</span>
      )}
      <span>{label}</span>
    </span>
    <span className="flex items-center gap-2">
      {shortcut && <span className="text-white/50 text-xs">{shortcut}</span>}
      {hasSubmenu && <ChevronRight className="w-3 h-3 opacity-50" />}
    </span>
  </div>
);

// Separator component
const Separator: React.FC = () => <div className="h-[1px] bg-white/10 my-[6px] mx-3" />;

// Section label component
const SectionLabel: React.FC<{ label: string }> = ({ label }) => (
  <div className="px-4 py-1.5 text-white/40 text-xs uppercase tracking-wider">
    {label}
  </div>
);

// Submenu component
interface SubmenuProps {
  icon?: React.ReactNode;
  label: string;
  children: React.ReactNode;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  position?: 'right' | 'left';
}

const Submenu: React.FC<SubmenuProps> = ({
  icon,
  label,
  children,
  isOpen,
  onOpen,
  onClose,
  position = 'right',
}) => {
  const submenuRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState<'right' | 'left'>(position);

  // Adjust submenu position if it would go off screen
  useEffect(() => {
    if (isOpen && submenuRef.current) {
      const rect = submenuRef.current.getBoundingClientRect();
      const parentRect = submenuRef.current.parentElement?.getBoundingClientRect();
      if (parentRect && rect.right > window.innerWidth) {
        setAdjustedPosition('left');
      } else {
        setAdjustedPosition('right');
      }
    }
  }, [isOpen]);

  return (
    <div className="relative" onMouseEnter={onOpen} onMouseLeave={onClose}>
      <MenuItem icon={icon} label={label} hasSubmenu />
      {isOpen && (
        <div
          ref={submenuRef}
          className={`absolute top-0 ${adjustedPosition === 'right' ? 'left-full ml-1' : 'right-full mr-1'} min-w-[${SUBMENU_WIDTH}px] bg-black/80 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl text-white/90 text-[13px] py-1.5 z-[20001]`}
        >
          {children}
        </div>
      )}
    </div>
  );
};

const DesktopContextMenu: React.FC<DesktopContextMenuProps> = ({
  position,
  onClose,
  onOpenSettings,
  onChangeBackground,
  onShowInfo,
  onNewFolder,
  onNewFile,
  onPaste,
  onCleanUp,
  settings = {},
  onSettingsChange,
}) => {
  const { editMode, toggleEditMode, openGallery, widgets } = useWidgets();

  // Submenu states
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  // Current settings with defaults
  const currentSettings: DesktopSettings = {
    sortBy: settings.sortBy ?? 'name',
    sortOrder: settings.sortOrder ?? 'asc',
    viewMode: settings.viewMode ?? 'icons',
    showItemInfo: settings.showItemInfo ?? true,
    useStacks: settings.useStacks ?? false,
    stackGroupBy: settings.stackGroupBy ?? 'kind',
    iconSize: settings.iconSize ?? 'medium',
    gridSpacing: settings.gridSpacing ?? 1,
    textSize: settings.textSize ?? 12,
    showIconPreview: settings.showIconPreview ?? true,
  };

  const updateSetting = useCallback(<K extends keyof DesktopSettings>(key: K, value: DesktopSettings[K]) => {
    onSettingsChange?.({ ...currentSettings, [key]: value });
  }, [currentSettings, onSettingsChange]);

  // Close menu when clicking outside
  useEffect(() => {
    if (!position) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-context-menu]')) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [position, onClose]);

  if (!position) return null;

  const handleAction = (action: () => void) => {
    onClose();
    action();
  };

  const handleNewFolder = () => {
    if (onNewFolder) {
      handleAction(onNewFolder);
    } else {
      handleAction(() => onShowInfo(
        'New Folder',
        'This is a web-based demo. File system operations like creating folders are simulated. Open Terminal and use "mkdir" to create virtual folders.'
      ));
    }
  };

  const handleNewFile = () => {
    if (onNewFile) {
      handleAction(onNewFile);
    } else {
      handleAction(() => onShowInfo(
        'New File',
        'Open TextEdit or Terminal to create new files in the virtual file system.'
      ));
    }
  };

  const handleGetInfo = () => {
    handleAction(() => onShowInfo(
      'Desktop Info',
      'This is a virtual zOS-style desktop environment built with React + TypeScript. It simulates macOS-like functionality in the browser.'
    ));
  };

  // Calculate menu position with edge detection
  const menuStyle: React.CSSProperties = {
    left: position.x,
    top: position.y,
    transform: `translate(${position.x + MENU_WIDTH > window.innerWidth ? '-100%' : '0'}, ${position.y + MENU_HEIGHT > window.innerHeight ? '-100%' : '0'})`,
  };

  // Sort options
  const sortOptions = [
    { value: 'name', label: 'Name', icon: <SortAsc className="w-4 h-4" /> },
    { value: 'kind', label: 'Kind', icon: <FileType className="w-4 h-4" /> },
    { value: 'dateOpened', label: 'Date Last Opened', icon: <Clock className="w-4 h-4" /> },
    { value: 'dateAdded', label: 'Date Added', icon: <Calendar className="w-4 h-4" /> },
    { value: 'dateModified', label: 'Date Modified', icon: <RefreshCw className="w-4 h-4" /> },
    { value: 'dateCreated', label: 'Date Created', icon: <Plus className="w-4 h-4" /> },
    { value: 'size', label: 'Size', icon: <HardDrive className="w-4 h-4" /> },
    { value: 'tags', label: 'Tags', icon: <Tag className="w-4 h-4" /> },
  ];

  // View options
  const viewOptions = [
    { value: 'icons', label: 'as Icons', icon: <LayoutGrid className="w-4 h-4" /> },
    { value: 'list', label: 'as List', icon: <List className="w-4 h-4" /> },
    { value: 'columns', label: 'as Columns', icon: <Columns className="w-4 h-4" /> },
    { value: 'gallery', label: 'as Gallery', icon: <GalleryHorizontal className="w-4 h-4" /> },
  ];

  // Background themes
  const backgroundThemes = [
    { id: 'wireframe', label: 'Wireframe' },
    { id: 'gradient', label: 'Gradient' },
    { id: 'particles', label: 'Particles' },
    { id: 'matrix', label: 'Matrix' },
    { id: 'black', label: 'Solid Black' },
  ];

  return (
    <div
      data-context-menu
      className="fixed z-[20000] min-w-[260px] bg-black/80 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl text-white/90 text-[13px] py-1.5 font-medium"
      style={menuStyle}
      onClick={(e) => e.stopPropagation()}
    >
      {/* New Items */}
      <MenuItem
        icon={<FolderOpen className="w-4 h-4" />}
        label="New Folder"
        shortcut="Shift+Cmd+N"
        onClick={handleNewFolder}
      />
      <Submenu
        icon={<Plus className="w-4 h-4" />}
        label="New"
        isOpen={openSubmenu === 'new'}
        onOpen={() => setOpenSubmenu('new')}
        onClose={() => {}}
      >
        <MenuItem
          icon={<FolderOpen className="w-4 h-4" />}
          label="Folder"
          shortcut="Shift+Cmd+N"
          onClick={handleNewFolder}
        />
        <MenuItem
          icon={<FileText className="w-4 h-4" />}
          label="Text File"
          onClick={handleNewFile}
        />
        <Separator />
        <MenuItem
          icon={<Image className="w-4 h-4" />}
          label="From Template..."
          disabled
        />
      </Submenu>

      <Separator />

      {/* Get Info */}
      <MenuItem
        icon={<Info className="w-4 h-4" />}
        label="Get Info"
        shortcut="Cmd+I"
        onClick={handleGetInfo}
      />

      {/* Change Desktop Background */}
      <MenuItem
        icon={<Image className="w-4 h-4" />}
        label="Change Desktop Background..."
        onClick={() => handleAction(onOpenSettings)}
      />

      <Separator />

      {/* Paste */}
      <MenuItem
        icon={<ClipboardPaste className="w-4 h-4" />}
        label="Paste"
        shortcut="Cmd+V"
        onClick={onPaste ? () => handleAction(onPaste) : undefined}
        disabled={!onPaste}
      />

      <Separator />

      {/* Sort By Submenu */}
      <Submenu
        icon={<SortAsc className="w-4 h-4" />}
        label="Sort By"
        isOpen={openSubmenu === 'sort'}
        onOpen={() => setOpenSubmenu('sort')}
        onClose={() => {}}
      >
        {sortOptions.map((opt) => (
          <MenuItem
            key={opt.value}
            icon={opt.icon}
            label={opt.label}
            checked={currentSettings.sortBy === opt.value}
            onClick={() => {
              updateSetting('sortBy', opt.value as SortBy);
              onClose();
            }}
          />
        ))}
        <Separator />
        <MenuItem
          icon={<ArrowUp className="w-4 h-4" />}
          label="Ascending"
          checked={currentSettings.sortOrder === 'asc'}
          onClick={() => {
            updateSetting('sortOrder', 'asc');
            onClose();
          }}
        />
        <MenuItem
          icon={<ArrowDown className="w-4 h-4" />}
          label="Descending"
          checked={currentSettings.sortOrder === 'desc'}
          onClick={() => {
            updateSetting('sortOrder', 'desc');
            onClose();
          }}
        />
      </Submenu>

      {/* Clean Up */}
      <MenuItem
        icon={<Grid3X3 className="w-4 h-4" />}
        label="Clean Up"
        onClick={() => handleAction(onCleanUp || (() => {}))}
      />

      {/* Clean Up By Submenu */}
      <Submenu
        icon={<Sparkles className="w-4 h-4" />}
        label="Clean Up By"
        isOpen={openSubmenu === 'cleanupby'}
        onOpen={() => setOpenSubmenu('cleanupby')}
        onClose={() => {}}
      >
        {sortOptions.map((opt) => (
          <MenuItem
            key={opt.value}
            icon={opt.icon}
            label={opt.label}
            onClick={() => {
              updateSetting('sortBy', opt.value as SortBy);
              if (onCleanUp) handleAction(onCleanUp);
              else onClose();
            }}
          />
        ))}
      </Submenu>

      <Separator />

      {/* View Options */}
      <Submenu
        icon={<Eye className="w-4 h-4" />}
        label="View"
        isOpen={openSubmenu === 'view'}
        onOpen={() => setOpenSubmenu('view')}
        onClose={() => {}}
      >
        {viewOptions.map((opt) => (
          <MenuItem
            key={opt.value}
            icon={opt.icon}
            label={opt.label}
            checked={currentSettings.viewMode === opt.value}
            onClick={() => {
              updateSetting('viewMode', opt.value as ViewMode);
              onClose();
            }}
          />
        ))}
      </Submenu>

      {/* Show View Options */}
      <MenuItem
        icon={<Settings className="w-4 h-4" />}
        label="Show View Options"
        shortcut="Cmd+J"
        onClick={() => handleAction(onOpenSettings)}
      />

      <Separator />

      {/* Stacks */}
      <MenuItem
        icon={<Layers className="w-4 h-4" />}
        label="Use Stacks"
        checked={currentSettings.useStacks}
        onClick={() => {
          updateSetting('useStacks', !currentSettings.useStacks);
          onClose();
        }}
      />

      {/* Show Item Info */}
      <MenuItem
        icon={currentSettings.showItemInfo ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        label="Show Item Info"
        checked={currentSettings.showItemInfo}
        onClick={() => {
          updateSetting('showItemInfo', !currentSettings.showItemInfo);
          onClose();
        }}
      />

      {/* Icon Preview */}
      <MenuItem
        icon={<Image className="w-4 h-4" />}
        label="Show Icon Preview"
        checked={currentSettings.showIconPreview}
        onClick={() => {
          updateSetting('showIconPreview', !currentSettings.showIconPreview);
          onClose();
        }}
      />

      <Separator />

      {/* Icon Size Submenu */}
      <Submenu
        icon={<Maximize className="w-4 h-4" />}
        label="Icon Size"
        isOpen={openSubmenu === 'iconsize'}
        onOpen={() => setOpenSubmenu('iconsize')}
        onClose={() => {}}
      >
        <MenuItem
          label="Small"
          checked={currentSettings.iconSize === 'small'}
          onClick={() => {
            updateSetting('iconSize', 'small');
            onClose();
          }}
        />
        <MenuItem
          label="Medium"
          checked={currentSettings.iconSize === 'medium'}
          onClick={() => {
            updateSetting('iconSize', 'medium');
            onClose();
          }}
        />
        <MenuItem
          label="Large"
          checked={currentSettings.iconSize === 'large'}
          onClick={() => {
            updateSetting('iconSize', 'large');
            onClose();
          }}
        />
      </Submenu>

      <Separator />

      {/* Widget Options */}
      <MenuItem
        icon={<Plus className="w-4 h-4" />}
        label="Add Widget..."
        onClick={() => handleAction(openGallery)}
      />
      <MenuItem
        icon={<Move className="w-4 h-4" />}
        label={editMode ? 'Done Editing Widgets' : 'Edit Widgets'}
        onClick={() => handleAction(toggleEditMode)}
        disabled={widgets.length === 0 && !editMode}
      />

      <Separator />

      {/* Services Submenu */}
      <Submenu
        icon={<Sparkles className="w-4 h-4" />}
        label="Services"
        isOpen={openSubmenu === 'services'}
        onOpen={() => setOpenSubmenu('services')}
        onClose={() => {}}
      >
        <MenuItem label="No Services Apply" disabled />
        <Separator />
        <MenuItem label="Services Preferences..." onClick={() => handleAction(onOpenSettings)} />
      </Submenu>

      {/* Share Submenu */}
      <Submenu
        icon={<Share2 className="w-4 h-4" />}
        label="Share"
        isOpen={openSubmenu === 'share'}
        onOpen={() => setOpenSubmenu('share')}
        onClose={() => {}}
      >
        <MenuItem icon={<Mail className="w-4 h-4" />} label="Mail" disabled />
        <MenuItem icon={<MessageSquare className="w-4 h-4" />} label="Messages" disabled />
        <MenuItem icon={<Send className="w-4 h-4" />} label="AirDrop" disabled />
        <Separator />
        <MenuItem icon={<Copy className="w-4 h-4" />} label="Copy" disabled />
        <MenuItem icon={<Printer className="w-4 h-4" />} label="Print..." disabled />
      </Submenu>

      <Separator />

      {/* Import from iPhone/iPad */}
      <Submenu
        icon={<Import className="w-4 h-4" />}
        label="Import from iPhone or iPad"
        isOpen={openSubmenu === 'import'}
        onOpen={() => setOpenSubmenu('import')}
        onClose={() => {}}
      >
        <MenuItem label="Take Photo" disabled />
        <MenuItem label="Scan Documents" disabled />
        <MenuItem label="Add Sketch" disabled />
      </Submenu>

      <Separator />

      {/* Background Theme Section */}
      <SectionLabel label="Background Theme" />
      {backgroundThemes.map((theme) => (
        <MenuItem
          key={theme.id}
          icon={<Palette className="w-4 h-4" />}
          label={theme.label}
          onClick={() => handleAction(() => onChangeBackground(theme.id))}
        />
      ))}
    </div>
  );
};

export default DesktopContextMenu;
