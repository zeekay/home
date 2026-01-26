/**
 * Lazy-loaded window components for code splitting
 *
 * Heavy window components are loaded on-demand to reduce initial bundle size.
 * This includes windows with external dependencies like:
 * - Calendar (date-fns, react-day-picker)
 * - Weather (API calls, complex UI)
 * - Terminal (CodeMirror, WebContainer)
 * - Music (audio playback)
 */

import React, { Suspense, lazy, ComponentType } from 'react';

// Loading fallback component
const WindowLoading: React.FC<{ title: string }> = ({ title }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
    <div className="bg-gray-900/95 border border-white/10 rounded-xl p-6 shadow-2xl">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        <span className="text-white/80 text-sm">Loading {title}...</span>
      </div>
    </div>
  </div>
);

// Error boundary for lazy components
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class LazyWindowErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: string },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; fallback: string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="bg-red-900/95 border border-red-500/30 rounded-xl p-6 shadow-2xl max-w-md">
            <h3 className="text-white font-medium mb-2">Failed to load {this.props.fallback}</h3>
            <p className="text-red-200/80 text-sm">{this.state.error?.message}</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Generic lazy wrapper with suspense
function createLazyWindow<P extends { onClose: () => void }>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  displayName: string
) {
  const LazyComponent = lazy(importFn);

  const WrappedComponent = (props: P) => (
    <LazyWindowErrorBoundary fallback={displayName}>
      <Suspense fallback={<WindowLoading title={displayName} />}>
        <LazyComponent {...props} />
      </Suspense>
    </LazyWindowErrorBoundary>
  );

  WrappedComponent.displayName = `Lazy${displayName}`;
  return WrappedComponent;
}

// Lazy-loaded window components
// Heavy components that benefit from code splitting

// Terminal - heavy due to CodeMirror and WebContainer
export const LazyZTerminalWindow = createLazyWindow(
  () => import('./ZTerminalWindow'),
  'Terminal'
);

// Calendar - uses date-fns and react-day-picker
export const LazyZCalendarWindow = createLazyWindow(
  () => import('./ZCalendarWindow'),
  'Calendar'
);

// Weather - complex component with API calls
export const LazyZWeatherWindow = createLazyWindow(
  () => import('./ZWeatherWindow'),
  'Weather'
);

// Music - audio playback component
export const LazyZMusicWindow = createLazyWindow(
  () => import('./ZMusicWindow'),
  'Music'
);

// Photos - image gallery
export const LazyZPhotosWindow = createLazyWindow(
  () => import('./ZPhotosWindow'),
  'Photos'
);

// Safari - browser component
export const LazyZSafariWindow = createLazyWindow(
  () => import('./ZSafariWindow'),
  'Safari'
);

// GitHub Stats - data visualization
export const LazyZGitHubStatsWindow = createLazyWindow(
  () => import('./ZGitHubStatsWindow'),
  'GitHub Stats'
);

// System Preferences - complex settings UI
export const LazyZSystemPreferencesWindow = createLazyWindow(
  () => import('./ZSystemPreferencesWindow'),
  'System Preferences'
);

// FaceTime - video component
export const LazyZFaceTimeWindow = createLazyWindow(
  () => import('./ZFaceTimeWindow'),
  'FaceTime'
);

// Notes - editor component
export const LazyZNotesWindow = createLazyWindow(
  () => import('./ZNotesWindow'),
  'Notes'
);

// Hanzo AI - chat interface
export const LazyHanzoAIWindow = createLazyWindow(
  () => import('./HanzoAIWindow'),
  'Hanzo AI'
);

// Lux Wallet - wallet interface
export const LazyLuxWalletWindow = createLazyWindow(
  () => import('./LuxWalletWindow'),
  'Lux Wallet'
);

// Zoo Assistant - chat interface
export const LazyZooAssistantWindow = createLazyWindow(
  () => import('./ZooAssistantWindow'),
  'Zoo'
);

// Xcode - IDE for editing zOS source
export const LazyZCodeWindow = createLazyWindow(
  () => import('./ZCodeWindow'),
  'Xcode'
);

