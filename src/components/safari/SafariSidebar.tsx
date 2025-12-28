/**
 * Safari Sidebar
 * Contains Tab Groups, Reading List, History, and Bookmarks sections
 */

import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  FolderPlus,
  X,
  Book,
  Clock,
  Bookmark,
  Layers,
  MoreHorizontal,
  Check,
  Trash2,
  Edit2,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  TabGroup,
  SafariTab,
  ReadingListItem,
  HistoryEntry,
  Bookmark as BookmarkType,
  TAB_GROUP_COLORS,
  TabGroupColor,
  extractDomain,
  getFaviconUrl,
} from './safariTypes';

interface SafariSidebarProps {
  isOpen: boolean;
  section: 'tabGroups' | 'readingList' | 'history' | 'bookmarks';
  onSectionChange: (section: 'tabGroups' | 'readingList' | 'history' | 'bookmarks') => void;
  
  // Tab Groups
  tabGroups: TabGroup[];
  tabs: SafariTab[];
  activeTabId: string | null;
  onCreateGroup: (name: string, color: TabGroupColor) => void;
  onDeleteGroup: (groupId: string) => void;
  onRenameGroup: (groupId: string, name: string) => void;
  onToggleGroupCollapse: (groupId: string) => void;
  onMoveTabToGroup: (tabId: string, groupId: string | null) => void;
  onSelectTab: (tabId: string) => void;
  
  // Reading List
  readingList: ReadingListItem[];
  onToggleReadingListRead: (id: string) => void;
  onRemoveFromReadingList: (id: string) => void;
  onOpenReadingListItem: (url: string) => void;
  
  // History
  history: HistoryEntry[];
  onClearHistory: (range: 'hour' | 'day' | 'week' | 'all') => void;
  onOpenHistoryItem: (url: string) => void;
  historySearchQuery: string;
  onHistorySearch: (query: string) => void;
  
  // Bookmarks
  bookmarks: BookmarkType[];
  onAddBookmark: (url: string, title: string, parentId?: string) => void;
  onRemoveBookmark: (id: string) => void;
  onOpenBookmark: (url: string) => void;
  onCreateFolder: (name: string, parentId?: string) => void;
}

const SidebarSection: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      'flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg transition-colors',
      isActive
        ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
    )}
  >
    {icon}
    <span>{label}</span>
  </button>
);

