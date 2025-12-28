// Window Context Menu
// Context menu for window title bars and window areas

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
  Minimize,
  Maximize,
  X,
  Move,
  Layers,
  Monitor,
  Columns,
  LayoutGrid,
  ArrowLeft,
  ArrowRight,
  ChevronUp,
  ChevronDown,
  Fullscreen,
  Eye,
  EyeOff,
  Copy,
  Plus,
  Settings,
} from 'lucide-react';
import type { WindowInfo } from '@/types/contextMenu';

interface Space {
  id: string;
  name: string;
}

interface WindowContextMenuProps {
  children: React.ReactNode;
  window: WindowInfo;
  spaces?: Space[];
  currentSpaceId?: string;
  isMinimized?: boolean;
  isMaximized?: boolean;
  isFullscreen?: boolean;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
  onToggleFullscreen?: () => void;
  onMoveToSpace?: (spaceId: string) => void;
  onMoveToAllSpaces?: () => void;
  onMoveToNewSpace?: () => void;
  onTileLeft?: () => void;
  onTileRight?: () => void;
  onMoveToDisplay?: (displayId: string) => void;
  onDuplicate?: () => void;
  onShowAllWindows?: () => void;
  onHideWindow?: () => void;
  onHideOthers?: () => void;
  onShowInfo?: () => void;
}

const WindowContextMenu: React.FC<WindowContextMenuProps> = ({
  children,
  window,
  spaces = [],
  currentSpaceId,
  isMinimized = false,
  isMaximized = false,
  isFullscreen = false,
  onMinimize,
  onMaximize,
  onClose,
  onToggleFullscreen,
  onMoveToSpace,
  onMoveToAllSpaces,
  onMoveToNewSpace,
  onTileLeft,
  onTileRight,
  onMoveToDisplay,
  onDuplicate,
  onShowAllWindows,
  onHideWindow,
  onHideOthers,
  onShowInfo,
}) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <MacContextMenuContent>
        {/* Window Controls */}
        <MacMenuItem
          icon={<Minimize className="w-4 h-4" />}
          label={isMinimized ? 'Restore' : 'Minimize'}
          shortcut="Cmd+M"
          onClick={onMinimize}
        />
        <MacMenuItem
          icon={<Maximize className="w-4 h-4" />}
          label={isMaximized ? 'Restore Size' : 'Zoom'}
          onClick={onMaximize}
        />
        <MacMenuItem
          icon={<Fullscreen className="w-4 h-4" />}
          label={isFullscreen ? 'Exit Full Screen' : 'Enter Full Screen'}
          shortcut="Ctrl+Cmd+F"
          onClick={onToggleFullscreen}
        />

        <MacSeparator />

        {/* Tile Window */}
        <MacSubmenu icon={<Columns className="w-4 h-4" />} label="Tile Window">
          <MacMenuItem
            icon={<ArrowLeft className="w-4 h-4" />}
            label="Tile Window to Left of Screen"
            onClick={onTileLeft}
          />
          <MacMenuItem
            icon={<ArrowRight className="w-4 h-4" />}
            label="Tile Window to Right of Screen"
            onClick={onTileRight}
          />
          <MacSeparator />
          <MacMenuItem
            icon={<LayoutGrid className="w-4 h-4" />}
            label="Replace Tiled Window"
            disabled
          />
        </MacSubmenu>

        <MacSeparator />

        {/* Move to Space */}
        {spaces.length > 0 && (
          <>
            <MacSubmenu icon={<Layers className="w-4 h-4" />} label="Move to">
              {spaces.map((space) => (
                <MacMenuItem
                  key={space.id}
                  label={space.name}
                  checked={space.id === currentSpaceId}
                  onClick={() => onMoveToSpace?.(space.id)}
                />
              ))}
              <MacSeparator />
              <MacMenuItem
                icon={<Plus className="w-4 h-4" />}
                label="New Desktop"
                onClick={onMoveToNewSpace}
              />
            </MacSubmenu>

            <MacMenuItem
              icon={<Monitor className="w-4 h-4" />}
              label="All Desktops"
              onClick={onMoveToAllSpaces}
            />

            <MacSeparator />
          </>
        )}

        {/* Move to Display (for multi-monitor setups) */}
        <MacSubmenu icon={<Monitor className="w-4 h-4" />} label="Move to Display">
          <MacMenuItem label="Display 1" onClick={() => onMoveToDisplay?.('1')} />
          <MacMenuItem label="Display 2" disabled />
        </MacSubmenu>

        <MacSeparator />

        {/* Show/Hide */}
        <MacMenuItem
          icon={<Eye className="w-4 h-4" />}
          label="Show All Windows"
          onClick={onShowAllWindows}
        />
        <MacMenuItem
          icon={<EyeOff className="w-4 h-4" />}
          label={`Hide ${window.title}`}
          shortcut="Cmd+H"
          onClick={onHideWindow}
        />
        <MacMenuItem
          icon={<EyeOff className="w-4 h-4" />}
          label="Hide Others"
          shortcut="Opt+Cmd+H"
          onClick={onHideOthers}
        />

        <MacSeparator />

        {/* Duplicate Window */}
        <MacMenuItem
          icon={<Copy className="w-4 h-4" />}
          label="Duplicate Window"
          onClick={onDuplicate}
        />

        <MacSeparator />

        {/* Window Info */}
        <MacMenuItem
          icon={<Settings className="w-4 h-4" />}
          label="Window Options..."
          onClick={onShowInfo}
        />

        <MacSeparator />

        {/* Close */}
        <MacMenuItem
          icon={<X className="w-4 h-4" />}
          label="Close Window"
          shortcut="Cmd+W"
          danger
          onClick={onClose}
        />
      </MacContextMenuContent>
    </ContextMenu>
  );
};

export default WindowContextMenu;
