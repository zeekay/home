# zOS SDK

The official SDK for building zOS applications. Create native-feeling apps that integrate seamlessly with the zOS desktop environment.

## Quick Start

```tsx
import { ZOSApp, useSDK, createManifest } from '@/sdk';

// Define your app manifest
const manifest = createManifest({
  identifier: 'ai.hanzo.myapp',
  name: 'My App',
  description: 'A sample zOS application',
  window: {
    defaultSize: { width: 600, height: 400 },
  }
});

// Create your app component
function MyApp({ onClose }) {
  return (
    <ZOSApp manifest={manifest} onClose={onClose}>
      <MyAppContent />
    </ZOSApp>
  );
}

// Use SDK hooks in your content
function MyAppContent() {
  const { notifications, storage } = useSDK();

  const handleSave = () => {
    storage.set('data', { saved: true });
    notifications.show({
      title: 'Saved!',
      type: 'success'
    });
  };

  return (
    <div className="p-4">
      <h1>My App</h1>
      <button onClick={handleSave}>Save</button>
    </div>
  );
}
```

## App Manifest

Every zOS app needs a manifest that defines its metadata and capabilities:

```typescript
interface AppManifest {
  // Required
  identifier: string;  // Bundle ID (e.g., "ai.hanzo.calculator")
  name: string;        // Display name
  version: string;     // Semantic version (e.g., "1.0.0")

  // Optional
  description?: string;
  author?: string;
  icon?: AppIcon;
  category?: AppCategory;
  permissions?: AppPermission[];
  window?: WindowConfig;
}
```

### Categories

- `productivity` - Work and productivity apps
- `development` - Developer tools
- `utilities` - System utilities
- `entertainment` - Games and media
- `communication` - Chat, email, video
- `finance` - Financial apps
- `system` - System apps
- `other` - Everything else

### Permissions

Apps can request these permissions:

| Permission | Description |
|------------|-------------|
| `files.read` | Read files from file system |
| `files.write` | Write files to file system |
| `network` | Make network requests |
| `notifications` | Show system notifications |
| `clipboard` | Access clipboard |
| `storage.local` | Local storage access |
| `storage.sync` | Synced storage access |
| `system.settings` | Read/modify system settings |
| `dock.pin` | Pin app to dock |
| `menu.register` | Register menu items |
| `keyboard.global` | Register global shortcuts |

### Window Configuration

```typescript
interface WindowConfig {
  type?: 'default' | 'terminal' | 'safari' | 'textpad' | 'system' | 'about';
  defaultSize?: { width: number; height: number };
  minSize?: { width: number; height: number };
  maxSize?: { width: number; height: number };
  defaultPosition?: { x: number; y: number };
  resizable?: boolean;
  showInDock?: boolean;
  multipleInstances?: boolean;
  background?: 'solid' | 'blur' | 'transparent';
}
```

## SDK Hooks

### useSDK()

Access all SDK functionality from within a `ZOSApp`:

```tsx
const { app, notifications, storage, fs, clipboard, keyboard } = useSDK();
```

### useApp()

Manage app lifecycle and window state:

```tsx
const app = useApp({ manifest, onClose });

// Window state
app.isActive        // Is the window focused?
app.window.isMinimized
app.window.isMaximized
app.window.isTiled  // 'left' | 'right' | null

// Actions
app.close();
app.minimize();
app.maximize();
app.focus();
app.tileLeft();
app.tileRight();
app.restore();
```

### useNotifications()

Show system notifications:

```tsx
const notifications = useNotifications();

// Show a notification
const id = notifications.show({
  title: 'Hello!',
  body: 'This is a notification',
  type: 'info',     // 'info' | 'success' | 'warning' | 'error'
  duration: 5000,   // Auto-dismiss after 5s (0 = persistent)
  onClick: () => console.log('Clicked!'),
  actions: [
    { id: 'view', label: 'View', onClick: () => {} }
  ]
});

// Dismiss
notifications.dismiss(id);
notifications.dismissAll();
```

### useStorage()

Persistent key-value storage:

```tsx
const storage = useStorage<MyData>({
  namespace: 'ai.hanzo.myapp',
  type: 'local'  // 'local' | 'session' | 'sync'
});

// CRUD operations
storage.set('key', { value: 123 });
const data = storage.get('key');
storage.remove('key');
storage.clear();

// Helpers
storage.has('key');   // boolean
storage.keys();       // string[]
```

### useFileSystem()

Virtual file system access:

