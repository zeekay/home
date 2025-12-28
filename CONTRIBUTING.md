# Contributing to zOS

Thank you for your interest in contributing to zOS! This document provides guidelines and instructions for contributing.

## Development Setup

```bash
# Clone the repository
git clone https://github.com/zeekay/home.git
cd home

# Install dependencies
npm install

# Start development server
npm run dev
```

## Project Structure

```
src/
  components/       # React components
    apps/          # App module exports
    dock/          # Dock components
    safari/        # Safari browser components
    terminal/      # Terminal components
    ui/            # Reusable UI components
    window/        # Window management components
  config/          # Configuration files
    appVersions.ts # App version tracking
    appRegistry.ts # App catalog
    appMetadata.ts # App display metadata
  contexts/        # React contexts
  hooks/           # Custom hooks
  lib/             # Utility libraries
  pages/           # Page components
  sdk/             # zOS SDK for app development
  services/        # External service integrations
  types/           # TypeScript types
  utils/           # Utility functions
scripts/           # Build and release scripts
```

## Creating a New App

1. Create the app component in `src/components/`:

```tsx
// src/components/ZMyAppWindow.tsx
import { memo } from 'react';

interface ZMyAppWindowProps {
  onClose?: () => void;
}

export const ZMyAppWindow = memo(function ZMyAppWindow({ onClose }: ZMyAppWindowProps) {
  return (
    <div className="h-full bg-white dark:bg-gray-900">
      {/* App content */}
    </div>
  );
});

export default ZMyAppWindow;
```

2. Add version info to `src/config/appVersions.ts`:

```typescript
myapp: {
  version: '1.0.0',
  build: 100,
  releaseDate: '2024-12-27',
  changelog: [
    'Initial release',
  ],
},
```

3. Add registry entry to `src/config/appRegistry.ts`:

```typescript
{
  id: 'myapp',
  name: 'My App',
  bundleId: 'com.zeekay.myapp',
  category: 'Utilities',
  icon: 'Box',
  description: 'Description of my app',
  dependencies: [],
  systemApp: false,
  featured: false,
  component: 'ZMyAppWindow',
},
```

4. Add metadata to `src/config/appMetadata.ts`:

```typescript
myapp: {
  id: 'myapp',
  name: 'My App',
  version: v('myapp'),
  build: b('myapp'),
  copyright: `Copyright ${COPYRIGHT_YEAR} ${DEVELOPER}. All rights reserved.`,
  developer: DEVELOPER,
  website: 'https://zeekay.ai',
  sourceCode: `${GITHUB_ORG}/home/blob/main/src/components/ZMyAppWindow.tsx`,
  releaseDate: r('myapp'),
  description: 'Description of my app.',
  features: ['Feature 1', 'Feature 2'],
  shortcuts: [{ key: 'Cmd+N', action: 'New' }],
},
```

5. Export from `src/components/apps/index.ts`:

```typescript
export const MyApp = lazy(() => import('../ZMyAppWindow'));

// Add to appComponents map
myapp: MyApp,
```

## Versioning

We use semantic versioning (SemVer):

- **MAJOR**: Breaking changes
- **MINOR**: New features, backward compatible
- **PATCH**: Bug fixes, backward compatible

### Version Commands

```bash
# Bump zOS version
npm run version:patch   # 4.2.0 -> 4.2.1
npm run version:minor   # 4.2.0 -> 4.3.0
npm run version:major   # 4.2.0 -> 5.0.0

# Bump individual app version
npm run version:app patch finder   # finder 14.0.0 -> 14.0.1

# Generate changelog
npm run changelog

# Create release (bump version, changelog, tag)
npm run release:patch
npm run release:minor
npm run release:major
```

## Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Test changes
- `build`: Build system changes
- `ci`: CI/CD changes
- `chore`: Maintenance tasks

### Examples

```
feat(safari): add tab browsing support
fix(terminal): correct command history navigation
docs(readme): update installation instructions
refactor(window): simplify resize logic
```

## Pull Request Process

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Make your changes
4. Run tests: `npm test`
5. Run linting: `npm run lint`
6. Commit with conventional commit message
7. Push to your fork
8. Open a pull request

### PR Requirements

- [ ] Tests pass
- [ ] Lint passes
- [ ] Conventional commit messages
- [ ] Updated documentation if needed
- [ ] Updated CHANGELOG.md for significant changes

## Code Style

- Use TypeScript for all new code
- Follow existing patterns and conventions
- Use functional components with hooks
- Prefer composition over inheritance
- Keep components small and focused

## Testing

```bash
# Run all tests
npm test

# Run tests once
npm run test:run

# Run specific test file
npm test -- src/hooks/__tests__/useWindowManager.test.ts
```

## Questions?

- Open an issue on GitHub
- Contact: z@zeekay.ai

Thank you for contributing!
