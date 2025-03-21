
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <TerminalProvider>
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
      </TerminalProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
