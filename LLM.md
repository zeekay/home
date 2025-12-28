# zOS - Web-Based macOS-Style Desktop Environment

## Overview
zOS is a comprehensive web-based operating system that recreates the macOS desktop experience in the browser. Built with React, TypeScript, and Tailwind CSS.

## Version
- **System**: zOS 15.2.0 (Build 24093)
- **Package**: 4.2.0

## Architecture

### Context Providers (13 total - 3,427 lines)
All state is managed via React Context with localStorage persistence:

| Context | Purpose | Lines |
|---------|---------|-------|
| `SpacesContext` | Virtual desktop/spaces management | 187 |
| `ClipboardContext` | System-wide clipboard history | 190 |
| `WidgetContext` | Desktop widget management | 229 |
| `NotificationContext` | Notification system | 242 |
| `FileTagsContext` | File tags & smart folders | 252 |
| `AccessibilityContext` | Accessibility settings | 302 |
| `FocusModeContext` | Focus modes with scheduling | 361 |
| `DragDropContext` | System-wide drag & drop | 447 |
| `ShortcutsContext` | Automation workflows | 499 |
| `DockContext` | Dock management | 160 |
| `TerminalContext` | Terminal state | 154 |
| `RecentsContext` | Recent files/apps | 110 |
| `UserContext` | User preferences | 294 |

### Core Components

#### System Features
- **SpotlightSearch** - Fuzzy search, calculator, unit conversion, AI suggestions
- **MissionControl** - Exposé with virtual spaces (Ctrl+Up)
- **NotificationCenter** - Grouped notifications with actions
- **ClipboardManager** - History with pinning (Cmd+Shift+V)
- **QuickLook** - File preview (Space key)
- **FocusModeSelector** - Work/Personal/DND modes
- **BootSequence** - macOS-style boot animation
- **LockScreen** - Password lock with user profile
- **RestartScreen** - Shutdown/restart animations

#### Desktop Widgets (10 widgets)
Located in `src/components/widgets/`:
- ClockWidget - Analog/digital time
- CalendarWidget - Month view with events
- WeatherWidget - Current conditions + forecast
- NotesWidget - Quick notes
- PhotosWidget - Photo slideshow
- StocksWidget - Stock ticker
- BatteryWidget - Battery status
- DesktopWidget - Base widget wrapper
- WidgetGallery - Widget picker

### Applications (20+ apps)

| App | File Size | Features |
|-----|-----------|----------|
| Finder | 66KB | Tabs, column view, tags, Quick Look |
| Code/Xcode | 30KB | Monaco editor, file tree, themes |
| Mail | 29KB | Contact form, templates, attachments |
| Shortcuts | 28KB | Visual automation, triggers, actions |
| Zoo Assistant | 27KB | AI chat, suggestions |
| GitHub Stats | 22KB | Profile, repos, contributions |
| Safari | 20KB | Tab groups, bookmarks, sidebar, start page |
| Socials | 19KB | Twitter, Instagram, GitHub feeds |
| Music | 18KB | Spotify integration, SoundCloud |
| Photos | 18KB | Gallery, albums, slideshows |
| App Store | 18KB | Catalog, versions, categories |
| Notes | 17KB | Rich text, folders, search |
| Weather | 17KB | Forecasts, locations, alerts |
| Terminal | 13KB | Tabs, profiles, SSH, splits |
| FaceTime | 10KB | Video calls, contacts |
| Messages | 10KB | Chat interface, contacts |
| Clock | 10KB | World clock, alarms, stopwatch |
| Stickies | 9KB | Sticky notes, colors |
| iTunes | 9KB | Legacy music player |
| Calculator | 7KB | Basic + scientific modes |
| Calendar | 4KB | Cal.com integration |

### Directory Structure
```
src/
├── components/
│   ├── Z*Window.tsx      # App windows (20+)
│   ├── safari/           # Safari components
│   ├── terminal/         # Terminal components
│   ├── widgets/          # Desktop widgets
│   ├── system-preferences/ # Settings panels
│   ├── dock/             # Dock components
│   └── ui/               # Shadcn components
├── contexts/             # State management (13 contexts)
├── hooks/                # Custom hooks
├── types/                # TypeScript types
├── config/               # App metadata, versions
└── lib/                  # Utilities
```

### Key Hooks
- `useWindowManager` - Window state, focus, z-index
- `useOverlays` - Spotlight, Mission Control, Quick Look
- `useTerminalWindow` - Terminal tabs, panes, profiles
- `useSystemPreferences` - System settings
- `useKeyboardShortcuts` - Global keyboard shortcuts
- `useSpotify` - Spotify API integration

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| Cmd+Space | Spotlight Search |
| Ctrl+Up | Mission Control |
| Cmd+Shift+V | Clipboard Manager |
| Space | Quick Look (in Finder) |
| Cmd+T | New Tab (Finder/Safari/Terminal) |
| Cmd+W | Close Tab |
| Cmd+Shift+D | Toggle Focus Mode |
| Ctrl+Cmd+Q | Lock Screen |
| Cmd+, | Preferences |

### Data Persistence
All data uses localStorage (NO Firebase/Supabase):
- `zos-*` prefix for system data
- Each app stores its own state
- File system simulated in memory
- Clipboard history persisted
- Widget positions saved

### Scripts
```bash
npm run build          # Production build
npm run dev            # Development server
npx tsx scripts/version.ts patch        # Bump version
npx tsx scripts/version.ts patch finder # Bump app version
npx tsx scripts/release.ts              # Create release
```

### Technologies
- React 18 + TypeScript
- Tailwind CSS + Shadcn/UI
- Vite build system
- TanStack Query
- Lucide Icons
- Monaco Editor (Code)
- date-fns

### Build Output
- Main bundle: ~633KB (gzipped: 167KB)
- Total components: 248 TypeScript files
- Component lines: ~59,000 lines

## Recent Changes (v15.2.0)
1. Added 13 context providers for state management
2. Implemented Mission Control with virtual spaces
3. Added Clipboard Manager with history
4. Created 10 desktop widgets
5. Built Shortcuts/Automation app
6. Added Quick Look file preview
7. Implemented File Tags & Smart Folders
8. Added Focus Modes with scheduling
9. Created comprehensive app deep dives
10. All apps individually versioned
