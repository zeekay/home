
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

export interface TerminalContextType {
  entries: TerminalEntry[];
  addEntry: (entry: Omit<TerminalEntry, 'id'> & { id?: number }) => void;
  executeCommand: (command: string) => Promise<void>;
  webContainerInstance: WebContainer | null;
  isWebContainerReady: boolean;
  commandHistory: string[];
  setCommandHistory: React.Dispatch<React.SetStateAction<string[]>>;
  clearEntries: () => void;
}
