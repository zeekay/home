// Sidebar Context Menu
// Context menu for Finder sidebar items and folder favorites

import React from 'react';
import {
  ContextMenu,
  ContextMenuTrigger,
  MacContextMenuContent,
  MacMenuItem,
  MacSeparator,
  MacSubmenu,
} from './ContextMenuBase';
import {
  FolderOpen,
  ExternalLink,
  Plus,
  Trash2,
  Edit3,
  Info,
  Eye,
  EyeOff,
  Tag,
  Folder,
  HardDrive,
  Cloud,
  Share2,
  Settings,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Copy,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

// Types of sidebar items
type SidebarItemType = 'favorite' | 'icloud' | 'location' | 'tag' | 'device' | 'network';

interface SidebarItem {
  id: string;
  name: string;
  type: SidebarItemType;
  path?: string;
  tagColor?: string;
  isEjectable?: boolean;
}

// Available tags
const AVAILABLE_TAGS = [
  { id: 'red', label: 'Red', color: '#FF3B30' },
  { id: 'orange', label: 'Orange', color: '#FF9500' },
  { id: 'yellow', label: 'Yellow', color: '#FFCC00' },
  { id: 'green', label: 'Green', color: '#34C759' },
  { id: 'blue', label: 'Blue', color: '#007AFF' },
  { id: 'purple', label: 'Purple', color: '#AF52DE' },
  { id: 'gray', label: 'Gray', color: '#8E8E93' },
];

interface SidebarContextMenuProps {
  children: React.ReactNode;
  item: SidebarItem;
  onOpen?: () => void;
  onOpenInNewTab?: () => void;
  onOpenInNewWindow?: () => void;
  onRemoveFromSidebar?: () => void;
  onRename?: () => void;
  onGetInfo?: () => void;
  onShowInEnclosingFolder?: () => void;
  onAddToFavorites?: () => void;
  onEject?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onShowSidebarPreferences?: () => void;
  // For tags
  onEditTag?: () => void;
  onDeleteTag?: () => void;
}

const SidebarContextMenu: React.FC<SidebarContextMenuProps> = ({
  children,
  item,
  onOpen,
  onOpenInNewTab,
  onOpenInNewWindow,
  onRemoveFromSidebar,
  onRename,
  onGetInfo,
  onShowInEnclosingFolder,
  onAddToFavorites,
  onEject,
  onMoveUp,
  onMoveDown,
  onShowSidebarPreferences,
  onEditTag,
  onDeleteTag,
}) => {
  const isFavorite = item.type === 'favorite';
  const isTag = item.type === 'tag';
  const isDevice = item.type === 'device';
  const isLocation = item.type === 'location';
  const canRemove = isFavorite; // Only favorites can be removed
  const canRename = isFavorite || isTag;
  const canEject = isDevice && item.isEjectable;

  // Get icon based on item type
  const getItemIcon = () => {
    switch (item.type) {
      case 'favorite':
        return <Folder className="w-4 h-4" />;
      case 'icloud':
        return <Cloud className="w-4 h-4" />;
      case 'location':
        return <Folder className="w-4 h-4" />;
      case 'tag':
        return (
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: item.tagColor || '#8E8E93' }}
          />
        );
      case 'device':
        return <HardDrive className="w-4 h-4" />;
      case 'network':
        return <Share2 className="w-4 h-4" />;
      default:
        return <Folder className="w-4 h-4" />;
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <MacContextMenuContent>
        {/* Open Options */}
        <MacMenuItem
          icon={<FolderOpen className="w-4 h-4" />}
          label={isTag ? 'Show Items with Tag' : 'Open'}
          onClick={onOpen}
        />
        <MacMenuItem
          icon={<Plus className="w-4 h-4" />}
          label="Open in New Tab"
          onClick={onOpenInNewTab}
        />
        <MacMenuItem
          icon={<ExternalLink className="w-4 h-4" />}
          label="Open in New Window"
          onClick={onOpenInNewWindow}
        />

        <MacSeparator />

        {/* Show in Enclosing Folder (for folders) */}
        {!isTag && (
          <MacMenuItem
            icon={<Folder className="w-4 h-4" />}
            label="Show in Enclosing Folder"
            onClick={onShowInEnclosingFolder}
          />
        )}

        {/* Get Info */}
        <MacMenuItem
          icon={<Info className="w-4 h-4" />}
          label="Get Info"
          shortcut="Cmd+I"
          onClick={onGetInfo}
        />

        <MacSeparator />

        {/* Rename */}
        {canRename && (
          <MacMenuItem
            icon={<Edit3 className="w-4 h-4" />}
            label={isTag ? 'Rename Tag...' : 'Rename...'}
            onClick={onRename}
          />
        )}

        {/* Edit Tag (for tags) */}
        {isTag && (
          <>
            <MacMenuItem
              icon={<Edit3 className="w-4 h-4" />}
              label="Edit Tag..."
              onClick={onEditTag}
            />
            <MacMenuItem
              icon={<Trash2 className="w-4 h-4" />}
              label="Delete Tag..."
              danger
              onClick={onDeleteTag}
            />
          </>
        )}

        {/* Move Up/Down (for favorites) */}
        {isFavorite && (
          <>
            <MacSeparator />
            <MacMenuItem
              icon={<ArrowUp className="w-4 h-4" />}
              label="Move Up"
              onClick={onMoveUp}
            />
            <MacMenuItem
              icon={<ArrowDown className="w-4 h-4" />}
              label="Move Down"
              onClick={onMoveDown}
            />
          </>
        )}

        {/* Remove from Sidebar (for favorites) */}
        {canRemove && (
          <>
            <MacSeparator />
            <MacMenuItem
              icon={<Trash2 className="w-4 h-4" />}
              label="Remove from Sidebar"
              onClick={onRemoveFromSidebar}
            />
          </>
        )}

        {/* Eject (for devices) */}
        {canEject && (
          <>
            <MacSeparator />
            <MacMenuItem
              icon={<Trash2 className="w-4 h-4" />}
              label={`Eject "${item.name}"`}
              onClick={onEject}
            />
          </>
        )}

        <MacSeparator />

        {/* Tags (for non-tag items) */}
        {!isTag && (
          <MacSubmenu icon={<Tag className="w-4 h-4" />} label="Tags">
            {AVAILABLE_TAGS.map((tag) => (
              <MacMenuItem
                key={tag.id}
                icon={
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                }
                label={tag.label}
              />
            ))}
            <MacSeparator />
            <MacMenuItem label="Show All Tags..." disabled />
          </MacSubmenu>
        )}

        {/* Services */}
        <MacSubmenu icon={<Sparkles className="w-4 h-4" />} label="Services">
          <MacMenuItem label="Open in Terminal" disabled />
          <MacMenuItem label="New Terminal at Folder" disabled />
          <MacSeparator />
          <MacMenuItem label="Services Preferences..." onClick={onShowSidebarPreferences} />
        </MacSubmenu>

        <MacSeparator />

        {/* Sidebar Preferences */}
        <MacMenuItem
          icon={<Settings className="w-4 h-4" />}
          label="Sidebar Preferences..."
          onClick={onShowSidebarPreferences}
        />
      </MacContextMenuContent>
    </ContextMenu>
  );
};

export default SidebarContextMenu;