// Tab Group Item Component
const TabGroupItem: React.FC<{
  group: TabGroup;
  tabs: SafariTab[];
  activeTabId: string | null;
  onToggleCollapse: () => void;
  onRename: (name: string) => void;
  onDelete: () => void;
  onSelectTab: (tabId: string) => void;
  onMoveTabOut: (tabId: string) => void;
}> = ({ group, tabs, activeTabId, onToggleCollapse, onRename, onDelete, onSelectTab, onMoveTabOut }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(group.name);
  const [showMenu, setShowMenu] = useState(false);
  
  const groupTabs = tabs.filter(t => t.groupId === group.id);
  const colors = TAB_GROUP_COLORS[group.color];
  
  const handleSubmitRename = () => {
    if (editName.trim()) {
      onRename(editName.trim());
    }
    setIsEditing(false);
  };
  
  return (
    <div className="mb-2">
      <div
        className={cn(
          'flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer group',
          colors.bg
        )}
      >
        <button onClick={onToggleCollapse} className="flex-shrink-0">
          {group.isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        
        <div className={cn('w-2 h-2 rounded-full flex-shrink-0', colors.border, 'bg-current')} />
        
        {isEditing ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleSubmitRename}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmitRename()}
            className="flex-1 px-1 py-0.5 text-sm bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600"
            autoFocus
          />
        ) : (
          <span
            className={cn('flex-1 text-sm font-medium truncate', colors.text)}
            onDoubleClick={() => setIsEditing(true)}
          >
            {group.name}
          </span>
        )}
        
        <span className="text-xs text-gray-500">{groupTabs.length}</span>
        
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 rounded"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
              <button
                onClick={() => { setIsEditing(true); setShowMenu(false); }}
                className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Edit2 className="w-4 h-4" />
                Rename
              </button>
              <button
                onClick={() => { onDelete(); setShowMenu(false); }}
                className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
      
      {!group.isCollapsed && groupTabs.length > 0 && (
        <div className="ml-4 mt-1 space-y-0.5">
          {groupTabs.map(tab => (
            <div
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-2 py-1 rounded text-sm cursor-pointer',
                activeTabId === tab.id
                  ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
              )}
            >
              {tab.favicon ? (
                <img src={tab.favicon} alt="" className="w-4 h-4" />
              ) : (
                <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded" />
              )}
              <span className="flex-1 truncate">{tab.title || extractDomain(tab.url)}</span>
              <button
                onClick={(e) => { e.stopPropagation(); onMoveTabOut(tab.id); }}
                className="p-0.5 opacity-0 group-hover:opacity-100 hover:bg-gray-300/50 rounded"
                title="Remove from group"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Tab Groups Section
const TabGroupsSection: React.FC<{
  tabGroups: TabGroup[];
  tabs: SafariTab[];
  activeTabId: string | null;
  onCreateGroup: (name: string, color: TabGroupColor) => void;
  onDeleteGroup: (groupId: string) => void;
  onRenameGroup: (groupId: string, name: string) => void;
  onToggleGroupCollapse: (groupId: string) => void;
  onMoveTabToGroup: (tabId: string, groupId: string | null) => void;
  onSelectTab: (tabId: string) => void;
}> = ({
  tabGroups,
  tabs,
  activeTabId,
  onCreateGroup,
  onDeleteGroup,
  onRenameGroup,
  onToggleGroupCollapse,
  onMoveTabToGroup,
  onSelectTab,
}) => {
  const [showNewGroupForm, setShowNewGroupForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupColor, setNewGroupColor] = useState<TabGroupColor>('blue');
  
  const ungroupedTabs = tabs.filter(t => !t.groupId);
  
  const handleCreateGroup = () => {
    if (newGroupName.trim()) {
      onCreateGroup(newGroupName.trim(), newGroupColor);
      setNewGroupName('');
      setShowNewGroupForm(false);
    }
  };
  
  return (
    <div className="flex-1 overflow-y-auto px-2 py-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-gray-500 uppercase">Tab Groups</h3>
        <button
          onClick={() => setShowNewGroupForm(true)}
          className="p-1 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 rounded"
          title="New Tab Group"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      
      {showNewGroupForm && (
        <div className="mb-3 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <input
            type="text"
            placeholder="Group name"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            className="w-full px-2 py-1 text-sm bg-white dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 mb-2"
            autoFocus
          />
          <div className="flex gap-1 mb-2">
            {(Object.keys(TAB_GROUP_COLORS) as TabGroupColor[]).map(color => (
              <button
                key={color}
                onClick={() => setNewGroupColor(color)}
                className={cn(
                  'w-5 h-5 rounded-full border-2',
                  TAB_GROUP_COLORS[color].border,
                  newGroupColor === color ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                )}
                style={{ backgroundColor: `var(--${color}-500, currentColor)` }}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreateGroup}
              className="flex-1 px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Create
            </button>
            <button
              onClick={() => setShowNewGroupForm(false)}
              className="px-2 py-1 text-sm bg-gray-300 dark:bg-gray-600 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      {tabGroups.map(group => (
        <TabGroupItem
          key={group.id}
          group={group}
          tabs={tabs}
          activeTabId={activeTabId}
          onToggleCollapse={() => onToggleGroupCollapse(group.id)}
          onRename={(name) => onRenameGroup(group.id, name)}
          onDelete={() => onDeleteGroup(group.id)}
          onSelectTab={onSelectTab}
          onMoveTabOut={(tabId) => onMoveTabToGroup(tabId, null)}
        />
      ))}
      
      {ungroupedTabs.length > 0 && (
        <div className="mt-4">
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Ungrouped Tabs</h4>
          <div className="space-y-0.5">
            {ungroupedTabs.map(tab => (
              <div
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-2 py-1 rounded text-sm cursor-pointer group',
                  activeTabId === tab.id
                    ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
                )}
              >
                {tab.favicon ? (
                  <img src={tab.favicon} alt="" className="w-4 h-4" />
                ) : (
                  <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded" />
                )}
                <span className="flex-1 truncate">{tab.title || extractDomain(tab.url)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Reading List Section
const ReadingListSection: React.FC<{
  items: ReadingListItem[];
  onToggleRead: (id: string) => void;
  onRemove: (id: string) => void;
  onOpen: (url: string) => void;
}> = ({ items, onToggleRead, onRemove, onOpen }) => {
  const unreadItems = items.filter(i => !i.isRead);
  const readItems = items.filter(i => i.isRead);
  
  const renderItem = (item: ReadingListItem) => (
    <div
      key={item.id}
      className="group flex items-start gap-2 px-2 py-2 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-700/50 cursor-pointer"
      onClick={() => onOpen(item.url)}
    >
      <img
        src={getFaviconUrl(item.url)}
        alt=""
        className="w-4 h-4 mt-0.5 flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-sm truncate',
          item.isRead ? 'text-gray-500' : 'text-gray-900 dark:text-gray-100'
        )}>
          {item.title}
        </p>
        <p className="text-xs text-gray-500 truncate">{extractDomain(item.url)}</p>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
        <button
          onClick={(e) => { e.stopPropagation(); onToggleRead(item.id); }}
          className="p-1 hover:bg-gray-300/50 rounded"
          title={item.isRead ? 'Mark as unread' : 'Mark as read'}
        >
          <Check className={cn('w-4 h-4', item.isRead && 'text-green-500')} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
          className="p-1 hover:bg-gray-300/50 rounded"
          title="Remove"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
  
  return (
    <div className="flex-1 overflow-y-auto px-2 py-2">
      {unreadItems.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Unread</h4>
          {unreadItems.map(renderItem)}
        </div>
      )}
      
      {readItems.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Read</h4>
          {readItems.map(renderItem)}
        </div>
      )}
      
      {items.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          <Book className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No items in Reading List</p>
          <p className="text-xs mt-1">Press Cmd+Shift+D to add pages</p>
        </div>
      )}
    </div>
  );
};

// History Section
const HistorySection: React.FC<{
  history: HistoryEntry[];
  searchQuery: string;
  onSearch: (query: string) => void;
  onClear: (range: 'hour' | 'day' | 'week' | 'all') => void;
  onOpen: (url: string) => void;
}> = ({ history, searchQuery, onSearch, onClear, onOpen }) => {
  const [showClearMenu, setShowClearMenu] = useState(false);
  
  // Group history by date
  const groupedHistory = history.reduce<Record<string, HistoryEntry[]>>((acc, entry) => {
    const date = new Date(entry.visitedAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let key: string;
    if (date.toDateString() === today.toDateString()) {
      key = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      key = 'Yesterday';
    } else {
      key = date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
    }
    
    if (!acc[key]) acc[key] = [];
    acc[key].push(entry);
    return acc;
  }, {});
  
  return (
    <div className="flex-1 overflow-y-auto px-2 py-2">
      <div className="flex items-center gap-2 mb-3">
        <input
          type="text"
          placeholder="Search history..."
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          className="flex-1 px-2 py-1 text-sm bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600"
        />
        <div className="relative">
          <button
            onClick={() => setShowClearMenu(!showClearMenu)}
            className="p-1 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 rounded"
            title="Clear history"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          
          {showClearMenu && (
            <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
              {(['hour', 'day', 'week', 'all'] as const).map(range => (
                <button
                  key={range}
                  onClick={() => { onClear(range); setShowClearMenu(false); }}
                  className="w-full px-3 py-1.5 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Clear {range === 'all' ? 'all history' : `last ${range}`}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {Object.entries(groupedHistory).map(([date, entries]) => (
        <div key={date} className="mb-4">
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">{date}</h4>
          <div className="space-y-0.5">
            {entries.map(entry => (
              <div
                key={entry.id}
                onClick={() => onOpen(entry.url)}
                className="flex items-center gap-2 px-2 py-1.5 rounded text-sm cursor-pointer hover:bg-gray-200/50 dark:hover:bg-gray-700/50 group"
              >
                <img
                  src={getFaviconUrl(entry.url)}
                  alt=""
                  className="w-4 h-4 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 dark:text-gray-100 truncate">{entry.title || entry.url}</p>
                  <p className="text-xs text-gray-500 truncate">{extractDomain(entry.url)}</p>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(entry.visitedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      {history.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No browsing history</p>
        </div>
      )}
    </div>
  );
};

// Bookmarks Section
const BookmarksSection: React.FC<{
  bookmarks: BookmarkType[];
  onRemove: (id: string) => void;
  onOpen: (url: string) => void;
  onCreateFolder: (name: string, parentId?: string) => void;
}> = ({ bookmarks, onRemove, onOpen, onCreateFolder }) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['favorites', 'bookmarks-bar']));
  const [showNewFolderForm, setShowNewFolderForm] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  
  const toggleFolder = (id: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };
  
  const renderBookmark = (bookmark: BookmarkType, depth: number = 0) => {
    const isExpanded = expandedFolders.has(bookmark.id);
    
    if (bookmark.type === 'folder') {
      return (
        <div key={bookmark.id}>
          <div
            onClick={() => toggleFolder(bookmark.id)}
            className="flex items-center gap-2 px-2 py-1.5 rounded text-sm cursor-pointer hover:bg-gray-200/50 dark:hover:bg-gray-700/50 group"
            style={{ paddingLeft: `${8 + depth * 12}px` }}
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 flex-shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
            )}
            <FolderPlus className="w-4 h-4 flex-shrink-0 text-blue-500" />
            <span className="flex-1 truncate">{bookmark.title}</span>
            <span className="text-xs text-gray-400">{bookmark.children?.length || 0}</span>
          </div>
          {isExpanded && bookmark.children && (
            <div>
              {bookmark.children.map(child => renderBookmark(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }
    
    return (
      <div
        key={bookmark.id}
        onClick={() => bookmark.url && onOpen(bookmark.url)}
        className="flex items-center gap-2 px-2 py-1.5 rounded text-sm cursor-pointer hover:bg-gray-200/50 dark:hover:bg-gray-700/50 group"
        style={{ paddingLeft: `${8 + depth * 12}px` }}
      >
        <img
          src={bookmark.url ? getFaviconUrl(bookmark.url) : ''}
          alt=""
          className="w-4 h-4 flex-shrink-0"
        />
        <span className="flex-1 truncate">{bookmark.title}</span>
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(bookmark.id); }}
          className="p-0.5 opacity-0 group-hover:opacity-100 hover:bg-gray-300/50 rounded"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  };
  
  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim());
      setNewFolderName('');
      setShowNewFolderForm(false);
    }
  };
  
  return (
    <div className="flex-1 overflow-y-auto px-2 py-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-gray-500 uppercase">Bookmarks</h3>
        <button
          onClick={() => setShowNewFolderForm(true)}
          className="p-1 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 rounded"
          title="New Folder"
        >
          <FolderPlus className="w-4 h-4" />
        </button>
      </div>
      
      {showNewFolderForm && (
        <div className="mb-3 flex gap-2">
          <input
            type="text"
            placeholder="Folder name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            className="flex-1 px-2 py-1 text-sm bg-white dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
          />
          <button
            onClick={handleCreateFolder}
            className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add
          </button>
        </div>
      )}
      
      {bookmarks.map(bookmark => renderBookmark(bookmark))}
      
      {bookmarks.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          <Bookmark className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No bookmarks yet</p>
          <p className="text-xs mt-1">Press Cmd+D to bookmark a page</p>
        </div>
      )}
    </div>
  );
};

const SafariSidebar: React.FC<SafariSidebarProps> = ({
  isOpen,
  section,
  onSectionChange,
  tabGroups,
  tabs,
  activeTabId,
  onCreateGroup,
  onDeleteGroup,
  onRenameGroup,
  onToggleGroupCollapse,
  onMoveTabToGroup,
  onSelectTab,
  readingList,
  onToggleReadingListRead,
  onRemoveFromReadingList,
  onOpenReadingListItem,
  history,
  onClearHistory,
  onOpenHistoryItem,
  historySearchQuery,
  onHistorySearch,
  bookmarks,
  onRemoveBookmark,
  onOpenBookmark,
  onCreateFolder,
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="w-64 h-full bg-gray-100/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 flex flex-col">
      {/* Section Tabs */}
      <div className="p-2 border-b border-gray-200/50 dark:border-gray-700/50">
        <SidebarSection
          icon={<Layers className="w-4 h-4" />}
          label="Tab Groups"
          isActive={section === 'tabGroups'}
          onClick={() => onSectionChange('tabGroups')}
        />
        <SidebarSection
          icon={<Book className="w-4 h-4" />}
          label="Reading List"
          isActive={section === 'readingList'}
          onClick={() => onSectionChange('readingList')}
        />
        <SidebarSection
          icon={<Clock className="w-4 h-4" />}
          label="History"
          isActive={section === 'history'}
          onClick={() => onSectionChange('history')}
        />
        <SidebarSection
          icon={<Bookmark className="w-4 h-4" />}
          label="Bookmarks"
          isActive={section === 'bookmarks'}
          onClick={() => onSectionChange('bookmarks')}
        />
      </div>
      
      {/* Content */}
      {section === 'tabGroups' && (
        <TabGroupsSection
          tabGroups={tabGroups}
          tabs={tabs}
          activeTabId={activeTabId}
          onCreateGroup={onCreateGroup}
          onDeleteGroup={onDeleteGroup}
          onRenameGroup={onRenameGroup}
          onToggleGroupCollapse={onToggleGroupCollapse}
          onMoveTabToGroup={onMoveTabToGroup}
          onSelectTab={onSelectTab}
        />
      )}
      
      {section === 'readingList' && (
        <ReadingListSection
          items={readingList}
          onToggleRead={onToggleReadingListRead}
          onRemove={onRemoveFromReadingList}
          onOpen={onOpenReadingListItem}
        />
      )}
      
      {section === 'history' && (
        <HistorySection
          history={history}
          searchQuery={historySearchQuery}
          onSearch={onHistorySearch}
          onClear={onClearHistory}
          onOpen={onOpenHistoryItem}
        />
      )}
      
      {section === 'bookmarks' && (
        <BookmarksSection
          bookmarks={bookmarks}
          onRemove={onRemoveBookmark}
          onOpen={onOpenBookmark}
          onCreateFolder={onCreateFolder}
        />
      )}
    </div>
  );
};

export default SafariSidebar;
