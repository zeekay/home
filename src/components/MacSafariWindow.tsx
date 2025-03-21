
import React, { useState, useEffect } from 'react';
import { RefreshCcw, ChevronLeft, ChevronRight, Search, Home, Star, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import MacWindow from './MacWindow';

interface MacSafariWindowProps {
  onClose: () => void;
  initialUrl?: string;
  depth?: number;
}

const MacSafariWindow: React.FC<MacSafariWindowProps> = ({ 
  onClose,
  initialUrl = window.location.href, // Set default to current page
  depth = 0
}) => {
  const [url, setUrl] = useState(initialUrl);
  const [inputUrl, setInputUrl] = useState(initialUrl);
  const [history, setHistory] = useState<string[]>([initialUrl]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [iframeKey, setIframeKey] = useState(Date.now());

  // Check if this Safari window is running inside an iframe
  const [isInIframe, setIsInIframe] = useState(false);

  useEffect(() => {
    // Check if we're in an iframe
    try {
      setIsInIframe(window.self !== window.top);
    } catch (e) {
      // If accessing window.top throws an error, we're definitely in an iframe
      setIsInIframe(true);
    }
  }, []);

  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    const currentUrl = window.location.href;
    setUrl(currentUrl);
    setInputUrl(currentUrl);
    setHistory(prev => [...prev.slice(0, historyIndex + 1), currentUrl]);
    setHistoryIndex(prev => prev + 1);
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setUrl(history[historyIndex - 1]);
      setInputUrl(history[historyIndex - 1]);
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setUrl(history[historyIndex + 1]);
      setInputUrl(history[historyIndex + 1]);
    }
  };

  const handleRefresh = () => {
    // Just re-set the URL to trigger a reload
    setIframeKey(Date.now());
  };

  const handleHome = () => {
    const currentUrl = window.location.href;
    setUrl(currentUrl);
    setInputUrl(currentUrl);
    setHistory(prev => [...prev.slice(0, historyIndex + 1), currentUrl]);
    setHistoryIndex(prev => prev + 1);
  };

  // Open a new recursive safari window
  const openRecursiveSafari = () => {
    const newWindow = document.createElement('div');
    document.body.appendChild(newWindow);
    
    // Create a new Safari window component with increased depth
    const safariWindow = (
      <MacSafariWindow 
        onClose={() => document.body.removeChild(newWindow)} 
        initialUrl={window.location.href}
        depth={depth + 1}
      />
    );
    
    // Render the new Safari window
    const root = ReactDOM.createRoot(newWindow);
    root.render(safariWindow);
  };

  // Calculate size reduction for recursive windows
  const calculateSizeReduction = (baseSize: number, depth: number) => {
    // Reduce by 10% for each level of recursion
    return baseSize * Math.pow(0.9, depth);
  };

  // Scale factor for UI elements based on depth
  const scaleFactor = Math.pow(0.9, depth);

  return (
    <MacWindow
      title={`Safari${depth > 0 ? ` (${depth})` : ''}`}
      onClose={onClose}
      initialPosition={{ x: 100 + (depth * 30), y: 100 + (depth * 20) }}
      initialSize={{ 
        width: calculateSizeReduction(800, depth), 
        height: calculateSizeReduction(600, depth) 
      }}
      windowType="safari"
      className="z-40"
    >
      <div className="w-full h-full flex flex-col">
        {/* Navigation Bar - Apply scaling based on depth */}
        <div 
          className="bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 border-b border-gray-300 dark:border-gray-600 flex items-center px-2 space-x-2"
          style={{ 
            height: `${Math.max(24, 48 * scaleFactor)}px`, 
            fontSize: `${Math.max(10, 14 * scaleFactor)}px` 
          }}
        >
          <button 
            className={cn(
              "rounded-full",
              historyIndex > 0 
                ? "hover:bg-gray-200 dark:hover:bg-gray-600" 
                : "opacity-50 cursor-not-allowed"
            )}
            onClick={handleBack}
            disabled={historyIndex <= 0}
            style={{ padding: `${Math.max(2, 4 * scaleFactor)}px` }}
          >
            <ChevronLeft style={{ width: `${Math.max(12, 16 * scaleFactor)}px`, height: `${Math.max(12, 16 * scaleFactor)}px` }} className="text-gray-600 dark:text-gray-300" />
          </button>
          <button 
            className={cn(
              "rounded-full",
              historyIndex < history.length - 1 
                ? "hover:bg-gray-200 dark:hover:bg-gray-600" 
                : "opacity-50 cursor-not-allowed"
            )}
            onClick={handleForward}
            disabled={historyIndex >= history.length - 1}
            style={{ padding: `${Math.max(2, 4 * scaleFactor)}px` }}
          >
            <ChevronRight style={{ width: `${Math.max(12, 16 * scaleFactor)}px`, height: `${Math.max(12, 16 * scaleFactor)}px` }} className="text-gray-600 dark:text-gray-300" />
          </button>
          <button 
            className="rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
            onClick={handleRefresh}
            style={{ padding: `${Math.max(2, 4 * scaleFactor)}px` }}
          >
            <RefreshCcw style={{ width: `${Math.max(12, 16 * scaleFactor)}px`, height: `${Math.max(12, 16 * scaleFactor)}px` }} className="text-gray-600 dark:text-gray-300" />
          </button>
          <button 
            className="rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
            onClick={handleHome}
            style={{ padding: `${Math.max(2, 4 * scaleFactor)}px` }}
          >
            <Home style={{ width: `${Math.max(12, 16 * scaleFactor)}px`, height: `${Math.max(12, 16 * scaleFactor)}px` }} className="text-gray-600 dark:text-gray-300" />
          </button>
          
          <form onSubmit={handleNavigate} className="flex-1 flex items-center">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 flex items-center pl-2">
                <Search style={{ width: `${Math.max(12, 16 * scaleFactor)}px`, height: `${Math.max(12, 16 * scaleFactor)}px` }} className="text-gray-400" />
              </div>
              <input 
                type="text" 
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                className="w-full rounded-full bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-600 text-sm"
                style={{ 
                  paddingLeft: `${Math.max(16, 32 * scaleFactor)}px`,
                  paddingRight: `${Math.max(8, 12 * scaleFactor)}px`,
                  paddingTop: `${Math.max(2, 4 * scaleFactor)}px`,
                  paddingBottom: `${Math.max(2, 4 * scaleFactor)}px`,
                  fontSize: `${Math.max(10, 14 * scaleFactor)}px`
                }}
              />
            </div>
          </form>

          <button 
            className="rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
            onClick={openRecursiveSafari}
            title="Open Safari in Safari"
            style={{ padding: `${Math.max(2, 4 * scaleFactor)}px` }}
          >
            <Star style={{ width: `${Math.max(12, 16 * scaleFactor)}px`, height: `${Math.max(12, 16 * scaleFactor)}px` }} className="text-gray-600 dark:text-gray-300" />
          </button>
          <button 
            className="rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
            onClick={openRecursiveSafari}
            title="Open Safari in Safari (another way)"
            style={{ padding: `${Math.max(2, 4 * scaleFactor)}px` }}
          >
            <BookOpen style={{ width: `${Math.max(12, 16 * scaleFactor)}px`, height: `${Math.max(12, 16 * scaleFactor)}px` }} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Browser Content */}
        <div className="flex-1">
          {url && (
            <iframe 
              src={url} 
              title={`Safari Content (Depth: ${depth})`}
              className="w-full h-full border-0"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              key={`iframe-${depth}-${iframeKey}`} // Use depth in the key to ensure unique reload
              data-safari-depth={depth} // Add a data attribute to track depth
            />
          )}
        </div>
      </div>
    </MacWindow>
  );
};

// We need to import ReactDOM for the recursive window creation
import ReactDOM from 'react-dom/client';

export default MacSafariWindow;
