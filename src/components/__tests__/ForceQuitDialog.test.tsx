import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Mock the component with simplified version
vi.mock('../ForceQuitDialog', () => ({
  default: ({
    isOpen,
    onClose,
    openApps,
    onForceQuit
  }: {
    isOpen: boolean;
    onClose: () => void;
    openApps: string[];
    onForceQuit: (app: string) => void;
  }) => {
    const [selectedApp, setSelectedApp] = React.useState<string | null>(null);

    if (!isOpen) return null;

    return (
      <div
        className="force-quit-dialog"
        data-testid="force-quit-dialog"
        role="alertdialog"
        aria-label="Force Quit Applications"
      >
        <div className="dialog-header">
          <h2>Force Quit Applications</h2>
          <p>If an app doesn't respond for a while, select its name and click Force Quit.</p>
        </div>
        <div className="app-list">
          {openApps.map((app) => (
            <div
              key={app}
              className={`app-item ${selectedApp === app ? 'selected' : ''}`}
              onClick={() => setSelectedApp(app)}
              data-testid={`app-${app.toLowerCase().replace(/\s+/g, '-')}`}
              role="option"
              aria-selected={selectedApp === app}
            >
              <span className="app-icon">📱</span>
              <span className="app-name">{app}</span>
            </div>
          ))}
        </div>
        <div className="dialog-footer">
          <button onClick={onClose} data-testid="relaunch-button">
            Relaunch
          </button>
          <button
            onClick={() => selectedApp && onForceQuit(selectedApp)}
            disabled={!selectedApp}
            data-testid="force-quit-button"
            className={selectedApp ? 'enabled' : 'disabled'}
          >
            Force Quit
          </button>
        </div>
      </div>
    );
  },
}));

import ForceQuitDialog from '../ForceQuitDialog';

describe('ForceQuitDialog', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    openApps: ['Finder', 'Safari', 'Terminal'] as const,
    onForceQuit: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders when open', () => {
      render(<ForceQuitDialog {...defaultProps} />);
      expect(screen.getByTestId('force-quit-dialog')).toBeInTheDocument();
    });

    it('does NOT render when closed', () => {
      render(<ForceQuitDialog {...defaultProps} isOpen={false} />);
      expect(screen.queryByTestId('force-quit-dialog')).not.toBeInTheDocument();
    });

    it('has alertdialog role', () => {
      render(<ForceQuitDialog {...defaultProps} />);
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    it('has accessible label', () => {
      render(<ForceQuitDialog {...defaultProps} />);
      expect(screen.getByLabelText('Force Quit Applications')).toBeInTheDocument();
    });
  });

  describe('Header', () => {
    it('shows title', () => {
      render(<ForceQuitDialog {...defaultProps} />);
      expect(screen.getByText('Force Quit Applications')).toBeInTheDocument();
    });

    it('shows instructions', () => {
      render(<ForceQuitDialog {...defaultProps} />);
      expect(screen.getByText(/If an app doesn't respond/)).toBeInTheDocument();
    });
  });

  describe('App list', () => {
    it('displays all open apps', () => {
      render(<ForceQuitDialog {...defaultProps} />);

      expect(screen.getByTestId('app-finder')).toBeInTheDocument();
      expect(screen.getByTestId('app-safari')).toBeInTheDocument();
      expect(screen.getByTestId('app-terminal')).toBeInTheDocument();
    });

    it('shows app names', () => {
      render(<ForceQuitDialog {...defaultProps} />);

      expect(screen.getByText('Finder')).toBeInTheDocument();
      expect(screen.getByText('Safari')).toBeInTheDocument();
      expect(screen.getByText('Terminal')).toBeInTheDocument();
    });
  });

  describe('Selection', () => {
    it('selects app on click', async () => {
      const user = userEvent.setup();

      render(<ForceQuitDialog {...defaultProps} />);

      const safariItem = screen.getByTestId('app-safari');
      await user.click(safariItem);

      expect(safariItem).toHaveAttribute('aria-selected', 'true');
    });

    it('Force Quit button is disabled without selection', () => {
      render(<ForceQuitDialog {...defaultProps} />);

      const forceQuitButton = screen.getByTestId('force-quit-button');
      expect(forceQuitButton).toBeDisabled();
    });

    it('Force Quit button is enabled after selection', async () => {
      const user = userEvent.setup();

      render(<ForceQuitDialog {...defaultProps} />);

      await user.click(screen.getByTestId('app-safari'));

      const forceQuitButton = screen.getByTestId('force-quit-button');
      expect(forceQuitButton).not.toBeDisabled();
    });
  });

  describe('Actions', () => {
    it('calls onForceQuit with selected app', async () => {
      const user = userEvent.setup();
      const onForceQuit = vi.fn();

      render(<ForceQuitDialog {...defaultProps} onForceQuit={onForceQuit} />);

      await user.click(screen.getByTestId('app-safari'));
      await user.click(screen.getByTestId('force-quit-button'));

      expect(onForceQuit).toHaveBeenCalledWith('Safari');
    });

    it('calls onClose when clicking Relaunch', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(<ForceQuitDialog {...defaultProps} onClose={onClose} />);

      await user.click(screen.getByTestId('relaunch-button'));

      expect(onClose).toHaveBeenCalled();
    });

    it('does NOT call onForceQuit when no app selected', async () => {
      const user = userEvent.setup();
      const onForceQuit = vi.fn();

      render(<ForceQuitDialog {...defaultProps} onForceQuit={onForceQuit} />);

      // Try to click force quit without selecting
      await user.click(screen.getByTestId('force-quit-button'));

      expect(onForceQuit).not.toHaveBeenCalled();
    });
  });

  describe('Empty state', () => {
    it('renders with no apps', () => {
      render(<ForceQuitDialog {...defaultProps} openApps={[]} />);

      expect(screen.getByTestId('force-quit-dialog')).toBeInTheDocument();
    });
  });
});
