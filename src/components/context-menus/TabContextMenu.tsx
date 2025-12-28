// Tab Context Menu
// Context menu for browser/app tab bars

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
  X,
  XCircle,
  RefreshCw,
  Pin,
  PinOff,
  Copy,
  ExternalLink,
  Plus,
  ArrowLeft,
  ArrowRight,
  Volume2,
  VolumeX,
  Bookmark,
  Move,
  Layers,
  Eye,
} from 'lucide-react';
import type { TabInfo } from '@/types/contextMenu';

interface TabContextMenuProps {
  children: React.ReactNode;
  tab: TabInfo;
  tabCount?: number;
  tabIndex?: number;
  onCloseTab?: () => void;
  onCloseOtherTabs?: () => void;
  onCloseTabsToRight?: () => void;
  onCloseTabsToLeft?: () => void;
  onCloseAllTabs?: () => void;
  onNewTab?: () => void;
  onDuplicateTab?: () => void;
  onPinTab?: () => void;
  onUnpinTab?: () => void;
  onMuteTab?: () => void;
  onUnmuteTab?: () => void;
  onReloadTab?: () => void;
  onMoveTabToStart?: () => void;
  onMoveTabToEnd?: () => void;
  onMoveTabToNewWindow?: () => void;
  onCopyTabUrl?: () => void;
  onAddToBookmarks?: () => void;
  onShowTabInFinder?: () => void;
}

const TabContextMenu: React.FC<TabContextMenuProps> = ({
  children,
  tab,
  tabCount = 1,
  tabIndex = 0,
  onCloseTab,
  onCloseOtherTabs,
  onCloseTabsToRight,
  onCloseTabsToLeft,
  onNewTab,
  onDuplicateTab,
  onPinTab,
  onUnpinTab,
  onMuteTab,
  onUnmuteTab,
  onReloadTab,
  onMoveTabToStart,
  onMoveTabToEnd,
  onMoveTabToNewWindow,
  onCopyTabUrl,
  onAddToBookmarks,
  onShowTabInFinder,
}) => {
  const hasOtherTabs = tabCount > 1;
  const hasTabsToRight = tabIndex < tabCount - 1;
  const hasTabsToLeft = tabIndex > 0;
  const canMoveToStart = tabIndex > 0;
  const canMoveToEnd = tabIndex < tabCount - 1;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <MacContextMenuContent>
        {/* New Tab */}
        <MacMenuItem
          icon={<Plus className="w-4 h-4" />}
          label="New Tab"
          shortcut="Cmd+T"
          onClick={onNewTab}
        />
        <MacMenuItem
          icon={<Copy className="w-4 h-4" />}
          label="Duplicate Tab"
          onClick={onDuplicateTab}
        />

        <MacSeparator />

        {/* Pin/Unpin Tab */}
        {tab.isPinned ? (
          <MacMenuItem
            icon={<PinOff className="w-4 h-4" />}
            label="Unpin Tab"
            onClick={onUnpinTab}
          />
        ) : (
          <MacMenuItem
            icon={<Pin className="w-4 h-4" />}
            label="Pin Tab"
            onClick={onPinTab}
          />
        )}

        {/* Mute/Unmute Tab (for audio tabs) */}
        {tab.isMuted ? (
          <MacMenuItem
            icon={<Volume2 className="w-4 h-4" />}
            label="Unmute Tab"
            onClick={onUnmuteTab}
          />
        ) : (
          <MacMenuItem
            icon={<VolumeX className="w-4 h-4" />}
            label="Mute Tab"
            onClick={onMuteTab}
          />
        )}

        <MacSeparator />

        {/* Reload */}
        <MacMenuItem
          icon={<RefreshCw className="w-4 h-4" />}
          label="Reload Tab"
          shortcut="Cmd+R"
          onClick={onReloadTab}
        />

        <MacSeparator />

        {/* Move Tab */}
        <MacSubmenu icon={<Move className="w-4 h-4" />} label="Move Tab">
          <MacMenuItem
            icon={<ArrowLeft className="w-4 h-4" />}
            label="Move to Start"
            onClick={onMoveTabToStart}
            disabled={!canMoveToStart}
          />
          <MacMenuItem
            icon={<ArrowRight className="w-4 h-4" />}
            label="Move to End"
            onClick={onMoveTabToEnd}
            disabled={!canMoveToEnd}
          />
          <MacSeparator />
          <MacMenuItem
            icon={<ExternalLink className="w-4 h-4" />}
            label="Move to New Window"
            onClick={onMoveTabToNewWindow}
          />
        </MacSubmenu>

        <MacSeparator />

        {/* Copy URL */}
        {tab.url && (
          <>
            <MacMenuItem
              icon={<Copy className="w-4 h-4" />}
              label="Copy Link"
              onClick={onCopyTabUrl}
            />
            <MacMenuItem
              icon={<Bookmark className="w-4 h-4" />}
              label="Add to Bookmarks..."
              shortcut="Cmd+D"
              onClick={onAddToBookmarks}
            />
            <MacSeparator />
          </>
        )}

        {/* Close Options */}
        <MacMenuItem
          icon={<X className="w-4 h-4" />}
          label="Close Tab"
          shortcut="Cmd+W"
          onClick={onCloseTab}
        />
        <MacMenuItem
          icon={<XCircle className="w-4 h-4" />}
          label="Close Other Tabs"
          onClick={onCloseOtherTabs}
          disabled={!hasOtherTabs}
        />
        <MacMenuItem
          icon={<ArrowRight className="w-4 h-4" />}
          label="Close Tabs to the Right"
          onClick={onCloseTabsToRight}
          disabled={!hasTabsToRight}
        />
        <MacMenuItem
          icon={<ArrowLeft className="w-4 h-4" />}
          label="Close Tabs to the Left"
          onClick={onCloseTabsToLeft}
          disabled={!hasTabsToLeft}
        />
      </MacContextMenuContent>
    </ContextMenu>
  );
};

export default TabContextMenu;
