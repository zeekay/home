
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { WebContainer } from '@webcontainer/api';
import { logger } from '@/lib/logger';
import { TerminalContextType, TerminalEntry, EditorState } from '@/types/terminal';
import { initializeWebContainer } from '@/utils/webContainerUtil';
import { processCommand } from '@/utils/terminalCommandUtil';
import { updateFileContent } from '@/utils/terminalFileSystem';

// Create the context with default values
const TerminalContext = createContext<TerminalContextType | null>(null);

interface TerminalProviderProps {
  children: React.ReactNode;
}

export const TerminalProvider: React.FC<TerminalProviderProps> = ({ children }) => {
  const [entries, setEntries] = useState<TerminalEntry[]>([
    {
      command: '',
      output: `Welcome to zOS v4.2.0 - z@zeekay.ai
Type 'help' for commands, 'neofetch' for system info
Try 'cd Documents' for GitHub projects, 'ellipsis' for dotfiles`,
      id: 0
    }
  ]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [webContainerInstance, setWebContainerInstance] = useState<WebContainer | null>(null);
  const [isWebContainerReady, setIsWebContainerReady] = useState(false);
  const [editorState, setEditorState] = useState<EditorState>({
    isOpen: false,
    fileName: '',
    content: '',
    isNewFile: false,
  });

  // Pending command - queued to run when Terminal opens
  const [pendingCommand, setPendingCommand] = useState<string | null>(null);

  const queueCommand = useCallback((command: string) => {
    setPendingCommand(command);
  }, []);

  const consumePendingCommand = useCallback(() => {
    const cmd = pendingCommand;
    setPendingCommand(null);
    return cmd;
  }, [pendingCommand]);

  const openEditor = useCallback((fileName: string, content: string, isNewFile: boolean = false) => {
    setEditorState({
      isOpen: true,
      fileName,
      content,
      isNewFile,
    });
  }, []);

  const closeEditor = useCallback(() => {
    setEditorState({
      isOpen: false,
      fileName: '',
      content: '',
      isNewFile: false,
    });
  }, []);

  const saveFile = useCallback(async (fileName: string, content: string) => {
    // Update virtual filesystem
    updateFileContent(fileName, content);
    
    // Also update WebContainer if available
    if (webContainerInstance && isWebContainerReady) {
      try {
        await webContainerInstance.fs.writeFile(fileName, content);
      } catch (error) {
        logger.error('Failed to write to WebContainer:', error);
      }
    }
  }, [webContainerInstance, isWebContainerReady]);

  const addEntry = useCallback((entry: Omit<TerminalEntry, 'id'> & { id?: number }) => {
    setEntries(prev => [
      ...prev,
      {
        ...entry,
        id: entry.id || Date.now()
      }
    ]);
  }, []);

  const clearEntries = useCallback(() => {
    setEntries([]);
  }, []);

  useEffect(() => {
    const init = async () => {
      const instance = await initializeWebContainer(addEntry);
      if (instance) {
        setWebContainerInstance(instance);
        setIsWebContainerReady(true);
      }
    };

    init();
  }, [addEntry]);

  const executeCommand = async (command: string): Promise<void> => {
    await processCommand(
      command,
      webContainerInstance,
      isWebContainerReady,
      addEntry,
      clearEntries,
      commandHistory,
      openEditor
    );
  };

  const contextValue: TerminalContextType = {
    entries,
    addEntry,
    executeCommand,
    webContainerInstance,
    isWebContainerReady,
    commandHistory,
    setCommandHistory,
    clearEntries,
    editorState,
    openEditor,
    closeEditor,
    saveFile,
    pendingCommand,
    queueCommand,
    consumePendingCommand,
  };

  return (
    <TerminalContext.Provider value={contextValue}>
      {children}
    </TerminalContext.Provider>
  );
};

// Custom hook to use the terminal context
export const useTerminal = () => {
  const context = useContext(TerminalContext);
  
  if (!context) {
    throw new Error('useTerminal must be used within a TerminalProvider');
  }
  
  return context;
};
