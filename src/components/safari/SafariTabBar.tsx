/**
 * Safari Tab Bar
 * Horizontal scrollable tab bar with pinning, preview, and tab management
 */

import React, { useRef, useState, useEffect } from 'react';
import {
  X,
  Plus,
  Volume2,
  VolumeX,
  Pin,
  Copy,
  ChevronLeft,
  ChevronRight,
  XCircle,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SafariTab, TabGroup, TAB_GROUP_COLORS, extractDomain, getFaviconUrl } from './safariTypes';

interface SafariTabBarProps {
  tabs: SafariTab[];
  activeTabId: string | null;
  tabGroups: TabGroup[];
  onSelectTab: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
  onNewTab: () => void;
  onPinTab: (tabId: string) => void;
  onMuteTab: (tabId: string) => void;
  onDuplicateTab: (tabId: string) => void;
  onMoveTabToGroup: (tabId: string, groupId: string | null) => void;
  onCloseOtherTabs?: (tabId: string) => void;
  scaleFactor?: number;
  privateMode?: boolean;
}

interface TabPreviewProps {
  tab: SafariTab;
  position: { x: number; y: number };
}

// Tab Preview Tooltip
const TabPreview: React.FC<TabPreviewProps> = ({ tab, position }) => (
  <div
    className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-2 pointer-events-none"
    style={{
      left: position.x,
      top: position.y + 30,
      maxWidth: 280,
    }}
  >
    <div className="flex items-center gap-2 mb-2">
      <img
        src={tab.favicon || getFaviconUrl(tab.url)}
        alt=""
        className="w-4 h-4 flex-shrink-0"
      />
      <span className="font-medium text-sm truncate">{tab.title || 'Untitled'}</span>
    </div>
    <p className="text-xs text-gray-500 truncate">{tab.url}</p>
    {/* Preview image placeholder */}
    <div className="mt-2 w-64 h-36 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
      <span className="text-xs text-gray-400">Preview</span>
    </div>
  </div>
);

// Tab Context Menu
interface TabContextMenuProps {
  tab: SafariTab;
  tabGroups: TabGroup[];
  position: { x: number; y: number };
  onClose: () => void;
  onCloseTab: () => void;
  onCloseOtherTabs?: () => void;
  onPinTab: () => void;
  onMuteTab: () => void;
  onDuplicateTab: () => void;
  onMoveToGroup: (groupId: string | null) => void;
  tabCount: number;
}

