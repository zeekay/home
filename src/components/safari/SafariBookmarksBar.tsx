/**
 * Safari Bookmarks Bar
 * Horizontal bar showing bookmarks from the Bookmarks Bar folder
 */

import React, { useState } from 'react';
import { ChevronDown, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Bookmark, getFaviconUrl } from './safariTypes';

interface SafariBookmarksBarProps {
  bookmarks: Bookmark[];
  onOpen: (url: string) => void;
  scaleFactor?: number;
}

interface BookmarkItemProps {
  bookmark: Bookmark;
  onOpen: (url: string) => void;
  scaleFactor: number;
}

const BookmarkFolderDropdown: React.FC<{
  folder: Bookmark;
  onOpen: (url: string) => void;
  onClose: () => void;
}> = ({ folder, onOpen, onClose }) => {
  if (!folder.children || folder.children.length === 0) {
    return (
      <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
        <div className="px-3 py-2 text-sm text-gray-500">Empty folder</div>
      </div>
    );
  }

  return (
    <div
      className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50"
      onMouseLeave={onClose}
    >
      {folder.children.map(item => (
        <div key={item.id}>
          {item.type === 'folder' ? (
            <NestedFolderItem folder={item} onOpen={onOpen} />
          ) : (
            <button
              onClick={() => { item.url && onOpen(item.url); onClose(); }}
              className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <img
                src={item.url ? getFaviconUrl(item.url) : ''}
                alt=""
                className="w-4 h-4 flex-shrink-0"
              />
              <span className="truncate">{item.title}</span>
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

const NestedFolderItem: React.FC<{
  folder: Bookmark;
  onOpen: (url: string) => void;
}> = ({ folder, onOpen }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700">
        <FolderOpen className="w-4 h-4 flex-shrink-0 text-blue-500" />
        <span className="flex-1 truncate">{folder.title}</span>
        <ChevronDown className="w-3 h-3 -rotate-90" />
      </div>

      {isHovered && folder.children && folder.children.length > 0 && (
        <div className="absolute left-full top-0 ml-0.5 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
          {folder.children.map(item => (
            <div key={item.id}>
              {item.type === 'folder' ? (
                <NestedFolderItem folder={item} onOpen={onOpen} />
              ) : (
                <button
                  onClick={() => item.url && onOpen(item.url)}
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <img
                    src={item.url ? getFaviconUrl(item.url) : ''}
                    alt=""
                    className="w-4 h-4 flex-shrink-0"
                  />
                  <span className="truncate">{item.title}</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const BookmarkItem: React.FC<BookmarkItemProps> = ({ bookmark, onOpen, scaleFactor }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const iconSize = Math.max(10, 14 * scaleFactor);
  const fontSize = Math.max(9, 12 * scaleFactor);
  const padding = Math.max(2, 4 * scaleFactor);

  if (bookmark.type === 'folder') {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          className={cn(
            'flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors',
            showDropdown && 'bg-gray-200/50 dark:bg-gray-700/50'
          )}
          style={{ padding: `${padding}px ${padding * 2}px`, fontSize: `${fontSize}px` }}
        >
          <FolderOpen
            style={{ width: iconSize, height: iconSize }}
            className="text-blue-500 flex-shrink-0"
          />
          <span className="truncate max-w-[80px]">{bookmark.title}</span>
          <ChevronDown
            style={{ width: iconSize * 0.8, height: iconSize * 0.8 }}
            className="flex-shrink-0"
          />
        </button>

        {showDropdown && (
          <BookmarkFolderDropdown
            folder={bookmark}
            onOpen={onOpen}
            onClose={() => setShowDropdown(false)}
          />
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => bookmark.url && onOpen(bookmark.url)}
      className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors"
      style={{ padding: `${padding}px ${padding * 2}px`, fontSize: `${fontSize}px` }}
      title={bookmark.url}
    >
      <img
        src={bookmark.url ? getFaviconUrl(bookmark.url) : ''}
        alt=""
        style={{ width: iconSize, height: iconSize }}
        className="flex-shrink-0"
      />
      <span className="truncate max-w-[100px]">{bookmark.title}</span>
    </button>
  );
};

const SafariBookmarksBar: React.FC<SafariBookmarksBarProps> = ({
  bookmarks,
  onOpen,
  scaleFactor = 1,
}) => {
  // Find the bookmarks bar folder
  const bookmarksBarFolder = bookmarks.find(b => b.id === 'bookmarks-bar');
  const barItems = bookmarksBarFolder?.children || [];

  if (barItems.length === 0) {
    return null;
  }

  const height = Math.max(20, 28 * scaleFactor);

  return (
    <div
      className="bg-gray-50/80 dark:bg-gray-800/80 border-b border-gray-200/50 dark:border-gray-700/50 flex items-center gap-1 px-2 overflow-x-auto scrollbar-hide"
      style={{ height: `${height}px` }}
    >
      {barItems.map(bookmark => (
        <BookmarkItem
          key={bookmark.id}
          bookmark={bookmark}
          onOpen={onOpen}
          scaleFactor={scaleFactor}
        />
      ))}
    </div>
  );
};

export default SafariBookmarksBar;
