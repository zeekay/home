import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ZWindow from './ZWindow';
import {
  fetchAvailableApps,
  getInstalledApps,
  installApp,
  uninstallApp,
  updateApp,
  checkForUpdates,
  clearAppCache,
  categoryGradients,
  type AppManifest,
  type InstalledApp,
  type AppUpdate,
  type AppCategory,
} from '@/services/appLoader';
import {
  Download,
  Check,
  RefreshCw,
  Search,
  Package,
  Star,
  ArrowUpCircle,
  Trash2,
  ExternalLink,
  Shield,
  Clock,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  Flag,
  Gift,
  User,
  Crown,
  Sparkles,
  TrendingUp,
  Grid,
  Play,
  X,
  Zap,
  Code,
  MessageSquare,
  Palette,
  DollarSign,
  Wrench,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

interface ZAppStoreWindowProps {
  onClose: () => void;
}

type TabType = 'discover' | 'categories' | 'search' | 'account' | 'updates';

interface AppReview {
  id: string;
  appId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  helpful: number;
}

interface AppScreenshot {
  url: string;
  caption: string;
}

interface ExtendedAppManifest extends AppManifest {
  screenshots?: AppScreenshot[];
  whatsNew?: string;
  size?: string;
  ageRating?: string;
  languages?: string[];
  privacyPolicy?: string;
  price?: number;
  inAppPurchases?: boolean;
  developer?: {
    name: string;
    website?: string;
  };
  downloads?: number;
  rating?: number;
  ratingCount?: number;
  featured?: boolean;
  editorChoice?: boolean;
  trending?: boolean;
}

interface WishlistItem {
  appId: string;
  addedAt: string;
}

// ============================================================================
// Storage Keys
// ============================================================================

const STORAGE_KEYS = {
  reviews: 'zos:appstore:reviews',
  wishlist: 'zos:appstore:wishlist',
  redeemCodes: 'zos:appstore:redeemed',
  autoUpdate: 'zos:appstore:autoupdate',
};

// ============================================================================
// Mock Data - Extended App Registry
// ============================================================================

const CATEGORY_INFO: Record<AppCategory, { name: string; icon: React.ReactNode; color: string }> = {
  productivity: { name: 'Productivity', icon: <Zap className="w-5 h-5" />, color: 'from-blue-500 to-cyan-500' },
  utilities: { name: 'Utilities', icon: <Wrench className="w-5 h-5" />, color: 'from-gray-500 to-gray-600' },
  entertainment: { name: 'Entertainment', icon: <Play className="w-5 h-5" />, color: 'from-pink-500 to-rose-500' },
  communication: { name: 'Social', icon: <MessageSquare className="w-5 h-5" />, color: 'from-green-500 to-emerald-500' },
  development: { name: 'Developer Tools', icon: <Code className="w-5 h-5" />, color: 'from-purple-500 to-pink-500' },
  finance: { name: 'Finance', icon: <DollarSign className="w-5 h-5" />, color: 'from-yellow-500 to-orange-500' },
  system: { name: 'System', icon: <Settings className="w-5 h-5" />, color: 'from-slate-500 to-slate-600' },
  other: { name: 'Graphics & Design', icon: <Palette className="w-5 h-5" />, color: 'from-indigo-500 to-purple-500' },
};

// Extended app data with screenshots, reviews, etc.
const EXTENDED_APP_DATA: Record<string, Partial<ExtendedAppManifest>> = {
  'apps.zos.finder': {
    screenshots: [
      { url: 'https://placehold.co/600x400/1e293b/white?text=Finder+Grid', caption: 'Grid View' },
      { url: 'https://placehold.co/600x400/1e293b/white?text=Finder+List', caption: 'List View' },
      { url: 'https://placehold.co/600x400/1e293b/white?text=Finder+Columns', caption: 'Column View' },
    ],
    whatsNew: 'New column view with improved navigation. Quick Look now supports more file types.',
    size: '12.5 MB',
    ageRating: '4+',
    languages: ['English', 'Spanish', 'French', 'German', 'Japanese', 'Chinese'],
    downloads: 150000,
    rating: 4.8,
    ratingCount: 12500,
    editorChoice: true,
  },
  'apps.zos.terminal': {
    screenshots: [
      { url: 'https://placehold.co/600x400/0f172a/22c55e?text=Terminal', caption: 'Command Line' },
      { url: 'https://placehold.co/600x400/0f172a/22c55e?text=Terminal+Tabs', caption: 'Multiple Tabs' },
    ],
    whatsNew: 'Added WebContainer support for running Node.js locally. New theme options available.',
    size: '8.2 MB',
    ageRating: '12+',
    languages: ['English'],
    downloads: 85000,
    rating: 4.9,
    ratingCount: 8200,
    featured: true,
    trending: true,
  },
  'apps.zos.safari': {
    screenshots: [
      { url: 'https://placehold.co/600x400/1e3a5f/white?text=Safari+Browse', caption: 'Web Browsing' },
      { url: 'https://placehold.co/600x400/1e3a5f/white?text=Safari+Tabs', caption: 'Tab Management' },
    ],
    whatsNew: 'Improved tab management. New privacy features with intelligent tracking prevention.',
    size: '45.8 MB',
    ageRating: '4+',
    languages: ['English', 'Spanish', 'French', 'German', 'Japanese', 'Chinese', 'Korean'],
    downloads: 200000,
    rating: 4.7,
    ratingCount: 18000,
    featured: true,
  },
  'apps.zos.calculator': {
    screenshots: [
      { url: 'https://placehold.co/600x400/374151/white?text=Calculator', caption: 'Basic Mode' },
      { url: 'https://placehold.co/600x400/374151/white?text=Scientific', caption: 'Scientific Mode' },
    ],
    whatsNew: 'New scientific mode with advanced functions. History now saves between sessions.',
    size: '2.1 MB',
    ageRating: '4+',
    languages: ['English'],
    downloads: 120000,
    rating: 4.6,
    ratingCount: 5600,
  },
  'apps.zos.notes': {
    screenshots: [
      { url: 'https://placehold.co/600x400/fbbf24/1f2937?text=Notes', caption: 'Note Editor' },
      { url: 'https://placehold.co/600x400/fbbf24/1f2937?text=Notes+Folders', caption: 'Folder Organization' },
    ],
    whatsNew: 'Rich text formatting. New folder organization and tagging system.',
    size: '15.3 MB',
    ageRating: '4+',
    languages: ['English', 'Spanish', 'French'],
    downloads: 95000,
    rating: 4.5,
    ratingCount: 7800,
    editorChoice: true,
  },
  'apps.zos.calendar': {
    screenshots: [
      { url: 'https://placehold.co/600x400/3b82f6/white?text=Calendar', caption: 'Month View' },
      { url: 'https://placehold.co/600x400/3b82f6/white?text=Cal.com', caption: 'Cal.com Integration' },
    ],
    whatsNew: 'Cal.com integration for easy scheduling. Google Meet support added.',
    size: '18.7 MB',
    ageRating: '4+',
    languages: ['English', 'Spanish'],
    downloads: 78000,
    rating: 4.4,
    ratingCount: 4200,
  },
  'apps.zos.photos': {
    screenshots: [
      { url: 'https://placehold.co/600x400/ec4899/white?text=Photos+Grid', caption: 'Photo Grid' },
      { url: 'https://placehold.co/600x400/ec4899/white?text=Instagram', caption: 'Instagram Feed' },
    ],
    whatsNew: 'Instagram integration. New project showcase gallery.',
    size: '22.4 MB',
    ageRating: '4+',
    languages: ['English'],
    downloads: 65000,
    rating: 4.3,
    ratingCount: 3100,
  },
  'apps.zos.music': {
    screenshots: [
      { url: 'https://placehold.co/600x400/1db954/white?text=Music+Player', caption: 'Now Playing' },
      { url: 'https://placehold.co/600x400/1db954/white?text=Spotify', caption: 'Spotify Integration' },
    ],
    whatsNew: 'Full Spotify integration. Recently played tracks and top artists.',
    size: '35.2 MB',
    ageRating: '12+',
    languages: ['English'],
    downloads: 110000,
    rating: 4.7,
    ratingCount: 9500,
    featured: true,
    trending: true,
  },
  'apps.zos.mail': {
    screenshots: [
      { url: 'https://placehold.co/600x400/3b82f6/white?text=Mail+Inbox', caption: 'Inbox' },
      { url: 'https://placehold.co/600x400/3b82f6/white?text=Compose', caption: 'Compose Email' },
    ],
    whatsNew: 'Contact form integration. Send emails directly to z@zeekay.ai.',
    size: '28.9 MB',
    ageRating: '4+',
    languages: ['English', 'Spanish', 'French', 'German'],
    downloads: 88000,
    rating: 4.5,
    ratingCount: 6700,
  },
  'apps.zos.system-preferences': {
    screenshots: [
      { url: 'https://placehold.co/600x400/475569/white?text=Settings', caption: 'System Settings' },
      { url: 'https://placehold.co/600x400/475569/white?text=Appearance', caption: 'Appearance' },
    ],
    whatsNew: 'New appearance settings. Dock customization options.',
    size: '5.8 MB',
    ageRating: '4+',
    languages: ['English'],
    downloads: 150000,
    rating: 4.2,
    ratingCount: 2100,
  },
};

// Community apps (mock data)
const COMMUNITY_APPS: ExtendedAppManifest[] = [
  {
    identifier: 'apps.community.todolist',
    name: 'TaskMaster',
    version: '2.3.1',
    description: 'Beautiful todo list with projects, tags, and due dates. Sync across devices.',
    category: 'productivity',
    icon: '✓',
    downloads: 45000,
    rating: 4.6,
    ratingCount: 3200,
    featured: true,
    screenshots: [{ url: 'https://placehold.co/600x400/6366f1/white?text=TaskMaster', caption: 'Task List' }],
    whatsNew: 'Added recurring tasks and calendar view.',
    size: '8.5 MB',
    ageRating: '4+',
    languages: ['English', 'Spanish'],
  },
  {
    identifier: 'apps.community.pomodoro',
    name: 'FocusTimer',
    version: '1.5.0',
    description: 'Pomodoro timer with statistics and ambient sounds for deep focus.',
    category: 'productivity',
    icon: '⏱️',
    downloads: 32000,
    rating: 4.8,
    ratingCount: 2100,
    trending: true,
    screenshots: [{ url: 'https://placehold.co/600x400/ef4444/white?text=FocusTimer', caption: 'Timer' }],
    whatsNew: 'New ambient sounds and statistics dashboard.',
    size: '4.2 MB',
    ageRating: '4+',
    languages: ['English'],
  },
  {
    identifier: 'apps.community.markdown',
    name: 'MarkdownPad',
    version: '3.1.0',
    description: 'Advanced markdown editor with live preview and export options.',
    category: 'productivity',
    icon: '📄',
    downloads: 28000,
    rating: 4.5,
    ratingCount: 1800,
    editorChoice: true,
    screenshots: [{ url: 'https://placehold.co/600x400/10b981/white?text=MarkdownPad', caption: 'Editor' }],
    whatsNew: 'Added Mermaid diagram support.',
    size: '12.3 MB',
    ageRating: '4+',
    languages: ['English', 'French', 'German'],
  },
  {
    identifier: 'apps.community.password',
    name: 'VaultGuard',
    version: '4.0.2',
    description: 'Secure password manager with biometric unlock and password generator.',
    category: 'utilities',
    icon: '🔐',
    downloads: 67000,
    rating: 4.9,
    ratingCount: 8500,
    featured: true,
    editorChoice: true,
    screenshots: [{ url: 'https://placehold.co/600x400/7c3aed/white?text=VaultGuard', caption: 'Password Vault' }],
    whatsNew: 'New secure notes feature and improved autofill.',
    size: '15.7 MB',
    ageRating: '4+',
    languages: ['English', 'Spanish', 'German', 'Japanese'],
  },
  {
    identifier: 'apps.community.weather-pro',
    name: 'WeatherPro',
    version: '2.8.0',
    description: 'Detailed weather forecasts with radar maps and severe weather alerts.',
    category: 'utilities',
    icon: '🌦️',
    downloads: 89000,
    rating: 4.4,
    ratingCount: 5600,
    screenshots: [{ url: 'https://placehold.co/600x400/0ea5e9/white?text=WeatherPro', caption: 'Forecast' }],
    whatsNew: 'Added hourly forecasts and weather widgets.',
    size: '22.1 MB',
    ageRating: '4+',
    languages: ['English', 'Spanish', 'French'],
  },
  {
    identifier: 'apps.community.video-player',
    name: 'CinemaView',
    version: '1.2.0',
    description: 'Universal video player supporting all formats with subtitle support.',
    category: 'entertainment',
    icon: '🎬',
    downloads: 54000,
    rating: 4.3,
    ratingCount: 2900,
    screenshots: [{ url: 'https://placehold.co/600x400/f97316/white?text=CinemaView', caption: 'Player' }],
    whatsNew: 'Added picture-in-picture mode.',
    size: '45.6 MB',
    ageRating: '12+',
    languages: ['English'],
  },
  {
    identifier: 'apps.community.podcast',
    name: 'PodcastHub',
    version: '3.0.1',
    description: 'Discover and listen to podcasts with smart recommendations.',
    category: 'entertainment',
    icon: '🎙️',
    downloads: 41000,
    rating: 4.6,
    ratingCount: 3400,
    trending: true,
    screenshots: [{ url: 'https://placehold.co/600x400/8b5cf6/white?text=PodcastHub', caption: 'Podcast Library' }],
    whatsNew: 'Added chapters support and improved discovery.',
    size: '28.4 MB',
    ageRating: '12+',
    languages: ['English', 'Spanish'],
  },
  {
    identifier: 'apps.community.chat',
    name: 'QuickChat',
    version: '2.1.0',
    description: 'Fast and secure messaging with end-to-end encryption.',
    category: 'communication',
    icon: '💬',
    downloads: 72000,
    rating: 4.5,
    ratingCount: 4800,
    screenshots: [{ url: 'https://placehold.co/600x400/06b6d4/white?text=QuickChat', caption: 'Chat' }],
    whatsNew: 'Added voice messages and reactions.',
    size: '35.8 MB',
    ageRating: '12+',
    languages: ['English', 'Spanish', 'French', 'German', 'Portuguese'],
  },
  {
    identifier: 'apps.community.git-client',
    name: 'GitFlow',
    version: '1.8.0',
    description: 'Visual Git client with branch visualization and merge tools.',
    category: 'development',
    icon: '🔀',
    downloads: 35000,
    rating: 4.7,
    ratingCount: 2600,
    editorChoice: true,
    screenshots: [{ url: 'https://placehold.co/600x400/f43f5e/white?text=GitFlow', caption: 'Branch Graph' }],
    whatsNew: 'Added GitHub and GitLab integration.',
    size: '48.2 MB',
    ageRating: '4+',
    languages: ['English'],
  },
  {
    identifier: 'apps.community.api-tester',
    name: 'APILab',
    version: '2.0.0',
    description: 'Test and debug REST and GraphQL APIs with collections.',
    category: 'development',
    icon: '🔌',
    downloads: 29000,
    rating: 4.4,
    ratingCount: 1900,
    screenshots: [{ url: 'https://placehold.co/600x400/a855f7/white?text=APILab', caption: 'Request Builder' }],
    whatsNew: 'Added GraphQL support and environment variables.',
    size: '32.1 MB',
    ageRating: '4+',
    languages: ['English'],
  },
  {
    identifier: 'apps.community.budget',
    name: 'MoneyWise',
    version: '3.2.1',
    description: 'Personal finance tracker with budgets, goals, and insights.',
    category: 'finance',
    icon: '💰',
    downloads: 58000,
    rating: 4.6,
    ratingCount: 4100,
    featured: true,
    screenshots: [{ url: 'https://placehold.co/600x400/eab308/1f2937?text=MoneyWise', caption: 'Dashboard' }],
    whatsNew: 'Added investment tracking and recurring transactions.',
    size: '18.9 MB',
    ageRating: '4+',
    languages: ['English', 'Spanish', 'German'],
  },
  {
    identifier: 'apps.community.sketch',
    name: 'SketchPad',
    version: '2.5.0',
    description: 'Digital drawing and sketching with layers and brushes.',
    category: 'other',
    icon: '🎨',
    downloads: 47000,
    rating: 4.5,
    ratingCount: 3200,
    trending: true,
    screenshots: [{ url: 'https://placehold.co/600x400/ec4899/white?text=SketchPad', caption: 'Canvas' }],
    whatsNew: 'Added new brush packs and layer blending modes.',
    size: '52.4 MB',
    ageRating: '4+',
    languages: ['English', 'Japanese', 'Korean'],
  },
];

// Redeem codes (mock)
const VALID_REDEEM_CODES: Record<string, { appId: string; name: string }> = {
  'WELCOME2024': { appId: 'apps.community.todolist', name: 'TaskMaster' },
  'FOCUS-FREE': { appId: 'apps.community.pomodoro', name: 'FocusTimer' },
  'DESIGN-PLUS': { appId: 'apps.community.sketch', name: 'SketchPad' },
};

// ============================================================================
// Helper Functions
// ============================================================================

function getReviews(): AppReview[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.reviews);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveReview(review: AppReview): void {
  const reviews = getReviews();
  const existing = reviews.findIndex(r => r.id === review.id);
  if (existing >= 0) {
    reviews[existing] = review;
  } else {
    reviews.push(review);
  }
  localStorage.setItem(STORAGE_KEYS.reviews, JSON.stringify(reviews));
}

function getWishlist(): WishlistItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.wishlist);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveWishlist(wishlist: WishlistItem[]): void {
  localStorage.setItem(STORAGE_KEYS.wishlist, JSON.stringify(wishlist));
}

