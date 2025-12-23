
import React, { useRef, useState, useEffect } from 'react';
import { Search, ExternalLink, RefreshCw } from 'lucide-react';

interface SafariContentProps {
  url: string;
  depth: number;
  iframeKey: number;
  onNavigate?: (url: string) => void;
}

// Extract search query from DuckDuckGo URL
const getDuckDuckGoQuery = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('duckduckgo.com')) {
      return urlObj.searchParams.get('q');
    }
  } catch {}
  return null;
};

// Custom search results component
interface SearchResultsProps {
  query: string;
  onNewSearch: (query: string) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ query, onNewSearch }) => {
  const [results, setResults] = useState<Array<{title: string; snippet: string; url: string}>>([]);
  const [loading, setLoading] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Use Wikipedia API for search results (it allows CORS)
    const fetchResults = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&srlimit=8`
        );
        const data = await response.json();
        if (data.query?.search) {
          setResults(data.query.search.map((item: any) => ({
            title: item.title,
            snippet: item.snippet.replace(/<[^>]*>/g, ''), // Strip HTML
            url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, '_'))}`
          })));
        }
      } catch (e) {
        console.error('Search failed:', e);
      }
      setLoading(false);
    };
    fetchResults();
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const newQuery = searchInputRef.current?.value;
    if (newQuery) {
      onNewSearch(newQuery);
    }
  };

  return (
    <div className="w-full h-full bg-white overflow-auto">
      {/* Search header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              defaultValue={query}
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Results */}
      <div className="max-w-2xl mx-auto p-4">
        <p className="text-sm text-gray-500 mb-4">
          Showing Wikipedia results for "{query}"
          <button
            onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank')}
            className="ml-2 text-blue-500 hover:underline inline-flex items-center gap-1"
          >
            Open Google <ExternalLink className="w-3 h-3" />
          </button>
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-6">
            {results.map((result, i) => (
              <div key={i} className="group">
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-lg font-medium"
                >
                  {result.title}
                </a>
                <p className="text-sm text-green-700 truncate">{result.url}</p>
                <p className="text-sm text-gray-600 mt-1">{result.snippet}...</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-12">No results found</p>
        )}
      </div>
    </div>
  );
};

// Check if URL is a Google search URL
const isGoogleUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes('google.com');
  } catch {
    return false;
  }
};

// Google Search Component (custom implementation since Google blocks iframes)
interface GoogleSearchProps {
  onSearch: (query: string) => void;
}

const GoogleSearch: React.FC<GoogleSearchProps> = ({ onSearch }) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the search input when component mounts
  useEffect(() => {
    // Small delay to ensure the component is fully rendered
    const timer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchInputRef.current?.value;
    if (query) {
      // Navigate to DuckDuckGo which allows embedding
      onSearch(query);
    }
  };

  return (
    <div className="w-full h-full bg-white flex flex-col items-center justify-center p-8">
      {/* Google Logo */}
      <div className="mb-8">
        <svg viewBox="0 0 272 92" width="272" height="92">
          <path fill="#4285F4" d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"/>
          <path fill="#EA4335" d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"/>
          <path fill="#FBBC05" d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.66-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.51 11.84-13v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.61h9.25zm-8.56 20.92c0-7.81-5.21-13.52-11.84-13.52-6.72 0-12.35 5.71-12.35 13.52 0 7.73 5.63 13.36 12.35 13.36 6.63 0 11.84-5.63 11.84-13.36z"/>
          <path fill="#4285F4" d="M225 3v65h-9.5V3h9.5z"/>
          <path fill="#34A853" d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.98 14.11l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.14zm-23.27-7.98l19.82-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.95 0-11.84 4.37-11.59 12.93z"/>
          <path fill="#EA4335" d="M35.29 41.41V32H67c.31 1.64.47 3.58.47 5.68 0 7.06-1.93 15.79-8.15 22.01-6.05 6.3-13.78 9.66-24.02 9.66C16.32 69.35.36 53.89.36 34.91.36 15.93 16.32.47 35.3.47c10.5 0 17.98 4.12 23.6 9.49l-6.64 6.64c-4.03-3.78-9.49-6.72-16.97-6.72-13.86 0-24.7 11.17-24.7 25.03 0 13.86 10.84 25.03 24.7 25.03 8.99 0 14.11-3.61 17.39-6.89 2.66-2.66 4.41-6.46 5.1-11.65l-22.49.01z"/>
        </svg>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="w-full max-w-xl">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search Google or type a URL"
            className="w-full px-12 py-3 text-lg border border-gray-200 rounded-full shadow-sm hover:shadow-md focus:shadow-md focus:outline-none transition-shadow"
            autoFocus
          />
        </div>
        <div className="flex justify-center gap-3 mt-6">
          <button
            type="submit"
            className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-100 rounded transition-colors"
          >
            Google Search
          </button>
          <button
            type="button"
            onClick={() => {
              window.open('https://www.google.com/doodles', '_blank');
            }}
            className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-100 rounded transition-colors"
          >
            I'm Feeling Lucky
          </button>
        </div>
      </form>

      {/* Footer links */}
      <div className="absolute bottom-0 left-0 right-0 bg-gray-100 border-t border-gray-200">
        <div className="flex justify-between items-center px-6 py-3 text-sm text-gray-600">
          <div className="flex gap-6">
            <span>United States</span>
          </div>
          <div className="flex gap-6">
            <a href="https://about.google" target="_blank" rel="noopener noreferrer" className="hover:underline">About</a>
            <a href="https://ads.google.com" target="_blank" rel="noopener noreferrer" className="hover:underline">Advertising</a>
            <a href="https://business.google.com" target="_blank" rel="noopener noreferrer" className="hover:underline">Business</a>
            <a href="https://google.com/search/howsearchworks" target="_blank" rel="noopener noreferrer" className="hover:underline">How Search works</a>
          </div>
        </div>
      </div>
    </div>
  );
};

const SafariContent: React.FC<SafariContentProps> = ({ url, depth, iframeKey, onNavigate }) => {
  const handleSearch = (query: string) => {
    if (onNavigate) {
      // Navigate to search results (use DuckDuckGo URL format for tracking)
      const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
      onNavigate(searchUrl);
    } else {
      // Fallback: open in new tab
      window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
    }
  };

  // Show custom Google search page for google.com URLs
  if (isGoogleUrl(url)) {
    return (
      <div className="flex-1 relative">
        <GoogleSearch onSearch={handleSearch} />
      </div>
    );
  }

  // Show custom search results for DuckDuckGo URLs (since DDG blocks iframes too)
  const searchQuery = getDuckDuckGoQuery(url);
  if (searchQuery) {
    return (
      <div className="flex-1 relative">
        <SearchResults query={searchQuery} onNewSearch={handleSearch} />
      </div>
    );
  }

  return (
    <div className="flex-1">
      {url && (
        <iframe
          src={url}
          title={`Safari Content (Depth: ${depth})`}
          className="w-full h-full border-0"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          key={`iframe-${depth}-${iframeKey}`}
          data-safari-depth={depth}
        />
      )}
    </div>
  );
};

export default SafariContent;
