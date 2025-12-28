
import { WebContainer } from '@webcontainer/api';

export interface TerminalProps {
  className?: string;
  customFontSize?: number;
  customPadding?: number;
  customTheme?: string;
  sessionId?: string;
  onTitleChange?: (title: string) => void;
}

export interface TerminalEntry {
  command: string;
  output: string;
  isError?: boolean;
  id: number;
}

export interface EditorState {
  isOpen: boolean;
  fileName: string;
  content: string;
  isNewFile: boolean;
}

export interface TerminalContextType {
  entries: TerminalEntry[];
  addEntry: (entry: Omit<TerminalEntry, 'id'> & { id?: number }) => void;
  executeCommand: (command: string) => Promise<void>;
  webContainerInstance: WebContainer | null;
  isWebContainerReady: boolean;
  commandHistory: string[];
  setCommandHistory: React.Dispatch<React.SetStateAction<string[]>>;
  clearEntries: () => void;
  editorState: EditorState;
  openEditor: (fileName: string, content: string, isNewFile?: boolean) => void;
  closeEditor: () => void;
  saveFile: (fileName: string, content: string) => Promise<void>;
  // Pending command queue - for commands queued before Terminal opens
  pendingCommand: string | null;
  queueCommand: (command: string) => void;
  consumePendingCommand: () => string | null;
}

// Terminal Profile types
export interface TerminalProfile {
  id: string;
  name: string;
  backgroundColor: string;
  backgroundOpacity: number;
  textColor: string;
  fontSize: number;
  fontFamily: string;
  cursorStyle: 'block' | 'underline' | 'bar';
  cursorBlink: boolean;
  padding: number;
}

// Default profiles
export const DEFAULT_PROFILES: TerminalProfile[] = [
  {
    id: 'default',
    name: 'Default',
    backgroundColor: '#000000',
    backgroundOpacity: 1,
    textColor: '#ffffff',
    fontSize: 14,
    fontFamily: 'monospace',
    cursorStyle: 'block',
    cursorBlink: true,
    padding: 16,
  },
  {
    id: 'homebrew',
    name: 'Homebrew',
    backgroundColor: '#000000',
    backgroundOpacity: 0.95,
    textColor: '#00ff00',
    fontSize: 14,
    fontFamily: 'monospace',
    cursorStyle: 'block',
    cursorBlink: true,
    padding: 16,
  },
  {
    id: 'ocean',
    name: 'Ocean',
    backgroundColor: '#0f2027',
    backgroundOpacity: 0.95,
    textColor: '#a3c1da',
    fontSize: 14,
    fontFamily: 'monospace',
    cursorStyle: 'bar',
    cursorBlink: true,
    padding: 16,
  },
  {
    id: 'pro',
    name: 'Pro',
    backgroundColor: '#1a1a1a',
    backgroundOpacity: 0.9,
    textColor: '#f0f0f0',
    fontSize: 13,
    fontFamily: 'SF Mono, monospace',
    cursorStyle: 'underline',
    cursorBlink: false,
    padding: 12,
  },
  {
    id: 'dracula',
    name: 'Dracula',
    backgroundColor: '#282a36',
    backgroundOpacity: 1,
    textColor: '#f8f8f2',
    fontSize: 14,
    fontFamily: 'monospace',
    cursorStyle: 'block',
    cursorBlink: true,
    padding: 16,
  },
  {
    id: 'nord',
    name: 'Nord',
    backgroundColor: '#2e3440',
    backgroundOpacity: 1,
    textColor: '#d8dee9',
    fontSize: 14,
    fontFamily: 'monospace',
    cursorStyle: 'bar',
    cursorBlink: true,
    padding: 16,
  },
  {
    id: 'monokai',
    name: 'Monokai',
    backgroundColor: '#272822',
    backgroundOpacity: 1,
    textColor: '#f8f8f2',
    fontSize: 14,
    fontFamily: 'monospace',
    cursorStyle: 'block',
    cursorBlink: true,
    padding: 16,
  },
  {
    id: 'solarized-dark',
    name: 'Solarized Dark',
    backgroundColor: '#002b36',
    backgroundOpacity: 1,
    textColor: '#839496',
    fontSize: 14,
    fontFamily: 'monospace',
    cursorStyle: 'block',
    cursorBlink: true,
    padding: 16,
  },
];

// Terminal Tab types
export interface TerminalTab {
  id: string;
  title: string;
  sessionId: string;
  profileId: string;
  isActive: boolean;
}

// Split Pane types
export type SplitDirection = 'horizontal' | 'vertical';

export interface TerminalPane {
  id: string;
  tabId: string;
  sessionId: string;
  profileId: string;
  splitDirection?: SplitDirection;
  splitRatio: number;
  children?: [TerminalPane, TerminalPane];
  isActive: boolean;
}

// SSH Connection types
export interface SSHConnection {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  identityFile?: string;
  profileId?: string;
}

// Terminal Window State
export interface TerminalWindowState {
  tabs: TerminalTab[];
  activeTabId: string;
  panes: Record<string, TerminalPane>;
  profiles: TerminalProfile[];
  sshConnections: SSHConnection[];
  defaultProfileId: string;
}