const TabContextMenu: React.FC<TabContextMenuProps> = ({
  tab,
  tabGroups,
  position,
  onClose,
  onCloseTab,
  onCloseOtherTabs,
  onPinTab,
  onMuteTab,
  onDuplicateTab,
  onMoveToGroup,
  tabCount,
}) => {
  useEffect(() => {
    const handleClick = () => onClose();
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [onClose]);

  return (
    <div
      className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 min-w-[180px]"
      style={{ left: position.x, top: position.y }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => { onPinTab(); onClose(); }}
        className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <Pin className={cn('w-4 h-4', tab.isPinned && 'text-blue-500')} />
        {tab.isPinned ? 'Unpin Tab' : 'Pin Tab'}
      </button>

      <button
        onClick={() => { onMuteTab(); onClose(); }}
        className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        {tab.isMuted ? (
          <>
            <Volume2 className="w-4 h-4" />
            Unmute Tab
          </>
        ) : (
          <>
            <VolumeX className="w-4 h-4" />
            Mute Tab
          </>
        )}
      </button>

      <button
        onClick={() => { onDuplicateTab(); onClose(); }}
        className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <Copy className="w-4 h-4" />
        Duplicate Tab
      </button>

      <div className="border-t border-gray-200 dark:border-gray-700 my-1" />

      {/* Move to Group submenu */}
      <div className="relative group/submenu">
        <div className="flex items-center justify-between px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
          <span>Move to Tab Group</span>
          <ChevronRight className="w-4 h-4" />
        </div>

        <div className="absolute left-full top-0 hidden group-hover/submenu:block bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 min-w-[160px]">
          {tab.groupId && (
            <button
              onClick={() => { onMoveToGroup(null); onClose(); }}
              className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Remove from Group
            </button>
          )}

          {tabGroups.map(group => (
            <button
              key={group.id}
              onClick={() => { onMoveToGroup(group.id); onClose(); }}
              className={cn(
                'flex items-center gap-2 w-full px-3 py-1.5 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700',
                tab.groupId === group.id && 'bg-blue-50 dark:bg-blue-900/20'
              )}
            >
              <div className={cn('w-3 h-3 rounded-full', TAB_GROUP_COLORS[group.color].border, 'bg-current')} />
              {group.name}
            </button>
          ))}

          {tabGroups.length === 0 && (
            <div className="px-3 py-1.5 text-sm text-gray-500">No tab groups</div>
          )}
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 my-1" />

      {/* Close Other Tabs */}
      {onCloseOtherTabs && tabCount > 1 && (
        <button
          onClick={() => { onCloseOtherTabs(); onClose(); }}
          className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <XCircle className="w-4 h-4" />
          Close Other Tabs
        </button>
      )}

      <button
        onClick={() => { onCloseTab(); onClose(); }}
        className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
      >
        <X className="w-4 h-4" />
        Close Tab
      </button>
    </div>
  );
};

// Single Tab Component
interface TabItemProps {
  tab: SafariTab;
  isActive: boolean;
  tabGroup: TabGroup | undefined;
  onClick: () => void;
  onClose: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onMouseEnter: (e: React.MouseEvent) => void;
  onMouseLeave: () => void;
  scaleFactor: number;
  privateMode?: boolean;
}

const TabItem: React.FC<TabItemProps> = ({
  tab,
  isActive,
  tabGroup,
  onClick,
  onClose,
  onContextMenu,
  onMouseEnter,
  onMouseLeave,
  scaleFactor,
  privateMode = false,
}) => {
  const height = Math.max(24, 32 * scaleFactor);
  const iconSize = Math.max(10, 14 * scaleFactor);
  const fontSize = Math.max(9, 12 * scaleFactor);
  const padding = Math.max(4, 8 * scaleFactor);

  const groupColors = tabGroup ? TAB_GROUP_COLORS[tabGroup.color] : null;

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 rounded-t-lg cursor-pointer group transition-colors relative',
        'border-l border-r border-t',
        privateMode
          ? 'border-purple-300/50 dark:border-purple-700/50'
          : 'border-gray-200/50 dark:border-gray-700/50',
        isActive
          ? privateMode
            ? 'bg-purple-100 dark:bg-purple-900/50 z-10'
            : 'bg-white dark:bg-gray-800 z-10'
          : privateMode
            ? 'bg-purple-50/50 dark:bg-purple-950/50 hover:bg-purple-100/50 dark:hover:bg-purple-900/30'
            : 'bg-gray-100/50 dark:bg-gray-800/50 hover:bg-gray-200/50 dark:hover:bg-gray-700/50',
        tab.isPinned ? 'w-10' : 'min-w-[120px] max-w-[200px]',
        groupColors && `${groupColors.bg}`
      )}
      style={{
        height: `${height}px`,
        padding: `0 ${padding}px`,
      }}
      onClick={onClick}
      onContextMenu={onContextMenu}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Group indicator */}
      {tabGroup && (
        <div
          className={cn('absolute top-0 left-0 right-0 h-0.5', groupColors?.border)}
          style={{ backgroundColor: 'currentColor' }}
        />
      )}

      {/* Loading indicator or Favicon */}
      {tab.isLoading ? (
        <Loader2
          style={{ width: iconSize, height: iconSize }}
          className="flex-shrink-0 animate-spin text-blue-500"
        />
      ) : (
        <img
          src={tab.favicon || getFaviconUrl(tab.url)}
          alt=""
          style={{ width: iconSize, height: iconSize }}
          className="flex-shrink-0"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect fill="%23ccc" width="16" height="16" rx="3"/></svg>';
          }}
        />
      )}

      {/* Title (hidden for pinned tabs) */}
      {!tab.isPinned && (
        <span
          className={cn(
            'flex-1 truncate',
            privateMode ? 'text-purple-800 dark:text-purple-200' : 'text-gray-700 dark:text-gray-300'
          )}
          style={{ fontSize: `${fontSize}px` }}
        >
          {tab.title || extractDomain(tab.url)}
        </span>
      )}

      {/* Status indicators */}
      {tab.isMuted && (
        <VolumeX
          style={{ width: iconSize * 0.8, height: iconSize * 0.8 }}
          className="text-gray-400 flex-shrink-0"
        />
      )}

      {tab.isPinned && (
        <Pin
          style={{ width: iconSize * 0.8, height: iconSize * 0.8 }}
          className="text-blue-500 flex-shrink-0"
        />
      )}

      {/* Close button (hidden for pinned tabs) */}
      {!tab.isPinned && (
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className={cn(
            'p-0.5 rounded',
            privateMode
              ? 'hover:bg-purple-300/50 dark:hover:bg-purple-700/50'
              : 'hover:bg-gray-300/50 dark:hover:bg-gray-600/50',
            'opacity-0 group-hover:opacity-100 transition-opacity'
          )}
        >
          <X style={{ width: iconSize * 0.8, height: iconSize * 0.8 }} />
        </button>
      )}
    </div>
  );
};

