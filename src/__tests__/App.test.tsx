import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useState } from 'react';
import { SystemContext } from '../App';
import LockScreen from '../components/LockScreen';
import BootSequence from '../components/BootSequence';

// Test the system state logic in isolation
describe('System State Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    localStorage.clear();
  });

  describe('Boot state from sessionStorage', () => {
    it('returns booting when no session flag', () => {
      const hasBooted = sessionStorage.getItem('zos-booted');
      const state = hasBooted ? 'running' : 'booting';
      expect(state).toBe('booting');
    });

    it('returns running when session flag is set', () => {
      sessionStorage.setItem('zos-booted', 'true');
      const hasBooted = sessionStorage.getItem('zos-booted');
      const state = hasBooted ? 'running' : 'booting';
      expect(state).toBe('running');
    });
  });

  describe('SystemContext', () => {
    it('provides system context value', () => {
      const mockValue = {
        systemState: 'running' as const,
        sleep: vi.fn(),
        restart: vi.fn(),
        shutdown: vi.fn(),
        lockScreen: vi.fn(),
      };

      const TestConsumer = () => {
        const context = React.useContext(SystemContext);
        return <div data-testid="state">{context?.systemState || 'no-context'}</div>;
      };

      render(
        <SystemContext.Provider value={mockValue}>
          <TestConsumer />
        </SystemContext.Provider>
      );

      expect(screen.getByTestId('state').textContent).toBe('running');
    });

    it('lockScreen function can be called', () => {
      const lockScreen = vi.fn();
      const mockValue = {
        systemState: 'running' as const,
        sleep: vi.fn(),
        restart: vi.fn(),
        shutdown: vi.fn(),
        lockScreen,
      };

      const TestConsumer = () => {
        const context = React.useContext(SystemContext);
        return <button onClick={context?.lockScreen}>Lock</button>;
      };

      render(
        <SystemContext.Provider value={mockValue}>
          <TestConsumer />
        </SystemContext.Provider>
      );

      screen.getByRole('button').click();
      expect(lockScreen).toHaveBeenCalled();
    });
  });
});

describe('LockScreen Integration', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders lock screen component', () => {
    render(<LockScreen onUnlock={vi.fn()} />);
    expect(screen.getByPlaceholderText(/Enter Password/)).toBeInTheDocument();
  });

  it('calls onUnlock with correct password', async () => {
    vi.useRealTimers();
    const onUnlock = vi.fn();
    const user = userEvent.setup();

    render(<LockScreen onUnlock={onUnlock} />);

    const input = screen.getByPlaceholderText(/Enter Password/);
    await user.type(input, 'any password');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(onUnlock).toHaveBeenCalled();
    }, { timeout: 1000 });
  });
});

describe('BootSequence Integration', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders boot sequence component', () => {
    const { container } = render(<BootSequence onComplete={vi.fn()} mode="full" />);
    expect(container).toBeTruthy();
  });

  it('accepts onComplete callback', () => {
    const onComplete = vi.fn();
    render(<BootSequence onComplete={onComplete} />);
    // onComplete is not called immediately
    expect(onComplete).not.toHaveBeenCalled();
  });
});
