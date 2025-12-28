// App-specific dock context menu configurations

export interface AppMenuItem {
  label: string;
  action: string;
  icon?: string;
  shortcut?: string;
  separator?: boolean;
  submenu?: AppMenuItem[];
  disabled?: boolean;
}

export interface AppMenuConfig {
  items: AppMenuItem[];
  hasRecents?: boolean;
  newItemLabel?: string; // e.g., "New Document", "New Note", "New Tab"
}

export const appMenuConfigs: Record<string, AppMenuConfig> = {
  textedit: {
    newItemLabel: 'New Document',
    hasRecents: true,
    items: [
      { label: 'New Document', action: 'new', shortcut: '⌘N' },
      { label: 'Open...', action: 'open', shortcut: '⌘O' },
      { separator: true, label: '', action: '' },
      { label: 'Show All Windows', action: 'showAll' },
      { label: 'Hide', action: 'hide', shortcut: '⌘H' },
    ],
  },

  notes: {
    newItemLabel: 'New Note',
    hasRecents: true,
    items: [
      { label: 'New Note', action: 'new', shortcut: '⌘N' },
      { label: 'New Folder', action: 'newFolder', shortcut: '⇧⌘N' },
      { separator: true, label: '', action: '' },
      { label: 'Show All Windows', action: 'showAll' },
      { label: 'Hide', action: 'hide', shortcut: '⌘H' },
    ],
  },

  finder: {
    newItemLabel: 'New Finder Window',
    hasRecents: true,
    items: [
      { label: 'New Finder Window', action: 'new', shortcut: '⌘N' },
      { label: 'New Folder', action: 'newFolder', shortcut: '⇧⌘N' },
      { separator: true, label: '', action: '' },
      { label: 'Go to Folder...', action: 'goTo', shortcut: '⇧⌘G' },
      { label: 'Connect to Server...', action: 'connect', shortcut: '⌘K' },
    ],
  },

  terminal: {
    newItemLabel: 'New Window',
    hasRecents: false,
    items: [
      { label: 'New Window', action: 'new', shortcut: '⌘N' },
      { label: 'New Tab', action: 'newTab', shortcut: '⌘T' },
      { separator: true, label: '', action: '' },
      { label: 'Show All Windows', action: 'showAll' },
      { label: 'Hide', action: 'hide', shortcut: '⌘H' },
    ],
  },

  safari: {
    newItemLabel: 'New Window',
    hasRecents: true,
    items: [
      { label: 'New Window', action: 'new', shortcut: '⌘N' },
      { label: 'New Private Window', action: 'newPrivate', shortcut: '⇧⌘N' },
      { label: 'New Tab', action: 'newTab', shortcut: '⌘T' },
      { separator: true, label: '', action: '' },
      { label: 'Show All Windows', action: 'showAll' },
    ],
  },

  mail: {
    newItemLabel: 'New Message',
    hasRecents: false,
    items: [
      { label: 'New Message', action: 'new', shortcut: '⌘N' },
      { label: 'Get All New Mail', action: 'checkMail', shortcut: '⇧⌘N' },
      { separator: true, label: '', action: '' },
      { label: 'Show All Windows', action: 'showAll' },
      { label: 'Hide', action: 'hide', shortcut: '⌘H' },
    ],
  },

  calendar: {
    newItemLabel: 'New Event',
    hasRecents: false,
    items: [
      { label: 'New Event', action: 'new', shortcut: '⌘N' },
      { label: 'Go to Today', action: 'today', shortcut: '⌘T' },
      { separator: true, label: '', action: '' },
      { label: 'Show All Windows', action: 'showAll' },
    ],
  },

  music: {
    newItemLabel: 'New Playlist',
    hasRecents: true,
    items: [
      { label: 'New Playlist', action: 'new', shortcut: '⌘N' },
      { separator: true, label: '', action: '' },
      { label: 'Play', action: 'play', icon: '▶' },
      { label: 'Next', action: 'next', icon: '⏭' },
      { label: 'Previous', action: 'previous', icon: '⏮' },
      { separator: true, label: '', action: '' },
      { label: 'Show All Windows', action: 'showAll' },
    ],
  },

  photos: {
    newItemLabel: 'New Album',
    hasRecents: true,
    items: [
      { label: 'New Album', action: 'new', shortcut: '⌘N' },
      { label: 'Import...', action: 'import', shortcut: '⇧⌘I' },
      { separator: true, label: '', action: '' },
      { label: 'Show All Windows', action: 'showAll' },
    ],
  },

  messages: {
    newItemLabel: 'New Message',
    hasRecents: true,
    items: [
      { label: 'New Message', action: 'new', shortcut: '⌘N' },
      { separator: true, label: '', action: '' },
      { label: 'Show All Windows', action: 'showAll' },
    ],
  },

  facetime: {
    newItemLabel: 'New FaceTime',
    hasRecents: true,
    items: [
      { label: 'New FaceTime', action: 'new', shortcut: '⌘N' },
      { separator: true, label: '', action: '' },
      { label: 'Show All Windows', action: 'showAll' },
    ],
  },

  xcode: {
    newItemLabel: 'New File',
    hasRecents: true,
    items: [
      { label: 'New File...', action: 'new', shortcut: '⌘N' },
      { label: 'New Project...', action: 'newProject', shortcut: '⇧⌘N' },
      { label: 'Open...', action: 'open', shortcut: '⌘O' },
      { separator: true, label: '', action: '' },
      { label: 'Build', action: 'build', shortcut: '⌘B' },
      { label: 'Run', action: 'run', shortcut: '⌘R' },
      { separator: true, label: '', action: '' },
      { label: 'Show All Windows', action: 'showAll' },
    ],
  },

  hanzo: {
    newItemLabel: 'New Chat',
    hasRecents: true,
    items: [
      { label: 'New Chat', action: 'new', shortcut: '⌘N' },
      { separator: true, label: '', action: '' },
      { label: 'Show All Windows', action: 'showAll' },
    ],
  },

  // Default for apps without specific config
  default: {
    hasRecents: false,
    items: [
      { label: 'Show All Windows', action: 'showAll' },
      { label: 'Hide', action: 'hide', shortcut: '⌘H' },
    ],
  },
};

export const getAppMenuConfig = (appId: string): AppMenuConfig => {
  return appMenuConfigs[appId] || appMenuConfigs.default;
};
