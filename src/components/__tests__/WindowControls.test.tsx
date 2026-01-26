import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import WindowControls from '../window/WindowControls';

describe('WindowControls', () => {
  const mockOnClose = vi.fn();
  const mockOnMinimize = vi.fn();
  const mockOnMaximize = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders three traffic light buttons', () => {
      render(
        <WindowControls
          onClose={mockOnClose}
          onMinimize={mockOnMinimize}
          onMaximize={mockOnMaximize}
        />
      );
      
      expect(screen.getByTitle('Close')).toBeInTheDocument();
      expect(screen.getByTitle('Minimize')).toBeInTheDocument();
      expect(screen.getByTitle('Zoom')).toBeInTheDocument();
    });

    it('renders with correct colors when active', () => {
      render(
        <WindowControls
          onClose={mockOnClose}
          onMinimize={mockOnMinimize}
          onMaximize={mockOnMaximize}
          isActive={true}
        />
      );
      
      const closeButton = screen.getByTitle('Close');
      expect(closeButton).toHaveStyle({ backgroundColor: '#FF5F57' });
      
      const minimizeButton = screen.getByTitle('Minimize');
      expect(minimizeButton).toHaveStyle({ backgroundColor: '#FFBD2E' });
      
      const maximizeButton = screen.getByTitle('Zoom');
      expect(maximizeButton).toHaveStyle({ backgroundColor: '#28C840' });
    });

    it('renders with gray colors when inactive', () => {
      render(
        <WindowControls
          onClose={mockOnClose}
          onMinimize={mockOnMinimize}
          onMaximize={mockOnMaximize}
          isActive={false}
        />
      );
      
      const closeButton = screen.getByTitle('Close');
      expect(closeButton).toHaveStyle({ backgroundColor: '#4D4D4D' });
    });
  });

  describe('Click handlers', () => {
    it('calls onClose when close button is clicked', () => {
      render(
        <WindowControls
          onClose={mockOnClose}
          onMinimize={mockOnMinimize}
          onMaximize={mockOnMaximize}
        />
      );
      
      fireEvent.click(screen.getByTitle('Close'));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onMinimize when minimize button is clicked', () => {
      render(
        <WindowControls
          onClose={mockOnClose}
          onMinimize={mockOnMinimize}
          onMaximize={mockOnMaximize}
        />
      );
      
      fireEvent.click(screen.getByTitle('Minimize'));
      expect(mockOnMinimize).toHaveBeenCalledTimes(1);
    });

    it('calls onMaximize when maximize button is clicked', () => {
      render(
        <WindowControls
          onClose={mockOnClose}
          onMinimize={mockOnMinimize}
          onMaximize={mockOnMaximize}
        />
      );
      
      fireEvent.click(screen.getByTitle('Zoom'));
      expect(mockOnMaximize).toHaveBeenCalledTimes(1);
    });

    it('stops propagation on click', () => {
      const parentClickHandler = vi.fn();
      render(
        <div onClick={parentClickHandler}>
          <WindowControls
            onClose={mockOnClose}
            onMinimize={mockOnMinimize}
            onMaximize={mockOnMaximize}
          />
        </div>
      );
      
      fireEvent.click(screen.getByTitle('Close'));
      expect(parentClickHandler).not.toHaveBeenCalled();
    });
  });

  describe('Hover behavior', () => {
    it('shows icons on hover', async () => {
      render(
        <WindowControls
          onClose={mockOnClose}
          onMinimize={mockOnMinimize}
          onMaximize={mockOnMaximize}
          isActive={true}
        />
      );
      
      const controlsGroup = screen.getByRole('group', { name: /Window controls/i });
      fireEvent.mouseEnter(controlsGroup);
      
      // Icons should be visible (opacity: 1)
      const icons = document.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('hides icons when not hovering', () => {
      render(
        <WindowControls
          onClose={mockOnClose}
          onMinimize={mockOnMinimize}
          onMaximize={mockOnMaximize}
          isActive={true}
        />
      );

      // Before hover, icons should be hidden (opacity 0 or not visible)
      // Check that SVGs exist but are hidden
      const svgIcons = document.querySelectorAll('button svg');
      expect(svgIcons.length).toBe(0); // Icons not rendered when not hovering
    });
  });

  describe('Disabled state', () => {
    it('does not call handlers when disabled', () => {
      render(
        <WindowControls
          onClose={mockOnClose}
          onMinimize={mockOnMinimize}
          onMaximize={mockOnMaximize}
          disabled={true}
        />
      );
      
      fireEvent.click(screen.getByTitle('Close'));
      fireEvent.click(screen.getByTitle('Minimize'));
      fireEvent.click(screen.getByTitle('Zoom'));
      
      expect(mockOnClose).not.toHaveBeenCalled();
      expect(mockOnMinimize).not.toHaveBeenCalled();
      expect(mockOnMaximize).not.toHaveBeenCalled();
    });

    it('shows disabled cursor when disabled', () => {
      render(
        <WindowControls
          onClose={mockOnClose}
          onMinimize={mockOnMinimize}
          onMaximize={mockOnMaximize}
          disabled={true}
        />
      );
      
      const closeButton = screen.getByTitle('Close');
      expect(closeButton).toHaveStyle({ cursor: 'not-allowed' });
    });
  });

  describe('Maximized state', () => {
    it('shows restore tooltip when maximized', () => {
      render(
        <WindowControls
          onClose={mockOnClose}
          onMinimize={mockOnMinimize}
          onMaximize={mockOnMaximize}
          isMaximized={true}
        />
      );
      
      expect(screen.getByTitle('Exit Full Screen')).toBeInTheDocument();
    });

    it('shows zoom tooltip when not maximized', () => {
      render(
        <WindowControls
          onClose={mockOnClose}
          onMinimize={mockOnMinimize}
          onMaximize={mockOnMaximize}
          isMaximized={false}
        />
      );
      
      expect(screen.getByTitle('Zoom')).toBeInTheDocument();
    });
  });

  describe('Option key behavior', () => {
    it('shows fullscreen icon when Option is pressed', () => {
      render(
        <WindowControls
          onClose={mockOnClose}
          onMinimize={mockOnMinimize}
          onMaximize={mockOnMaximize}
          isActive={true}
        />
      );
      
      // Simulate Option key press
      fireEvent.keyDown(window, { key: 'Alt' });
      
      const controlsGroup = screen.getByRole('group', { name: /Window controls/i });
      fireEvent.mouseEnter(controlsGroup);
      
      expect(screen.getByTitle('Enter Full Screen')).toBeInTheDocument();
    });

    it('calls requestFullscreen when Option+click on maximize', () => {
      const mockRequestFullscreen = vi.fn().mockResolvedValue(undefined);
      document.documentElement.requestFullscreen = mockRequestFullscreen;
      
      render(
        <WindowControls
          onClose={mockOnClose}
          onMinimize={mockOnMinimize}
          onMaximize={mockOnMaximize}
        />
      );
      
      fireEvent.click(screen.getByTitle('Zoom'), { altKey: true });
      
      expect(mockRequestFullscreen).toHaveBeenCalled();
      expect(mockOnMaximize).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has proper aria labels', () => {
      render(
        <WindowControls
          onClose={mockOnClose}
          onMinimize={mockOnMinimize}
          onMaximize={mockOnMaximize}
        />
      );
      
      expect(screen.getByRole('group', { name: /Window controls/i })).toBeInTheDocument();
      expect(screen.getByLabelText('Close')).toBeInTheDocument();
      expect(screen.getByLabelText('Minimize')).toBeInTheDocument();
      expect(screen.getByLabelText('Zoom')).toBeInTheDocument();
    });

    it('is keyboard navigable', () => {
      render(
        <WindowControls
          onClose={mockOnClose}
          onMinimize={mockOnMinimize}
          onMaximize={mockOnMaximize}
        />
      );
      
      const closeButton = screen.getByTitle('Close');
      closeButton.focus();
      
      fireEvent.keyDown(closeButton, { key: 'Enter' });
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('responds to space key', () => {
      render(
        <WindowControls
          onClose={mockOnClose}
          onMinimize={mockOnMinimize}
          onMaximize={mockOnMaximize}
        />
      );
      
      const minimizeButton = screen.getByTitle('Minimize');
      minimizeButton.focus();
      
      fireEvent.keyDown(minimizeButton, { key: ' ' });
      expect(mockOnMinimize).toHaveBeenCalled();
    });
  });
});
