import React from 'react';
import { useSelection, SELECTION_COLOR } from '@/contexts/SelectionContext';

interface SelectionIndicatorProps {
  className?: string;
  showWhenEmpty?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'custom';
  customStyle?: React.CSSProperties;
}

/**
 * SelectionIndicator - Shows count of selected items
 *
 * Displays a pill-shaped indicator showing how many items are selected,
 * similar to macOS Finder's selection count.
 */
const SelectionIndicator: React.FC<SelectionIndicatorProps> = ({
  className = '',
  showWhenEmpty = false,
  position = 'bottom-right',
  customStyle,
}) => {
  const { selectionCount } = useSelection();

  if (selectionCount === 0 && !showWhenEmpty) {
    return null;
  }

  // Position styles
  const positionStyles: Record<string, React.CSSProperties> = {
    'top-left': { top: 8, left: 8 },
    'top-right': { top: 8, right: 8 },
    'bottom-left': { bottom: 8, left: 8 },
    'bottom-right': { bottom: 8, right: 8 },
    custom: {},
  };

  const style: React.CSSProperties = {
    position: 'absolute',
    ...positionStyles[position],
    ...customStyle,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(10px)',
    borderRadius: 16,
    padding: '6px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    zIndex: 100,
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.1)',
    transition: 'opacity 200ms, transform 200ms',
    opacity: selectionCount > 0 ? 1 : 0.5,
    transform: selectionCount > 0 ? 'scale(1)' : 'scale(0.95)',
  };

  return (
    <div className={`selection-indicator ${className}`} style={style}>
      {/* Selection count badge */}
      <div
        style={{
          backgroundColor: SELECTION_COLOR,
          borderRadius: 12,
          minWidth: 24,
          height: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 6px',
          fontSize: 13,
          fontWeight: 600,
          color: 'white',
        }}
      >
        {selectionCount}
      </div>

      {/* Label */}
      <span
        style={{
          color: 'rgba(255,255,255,0.9)',
          fontSize: 13,
          fontWeight: 500,
        }}
      >
        {selectionCount === 1 ? 'item selected' : 'items selected'}
      </span>
    </div>
  );
};

export default SelectionIndicator;
