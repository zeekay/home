/**
 * Safari Browser Window
 * Full-featured Safari browser with Tab Groups, Reading List, History, Bookmarks,
 * Private Browsing Mode, Closed Tabs Restoration, and Start Page
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { Shield } from 'lucide-react';
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
  ClosedTab,
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
  loadClosedTabs,
  addClosedTab,
  popClosedTab,
  clearClosedTabs,
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
  loadPrivacySettings,
  savePrivacySettings,
  clearBrowsingData,
} from './safari/safariStorage';
import { useDropTarget, DragItem, DragOperation } from '@/lib/dragAndDrop';
import { toast } from 'sonner';

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
  const [closedTabs, setClosedTabs] = useState<ClosedTab[]>([]);
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

  // Privacy mode
  const [privateMode, setPrivateMode] = useState(false);

  // Input URL for address bar
  const [inputUrl, setInputUrl] = useState(initialUrl);

  // Initialize state from localStorage
  useEffect(() => {
    const storedTabs = loadTabs();
    const settings = loadSettings();
    const privacySettings = loadPrivacySettings();

    if (storedTabs.length === 0) {
      // Create initial tab
      const newTab: SafariTab = {
        id: generateId(),
        url: initialUrl,
        title: initialUrl === START_PAGE_URL ? 'Start Page' : 'New Tab',
        isPinned: false,
        isMuted: false,
        isLoading: false,
        lastAccessed: Date.now(),
        groupId: null,
        history: [initialUrl],
        historyIndex: 0,
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
        histories[tab.id] = { urls: tab.history || [tab.url], index: tab.historyIndex || 0 };
      });
      setTabHistories(histories);
    }

    setTabGroups(loadTabGroups());
    setClosedTabs(loadClosedTabs());
    setReadingList(loadReadingList());
    setBrowsingHistory(loadHistory());
    setBookmarks(loadBookmarks());
    setFavorites(loadFavorites());
    setShowBookmarksBar(settings.showBookmarksBar);
    setSidebarSection(settings.sidebarSection);
    setPrivateMode(privacySettings.privateMode);
  }, [initialUrl]);

  // Save tabs whenever they change (not in private mode)
  useEffect(() => {
    if (tabs.length > 0 && !privateMode) {
      saveTabs(tabs);
    }
  }, [tabs, privateMode]);

  // Save tab groups
  useEffect(() => {
    if (!privateMode) {
      saveTabGroups(tabGroups);
    }
  }, [tabGroups, privateMode]);

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

  // Toggle private mode
  const handleTogglePrivateMode = useCallback(() => {
    const newMode = !privateMode;
    setPrivateMode(newMode);
    savePrivacySettings({ privateMode: newMode });

    if (newMode) {
      toast.info('Private Browsing enabled - history will not be saved');
    } else {
      toast.info('Private Browsing disabled');
    }
  }, [privateMode]);

  // Navigation handlers
  const navigateToUrl = useCallback((url: string, tabId?: string) => {
    const targetTabId = tabId || activeTabId;
    if (!targetTabId) return;

    let normalizedUrl = url.trim();
    if (normalizedUrl && !normalizedUrl.match(/^(https?:\/\/|about:)/i)) {
      // Check if it looks like a URL or a search query
      if (normalizedUrl.includes('.') && !normalizedUrl.includes(' ')) {
        normalizedUrl = 'https://' + normalizedUrl;
      } else {
        // Treat as search query
        normalizedUrl = `https://duckduckgo.com/?q=${encodeURIComponent(normalizedUrl)}`;
      }
    }

    // Update tab
    setTabs(prev => prev.map(tab =>
      tab.id === targetTabId
        ? {
            ...tab,
            url: normalizedUrl,
            title: normalizedUrl === START_PAGE_URL ? 'Start Page' : extractDomain(normalizedUrl),
            favicon: normalizedUrl === START_PAGE_URL ? undefined : getFaviconUrl(normalizedUrl),
            isLoading: normalizedUrl !== START_PAGE_URL,
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

    // Add to browsing history (not for start page, not in private mode)
    if (normalizedUrl !== START_PAGE_URL && !privateMode) {
      const entry = addToHistory(normalizedUrl, extractDomain(normalizedUrl));
      setBrowsingHistory(prev => [entry, ...prev]);

      // Update favorites visit count
      addToFavorites(normalizedUrl, extractDomain(normalizedUrl));
      setFavorites(loadFavorites());
    }

    setInputUrl(normalizedUrl === START_PAGE_URL ? '' : normalizedUrl);
  }, [activeTabId, privateMode]);

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
    // Set loading state
    if (activeTabId) {
      setTabs(prev => prev.map(tab =>
        tab.id === activeTabId ? { ...tab, isLoading: true } : tab
      ));
    }
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
      isLoading: false,
      lastAccessed: Date.now(),
      groupId: null,
      history: [START_PAGE_URL],
      historyIndex: 0,
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
    const tabToClose = tabs.find(t => t.id === tabId);
    const tabIndex = tabs.findIndex(t => t.id === tabId);

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
          isLoading: false,
          lastAccessed: Date.now(),
          groupId: null,
          history: [START_PAGE_URL],
          historyIndex: 0,
        };
        setActiveTabId(newTab.id);
        setTabHistories({ [newTab.id]: { urls: [START_PAGE_URL], index: 0 } });
        return [newTab];
      }
      if (tabId === activeTabId) {
        setActiveTabId(newTabs[Math.min(tabIndex, newTabs.length - 1)].id);
      }
      return newTabs;
    });

    // Save to closed tabs for restoration (not in private mode)
    if (tabToClose && !privateMode && tabToClose.url !== START_PAGE_URL) {
      addClosedTab(tabToClose, tabIndex);
      setClosedTabs(loadClosedTabs());
    }

    setTabHistories(prev => {
      const { [tabId]: _, ...rest } = prev;
      return rest;
    });
  }, [activeTabId, tabs, privateMode]);

  // Reopen closed tab (Cmd+Shift+T)
  const handleReopenClosedTab = useCallback(() => {
    const closedTab = popClosedTab();
    if (!closedTab) {
      toast.info('No recently closed tabs');
      return;
    }

    const restoredTab: SafariTab = {
      ...closedTab.tab,
      id: generateId(), // New ID to avoid conflicts
      lastAccessed: Date.now(),
    };

    setTabs(prev => {
      const newTabs = [...prev];
      // Insert at original position if possible
      const insertIndex = Math.min(closedTab.index, newTabs.length);
      newTabs.splice(insertIndex, 0, restoredTab);
      return newTabs;
    });

    setActiveTabId(restoredTab.id);
    setTabHistories(prev => ({
      ...prev,
      [restoredTab.id]: { urls: restoredTab.history || [restoredTab.url], index: restoredTab.historyIndex || 0 },
    }));
    setClosedTabs(loadClosedTabs());
    setInputUrl(restoredTab.url === START_PAGE_URL ? '' : restoredTab.url);

    toast.success(`Reopened: ${restoredTab.title}`);
  }, []);

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

  const handleCloseOtherTabs = useCallback((tabId: string) => {
    const tabToKeep = tabs.find(t => t.id === tabId);
    if (!tabToKeep) return;

    // Save other tabs to closed tabs
    if (!privateMode) {
      tabs.forEach((tab, index) => {
        if (tab.id !== tabId && tab.url !== START_PAGE_URL) {
          addClosedTab(tab, index);
        }
      });
      setClosedTabs(loadClosedTabs());
    }

    setTabs([tabToKeep]);
    setActiveTabId(tabId);
  }, [tabs, privateMode]);

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
    toast.success('Added to Reading List');
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
  const handleClearHistory = useCallback((range: 'hour' | 'day' | 'week' | 'month' | 'all') => {
    clearHistory(range);
    setBrowsingHistory(loadHistory());
    toast.success(`History cleared (${range})`);
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
    toast.success('Bookmark added');
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

  // Clear browsing data
  const handleClearBrowsingData = useCallback((options: {
    history?: boolean;
    cookies?: boolean;
    cache?: boolean;
    closedTabs?: boolean;
  }) => {
    clearBrowsingData(options);
    if (options.history) {
      setBrowsingHistory([]);
    }
    if (options.closedTabs) {
      setClosedTabs([]);
    }
    toast.success('Browsing data cleared');
  }, []);

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
        navigateToUrl(`https://duckduckgo.com/?q=${encodeURIComponent(text)}`);
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

      // Cmd+Shift+T - Reopen closed tab
      if (isMeta && e.shiftKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        handleReopenClosedTab();
      }
      // Cmd+Shift+N - Toggle Private Mode
      else if (isMeta && e.shiftKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleTogglePrivateMode();
      }
      // Cmd+Shift+D - Add to Reading List
      else if (isMeta && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        handleAddToReadingList();
      }
      // Cmd+Shift+P - Pin Tab
      else if (isMeta && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        if (activeTabId) handlePinTab(activeTabId);
      }
      // Cmd+D - Add Bookmark
      else if (isMeta && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        handleAddBookmark();
      }
      // Cmd+T - New Tab
      else if (isMeta && e.key.toLowerCase() === 't') {
        e.preventDefault();
        handleNewTab();
      }
      // Cmd+W - Close Tab
      else if (isMeta && e.key.toLowerCase() === 'w') {
        e.preventDefault();
        if (activeTabId) handleCloseTab(activeTabId);
      }
      // Cmd+L - Focus URL bar
      else if (isMeta && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        const urlInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (urlInput) {
          urlInput.focus();
          urlInput.select();
        }
      }
      // Cmd+R - Refresh
      else if (isMeta && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        handleRefresh();
      }
      // Cmd+[ - Back
      else if (isMeta && e.key === '[') {
        e.preventDefault();
        handleBack();
      }
      // Cmd+] - Forward
      else if (isMeta && e.key === ']') {
        e.preventDefault();
        handleForward();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    activeTabId,
    handleReopenClosedTab,
    handleTogglePrivateMode,
    handleAddToReadingList,
    handlePinTab,
    handleAddBookmark,
    handleNewTab,
    handleCloseTab,
    handleRefresh,
    handleBack,
    handleForward,
  ]);

  // Determine what content to show
  const showingStartPage = activeTab?.url === START_PAGE_URL;

  // Window styling for private mode
  const windowClassName = privateMode
    ? 'z-40 ring-2 ring-purple-500/50'
    : 'z-40';

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
      className={windowClassName}
    >
      <div className="w-full h-full flex flex-col">
        {/* Private Mode Banner */}
        {privateMode && (
          <div className="flex items-center justify-center gap-2 py-1.5 bg-purple-700 text-white text-xs font-medium">
            <Shield className="w-3.5 h-3.5" />
            Private Browsing - History and cookies will not be saved
          </div>
        )}

        <div className="flex-1 flex min-h-0">
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
              onCloseOtherTabs={handleCloseOtherTabs}
              scaleFactor={scaleFactor}
              privateMode={privateMode}
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
              privateMode={privateMode}
              onTogglePrivateMode={handleTogglePrivateMode}
              closedTabsCount={closedTabs.length}
              onReopenClosedTab={handleReopenClosedTab}
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
              } ${privateMode ? 'bg-gray-900' : ''}`}
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
      </div>
    </ZWindow>
  );
};

export default ZSafariWindow;
