
import { WebContainer } from '@webcontainer/api';

export interface TerminalProps {
  className?: string;
  customFontSize?: number;
  customPadding?: number;
  customTheme?: string;
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