const SafariTabBar: React.FC<SafariTabBarProps> = ({
  tabs,
  activeTabId,
  tabGroups,
  onSelectTab,
  onCloseTab,
  onNewTab,
  onPinTab,
  onMuteTab,
  onDuplicateTab,
  onMoveTabToGroup,
  onCloseOtherTabs,
  scaleFactor = 1,
  privateMode = false,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hoveredTab, setHoveredTab] = useState<{ tab: SafariTab; position: { x: number; y: number } } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ tab: SafariTab; position: { x: number; y: number } } | null>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sort tabs: pinned first, then by group, then by lastAccessed
  const sortedTabs = [...tabs].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.lastAccessed - a.lastAccessed;
  });

  const pinnedTabs = sortedTabs.filter(t => t.isPinned);
  const unpinnedTabs = sortedTabs.filter(t => !t.isPinned);

  // Check scroll state
  const updateScrollState = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const { scrollWidth, clientWidth, scrollLeft } = container;
      setShowScrollButtons(scrollWidth > clientWidth);
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
    }
  };

  useEffect(() => {
    updateScrollState();
    window.addEventListener('resize', updateScrollState);
    return () => window.removeEventListener('resize', updateScrollState);
  }, [tabs]);

  const scrollLeft = () => {
    scrollContainerRef.current?.scrollBy({ left: -200, behavior: 'smooth' });
  };

  const scrollRight = () => {
    scrollContainerRef.current?.scrollBy({ left: 200, behavior: 'smooth' });
  };

  const handleTabHover = (tab: SafariTab, e: React.MouseEvent) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredTab({
        tab,
        position: { x: e.clientX, y: e.clientY },
      });
    }, 500);
  };

  const handleTabLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setHoveredTab(null);
  };

  const handleContextMenu = (tab: SafariTab, e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({
      tab,
      position: { x: e.clientX, y: e.clientY },
    });
  };

  const height = Math.max(28, 36 * scaleFactor);
  const iconSize = Math.max(12, 16 * scaleFactor);

  const getTabGroup = (tab: SafariTab) => tab.groupId ? tabGroups.find(g => g.id === tab.groupId) : undefined;

  return (
    <div
      className={cn(
        'border-b flex items-end relative',
        privateMode
          ? 'bg-purple-100/80 dark:bg-purple-950/80 border-purple-200/50 dark:border-purple-800/50'
          : 'bg-gray-100/80 dark:bg-gray-900/80 border-gray-200/50 dark:border-gray-700/50'
      )}
      style={{ height: `${height}px` }}
    >
      {/* Scroll left button */}
      {showScrollButtons && canScrollLeft && (
        <button
          onClick={scrollLeft}
          className={cn(
            'absolute left-0 top-0 bottom-0 w-6 z-20 flex items-center justify-start pl-1',
            privateMode
              ? 'bg-gradient-to-r from-purple-100 dark:from-purple-950 to-transparent'
              : 'bg-gradient-to-r from-gray-100 dark:from-gray-900 to-transparent'
          )}
        >
          <ChevronLeft style={{ width: iconSize, height: iconSize }} />
        </button>
      )}

      {/* Pinned tabs */}
      {pinnedTabs.length > 0 && (
        <div className="flex items-end gap-0.5 pl-2">
          {pinnedTabs.map(tab => (
            <TabItem
              key={tab.id}
              tab={tab}
              isActive={tab.id === activeTabId}
              tabGroup={getTabGroup(tab)}
              onClick={() => onSelectTab(tab.id)}
              onClose={() => onCloseTab(tab.id)}
              onContextMenu={(e) => handleContextMenu(tab, e)}
              onMouseEnter={(e) => handleTabHover(tab, e)}
              onMouseLeave={handleTabLeave}
              scaleFactor={scaleFactor}
              privateMode={privateMode}
            />
          ))}
          <div className={cn(
            'w-px h-4 mx-1',
            privateMode ? 'bg-purple-300 dark:bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
          )} />
        </div>
      )}

      {/* Scrollable unpinned tabs */}
      <div
        ref={scrollContainerRef}
        className="flex-1 flex items-end gap-0.5 overflow-x-auto scrollbar-hide px-1"
        onScroll={updateScrollState}
      >
        {unpinnedTabs.map(tab => (
          <TabItem
            key={tab.id}
            tab={tab}
            isActive={tab.id === activeTabId}
            tabGroup={getTabGroup(tab)}
            onClick={() => onSelectTab(tab.id)}
            onClose={() => onCloseTab(tab.id)}
            onContextMenu={(e) => handleContextMenu(tab, e)}
            onMouseEnter={(e) => handleTabHover(tab, e)}
            onMouseLeave={handleTabLeave}
            scaleFactor={scaleFactor}
            privateMode={privateMode}
          />
        ))}
      </div>

      {/* Scroll right button */}
      {showScrollButtons && canScrollRight && (
        <button
          onClick={scrollRight}
          className={cn(
            'absolute right-8 top-0 bottom-0 w-6 z-20 flex items-center justify-end pr-1',
            privateMode
              ? 'bg-gradient-to-l from-purple-100 dark:from-purple-950 to-transparent'
              : 'bg-gradient-to-l from-gray-100 dark:from-gray-900 to-transparent'
          )}
        >
          <ChevronRight style={{ width: iconSize, height: iconSize }} />
        </button>
      )}

      {/* New tab button */}
      <button
        onClick={onNewTab}
        className={cn(
          'flex-shrink-0 p-1.5 rounded mx-1',
          privateMode
            ? 'hover:bg-purple-200/50 dark:hover:bg-purple-800/50'
            : 'hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
        )}
        title="New Tab (Cmd+T)"
      >
        <Plus style={{ width: iconSize, height: iconSize }} />
      </button>

      {/* Tab preview tooltip */}
      {hoveredTab && <TabPreview tab={hoveredTab.tab} position={hoveredTab.position} />}

      {/* Context menu */}
      {contextMenu && (
        <TabContextMenu
          tab={contextMenu.tab}
          tabGroups={tabGroups}
          position={contextMenu.position}
          onClose={() => setContextMenu(null)}
          onCloseTab={() => onCloseTab(contextMenu.tab.id)}
          onCloseOtherTabs={onCloseOtherTabs ? () => onCloseOtherTabs(contextMenu.tab.id) : undefined}
          onPinTab={() => onPinTab(contextMenu.tab.id)}
          onMuteTab={() => onMuteTab(contextMenu.tab.id)}
          onDuplicateTab={() => onDuplicateTab(contextMenu.tab.id)}
          onMoveToGroup={(groupId) => onMoveTabToGroup(contextMenu.tab.id, groupId)}
          tabCount={tabs.length}
        />
      )}
    </div>
  );
};

export default SafariTabBar;
