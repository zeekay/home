/**
 * Safari Storage Utilities
 * Persistent storage for Safari browser state using localStorage
 */

import {
  SafariTab,
  TabGroup,
  ClosedTab,
  ReadingListItem,
  HistoryEntry,
  Bookmark,
  Favorite,
  SafariState,
  PrivacySettings,
  DEFAULT_BOOKMARK_FOLDERS,
  DEFAULT_FAVORITES,
  generateId,
} from './safariTypes';

const STORAGE_KEYS = {
  TABS: 'safari-tabs',
  TAB_GROUPS: 'safari-tab-groups',
  CLOSED_TABS: 'safari-closed-tabs',
  READING_LIST: 'safari-reading-list',
  HISTORY: 'safari-history',
  BOOKMARKS: 'safari-bookmarks',
  FAVORITES: 'safari-favorites',
  SETTINGS: 'safari-settings',
  PRIVACY: 'safari-privacy',
  PAGE_CACHE: 'safari-page-cache',
} as const;

const MAX_HISTORY_ENTRIES = 1000;
const MAX_CLOSED_TABS = 25;

// Generic storage helpers
function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.error('Failed to remove from localStorage:', e);
  }
}

// Tab Storage
export function loadTabs(): SafariTab[] {
  return getFromStorage<SafariTab[]>(STORAGE_KEYS.TABS, []);
}

export function saveTabs(tabs: SafariTab[]): void {
  setToStorage(STORAGE_KEYS.TABS, tabs);
}

export function createNewTab(url: string = 'start-page', title: string = 'New Tab'): SafariTab {
  return {
    id: generateId(),
    url,
    title,
    isPinned: false,
    isMuted: false,
    isLoading: url !== 'start-page',
    lastAccessed: Date.now(),
    groupId: null,
    history: [url],
    historyIndex: 0,
  };
}

// Closed Tabs Storage (for reopening)
export function loadClosedTabs(): ClosedTab[] {
  return getFromStorage<ClosedTab[]>(STORAGE_KEYS.CLOSED_TABS, []);
}

export function saveClosedTabs(closedTabs: ClosedTab[]): void {
  const limited = closedTabs.slice(0, MAX_CLOSED_TABS);
  setToStorage(STORAGE_KEYS.CLOSED_TABS, limited);
}

export function addClosedTab(tab: SafariTab, index: number): void {
  const closedTabs = loadClosedTabs();
  closedTabs.unshift({
    tab,
    closedAt: Date.now(),
    index,
  });
  saveClosedTabs(closedTabs);
}

export function popClosedTab(): ClosedTab | null {
  const closedTabs = loadClosedTabs();
  if (closedTabs.length === 0) return null;
  const [tab, ...rest] = closedTabs;
  saveClosedTabs(rest);
  return tab;
}

export function clearClosedTabs(): void {
  saveClosedTabs([]);
}

// Tab Groups Storage
export function loadTabGroups(): TabGroup[] {
  return getFromStorage<TabGroup[]>(STORAGE_KEYS.TAB_GROUPS, []);
}

export function saveTabGroups(groups: TabGroup[]): void {
  setToStorage(STORAGE_KEYS.TAB_GROUPS, groups);
}

// Reading List Storage
export function loadReadingList(): ReadingListItem[] {
  return getFromStorage<ReadingListItem[]>(STORAGE_KEYS.READING_LIST, []);
}

export function saveReadingList(items: ReadingListItem[]): void {
  setToStorage(STORAGE_KEYS.READING_LIST, items);
}

export function addToReadingList(url: string, title: string, description?: string): ReadingListItem {
  const items = loadReadingList();
  const existing = items.find(item => item.url === url);
  if (existing) {
    return existing;
  }

  const newItem: ReadingListItem = {
    id: generateId(),
    url,
    title,
    description,
    addedAt: Date.now(),
    isRead: false,
  };

  items.unshift(newItem);
  saveReadingList(items);
  return newItem;
}

export function removeFromReadingList(id: string): void {
  const items = loadReadingList();
  saveReadingList(items.filter(item => item.id !== id));
}

export function toggleReadingListRead(id: string): void {
  const items = loadReadingList();
  const item = items.find(i => i.id === id);
  if (item) {
    item.isRead = !item.isRead;
    saveReadingList(items);
  }
}

export function cachePageContent(id: string, content: string): void {
  const items = loadReadingList();
  const item = items.find(i => i.id === id);
  if (item) {
    item.cachedContent = content;
    saveReadingList(items);
  }
}

// History Storage
export function loadHistory(): HistoryEntry[] {
  return getFromStorage<HistoryEntry[]>(STORAGE_KEYS.HISTORY, []);
}

export function saveHistory(entries: HistoryEntry[]): void {
  const limited = entries.slice(0, MAX_HISTORY_ENTRIES);
  setToStorage(STORAGE_KEYS.HISTORY, limited);
}

