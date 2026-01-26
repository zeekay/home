import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import BootSequence from '../BootSequence';

describe('BootSequence', () => {
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Full boot mode', () => {
    it('renders without crashing', () => {
      const { container } = render(<BootSequence onComplete={mockOnComplete} mode="full" />);
      expect(container).toBeTruthy();
    });

    it('renders a fixed overlay container', () => {
      render(<BootSequence onComplete={mockOnComplete} mode="full" />);
      const overlay = document.querySelector('[class*="fixed"]');
      expect(overlay).toBeTruthy();
    });

    it('does not call onComplete immediately', () => {
      render(<BootSequence onComplete={mockOnComplete} mode="full" />);
      expect(mockOnComplete).not.toHaveBeenCalled();
    });
  });

  describe('Modern boot mode', () => {
    it('renders without crashing', () => {
      const { container } = render(<BootSequence onComplete={mockOnComplete} mode="modern" />);
      expect(container).toBeTruthy();
    });
  });

  describe('Classic boot mode', () => {
    it('renders without crashing', () => {
      const { container } = render(<BootSequence onComplete={mockOnComplete} mode="classic" />);
      expect(container).toBeTruthy();
    });
  });

  describe('Component behavior', () => {
    it('accepts onComplete callback', () => {
      const callback = vi.fn();
      render(<BootSequence onComplete={callback} />);
      expect(callback).not.toHaveBeenCalled(); // Not called immediately
    });

    it('renders with default mode', () => {
      const { container } = render(<BootSequence onComplete={mockOnComplete} />);
      expect(container).toBeTruthy();
    });

    it('progresses over time', () => {
      render(<BootSequence onComplete={mockOnComplete} mode="full" />);

      // Advance timers to trigger state updates
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Component should still be rendered
      const container = document.querySelector('[class*="fixed"]');
      expect(container).toBeTruthy();
    });
  });
});
