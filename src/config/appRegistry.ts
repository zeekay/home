/**
 * App Registry - Complete catalog of zOS applications
 *
 * Central registry for all apps with:
 * - Bundle identifiers (com.zeekay.appname)
 * - Categories for App Store organization
 * - Dependencies between apps
 * - Icons and display metadata
 */

import { appVersions, type AppVersion } from './appVersions';

export type AppCategory =
  | 'Productivity'
  | 'Utilities'
  | 'Entertainment'
  | 'Social'
  | 'Developer Tools'
  | 'Finance'
  | 'AI'
  | 'System';

export interface AppRegistryEntry {
  id: string;
  name: string;
  bundleId: string;
  category: AppCategory;
  icon: string;
  description: string;
  dependencies: string[];
  systemApp: boolean;
  featured: boolean;
  component: string;
}

export const appRegistry: AppRegistryEntry[] = [
  // System Apps
  {
    id: 'finder',
    name: 'Finder',
    bundleId: 'com.zeekay.finder',
    category: 'System',
    icon: 'Folder',
    description: 'Browse files, folders, and connected services',
    dependencies: [],
    systemApp: true,
    featured: false,
    component: 'ZFinderWindow',
  },
  {
    id: 'appstore',
    name: 'App Store',
    bundleId: 'com.zeekay.appstore',
    category: 'System',
    icon: 'AppWindow',
    description: 'Discover and install apps for zOS',
    dependencies: [],
    systemApp: true,
    featured: false,
    component: 'ZAppStoreWindow',
  },
  {
    id: 'systempreferences',
    name: 'System Preferences',
    bundleId: 'com.zeekay.systempreferences',
    category: 'System',
    icon: 'Settings',
    description: 'Configure zOS settings and preferences',
    dependencies: [],
    systemApp: true,
    featured: false,
    component: 'ZSystemPreferencesWindow',
  },

  // Productivity Apps
  {
    id: 'safari',
    name: 'Safari',
    bundleId: 'com.zeekay.safari',
    category: 'Productivity',
    icon: 'Compass',
    description: 'Fast, secure, and privacy-focused web browser',
    dependencies: [],
    systemApp: false,
    featured: true,
    component: 'ZSafariWindow',
  },
  {
    id: 'mail',
    name: 'Mail',
    bundleId: 'com.zeekay.mail',
    category: 'Productivity',
    icon: 'Mail',
    description: 'Send and receive email messages',
    dependencies: [],
    systemApp: false,
    featured: true,
    component: 'ZEmailWindow',
  },
  {
    id: 'calendar',
    name: 'Calendar',
    bundleId: 'com.zeekay.calendar',
    category: 'Productivity',
    icon: 'Calendar',
    description: 'Schedule meetings with Cal.com integration',
    dependencies: [],
    systemApp: false,
    featured: true,
    component: 'ZCalendarWindow',
  },
  {
    id: 'notes',
    name: 'Notes',
    bundleId: 'com.zeekay.notes',
    category: 'Productivity',
    icon: 'StickyNote',
    description: 'Take notes with rich text support',
    dependencies: [],
    systemApp: false,
    featured: false,
    component: 'ZNotesWindow',
  },
  {
    id: 'textedit',
    name: 'TextEdit',
    bundleId: 'com.zeekay.textedit',
    category: 'Productivity',
    icon: 'FileText',
    description: 'Simple yet powerful text editor',
    dependencies: [],
    systemApp: false,
    featured: false,
    component: 'ZTextPadWindow',
  },
  {
    id: 'stickies',
    name: 'Stickies',
    bundleId: 'com.zeekay.stickies',
    category: 'Productivity',
    icon: 'Notebook',
    description: 'Sticky notes for your desktop',
    dependencies: [],
    systemApp: false,
    featured: false,
    component: 'ZStickiesWindow',
  },

  // Entertainment Apps
  {
    id: 'music',
    name: 'Music',
    bundleId: 'com.zeekay.music',
    category: 'Entertainment',
    icon: 'Music',
    description: 'Stream music with Spotify and SoundCloud',
    dependencies: [],
    systemApp: false,
    featured: true,
    component: 'ZMusicWindow',
  },
  {
    id: 'photos',
    name: 'Photos',
    bundleId: 'com.zeekay.photos',
    category: 'Entertainment',
    icon: 'Image',
    description: 'Photo gallery with Instagram integration',
    dependencies: [],
    systemApp: false,
    featured: true,
    component: 'ZPhotosWindow',
  },
  {
    id: 'itunes',
    name: 'iTunes',
    bundleId: 'com.zeekay.itunes',
    category: 'Entertainment',
    icon: 'Music2',
    description: 'Classic iTunes interface',
    dependencies: [],
    systemApp: false,
    featured: false,
    component: 'ZITunesWindow',
  },

  // Social Apps
  {
    id: 'messages',
    name: 'Messages',
    bundleId: 'com.zeekay.messages',
    category: 'Social',
    icon: 'MessageCircle',
    description: 'Messaging with Facebook Messenger integration',
    dependencies: [],
    systemApp: false,
    featured: true,
    component: 'ZMessagesWindow',
  },
  {
    id: 'facetime',
    name: 'FaceTime',
    bundleId: 'com.zeekay.facetime',
    category: 'Social',
    icon: 'Video',
    description: 'Video calling app',
    dependencies: [],
    systemApp: false,
    featured: false,
    component: 'ZFaceTimeWindow',
  },
  {
    id: 'socials',
    name: 'Socials',
    bundleId: 'com.zeekay.socials',
    category: 'Social',
    icon: 'Users',
    description: 'Social media links and profiles',
    dependencies: [],
    systemApp: false,
    featured: false,
    component: 'ZSocialsWindow',
  },

  // Developer Tools
  {
    id: 'terminal',
    name: 'Terminal',
    bundleId: 'com.zeekay.terminal',
    category: 'Developer Tools',
    icon: 'Terminal',
    description: 'Command-line interface with WebContainer',
    dependencies: [],
    systemApp: false,
    featured: true,
    component: 'ZTerminalWindow',
  },
  {
    id: 'xcode',
    name: 'Xcode',
    bundleId: 'com.zeekay.xcode',
    category: 'Developer Tools',
    icon: 'Code',
    description: 'IDE with Monaco Editor integration',
    dependencies: [],
    systemApp: false,
    featured: true,
    component: 'ZCodeWindow',
  },
  {
    id: 'githubstats',
    name: 'GitHub Stats',
    bundleId: 'com.zeekay.githubstats',
    category: 'Developer Tools',
    icon: 'Github',
    description: 'GitHub statistics and contributions',
    dependencies: [],
    systemApp: false,
    featured: false,
    component: 'ZGitHubStatsWindow',
  },

  // Utilities
  {
    id: 'calculator',
    name: 'Calculator',
    bundleId: 'com.zeekay.calculator',
    category: 'Utilities',
    icon: 'Calculator',
    description: 'Calculator with scientific mode',
    dependencies: [],
    systemApp: false,
    featured: false,
    component: 'ZCalculatorWindow',
  },
  {
    id: 'weather',
    name: 'Weather',
    bundleId: 'com.zeekay.weather',
    category: 'Utilities',
    icon: 'Cloud',
    description: 'Weather forecasts and conditions',
    dependencies: [],
    systemApp: false,
    featured: false,
    component: 'ZWeatherWindow',
  },
  {
    id: 'clock',
    name: 'Clock',
    bundleId: 'com.zeekay.clock',
    category: 'Utilities',
    icon: 'Clock',
    description: 'World clock, timer, and stopwatch',
    dependencies: [],
    systemApp: false,
    featured: false,
    component: 'ZClockWindow',
  },
  {
    id: 'stats',
    name: 'Stats',
    bundleId: 'com.zeekay.stats',
    category: 'Utilities',
    icon: 'BarChart',
    description: 'System statistics and metrics',
    dependencies: [],
    systemApp: false,
    featured: false,
    component: 'ZStatsWindow',
  },
  {
    id: 'grapher',
    name: 'Grapher',
    bundleId: 'com.zeekay.grapher',
    category: 'Utilities',
    icon: 'LineChart',
    description: 'Visualize mathematical equations and functions',
    dependencies: [],
    systemApp: false,
    featured: false,
    component: 'ZGrapherWindow',
  },

  // AI Apps
  {
    id: 'hanzo',
    name: 'Hanzo AI',
    bundleId: 'ai.hanzo.assistant',
    category: 'AI',
    icon: 'Bot',
    description: 'AI assistant powered by Hanzo',
    dependencies: [],
    systemApp: false,
    featured: true,
    component: 'HanzoAIWindow',
  },
  {
    id: 'zoo',
    name: 'Zoo',
    bundleId: 'ngo.zoo.assistant',
    category: 'AI',
    icon: 'Sparkles',
    description: 'Decentralized AI research assistant',
    dependencies: [],
    systemApp: false,
    featured: true,
    component: 'ZooAssistantWindow',
  },

  // Finance
  {
    id: 'lux',
    name: 'Lux Wallet',
    bundleId: 'network.lux.wallet',
    category: 'Finance',
    icon: 'Wallet',
    description: 'Quantum-safe cryptocurrency wallet',
    dependencies: [],
    systemApp: false,
    featured: true,
    component: 'LuxWalletWindow',
  },

  // Social Apps - New
  {
    id: 'discord',
    name: 'Discord',
    bundleId: 'com.discord.app',
    category: 'Social',
    icon: 'MessageCircle',
    description: 'Voice, video, and text communication',
    dependencies: [],
    systemApp: false,
    featured: true,
    component: 'ZDiscordWindow',
  },
  {
    id: 'twitter',
    name: 'X',
    bundleId: 'com.twitter.app',
    category: 'Social',
    icon: 'Twitter',
    description: 'Social networking and news',
    dependencies: [],
    systemApp: false,
    featured: true,
    component: 'ZTwitterWindow',
  },
  {
    id: 'slack',
    name: 'Slack',
    bundleId: 'com.slack.app',
    category: 'Social',
    icon: 'Hash',
    description: 'Business communication platform',
    dependencies: [],
    systemApp: false,
    featured: false,
    component: 'ZSlackWindow',
  },
  {
    id: 'mastodon',
    name: 'Mastodon',
    bundleId: 'org.joinmastodon.app',
    category: 'Social',
    icon: 'Globe',
    description: 'Decentralized social network',
    dependencies: [],
    systemApp: false,
    featured: false,
    component: 'ZMastodonWindow',
  },

  // Developer Tools - New
  {
    id: 'vscode',
    name: 'Visual Studio Code',
    bundleId: 'com.microsoft.vscode',
    category: 'Developer Tools',
    icon: 'Code2',
    description: 'Lightweight but powerful source code editor',
    dependencies: [],
    systemApp: false,
    featured: true,
    component: 'ZVSCodeWindow',
  },
  {
    id: 'console',
    name: 'Console',
    bundleId: 'com.zeekay.console',
    category: 'Developer Tools',
    icon: 'ScrollText',
    description: 'System logs and diagnostics',
    dependencies: [],
    systemApp: false,
    featured: false,
    component: 'ZConsoleWindow',
  },

  // Creative/Design Apps
  {
    id: 'figma',
    name: 'Figma',
    bundleId: 'com.figma.desktop',
    category: 'Productivity',
    icon: 'Figma',
    description: 'Collaborative interface design tool',
    dependencies: [],
    systemApp: false,
    featured: true,
    component: 'ZFigmaWindow',
  },
  {
    id: 'sketch',
    name: 'Sketch',
    bundleId: 'com.bohemiancoding.sketch3',
    category: 'Productivity',
    icon: 'Diamond',
    description: 'Digital design platform',
    dependencies: [],
    systemApp: false,
    featured: false,
    component: 'ZSketchWindow',
  },
  {
    id: 'aftereffects',
    name: 'After Effects',
    bundleId: 'com.adobe.aftereffects',
    category: 'Entertainment',
    icon: 'Film',
    description: 'Motion graphics and visual effects',
    dependencies: [],
    systemApp: false,
    featured: false,
    component: 'ZAfterEffectsWindow',
  },

  // Music Production Apps
  {
    id: 'logicpro',
    name: 'Logic Pro',
    bundleId: 'com.apple.logicpro',
    category: 'Entertainment',
    icon: 'Music4',
    description: 'Professional music production',
    dependencies: [],
    systemApp: false,
    featured: true,
    component: 'ZLogicProWindow',
  },
  {
    id: 'flstudio',
    name: 'FL Studio',
    bundleId: 'com.image-line.flstudio',
    category: 'Entertainment',
    icon: 'Music3',
    description: 'Digital audio workstation',
    dependencies: [],
    systemApp: false,
    featured: false,
    component: 'ZFLStudioWindow',
  },
  {
    id: 'abletonlive',
    name: 'Ableton Live',
    bundleId: 'com.ableton.live',
    category: 'Entertainment',
    icon: 'Disc',
    description: 'Music production and performance',
    dependencies: [],
    systemApp: false,
    featured: false,
    component: 'ZAbletonLiveWindow',
  },
  {
    id: 'rekordbox',
    name: 'rekordbox',
    bundleId: 'com.pioneerdj.rekordbox',
    category: 'Entertainment',
    icon: 'Disc3',
    description: 'DJ software for music management',
    dependencies: [],
    systemApp: false,
    featured: false,
    component: 'ZRekordboxWindow',
  },

  // System Utilities - New
  {
    id: 'diskutility',
    name: 'Disk Utility',
    bundleId: 'com.zeekay.diskutility',
    category: 'Utilities',
    icon: 'HardDrive',
    description: 'Manage disks and volumes',
    dependencies: [],
    systemApp: true,
    featured: false,
    component: 'ZDiskUtilityWindow',
  },
  {
    id: 'keychainaccess',
    name: 'Keychain Access',
    bundleId: 'com.zeekay.keychainaccess',
    category: 'Utilities',
    icon: 'Key',
    description: 'Manage passwords and certificates',
    dependencies: [],
    systemApp: true,
    featured: false,
    component: 'ZKeychainAccessWindow',
  },
  {
    id: 'audiomidisetup',
    name: 'Audio MIDI Setup',
    bundleId: 'com.zeekay.audiomidisetup',
    category: 'Utilities',
    icon: 'AudioLines',
    description: 'Configure audio devices and MIDI',
    dependencies: [],
    systemApp: true,
    featured: false,
    component: 'ZAudioMIDISetupWindow',
  },
  {
    id: 'digitalcolormeter',
    name: 'Digital Color Meter',
    bundleId: 'com.zeekay.digitalcolormeter',
    category: 'Utilities',
    icon: 'Pipette',
    description: 'Pick colors from anywhere on screen',
    dependencies: [],
    systemApp: false,
    featured: false,
    component: 'ZDigitalColorMeterWindow',
  },
  {
    id: 'screenshot',
    name: 'Screenshot',
    bundleId: 'com.zeekay.screenshot',
    category: 'Utilities',
    icon: 'Camera',
    description: 'Capture screenshots and recordings',
    dependencies: [],
    systemApp: false,
    featured: false,
    component: 'ZScreenshotWindow',
  },
  {
    id: 'screentime',
    name: 'Screen Time',
    bundleId: 'com.zeekay.screentime',
    category: 'Utilities',
    icon: 'Timer',
    description: 'Track app usage and set limits',
    dependencies: [],
    systemApp: false,
    featured: false,
    component: 'ZScreenTimeWindow',
  },
];

