/**
 * App Module Exports
 *
 * Central export point for all zOS application components.
 * Each app is lazily loaded for optimal bundle size.
 */

import { lazy } from 'react';

// System Apps
export const Finder = lazy(() => import('../ZFinderWindow'));
export const AppStore = lazy(() => import('../ZAppStoreWindow'));
export const SystemPreferences = lazy(() => import('../ZSystemPreferencesWindow'));

// Productivity Apps
export const Safari = lazy(() => import('../ZSafariWindow'));
export const Mail = lazy(() => import('../ZEmailWindow'));
export const Calendar = lazy(() => import('../ZCalendarWindow'));
export const Notes = lazy(() => import('../ZNotesWindow'));
export const TextEdit = lazy(() => import('../ZTextPadWindow'));
export const Stickies = lazy(() => import('../ZStickiesWindow'));

// Entertainment Apps
export const Music = lazy(() => import('../ZMusicWindow'));
export const Photos = lazy(() => import('../ZPhotosWindow'));
export const iTunes = lazy(() => import('../ZITunesWindow'));

// Social Apps
export const Messages = lazy(() => import('../ZMessagesWindow'));
export const FaceTime = lazy(() => import('../ZFaceTimeWindow'));
export const Socials = lazy(() => import('../ZSocialsWindow'));

// Developer Tools
export const Terminal = lazy(() => import('../ZTerminalWindow'));
export const Xcode = lazy(() => import('../ZCodeWindow'));
export const GitHubStats = lazy(() => import('../ZGitHubStatsWindow'));

// Utilities
export const Calculator = lazy(() => import('../ZCalculatorWindow'));
export const Weather = lazy(() => import('../ZWeatherWindow'));
export const Clock = lazy(() => import('../ZClockWindow'));
export const Stats = lazy(() => import('../ZStatsWindow'));

// AI Apps
export const HanzoAI = lazy(() => import('../HanzoAIWindow'));
export const Zoo = lazy(() => import('../ZooAssistantWindow'));

// Finance
export const LuxWallet = lazy(() => import('../LuxWalletWindow'));

// App component mapping by ID
export const appComponents: Record<string, React.LazyExoticComponent<React.ComponentType<unknown>>> = {
  finder: Finder,
  appstore: AppStore,
  systempreferences: SystemPreferences,
  safari: Safari,
  mail: Mail,
  calendar: Calendar,
  notes: Notes,
  textedit: TextEdit,
  stickies: Stickies,
  music: Music,
  photos: Photos,
  itunes: iTunes,
  messages: Messages,
  facetime: FaceTime,
  socials: Socials,
  terminal: Terminal,
  xcode: Xcode,
  githubstats: GitHubStats,
  calculator: Calculator,
  weather: Weather,
  clock: Clock,
  stats: Stats,
  hanzo: HanzoAI,
  zoo: Zoo,
  lux: LuxWallet,
};

/**
 * Get app component by ID
 */
export function getAppComponent(appId: string): React.LazyExoticComponent<React.ComponentType<unknown>> | undefined {
  return appComponents[appId];
}

// Re-export config
export { appRegistry, getAppRegistryEntry, type AppRegistryEntry } from '../../config/appRegistry';
export { appVersions, getAppVersion, formatVersion, type AppVersion } from '../../config/appVersions';
export { appMetadata, getAppMetadata, systemInfo, type AppMetadata } from '../../config/appMetadata';
