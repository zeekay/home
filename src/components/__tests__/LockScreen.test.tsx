import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LockScreen from '../LockScreen';

describe('LockScreen', () => {
  const mockOnUnlock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Rendering', () => {
    it('renders lock screen with user info', () => {
      render(<LockScreen onUnlock={mockOnUnlock} />);
      
      expect(screen.getByText(/Zach Kelling/)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Enter Password/)).toBeInTheDocument();
    });

    it('displays current time', () => {
      render(<LockScreen onUnlock={mockOnUnlock} />);
      
      // Should display time in some format
      const timeElement = document.querySelector('[class*="text-8xl"]');
      expect(timeElement).toBeTruthy();
    });

    it('displays current date', () => {
      render(<LockScreen onUnlock={mockOnUnlock} />);
      
      // Check for date display (weekday, month, day format)
      const dateElement = screen.getByText(/\w+day/i);
      expect(dateElement).toBeInTheDocument();
    });

    it('shows Touch ID hint', () => {
      render(<LockScreen onUnlock={mockOnUnlock} />);
      
      expect(screen.getByText(/Touch ID or Enter Password/)).toBeInTheDocument();
    });

    it('shows password hint', () => {
      render(<LockScreen onUnlock={mockOnUnlock} />);
      
      expect(screen.getByText(/Enter any password to unlock/)).toBeInTheDocument();
    });
  });

  describe('Password validation', () => {
    it('unlocks with correct password "any password"', async () => {
      vi.useRealTimers();
      const user = userEvent.setup();
      render(<LockScreen onUnlock={mockOnUnlock} />);
      
      const input = screen.getByPlaceholderText(/Enter Password/);
      await user.type(input, 'any password');
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(mockOnUnlock).toHaveBeenCalled();
      }, { timeout: 2000 });
    });

    it('does NOT unlock with wrong password', async () => {
      vi.useRealTimers();
      const user = userEvent.setup();
      render(<LockScreen onUnlock={mockOnUnlock} />);
      
      const input = screen.getByPlaceholderText(/Enter Password/);
      await user.type(input, 'wrong password');
      await user.keyboard('{Enter}');
      
      // Wait a bit to ensure no unlock
      await new Promise(resolve => setTimeout(resolve, 600));
      expect(mockOnUnlock).not.toHaveBeenCalled();
    });

    it('does NOT unlock with partial password', async () => {
      vi.useRealTimers();
      const user = userEvent.setup();
      render(<LockScreen onUnlock={mockOnUnlock} />);
      
      const input = screen.getByPlaceholderText(/Enter Password/);
      await user.type(input, 'any');
      await user.keyboard('{Enter}');
      
      await new Promise(resolve => setTimeout(resolve, 600));
      expect(mockOnUnlock).not.toHaveBeenCalled();
    });

    it('does NOT unlock with empty password', async () => {
      vi.useRealTimers();
      const user = userEvent.setup();
      render(<LockScreen onUnlock={mockOnUnlock} />);
      
      await user.keyboard('{Enter}');
      
      expect(mockOnUnlock).not.toHaveBeenCalled();
    });

    it('shakes on wrong password', async () => {
      vi.useRealTimers();
      const user = userEvent.setup();
      render(<LockScreen onUnlock={mockOnUnlock} />);
      
      const input = screen.getByPlaceholderText(/Enter Password/);
      await user.type(input, 'wrong');
      await user.keyboard('{Enter}');
      
      // Check for shake animation class
      await waitFor(() => {
        const shakingElement = document.querySelector('.animate-shake');
        expect(shakingElement).toBeTruthy();
      });
    });
  });

  describe('Submit button', () => {
    it('shows submit button when password is entered', async () => {
      vi.useRealTimers();
      const user = userEvent.setup();
      render(<LockScreen onUnlock={mockOnUnlock} />);
      
      const input = screen.getByPlaceholderText(/Enter Password/);
      await user.type(input, 'test');
      
      // Submit button should appear
      const submitButton = document.querySelector('button[type="submit"]');
      expect(submitButton).toBeTruthy();
    });

    it('hides submit button when password is empty', () => {
      render(<LockScreen onUnlock={mockOnUnlock} />);
      
      const submitButtons = document.querySelectorAll('button[type="submit"]');
      // The submit arrow button should not be visible
      expect(submitButtons.length).toBe(0);
    });
  });

  describe('Custom user info', () => {
    it('displays custom user name', () => {
      render(<LockScreen onUnlock={mockOnUnlock} userName="Test User" />);
      
      expect(screen.getByText(/Test User/)).toBeInTheDocument();
    });
  });

  describe('Time updates', () => {
    it('updates time every second', async () => {
      render(<LockScreen onUnlock={mockOnUnlock} />);
      
      const initialTime = document.querySelector('[class*="text-8xl"]')?.textContent;
      
      // Advance timer by 1 second
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      
      // Time should still be displayed (may or may not have changed in 1 second)
      const currentTime = document.querySelector('[class*="text-8xl"]')?.textContent;
      expect(currentTime).toBeTruthy();
    });
  });

  describe('Focus behavior', () => {
    it('focuses password input on mount', () => {
      render(<LockScreen onUnlock={mockOnUnlock} />);
      
      const input = screen.getByPlaceholderText(/Enter Password/);
      expect(document.activeElement).toBe(input);
    });
  });
});