function toggleWishlist(appId: string): boolean {
  const wishlist = getWishlist();
  const index = wishlist.findIndex(w => w.appId === appId);
  if (index >= 0) {
    wishlist.splice(index, 1);
    saveWishlist(wishlist);
    return false;
  } else {
    wishlist.push({ appId, addedAt: new Date().toISOString() });
    saveWishlist(wishlist);
    return true;
  }
}

function isInWishlist(appId: string): boolean {
  return getWishlist().some(w => w.appId === appId);
}

function getRedeemedCodes(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.redeemCodes);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRedeemedCode(code: string): void {
  const codes = getRedeemedCodes();
  if (!codes.includes(code)) {
    codes.push(code);
    localStorage.setItem(STORAGE_KEYS.redeemCodes, JSON.stringify(codes));
  }
}

function getAutoUpdate(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEYS.autoUpdate) === 'true';
  } catch {
    return false;
  }
}

function setAutoUpdate(enabled: boolean): void {
  localStorage.setItem(STORAGE_KEYS.autoUpdate, String(enabled));
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return String(num);
}

function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (d.getTime() === 0) return 'System';
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;

  return d.toLocaleDateString();
}

// ============================================================================
// Main Component
// ============================================================================

const ZAppStoreWindow: React.FC<ZAppStoreWindowProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('discover');
  const [availableApps, setAvailableApps] = useState<ExtendedAppManifest[]>([]);
  const [installedApps, setInstalledApps] = useState<InstalledApp[]>([]);
  const [updates, setUpdates] = useState<AppUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [installing, setInstalling] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<ExtendedAppManifest | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<AppCategory | null>(null);
  const [searchCategory, setSearchCategory] = useState<AppCategory | 'all'>('all');
  const [searchSort, setSearchSort] = useState<'relevance' | 'rating' | 'downloads'>('relevance');
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(getAutoUpdate());

  // Load apps on mount
  useEffect(() => {
    loadApps();
  }, []);

  // Listen for app changes
  useEffect(() => {
    const handleAppsUpdated = () => {
      setInstalledApps(getInstalledApps());
    };

    window.addEventListener('zos:apps-updated', handleAppsUpdated);
    window.addEventListener('zos:app-installed', handleAppsUpdated);
    window.addEventListener('zos:app-uninstalled', handleAppsUpdated);

    return () => {
      window.removeEventListener('zos:apps-updated', handleAppsUpdated);
      window.removeEventListener('zos:app-installed', handleAppsUpdated);
      window.removeEventListener('zos:app-uninstalled', handleAppsUpdated);
    };
  }, []);

  const loadApps = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [available, installed] = await Promise.all([
        fetchAvailableApps(),
        Promise.resolve(getInstalledApps()),
      ]);

      // Merge with extended data and community apps
      const extendedApps: ExtendedAppManifest[] = [
        ...available.map(app => ({
          ...app,
          ...EXTENDED_APP_DATA[app.identifier],
        })),
        ...COMMUNITY_APPS,
      ];

      setAvailableApps(extendedApps);
      setInstalledApps(installed);

      // Check for updates
      const appUpdates = await checkForUpdates();
      setUpdates(appUpdates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load apps');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    clearAppCache();
    loadApps();
  }, [loadApps]);

  const handleInstall = useCallback(async (app: AppManifest) => {
    setInstalling(app.identifier);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      installApp(app);
    } finally {
      setInstalling(null);
    }
  }, []);

  const handleUninstall = useCallback((identifier: string) => {
    try {
      uninstallApp(identifier);
    } catch (err) {
      console.error('Failed to uninstall:', err);
    }
  }, []);

  const handleUpdate = useCallback(async (update: AppUpdate) => {
    setInstalling(update.identifier);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      updateApp(update.app);
      setUpdates(prev => prev.filter(u => u.identifier !== update.identifier));
    } finally {
      setInstalling(null);
    }
  }, []);

  const handleUpdateAll = useCallback(async () => {
    for (const update of updates) {
      await handleUpdate(update);
    }
  }, [updates, handleUpdate]);

  const isInstalled = useCallback((identifier: string) => {
    return installedApps.some(app => app.identifier === identifier);
  }, [installedApps]);

  const getInstalledVersion = useCallback((identifier: string) => {
    return installedApps.find(app => app.identifier === identifier)?.version;
  }, [installedApps]);

  // Get app by ID
  const getAppById = useCallback((id: string): ExtendedAppManifest | undefined => {
    return availableApps.find(app => app.identifier === id);
  }, [availableApps]);

  // Filtered and sorted apps for search
  const filteredApps = useMemo(() => {
    let apps = availableApps;

    // Filter by category
    if (searchCategory !== 'all') {
      apps = apps.filter(app => app.category === searchCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      apps = apps.filter(app =>
        app.name.toLowerCase().includes(query) ||
        app.description?.toLowerCase().includes(query) ||
        app.category?.toLowerCase().includes(query)
      );
    }

    // Sort
    switch (searchSort) {
      case 'rating':
        apps = [...apps].sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'downloads':
        apps = [...apps].sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
        break;
      default:
        // Relevance - featured first, then by name
        apps = [...apps].sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return a.name.localeCompare(b.name);
        });
    }

    return apps;
  }, [availableApps, searchCategory, searchQuery, searchSort]);

  // Featured apps
  const featuredApps = useMemo(() => {
    return availableApps.filter(app => app.featured);
  }, [availableApps]);

  // Editor's choice
  const editorChoice = useMemo(() => {
    return availableApps.filter(app => app.editorChoice);
  }, [availableApps]);

  // Trending apps
  const trendingApps = useMemo(() => {
    return availableApps.filter(app => app.trending);
  }, [availableApps]);

  // Top charts
  const topFreeApps = useMemo(() => {
    return [...availableApps]
      .filter(app => !app.price)
      .sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
      .slice(0, 10);
  }, [availableApps]);

  // App of the Day (rotate based on date)
  const appOfTheDay = useMemo(() => {
    if (featuredApps.length === 0) return null;
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    return featuredApps[dayOfYear % featuredApps.length];
  }, [featuredApps]);

  // Category apps
  const categoryApps = useMemo(() => {
    if (!selectedCategory) return [];
    return availableApps.filter(app => app.category === selectedCategory);
  }, [availableApps, selectedCategory]);

  // Wishlist apps
  const wishlistApps = useMemo(() => {
    const wishlist = getWishlist();
    return wishlist
      .map(w => getAppById(w.appId))
      .filter((app): app is ExtendedAppManifest => !!app);
  }, [getAppById]);

  // Handle toggle auto-update
  const handleToggleAutoUpdate = useCallback(() => {
    const newValue = !autoUpdateEnabled;
    setAutoUpdateEnabled(newValue);
    setAutoUpdate(newValue);
  }, [autoUpdateEnabled]);

  // If viewing app detail
  if (selectedApp) {
    return (
      <ZWindow
        title="App Store"
        onClose={onClose}
        initialSize={{ width: 900, height: 700 }}
        minSize={{ width: 600, height: 400 }}
      >
        <AppDetailView
          app={selectedApp}
          isInstalled={isInstalled(selectedApp.identifier)}
          installedVersion={getInstalledVersion(selectedApp.identifier)}
          installing={installing === selectedApp.identifier}
          onInstall={() => handleInstall(selectedApp)}
          onUninstall={() => handleUninstall(selectedApp.identifier)}
          onBack={() => setSelectedApp(null)}
        />
      </ZWindow>
    );
  }

  // If viewing category
  if (selectedCategory) {
    return (
      <ZWindow
        title="App Store"
        onClose={onClose}
        initialSize={{ width: 900, height: 700 }}
        minSize={{ width: 600, height: 400 }}
      >
        <CategoryView
          category={selectedCategory}
          apps={categoryApps}
          installing={installing}
          onInstall={handleInstall}
          onSelectApp={setSelectedApp}
          onBack={() => setSelectedCategory(null)}
          isInstalled={isInstalled}
        />
      </ZWindow>
    );
  }

  return (
    <ZWindow
      title="App Store"
      onClose={onClose}
      initialSize={{ width: 900, height: 700 }}
      minSize={{ width: 600, height: 400 }}
    >
      <div className="flex flex-col h-full bg-gray-900/95">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex gap-1">
            <TabButton active={activeTab === 'discover'} onClick={() => setActiveTab('discover')}>
              <Sparkles className="w-4 h-4" />
              Discover
            </TabButton>
            <TabButton active={activeTab === 'categories'} onClick={() => setActiveTab('categories')}>
              <Grid className="w-4 h-4" />
              Categories
            </TabButton>
            <TabButton active={activeTab === 'search'} onClick={() => setActiveTab('search')}>
              <Search className="w-4 h-4" />
              Search
            </TabButton>
            <TabButton active={activeTab === 'account'} onClick={() => setActiveTab('account')}>
              <User className="w-4 h-4" />
              Account
            </TabButton>
            <TabButton active={activeTab === 'updates'} onClick={() => setActiveTab('updates')} badge={updates.length > 0 ? updates.length : undefined}>
              <ArrowUpCircle className="w-4 h-4" />
              Updates
            </TabButton>
          </div>

          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={cn("w-4 h-4 text-white/70", loading && "animate-spin")} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {error ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <div className="text-red-400 mb-2">Failed to load apps</div>
              <div className="text-white/50 text-sm mb-4">{error}</div>
              <button onClick={handleRefresh} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white text-sm transition-colors">
                Try Again
              </button>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <RefreshCw className="w-8 h-8 text-white/50 animate-spin mb-4" />
              <div className="text-white/50">Loading apps...</div>
            </div>
          ) : (
            <>
              {activeTab === 'discover' && (
                <DiscoverTab
                  appOfTheDay={appOfTheDay}
                  featuredApps={featuredApps}
                  editorChoice={editorChoice}
                  trendingApps={trendingApps}
                  topFreeApps={topFreeApps}
                  installing={installing}
                  onInstall={handleInstall}
                  onSelectApp={setSelectedApp}
                  onSelectCategory={setSelectedCategory}
                  isInstalled={isInstalled}
                />
              )}
              {activeTab === 'categories' && (
                <CategoriesTab apps={availableApps} onSelectCategory={setSelectedCategory} />
              )}
              {activeTab === 'search' && (
                <SearchTab
                  apps={filteredApps}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  searchCategory={searchCategory}
                  setSearchCategory={setSearchCategory}
                  searchSort={searchSort}
                  setSearchSort={setSearchSort}
                  installing={installing}
                  onInstall={handleInstall}
                  onSelectApp={setSelectedApp}
                  isInstalled={isInstalled}
                />
              )}
              {activeTab === 'account' && (
                <AccountTab
                  installedApps={installedApps}
                  wishlistApps={wishlistApps}
                  getAppById={getAppById}
                  onSelectApp={setSelectedApp}
                  onInstall={handleInstall}
                  installing={installing}
                />
              )}
              {activeTab === 'updates' && (
                <UpdatesTab
                  updates={updates}
                  installing={installing}
                  autoUpdateEnabled={autoUpdateEnabled}
                  onUpdate={handleUpdate}
                  onUpdateAll={handleUpdateAll}
                  onToggleAutoUpdate={handleToggleAutoUpdate}
                />
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-white/10 text-xs text-white/40">
          <span>
            Apps from{' '}
            <a href="https://github.com/zos-apps" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
              github.com/zos-apps
            </a>
          </span>
          <span>{availableApps.length} apps available</span>
        </div>
      </div>
    </ZWindow>
  );
};

// ============================================================================
// Tab Button Component
// ============================================================================

const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  badge?: number;
}> = ({ active, onClick, children, badge }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors relative",
      active ? "bg-white/10 text-white" : "text-white/60 hover:text-white hover:bg-white/5"
    )}
  >
    {children}
    {badge !== undefined && badge > 0 && (
      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">
        {badge}
      </span>
    )}
  </button>
);

