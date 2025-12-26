/**
 * zOS App Loader Service
 *
 * Handles fetching, installing, and loading apps from the zos-apps GitHub organization.
 * Apps can be dynamically loaded at runtime from GitHub.
 */

// Types for app management
export interface AppManifest {
  identifier: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  category?: AppCategory;
  icon?: string; // Emoji icon from zos.icon in package.json
  permissions?: string[];
  repository?: string;
  homepage?: string;
}

export type AppCategory =
  | 'productivity'
  | 'development'
  | 'utilities'
  | 'entertainment'
  | 'communication'
  | 'finance'
  | 'system'
  | 'other';

export interface InstalledApp extends AppManifest {
  installedAt: Date;
  updatedAt?: Date;
  source: 'builtin' | 'zos-apps' | 'external';
  enabled: boolean;
}

export interface AppUpdate {
  identifier: string;
  currentVersion: string;
  latestVersion: string;
  app: AppManifest;
}

// GitHub API response types
interface GitHubRepo {
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  default_branch: string;
}

interface GitHubContent {
  content: string;
  encoding: string;
}

// Storage keys
const STORAGE_KEY = 'zos:apps:installed';
const CACHE_KEY = 'zos:apps:cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Category to gradient mapping
export const categoryGradients: Record<AppCategory, string> = {
  productivity: 'from-blue-500 to-cyan-500',
  development: 'from-purple-500 to-pink-500',
  utilities: 'from-gray-500 to-gray-600',
  entertainment: 'from-pink-500 to-rose-500',
  communication: 'from-green-500 to-emerald-500',
  finance: 'from-yellow-500 to-orange-500',
  system: 'from-slate-500 to-slate-600',
  other: 'from-indigo-500 to-purple-500',
};

/**
 * Fetch available apps from the zos-apps GitHub organization
 */
export async function fetchAvailableApps(): Promise<AppManifest[]> {
  // Check cache first
  const cached = getCachedApps();
  if (cached) return cached;

  try {
    // Fetch all repos from zos-apps org
    const response = await fetch(
      'https://api.github.com/orgs/zos-apps/repos?per_page=100&sort=updated'
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const repos: GitHubRepo[] = await response.json();

    // Filter out template repo and fetch manifests
    const appRepos = repos.filter(r => r.name !== 'template' && r.name !== '.github');

    const apps = await Promise.all(
      appRepos.map(async (repo) => {
        try {
          return await fetchAppManifest(repo);
        } catch {
          // If we can't fetch manifest, create one from repo info
          return createManifestFromRepo(repo);
        }
      })
    );

    // Cache the results
    setCachedApps(apps);

    return apps;
  } catch (error) {
    console.error('Failed to fetch apps:', error);
    throw error;
  }
}

/**
 * Fetch app manifest from package.json
 */
async function fetchAppManifest(repo: GitHubRepo): Promise<AppManifest> {
  const response = await fetch(
    `https://api.github.com/repos/${repo.full_name}/contents/package.json`
  );

  if (!response.ok) {
    throw new Error('No package.json found');
  }

  const data: GitHubContent = await response.json();
  const content = atob(data.content);
  const pkg = JSON.parse(content);

  // Extract zos config from package.json
  const zosConfig = pkg.zos || {};

  return {
    identifier: zosConfig.identifier || `apps.zos.${repo.name}`,
    name: zosConfig.name || pkg.name || repo.name,
    version: pkg.version || '1.0.0',
    description: zosConfig.description || pkg.description || repo.description,
    author: zosConfig.author || pkg.author,
    category: zosConfig.category || 'other',
    icon: zosConfig.icon,
    permissions: zosConfig.permissions || [],
    repository: repo.html_url,
    homepage: pkg.homepage,
  };
}

/**
 * Create a basic manifest from repo info when package.json isn't available
 */
function createManifestFromRepo(repo: GitHubRepo): AppManifest {
  return {
    identifier: `apps.zos.${repo.name}`,
    name: repo.name.charAt(0).toUpperCase() + repo.name.slice(1).replace(/-/g, ' '),
    version: '1.0.0',
    description: repo.description || `${repo.name} app for zOS`,
    category: 'other',
    repository: repo.html_url,
  };
}

/**
 * Get installed apps from localStorage
 */
export function getInstalledApps(): InstalledApp[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return getBuiltinApps();

    const apps = JSON.parse(stored);
    // Merge with builtin apps
    const builtins = getBuiltinApps();
    const installedIds = new Set(apps.map((a: InstalledApp) => a.identifier));

    return [
      ...builtins.filter(b => !installedIds.has(b.identifier)),
      ...apps.map((a: InstalledApp) => ({
        ...a,
        installedAt: new Date(a.installedAt),
        updatedAt: a.updatedAt ? new Date(a.updatedAt) : undefined,
      })),
    ];
  } catch {
    return getBuiltinApps();
  }
}

/**
 * Save installed apps to localStorage
 */
export function saveInstalledApps(apps: InstalledApp[]): void {
  // Filter out builtin apps from storage
  const toStore = apps.filter(a => a.source !== 'builtin');
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));

  // Dispatch event for other components
  window.dispatchEvent(new CustomEvent('zos:apps-updated', { detail: apps }));
}

/**
 * Install an app
 */
export function installApp(manifest: AppManifest): InstalledApp {
  const apps = getInstalledApps();

  const installed: InstalledApp = {
    ...manifest,
    installedAt: new Date(),
    source: 'zos-apps',
    enabled: true,
  };

  // Remove existing version if present
  const filtered = apps.filter(a => a.identifier !== manifest.identifier);
  saveInstalledApps([...filtered, installed]);

  // Dispatch install event
  window.dispatchEvent(new CustomEvent('zos:app-installed', { detail: installed }));

  return installed;
}