// App Store - Browse and install apps
export const LazyZAppStoreWindow = createLazyWindow(
  () => import('./ZAppStoreWindow'),
  'App Store'
);

// Messages - X/Twitter DMs
export const LazyZMessagesWindow = createLazyWindow(
  () => import('./ZMessagesWindow'),
  'Messages'
);

// Shortcuts - Automation app
export const LazyZShortcutsWindow = createLazyWindow(
  () => import('./ZShortcutsWindow'),
  'Shortcuts'
);

// Digital Color Meter - Color picker utility
export const LazyZDigitalColorMeterWindow = createLazyWindow(
  () => import('./ZDigitalColorMeterWindow'),
  'Digital Color Meter'
);

// Grapher - Math equation visualization
export const LazyZGrapherWindow = createLazyWindow(
  () => import('./ZGrapherWindow'),
  'Grapher'
);

// Disk Utility - Disk management utility
export const LazyZDiskUtilityWindow = createLazyWindow(
  () => import('./ZDiskUtilityWindow'),
  'Disk Utility'
);

// Discord - Discord integration widget
export const LazyZDiscordWindow = createLazyWindow(
  () => import('./ZDiscordWindow'),
  'Discord'
);

// Twitter/X - Twitter integration widget
export const LazyZTwitterWindow = createLazyWindow(
  () => import('./ZTwitterWindow'),
  'X'
);

// Slack - Slack integration widget
export const LazyZSlackWindow = createLazyWindow(
  () => import('./ZSlackWindow'),
  'Slack'
);

// Logic Pro - DAW for music production
export const LazyZLogicProWindow = createLazyWindow(
  () => import('./ZLogicProWindow'),
  'Logic Pro'
);

// FL Studio - DAW for music production
export const LazyZFLStudioWindow = createLazyWindow(
  () => import('./ZFLStudioWindow'),
  'FL Studio'
);

// Ableton Live - DAW for music production and performance
export const LazyZAbletonLiveWindow = createLazyWindow(
  () => import('./ZAbletonLiveWindow'),
  'Ableton Live'
);

// rekordbox - DJ software
export const LazyZRekordboxWindow = createLazyWindow(
  () => import('./ZRekordboxWindow'),
  'rekordbox'
);

// VS Code - Code editor
export const LazyZVSCodeWindow = createLazyWindow(
  () => import('./ZVSCodeWindow'),
  'Visual Studio Code'
);

// Figma - Design tool
export const LazyZFigmaWindow = createLazyWindow(
  () => import('./ZFigmaWindow'),
  'Figma'
);

// Sketch - Design tool
export const LazyZSketchWindow = createLazyWindow(
  () => import('./ZSketchWindow'),
  'Sketch'
);

// After Effects - Motion graphics
export const LazyZAfterEffectsWindow = createLazyWindow(
  () => import('./ZAfterEffectsWindow'),
  'After Effects'
);

// Console - System logs
export const LazyZConsoleWindow = createLazyWindow(
  () => import('./ZConsoleWindow'),
  'Console'
);

// Keychain Access - Password manager
export const LazyZKeychainAccessWindow = createLazyWindow(
  () => import('./ZKeychainAccessWindow'),
  'Keychain Access'
);

// Audio MIDI Setup - Audio device configuration
export const LazyZAudioMIDISetupWindow = createLazyWindow(
  () => import('./ZAudioMIDISetupWindow'),
  'Audio MIDI Setup'
);

// Screenshot - Screen capture utility
export const LazyZScreenshotWindow = createLazyWindow(
  () => import('./ZScreenshotWindow'),
  'Screenshot'
);

// Screen Time - Usage tracking
export const LazyZScreenTimeWindow = createLazyWindow(
  () => import('./ZScreenTimeWindow'),
  'Screen Time'
);

// Mastodon - Decentralized social network
export const LazyZMastodonWindow = createLazyWindow(
  () => import('./ZMastodonWindow'),
  'Mastodon'
);
