
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { WebContainer } from '@webcontainer/api';
import { TerminalContextType, TerminalEntry } from '@/types/terminal';
import { initializeWebContainer } from '@/utils/webContainerUtil';
import { processCommand } from '@/utils/terminalCommandUtil';

// Create the context with default values
const TerminalContext = createContext<TerminalContextType | null>(null);

interface TerminalProviderProps {
  children: React.ReactNode;
}

export const TerminalProvider: React.FC<TerminalProviderProps> = ({ children }) => {
  const [entries, setEntries] = useState<TerminalEntry[]>([
    { 
      command: '', 
      output: "Welcome to Zach's Terminal! Type 'help' for available commands or wait for WebContainer to load...", 
      id: 0 
    }
  ]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [webContainerInstance, setWebContainerInstance] = useState<WebContainer | null>(null);
  const [isWebContainerReady, setIsWebContainerReady] = useState(false);

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
      commandHistory
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
    clearEntries
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
