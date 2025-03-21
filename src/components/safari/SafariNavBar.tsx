
import React from 'react';
import { RefreshCcw, ChevronLeft, ChevronRight, Search, Home, Star, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SafariNavBarProps {
  historyIndex: number;
  history: string[];
  inputUrl: string;
  setInputUrl: (url: string) => void;
  handleBack: () => void;
  handleForward: () => void;
  handleRefresh: () => void;
  handleHome: () => void;
  handleNavigate: (e: React.FormEvent) => void;
  openRecursiveSafari: () => void;
  scaleFactor: number;
}

const SafariNavBar: React.FC<SafariNavBarProps> = ({
  historyIndex,
  history,
  inputUrl,
  setInputUrl,
  handleBack,
  handleForward,
  handleRefresh,
  handleHome,
  handleNavigate,
  openRecursiveSafari,
  scaleFactor,
}) => {
  return (
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
  );
};

export default SafariNavBar;
