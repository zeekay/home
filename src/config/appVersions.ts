/**
 * App Versions - Centralized version management for zOS apps
 *
 * Each app tracks:
 * - version: Semantic version (major.minor.patch)
 * - build: Build number (auto-incremented on deploy)
 * - releaseDate: ISO date of last release
 * - changelog: Recent changes for this version
 */

export interface AppVersion {
  version: string;
  build: number;
  releaseDate: string;
  changelog: string[];
}

export interface AppVersions {
  [appId: string]: AppVersion;
}

// System version
export const ZOS_VERSION: AppVersion = {
  version: '15.2.0',
  build: 24093,
  releaseDate: '2024-12-27',
  changelog: [
    'Added App Store with versioning',
    'Improved window management',
    'New notification system',
  ],
};

// Individual app versions
export const appVersions: AppVersions = {
  finder: {
    version: '14.0.0',
    build: 14432,
    releaseDate: '2024-12-27',
    changelog: [
      'Multiple view modes (Icons, List, Columns, Gallery)',
      'Quick Look preview support',
      'Sidebar with favorites and tags',
    ],
  },

  textedit: {
    version: '1.18.0',
    build: 4402,
    releaseDate: '2024-12-27',
    changelog: [
      'Rich text and plain text editing',
      'Auto-save functionality',
      'Word count display',
    ],
  },

  terminal: {
    version: '2.14.0',
    build: 453,
    releaseDate: '2024-12-27',
    changelog: [
      'WebContainer integration',
      'Command history with arrow keys',
      'Customizable themes',
    ],
  },

  safari: {
    version: '18.2.0',
    build: 206201168,
    releaseDate: '2024-12-27',
    changelog: [
      'Tab browsing support',
      'Bookmarks and history',
      'Privacy protection features',
    ],
  },

  mail: {
    version: '16.0.0',
    build: 377470031,
    releaseDate: '2024-12-27',
    changelog: [
      'Contact form integration',
      'Message templates',
      'Attachment support',
    ],
  },

  calendar: {
    version: '14.0.0',
    build: 2738,
    releaseDate: '2024-12-27',
    changelog: [
      'Cal.com integration',
      'Schedule 15-min meetings',
      'Google Meet support',
    ],
  },

  music: {
    version: '1.5.2',
    build: 15512,
    releaseDate: '2024-12-27',
    changelog: [
      'Spotify API integration',
      'SoundCloud embed support',
      'Recently played tracks',
    ],
  },

  photos: {
    version: '9.0.0',
    build: 9023110,
    releaseDate: '2024-12-27',
    changelog: [
      'Instagram API integration',
      'Photo grid view',
      'Video support',
    ],
  },

  messages: {
    version: '14.2.0',
    build: 1430,
    releaseDate: '2024-12-27',
    changelog: [
      'Messenger integration',
      'Links to X and Instagram',
      'Contact card display',
    ],
  },

  notes: {
    version: '5.2.0',
    build: 2108,
    releaseDate: '2024-12-27',
    changelog: [
      'Rich text editing',
      'Folders and tags',
      'Search functionality',
    ],
  },

  facetime: {
    version: '6.0.0',
    build: 343245,
    releaseDate: '2024-12-27',
    changelog: [
      'Video calls preview',
      'Camera integration',
      'Contact integration',
    ],
  },

  hanzo: {
    version: '2.0.0',
    build: 20241227,
    releaseDate: '2024-12-27',
    changelog: [
      'Natural language AI',
      'Code assistance',
      'Task automation',
    ],
  },

  lux: {
    version: '1.0.0',
    build: 1001,
    releaseDate: '2024-12-27',
    changelog: [
      'Multi-chain wallet support',
      'Post-quantum security',
      'DeFi integration',
    ],
  },

  zoo: {
    version: '1.0.0',
    build: 1001,
    releaseDate: '2024-12-27',
    changelog: [
      'AI research assistant',
      'DeSci integration',
      'ZIPs governance',
    ],
  },

  xcode: {
    version: '16.2.0',
    build: 165031,
    releaseDate: '2024-12-27',
    changelog: [
      'Monaco Editor integration',
      'Syntax highlighting',
      'File explorer',
    ],
  },

  calculator: {
    version: '11.1.0',
    build: 227,
    releaseDate: '2024-12-27',
    changelog: [
      'Basic and scientific modes',
      'Keyboard support',
      'History display',
    ],
  },

  weather: {
    version: '4.0.0',
    build: 802,
    releaseDate: '2024-12-27',
    changelog: [
      'Current conditions display',
      '7-day forecast',
      'Location search',
    ],
  },

  appstore: {
    version: '3.0.0',
    build: 12492,
    releaseDate: '2024-12-27',
    changelog: [
      'App catalog with versions',
      'Featured apps section',
      'Category browsing',
    ],
  },

  stickies: {
    version: '1.0.0',
    build: 100,
    releaseDate: '2024-12-27',
    changelog: [
      'Sticky notes on desktop',
      'Color customization',
      'Auto-save',
    ],
  },

  clock: {
    version: '1.0.0',
    build: 100,
    releaseDate: '2024-12-27',
    changelog: [
      'World clock display',
      'Timer functionality',
      'Stopwatch',
    ],
  },

  socials: {
    version: '1.0.0',
    build: 100,
    releaseDate: '2024-12-27',
    changelog: [
      'Social media links',
      'Profile display',
      'Quick access',
    ],
  },

  githubstats: {
    version: '1.0.0',
    build: 100,
    releaseDate: '2024-12-27',
    changelog: [
      'GitHub statistics',
      'Contribution graph',
      'Repository list',
    ],
  },

  itunes: {
    version: '1.0.0',
    build: 100,
    releaseDate: '2024-12-27',
    changelog: [
      'Classic iTunes interface',
      'Library display',
      'Playback controls',
    ],
  },

  stats: {
    version: '1.0.0',
    build: 100,
    releaseDate: '2024-12-27',
    changelog: [
      'System statistics',
      'Performance metrics',
      'Resource monitoring',
    ],
  },

  shortcuts: {
    version: '6.0.0',
    build: 2116,
    releaseDate: '2024-12-27',
    changelog: [
      'Visual automation builder',
      'Drag & drop action blocks',
      'Pre-made shortcut gallery',
      'Import/export shortcuts',
    ],
  },
};

/**
 * Get version info for an app
 */
export function getAppVersion(appId: string): AppVersion | undefined {
  return appVersions[appId];
}

/**
 * Format version string (e.g., "14.0.0 (14432)")
 */
export function formatVersion(appId: string): string {
  const v = appVersions[appId];
  if (!v) return 'Unknown';
  return `${v.version} (${v.build})`;
}

/**
 * Format build string for display
 */
export function formatBuild(build: number): string {
  // Convert build number to macOS-style build string
  const major = Math.floor(build / 10000);
  const minor = String.fromCharCode(65 + (build % 100) % 26);
  const patch = build % 1000;
  return `${major}${minor}${patch}`;
}

/**
 * Parse semantic version string
 */
export function parseVersion(version: string): { major: number; minor: number; patch: number } {
  const [major = 0, minor = 0, patch = 0] = version.split('.').map(Number);
  return { major, minor, patch };
}

/**
 * Increment version
 */
export function incrementVersion(
  version: string,
  type: 'major' | 'minor' | 'patch'
): string {
  const { major, minor, patch } = parseVersion(version);
  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
  }
}

/**
 * Increment build number
 */
export function incrementBuild(build: number): number {
  return build + 1;
}
