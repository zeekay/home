import React, { useState, useEffect, useCallback } from 'react';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ZAppStoreWindowProps {
  onClose: () => void;
}

type TabType = 'discover' | 'installed' | 'updates';

const ZAppStoreWindow: React.FC<ZAppStoreWindowProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('discover');
  const [availableApps, setAvailableApps] = useState<AppManifest[]>([]);
  const [installedApps, setInstalledApps] = useState<InstalledApp[]>([]);
  const [updates, setUpdates] = useState<AppUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [installing, setInstalling] = useState<string | null>(null);

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

      setAvailableApps(available);
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
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
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
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
      updateApp(update.app);
      setUpdates(prev => prev.filter(u => u.identifier !== update.identifier));
    } finally {
      setInstalling(null);
    }
  }, []);

  const isInstalled = useCallback((identifier: string) => {
    return installedApps.some(app => app.identifier === identifier);
  }, [installedApps]);

  const getInstalledVersion = useCallback((identifier: string) => {
    return installedApps.find(app => app.identifier === identifier)?.version;
  }, [installedApps]);

  // Filter apps based on search
  const filteredAvailable = availableApps.filter(app =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredInstalled = installedApps.filter(app =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ZWindow
      title="App Store"
      onClose={onClose}
      initialSize={{ width: 800, height: 600 }}
      minSize={{ width: 600, height: 400 }}
    >
      <div className="flex flex-col h-full bg-gray-900/95">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex gap-1">
            <TabButton
              active={activeTab === 'discover'}
              onClick={() => setActiveTab('discover')}
            >
              <Package className="w-4 h-4" />
              Discover
            </TabButton>
            <TabButton
              active={activeTab === 'installed'}
              onClick={() => setActiveTab('installed')}
            >
              <Check className="w-4 h-4" />
              Installed ({installedApps.length})
            </TabButton>
            <TabButton
              active={activeTab === 'updates'}
              onClick={() => setActiveTab('updates')}
              badge={updates.length > 0 ? updates.length : undefined}
            >
              <ArrowUpCircle className="w-4 h-4" />
              Updates
            </TabButton>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search apps..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/30"
              />
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
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {error ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-red-400 mb-2">Failed to load apps</div>
              <div className="text-white/50 text-sm mb-4">{error}</div>
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white text-sm transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <RefreshCw className="w-8 h-8 text-white/50 animate-spin mb-4" />
              <div className="text-white/50">Loading apps from zos-apps...</div>
            </div>
          ) : (
            <>
              {activeTab === 'discover' && (
                <AppGrid
                  apps={filteredAvailable}
                  installedApps={installedApps}
                  installing={installing}
                  onInstall={handleInstall}
                  isInstalled={isInstalled}
                  getInstalledVersion={getInstalledVersion}
                />
              )}
              {activeTab === 'installed' && (
                <InstalledGrid
                  apps={filteredInstalled}
                  installing={installing}
                  onUninstall={handleUninstall}
                />
              )}
              {activeTab === 'updates' && (
                <UpdatesList
                  updates={updates}
                  installing={installing}
                  onUpdate={handleUpdate}
                />
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-white/10 text-xs text-white/40">
          <span>
            Apps from{' '}
            <a
              href="https://github.com/zos-apps"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              github.com/zos-apps
            </a>
          </span>
          <span>{availableApps.length} apps available</span>
        </div>
      </div>
    </ZWindow>
  );
};

// Tab button component
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
      active
        ? "bg-white/10 text-white"
        : "text-white/60 hover:text-white hover:bg-white/5"
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

// App grid for Discover tab
const AppGrid: React.FC<{
  apps: AppManifest[];
  installedApps: InstalledApp[];
  installing: string | null;
  onInstall: (app: AppManifest) => void;
  isInstalled: (id: string) => boolean;
  getInstalledVersion: (id: string) => string | undefined;
}> = ({ apps, installing, onInstall, isInstalled, getInstalledVersion }) => {
  if (apps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-white/50">
        <Package className="w-12 h-12 mb-4 opacity-50" />
        <div>No apps found</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {apps.map((app) => {
        const installed = isInstalled(app.identifier);
        const installedVersion = getInstalledVersion(app.identifier);
        const isInstalling = installing === app.identifier;

        return (
          <div
            key={app.identifier}
            className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-start gap-3">
              <AppIcon category={app.category} icon={app.icon} name={app.name} />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-white truncate">{app.name}</h3>
                <p className="text-xs text-white/50 truncate">{app.category || 'App'}</p>
              </div>
            </div>

            <p className="mt-3 text-sm text-white/70 line-clamp-2">
              {app.description || 'No description available'}
            </p>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-white/40">v{app.version}</span>

              {installed ? (
                <div className="flex items-center gap-1 text-green-400 text-xs">
                  <Check className="w-4 h-4" />
                  Installed {installedVersion !== app.version && `(v${installedVersion})`}
                </div>
              ) : (
                <button
                  onClick={() => onInstall(app)}
                  disabled={isInstalling}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 rounded-lg text-white text-xs transition-colors"
                >
                  {isInstalling ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : (
                    <Download className="w-3 h-3" />
                  )}
                  {isInstalling ? 'Installing...' : 'Install'}
                </button>
              )}
            </div>

            {app.repository && (
              <a
                href={app.repository}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex items-center gap-1 text-xs text-white/40 hover:text-white/60"
              >
                <ExternalLink className="w-3 h-3" />
                View source
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Installed apps grid
const InstalledGrid: React.FC<{
  apps: InstalledApp[];
  installing: string | null;
  onUninstall: (id: string) => void;
}> = ({ apps, onUninstall }) => {
  if (apps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-white/50">
        <Package className="w-12 h-12 mb-4 opacity-50" />
        <div>No apps installed</div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {apps.map((app) => (
        <div
          key={app.identifier}
          className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors"
        >
          <AppIcon category={app.category} icon={app.icon} name={app.name} size="md" />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-white">{app.name}</h3>
              {app.source === 'builtin' && (
                <span className="px-2 py-0.5 bg-white/10 rounded text-xs text-white/50">
                  Built-in
                </span>
              )}
            </div>
            <p className="text-sm text-white/50">{app.description}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-white/40">v{app.version}</div>
              <div className="flex items-center gap-1 text-xs text-white/30">
                <Clock className="w-3 h-3" />
                {app.source === 'builtin' ? 'System' : formatDate(app.installedAt)}
              </div>
            </div>

            {app.source !== 'builtin' && (
              <button
                onClick={() => onUninstall(app.identifier)}
                className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                title="Uninstall"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Updates list
const UpdatesList: React.FC<{
  updates: AppUpdate[];
  installing: string | null;
  onUpdate: (update: AppUpdate) => void;
}> = ({ updates, installing, onUpdate }) => {
  if (updates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-white/50">
        <Check className="w-12 h-12 mb-4 opacity-50" />
        <div>All apps are up to date</div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {updates.map((update) => {
        const isUpdating = installing === update.identifier;

        return (
          <div
            key={update.identifier}
            className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-4"
          >
            <AppIcon category={update.app.category} icon={update.app.icon} name={update.app.name} size="md" />

            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-white">{update.app.name}</h3>
              <p className="text-sm text-white/50">
                {update.currentVersion} → {update.latestVersion}
              </p>
            </div>

            <button
              onClick={() => onUpdate(update)}
              disabled={isUpdating}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 rounded-lg text-white text-sm transition-colors"
            >
              {isUpdating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowUpCircle className="w-4 h-4" />
              )}
              {isUpdating ? 'Updating...' : 'Update'}
            </button>
          </div>
        );
      })}
    </div>
  );
};

// App icon component
const AppIcon: React.FC<{
  category?: AppCategory;
  icon?: string;
  name: string;
  size?: 'sm' | 'md';
}> = ({ category = 'other', icon, name, size = 'sm' }) => {
  const gradient = categoryGradients[category] || categoryGradients.other;
  const sizeClasses = size === 'md' ? 'w-12 h-12' : 'w-10 h-10';
  const textSizeClasses = size === 'md' ? 'text-2xl' : 'text-xl';

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl bg-gradient-to-br",
        gradient,
        sizeClasses
      )}
    >
      {icon ? (
        <span className={textSizeClasses}>{icon}</span>
      ) : (
        <span className={cn("font-bold text-white", size === 'md' ? 'text-lg' : 'text-base')}>
          {name.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
};

// Helper function
function formatDate(date: Date): string {
  if (date.getTime() === 0) return 'System';
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;

  return date.toLocaleDateString();
}

export default ZAppStoreWindow;
