/**
 * App metadata for About dialogs and documentation
 *
 * This file pulls version information from appVersions.ts and
 * combines it with display metadata for each app.
 */

import { appVersions, ZOS_VERSION, formatBuild } from './appVersions';

export interface AppMetadata {
  id: string;
  name: string;
  version: string;
  build: string;
  copyright: string;
  developer: string;
  website?: string;
  sourceCode?: string;
  releaseDate: string;
  description: string;
  features: string[];
  shortcuts?: { key: string; action: string }[];
  credits?: string[];
}

const GITHUB_ORG = 'https://github.com/zeekay';
const COPYRIGHT_YEAR = '2024-2025';
const DEVELOPER = 'Zach Kelling';

// Helper to get version string from appVersions
function v(appId: string): string {
  return appVersions[appId]?.version ?? '1.0.0';
}

// Helper to get build string from appVersions
function b(appId: string): string {
  const build = appVersions[appId]?.build;
  return build ? formatBuild(build) : '100';
}

// Helper to get release date from appVersions
function r(appId: string): string {
  return appVersions[appId]?.releaseDate ?? '2024-12-27';
}

export const appMetadata: Record<string, AppMetadata> = {
  finder: {
    id: 'finder',
    name: 'Finder',
    version: v('finder'),
    build: b('finder'),
    copyright: `Copyright ${COPYRIGHT_YEAR} ${DEVELOPER}. All rights reserved.`,
    developer: DEVELOPER,
    website: 'https://zeekay.io',
    sourceCode: `${GITHUB_ORG}/home/blob/main/src/components/ZFinderWindow.tsx`,
    releaseDate: r('finder'),
    description: 'The file manager for zOS. Browse files, folders, and connected services.',
    features: [
      'Browse local file system',
      'Quick Look preview',
      'Multiple view modes (Icons, List, Columns, Gallery)',
      'Sidebar with favorites and tags',
      'Trash management',
    ],
    shortcuts: [
      { key: 'Cmd+N', action: 'New Finder Window' },
      { key: 'Shift+Cmd+N', action: 'New Folder' },
      { key: 'Cmd+I', action: 'Get Info' },
      { key: 'Cmd+Delete', action: 'Move to Trash' },
      { key: 'Space', action: 'Quick Look' },
    ],
  },

  textedit: {
    id: 'textedit',
    name: 'TextEdit',
    version: v('textedit'),
    build: b('textedit'),
    copyright: `Copyright ${COPYRIGHT_YEAR} ${DEVELOPER}. All rights reserved.`,
    developer: DEVELOPER,
    website: 'https://zeekay.io',
    sourceCode: `${GITHUB_ORG}/home/blob/main/src/components/ZTextPadWindow.tsx`,
    releaseDate: r('textedit'),
    description: 'A simple yet powerful text editor for zOS.',
    features: [
      'Rich text and plain text editing',
      'Auto-save',
      'Word count',
      'Dark mode support',
    ],
    shortcuts: [
      { key: 'Cmd+N', action: 'New Document' },
      { key: 'Cmd+S', action: 'Save' },
      { key: 'Cmd+Z', action: 'Undo' },
      { key: 'Shift+Cmd+Z', action: 'Redo' },
    ],
  },

  terminal: {
    id: 'terminal',
    name: 'Terminal',
    version: v('terminal'),
    build: b('terminal'),
    copyright: `Copyright ${COPYRIGHT_YEAR} ${DEVELOPER}. All rights reserved.`,
    developer: DEVELOPER,
    website: 'https://zeekay.io',
    sourceCode: `${GITHUB_ORG}/home/blob/main/src/components/ZTerminalWindow.tsx`,
    releaseDate: r('terminal'),
    description: 'Command-line interface for zOS. Run commands and scripts.',
    features: [
      'Full shell emulation',
      'Command history',
      'Tab completion',
      'Customizable themes',
      'WebContainer integration',
    ],
    shortcuts: [
      { key: 'Cmd+N', action: 'New Window' },
      { key: 'Cmd+T', action: 'New Tab' },
      { key: 'Cmd+K', action: 'Clear' },
      { key: 'Up/Down', action: 'Command History' },
    ],
  },

  safari: {
    id: 'safari',
    name: 'Safari',
    version: v('safari'),
    build: b('safari'),
    copyright: `Copyright ${COPYRIGHT_YEAR} ${DEVELOPER}. All rights reserved.`,
    developer: DEVELOPER,
    website: 'https://zeekay.io',
    sourceCode: `${GITHUB_ORG}/home/blob/main/src/components/ZSafariWindow.tsx`,
    releaseDate: r('safari'),
    description: 'The web browser for zOS. Fast, secure, and privacy-focused.',
    features: [
      'Tab browsing',
      'Bookmarks and history',
      'Reader mode',
      'Privacy protection',
    ],
    shortcuts: [
      { key: 'Cmd+T', action: 'New Tab' },
      { key: 'Cmd+W', action: 'Close Tab' },
      { key: 'Cmd+L', action: 'Focus Address Bar' },
      { key: 'Cmd+R', action: 'Reload' },
    ],
  },

  mail: {
    id: 'mail',
    name: 'Mail',
    version: v('mail'),
    build: b('mail'),
    copyright: `Copyright ${COPYRIGHT_YEAR} ${DEVELOPER}. All rights reserved.`,
    developer: DEVELOPER,
    website: 'https://zeekay.io',
    sourceCode: `${GITHUB_ORG}/home/blob/main/src/components/ZEmailWindow.tsx`,
    releaseDate: r('mail'),
    description: 'Email client for zOS. Send and receive messages.',
    features: [
      'Contact form integration',
      'Send to z@zeekay.ai',
      'Message templates',
      'Attachment support',
    ],
    shortcuts: [
      { key: 'Cmd+N', action: 'New Message' },
      { key: 'Shift+Cmd+D', action: 'Send' },
      { key: 'Cmd+R', action: 'Reply' },
    ],
  },

  calendar: {
    id: 'calendar',
    name: 'Calendar',
    version: v('calendar'),
    build: b('calendar'),
    copyright: `Copyright ${COPYRIGHT_YEAR} ${DEVELOPER}. All rights reserved.`,
    developer: DEVELOPER,
    website: 'https://zeekay.io',
    sourceCode: `${GITHUB_ORG}/home/blob/main/src/components/ZCalendarWindow.tsx`,
    releaseDate: r('calendar'),
    description: 'Calendar app with Cal.com integration for scheduling.',
    features: [
      'Cal.com embed',
      'Schedule 15-min meetings',
      'Google Meet integration',
      'Timezone support',
    ],
    shortcuts: [
      { key: 'Cmd+N', action: 'New Event' },
      { key: 'Cmd+T', action: 'Go to Today' },
    ],
  },

  music: {
    id: 'music',
    name: 'Music',
    version: v('music'),
    build: b('music'),
    copyright: `Copyright ${COPYRIGHT_YEAR} ${DEVELOPER}. All rights reserved.`,
    developer: DEVELOPER,
    website: 'https://zeekay.io',
    sourceCode: `${GITHUB_ORG}/home/blob/main/src/components/ZMusicWindow.tsx`,
    releaseDate: r('music'),
    description: 'Music streaming with Spotify and SoundCloud integration.',
    features: [
      'Spotify API integration',
      'Recently played tracks',
      'Top artists and tracks',
      'SoundCloud embed',
      'Playlist management',
    ],
    shortcuts: [
      { key: 'Space', action: 'Play/Pause' },
      { key: 'Right', action: 'Next Track' },
      { key: 'Left', action: 'Previous Track' },
    ],
  },

  photos: {
    id: 'photos',
    name: 'Photos',
    version: v('photos'),
    build: b('photos'),
    copyright: `Copyright ${COPYRIGHT_YEAR} ${DEVELOPER}. All rights reserved.`,
    developer: DEVELOPER,
    website: 'https://zeekay.io',
    sourceCode: `${GITHUB_ORG}/home/blob/main/src/components/ZPhotosWindow.tsx`,
    releaseDate: r('photos'),
    description: 'Photo gallery with Instagram integration.',
    features: [
      'Instagram API integration',
      'Photo grid view',
      'Video support',
      'Project showcase',
      'Brand gallery',
    ],
    shortcuts: [
      { key: 'Cmd+I', action: 'Import' },
      { key: 'Space', action: 'Quick Look' },
    ],
  },

  messages: {
    id: 'messages',
    name: 'Messages',
    version: v('messages'),
    build: b('messages'),
    copyright: `Copyright ${COPYRIGHT_YEAR} ${DEVELOPER}. All rights reserved.`,
    developer: DEVELOPER,
    website: 'https://zeekay.io',
    sourceCode: `${GITHUB_ORG}/home/blob/main/src/components/ZMessagesWindow.tsx`,
    releaseDate: r('messages'),
    description: 'Messaging with Facebook Messenger integration.',
    features: [
      'Messenger integration',
      'Send messages via m.me/zeekay',
      'Links to X and Instagram',
    ],
    shortcuts: [
      { key: 'Cmd+N', action: 'New Message' },
    ],
  },

  notes: {
    id: 'notes',
    name: 'Notes',
    version: v('notes'),
    build: b('notes'),
    copyright: `Copyright ${COPYRIGHT_YEAR} ${DEVELOPER}. All rights reserved.`,
    developer: DEVELOPER,
    website: 'https://zeekay.io',
    sourceCode: `${GITHUB_ORG}/home/blob/main/src/components/ZNotesWindow.tsx`,
    releaseDate: r('notes'),
    description: 'Note-taking app with rich text support.',
    features: [
      'Rich text editing',
      'Folders and tags',
      'Search',
      'iCloud sync',
    ],
    shortcuts: [
      { key: 'Cmd+N', action: 'New Note' },
      { key: 'Shift+Cmd+N', action: 'New Folder' },
    ],
  },

  facetime: {
    id: 'facetime',
    name: 'FaceTime',
    version: v('facetime'),
    build: b('facetime'),
    copyright: `Copyright ${COPYRIGHT_YEAR} ${DEVELOPER}. All rights reserved.`,
    developer: DEVELOPER,
    website: 'https://zeekay.io',
    sourceCode: `${GITHUB_ORG}/home/blob/main/src/components/ZFaceTimeWindow.tsx`,
    releaseDate: r('facetime'),
    description: 'Video calling app.',
    features: [
      'Video calls',
      'Camera preview',
      'Contact integration',
    ],
    shortcuts: [
      { key: 'Cmd+N', action: 'New FaceTime' },
    ],
  },

  hanzo: {
    id: 'hanzo',
    name: 'Hanzo AI',
    version: v('hanzo'),
    build: b('hanzo'),
    copyright: `Copyright ${COPYRIGHT_YEAR} Hanzo AI, Inc. All rights reserved.`,
    developer: 'Hanzo AI',
    website: 'https://hanzo.ai',
    sourceCode: `${GITHUB_ORG}/home/blob/main/src/components/HanzoAIWindow.tsx`,
    releaseDate: r('hanzo'),
    description: 'AI assistant powered by Hanzo. Chat, code, create.',
    features: [
      'Natural language AI',
      'Code assistance',
      'Creative writing',
      'Task automation',
    ],
    shortcuts: [
      { key: 'Cmd+N', action: 'New Chat' },
      { key: 'Return', action: 'Send Message' },
    ],
    credits: ['Powered by Claude', 'Built by Hanzo AI'],
  },

  lux: {
    id: 'lux',
    name: 'Lux Wallet',
    version: v('lux'),
    build: b('lux'),
    copyright: `Copyright ${COPYRIGHT_YEAR} Lux Partners Limited. All rights reserved.`,
    developer: 'Lux Partners Limited',
    website: 'https://lux.network',
    sourceCode: `${GITHUB_ORG}/home/blob/main/src/components/LuxWalletWindow.tsx`,
    releaseDate: r('lux'),
    description: 'Quantum-safe cryptocurrency wallet for the Lux Network.',
    features: [
      'Multi-chain support',
      'Post-quantum security',
      'DeFi integration',
      'NFT gallery',
    ],
    shortcuts: [
      { key: 'Cmd+N', action: 'New Transaction' },
    ],
    credits: ['Lux Network', 'Powered by Snow Consensus'],
  },

  zoo: {
    id: 'zoo',
    name: 'Zoo',
    version: v('zoo'),
    build: b('zoo'),
    copyright: `Copyright ${COPYRIGHT_YEAR} Zoo Labs Foundation. All rights reserved.`,
    developer: 'Zoo Labs Foundation',
    website: 'https://zoo.ngo',
    sourceCode: `${GITHUB_ORG}/home/blob/main/src/components/ZooAssistantWindow.tsx`,
    releaseDate: r('zoo'),
    description: 'Decentralized AI research assistant from Zoo Labs.',
    features: [
      'AI research assistant',
      'DeSci integration',
      'ZIPs governance',
      'Research tools',
    ],
    shortcuts: [
      { key: 'Cmd+N', action: 'New Chat' },
    ],
    credits: ['Zoo Labs Foundation', 'Open AI Research Network'],
  },

  xcode: {
    id: 'xcode',
    name: 'Xcode',
    version: v('xcode'),
    build: b('xcode'),
    copyright: `Copyright ${COPYRIGHT_YEAR} ${DEVELOPER}. All rights reserved.`,
    developer: DEVELOPER,
    website: 'https://zeekay.io',
    sourceCode: `${GITHUB_ORG}/home/blob/main/src/components/ZCodeWindow.tsx`,
    releaseDate: r('xcode'),
    description: 'IDE for editing zOS source code. Built on Monaco Editor.',
    features: [
      'Monaco Editor integration',
      'Syntax highlighting',
      'Live preview',
      'File explorer',
      'Git integration',
    ],
    shortcuts: [
      { key: 'Cmd+B', action: 'Build' },
      { key: 'Cmd+R', action: 'Run' },
      { key: 'Cmd+S', action: 'Save' },
      { key: 'Cmd+/', action: 'Toggle Comment' },
    ],
    credits: ['Monaco Editor', 'TypeScript'],
  },

  calculator: {
    id: 'calculator',
    name: 'Calculator',
    version: v('calculator'),
    build: b('calculator'),
    copyright: `Copyright ${COPYRIGHT_YEAR} ${DEVELOPER}. All rights reserved.`,
    developer: DEVELOPER,
    website: 'https://zeekay.io',
    sourceCode: `${GITHUB_ORG}/home/blob/main/src/components/ZCalculatorWindow.tsx`,
    releaseDate: r('calculator'),
    description: 'Calculator with scientific mode.',
    features: [
      'Basic operations',
      'Scientific functions',
      'Keyboard support',
    ],
    shortcuts: [
      { key: 'C', action: 'Clear' },
      { key: '=', action: 'Calculate' },
    ],
  },

  weather: {
    id: 'weather',
    name: 'Weather',
    version: v('weather'),
    build: b('weather'),
    copyright: `Copyright ${COPYRIGHT_YEAR} ${DEVELOPER}. All rights reserved.`,
    developer: DEVELOPER,
    website: 'https://zeekay.io',
    sourceCode: `${GITHUB_ORG}/home/blob/main/src/components/ZWeatherWindow.tsx`,
    releaseDate: r('weather'),
    description: 'Weather app with location-based forecasts.',
    features: [
      'Current conditions',
      '7-day forecast',
      'Location search',
      'Weather animations',
    ],
    shortcuts: [],
  },

  appstore: {
    id: 'appstore',
    name: 'App Store',
    version: v('appstore'),
    build: b('appstore'),
    copyright: `Copyright ${COPYRIGHT_YEAR} ${DEVELOPER}. All rights reserved.`,
    developer: DEVELOPER,
    website: 'https://zeekay.io',
    sourceCode: `${GITHUB_ORG}/home/blob/main/src/components/ZAppStoreWindow.tsx`,
    releaseDate: r('appstore'),
    description: 'Discover and install apps for zOS.',
    features: [
      'App catalog',
      'Featured apps',
      'Categories',
      'Updates',
    ],
    shortcuts: [],
  },

  stickies: {
    id: 'stickies',
    name: 'Stickies',
    version: v('stickies'),
    build: b('stickies'),
    copyright: `Copyright ${COPYRIGHT_YEAR} ${DEVELOPER}. All rights reserved.`,
    developer: DEVELOPER,
    website: 'https://zeekay.io',
    sourceCode: `${GITHUB_ORG}/home/blob/main/src/components/ZStickiesWindow.tsx`,
    releaseDate: r('stickies'),
    description: 'Sticky notes for your desktop.',
    features: [
      'Sticky notes',
      'Color customization',
      'Auto-save',
    ],
    shortcuts: [
      { key: 'Cmd+N', action: 'New Sticky' },
    ],
  },

  clock: {
    id: 'clock',
    name: 'Clock',
    version: v('clock'),
    build: b('clock'),
    copyright: `Copyright ${COPYRIGHT_YEAR} ${DEVELOPER}. All rights reserved.`,
    developer: DEVELOPER,
    website: 'https://zeekay.io',
    sourceCode: `${GITHUB_ORG}/home/blob/main/src/components/ZClockWindow.tsx`,
    releaseDate: r('clock'),
    description: 'World clock, timer, and stopwatch.',
    features: [
      'World clock',
      'Timer',
      'Stopwatch',
    ],
    shortcuts: [],
  },

  socials: {
    id: 'socials',
    name: 'Socials',
    version: v('socials'),
    build: b('socials'),
    copyright: `Copyright ${COPYRIGHT_YEAR} ${DEVELOPER}. All rights reserved.`,
    developer: DEVELOPER,
    website: 'https://zeekay.io',
    sourceCode: `${GITHUB_ORG}/home/blob/main/src/components/ZSocialsWindow.tsx`,
    releaseDate: r('socials'),
    description: 'Social media links and profiles.',
    features: [
      'Social media links',
      'Profile display',
      'Quick access',
    ],
    shortcuts: [],
  },

  githubstats: {
    id: 'githubstats',
    name: 'GitHub Stats',
    version: v('githubstats'),
    build: b('githubstats'),
    copyright: `Copyright ${COPYRIGHT_YEAR} ${DEVELOPER}. All rights reserved.`,
    developer: DEVELOPER,
    website: 'https://zeekay.io',
    sourceCode: `${GITHUB_ORG}/home/blob/main/src/components/ZGitHubStatsWindow.tsx`,
    releaseDate: r('githubstats'),
    description: 'GitHub statistics and contributions.',
    features: [
      'GitHub statistics',
      'Contribution graph',
      'Repository list',
    ],
    shortcuts: [],
  },

  itunes: {
    id: 'itunes',
    name: 'iTunes',
    version: v('itunes'),
    build: b('itunes'),
    copyright: `Copyright ${COPYRIGHT_YEAR} ${DEVELOPER}. All rights reserved.`,
    developer: DEVELOPER,
    website: 'https://zeekay.io',
    sourceCode: `${GITHUB_ORG}/home/blob/main/src/components/ZITunesWindow.tsx`,
    releaseDate: r('itunes'),
    description: 'Classic iTunes interface.',
    features: [
      'Library display',
      'Playback controls',
      'Classic interface',
    ],
    shortcuts: [],
  },

  stats: {
    id: 'stats',
    name: 'Stats',
    version: v('stats'),
    build: b('stats'),
    copyright: `Copyright ${COPYRIGHT_YEAR} ${DEVELOPER}. All rights reserved.`,
    developer: DEVELOPER,
    website: 'https://zeekay.io',
    sourceCode: `${GITHUB_ORG}/home/blob/main/src/components/ZStatsWindow.tsx`,
    releaseDate: r('stats'),
    description: 'System statistics and metrics.',
    features: [
      'System statistics',
      'Performance metrics',
      'Resource monitoring',
    ],
    shortcuts: [],
  },

  grapher: {
    id: 'grapher',
    name: 'Grapher',
    version: v('grapher'),
    build: b('grapher'),
    copyright: `Copyright ${COPYRIGHT_YEAR} ${DEVELOPER}. All rights reserved.`,
    developer: DEVELOPER,
    website: 'https://zeekay.io',
    sourceCode: `${GITHUB_ORG}/home/blob/main/src/components/ZGrapherWindow.tsx`,
    releaseDate: r('grapher'),
    description: 'Visualize mathematical equations and functions.',
    features: [
      'Plot mathematical functions',
      'Multiple equations with colors',
      'Pan and zoom controls',
      'Preset equations library',
      'Export graphs as images',
    ],
    shortcuts: [
      { key: 'Cmd+Plus', action: 'Zoom In' },
      { key: 'Cmd+Minus', action: 'Zoom Out' },
      { key: 'Cmd+0', action: 'Reset View' },
    ],
  },

  shortcuts: {
    id: 'shortcuts',
    name: 'Shortcuts',
    version: v('shortcuts'),
    build: b('shortcuts'),
    copyright: `Copyright ${COPYRIGHT_YEAR} ${DEVELOPER}. All rights reserved.`,
    developer: DEVELOPER,
    website: 'https://zeekay.io',
    sourceCode: `${GITHUB_ORG}/home/blob/main/src/components/ZShortcutsWindow.tsx`,
    releaseDate: r('shortcuts'),
    description: 'Automation app for zOS. Build powerful shortcuts to automate tasks.',
    features: [
      'Visual automation builder',
      'Drag & drop action blocks',
      'Keyboard shortcuts trigger',
      'Scheduled automations',
      'App event triggers',
      'Pre-made shortcut gallery',
      'Import/export shortcuts',
    ],
    shortcuts: [
      { key: 'Cmd+N', action: 'New Shortcut' },
      { key: 'Cmd+R', action: 'Run Shortcut' },
      { key: 'Cmd+E', action: 'Export Shortcut' },
    ],
  },

  // Social Apps
  discord: {
    id: 'discord',
    name: 'Discord',
    version: v('discord'),
    build: b('discord'),
    copyright: `Copyright ${COPYRIGHT_YEAR} Discord Inc. All rights reserved.`,
    developer: 'Discord Inc.',
    website: 'https://discord.com',
    sourceCode: `${GITHUB_ORG}/home/blob/main/src/components/ZDiscordWindow.tsx`,
    releaseDate: r('discord'),
    description: 'Voice, video, and text communication for communities.',
    features: [
      'Server and channel navigation',
      'Voice and video chat',
      'Direct messaging',
      'Rich embeds',
    ],
    shortcuts: [],
  },

  twitter: {
    id: 'twitter',
    name: 'X',
    version: v('twitter'),
    build: b('twitter'),
    copyright: `Copyright ${COPYRIGHT_YEAR} X Corp. All rights reserved.`,
    developer: 'X Corp.',
    website: 'https://x.com',
    sourceCode: `${GITHUB_ORG}/home/blob/main/src/components/ZTwitterWindow.tsx`,
    releaseDate: r('twitter'),
    description: 'Social networking and news.',
    features: [
      'Timeline view',
      'Tweet composition',
      'Profile display',
      'Trending topics',
    ],
    shortcuts: [],
  },

  slack: {
    id: 'slack',
    name: 'Slack',
    version: v('slack'),
    build: b('slack'),
    copyright: `Copyright ${COPYRIGHT_YEAR} Slack Technologies. All rights reserved.`,
    developer: 'Slack Technologies',
    website: 'https://slack.com',
    sourceCode: `${GITHUB_ORG}/home/blob/main/src/components/ZSlackWindow.tsx`,
    releaseDate: r('slack'),
    description: 'Business communication and collaboration.',
    features: [
      'Workspace navigation',
      'Channel messaging',
      'Direct messages',
      'File sharing',
    ],
    shortcuts: [],
  },

  mastodon: {
    id: 'mastodon',
    name: 'Mastodon',
    version: v('mastodon'),
    build: b('mastodon'),
    copyright: `Copyright ${COPYRIGHT_YEAR} Mastodon gGmbH. All rights reserved.`,
    developer: 'Mastodon gGmbH',
    website: 'https://joinmastodon.org',
    sourceCode: `${GITHUB_ORG}/home/blob/main/src/components/ZMastodonWindow.tsx`,
    releaseDate: r('mastodon'),
    description: 'Decentralized social network.',
    features: [
      'Federated timeline',
      'Toot composition',
      'Instance selection',
      'Privacy controls',
    ],
    shortcuts: [],
  },

  // Developer Tools
  vscode: {
    id: 'vscode',
    name: 'Visual Studio Code',
    version: v('vscode'),
    build: b('vscode'),
    copyright: `Copyright ${COPYRIGHT_YEAR} Microsoft Corporation. All rights reserved.`,
    developer: 'Microsoft',
    website: 'https://code.visualstudio.com',
    sourceCode: `${GITHUB_ORG}/home/blob/main/src/components/ZVSCodeWindow.tsx`,
    releaseDate: r('vscode'),
    description: 'Lightweight but powerful source code editor.',
    features: [
      'Monaco Editor integration',
      'File explorer',
      'IntelliSense',
      'Extension support',
    ],
    shortcuts: [
      { key: 'Cmd+P', action: 'Quick Open' },
      { key: 'Cmd+Shift+P', action: 'Command Palette' },
      { key: 'Cmd+/', action: 'Toggle Comment' },
    ],
  },

  console: {
    id: 'console',
    name: 'Console',
    version: v('console'),
    build: b('console'),
    copyright: `Copyright ${COPYRIGHT_YEAR} ${DEVELOPER}. All rights reserved.`,
    developer: DEVELOPER,
    website: 'https://zeekay.io',
    sourceCode: `${GITHUB_ORG}/home/blob/main/src/components/ZConsoleWindow.tsx`,
    releaseDate: r('console'),
    description: 'System logs and diagnostics.',
    features: [
      'System log viewer',
      'Filter and search',
      'Real-time updates',
      'Log levels',
    ],
    shortcuts: [],
  },

  // Creative/Design Apps
  figma: {
    id: 'figma',
    name: 'Figma',
    version: v('figma'),
    build: b('figma'),
    copyright: `Copyright ${COPYRIGHT_YEAR} Figma, Inc. All rights reserved.`,
    developer: 'Figma, Inc.',
    website: 'https://figma.com',
    sourceCode: `${GITHUB_ORG}/home/blob/main/src/components/ZFigmaWindow.tsx`,
    releaseDate: r('figma'),
    description: 'Collaborative interface design tool.',
    features: [
      'Design canvas',
      'Layer management',
      'Component library',
      'Real-time collaboration',
    ],
    shortcuts: [
      { key: 'V', action: 'Move Tool' },
      { key: 'R', action: 'Rectangle Tool' },
      { key: 'T', action: 'Text Tool' },
    ],
  },

  sketch: {
    id: 'sketch',
    name: 'Sketch',
    version: v('sketch'),
    build: b('sketch'),
    copyright: `Copyright ${COPYRIGHT_YEAR} Sketch B.V. All rights reserved.`,
    developer: 'Sketch B.V.',
    website: 'https://sketch.com',
    sourceCode: `${GITHUB_ORG}/home/blob/main/src/components/ZSketchWindow.tsx`,
    releaseDate: r('sketch'),
    description: 'Digital design platform.',
    features: [
      'Vector editing',
      'Artboard management',
      'Symbol system',
      'Plugin support',
    ],
    shortcuts: [],
  },

  aftereffects: {
    id: 'aftereffects',
    name: 'After Effects',
    version: v('aftereffects'),
    build: b('aftereffects'),
    copyright: `Copyright ${COPYRIGHT_YEAR} Adobe Inc. All rights reserved.`,
    developer: 'Adobe Inc.',
    website: 'https://adobe.com/aftereffects',
    sourceCode: `${GITHUB_ORG}/home/blob/main/src/components/ZAfterEffectsWindow.tsx`,
    releaseDate: r('aftereffects'),
    description: 'Motion graphics and visual effects.',
    features: [
      'Composition timeline',
      'Effects library',
      'Motion graphics',
      'Keyframe animation',
    ],
    shortcuts: [],
  },

  // Music Production
  logicpro: {
    id: 'logicpro',
    name: 'Logic Pro',
    version: v('logicpro'),
    build: b('logicpro'),
    copyright: `Copyright ${COPYRIGHT_YEAR} Apple Inc. All rights reserved.`,
    developer: 'Apple Inc.',
    website: 'https://apple.com/logic-pro',
    sourceCode: `${GITHUB_ORG}/home/blob/main/src/components/ZLogicProWindow.tsx`,
    releaseDate: r('logicpro'),
    description: 'Professional music production.',
    features: [
      'Multi-track arrangement',
      'Virtual instruments',
      'MIDI editing',
      'Audio effects',
    ],
    shortcuts: [
      { key: 'R', action: 'Record' },
      { key: 'Space', action: 'Play/Stop' },
    ],
  },

  flstudio: {
    id: 'flstudio',
    name: 'FL Studio',
    version: v('flstudio'),
    build: b('flstudio'),
    copyright: `Copyright ${COPYRIGHT_YEAR} Image-Line. All rights reserved.`,
    developer: 'Image-Line',
    website: 'https://image-line.com/flstudio',
    sourceCode: `${GITHUB_ORG}/home/blob/main/src/components/ZFLStudioWindow.tsx`,
    releaseDate: r('flstudio'),
    description: 'Digital audio workstation.',
    features: [
      'Step sequencer',
      'Piano roll',
      'Mixer integration',
      'Plugin support',
    ],
    shortcuts: [],
  },

  abletonlive: {
    id: 'abletonlive',
    name: 'Ableton Live',
    version: v('abletonlive'),
    build: b('abletonlive'),
    copyright: `Copyright ${COPYRIGHT_YEAR} Ableton AG. All rights reserved.`,
    developer: 'Ableton AG',
    website: 'https://ableton.com',
    sourceCode: `${GITHUB_ORG}/home/blob/main/src/components/ZAbletonLiveWindow.tsx`,
    releaseDate: r('abletonlive'),
    description: 'Music production and performance.',
    features: [
      'Session view',
      'Arrangement view',
      'Live performance tools',
      'Audio warping',
    ],
    shortcuts: [],
  },

  rekordbox: {
    id: 'rekordbox',
    name: 'rekordbox',
    version: v('rekordbox'),
    build: b('rekordbox'),
    copyright: `Copyright ${COPYRIGHT_YEAR} AlphaTheta Corporation. All rights reserved.`,
    developer: 'AlphaTheta Corporation',
    website: 'https://rekordbox.com',
    sourceCode: `${GITHUB_ORG}/home/blob/main/src/components/ZRekordboxWindow.tsx`,
    releaseDate: r('rekordbox'),
    description: 'DJ software for music management.',
    features: [
      'Track library management',
      'Waveform analysis',
      'Playlist creation',
      'Export to USB',
    ],
    shortcuts: [],
  },

  // System Utilities
  diskutility: {
    id: 'diskutility',
    name: 'Disk Utility',
    version: v('diskutility'),
    build: b('diskutility'),
    copyright: `Copyright ${COPYRIGHT_YEAR} ${DEVELOPER}. All rights reserved.`,
    developer: DEVELOPER,
    website: 'https://zeekay.io',
    sourceCode: `${GITHUB_ORG}/home/blob/main/src/components/ZDiskUtilityWindow.tsx`,
    releaseDate: r('diskutility'),
    description: 'Manage disks and volumes.',
    features: [
      'Disk information display',
      'Volume management',
      'First aid tools',
      'Partition editing',
    ],
    shortcuts: [],
  },

  keychainaccess: {
    id: 'keychainaccess',
    name: 'Keychain Access',
    version: v('keychainaccess'),
    build: b('keychainaccess'),
    copyright: `Copyright ${COPYRIGHT_YEAR} ${DEVELOPER}. All rights reserved.`,
    developer: DEVELOPER,
    website: 'https://zeekay.io',
    sourceCode: `${GITHUB_ORG}/home/blob/main/src/components/ZKeychainAccessWindow.tsx`,
    releaseDate: r('keychainaccess'),
    description: 'Manage passwords and certificates.',
    features: [
      'Password management',
      'Certificate storage',
      'Secure notes',
      'WiFi passwords',
    ],
    shortcuts: [],
  },

  audiomidisetup: {
    id: 'audiomidisetup',
    name: 'Audio MIDI Setup',
    version: v('audiomidisetup'),
    build: b('audiomidisetup'),
    copyright: `Copyright ${COPYRIGHT_YEAR} ${DEVELOPER}. All rights reserved.`,
    developer: DEVELOPER,
    website: 'https://zeekay.io',
    sourceCode: `${GITHUB_ORG}/home/blob/main/src/components/ZAudioMIDISetupWindow.tsx`,
    releaseDate: r('audiomidisetup'),
    description: 'Configure audio devices and MIDI.',
    features: [
      'Audio device configuration',
      'MIDI device setup',
      'Aggregate device creation',
      'Sample rate settings',
    ],
    shortcuts: [],
  },

  digitalcolormeter: {
    id: 'digitalcolormeter',
    name: 'Digital Color Meter',
    version: v('digitalcolormeter'),
    build: b('digitalcolormeter'),
    copyright: `Copyright ${COPYRIGHT_YEAR} ${DEVELOPER}. All rights reserved.`,
    developer: DEVELOPER,
    website: 'https://zeekay.io',
    sourceCode: `${GITHUB_ORG}/home/blob/main/src/components/ZDigitalColorMeterWindow.tsx`,
    releaseDate: r('digitalcolormeter'),
    description: 'Pick colors from anywhere on screen.',
    features: [
      'Color picking from screen',
      'Multiple color formats',
      'Color history',
      'Magnification',
    ],
    shortcuts: [],
  },

  screenshot: {
    id: 'screenshot',
    name: 'Screenshot',
    version: v('screenshot'),
    build: b('screenshot'),
    copyright: `Copyright ${COPYRIGHT_YEAR} ${DEVELOPER}. All rights reserved.`,
    developer: DEVELOPER,
    website: 'https://zeekay.io',
    sourceCode: `${GITHUB_ORG}/home/blob/main/src/components/ZScreenshotWindow.tsx`,
    releaseDate: r('screenshot'),
    description: 'Capture screenshots and recordings.',
    features: [
      'Screen capture',
      'Window capture',
      'Selection capture',
      'Timer delay',
    ],
    shortcuts: [
      { key: 'Cmd+Shift+3', action: 'Capture Full Screen' },
      { key: 'Cmd+Shift+4', action: 'Capture Selection' },
      { key: 'Cmd+Shift+5', action: 'Screenshot Options' },
    ],
  },

  screentime: {
    id: 'screentime',
    name: 'Screen Time',
    version: v('screentime'),
    build: b('screentime'),
    copyright: `Copyright ${COPYRIGHT_YEAR} ${DEVELOPER}. All rights reserved.`,
    developer: DEVELOPER,
    website: 'https://zeekay.io',
    sourceCode: `${GITHUB_ORG}/home/blob/main/src/components/ZScreenTimeWindow.tsx`,
    releaseDate: r('screentime'),
    description: 'Track app usage and set limits.',
    features: [
      'App usage tracking',
      'Daily statistics',
      'Usage limits',
      'Downtime scheduling',
    ],
    shortcuts: [],
  },

  blog: {
    id: 'blog',
    name: 'Blog',
    version: v('blog'),
    build: b('blog'),
    copyright: `Copyright ${COPYRIGHT_YEAR} ${DEVELOPER}. All rights reserved.`,
    developer: DEVELOPER,
    website: 'https://zeekay.io/blog',
    sourceCode: `${GITHUB_ORG}/home/blob/main/src/components/ZBlogWindow.tsx`,
    releaseDate: r('blog'),
    description: 'Personal blog - thoughts on AI, blockchain, open source, and building companies.',
    features: [
      'Backdated posts from 2010-2025',
      'Markdown rendering',
      'Search and filter by year, tag',
      'Featured posts',
      'Reading time estimates',
    ],
    shortcuts: [],
    credits: ['Zach Kelling - Author'],
  },
};

export const getAppMetadata = (appId: string): AppMetadata | undefined => {
  return appMetadata[appId];
};

// zOS system info - pulls from ZOS_VERSION
export const systemInfo = {
  name: 'zOS',
  version: ZOS_VERSION.version,
  build: formatBuild(ZOS_VERSION.build),
  copyright: `Copyright ${COPYRIGHT_YEAR} ${DEVELOPER}. All rights reserved.`,
  developer: DEVELOPER,
  website: 'https://zeekay.io',
  sourceCode: `${GITHUB_ORG}/home`,
  releaseDate: ZOS_VERSION.releaseDate,
};

// Re-export types and functions from appRegistry
export { appRegistry, getAppRegistryEntry, type AppRegistryEntry } from './appRegistry';
export { appVersions, getAppVersion, formatVersion, type AppVersion } from './appVersions';
