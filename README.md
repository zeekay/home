# zOS

Personal website for Zach Kelling (Z) - a macOS-inspired portfolio and desktop environment.

**Live**: [zeekay.ai](https://zeekay.ai)

## Features

- macOS Big Sur-style desktop interface
- Interactive dock with custom applications
- Terminal emulator with WebContainer integration
- Finder with project browsing
- Safari, Mail, Music, Photos apps
- AI assistants (Hanzo, Zoo)
- Lux cryptocurrency wallet

## Apps

| App | Version | Category | Description |
|-----|---------|----------|-------------|
| Finder | 14.0.0 | System | File manager with Quick Look |
| App Store | 3.0.0 | System | App catalog and updates |
| Safari | 18.2.0 | Productivity | Web browser with tabs |
| Mail | 16.0.0 | Productivity | Email client |
| Calendar | 14.0.0 | Productivity | Cal.com scheduling |
| Notes | 5.2.0 | Productivity | Rich text notes |
| TextEdit | 1.18.0 | Productivity | Text editor |
| Music | 1.5.2 | Entertainment | Spotify/SoundCloud |
| Photos | 9.0.0 | Entertainment | Instagram gallery |
| Messages | 14.2.0 | Social | Messenger integration |
| FaceTime | 6.0.0 | Social | Video calls |
| Terminal | 2.14.0 | Developer Tools | WebContainer shell |
| Xcode | 16.2.0 | Developer Tools | Monaco IDE |
| Calculator | 11.1.0 | Utilities | Scientific calculator |
| Weather | 4.0.0 | Utilities | Weather forecasts |
| Clock | 1.0.0 | Utilities | World clock |
| Hanzo AI | 2.0.0 | AI | AI assistant |
| Zoo | 1.0.0 | AI | Research assistant |
| Lux Wallet | 1.0.0 | Finance | Crypto wallet |

## Tech Stack

- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui + Radix UI
- **State**: React Context + React Query
- **Terminal**: WebContainer API

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

## Version Management

```bash
# Bump zOS version
npm run version:patch    # 4.2.0 -> 4.2.1
npm run version:minor    # 4.2.0 -> 4.3.0
npm run version:major    # 4.2.0 -> 5.0.0

# Bump individual app version
npm run version:app patch finder

# Generate changelog
npm run changelog

# Create release
npm run release:patch    # Full release workflow
```

## Project Structure

```
src/
  components/      # React components
    apps/         # App module exports
  config/         # Version and registry config
    appVersions.ts
    appRegistry.ts
    appMetadata.ts
  hooks/          # Custom hooks
  contexts/       # React contexts
  sdk/            # zOS SDK for app development
scripts/          # Build and release scripts
```

## Deployment

Deploys automatically to GitHub Pages on push to `main`. Tagged releases (e.g., `v4.3.0`) trigger GitHub Release creation with auto-generated changelog.

```bash
# Manual release
npm run release:minor
git push && git push --tags
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Links

- Website: [zeekay.ai](https://zeekay.ai)
- GitHub: [github.com/zeekay](https://github.com/zeekay)
- Twitter: [twitter.com/zeekay](https://twitter.com/zeekay)

## License

MIT
