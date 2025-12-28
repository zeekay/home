/**
 * Safari Start Page
 * Shows Favorites grid, Frequently Visited, Reading List preview, and Privacy Report
 */

import React from 'react';
import { Plus, Book, Shield, Clock, X, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Favorite, ReadingListItem, getFaviconUrl, extractDomain } from './safariTypes';

interface SafariStartPageProps {
  favorites: Favorite[];
  frequentlyVisited: Favorite[];
  readingList: ReadingListItem[];
  onOpenUrl: (url: string) => void;
  onRemoveFavorite: (id: string) => void;
  onAddFavorite: () => void;
}

// Favorite/Frequently Visited Grid Item
const GridItem: React.FC<{
  item: Favorite;
  onOpen: () => void;
  onRemove?: () => void;
}> = ({ item, onOpen, onRemove }) => {
  return (
    <div
      className="group relative flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
      onClick={onOpen}
    >
      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="absolute -top-1 -right-1 p-1 bg-gray-200 dark:bg-gray-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          <X className="w-3 h-3" />
        </button>
      )}

      <div className="w-14 h-14 rounded-xl bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center overflow-hidden">
        <img
          src={getFaviconUrl(item.url)}
          alt=""
          className="w-8 h-8"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>

      <span className="text-xs text-gray-600 dark:text-gray-400 text-center truncate w-full max-w-[80px]">
        {item.title || extractDomain(item.url)}
      </span>
    </div>
  );
};

// Add Favorite Button
const AddFavoriteButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <div
    className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
    onClick={onClick}
  >
    <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
      <Plus className="w-6 h-6 text-gray-400" />
    </div>
    <span className="text-xs text-gray-500">Add Favorite</span>
  </div>
);

// Reading List Preview Item
const ReadingListPreviewItem: React.FC<{
  item: ReadingListItem;
  onOpen: () => void;
}> = ({ item, onOpen }) => (
  <div
    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
    onClick={onOpen}
  >
    <img
      src={getFaviconUrl(item.url)}
      alt=""
      className="w-5 h-5 mt-0.5 flex-shrink-0"
    />
    <div className="flex-1 min-w-0">
      <p className={cn(
        'text-sm truncate',
        item.isRead ? 'text-gray-500' : 'text-gray-900 dark:text-gray-100'
      )}>
        {item.title}
      </p>
      <p className="text-xs text-gray-500 truncate">{extractDomain(item.url)}</p>
    </div>
  </div>
);

// Section Header
const SectionHeader: React.FC<{
  icon: React.ReactNode;
  title: string;
  action?: React.ReactNode;
}> = ({ icon, title, action }) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      {icon}
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
    </div>
    {action}
  </div>
);

// Privacy Report Card
const PrivacyReportCard: React.FC = () => {
  // Mock data for privacy report
  const trackersBlocked = Math.floor(Math.random() * 50) + 10;
  const websitesVisited = Math.floor(Math.random() * 20) + 5;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Shield className="w-5 h-5 text-blue-500" />
        <h3 className="font-medium text-gray-900 dark:text-gray-100">Privacy Report</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{trackersBlocked}</p>
          <p className="text-xs text-gray-500">Trackers Prevented</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{websitesVisited}</p>
          <p className="text-xs text-gray-500">Sites Contacted</p>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Safari helps prevent trackers from following you across websites.
      </p>
    </div>
  );
};

const SafariStartPage: React.FC<SafariStartPageProps> = ({
  favorites,
  frequentlyVisited,
  readingList,
  onOpenUrl,
  onRemoveFavorite,
  onAddFavorite,
}) => {
  const unreadReadingList = readingList.filter(item => !item.isRead).slice(0, 4);

  return (
    <div className="w-full h-full bg-gray-50 dark:bg-gray-900 overflow-auto">
      <div className="max-w-4xl mx-auto py-8 px-6">
        {/* Favorites Section */}
        <section className="mb-10">
          <SectionHeader
            icon={<div className="w-5 h-5 rounded bg-gradient-to-br from-yellow-400 to-orange-500" />}
            title="Favorites"
          />

          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {favorites.slice(0, 15).map(fav => (
              <GridItem
                key={fav.id}
                item={fav}
                onOpen={() => onOpenUrl(fav.url)}
                onRemove={() => onRemoveFavorite(fav.id)}
              />
            ))}
            <AddFavoriteButton onClick={onAddFavorite} />
          </div>
        </section>

        {/* Frequently Visited Section */}
        {frequentlyVisited.length > 0 && (
          <section className="mb-10">
            <SectionHeader
              icon={<Clock className="w-5 h-5 text-purple-500" />}
              title="Frequently Visited"
            />

            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {frequentlyVisited.slice(0, 12).map(item => (
                <GridItem
                  key={item.id}
                  item={item}
                  onOpen={() => onOpenUrl(item.url)}
                />
              ))}
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Reading List Preview */}
          {unreadReadingList.length > 0 && (
            <section className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <SectionHeader
                icon={<Book className="w-5 h-5 text-red-500" />}
                title="Reading List"
                action={
                  <span className="text-xs text-gray-500">
                    {unreadReadingList.length} unread
                  </span>
                }
              />

              <div className="space-y-1">
                {unreadReadingList.map(item => (
                  <ReadingListPreviewItem
                    key={item.id}
                    item={item}
                    onOpen={() => onOpenUrl(item.url)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Privacy Report */}
          <PrivacyReportCard />
        </div>

        {/* Search Suggestions / Quick Links */}
        <section className="mt-10">
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
            <button
              onClick={() => onOpenUrl('https://www.apple.com')}
              className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Apple
            </button>
            <span>|</span>
            <button
              onClick={() => onOpenUrl('https://www.wikipedia.org')}
              className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Wikipedia
            </button>
            <span>|</span>
            <button
              onClick={() => onOpenUrl('https://news.ycombinator.com')}
              className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Hacker News
            </button>
            <span>|</span>
            <button
              onClick={() => onOpenUrl('https://github.com')}
              className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              GitHub
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SafariStartPage;
