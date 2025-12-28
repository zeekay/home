/**
 * Safari Browser Window
 * Full-featured Safari browser with Tab Groups, Reading List, History, Bookmarks, and Start Page
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import ZWindow from './ZWindow';
import SafariNavBar from './safari/SafariNavBar';
import SafariContent from './safari/SafariContent';
import SafariTabBar from './safari/SafariTabBar';
import SafariSidebar from './safari/SafariSidebar';
import SafariBookmarksBar from './safari/SafariBookmarksBar';
import SafariStartPage from './safari/SafariStartPage';
import { calculateSizeReduction } from './safari/safariUtils';
import {
  SafariTab,
  TabGroup,
  ReadingListItem,
  HistoryEntry,
  Bookmark,
  Favorite,
  TabGroupColor,
  generateId,
  extractDomain,
  getFaviconUrl,
} from './safari/safariTypes';
import {
  loadTabs,
  saveTabs,
  loadTabGroups,
  saveTabGroups,
  loadReadingList,
  saveReadingList,
  addToReadingList,
  removeFromReadingList,
  toggleReadingListRead,
  loadHistory,
  addToHistory,
  clearHistory,
  searchHistory,
  loadBookmarks,
  saveBookmarks,
  addBookmark,
  removeBookmark,
  createBookmarkFolder,
  getBookmarksBarItems,
  loadFavorites,
  saveFavorites,
  addToFavorites,
  removeFromFavorites,
  getFrequentlyVisited,
  loadSettings,
  saveSettings,
} from './safari/safariStorage';

export interface ZSafariWindowProps {
  onClose: () => void;
  onFocus?: () => void;
  initialUrl?: string;
  depth?: number;
}

const START_PAGE_URL = 'about:start';

const ZSafariWindow: React.FC<ZSafariWindowProps> = ({
  onClose,
  initialUrl = START_PAGE_URL,
  depth = 0,
}) => {
  // Scale factor for UI elements based on depth
  const scaleFactor = Math.pow(0.9, depth);

  // Core browser state
  const [tabs, setTabs] = useState<SafariTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [tabGroups, setTabGroups] = useState<TabGroup[]>([]);
  const [iframeKey, setIframeKey] = useState(Date.now());

  // Per-tab navigation history (stored per tab)
  const [tabHistories, setTabHistories] = useState<Record<string, { urls: string[]; index: number }>>({});

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarSection, setSidebarSection] = useState<'tabGroups' | 'readingList' | 'history' | 'bookmarks'>('tabGroups');

  // Reading List, History, Bookmarks, Favorites
  const [readingList, setReadingList] = useState<ReadingListItem[]>([]);
  const [browsingHistory, setBrowsingHistory] = useState<HistoryEntry[]>([]);
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  // UI settings
  const [showBookmarksBar, setShowBookmarksBar] = useState(true);
  const [showStartPage, setShowStartPage] = useState(true);

  // Input URL for address bar
  const [inputUrl, setInputUrl] = useState(initialUrl);

  // Initialize state from localStorage
  useEffect(() => {
    const storedTabs = loadTabs();
    const settings = loadSettings();

    if (storedTabs.length === 0) {
      // Create initial tab
      const newTab: SafariTab = {
        id: generateId(),
        url: initialUrl,
        title: initialUrl === START_PAGE_URL ? 'Start Page' : 'New Tab',
        isPinned: false,
        isMuted: false,
        lastAccessed: Date.now(),
        groupId: null,
      };
      setTabs([newTab]);
      setActiveTabId(newTab.id);
      setTabHistories({ [newTab.id]: { urls: [initialUrl], index: 0 } });
    } else {
      setTabs(storedTabs);
      setActiveTabId(storedTabs[0]?.id || null);
      // Initialize histories for existing tabs
      const histories: Record<string, { urls: string[]; index: number }> = {};
      storedTabs.forEach(tab => {
        histories[tab.id] = { urls: [tab.url], index: 0 };
      });
      setTabHistories(histories);
    }

    setTabGroups(loadTabGroups());
    setReadingList(loadReadingList());
    setBrowsingHistory(loadHistory());
    setBookmarks(loadBookmarks());
    setFavorites(loadFavorites());
    setShowBookmarksBar(settings.showBookmarksBar);
    setSidebarSection(settings.sidebarSection);
  }, [initialUrl]);

  // Save tabs whenever they change
  useEffect(() => {
    if (tabs.length > 0) {
      saveTabs(tabs);
    }
  }, [tabs]);

  // Save tab groups
  useEffect(() => {
    saveTabGroups(tabGroups);
  }, [tabGroups]);

  // Get active tab
  const activeTab = useMemo(() => tabs.find(t => t.id === activeTabId), [tabs, activeTabId]);

  // Get current tab's history
  const currentHistory = activeTabId ? tabHistories[activeTabId] : null;
  const historyIndex = currentHistory?.index ?? 0;
  const historyUrls = currentHistory?.urls ?? [];

  // Update input URL when active tab changes
  useEffect(() => {
    if (activeTab) {
      setInputUrl(activeTab.url === START_PAGE_URL ? '' : activeTab.url);
    }
  }, [activeTab]);

  // Check if current URL is bookmarked
  const isCurrentUrlBookmarked = useMemo(() => {
    if (!activeTab) return false;
    const checkBookmarks = (items: Bookmark[]): boolean => {
      for (const item of items) {
        if (item.url === activeTab.url) return true;
        if (item.children && checkBookmarks(item.children)) return true;
      }
      return false;
    };
    return checkBookmarks(bookmarks);
  }, [activeTab, bookmarks]);

  // Navigation handlers
  const navigateToUrl = useCallback((url: string, tabId?: string) => {
    const targetTabId = tabId || activeTabId;
    if (!targetTabId) return;

    let normalizedUrl = url.trim();
    if (normalizedUrl && !normalizedUrl.match(/^(https?:\/\/|about:)/i)) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    // Update tab
    setTabs(prev => prev.map(tab =>
      tab.id === targetTabId
        ? {
            ...tab,
            url: normalizedUrl,
            title: normalizedUrl === START_PAGE_URL ? 'Start Page' : extractDomain(normalizedUrl),
            favicon: normalizedUrl === START_PAGE_URL ? undefined : getFaviconUrl(normalizedUrl),
            lastAccessed: Date.now(),
          }
        : tab
    ));

    // Update tab history
    setTabHistories(prev => {
      const current = prev[targetTabId] || { urls: [], index: -1 };
      const newUrls = [...current.urls.slice(0, current.index + 1), normalizedUrl];
      return {
        ...prev,
        [targetTabId]: { urls: newUrls, index: newUrls.length - 1 },
      };
    });

    // Add to browsing history (not for start page)
    if (normalizedUrl !== START_PAGE_URL) {
      const entry = addToHistory(normalizedUrl, extractDomain(normalizedUrl));
      setBrowsingHistory(prev => [entry, ...prev]);

      // Update favorites visit count
      addToFavorites(normalizedUrl, extractDomain(normalizedUrl));
      setFavorites(loadFavorites());
    }

    setInputUrl(normalizedUrl === START_PAGE_URL ? '' : normalizedUrl);
  }, [activeTabId]);

  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl.trim()) {
      navigateToUrl(inputUrl);
    }
  };

  const handleBack = () => {
    if (!activeTabId || !currentHistory || currentHistory.index <= 0) return;
    const newIndex = currentHistory.index - 1;
    const newUrl = currentHistory.urls[newIndex];

    setTabHistories(prev => ({
      ...prev,
      [activeTabId]: { ...prev[activeTabId], index: newIndex },
    }));

    setTabs(prev => prev.map(tab =>
      tab.id === activeTabId
        ? { ...tab, url: newUrl, title: extractDomain(newUrl), lastAccessed: Date.now() }
        : tab
    ));
    setInputUrl(newUrl === START_PAGE_URL ? '' : newUrl);
  };

  const handleForward = () => {
    if (!activeTabId || !currentHistory || currentHistory.index >= currentHistory.urls.length - 1) return;
    const newIndex = currentHistory.index + 1;
    const newUrl = currentHistory.urls[newIndex];

    setTabHistories(prev => ({
      ...prev,
      [activeTabId]: { ...prev[activeTabId], index: newIndex },
    }));

    setTabs(prev => prev.map(tab =>
      tab.id === activeTabId
        ? { ...tab, url: newUrl, title: extractDomain(newUrl), lastAccessed: Date.now() }
        : tab
    ));
    setInputUrl(newUrl === START_PAGE_URL ? '' : newUrl);
  };

  const handleRefresh = () => {
    setIframeKey(Date.now());
  };

  const handleHome = () => {
    navigateToUrl(START_PAGE_URL);
  };

  // Tab management
  const handleNewTab = useCallback(() => {
    const newTab: SafariTab = {
      id: generateId(),
      url: START_PAGE_URL,
      title: 'Start Page',
      isPinned: false,
      isMuted: false,
      lastAccessed: Date.now(),
      groupId: null,
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
    setTabHistories(prev => ({
      ...prev,
      [newTab.id]: { urls: [START_PAGE_URL], index: 0 },
    }));
    setInputUrl('');
  }, []);

  const handleCloseTab = useCallback((tabId: string) => {
    setTabs(prev => {
      const newTabs = prev.filter(t => t.id !== tabId);
      if (newTabs.length === 0) {
        // Create a new tab if closing last one
        const newTab: SafariTab = {
          id: generateId(),
          url: START_PAGE_URL,
          title: 'Start Page',
          isPinned: false,
          isMuted: false,
          lastAccessed: Date.now(),
          groupId: null,
        };
        setActiveTabId(newTab.id);
        setTabHistories({ [newTab.id]: { urls: [START_PAGE_URL], index: 0 } });
        return [newTab];
      }
      if (tabId === activeTabId) {
        setActiveTabId(newTabs[newTabs.length - 1].id);
      }
      return newTabs;
    });

    setTabHistories(prev => {
      const { [tabId]: _, ...rest } = prev;
      return rest;
    });
  }, [activeTabId]);

  const handleSelectTab = useCallback((tabId: string) => {
    setActiveTabId(tabId);
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
      setInputUrl(tab.url === START_PAGE_URL ? '' : tab.url);
    }
  }, [tabs]);

  const handlePinTab = useCallback((tabId: string) => {
    setTabs(prev => prev.map(tab =>
      tab.id === tabId ? { ...tab, isPinned: !tab.isPinned } : tab
    ));
  }, []);

  const handleMuteTab = useCallback((tabId: string) => {
    setTabs(prev => prev.map(tab =>
      tab.id === tabId ? { ...tab, isMuted: !tab.isMuted } : tab
    ));
  }, []);

  const handleDuplicateTab = useCallback((tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return;

    const newTab: SafariTab = {
      ...tab,
      id: generateId(),
      isPinned: false,
      lastAccessed: Date.now(),
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
    setTabHistories(prev => ({
      ...prev,
      [newTab.id]: { urls: [tab.url], index: 0 },
    }));
  }, [tabs]);

  // Tab Groups
  const handleCreateGroup = useCallback((name: string, color: TabGroupColor) => {
    const newGroup: TabGroup = {
      id: generateId(),
      name,
      color,
      isCollapsed: false,
      tabIds: [],
      createdAt: Date.now(),
    };
    setTabGroups(prev => [...prev, newGroup]);
  }, []);

  const handleDeleteGroup = useCallback((groupId: string) => {
    // Remove group assignment from tabs
    setTabs(prev => prev.map(tab =>
      tab.groupId === groupId ? { ...tab, groupId: null } : tab
    ));
    setTabGroups(prev => prev.filter(g => g.id !== groupId));
  }, []);

  const handleRenameGroup = useCallback((groupId: string, name: string) => {
    setTabGroups(prev => prev.map(g =>
      g.id === groupId ? { ...g, name } : g
    ));
  }, []);

  const handleToggleGroupCollapse = useCallback((groupId: string) => {
    setTabGroups(prev => prev.map(g =>
      g.id === groupId ? { ...g, isCollapsed: !g.isCollapsed } : g
    ));
  }, []);

  const handleMoveTabToGroup = useCallback((tabId: string, groupId: string | null) => {
    setTabs(prev => prev.map(tab =>
      tab.id === tabId ? { ...tab, groupId } : tab
    ));
  }, []);

  // Reading List
  const handleAddToReadingList = useCallback(() => {
    if (!activeTab || activeTab.url === START_PAGE_URL) return;
    const item = addToReadingList(activeTab.url, activeTab.title || extractDomain(activeTab.url));
    setReadingList(loadReadingList());
  }, [activeTab]);

  const handleToggleReadingListRead = useCallback((id: string) => {
    toggleReadingListRead(id);
    setReadingList(loadReadingList());
  }, []);

  const handleRemoveFromReadingList = useCallback((id: string) => {
    removeFromReadingList(id);
    setReadingList(loadReadingList());
  }, []);

  // History
  const handleClearHistory = useCallback((range: 'hour' | 'day' | 'week' | 'all') => {
    clearHistory(range);
    setBrowsingHistory(loadHistory());
  }, []);

  const filteredHistory = useMemo(() => {
    if (!historySearchQuery) return browsingHistory;
    return searchHistory(historySearchQuery);
  }, [browsingHistory, historySearchQuery]);

  // Bookmarks
  const handleAddBookmark = useCallback(() => {
    if (!activeTab || activeTab.url === START_PAGE_URL) return;
    addBookmark(activeTab.url, activeTab.title || extractDomain(activeTab.url));
    setBookmarks(loadBookmarks());
  }, [activeTab]);

  const handleRemoveBookmark = useCallback((id: string) => {
    removeBookmark(id);
    setBookmarks(loadBookmarks());
  }, []);

  const handleCreateFolder = useCallback((name: string, parentId?: string) => {
    createBookmarkFolder(name, parentId || null);
    setBookmarks(loadBookmarks());
  }, []);

  // Favorites
  const handleRemoveFavorite = useCallback((id: string) => {
    removeFromFavorites(id);
    setFavorites(loadFavorites());
  }, []);

  const handleAddFavorite = useCallback(() => {
    if (!activeTab || activeTab.url === START_PAGE_URL) return;
    addToFavorites(activeTab.url, activeTab.title || extractDomain(activeTab.url));
    setFavorites(loadFavorites());
  }, [activeTab]);

  // Handle URL drops - navigate to dropped URL
  const handleUrlDrop = useCallback((item: DragItem, _operation: DragOperation) => {
    if (item.itemType === 'url') {
      const url = item.data as string;
      navigateToUrl(url);
      toast.success(`Navigating to ${extractDomain(url)}`);
    } else if (item.itemType === 'text') {
      // Treat dropped text as a search query or URL
      const text = item.data as string;
      if (text.match(/^https?:\/\//i) || text.match(/^[\w.-]+\.[a-z]{2,}/i)) {
        navigateToUrl(text);
        toast.success(`Navigating to ${text.substring(0, 40)}...`);
      } else {
        // Search for the text
        navigateToUrl(`https://www.google.com/search?q=${encodeURIComponent(text)}`);
        toast.success('Searching for dropped text');
      }
    }
  }, [navigateToUrl]);

  // Drop target for the browser content area
  const contentDropTarget = useDropTarget(
    'safari-content',
    ['url', 'text'],
    handleUrlDrop
  );

  // Open recursive Safari window
  const openRecursiveSafari = () => {
    const newWindow = document.createElement('div');
    document.body.appendChild(newWindow);

    const safariWindow = (
      <ZSafariWindow
        onClose={() => document.body.removeChild(newWindow)}
        initialUrl={window.location.href}
        depth={depth + 1}
      />
    );

    const root = ReactDOM.createRoot(newWindow);
    root.render(safariWindow);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey;

      if (isMeta && e.shiftKey && e.key === 'n') {
        e.preventDefault();
        // New Tab Group
        handleCreateGroup('New Group', 'blue');
      } else if (isMeta && e.shiftKey && e.key === 'd') {
        e.preventDefault();
        // Add to Reading List
        handleAddToReadingList();
      } else if (isMeta && e.shiftKey && e.key === 'p') {
        e.preventDefault();
        // Pin Tab
        if (activeTabId) handlePinTab(activeTabId);
      } else if (isMeta && e.key === 'd') {
        e.preventDefault();
        // Add Bookmark
        handleAddBookmark();
      } else if (isMeta && e.key === 't') {
        e.preventDefault();
        // New Tab
        handleNewTab();
      } else if (isMeta && e.key === 'w') {
        e.preventDefault();
        // Close Tab
        if (activeTabId) handleCloseTab(activeTabId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTabId, handleCreateGroup, handleAddToReadingList, handlePinTab, handleAddBookmark, handleNewTab, handleCloseTab]);

  // Determine what content to show
  const showingStartPage = activeTab?.url === START_PAGE_URL;

  return (
    <ZWindow
      title={activeTab?.title || `Safari${depth > 0 ? ` (${depth})` : ''}`}
      onClose={onClose}
      initialPosition={{ x: 100 + (depth * 30), y: 100 + (depth * 20) }}
      initialSize={{
        width: calculateSizeReduction(900, depth),
        height: calculateSizeReduction(650, depth),
      }}
      windowType="safari"
      className="z-40"
    >
      <div className="w-full h-full flex">
        {/* Sidebar */}
        <SafariSidebar
          isOpen={sidebarOpen}
          section={sidebarSection}
          onSectionChange={(section) => {
            setSidebarSection(section);
            saveSettings({ sidebarSection: section });
          }}
          tabGroups={tabGroups}
          tabs={tabs}
          activeTabId={activeTabId}
          onCreateGroup={handleCreateGroup}
          onDeleteGroup={handleDeleteGroup}
          onRenameGroup={handleRenameGroup}
          onToggleGroupCollapse={handleToggleGroupCollapse}
          onMoveTabToGroup={handleMoveTabToGroup}
          onSelectTab={handleSelectTab}
          readingList={readingList}
          onToggleReadingListRead={handleToggleReadingListRead}
          onRemoveFromReadingList={handleRemoveFromReadingList}
          onOpenReadingListItem={(url) => navigateToUrl(url)}
          history={filteredHistory}
          onClearHistory={handleClearHistory}
          onOpenHistoryItem={(url) => navigateToUrl(url)}
          historySearchQuery={historySearchQuery}
          onHistorySearch={setHistorySearchQuery}
          bookmarks={bookmarks}
          onAddBookmark={(url, title, parentId) => {
            addBookmark(url, title, parentId);
            setBookmarks(loadBookmarks());
          }}
          onRemoveBookmark={handleRemoveBookmark}
          onOpenBookmark={(url) => navigateToUrl(url)}
          onCreateFolder={handleCreateFolder}
        />

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Tab Bar */}
          <SafariTabBar
            tabs={tabs}
            activeTabId={activeTabId}
            tabGroups={tabGroups}
            onSelectTab={handleSelectTab}
            onCloseTab={handleCloseTab}
            onNewTab={handleNewTab}
            onPinTab={handlePinTab}
            onMuteTab={handleMuteTab}
            onDuplicateTab={handleDuplicateTab}
            onMoveTabToGroup={handleMoveTabToGroup}
            scaleFactor={scaleFactor}
          />

          {/* Navigation Bar */}
          <SafariNavBar
            historyIndex={historyIndex}
            history={historyUrls}
            inputUrl={inputUrl}
            setInputUrl={setInputUrl}
            handleBack={handleBack}
            handleForward={handleForward}
            handleRefresh={handleRefresh}
            handleHome={handleHome}
            handleNavigate={handleNavigate}
            openRecursiveSafari={openRecursiveSafari}
            scaleFactor={scaleFactor}
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            onAddToReadingList={handleAddToReadingList}
            onAddBookmark={handleAddBookmark}
            isBookmarked={isCurrentUrlBookmarked}
            currentUrl={activeTab?.url}
          />

          {/* Bookmarks Bar */}
          {showBookmarksBar && (
            <SafariBookmarksBar
              bookmarks={bookmarks}
              onOpen={(url) => navigateToUrl(url)}
              scaleFactor={scaleFactor}
            />
          )}

          {/* Content Area - supports URL/text drops */}
          <div
            ref={contentDropTarget.ref}
            className={`flex-1 relative ${
              contentDropTarget.isOver && contentDropTarget.canDrop
                ? 'ring-2 ring-blue-500/50 ring-inset'
                : ''
            }`}
            onDragOver={contentDropTarget.onDragOver}
            onDragEnter={contentDropTarget.onDragEnter}
            onDragLeave={contentDropTarget.onDragLeave}
            onDrop={contentDropTarget.onDrop}
          >
            {/* Drop overlay indicator */}
            {contentDropTarget.isOver && contentDropTarget.canDrop && (
              <div className="absolute inset-0 bg-blue-500/10 z-50 flex items-center justify-center pointer-events-none">
                <div className="bg-black/80 text-white px-4 py-2 rounded-lg text-sm font-medium">
                  Drop URL to navigate
                </div>
              </div>
            )}
            {showingStartPage ? (
              <SafariStartPage
                favorites={favorites}
                frequentlyVisited={getFrequentlyVisited(12)}
                readingList={readingList}
                onOpenUrl={(url) => navigateToUrl(url)}
                onRemoveFavorite={handleRemoveFavorite}
                onAddFavorite={handleAddFavorite}
              />
            ) : (
              <SafariContent
                url={activeTab?.url || ''}
                depth={depth}
                iframeKey={iframeKey}
                onNavigate={(newUrl) => navigateToUrl(newUrl)}
              />
            )}
          </div>
        </div>
      </div>
    </ZWindow>
  );
};

export default ZSafariWindow;
