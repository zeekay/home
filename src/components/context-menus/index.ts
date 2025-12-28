// Context Menus Index
// Export all context menu components and utilities

// Base components
export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  MacContextMenuContent,
  MacMenuItem,
  MacSeparator,
  MacLabel,
  MacSubmenu,
  MacRadioGroup,
} from './ContextMenuBase';

// Specialized context menus
export { default as DesktopContextMenu } from './DesktopContextMenu';
export { default as FileContextMenu } from './FileContextMenu';
export { default as TextContextMenu } from './TextContextMenu';
export { default as ImageContextMenu } from './ImageContextMenu';
export { default as LinkContextMenu } from './LinkContextMenu';
export { default as WindowContextMenu } from './WindowContextMenu';
export { default as TabContextMenu } from './TabContextMenu';
export { default as SidebarContextMenu } from './SidebarContextMenu';
export { default as DockContextMenu } from './DockContextMenu';
export { default as MenuBarContextMenu } from './MenuBarContextMenu';

// Re-export types
export type {
  ContextMenuEntry,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSubmenu,
  ContextMenuRadioGroup,
  ContextMenuLabel,
  ContextMenuPosition,
  FileItem,
  FileType,
  WindowInfo,
  TabInfo,
  LinkInfo,
  ImageInfo,
  SortBy,
  SortOrder,
  ViewMode,
  DesktopSettings,
  ServiceItem,
  ShareDestination,
} from '@/types/contextMenu';
