
import { useState, useEffect, createContext, useContext } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SpotifyCallback from "./pages/SpotifyCallback";
import ZDesktop from "./components/ZDesktop";
import TerminalContent from "./components/TerminalContent";
import { TerminalProvider } from "./contexts/TerminalContext";
import { DockProvider } from "./contexts/DockContext";
import BootSequence from "./components/BootSequence";
import LockScreen from "./components/LockScreen";
import RestartScreen from "./components/RestartScreen";

const queryClient = new QueryClient();

// System state types
type SystemState = 'booting' | 'running' | 'locked' | 'restarting' | 'shutdown';

// System context for global access to power controls
interface SystemContextType {
  systemState: SystemState;
  sleep: () => void;
  restart: () => void;
  shutdown: () => void;
  lockScreen: () => void;
}

export const SystemContext = createContext<SystemContextType | null>(null);

export const useSystem = () => {
  const context = useContext(SystemContext);
  if (!context) {
    throw new Error('useSystem must be used within SystemProvider');
  }
  return context;
};

const App = () => {
  const [systemState, setSystemState] = useState<SystemState>(() => {
    const hasBooted = sessionStorage.getItem('zos-booted');
    return hasBooted ? 'running' : 'booting';
  });

  const handleBootComplete = () => {
    sessionStorage.setItem('zos-booted', 'true');
    setSystemState('running');
  };

  const handleUnlock = () => {
    setSystemState('running');
  };

  const handleRestartComplete = () => {
    // After restart animation, go to lock screen
    setSystemState('locked');
  };

  const handleShutdownWake = () => {
    // When waking from shutdown, show restart animation then lock
    setSystemState('restarting');
  };

  // Power control functions
  const sleep = () => {
    setSystemState('locked');
  };

  const restart = () => {
    setSystemState('restarting');
  };

  const shutdown = () => {
    setSystemState('shutdown');
  };

  const lockScreen = () => {
    setSystemState('locked');
  };

  // Keyboard shortcut for lock screen (Ctrl+Cmd+Q)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.metaKey && e.key === 'q') {
        e.preventDefault();
        lockScreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const systemContextValue: SystemContextType = {
    systemState,
    sleep,
    restart,
    shutdown,
    lockScreen,
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SystemContext.Provider value={systemContextValue}>
          <TerminalProvider>
            <DockProvider>
              {/* Boot sequence */}
              {systemState === 'booting' && (
                <BootSequence onComplete={handleBootComplete} />
              )}

              {/* Lock screen */}
              {systemState === 'locked' && (
                <LockScreen onUnlock={handleUnlock} />
              )}

              {/* Restart animation */}
              {systemState === 'restarting' && (
                <RestartScreen mode="restart" onComplete={handleRestartComplete} />
              )}

              {/* Shutdown screen */}
              {systemState === 'shutdown' && (
                <RestartScreen mode="shutdown" onComplete={handleShutdownWake} />
              )}

              <Toaster />
              <Sonner />
              <BrowserRouter>
              <Routes>
                <Route path="/" element={
                  <ZDesktop>
                    <Routes>
                      <Route path="/" element={<Index />} />
                    </Routes>
                  </ZDesktop>
                } />
                <Route path="/terminal-content" element={<TerminalContent />} />
                <Route path="/spotify/callback" element={<SpotifyCallback />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              </BrowserRouter>
            </DockProvider>
          </TerminalProvider>
        </SystemContext.Provider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
