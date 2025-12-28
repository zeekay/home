/**
 * Safari Browser Types
 * Core type definitions for Safari browser features
 */

// Tab Types
export interface SafariTab {
  id: string;
  url: string;
  title: string;
  favicon?: string;
  isPinned: boolean;
  isMuted: boolean;
  isLoading: boolean;
  lastAccessed: number;
  groupId: string | null;
  history: string[];
  historyIndex: number;
}

// Closed Tab for restoration
export interface ClosedTab {
  tab: SafariTab;
  closedAt: number;
  index: number;
}

// Tab Group Types
export interface TabGroup {
  id: string;
  name: string;
  color: TabGroupColor;
  isCollapsed: boolean;
  tabIds: string[];
  createdAt: number;
}

export type TabGroupColor =
  | 'gray'
  | 'blue'
  | 'purple'
  | 'pink'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'cyan';

export const TAB_GROUP_COLORS: Record<TabGroupColor, { bg: string; text: string; border: string; solid: string }> = {
  gray: { bg: 'bg-gray-500/20', text: 'text-gray-600 dark:text-gray-400', border: 'border-gray-500', solid: '#6B7280' },
  blue: { bg: 'bg-blue-500/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500', solid: '#3B82F6' },
  purple: { bg: 'bg-purple-500/20', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-500', solid: '#8B5CF6' },
  pink: { bg: 'bg-pink-500/20', text: 'text-pink-600 dark:text-pink-400', border: 'border-pink-500', solid: '#EC4899' },
  red: { bg: 'bg-red-500/20', text: 'text-red-600 dark:text-red-400', border: 'border-red-500', solid: '#EF4444' },
  orange: { bg: 'bg-orange-500/20', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-500', solid: '#F97316' },
  yellow: { bg: 'bg-yellow-500/20', text: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-500', solid: '#EAB308' },
  green: { bg: 'bg-green-500/20', text: 'text-green-600 dark:text-green-400', border: 'border-green-500', solid: '#22C55E' },
  cyan: { bg: 'bg-cyan-500/20', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-500', solid: '#06B6D4' },
};

// Reading List Types
export interface ReadingListItem {
  id: string;
  url: string;
  title: string;
  description?: string;
  favicon?: string;
  addedAt: number;
  isRead: boolean;
  cachedContent?: string;
}

// History Types
export interface HistoryEntry {
  id: string;
  url: string;
  title: string;
  favicon?: string;
  visitedAt: number;
}

// Bookmark Types
export interface Bookmark {
  id: string;
  type: 'bookmark' | 'folder';
  title: string;
  url?: string;
  favicon?: string;
  parentId: string | null;
  children?: Bookmark[];
  createdAt: number;
}

// Favorites for Start Page
export interface Favorite {
  id: string;
  url: string;
  title: string;
  favicon?: string;
  visitCount: number;
}

// Privacy Settings
export interface PrivacySettings {
  blockPopups: boolean;
  privateMode: boolean;
}

// Safari State
export interface SafariState {
  tabs: SafariTab[];
  activeTabId: string | null;
  tabGroups: TabGroup[];
  closedTabs: ClosedTab[];
  readingList: ReadingListItem[];
  history: HistoryEntry[];
  bookmarks: Bookmark[];
  favorites: Favorite[];
  sidebarOpen: boolean;
  sidebarSection: 'tabGroups' | 'readingList' | 'history' | 'bookmarks';
  showBookmarksBar: boolean;
  showStartPage: boolean;
  privateMode: boolean;
  privacySettings: PrivacySettings;
}

// Default bookmarks folder structure
export const DEFAULT_BOOKMARK_FOLDERS: Bookmark[] = [
  {
    id: 'favorites',
    type: 'folder',
    title: 'Favorites',
    parentId: null,
    children: [],
    createdAt: Date.now(),
  },
  {
    id: 'bookmarks-bar',
    type: 'folder',
    title: 'Bookmarks Bar',
    parentId: null,
    children: [],
    createdAt: Date.now(),
  },
];

// Default favorites for start page
export const DEFAULT_FAVORITES: Favorite[] = [
  { id: 'fav-1', url: 'https://www.google.com', title: 'Google', visitCount: 100 },
  { id: 'fav-2', url: 'https://github.com', title: 'GitHub', visitCount: 90 },
  { id: 'fav-3', url: 'https://www.youtube.com', title: 'YouTube', visitCount: 80 },
  { id: 'fav-4', url: 'https://twitter.com', title: 'Twitter', visitCount: 70 },
  { id: 'fav-5', url: 'https://www.reddit.com', title: 'Reddit', visitCount: 60 },
  { id: 'fav-6', url: 'https://en.wikipedia.org', title: 'Wikipedia', visitCount: 50 },
];

// Helper to generate unique IDs
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Helper to extract domain from URL
export const extractDomain = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return url;
  }
};

// Helper to get favicon URL
export const getFaviconUrl = (url: string): string => {
  try {
    const domain = extractDomain(url);
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return '';
  }
};

// Helper to normalize URL
export const normalizeUrl = (input: string): string => {
  let url = input.trim();
  if (!url) return '';

  // Check if it's a search query (no dots or starts with search terms)
  if (!url.includes('.') || url.includes(' ')) {
    return `https://duckduckgo.com/?q=${encodeURIComponent(url)}`;
  }

  // Add protocol if missing
  if (!url.match(/^https?:\/\//i)) {
    url = 'https://' + url;
  }

  return url;
};

// Format date for display
export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: 'long' });
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
};

// Group history entries by date
export const groupHistoryByDate = (entries: HistoryEntry[]): Map<string, HistoryEntry[]> => {
  const groups = new Map<string, HistoryEntry[]>();

  entries.forEach(entry => {
    const date = new Date(entry.visitedAt);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    let key: string;
    if (diffDays === 0) {
      key = 'Today';
    } else if (diffDays === 1) {
      key = 'Yesterday';
    } else if (diffDays < 7) {
      key = 'This Week';
    } else if (diffDays < 30) {
      key = 'This Month';
    } else {
      key = date.toLocaleDateString([], { month: 'long', year: 'numeric' });
    }

    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(entry);
  });

  return groups;
};
