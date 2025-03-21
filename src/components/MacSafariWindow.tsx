
import React, { useState } from 'react';
import { RefreshCcw, ChevronLeft, ChevronRight, Search, Home, Star, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import MacWindow from './MacWindow';

interface MacSafariWindowProps {
  onClose: () => void;
  initialUrl?: string;
}

const MacSafariWindow: React.FC<MacSafariWindowProps> = ({ 
  onClose,
  initialUrl = window.location.href // Set default to current page for recursive effect
}) => {
  const [url, setUrl] = useState(initialUrl);
  const [inputUrl, setInputUrl] = useState(initialUrl);
  const [history, setHistory] = useState<string[]>([initialUrl]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    let processedUrl = inputUrl;
    
    // Add https if no protocol specified
    if (!/^https?:\/\//i.test(processedUrl)) {
      processedUrl = 'https://' + processedUrl;
    }
    
    setUrl(processedUrl);
    setHistory(prev => [...prev.slice(0, historyIndex + 1), processedUrl]);
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
    const currentUrl = url;
    setUrl('');
    setTimeout(() => setUrl(currentUrl), 10);
  };

  const handleHome = () => {
    const homeUrl = window.location.origin;
    setUrl(homeUrl);
    setInputUrl(homeUrl);
    setHistory(prev => [...prev.slice(0, historyIndex + 1), homeUrl]);
    setHistoryIndex(prev => prev + 1);
  };

  return (
    <MacWindow
      title="Safari"
      onClose={onClose}
      initialPosition={{ x: 100, y: 100 }}
      initialSize={{ width: 800, height: 600 }}
      windowType="safari"
      className="z-40"
    >
      <div className="w-full h-full flex flex-col">
        {/* Navigation Bar */}
        <div className="h-12 bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 border-b border-gray-300 dark:border-gray-600 flex items-center px-2 space-x-2">
          <button 
            className={cn(
              "p-1 rounded-full",
              historyIndex > 0 
                ? "hover:bg-gray-200 dark:hover:bg-gray-600" 
                : "opacity-50 cursor-not-allowed"
            )}
            onClick={handleBack}
            disabled={historyIndex <= 0}
          >
            <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
          <button 
            className={cn(
              "p-1 rounded-full",
              historyIndex < history.length - 1 
                ? "hover:bg-gray-200 dark:hover:bg-gray-600" 
                : "opacity-50 cursor-not-allowed"
            )}
            onClick={handleForward}
            disabled={historyIndex >= history.length - 1}
          >
            <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
          <button 
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
            onClick={handleRefresh}
          >
            <RefreshCcw className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
          <button 
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
            onClick={handleHome}
          >
            <Home className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
          
          <form onSubmit={handleNavigate} className="flex-1 flex items-center">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 flex items-center pl-2">
                <Search className="w-4 h-4 text-gray-400" />
              </div>
              <input 
                type="text" 
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                className="w-full py-1 pl-8 pr-3 rounded-full bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-600 text-sm"
              />
            </div>
          </form>

          <button className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
            <Star className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
          <button className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
            <BookOpen className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Bookmarks Bar */}
        <div className="h-8 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-300 dark:border-gray-600 flex items-center px-4 text-xs">
          <div className="flex space-x-4">
            <span className="text-blue-600 dark:text-blue-400 cursor-pointer" onClick={() => { setUrl('https://apple.com'); setInputUrl('https://apple.com'); }}>Apple</span>
            <span className="text-blue-600 dark:text-blue-400 cursor-pointer" onClick={() => { setUrl('https://icloud.com'); setInputUrl('https://icloud.com'); }}>iCloud</span>
            <span className="text-blue-600 dark:text-blue-400 cursor-pointer" onClick={() => { setUrl(window.location.href); setInputUrl(window.location.href); }}>This Site</span>
            <span className="text-blue-600 dark:text-blue-400 cursor-pointer" onClick={() => { setUrl('https://github.com/zeekay'); setInputUrl('https://github.com/zeekay'); }}>GitHub</span>
            <span className="text-blue-600 dark:text-blue-400 cursor-pointer" onClick={() => { setUrl('https://twitter.com/zeekay'); setInputUrl('https://twitter.com/zeekay'); }}>Twitter</span>
          </div>
        </div>

        {/* Browser Content */}
        <div className="flex-1">
          {url && (
            <iframe 
              src={url} 
              title="Safari Content"
              className="w-full h-full border-0"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              key={url} // Force iframe refresh when URL changes
            />
          )}
        </div>
      </div>
    </MacWindow>
  );
};

export default MacSafariWindow;
