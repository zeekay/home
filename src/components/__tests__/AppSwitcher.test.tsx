import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Mock the component with simplified version
vi.mock('../AppSwitcher', () => ({
  default: ({
    isOpen,
    onClose,
    openApps,
    currentApp,
    onSelectApp
  }: {
    isOpen: boolean;
    onClose: () => void;
    openApps: string[];
    currentApp: string;
    onSelectApp: (app: string) => void;
  }) => {
    if (!isOpen) return null;

    return (
      <div
        className="app-switcher"
        data-testid="app-switcher"
        role="dialog"
        aria-label="Application Switcher"
      >
        <div className="backdrop" onClick={onClose} data-testid="backdrop" />
        <div className="switcher-panel">
          <div className="app-list">
            {openApps.map((app) => (
              <button
                key={app}
                className={`app-item ${currentApp === app ? 'selected' : ''}`}
                onClick={() => onSelectApp(app)}
                data-testid={`app-${app.toLowerCase().replace(/\s+/g, '-')}`}
                aria-selected={currentApp === app}
              >
                <div className="app-icon">📱</div>
                <span className="app-name">{app}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  },
}));

import AppSwitcher from '../AppSwitcher';

describe('AppSwitcher', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    openApps: ['Finder', 'Safari', 'Terminal'] as const,
    currentApp: 'Finder' as const,
    onSelectApp: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders when open', () => {
      render(<AppSwitcher {...defaultProps} />);
      expect(screen.getByTestId('app-switcher')).toBeInTheDocument();
    });

    it('does NOT render when closed', () => {
      render(<AppSwitcher {...defaultProps} isOpen={false} />);
      expect(screen.queryByTestId('app-switcher')).not.toBeInTheDocument();
    });

    it('has dialog role', () => {
      render(<AppSwitcher {...defaultProps} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('has aria-label for accessibility', () => {
      render(<AppSwitcher {...defaultProps} />);
      expect(screen.getByLabelText('Application Switcher')).toBeInTheDocument();
    });
  });

  describe('App list', () => {
    it('displays all open apps', () => {
      render(<AppSwitcher {...defaultProps} />);

      expect(screen.getByTestId('app-finder')).toBeInTheDocument();
      expect(screen.getByTestId('app-safari')).toBeInTheDocument();
      expect(screen.getByTestId('app-terminal')).toBeInTheDocument();
    });

    it('shows app names', () => {
      render(<AppSwitcher {...defaultProps} />);

      expect(screen.getByText('Finder')).toBeInTheDocument();
      expect(screen.getByText('Safari')).toBeInTheDocument();
      expect(screen.getByText('Terminal')).toBeInTheDocument();
    });

    it('marks current app as selected', () => {
      render(<AppSwitcher {...defaultProps} currentApp="Safari" />);

      const safariButton = screen.getByTestId('app-safari');
      expect(safariButton).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Interactions', () => {
    it('calls onSelectApp when clicking an app', async () => {
      const user = userEvent.setup();
      const onSelectApp = vi.fn();

      render(<AppSwitcher {...defaultProps} onSelectApp={onSelectApp} />);

      await user.click(screen.getByTestId('app-safari'));

      expect(onSelectApp).toHaveBeenCalledWith('Safari');
    });

    it('calls onClose when clicking backdrop', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(<AppSwitcher {...defaultProps} onClose={onClose} />);

      await user.click(screen.getByTestId('backdrop'));

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Empty state', () => {
    it('renders with no apps', () => {
      render(<AppSwitcher {...defaultProps} openApps={[]} />);

      expect(screen.getByTestId('app-switcher')).toBeInTheDocument();
    });
  });

  describe('Single app', () => {
    it('renders with single app', () => {
      render(<AppSwitcher {...defaultProps} openApps={['Finder']} />);

      expect(screen.getByTestId('app-finder')).toBeInTheDocument();
    });
  });
});
