import React, { useCallback, useRef, useEffect } from 'react';
import { useSelection, SELECTION_BG, SELECTION_BORDER } from '@/contexts/SelectionContext';

interface RubberBandSelectionProps {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onSelectionChange?: (selectedIds: Set<string>) => void;
}

/**
 * RubberBandSelection - Finder-style drag-to-select container
 *
 * Wrap your selectable content with this component to enable
 * rubber band (marquee) selection. Items within must be registered
 * using the SelectableItem component or useSelectable hook.
 */
const RubberBandSelection: React.FC<RubberBandSelectionProps> = ({
  children,
  className = '',
  disabled = false,
  onSelectionChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    isSelecting,
    selectionRect,
    selectedIds,
    startRubberBand,
    setContainer,
    clearSelection,
  } = useSelection();

  // Register container on mount
  useEffect(() => {
    if (containerRef.current && !disabled) {
      setContainer(containerRef.current);
    }
    return () => setContainer(null);
  }, [setContainer, disabled]);

  // Notify selection changes
  useEffect(() => {
    onSelectionChange?.(selectedIds);
  }, [selectedIds, onSelectionChange]);

  // Handle mouse down to start rubber band selection
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return;

      // Only start selection on direct container clicks (not on children)
      const target = e.target as HTMLElement;
      const isDirectClick = target === containerRef.current;
      const isBackgroundClick = !target.closest('[data-selectable]');

      if (!isDirectClick && !isBackgroundClick) return;

      // Don't start rubber band on right click
      if (e.button !== 0) return;

      // Clear selection if clicking on background without shift
      if (!e.shiftKey && isBackgroundClick) {
        clearSelection();
      }

      if (containerRef.current) {
        startRubberBand(e, containerRef.current);
      }
    },
    [disabled, startRubberBand, clearSelection]
  );

  // Calculate selection box style
  const getSelectionBoxStyle = (): React.CSSProperties | null => {
    if (!selectionRect || !isSelecting) return null;

    const { startX, startY, endX, endY } = selectionRect;
    const left = Math.min(startX, endX);
    const top = Math.min(startY, endY);
    const width = Math.abs(endX - startX);
    const height = Math.abs(endY - startY);

    return {
      position: 'absolute',
      left,
      top,
      width,
      height,
      backgroundColor: SELECTION_BG,
      border: `1px solid ${SELECTION_BORDER}`,
      borderRadius: '2px',
      pointerEvents: 'none',
      zIndex: 9999,
      // macOS-style animation
      transition: 'none',
    };
  };

  const selectionBoxStyle = getSelectionBoxStyle();

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      onMouseDown={handleMouseDown}
      style={{ userSelect: isSelecting ? 'none' : undefined }}
    >
      {children}

      {/* Rubber band selection box */}
      {selectionBoxStyle && (
        <div
          className="selection-rubber-band"
          style={selectionBoxStyle}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default RubberBandSelection;