/**
 * Get registry entry for an app
 */
export function getAppRegistryEntry(appId: string): AppRegistryEntry | undefined {
  return appRegistry.find((app) => app.id === appId);
}

/**
 * Get full app info (registry + version)
 */
export interface FullAppInfo extends AppRegistryEntry {
  version: AppVersion;
}

export function getFullAppInfo(appId: string): FullAppInfo | undefined {
  const entry = getAppRegistryEntry(appId);
  const version = appVersions[appId];
  if (!entry || !version) return undefined;
  return { ...entry, version };
}

/**
 * Get apps by category
 */
export function getAppsByCategory(category: AppCategory): AppRegistryEntry[] {
  return appRegistry.filter((app) => app.category === category);
}

/**
 * Get featured apps
 */
export function getFeaturedApps(): AppRegistryEntry[] {
  return appRegistry.filter((app) => app.featured);
}

/**
 * Get system apps
 */
export function getSystemApps(): AppRegistryEntry[] {
  return appRegistry.filter((app) => app.systemApp);
}

/**
 * Get all categories with app counts
 */
export function getCategoriesWithCounts(): { category: AppCategory; count: number }[] {
  const categories: AppCategory[] = [
    'System',
    'Productivity',
    'Entertainment',
    'Social',
    'Developer Tools',
    'Utilities',
    'AI',
    'Finance',
  ];

  return categories.map((category) => ({
    category,
    count: getAppsByCategory(category).length,
  }));
}

/**
 * Search apps by name or description
 */
export function searchApps(query: string): AppRegistryEntry[] {
  const q = query.toLowerCase();
  return appRegistry.filter(
    (app) =>
      app.name.toLowerCase().includes(q) ||
      app.description.toLowerCase().includes(q) ||
      app.bundleId.toLowerCase().includes(q)
  );
}

/**
 * Export all app IDs
 */
export const allAppIds = appRegistry.map((app) => app.id);

/**
 * Export category list
 */
export const categories: AppCategory[] = [
  'System',
  'Productivity',
  'Entertainment',
  'Social',
  'Developer Tools',
  'Utilities',
  'AI',
  'Finance',
];
