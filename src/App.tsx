
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import MacDesktop from "./components/MacDesktop";
import TerminalContent from "./components/TerminalContent";
import { TerminalProvider } from "./contexts/TerminalContext";
import { DockProvider } from "./contexts/DockContext";
import BootSequence from "./components/BootSequence";

const queryClient = new QueryClient();

const App = () => {
  const [showBootSequence, setShowBootSequence] = useState(() => {
    // Only show boot sequence on first visit (use sessionStorage to persist during session)
    const hasBooted = sessionStorage.getItem('zos-booted');
    return !hasBooted;
  });

  const handleBootComplete = () => {
    sessionStorage.setItem('zos-booted', 'true');
    setShowBootSequence(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <TerminalProvider>
          <DockProvider>
            {showBootSequence && <BootSequence onComplete={handleBootComplete} />}
            <Toaster />
            <Sonner />
            <BrowserRouter>
            <Routes>
              <Route path="/" element={
                <MacDesktop>
                  <Routes>
                    <Route path="/" element={<Index />} />
                  </Routes>
                </MacDesktop>
              } />
              <Route path="/terminal-content" element={<TerminalContent />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </BrowserRouter>
          </DockProvider>
        </TerminalProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
