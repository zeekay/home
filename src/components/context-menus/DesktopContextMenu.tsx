// Enhanced Desktop Context Menu
// Full macOS-style context menu for desktop interactions

import React, { useState, useCallback } from 'react';
import {
  ContextMenu,
  ContextMenuTrigger,
  MacContextMenuContent,
  MacMenuItem,
  MacSeparator,
  MacSubmenu,
  MacRadioGroup,
  MacLabel,
} from './ContextMenuBase';
import {
  FolderOpen,
  FileText,
  Image,
  Info,
  Trash2,
  SortAsc,
  SortDesc,
  LayoutGrid,
  List,
  Columns,
  GalleryHorizontal,
  Eye,
  EyeOff,
  Grid3X3,
  Layers,
  Plus,
  Move,
  Settings,
  Monitor,
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
  Maximize,
  Minimize,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { useWidgets } from '@/contexts/WidgetContext';
import type { SortBy, ViewMode, DesktopSettings, ContextMenuPosition } from '@/types/contextMenu';

interface DesktopContextMenuProps {
  children: React.ReactNode;
  onOpenSettings?: () => void;
  onChangeBackground?: (theme: string) => void;
  onShowInfo?: (title: string, description: string) => void;
  onNewFolder?: () => void;
  onNewFile?: () => void;
  onPaste?: () => void;
  onCleanUp?: () => void;
  settings?: Partial<DesktopSettings>;
  onSettingsChange?: (settings: Partial<DesktopSettings>) => void;
}

const DesktopContextMenu: React.FC<DesktopContextMenuProps> = ({
  children,
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

  const handleNewFolder = useCallback(() => {
    if (onNewFolder) {
      onNewFolder();
    } else {
      onShowInfo?.(
        'New Folder',
        'This is a web-based demo. File system operations like creating folders are simulated. Open Terminal and use "mkdir" to create virtual folders.'
      );
    }
  }, [onNewFolder, onShowInfo]);

  const handleNewFile = useCallback(() => {
    if (onNewFile) {
      onNewFile();
    } else {
      onShowInfo?.(
        'New File',
        'Open TextEdit or Terminal to create new files in the virtual file system.'
      );
    }
  }, [onNewFile, onShowInfo]);

  const handleGetInfo = useCallback(() => {
    onShowInfo?.(
      'Desktop Info',
      'This is a virtual zOS-style desktop environment built with React + TypeScript. It simulates macOS-like functionality in the browser.'
    );
  }, [onShowInfo]);

  const handleCleanUp = useCallback(() => {
    onCleanUp?.();
  }, [onCleanUp]);

  // Sort options
  const sortOptions: Array<{ value: SortBy; label: string; icon: React.ReactNode }> = [
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
  const viewOptions: Array<{ value: ViewMode; label: string; icon: React.ReactNode }> = [
    { value: 'icons', label: 'as Icons', icon: <LayoutGrid className="w-4 h-4" /> },
    { value: 'list', label: 'as List', icon: <List className="w-4 h-4" /> },
    { value: 'columns', label: 'as Columns', icon: <Columns className="w-4 h-4" /> },
    { value: 'gallery', label: 'as Gallery', icon: <GalleryHorizontal className="w-4 h-4" /> },
  ];

  // Stack group options
  const stackGroupOptions = [
    { value: 'kind', label: 'Kind' },
    { value: 'dateAdded', label: 'Date Added' },
    { value: 'dateModified', label: 'Date Modified' },
    { value: 'dateCreated', label: 'Date Created' },
    { value: 'tags', label: 'Tags' },
  ];

  // Icon size options
  const iconSizeOptions = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' },
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
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <MacContextMenuContent>
        {/* New Items */}
        <MacMenuItem
          icon={<FolderOpen className="w-4 h-4" />}
          label="New Folder"
          shortcut="Shift+Cmd+N"
          onClick={handleNewFolder}
        />
        <MacSubmenu icon={<Plus className="w-4 h-4" />} label="New">
          <MacMenuItem
            icon={<FolderOpen className="w-4 h-4" />}
            label="Folder"
            shortcut="Shift+Cmd+N"
            onClick={handleNewFolder}
          />
          <MacMenuItem
            icon={<FileText className="w-4 h-4" />}
            label="Text File"
            onClick={handleNewFile}
          />
          <MacSeparator />
          <MacMenuItem
            icon={<Image className="w-4 h-4" />}
            label="From Template..."
            disabled
          />
        </MacSubmenu>

        <MacSeparator />

        {/* Get Info */}
        <MacMenuItem
          icon={<Info className="w-4 h-4" />}
          label="Get Info"
          shortcut="Cmd+I"
          onClick={handleGetInfo}
        />

        {/* Change Desktop Background */}
        <MacMenuItem
          icon={<Image className="w-4 h-4" />}
          label="Change Desktop Background..."
          onClick={onOpenSettings}
        />

        <MacSeparator />

        {/* Edit Actions */}
        <MacMenuItem
          icon={<ClipboardPaste className="w-4 h-4" />}
          label="Paste"
          shortcut="Cmd+V"
          onClick={onPaste}
          disabled={!onPaste}
        />

        <MacSeparator />

        {/* Sort By Submenu */}
        <MacSubmenu icon={<SortAsc className="w-4 h-4" />} label="Sort By">
          <MacRadioGroup
            value={currentSettings.sortBy}
            onValueChange={(v) => updateSetting('sortBy', v as SortBy)}
            items={sortOptions}
          />
          <MacSeparator />
          <MacMenuItem
            icon={<ArrowUp className="w-4 h-4" />}
            label="Ascending"
            checked={currentSettings.sortOrder === 'asc'}
            onClick={() => updateSetting('sortOrder', 'asc')}
          />
          <MacMenuItem
            icon={<ArrowDown className="w-4 h-4" />}
            label="Descending"
            checked={currentSettings.sortOrder === 'desc'}
            onClick={() => updateSetting('sortOrder', 'desc')}
          />
        </MacSubmenu>

        {/* Clean Up */}
        <MacMenuItem
          icon={<Grid3X3 className="w-4 h-4" />}
          label="Clean Up"
          onClick={handleCleanUp}
        />

        {/* Clean Up By Submenu */}
        <MacSubmenu icon={<Sparkles className="w-4 h-4" />} label="Clean Up By">
          {sortOptions.map((opt) => (
            <MacMenuItem
              key={opt.value}
              icon={opt.icon}
              label={opt.label}
              onClick={() => {
                updateSetting('sortBy', opt.value);
                handleCleanUp();
              }}
            />
          ))}
        </MacSubmenu>

        <MacSeparator />

        {/* View Options */}
        <MacSubmenu icon={<Eye className="w-4 h-4" />} label="View">
          <MacRadioGroup
            value={currentSettings.viewMode}
            onValueChange={(v) => updateSetting('viewMode', v as ViewMode)}
            items={viewOptions}
          />
        </MacSubmenu>

        {/* Show View Options */}
        <MacMenuItem
          icon={<Settings className="w-4 h-4" />}
          label="Show View Options"
          shortcut="Cmd+J"
          onClick={onOpenSettings}
        />

        <MacSeparator />

        {/* Stacks */}
        <MacMenuItem
          icon={<Layers className="w-4 h-4" />}
          label="Use Stacks"
          checked={currentSettings.useStacks}
          onClick={() => updateSetting('useStacks', !currentSettings.useStacks)}
        />

        {currentSettings.useStacks && (
          <MacSubmenu icon={<Layers className="w-4 h-4" />} label="Group Stacks By">
            <MacRadioGroup
              value={currentSettings.stackGroupBy}
              onValueChange={(v) => updateSetting('stackGroupBy', v as typeof currentSettings.stackGroupBy)}
              items={stackGroupOptions}
            />
          </MacSubmenu>
        )}

        {/* Show Item Info */}
        <MacMenuItem
          icon={currentSettings.showItemInfo ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          label="Show Item Info"
          checked={currentSettings.showItemInfo}
          onClick={() => updateSetting('showItemInfo', !currentSettings.showItemInfo)}
        />

        {/* Icon Preview */}
        <MacMenuItem
          icon={<Image className="w-4 h-4" />}
          label="Show Icon Preview"
          checked={currentSettings.showIconPreview}
          onClick={() => updateSetting('showIconPreview', !currentSettings.showIconPreview)}
        />

        <MacSeparator />

        {/* Icon Size */}
        <MacSubmenu icon={<Maximize className="w-4 h-4" />} label="Icon Size">
          <MacRadioGroup
            value={currentSettings.iconSize}
            onValueChange={(v) => updateSetting('iconSize', v as typeof currentSettings.iconSize)}
            items={iconSizeOptions}
          />
        </MacSubmenu>

        <MacSeparator />

        {/* Widget Options */}
        <MacMenuItem
          icon={<Plus className="w-4 h-4" />}
          label="Add Widget..."
          onClick={openGallery}
        />
        <MacMenuItem
          icon={<Move className="w-4 h-4" />}
          label={editMode ? 'Done Editing Widgets' : 'Edit Widgets'}
          onClick={toggleEditMode}
          disabled={widgets.length === 0 && !editMode}
        />

        <MacSeparator />

        {/* Services Submenu */}
        <MacSubmenu icon={<Sparkles className="w-4 h-4" />} label="Services">
          <MacMenuItem label="No Services Apply" disabled />
          <MacSeparator />
          <MacMenuItem label="Services Preferences..." onClick={onOpenSettings} />
        </MacSubmenu>

        {/* Share Submenu */}
        <MacSubmenu icon={<Share2 className="w-4 h-4" />} label="Share">
          <MacMenuItem icon={<Mail className="w-4 h-4" />} label="Mail" disabled />
          <MacMenuItem icon={<MessageSquare className="w-4 h-4" />} label="Messages" disabled />
          <MacMenuItem icon={<Send className="w-4 h-4" />} label="AirDrop" disabled />
          <MacSeparator />
          <MacMenuItem icon={<Copy className="w-4 h-4" />} label="Copy" disabled />
          <MacMenuItem icon={<Printer className="w-4 h-4" />} label="Print..." disabled />
        </MacSubmenu>

        <MacSeparator />

        {/* Import from iPhone/iPad */}
        <MacSubmenu icon={<Import className="w-4 h-4" />} label="Import from iPhone or iPad">
          <MacMenuItem label="Take Photo" disabled />
          <MacMenuItem label="Scan Documents" disabled />
          <MacMenuItem label="Add Sketch" disabled />
        </MacSubmenu>

        <MacSeparator />

        {/* Background Theme Section */}
        <MacLabel label="Background Theme" />
        {backgroundThemes.map((theme) => (
          <MacMenuItem
            key={theme.id}
            icon={<Palette className="w-4 h-4" />}
            label={theme.label}
            onClick={() => onChangeBackground?.(theme.id)}
          />
        ))}
      </MacContextMenuContent>
    </ContextMenu>
  );
};

export default DesktopContextMenu;