export function addToHistory(url: string, title: string): HistoryEntry {
  const entries = loadHistory();

  if (url.startsWith('about:') || url === 'start-page') {
    return entries[0] || { id: '', url: '', title: '', visitedAt: Date.now() };
  }

  const newEntry: HistoryEntry = {
    id: generateId(),
    url,
    title,
    visitedAt: Date.now(),
  };

  entries.unshift(newEntry);
  saveHistory(entries);
  return newEntry;
}

export type ClearHistoryTimeRange = 'hour' | 'day' | 'week' | 'month' | 'all';

export function clearHistory(timeRange: ClearHistoryTimeRange = 'all'): void {
  if (timeRange === 'all') {
    saveHistory([]);
    return;
  }

  const now = Date.now();
  const ranges: Record<Exclude<ClearHistoryTimeRange, 'all'>, number> = {
    hour: 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000,
    week: 7 * 24 * 60 * 60 * 1000,
    month: 30 * 24 * 60 * 60 * 1000,
  };

  const entries = loadHistory();
  const cutoff = now - ranges[timeRange];
  saveHistory(entries.filter(e => e.visitedAt < cutoff));
}

export function searchHistory(query: string): HistoryEntry[] {
  const entries = loadHistory();
  const lowerQuery = query.toLowerCase();
  return entries.filter(
    e => e.title.toLowerCase().includes(lowerQuery) ||
         e.url.toLowerCase().includes(lowerQuery)
  );
}

// Bookmarks Storage
export function loadBookmarks(): Bookmark[] {
  const bookmarks = getFromStorage<Bookmark[]>(STORAGE_KEYS.BOOKMARKS, []);
  if (bookmarks.length === 0) {
    const defaultBookmarks = [...DEFAULT_BOOKMARK_FOLDERS];
    saveBookmarks(defaultBookmarks);
    return defaultBookmarks;
  }
  return bookmarks;
}

export function saveBookmarks(bookmarks: Bookmark[]): void {
  setToStorage(STORAGE_KEYS.BOOKMARKS, bookmarks);
}

export function addBookmark(
  url: string,
  title: string,
  parentId: string = 'favorites'
): Bookmark {
  const bookmarks = loadBookmarks();

  const newBookmark: Bookmark = {
    id: generateId(),
    type: 'bookmark',
    title,
    url,
    parentId,
    createdAt: Date.now(),
  };

  const addToParent = (items: Bookmark[]): boolean => {
    for (const item of items) {
      if (item.id === parentId && item.type === 'folder') {
        item.children = item.children || [];
        item.children.push(newBookmark);
        return true;
      }
      if (item.children && addToParent(item.children)) {
        return true;
      }
    }
    return false;
  };

  if (!addToParent(bookmarks)) {
    bookmarks.push(newBookmark);
  }

  saveBookmarks(bookmarks);
  return newBookmark;
}

export function createBookmarkFolder(name: string, parentId: string | null = null): Bookmark {
  const bookmarks = loadBookmarks();

  const newFolder: Bookmark = {
    id: generateId(),
    type: 'folder',
    title: name,
    parentId,
    children: [],
    createdAt: Date.now(),
  };

  if (parentId) {
    const addToParent = (items: Bookmark[]): boolean => {
      for (const item of items) {
        if (item.id === parentId && item.type === 'folder') {
          item.children = item.children || [];
          item.children.push(newFolder);
          return true;
        }
        if (item.children && addToParent(item.children)) {
          return true;
        }
      }
      return false;
    };
    addToParent(bookmarks);
  } else {
    bookmarks.push(newFolder);
  }

  saveBookmarks(bookmarks);
  return newFolder;
}

export function removeBookmark(id: string): void {
  const bookmarks = loadBookmarks();

  const removeFromList = (items: Bookmark[]): Bookmark[] => {
    return items.filter(item => {
      if (item.id === id) return false;
      if (item.children) {
        item.children = removeFromList(item.children);
      }
      return true;
    });
  };

  saveBookmarks(removeFromList(bookmarks));
}

export function updateBookmark(id: string, updates: Partial<Bookmark>): void {
  const bookmarks = loadBookmarks();

  const updateInList = (items: Bookmark[]): void => {
    for (const item of items) {
      if (item.id === id) {
        Object.assign(item, updates);
        return;
      }
      if (item.children) {
        updateInList(item.children);
      }
    }
  };

  updateInList(bookmarks);
  saveBookmarks(bookmarks);
}

export function getBookmarksBarItems(): Bookmark[] {
  const bookmarks = loadBookmarks();
  const barFolder = bookmarks.find(b => b.id === 'bookmarks-bar');
  return barFolder?.children || [];
}

export function findBookmark(id: string): Bookmark | null {
  const bookmarks = loadBookmarks();

  const findInList = (items: Bookmark[]): Bookmark | null => {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children) {
        const found = findInList(item.children);
        if (found) return found;
      }
    }
    return null;
  };

  return findInList(bookmarks);
}

export function isBookmarked(url: string): boolean {
  const bookmarks = loadBookmarks();

  const checkInList = (items: Bookmark[]): boolean => {
    for (const item of items) {
      if (item.url === url) return true;
      if (item.children && checkInList(item.children)) return true;
    }
    return false;
  };

  return checkInList(bookmarks);
}

