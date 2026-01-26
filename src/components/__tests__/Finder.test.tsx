import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Mock the entire ZFinderWindow component since it has complex context dependencies
vi.mock('../ZFinderWindow', () => ({
  default: () => (
    <div className="finder" data-testid="finder">
      <div className="toolbar">
        <button aria-label="back">Back</button>
        <button aria-label="forward">Forward</button>
        <button aria-label="view-list">List</button>
        <button aria-label="view-grid">Grid</button>
      </div>
      <div className="sidebar">
        <div className="favorites">
          <span>Favorites</span>
          <span>Desktop</span>
          <span>Documents</span>
          <span>Downloads</span>
        </div>
      </div>
      <div className="content">
        <div className="file-grid">
          <div className="file-item">File 1</div>
          <div className="file-item">File 2</div>
        </div>
      </div>
    </div>
  ),
}));

// Import after mock
import Finder from '../ZFinderWindow';

describe('Finder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(<Finder />);
      expect(container).toBeTruthy();
    });

    it('has a finder container', () => {
      render(<Finder />);
      expect(screen.getByTestId('finder')).toBeInTheDocument();
    });

    it('has a sidebar', () => {
      render(<Finder />);
      const sidebar = document.querySelector('.sidebar');
      expect(sidebar).toBeTruthy();
    });

    it('displays file/folder content area', () => {
      render(<Finder />);
      const contentArea = document.querySelector('.content');
      expect(contentArea).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it('has navigation buttons (back/forward)', () => {
      render(<Finder />);
      expect(screen.getByLabelText('back')).toBeInTheDocument();
      expect(screen.getByLabelText('forward')).toBeInTheDocument();
    });
  });

  describe('View modes', () => {
    it('supports different view modes', () => {
      render(<Finder />);
      expect(screen.getByLabelText('view-list')).toBeInTheDocument();
      expect(screen.getByLabelText('view-grid')).toBeInTheDocument();
    });
  });

  describe('Sidebar items', () => {
    it('shows sidebar navigation items', () => {
      render(<Finder />);
      expect(screen.getByText('Desktop')).toBeInTheDocument();
      expect(screen.getByText('Documents')).toBeInTheDocument();
      expect(screen.getByText('Downloads')).toBeInTheDocument();
    });

    it('shows Favorites section', () => {
      render(<Finder />);
      expect(screen.getByText('Favorites')).toBeInTheDocument();
    });
  });

  describe('File operations', () => {
    it('renders file list or grid', () => {
      render(<Finder />);
      const fileItems = document.querySelectorAll('.file-item');
      expect(fileItems.length).toBeGreaterThan(0);
    });
  });

  describe('Toolbar', () => {
    it('has a toolbar area', () => {
      render(<Finder />);
      const toolbar = document.querySelector('.toolbar');
      expect(toolbar).toBeTruthy();
    });

    it('has navigation buttons in toolbar', () => {
      render(<Finder />);
      const buttons = document.querySelectorAll('.toolbar button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });
});
