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

### Applications (45+ apps)

#### Productivity & System
| App | Features |
|-----|----------|
| Finder | Tabs, column view, tags, Quick Look |
| Safari | Tab groups, bookmarks, sidebar, start page |
| Mail | Contact form, templates, attachments |
| Notes | Rich text, folders, search |
| Calendar | Cal.com integration |
| Messages | Chat interface, contacts |
| Calculator | Basic + scientific modes |
| System Preferences | All system settings |
| App Store | 110+ apps from zos-apps GitHub org |

#### Development & Creative
| App | Features |
|-----|----------|
| Xcode | Monaco editor, file tree, themes |
| VS Code | Full IDE experience |
| Terminal | Tabs, profiles, SSH, splits |
| Console | System logs viewer |
| Figma | Design tool integration |
| Sketch | Vector design |
| After Effects | Motion graphics |

#### Audio Production (DAWs)
| App | Features |
|-----|----------|
| Logic Pro | Full DAW interface |
| FL Studio | Music production |
| Ableton Live | Performance & production |
| rekordbox | DJ software interface |
| Audio MIDI Setup | Device configuration |

#### Entertainment & Social
| App | Features |
|-----|----------|
| Music | Spotify + SoundCloud (@requite) integration |
| Photos | Gallery, albums, slideshows |
| FaceTime | Video calls |
| Discord | Discord widget |
| Slack | Slack widget |
| Twitter/X | Social feed |
| Mastodon | Decentralized social |

#### AI & Web3
| App | Features |
|-----|----------|
| Hanzo AI | AI chat assistant |
| Zoo Assistant | AI suggestions |
| Lux Wallet | Full Web3 wallet, multi-chain, DeFi |

#### Utilities
| App | Features |
|-----|----------|
| Weather | Forecasts, locations, alerts |
| Clock | World clock, alarms, stopwatch |
| Screenshot | Screen capture |
| Screen Time | Usage tracking |
| Digital Color Meter | Color picker |
| Disk Utility | Storage management |
| Keychain Access | Password manager |
| Grapher | Math visualization |

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
- **Web3**: wagmi v2, viem, @scure/bip39, @scure/bip32
- **DeFi**: @uniswap/v3-sdk, @uniswap/sdk-core

## Web3 Wallet Architecture

### Services Structure
```
src/services/
├── wallet/
│   ├── encryptionService.ts   # AES-256-GCM via Web Crypto API
│   ├── keyringService.ts      # BIP39/BIP32 HD key derivation
│   ├── storageService.ts      # Encrypted localStorage vault
│   ├── walletService.ts       # Core wallet management
│   └── index.ts
├── chain/
│   ├── chainConfigs.ts        # Lux + all EVM chains
│   ├── chainService.ts        # Multi-chain clients
│   └── index.ts
└── defi/
    ├── priceService.ts        # CoinGecko prices
    ├── oneInchService.ts      # 1inch DEX aggregator
    ├── uniswapService.ts      # Uniswap V3 SDK
    ├── defiService.ts         # Unified swap interface
    └── index.ts
```

### Encryption (encryptionService.ts)
- **Algorithm**: AES-256-GCM via Web Crypto API
- **Key Derivation**: PBKDF2 with 310,000 iterations + SHA-256
- **Salt/IV**: 16-byte salt, 12-byte IV per encryption
- **Pattern**: `salt:iv:ciphertext` Base64-encoded

### Key Management (keyringService.ts)
- **Mnemonic**: BIP39 with @scure/bip39 (12/24 words)
- **HD Derivation**: BIP32 with @scure/bip32
- **EVM Path**: `m/44'/60'/0'/0/{index}`
- **Lux Path**: `m/44'/9369'/0'/0/{index}`

### Storage (storageService.ts)
- **Key**: `lux_wallet_encrypted` in localStorage
- **Verifier**: `lux_wallet_verifier` for quick password check
- **Vault Schema**:
  ```typescript
  interface EncryptedVault {
    version: 1;
    encryptedMnemonic?: string;
    accounts: { id, name, address, type, hdPath?, encryptedPrivateKey? }[];
    settings: { autoLockTimeout, biometricEnabled, lastActivity };
  }
  ```

### Chain Support (chainConfigs.ts)
- **Lux Network**: Mainnet (96369), Testnet (96370)
- **EVM Chains**: Ethereum, Arbitrum, Optimism, Base, Polygon, BSC, Avalanche, + 30 more
- All chains from viem/chains automatically included

### DeFi Integration
- **1inch**: DEX aggregator API for best swap rates
- **Uniswap V3**: Direct pool access via SDK
- **Prices**: CoinGecko API with 1-minute cache

### WalletContext
```typescript
interface WalletContextType {
  isInitialized: boolean;
  isLocked: boolean;
  accounts: WalletAccount[];
  activeAccount: WalletAccount | null;
  balances: Map<number, TokenBalance[]>;

  createWallet: (password: string, wordCount?: 12 | 24) => Promise<string>;
  importFromMnemonic: (mnemonic: string, password: string) => Promise<void>;
  unlock: (password: string) => Promise<boolean>;
  lock: () => void;
  signAndSendTransaction: (tx: TransactionRequest) => Promise<`0x${string}`>;
}
```

### Lux Wallet Window
- **Onboarding**: Create/import wallet with password encryption
- **Lock Screen**: Password unlock with auto-lock timer
- **Dashboard**: Portfolio value, chain selection, token balances
- **Send/Receive**: Transaction building with gas estimation
- **DeFi**: Swap UI with 1inch + Uniswap integration
- **Staking**: Validator delegation (Lux P-Chain)
- **Security**: Export mnemonic, change password, reset

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

## Recent Session Updates
### SoundCloud Integration
- Music app now embeds SoundCloud player for @requite profile
- Tabs: Stream, Tracks, Playlists with embedded player
- Quick links for Reposts/Likes (open in new tab)
- Debug info shows current profile handle

### App Store Optimization
- Static manifest at `/data/zos-apps.json` (110 apps)
- Avoids GitHub API rate limits (was 112 API calls per load)
- Falls back to GitHub API if static file unavailable
- Apps fetched from `zos-apps` GitHub organization

### New Window Components (45 total)
- DAWs: Logic Pro, FL Studio, Ableton Live, rekordbox
- Social: Discord, Slack, Twitter/X, Mastodon
- Dev: VS Code, Console, Figma, Sketch, After Effects
- Utils: Screenshot, Screen Time, Digital Color Meter, Disk Utility
- All lazy-loaded for code splitting

### Test Status
- 260 tests passing
- TypeScript: No errors
- Build: ~633KB main bundle