// ============================================================================
// Discover Tab
// ============================================================================

const DiscoverTab: React.FC<{
  appOfTheDay: ExtendedAppManifest | null;
  featuredApps: ExtendedAppManifest[];
  editorChoice: ExtendedAppManifest[];
  trendingApps: ExtendedAppManifest[];
  topFreeApps: ExtendedAppManifest[];
  installing: string | null;
  onInstall: (app: AppManifest) => void;
  onSelectApp: (app: ExtendedAppManifest) => void;
  onSelectCategory: (cat: AppCategory) => void;
  isInstalled: (id: string) => boolean;
}> = ({ appOfTheDay, featuredApps, editorChoice, trendingApps, topFreeApps, installing, onInstall, onSelectApp, onSelectCategory, isInstalled }) => {
  return (
    <div className="p-4 space-y-8">
      {/* App of the Day */}
      {appOfTheDay && (
        <section>
          <div className="text-xs text-blue-400 uppercase tracking-wide mb-2">App of the Day</div>
          <div
            className={cn("relative rounded-2xl overflow-hidden cursor-pointer bg-gradient-to-br", categoryGradients[appOfTheDay.category || 'other'])}
            onClick={() => onSelectApp(appOfTheDay)}
          >
            <div className="p-6 flex items-center gap-6">
              <AppIcon category={appOfTheDay.category} icon={appOfTheDay.icon} name={appOfTheDay.name} size="xl" />
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white">{appOfTheDay.name}</h2>
                <p className="text-white/80 mt-1">{appOfTheDay.description}</p>
                <div className="flex items-center gap-4 mt-3">
                  <RatingStars rating={appOfTheDay.rating || 0} />
                  <span className="text-white/60 text-sm">{formatNumber(appOfTheDay.downloads || 0)} downloads</span>
                </div>
              </div>
              {isInstalled(appOfTheDay.identifier) ? (
                <div className="flex items-center gap-1 text-white/80 text-sm bg-white/20 px-4 py-2 rounded-full">
                  <Check className="w-4 h-4" />
                  Installed
                </div>
              ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); onInstall(appOfTheDay); }}
                  disabled={installing === appOfTheDay.identifier}
                  className="flex items-center gap-2 px-6 py-2 bg-white text-gray-900 rounded-full font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
                >
                  {installing === appOfTheDay.identifier ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Get
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Featured Apps Carousel */}
      {featuredApps.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            Featured Apps
          </h2>
          <AppCarousel apps={featuredApps} installing={installing} onInstall={onInstall} onSelectApp={onSelectApp} isInstalled={isInstalled} />
        </section>
      )}

      {/* Editor's Choice */}
      {editorChoice.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Crown className="w-5 h-5 text-purple-400" />
            Editor's Choice
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {editorChoice.slice(0, 4).map(app => (
              <AppCard key={app.identifier} app={app} installed={isInstalled(app.identifier)} installing={installing === app.identifier} onInstall={() => onInstall(app)} onClick={() => onSelectApp(app)} />
            ))}
          </div>
        </section>
      )}

      {/* Trending Apps */}
      {trendingApps.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Trending
          </h2>
          <AppCarousel apps={trendingApps} installing={installing} onInstall={onInstall} onSelectApp={onSelectApp} isInstalled={isInstalled} />
        </section>
      )}

      {/* Top Charts */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">Top Charts - Free</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {topFreeApps.slice(0, 6).map((app, index) => (
            <TopChartItem key={app.identifier} app={app} rank={index + 1} installed={isInstalled(app.identifier)} installing={installing === app.identifier} onInstall={() => onInstall(app)} onClick={() => onSelectApp(app)} />
          ))}
        </div>
      </section>

      {/* Quick Categories */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">Browse by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(Object.keys(CATEGORY_INFO) as AppCategory[]).map(cat => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={cn("flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br transition-transform hover:scale-105", CATEGORY_INFO[cat].color)}
            >
              {CATEGORY_INFO[cat].icon}
              <span className="font-medium text-white">{CATEGORY_INFO[cat].name}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

// ============================================================================
// Categories Tab
// ============================================================================

const CategoriesTab: React.FC<{
  apps: ExtendedAppManifest[];
  onSelectCategory: (cat: AppCategory) => void;
}> = ({ apps, onSelectCategory }) => {
  const categoryCounts = useMemo(() => {
    const counts: Record<AppCategory, number> = { productivity: 0, utilities: 0, entertainment: 0, communication: 0, development: 0, finance: 0, system: 0, other: 0 };
    apps.forEach(app => { if (app.category) counts[app.category]++; });
    return counts;
  }, [apps]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Categories</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(Object.keys(CATEGORY_INFO) as AppCategory[]).map(cat => (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={cn("flex items-center gap-4 p-5 rounded-xl bg-gradient-to-br transition-all hover:scale-[1.02] hover:shadow-lg", CATEGORY_INFO[cat].color)}
          >
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">{CATEGORY_INFO[cat].icon}</div>
            <div className="flex-1 text-left">
              <div className="font-semibold text-white text-lg">{CATEGORY_INFO[cat].name}</div>
              <div className="text-white/70 text-sm">{categoryCounts[cat]} apps</div>
            </div>
            <ChevronRight className="w-5 h-5 text-white/60" />
          </button>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// Category View
// ============================================================================

const CategoryView: React.FC<{
  category: AppCategory;
  apps: ExtendedAppManifest[];
  installing: string | null;
  onInstall: (app: AppManifest) => void;
  onSelectApp: (app: ExtendedAppManifest) => void;
  onBack: () => void;
  isInstalled: (id: string) => boolean;
}> = ({ category, apps, installing, onInstall, onSelectApp, onBack, isInstalled }) => {
  return (
    <div className="flex flex-col h-full bg-gray-900/95">
      <div className={cn("p-6 bg-gradient-to-r", CATEGORY_INFO[category].color)}>
        <button onClick={onBack} className="flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors">
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">{CATEGORY_INFO[category].icon}</div>
          <div>
            <h1 className="text-3xl font-bold text-white">{CATEGORY_INFO[category].name}</h1>
            <p className="text-white/70">{apps.length} apps</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {apps.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-white/50">
            <Package className="w-12 h-12 mb-4 opacity-50" />
            <div>No apps in this category</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {apps.map(app => (
              <AppCard key={app.identifier} app={app} installed={isInstalled(app.identifier)} installing={installing === app.identifier} onInstall={() => onInstall(app)} onClick={() => onSelectApp(app)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// Search Tab
// ============================================================================

const SearchTab: React.FC<{
  apps: ExtendedAppManifest[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchCategory: AppCategory | 'all';
  setSearchCategory: (c: AppCategory | 'all') => void;
  searchSort: 'relevance' | 'rating' | 'downloads';
  setSearchSort: (s: 'relevance' | 'rating' | 'downloads') => void;
  installing: string | null;
  onInstall: (app: AppManifest) => void;
  onSelectApp: (app: ExtendedAppManifest) => void;
  isInstalled: (id: string) => boolean;
}> = ({ apps, searchQuery, setSearchQuery, searchCategory, setSearchCategory, searchSort, setSearchSort, installing, onInstall, onSelectApp, isInstalled }) => {
  const suggestions = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    const query = searchQuery.toLowerCase();
    return apps.filter(app => app.name.toLowerCase().includes(query)).slice(0, 5).map(app => app.name);
  }, [apps, searchQuery]);

  return (
    <div className="p-4 space-y-4">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
        <input
          type="text"
          placeholder="Search apps..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500/50 transition-colors"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
            <X className="w-5 h-5" />
          </button>
        )}
        {suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-white/10 rounded-xl overflow-hidden z-10">
            {suggestions.map(suggestion => (
              <button key={suggestion} onClick={() => setSearchQuery(suggestion)} className="w-full px-4 py-2 text-left text-white/80 hover:bg-white/10 transition-colors">
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <select value={searchCategory} onChange={(e) => setSearchCategory(e.target.value as AppCategory | 'all')} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50">
          <option value="all">All Categories</option>
          {(Object.keys(CATEGORY_INFO) as AppCategory[]).map(cat => (<option key={cat} value={cat}>{CATEGORY_INFO[cat].name}</option>))}
        </select>
        <select value={searchSort} onChange={(e) => setSearchSort(e.target.value as 'relevance' | 'rating' | 'downloads')} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50">
          <option value="relevance">Sort by Relevance</option>
          <option value="rating">Sort by Rating</option>
          <option value="downloads">Sort by Downloads</option>
        </select>
      </div>

      <div className="text-white/50 text-sm">{apps.length} {apps.length === 1 ? 'result' : 'results'}</div>

      {apps.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-white/50">
          <Search className="w-12 h-12 mb-4 opacity-50" />
          <div>No apps found</div>
          <div className="text-sm mt-2">Try a different search term</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {apps.map(app => (
            <AppCard key={app.identifier} app={app} installed={isInstalled(app.identifier)} installing={installing === app.identifier} onInstall={() => onInstall(app)} onClick={() => onSelectApp(app)} />
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Account Tab
// ============================================================================

const AccountTab: React.FC<{
  installedApps: InstalledApp[];
  wishlistApps: ExtendedAppManifest[];
  getAppById: (id: string) => ExtendedAppManifest | undefined;
  onSelectApp: (app: ExtendedAppManifest) => void;
  onInstall: (app: AppManifest) => void;
  installing: string | null;
}> = ({ installedApps, wishlistApps, getAppById, onSelectApp, onInstall, installing }) => {
  const [redeemCode, setRedeemCode] = useState('');
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null);
  const [, forceUpdate] = useState({});

  const purchasedApps = useMemo(() => {
    return installedApps.filter(app => app.source !== 'builtin').map(app => getAppById(app.identifier)).filter((app): app is ExtendedAppManifest => !!app);
  }, [installedApps, getAppById]);

  const handleRedeem = useCallback(() => {
    const code = redeemCode.toUpperCase().trim();
    setRedeemError(null);
    setRedeemSuccess(null);

    if (!code) { setRedeemError('Please enter a code'); return; }
    const redeemed = getRedeemedCodes();
    if (redeemed.includes(code)) { setRedeemError('This code has already been redeemed'); return; }
    const validCode = VALID_REDEEM_CODES[code];
    if (!validCode) { setRedeemError('Invalid code'); return; }

    saveRedeemedCode(code);
    setRedeemSuccess(`Successfully redeemed: ${validCode.name}`);
    setRedeemCode('');
  }, [redeemCode]);

  const handleRemoveFromWishlist = useCallback((appId: string) => {
    toggleWishlist(appId);
    forceUpdate({});
  }, []);

  return (
    <div className="p-6 space-y-8">
      <section>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Check className="w-5 h-5 text-green-400" />
          Purchased Apps
        </h2>
        {purchasedApps.length === 0 ? (
          <div className="text-white/50 text-center py-8">No purchased apps yet</div>
        ) : (
          <div className="space-y-2">
            {purchasedApps.map(app => (
              <div key={app.identifier} className="flex items-center gap-4 p-3 bg-white/5 rounded-xl hover:bg-white/10 cursor-pointer transition-colors" onClick={() => onSelectApp(app)}>
                <AppIcon category={app.category} icon={app.icon} name={app.name} size="md" />
                <div className="flex-1">
                  <div className="font-medium text-white">{app.name}</div>
                  <div className="text-sm text-white/50">{app.category}</div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/40" />
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Heart className="w-5 h-5 text-pink-400" />
          Wish List
        </h2>
        {wishlistApps.length === 0 ? (
          <div className="text-white/50 text-center py-8">Your wish list is empty</div>
        ) : (
          <div className="space-y-2">
            {wishlistApps.map(app => (
              <div key={app.identifier} className="flex items-center gap-4 p-3 bg-white/5 rounded-xl">
                <div className="flex items-center gap-4 flex-1 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => onSelectApp(app)}>
                  <AppIcon category={app.category} icon={app.icon} name={app.name} size="md" />
                  <div className="flex-1">
                    <div className="font-medium text-white">{app.name}</div>
                    <div className="text-sm text-white/50">{app.description}</div>
                  </div>
                </div>
                <button onClick={() => onInstall(app)} disabled={installing === app.identifier} className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 rounded-lg text-white text-sm transition-colors">
                  {installing === app.identifier ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                  Get
                </button>
                <button onClick={() => handleRemoveFromWishlist(app.identifier)} className="p-2 text-white/40 hover:text-red-400 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Gift className="w-5 h-5 text-yellow-400" />
          Redeem Code
        </h2>
        <div className="flex gap-3">
          <input type="text" placeholder="Enter code" value={redeemCode} onChange={(e) => setRedeemCode(e.target.value.toUpperCase())} className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500/50 uppercase" />
          <button onClick={handleRedeem} className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-medium transition-colors">Redeem</button>
        </div>
        {redeemError && <div className="mt-2 text-red-400 text-sm">{redeemError}</div>}
        {redeemSuccess && <div className="mt-2 text-green-400 text-sm">{redeemSuccess}</div>}
        <div className="mt-3 text-white/40 text-xs">Try: WELCOME2024, FOCUS-FREE, DESIGN-PLUS</div>
      </section>
    </div>
  );
};

// ============================================================================
// Updates Tab
// ============================================================================

const UpdatesTab: React.FC<{
  updates: AppUpdate[];
  installing: string | null;
  autoUpdateEnabled: boolean;
  onUpdate: (update: AppUpdate) => void;
  onUpdateAll: () => void;
  onToggleAutoUpdate: () => void;
}> = ({ updates, installing, autoUpdateEnabled, onUpdate, onUpdateAll, onToggleAutoUpdate }) => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
        <div>
          <div className="font-medium text-white">Automatic Updates</div>
          <div className="text-sm text-white/50">Keep apps up to date automatically</div>
        </div>
        <button onClick={onToggleAutoUpdate} className={cn("w-12 h-6 rounded-full transition-colors relative", autoUpdateEnabled ? "bg-green-500" : "bg-white/20")}>
          <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-transform", autoUpdateEnabled ? "left-7" : "left-1")} />
        </button>
      </div>

      {updates.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-white/50">
          <Check className="w-12 h-12 mb-4 opacity-50" />
          <div>All apps are up to date</div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">{updates.length} Update{updates.length > 1 ? 's' : ''} Available</h2>
            <button onClick={onUpdateAll} disabled={installing !== null} className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 rounded-lg text-white text-sm transition-colors">
              <ArrowUpCircle className="w-4 h-4" />
              Update All
            </button>
          </div>

          <div className="space-y-3">
            {updates.map((update) => {
              const isUpdating = installing === update.identifier;
              return (
                <div key={update.identifier} className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl">
                  <AppIcon category={update.app.category} icon={update.app.icon} name={update.app.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white">{update.app.name}</h3>
                    <p className="text-sm text-white/50">{update.currentVersion} → {update.latestVersion}</p>
                  </div>
                  <button onClick={() => onUpdate(update)} disabled={isUpdating} className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 rounded-lg text-white text-sm transition-colors">
                    {isUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowUpCircle className="w-4 h-4" />}
                    {isUpdating ? 'Updating...' : 'Update'}
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

// ============================================================================
// App Detail View
// ============================================================================

const AppDetailView: React.FC<{
  app: ExtendedAppManifest;
  isInstalled: boolean;
  installedVersion?: string;
  installing: boolean;
  onInstall: () => void;
  onUninstall: () => void;
  onBack: () => void;
}> = ({ app, isInstalled, installedVersion, installing, onInstall, onUninstall, onBack }) => {
  const [inWishlist, setInWishlist] = useState(isInWishlist(app.identifier));
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewContent, setReviewContent] = useState('');
  const [screenshotIndex, setScreenshotIndex] = useState(0);

  const reviews = useMemo(() => getReviews().filter(r => r.appId === app.identifier), [app.identifier]);

  const handleToggleWishlist = useCallback(() => {
    const newState = toggleWishlist(app.identifier);
    setInWishlist(newState);
  }, [app.identifier]);

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({ title: app.name, text: app.description, url: app.repository || window.location.href });
    } else {
      navigator.clipboard.writeText(app.repository || window.location.href);
    }
  }, [app]);

  const handleSubmitReview = useCallback(() => {
    const review: AppReview = {
      id: `review-${Date.now()}`,
      appId: app.identifier,
      userId: 'user-1',
      userName: 'You',
      rating: reviewRating,
      title: reviewTitle,
      content: reviewContent,
      date: new Date().toISOString(),
      helpful: 0,
    };
    saveReview(review);
    setShowReviewForm(false);
    setReviewTitle('');
    setReviewContent('');
  }, [app.identifier, reviewRating, reviewTitle, reviewContent]);

  const screenshots = app.screenshots || [];

  return (
    <div className="flex flex-col h-full bg-gray-900/95">
      <div className="p-6 border-b border-white/10">
        <button onClick={onBack} className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4 transition-colors">
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>

        <div className="flex items-start gap-6">
          <AppIcon category={app.category} icon={app.icon} name={app.name} size="xl" />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{app.name}</h1>
            <p className="text-white/60">{CATEGORY_INFO[app.category || 'other'].name}</p>
            <div className="flex items-center gap-4 mt-3">
              <RatingStars rating={app.rating || 0} size="lg" />
              <span className="text-white/50 text-sm">{app.ratingCount ? `${formatNumber(app.ratingCount)} ratings` : 'No ratings yet'}</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {isInstalled ? (
              <button onClick={onUninstall} className="flex items-center justify-center gap-2 px-6 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-full font-medium transition-colors">
                <Trash2 className="w-4 h-4" />
                Uninstall
              </button>
            ) : (
              <button onClick={onInstall} disabled={installing} className="flex items-center justify-center gap-2 px-8 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 rounded-full text-white font-medium transition-colors min-w-[120px]">
                {installing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {installing ? 'Installing...' : app.price ? `$${app.price}` : 'Get'}
              </button>
            )}
            <div className="flex gap-2">
              <button onClick={handleToggleWishlist} className={cn("p-2 rounded-lg transition-colors", inWishlist ? "bg-pink-500/20 text-pink-400" : "bg-white/10 text-white/60 hover:text-white")} title={inWishlist ? "Remove from Wish List" : "Add to Wish List"}>
                <Heart className={cn("w-5 h-5", inWishlist && "fill-current")} />
              </button>
              <button onClick={handleShare} className="p-2 rounded-lg bg-white/10 text-white/60 hover:text-white transition-colors" title="Share">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {screenshots.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-white mb-4">Screenshots</h2>
            <div className="relative">
              <div className="flex gap-4 overflow-x-auto pb-4">
                {screenshots.map((screenshot, index) => (
                  <div key={index} className={cn("flex-shrink-0 rounded-xl overflow-hidden cursor-pointer transition-all", index === screenshotIndex ? "ring-2 ring-blue-500" : "opacity-70 hover:opacity-100")} onClick={() => setScreenshotIndex(index)}>
                    <img src={screenshot.url} alt={screenshot.caption} className="w-64 h-40 object-cover" />
                  </div>
                ))}
              </div>
              {screenshots[screenshotIndex]?.caption && <p className="text-center text-white/50 text-sm mt-2">{screenshots[screenshotIndex].caption}</p>}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">Description</h2>
          <p className="text-white/70 leading-relaxed">{app.description || 'No description available.'}</p>
        </section>

        {app.whatsNew && (
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">What's New</h2>
            <div className="text-white/50 text-sm mb-2">Version {app.version}</div>
            <p className="text-white/70 leading-relaxed">{app.whatsNew}</p>
          </section>
        )}

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Ratings & Reviews</h2>
            {isInstalled && !showReviewForm && (
              <button onClick={() => setShowReviewForm(true)} className="text-blue-400 hover:text-blue-300 text-sm">Write a Review</button>
            )}
          </div>

          {showReviewForm && (
            <div className="bg-white/5 rounded-xl p-4 mb-4 space-y-4">
              <div>
                <label className="block text-white/70 text-sm mb-2">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button key={star} onClick={() => setReviewRating(star)} className="text-2xl">
                      <Star className={cn("w-6 h-6", star <= reviewRating ? "text-yellow-400 fill-yellow-400" : "text-white/30")} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-2">Title</label>
                <input type="text" value={reviewTitle} onChange={(e) => setReviewTitle(e.target.value)} placeholder="Summary of your review" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500/50" />
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-2">Review</label>
                <textarea value={reviewContent} onChange={(e) => setReviewContent(e.target.value)} placeholder="Write your review..." rows={4} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500/50 resize-none" />
              </div>
              <div className="flex gap-2">
                <button onClick={handleSubmitReview} disabled={!reviewTitle || !reviewContent} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 rounded-lg text-white text-sm transition-colors">Submit</button>
                <button onClick={() => setShowReviewForm(false)} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors">Cancel</button>
              </div>
            </div>
          )}

          {reviews.length === 0 ? (
            <div className="text-center text-white/50 py-8">No reviews yet. Be the first to review!</div>
          ) : (
            <div className="space-y-4">
              {reviews.map(review => (
                <div key={review.id} className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <RatingStars rating={review.rating} size="sm" />
                      <span className="font-medium text-white">{review.title}</span>
                    </div>
                    <span className="text-white/40 text-xs">{formatDate(review.date)}</span>
                  </div>
                  <p className="text-white/70 text-sm">{review.content}</p>
                  <div className="mt-2 text-white/40 text-xs">{review.userName}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <InfoItem label="Version" value={app.version} />
            {installedVersion && installedVersion !== app.version && <InfoItem label="Installed Version" value={installedVersion} />}
            <InfoItem label="Size" value={app.size || 'Unknown'} />
            <InfoItem label="Age Rating" value={app.ageRating || '4+'} />
            <InfoItem label="Category" value={CATEGORY_INFO[app.category || 'other'].name} />
            <InfoItem label="Downloads" value={formatNumber(app.downloads || 0)} />
            <InfoItem label="Languages" value={app.languages?.join(', ') || 'English'} />
            {app.repository && (
              <a href={app.repository} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-400 hover:underline">
                <ExternalLink className="w-4 h-4" />
                View Source
              </a>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-400" />
            Privacy
          </h2>
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-white/70 text-sm">This app may collect the following data types:</p>
            <ul className="mt-2 space-y-1 text-white/50 text-sm">
              <li>- Usage data for analytics</li>
              <li>- Identifiers for crash reporting</li>
            </ul>
            <p className="mt-4 text-white/40 text-xs">Data is not linked to your identity and is used to improve the app experience.</p>
          </div>
        </section>

        <section className="flex justify-center pb-4">
          <button className="flex items-center gap-2 text-white/40 hover:text-white/60 text-sm transition-colors">
            <Flag className="w-4 h-4" />
            Report a Problem
          </button>
        </section>
      </div>
    </div>
  );
};

// ============================================================================
// Supporting Components
// ============================================================================

const AppIcon: React.FC<{ category?: AppCategory; icon?: string; name: string; size?: 'sm' | 'md' | 'lg' | 'xl' }> = ({ category = 'other', icon, name, size = 'sm' }) => {
  const gradient = categoryGradients[category] || categoryGradients.other;
  const sizeClasses = { sm: 'w-10 h-10', md: 'w-12 h-12', lg: 'w-16 h-16', xl: 'w-20 h-20' };
  const textSizeClasses = { sm: 'text-xl', md: 'text-2xl', lg: 'text-3xl', xl: 'text-4xl' };

  return (
    <div className={cn("flex items-center justify-center rounded-xl bg-gradient-to-br flex-shrink-0", gradient, sizeClasses[size])}>
      {icon ? <span className={textSizeClasses[size]}>{icon}</span> : <span className={cn("font-bold text-white", size === 'xl' ? 'text-2xl' : size === 'lg' ? 'text-xl' : 'text-base')}>{name.charAt(0).toUpperCase()}</span>}
    </div>
  );
};

const RatingStars: React.FC<{ rating: number; size?: 'sm' | 'md' | 'lg' }> = ({ rating, size = 'md' }) => {
  const sizeClasses = { sm: 'w-3 h-3', md: 'w-4 h-4', lg: 'w-5 h-5' };
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <Star key={star} className={cn(sizeClasses[size], star <= Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-white/30")} />
      ))}
      <span className="ml-1 text-white/60 text-sm">{rating.toFixed(1)}</span>
    </div>
  );
};

const AppCard: React.FC<{ app: ExtendedAppManifest; installed: boolean; installing: boolean; onInstall: () => void; onClick: () => void }> = ({ app, installed, installing, onInstall, onClick }) => (
  <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors cursor-pointer" onClick={onClick}>
    <div className="flex items-start gap-3">
      <AppIcon category={app.category} icon={app.icon} name={app.name} />
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-white truncate">{app.name}</h3>
        <p className="text-xs text-white/50 truncate">{CATEGORY_INFO[app.category || 'other'].name}</p>
      </div>
    </div>
    <p className="mt-3 text-sm text-white/70 line-clamp-2">{app.description || 'No description available'}</p>
    <div className="mt-3 flex items-center gap-2">
      <RatingStars rating={app.rating || 0} size="sm" />
      {app.downloads && <span className="text-white/40 text-xs">{formatNumber(app.downloads)}</span>}
    </div>
    <div className="mt-4 flex items-center justify-between">
      <span className="text-xs text-white/40">v{app.version}</span>
      {installed ? (
        <div className="flex items-center gap-1 text-green-400 text-xs"><Check className="w-4 h-4" />Installed</div>
      ) : (
        <button onClick={(e) => { e.stopPropagation(); onInstall(); }} disabled={installing} className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 rounded-lg text-white text-xs transition-colors">
          {installing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
          {installing ? 'Installing...' : app.price ? `$${app.price}` : 'Get'}
        </button>
      )}
    </div>
  </div>
);

const AppCarousel: React.FC<{ apps: ExtendedAppManifest[]; installing: string | null; onInstall: (app: AppManifest) => void; onSelectApp: (app: ExtendedAppManifest) => void; isInstalled: (id: string) => boolean }> = ({ apps, installing, onInstall, onSelectApp, isInstalled }) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    const container = containerRef.current;
    if (!container) return;
    const scrollAmount = 300;
    const newPosition = direction === 'left' ? Math.max(0, scrollPosition - scrollAmount) : scrollPosition + scrollAmount;
    container.scrollTo({ left: newPosition, behavior: 'smooth' });
    setScrollPosition(newPosition);
  };

  return (
    <div className="relative group">
      <button onClick={() => scroll('left')} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-gray-800/80 rounded-full flex items-center justify-center text-white/70 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
        <ChevronLeft className="w-5 h-5" />
      </button>
      <div ref={containerRef} className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide" onScroll={(e) => setScrollPosition(e.currentTarget.scrollLeft)}>
        {apps.map(app => (
          <div key={app.identifier} className="flex-shrink-0 w-64 bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => onSelectApp(app)}>
            <div className="flex items-center gap-3">
              <AppIcon category={app.category} icon={app.icon} name={app.name} size="md" />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-white truncate">{app.name}</h3>
                <RatingStars rating={app.rating || 0} size="sm" />
              </div>
            </div>
            <p className="mt-2 text-sm text-white/50 line-clamp-2">{app.description}</p>
            <div className="mt-3">
              {isInstalled(app.identifier) ? (
                <span className="text-green-400 text-xs flex items-center gap-1"><Check className="w-3 h-3" />Installed</span>
              ) : (
                <button onClick={(e) => { e.stopPropagation(); onInstall(app); }} disabled={installing === app.identifier} className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                  {installing === app.identifier ? 'Installing...' : 'Get'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => scroll('right')} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-gray-800/80 rounded-full flex items-center justify-center text-white/70 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

const TopChartItem: React.FC<{ app: ExtendedAppManifest; rank: number; installed: boolean; installing: boolean; onInstall: () => void; onClick: () => void }> = ({ app, rank, installed, installing, onInstall, onClick }) => (
  <div className="flex items-center gap-4 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer" onClick={onClick}>
    <span className="text-2xl font-bold text-white/30 w-8">{rank}</span>
    <AppIcon category={app.category} icon={app.icon} name={app.name} size="md" />
    <div className="flex-1 min-w-0">
      <h3 className="font-medium text-white truncate">{app.name}</h3>
      <div className="flex items-center gap-2"><RatingStars rating={app.rating || 0} size="sm" /></div>
    </div>
    {installed ? (
      <span className="text-green-400 text-xs"><Check className="w-4 h-4" /></span>
    ) : (
      <button onClick={(e) => { e.stopPropagation(); onInstall(); }} disabled={installing} className="text-blue-400 hover:text-blue-300 text-sm font-medium">
        {installing ? '...' : 'Get'}
      </button>
    )}
  </div>
);

const InfoItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <div className="text-white/40 text-xs">{label}</div>
    <div className="text-white font-medium">{value}</div>
  </div>
);

export default ZAppStoreWindow;
