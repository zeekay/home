/**
 * Safari Navigation Bar
 * Enhanced nav bar with sidebar toggle, reading list, bookmark controls,
 * private mode toggle, and closed tabs restoration
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
  Shield,
  RotateCcw,
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
  // Sidebar
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  // Bookmarks and Reading List
  onAddToReadingList?: () => void;
  onAddBookmark?: () => void;
  onShare?: () => void;
  isBookmarked?: boolean;
  currentUrl?: string;
  // Private mode
  privateMode?: boolean;
  onTogglePrivateMode?: () => void;
  // Closed tabs
  closedTabsCount?: number;
  onReopenClosedTab?: () => void;
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
  privateMode = false,
  onTogglePrivateMode,
  closedTabsCount = 0,
  onReopenClosedTab,
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
    variant?: 'default' | 'private';
    children: React.ReactNode;
  }> = ({ onClick, disabled = false, title, isActive = false, variant = 'default', children }) => (
    <button
      className={cn(
        'rounded-full transition-colors',
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : variant === 'private'
            ? 'hover:bg-purple-200 dark:hover:bg-purple-900 active:bg-purple-300 dark:active:bg-purple-800'
            : 'hover:bg-gray-200 dark:hover:bg-gray-600 active:bg-gray-300 dark:active:bg-gray-500',
        isActive && (variant === 'private'
          ? 'bg-purple-200/50 dark:bg-purple-900/50'
          : 'bg-gray-200/50 dark:bg-gray-600/50')
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
      className={cn(
        'border-b flex items-center px-2 space-x-2',
        privateMode
          ? 'bg-purple-100 dark:bg-purple-950 border-purple-300/50 dark:border-purple-700/50'
          : 'bg-[#F6F6F6] dark:bg-[#2D2D2D] border-gray-300/50 dark:border-gray-600/50'
      )}
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
        title="Go Back (Cmd+[)"
      >
        <ChevronLeft
          style={{ width: iconSize, height: iconSize }}
          className="text-gray-600 dark:text-gray-300"
        />
      </NavButton>

      <NavButton
        onClick={handleForward}
        disabled={historyIndex >= history.length - 1}
        title="Go Forward (Cmd+])"
      >
        <ChevronRight
          style={{ width: iconSize, height: iconSize }}
          className="text-gray-600 dark:text-gray-300"
        />
      </NavButton>

      <NavButton onClick={handleRefresh} title="Reload (Cmd+R)">
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
            {privateMode ? (
              <Shield
                style={{ width: iconSize, height: iconSize }}
                className="text-purple-500"
              />
            ) : (
              <Search
                style={{ width: iconSize, height: iconSize }}
                className="text-gray-400"
              />
            )}
          </div>
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={privateMode ? 'Private Search or enter website' : 'Search or enter website name'}
            className={cn(
              'w-full rounded-full border text-sm shadow-inner transition-all',
              privateMode
                ? 'bg-purple-50 dark:bg-purple-900/30 placeholder:text-purple-400'
                : 'bg-[#FFFFFF] dark:bg-[#3A3A3A]',
              isFocused
                ? privateMode
                  ? 'border-purple-500 ring-2 ring-purple-500/20'
                  : 'border-blue-500 ring-2 ring-blue-500/20'
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

      {/* Reopen Closed Tab button */}
      {onReopenClosedTab && closedTabsCount > 0 && (
        <NavButton
          onClick={onReopenClosedTab}
          title={`Reopen Closed Tab (Cmd+Shift+T) - ${closedTabsCount} available`}
        >
          <div className="relative">
            <RotateCcw
              style={{ width: iconSize, height: iconSize }}
              className="text-gray-600 dark:text-gray-300"
            />
            <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[8px] rounded-full w-3 h-3 flex items-center justify-center">
              {closedTabsCount > 9 ? '9+' : closedTabsCount}
            </span>
          </div>
        </NavButton>
      )}

      {/* Private Mode toggle */}
      {onTogglePrivateMode && (
        <NavButton
          onClick={onTogglePrivateMode}
          title={privateMode ? 'Exit Private Mode (Cmd+Shift+N)' : 'Enter Private Mode (Cmd+Shift+N)'}
          isActive={privateMode}
          variant={privateMode ? 'private' : 'default'}
        >
          <Shield
            style={{ width: iconSize, height: iconSize }}
            className={privateMode ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-300'}
          />
        </NavButton>
      )}

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
          title={isBookmarked ? 'Edit Bookmark (Cmd+D)' : 'Add Bookmark (Cmd+D)'}
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
          title="Add to Reading List (Cmd+Shift+D)"
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
