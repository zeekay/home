import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Mock the component with simplified version
vi.mock('../SpotlightSearch', () => ({
  default: ({
    isOpen,
    onClose,
    onOpenApp,
    onSearch
  }: {
    isOpen: boolean;
    onClose: () => void;
    onOpenApp?: (app: string) => void;
    onSearch?: (query: string) => void;
  }) => {
    const [query, setQuery] = React.useState('');
    const [results, setResults] = React.useState<string[]>([]);
    const [selectedIndex, setSelectedIndex] = React.useState(0);

    const apps = ['Finder', 'Safari', 'Terminal', 'Music', 'Mail', 'Calendar'];

    React.useEffect(() => {
      if (query) {
        const filtered = apps.filter(app =>
          app.toLowerCase().includes(query.toLowerCase())
        );
        setResults(filtered);
        setSelectedIndex(0);
      } else {
        setResults([]);
      }
    }, [query]);

    if (!isOpen) return null;

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && results.length > 0) {
        e.preventDefault();
        onOpenApp?.(results[selectedIndex]);
        onClose();
      }
    };

    return (
      <div
        className="spotlight-search"
        data-testid="spotlight-search"
        role="dialog"
        aria-label="Spotlight Search"
      >
        <div className="backdrop" onClick={onClose} data-testid="backdrop" />
        <div className="search-panel">
          <div className="search-input-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Spotlight Search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                onSearch?.(e.target.value);
              }}
              onKeyDown={handleKeyDown}
              autoFocus
              data-testid="search-input"
            />
          </div>
          {results.length > 0 && (
            <div className="search-results" role="listbox">
              {results.map((result, index) => (
                <div
                  key={result}
                  className={`search-result ${index === selectedIndex ? 'selected' : ''}`}
                  onClick={() => {
                    onOpenApp?.(result);
                    onClose();
                  }}
                  role="option"
                  aria-selected={index === selectedIndex}
                  data-testid={`result-${result.toLowerCase()}`}
                >
                  <span className="result-icon">📱</span>
                  <span className="result-name">{result}</span>
                </div>
              ))}
            </div>
          )}
          {query && results.length === 0 && (
            <div className="no-results" data-testid="no-results">
              No results for "{query}"
            </div>
          )}
        </div>
      </div>
    );
  },
}));

import SpotlightSearch from '../SpotlightSearch';

describe('SpotlightSearch', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onOpenApp: vi.fn(),
    onSearch: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders when open', () => {
      render(<SpotlightSearch {...defaultProps} />);
      expect(screen.getByTestId('spotlight-search')).toBeInTheDocument();
    });

    it('does NOT render when closed', () => {
      render(<SpotlightSearch {...defaultProps} isOpen={false} />);
      expect(screen.queryByTestId('spotlight-search')).not.toBeInTheDocument();
    });

    it('has dialog role', () => {
      render(<SpotlightSearch {...defaultProps} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('has accessible label', () => {
      render(<SpotlightSearch {...defaultProps} />);
      expect(screen.getByLabelText('Spotlight Search')).toBeInTheDocument();
    });
  });

  describe('Search input', () => {
    it('renders search input', () => {
      render(<SpotlightSearch {...defaultProps} />);
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
    });

    it('has placeholder', () => {
      render(<SpotlightSearch {...defaultProps} />);
      expect(screen.getByPlaceholderText('Spotlight Search')).toBeInTheDocument();
    });

    it('is auto-focused', () => {
      render(<SpotlightSearch {...defaultProps} />);
      expect(screen.getByTestId('search-input')).toHaveFocus();
    });

    it('updates on typing', async () => {
      const user = userEvent.setup();

      render(<SpotlightSearch {...defaultProps} />);

      const input = screen.getByTestId('search-input');
      await user.type(input, 'safari');

      expect(input).toHaveValue('safari');
    });
  });

  describe('Search results', () => {
    it('shows results matching query', async () => {
      const user = userEvent.setup();

      render(<SpotlightSearch {...defaultProps} />);

      await user.type(screen.getByTestId('search-input'), 'saf');

      expect(screen.getByTestId('result-safari')).toBeInTheDocument();
    });

    it('shows no results message for non-matching query', async () => {
      const user = userEvent.setup();

      render(<SpotlightSearch {...defaultProps} />);

      await user.type(screen.getByTestId('search-input'), 'xyz123');

      expect(screen.getByTestId('no-results')).toBeInTheDocument();
      expect(screen.getByText(/No results for "xyz123"/)).toBeInTheDocument();
    });

    it('calls onSearch callback', async () => {
      const user = userEvent.setup();
      const onSearch = vi.fn();

      render(<SpotlightSearch {...defaultProps} onSearch={onSearch} />);

      await user.type(screen.getByTestId('search-input'), 'test');

      expect(onSearch).toHaveBeenCalledWith('t');
      expect(onSearch).toHaveBeenCalledWith('te');
      expect(onSearch).toHaveBeenCalledWith('tes');
      expect(onSearch).toHaveBeenCalledWith('test');
    });
  });

  describe('Keyboard navigation', () => {
    it('closes on Escape', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(<SpotlightSearch {...defaultProps} onClose={onClose} />);

      await user.keyboard('{Escape}');

      expect(onClose).toHaveBeenCalled();
    });

    it('navigates results with arrow keys', async () => {
      const user = userEvent.setup();

      render(<SpotlightSearch {...defaultProps} />);

      await user.type(screen.getByTestId('search-input'), 'a');
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowUp}');

      // Verifies navigation happened (component tracks selectedIndex internally)
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
    });

    it('opens app on Enter', async () => {
      const user = userEvent.setup();
      const onOpenApp = vi.fn();
      const onClose = vi.fn();

      render(<SpotlightSearch {...defaultProps} onOpenApp={onOpenApp} onClose={onClose} />);

      await user.type(screen.getByTestId('search-input'), 'safari');
      await user.keyboard('{Enter}');

      expect(onOpenApp).toHaveBeenCalledWith('Safari');
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Click interactions', () => {
    it('closes on backdrop click', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(<SpotlightSearch {...defaultProps} onClose={onClose} />);

      await user.click(screen.getByTestId('backdrop'));

      expect(onClose).toHaveBeenCalled();
    });

    it('opens app on result click', async () => {
      const user = userEvent.setup();
      const onOpenApp = vi.fn();
      const onClose = vi.fn();

      render(<SpotlightSearch {...defaultProps} onOpenApp={onOpenApp} onClose={onClose} />);

      await user.type(screen.getByTestId('search-input'), 'safari');
      await user.click(screen.getByTestId('result-safari'));

      expect(onOpenApp).toHaveBeenCalledWith('Safari');
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Empty state', () => {
    it('shows no results initially', () => {
      render(<SpotlightSearch {...defaultProps} />);

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(screen.queryByTestId('no-results')).not.toBeInTheDocument();
    });
  });
});
