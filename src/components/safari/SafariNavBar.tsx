/**
 * Safari Navigation Bar
 * Enhanced nav bar with sidebar toggle, reading list, and bookmark controls
 */

import React, { useState } from 'react';
import {
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  Search,
  Home,
  Star,
  BookOpen,
  PanelLeft,
  Share,
  Plus,
  Download,
} from 'lucide-react';
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
  // New props for enhanced features
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  onAddToReadingList?: () => void;
  onAddBookmark?: () => void;
  onShare?: () => void;
  isBookmarked?: boolean;
  currentUrl?: string;
}

// Share menu component
const ShareMenu: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  url: string;
  onAddToReadingList: () => void;
  onAddBookmark: () => void;
}> = ({ isOpen, onClose, url, onAddToReadingList, onAddBookmark }) => {
  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    onClose();
  };

  return (
    <div
      className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50"
      onMouseLeave={onClose}
    >
      <button
        onClick={() => { onAddToReadingList(); onClose(); }}
        className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <BookOpen className="w-4 h-4" />
        Add to Reading List
      </button>
      <button
        onClick={() => { onAddBookmark(); onClose(); }}
        className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <Star className="w-4 h-4" />
        Add Bookmark
      </button>
      <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
      <button
        onClick={handleCopyLink}
        className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <Download className="w-4 h-4" />
        Copy Link
      </button>
    </div>
  );
};

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
  sidebarOpen = false,
  onToggleSidebar,
  onAddToReadingList,
  onAddBookmark,
  onShare,
  isBookmarked = false,
  currentUrl = '',
}) => {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const iconSize = Math.max(12, 16 * scaleFactor);
  const buttonPadding = Math.max(2, 4 * scaleFactor);
  const height = Math.max(24, 48 * scaleFactor);
  const fontSize = Math.max(10, 14 * scaleFactor);

  const NavButton: React.FC<{
    onClick: () => void;
    disabled?: boolean;
    title?: string;
    isActive?: boolean;
    children: React.ReactNode;
  }> = ({ onClick, disabled = false, title, isActive = false, children }) => (
    <button
      className={cn(
        'rounded-full transition-colors',
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:bg-gray-200 dark:hover:bg-gray-600 active:bg-gray-300 dark:active:bg-gray-500',
        isActive && 'bg-gray-200/50 dark:bg-gray-600/50'
      )}
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{ padding: `${buttonPadding}px` }}
    >
      {children}
    </button>
  );

  return (
    <div
      className="bg-[#F6F6F6] dark:bg-[#2D2D2D] border-b border-gray-300/50 dark:border-gray-600/50 flex items-center px-2 space-x-2"
      style={{
        height: `${height}px`,
        fontSize: `${fontSize}px`,
      }}
    >
      {/* Sidebar toggle */}
      {onToggleSidebar && (
        <NavButton
          onClick={onToggleSidebar}
          title="Show Sidebar"
          isActive={sidebarOpen}
        >
          <PanelLeft
            style={{ width: iconSize, height: iconSize }}
            className="text-gray-600 dark:text-gray-300"
          />
        </NavButton>
      )}

      {/* Navigation buttons */}
      <NavButton
        onClick={handleBack}
        disabled={historyIndex <= 0}
        title="Go Back"
      >
        <ChevronLeft
          style={{ width: iconSize, height: iconSize }}
          className="text-gray-600 dark:text-gray-300"
        />
      </NavButton>

      <NavButton
        onClick={handleForward}
        disabled={historyIndex >= history.length - 1}
        title="Go Forward"
      >
        <ChevronRight
          style={{ width: iconSize, height: iconSize }}
          className="text-gray-600 dark:text-gray-300"
        />
      </NavButton>

      <NavButton onClick={handleRefresh} title="Reload">
        <RefreshCcw
          style={{ width: iconSize, height: iconSize }}
          className="text-gray-600 dark:text-gray-300"
        />
      </NavButton>

      <NavButton onClick={handleHome} title="Home">
        <Home
          style={{ width: iconSize, height: iconSize }}
          className="text-gray-600 dark:text-gray-300"
        />
      </NavButton>

      {/* URL Bar */}
      <form onSubmit={handleNavigate} className="flex-1 flex items-center">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 flex items-center pl-2">
            <Search
              style={{ width: iconSize, height: iconSize }}
              className="text-gray-400"
            />
          </div>
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Search or enter website name"
            className={cn(
              'w-full rounded-full bg-[#FFFFFF] dark:bg-[#3A3A3A] border text-sm shadow-inner transition-all',
              isFocused
                ? 'border-blue-500 ring-2 ring-blue-500/20'
                : 'border-gray-300/50 dark:border-gray-600/50'
            )}
            style={{
              paddingLeft: `${Math.max(16, 32 * scaleFactor)}px`,
              paddingRight: `${Math.max(8, 12 * scaleFactor)}px`,
              paddingTop: `${Math.max(2, 4 * scaleFactor)}px`,
              paddingBottom: `${Math.max(2, 4 * scaleFactor)}px`,
              fontSize: `${fontSize}px`,
            }}
          />
        </div>
      </form>

      {/* Share button with menu */}
      <div className="relative">
        <NavButton
          onClick={() => setShowShareMenu(!showShareMenu)}
          title="Share"
        >
          <Share
            style={{ width: iconSize, height: iconSize }}
            className="text-gray-600 dark:text-gray-300"
          />
        </NavButton>
        <ShareMenu
          isOpen={showShareMenu}
          onClose={() => setShowShareMenu(false)}
          url={currentUrl || inputUrl}
          onAddToReadingList={onAddToReadingList || (() => {})}
          onAddBookmark={onAddBookmark || (() => {})}
        />
      </div>

      {/* Bookmark button */}
      {onAddBookmark && (
        <NavButton
          onClick={onAddBookmark}
          title={isBookmarked ? 'Edit Bookmark' : 'Add Bookmark'}
        >
          <Star
            style={{ width: iconSize, height: iconSize }}
            className={cn(
              isBookmarked
                ? 'text-yellow-500 fill-yellow-500'
                : 'text-gray-600 dark:text-gray-300'
            )}
          />
        </NavButton>
      )}

      {/* Reading List button */}
      {onAddToReadingList && (
        <NavButton
          onClick={onAddToReadingList}
          title="Add to Reading List"
        >
          <BookOpen
            style={{ width: iconSize, height: iconSize }}
            className="text-gray-600 dark:text-gray-300"
          />
        </NavButton>
      )}

      {/* New tab in new window (recursive Safari) */}
      <NavButton
        onClick={openRecursiveSafari}
        title="Open in New Window"
      >
        <Plus
          style={{ width: iconSize, height: iconSize }}
          className="text-gray-600 dark:text-gray-300"
        />
      </NavButton>
    </div>
  );
};

export default SafariNavBar;
