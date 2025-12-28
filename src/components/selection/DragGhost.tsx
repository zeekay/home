import React from 'react';
import { createPortal } from 'react-dom';
import { useSelection, SELECTION_COLOR } from '@/contexts/SelectionContext';

interface DragGhostProps {
  className?: string;
  // Custom render function for ghost content
  renderContent?: (count: number) => React.ReactNode;
}

/**
 * DragGhost - Visual preview when dragging multiple selected items
 *
 * Shows a stack of items with count badge when dragging a multi-selection,
 * similar to macOS Finder's drag preview.
 */
const DragGhost: React.FC<DragGhostProps> = ({ className = '', renderContent }) => {
  const { isDraggingSelection, dragPosition, selectionCount } = useSelection();

  if (!isDraggingSelection || !dragPosition || selectionCount === 0) {
    return null;
  }

  const defaultContent = (
    <div
      className={`drag-ghost ${className}`}
      style={{
        position: 'fixed',
        left: dragPosition.x + 20,
        top: dragPosition.y + 20,
        pointerEvents: 'none',
        zIndex: 10000,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Stacked items effect */}
      <div
        style={{
          position: 'relative',
          width: 64,
          height: 64,
        }}
      >
        {/* Back items (stacked effect) */}
        {selectionCount > 2 && (
          <div
            style={{
              position: 'absolute',
              top: 8,
              left: 8,
              width: 48,
              height: 48,
              backgroundColor: 'rgba(60, 60, 67, 0.8)',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.1)',
              transform: 'rotate(-5deg)',
            }}
          />
        )}
        {selectionCount > 1 && (
          <div
            style={{
              position: 'absolute',
              top: 4,
              left: 4,
              width: 48,
              height: 48,
              backgroundColor: 'rgba(70, 70, 77, 0.9)',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.15)',
              transform: 'rotate(-2deg)',
            }}
          />
        )}

        {/* Front item */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 48,
            height: 48,
            backgroundColor: 'rgba(80, 80, 87, 0.95)',
            borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* File icon placeholder */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(255,255,255,0.6)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        </div>

        {/* Count badge */}
        <div
          style={{
            position: 'absolute',
            top: -8,
            right: -8,
            minWidth: 24,
            height: 24,
            backgroundColor: SELECTION_COLOR,
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 6px',
            fontSize: 13,
            fontWeight: 700,
            color: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
            border: '2px solid rgba(0,0,0,0.3)',
          }}
        >
          {selectionCount}
        </div>
      </div>

      {/* Label */}
      <div
        style={{
          marginTop: 8,
          textAlign: 'center',
          color: 'rgba(255,255,255,0.9)',
          fontSize: 12,
          fontWeight: 500,
          textShadow: '0 1px 3px rgba(0,0,0,0.5)',
          whiteSpace: 'nowrap',
        }}
      >
        {selectionCount} item{selectionCount !== 1 ? 's' : ''}
      </div>
    </div>
  );

  return createPortal(
    renderContent ? renderContent(selectionCount) : defaultContent,
    document.body
  );
};

export default DragGhost;