/**
 * Uninstall an app
 */
export function uninstallApp(identifier: string): void {
  const apps = getInstalledApps();
  const app = apps.find(a => a.identifier === identifier);

  if (app?.source === 'builtin') {
    throw new Error('Cannot uninstall builtin apps');
  }

  const filtered = apps.filter(a => a.identifier !== identifier);
  saveInstalledApps(filtered);

  // Dispatch uninstall event
  window.dispatchEvent(new CustomEvent('zos:app-uninstalled', { detail: identifier }));
}

/**
 * Update an app
 */
export function updateApp(manifest: AppManifest): InstalledApp {
  const apps = getInstalledApps();
  const existing = apps.find(a => a.identifier === manifest.identifier);

  if (!existing) {
    throw new Error('App not installed');
  }

  const updated: InstalledApp = {
    ...existing,
    ...manifest,
    updatedAt: new Date(),
  };

  const filtered = apps.filter(a => a.identifier !== manifest.identifier);
  saveInstalledApps([...filtered, updated]);

  // Dispatch update event
  window.dispatchEvent(new CustomEvent('zos:app-updated', { detail: updated }));

  return updated;
}

/**
 * Check for app updates
 */
export async function checkForUpdates(): Promise<AppUpdate[]> {
  const installed = getInstalledApps();
  const available = await fetchAvailableApps();

  const updates: AppUpdate[] = [];

  for (const app of installed) {
    if (app.source === 'builtin') continue;

    const latest = available.find(a => a.identifier === app.identifier);
    if (latest && compareVersions(latest.version, app.version) > 0) {
      updates.push({
        identifier: app.identifier,
        currentVersion: app.version,
        latestVersion: latest.version,
        app: latest,
      });
    }
  }

  return updates;
}

/**
 * Compare semantic versions
 */
export function compareVersions(a: string, b: string): number {
  const partsA = a.split('.').map(Number);
  const partsB = b.split('.').map(Number);

  for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
    const numA = partsA[i] || 0;
    const numB = partsB[i] || 0;
    if (numA > numB) return 1;
    if (numA < numB) return -1;
  }

  return 0;
}

/**
 * Get builtin apps (always available)
 */
function getBuiltinApps(): InstalledApp[] {
  const builtins: InstalledApp[] = [
    {
      identifier: 'apps.zos.finder',
      name: 'Finder',
      version: '1.0.0',
      description: 'File manager',
      category: 'system',
      icon: '📁',
      installedAt: new Date(0),
      source: 'builtin',
      enabled: true,
    },
    {
      identifier: 'apps.zos.terminal',
      name: 'Terminal',
      version: '1.0.0',
      description: 'Command line interface',
      category: 'development',
      icon: '💻',
      installedAt: new Date(0),
      source: 'builtin',
      enabled: true,
    },
    {
      identifier: 'apps.zos.safari',
      name: 'Safari',
      version: '1.0.0',
      description: 'Web browser',
      category: 'productivity',
      icon: '🧭',
      installedAt: new Date(0),
      source: 'builtin',
      enabled: true,
    },
    {
      identifier: 'apps.zos.calculator',
      name: 'Calculator',
      version: '1.0.0',
      description: 'Calculator',
      category: 'utilities',
      icon: '🧮',
      installedAt: new Date(0),
      source: 'builtin',
      enabled: true,
    },
    {
      identifier: 'apps.zos.notes',
      name: 'Notes',
      version: '1.0.0',
      description: 'Note taking',
      category: 'productivity',
      icon: '📝',
      installedAt: new Date(0),
      source: 'builtin',
      enabled: true,
    },
    {
      identifier: 'apps.zos.calendar',
      name: 'Calendar',
      version: '1.0.0',
      description: 'Calendar and events',
      category: 'productivity',
      icon: '📅',
      installedAt: new Date(0),
      source: 'builtin',
      enabled: true,
    },
    {
      identifier: 'apps.zos.photos',
      name: 'Photos',
      version: '1.0.0',
      description: 'Photo viewer',
      category: 'entertainment',
      icon: '🖼️',
      installedAt: new Date(0),
      source: 'builtin',
      enabled: true,
    },
    {
      identifier: 'apps.zos.music',
      name: 'Music',
      version: '1.0.0',
      description: 'Music player',
      category: 'entertainment',
      icon: '🎵',
      installedAt: new Date(0),
      source: 'builtin',
      enabled: true,
    },
    {
      identifier: 'apps.zos.mail',
      name: 'Mail',
      version: '1.0.0',
      description: 'Email client',
      category: 'communication',
      icon: '✉️',
      installedAt: new Date(0),
      source: 'builtin',
      enabled: true,
    },
    {
      identifier: 'apps.zos.system-preferences',
      name: 'System Preferences',
      version: '1.0.0',
      description: 'System settings',
      category: 'system',
      icon: '⚙️',
      installedAt: new Date(0),
      source: 'builtin',
      enabled: true,
    },
  ];

  return builtins;
}

/**
 * Cache helpers
 */
function getCachedApps(): AppManifest[] | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const { apps, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return apps;
  } catch {
    return null;
  }
}

function setCachedApps(apps: AppManifest[]): void {
  localStorage.setItem(CACHE_KEY, JSON.stringify({
    apps,
    timestamp: Date.now(),
  }));
}

/**
 * Clear cache (useful for refresh)
 */
export function clearAppCache(): void {
  localStorage.removeItem(CACHE_KEY);
}