```tsx
const fs = useFileSystem();

// Read/write files
const content = await fs.readFile('/documents/file.txt');
await fs.writeFile('/documents/file.txt', 'Hello!');
await fs.deleteFile('/documents/file.txt');

// Directories
const files = await fs.listDirectory('/documents');
await fs.createDirectory('/documents/new-folder');

// Helpers
const exists = await fs.exists('/path');
const info = await fs.stat('/path');

// Dialogs
const files = await fs.showOpenDialog({
  title: 'Open File',
  filters: [{ name: 'Text', extensions: ['txt', 'md'] }]
});
const path = await fs.showSaveDialog({ defaultPath: '/documents' });
```

### useClipboard()

System clipboard access:

```tsx
const clipboard = useClipboard();

// Read
const data = await clipboard.read();
console.log(data.text, data.html, data.image);

// Write
await clipboard.writeText('Hello!');
await clipboard.writeHTML('<b>Bold</b>');
await clipboard.writeImage(base64Data);

// Check
const hasContent = await clipboard.hasContent();
```

### useKeyboard()

Register keyboard shortcuts:

```tsx
const keyboard = useKeyboard();

useEffect(() => {
  const unregister = keyboard.register('cmd+s', () => {
    saveDocument();
  }, {
    preventDefault: true,
    whenFocused: true,
    description: 'Save document'
  });

  return unregister;
}, []);

// Cleanup all
keyboard.unregisterAll();
```

## Components

### ZOSApp

Base wrapper for zOS applications:

```tsx
<ZOSApp
  manifest={manifest}
  onClose={() => {}}
  onFocus={() => {}}
  customControls={<CustomTitleBarButtons />}
  className="my-app"
>
  <AppContent />
</ZOSApp>
```

## Creating an App

1. **Create your manifest:**

```tsx
// manifest.ts
import { createManifest } from '@/sdk';

export const manifest = createManifest({
  identifier: 'ai.hanzo.calculator',
  name: 'Calculator',
  version: '1.0.0',
  description: 'A simple calculator',
  category: 'utilities',
  permissions: ['clipboard'],
  window: {
    type: 'default',
    defaultSize: { width: 320, height: 480 },
    resizable: false,
  }
});
```

2. **Create your app component:**

```tsx
// CalculatorWindow.tsx
import React from 'react';
import { ZOSApp, useSDK } from '@/sdk';
import { manifest } from './manifest';

interface Props {
  onClose: () => void;
  onFocus?: () => void;
}

export function CalculatorWindow({ onClose, onFocus }: Props) {
  return (
    <ZOSApp manifest={manifest} onClose={onClose} onFocus={onFocus}>
      <CalculatorContent />
    </ZOSApp>
  );
}

function CalculatorContent() {
  const { clipboard, notifications } = useSDK();
  const [display, setDisplay] = useState('0');

  const copyResult = async () => {
    await clipboard.writeText(display);
    notifications.show({
      title: 'Copied!',
      type: 'success',
      duration: 2000
    });
  };

  return (
    <div className="calculator">
      <div className="display" onClick={copyResult}>{display}</div>
      {/* ... buttons ... */}
    </div>
  );
}
```

3. **Register in ZDesktop:**

```tsx
// In ZDesktop.tsx
import { CalculatorWindow } from './CalculatorWindow';

// Add to window state
const [showCalculator, setShowCalculator] = useState(false);

// Render
{showCalculator && (
  <CalculatorWindow
    onClose={() => setShowCalculator(false)}
    onFocus={() => handleWindowFocus('Calculator')}
  />
)}
```

## Events

The SDK uses custom events for system integration:

### App Events
- `zos:app-focus` - App gained focus
- `zos:app-blur` - App lost focus
- `zos:app-close` - App is closing
- `zos:app-activate` - App is being activated

### Window Events
- `zos:window-left` - Tile window left
- `zos:window-right` - Tile window right
- `zos:window-zoom` - Toggle maximize
- `zos:hide-app` - Minimize window
- `zos:show-all` - Show all windows

### File Events
- `zos:file-change` - File was modified
- `zos:file-dialog-open` - Open file dialog
- `zos:file-dialog-result` - File dialog result

### Clipboard Events
- `zos:clipboard-change` - Clipboard contents changed

### Notification Events
- `zos:notification` - Show notification
- `zos:notification-dismiss` - Dismiss notification
- `zos:notification-dismiss-all` - Dismiss all

## Best Practices

1. **Use the manifest** - Define all app metadata in the manifest
2. **Use SDK hooks** - Don't access localStorage/clipboard directly
3. **Handle errors** - Wrap file/network operations in try/catch
4. **Clean up** - Unregister keyboard shortcuts on unmount
5. **Namespace storage** - Use your app identifier as namespace
6. **Request permissions** - Only request what you need

## TypeScript Support

The SDK is fully typed. Import types as needed:

```typescript
import type {
  AppManifest,
  AppContext,
  NotificationOptions,
  FileEntry,
  StorageAPI,
} from '@/sdk';
```

## Version

- SDK Version: 1.0.0
- Minimum zOS Version: 1.0.0