export function exportBookmarks(): string {
  const bookmarks = loadBookmarks();
  return JSON.stringify(bookmarks, null, 2);
}

export function importBookmarks(json: string): boolean {
  try {
    const imported = JSON.parse(json) as Bookmark[];
    if (!Array.isArray(imported)) return false;

    const importFolder = createBookmarkFolder('Imported ' + new Date().toLocaleDateString());

    const addRecursive = (items: Bookmark[], parentId: string) => {
      for (const item of items) {
        if (item.type === 'folder') {
          const folder = createBookmarkFolder(item.title, parentId);
          if (item.children) {
            addRecursive(item.children, folder.id);
          }
        } else if (item.url) {
          addBookmark(item.url, item.title, parentId);
        }
      }
    };

    addRecursive(imported, importFolder.id);
    return true;
  } catch {
    return false;
  }
}

// Favorites Storage (for Start Page)
export function loadFavorites(): Favorite[] {
  const favorites = getFromStorage<Favorite[]>(STORAGE_KEYS.FAVORITES, []);
  if (favorites.length === 0) {
    saveFavorites(DEFAULT_FAVORITES);
    return DEFAULT_FAVORITES;
  }
  return favorites;
}

export function saveFavorites(favorites: Favorite[]): void {
  setToStorage(STORAGE_KEYS.FAVORITES, favorites);
}

export function addToFavorites(url: string, title: string): Favorite {
  const favorites = loadFavorites();
  const existing = favorites.find(f => f.url === url);

  if (existing) {
    existing.visitCount++;
    saveFavorites(favorites);
    return existing;
  }

  const newFavorite: Favorite = {
    id: generateId(),
    url,
    title,
    visitCount: 1,
  };

  favorites.push(newFavorite);
  saveFavorites(favorites);
  return newFavorite;
}

export function removeFromFavorites(id: string): void {
  const favorites = loadFavorites();
  saveFavorites(favorites.filter(f => f.id !== id));
}

export function incrementFavoriteVisit(url: string): void {
  const favorites = loadFavorites();
  const favorite = favorites.find(f => f.url === url);
  if (favorite) {
    favorite.visitCount++;
    saveFavorites(favorites);
  }
}

export function getFrequentlyVisited(limit: number = 12): Favorite[] {
  const favorites = loadFavorites();
  return [...favorites]
    .sort((a, b) => b.visitCount - a.visitCount)
    .slice(0, limit);
}

// Privacy Settings Storage
export function loadPrivacySettings(): PrivacySettings {
  return getFromStorage<PrivacySettings>(STORAGE_KEYS.PRIVACY, {
    blockPopups: true,
    privateMode: false,
  });
}

export function savePrivacySettings(settings: Partial<PrivacySettings>): void {
  const current = loadPrivacySettings();
  setToStorage(STORAGE_KEYS.PRIVACY, { ...current, ...settings });
}

// Clear all browsing data
export function clearBrowsingData(options: {
  history?: boolean;
  cookies?: boolean;
  cache?: boolean;
  closedTabs?: boolean;
} = {}): void {
  if (options.history) {
    saveHistory([]);
  }
  if (options.cookies) {
    removeFromStorage(STORAGE_KEYS.PAGE_CACHE);
  }
  if (options.cache) {
    const readingList = loadReadingList();
    readingList.forEach(item => {
      delete item.cachedContent;
    });
    saveReadingList(readingList);
  }
  if (options.closedTabs) {
    clearClosedTabs();
  }
}

// Settings Storage
interface SafariSettings {
  showBookmarksBar: boolean;
  showStartPage: boolean;
  sidebarSection: 'tabGroups' | 'readingList' | 'history' | 'bookmarks';
  homePage: string;
}

export function loadSettings(): SafariSettings {
  return getFromStorage<SafariSettings>(STORAGE_KEYS.SETTINGS, {
    showBookmarksBar: true,
    showStartPage: true,
    sidebarSection: 'bookmarks',
    homePage: 'start-page',
  });
}

export function saveSettings(settings: Partial<SafariSettings>): void {
  const current = loadSettings();
  setToStorage(STORAGE_KEYS.SETTINGS, { ...current, ...settings });
}

// Initialize default state
export function getInitialSafariState(initialUrl: string): SafariState {
  const tabs = loadTabs();
  const settings = loadSettings();
  const privacySettings = loadPrivacySettings();

  if (tabs.length === 0) {
    const initialTab = createNewTab(initialUrl, 'New Tab');
    tabs.push(initialTab);
    saveTabs(tabs);
  }

  return {
    tabs,
    activeTabId: tabs[0]?.id || null,
    tabGroups: loadTabGroups(),
    closedTabs: loadClosedTabs(),
    readingList: loadReadingList(),
    history: loadHistory(),
    bookmarks: loadBookmarks(),
    favorites: loadFavorites(),
    sidebarOpen: false,
    sidebarSection: settings.sidebarSection,
    showBookmarksBar: settings.showBookmarksBar,
    showStartPage: settings.showStartPage,
    privateMode: privacySettings.privateMode,
    privacySettings,
  };
}
