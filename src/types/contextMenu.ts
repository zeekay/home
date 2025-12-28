// Context Menu Types
// Unified type definitions for the zOS context menu system

import { LucideIcon } from 'lucide-react';

// Base menu item interface
export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  shortcut?: string;
  disabled?: boolean;
  hidden?: boolean;
  danger?: boolean; // Red text for destructive actions
  checked?: boolean; // For toggle items
  onClick?: () => void;
}

// Separator between menu groups
export interface ContextMenuSeparator {
  type: 'separator';
}

// Submenu with nested items
export interface ContextMenuSubmenu {
  id: string;
  label: string;
  icon?: LucideIcon;
  disabled?: boolean;
  items: ContextMenuEntry[];
}

// Radio group for mutually exclusive options
export interface ContextMenuRadioGroup {
  type: 'radio';
  id: string;
  value: string;
  items: Array<{
    id: string;
    label: string;
    value: string;
  }>;
  onChange?: (value: string) => void;
}

// Label/header for a section
export interface ContextMenuLabel {
  type: 'label';
  label: string;
}

// Union type for all menu entries
export type ContextMenuEntry =
  | ContextMenuItem
  | ContextMenuSeparator
  | ContextMenuSubmenu
  | ContextMenuRadioGroup
  | ContextMenuLabel;

// Type guards
export function isSeparator(entry: ContextMenuEntry): entry is ContextMenuSeparator {
  return 'type' in entry && entry.type === 'separator';
}

export function isSubmenu(entry: ContextMenuEntry): entry is ContextMenuSubmenu {
  return 'items' in entry && !('type' in entry);
}

export function isRadioGroup(entry: ContextMenuEntry): entry is ContextMenuRadioGroup {
  return 'type' in entry && entry.type === 'radio';
}

export function isLabel(entry: ContextMenuEntry): entry is ContextMenuLabel {
  return 'type' in entry && entry.type === 'label';
}

export function isMenuItem(entry: ContextMenuEntry): entry is ContextMenuItem {
  return !isSeparator(entry) && !isSubmenu(entry) && !isRadioGroup(entry) && !isLabel(entry);
}

// Position for context menu
export interface ContextMenuPosition {
  x: number;
  y: number;
}

// File types for file context menus
export type FileType = 'folder' | 'file' | 'image' | 'video' | 'audio' | 'document' | 'archive' | 'code' | 'application';

// File item for Finder/file context menus
export interface FileItem {
  id: string;
  name: string;
  path: string;
  type: FileType;
  size?: number;
  modified?: Date;
  tags?: string[];
  icon?: string;
}

// Window info for window context menus
export interface WindowInfo {
  id: string;
  title: string;
  appId: string;
  isMinimized?: boolean;
  isMaximized?: boolean;
  spaceId?: string;
}

// Tab info for tab context menus
export interface TabInfo {
  id: string;
  title: string;
  url?: string;
  isPinned?: boolean;
  isMuted?: boolean;
  isActive?: boolean;
}

// Link info for link context menus
export interface LinkInfo {
  href: string;
  text?: string;
  title?: string;
}

// Image info for image context menus
export interface ImageInfo {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
}

// Sort options
export type SortBy = 'name' | 'kind' | 'dateModified' | 'dateCreated' | 'dateAdded' | 'dateOpened' | 'size' | 'tags';
export type SortOrder = 'asc' | 'desc';

// View options
export type ViewMode = 'icons' | 'list' | 'columns' | 'gallery';

// Desktop settings interface for DesktopContextMenu
export interface DesktopSettings {
  sortBy: SortBy;
  sortOrder: SortOrder;
  viewMode: ViewMode;
  showItemInfo: boolean;
  useStacks: boolean;
  stackGroupBy: 'kind' | 'dateAdded' | 'dateModified' | 'dateCreated' | 'tags';
  iconSize: 'small' | 'medium' | 'large';
  gridSpacing: number;
  textSize: number;
  showIconPreview: boolean;
}

// Services submenu items (system-level services)
export interface ServiceItem {
  id: string;
  label: string;
  appId: string;
  action: string;
}

// Share destinations
export interface ShareDestination {
  id: string;
  label: string;
  icon: LucideIcon;
  action: () => void;
}
