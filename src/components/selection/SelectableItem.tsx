import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useSelection, SELECTION_COLOR } from '@/contexts/SelectionContext';

interface SelectableItemProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  data?: unknown;
  disabled?: boolean;
  // Callback when item selection state changes
  onSelectionChange?: (isSelected: boolean) => void;
  // Custom styling options
  selectedClassName?: string;
  focusClassName?: string;
  // Grid item with checkmark
  showCheckmark?: boolean;
  // Custom render for selected state
  renderSelected?: (children: React.ReactNode) => React.ReactNode;
}

/**
 * SelectableItem - Wrapper for items that can be selected
 *
 * Handles:
 * - Single click selection
 * - Cmd+click individual toggle
 * - Shift+click range selection
 * - Registration with SelectionContext for rubber band selection
 */
const SelectableItem: React.FC<SelectableItemProps> = ({
  id,
  children,
  className = '',
  data,
  disabled = false,
  onSelectionChange,
  selectedClassName = '',
  focusClassName = '',
  showCheckmark = false,
  renderSelected,
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const {
    isSelected,
    handleClick,
    registerItem,
    unregisterItem,
    selectedIds,
    setDraggingSelection,
    setDragPosition,
    getSelectedItems,
  } = useSelection();

  const selected = isSelected(id);

  // Register/unregister item
  useEffect(() => {
    if (disabled || !elementRef.current) return;

    registerItem({
      id,
      element: elementRef.current,
      data,
    });

    return () => unregisterItem(id);
  }, [id, data, disabled, registerItem, unregisterItem]);

  // Notify selection changes
  useEffect(() => {
    onSelectionChange?.(selected);
  }, [selected, onSelectionChange]);

  // Handle click with modifier detection
  const onClick = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return;
      e.stopPropagation();
      handleClick(id, e);
    },
    [id, disabled, handleClick]
  );

  // Handle drag start for multi-selection drag
  const onDragStart = useCallback(
    (e: React.DragEvent) => {
      if (disabled) return;

      // If dragging a selected item, drag all selected items
      if (selected && selectedIds.size > 1) {
        setDraggingSelection(true);
        setDragPosition({ x: e.clientX, y: e.clientY });

        // Set drag data with all selected item IDs
        const selectedItemIds = Array.from(selectedIds);
        e.dataTransfer.setData('application/x-zos-selection', JSON.stringify(selectedItemIds));
        e.dataTransfer.effectAllowed = 'all';

        // Create custom drag image showing multiple items
        const ghost = document.createElement('div');
        ghost.className = 'selection-drag-ghost';
        ghost.innerHTML = `
          <div class="flex flex-col items-center p-2 bg-black/80 backdrop-blur-sm rounded-lg border border-white/20 shadow-2xl">
            <div class="relative">
              ${Array.from({ length: Math.min(3, selectedIds.size) })
                .map((_, i) => `
                  <div
                    class="w-12 h-12 bg-gray-700 rounded-lg border border-white/10 absolute"
                    style="top: ${i * 4}px; left: ${i * 4}px; z-index: ${10 - i}"
                  ></div>
                `)
                .join('')}
            </div>
            <div class="mt-2 text-xs text-white/80 text-center">
              ${selectedIds.size} items
            </div>
          </div>
        `;
        ghost.style.position = 'absolute';
        ghost.style.top = '-1000px';
        ghost.style.left = '-1000px';
        document.body.appendChild(ghost);
        e.dataTransfer.setDragImage(ghost, 30, 30);

        setTimeout(() => ghost.parentNode?.removeChild(ghost), 0);
      }
    },
    [disabled, selected, selectedIds, setDraggingSelection, setDragPosition]
  );

  const onDragEnd = useCallback(() => {
    setDraggingSelection(false);
    setDragPosition(null);
  }, [setDraggingSelection, setDragPosition]);

  // Handle keyboard navigation
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;

      // Space or Enter to select
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleClick(id, e as unknown as React.MouseEvent);
      }
    },
    [id, disabled, handleClick]
  );

  // Focus handling
  const onFocus = useCallback(() => setIsFocused(true), []);
  const onBlur = useCallback(() => setIsFocused(false), []);

  // Determine classes based on state
  const stateClasses = [
    selected ? selectedClassName || 'selection-item-selected' : '',
    isFocused ? focusClassName || 'selection-item-focused' : '',
  ].filter(Boolean).join(' ');

  // Render content with optional checkmark
  const content = (
    <>
      {showCheckmark && selected && (
        <div
          className="selection-checkmark"
          style={{
            position: 'absolute',
            top: 4,
            right: 4,
            width: 20,
            height: 20,
            borderRadius: '50%',
            backgroundColor: SELECTION_COLOR,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="2 6 5 9 10 3" />
          </svg>
        </div>
      )}
      {renderSelected && selected ? renderSelected(children) : children}
    </>
  );

  return (
    <div
      ref={elementRef}
      data-selectable
      data-selected={selected}
      data-id={id}
      className={`${className} ${stateClasses}`}
      onClick={onClick}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      onBlur={onBlur}
      tabIndex={disabled ? -1 : 0}
      draggable={!disabled}
      role="option"
      aria-selected={selected}
      style={{ position: 'relative' }}
    >
      {content}
    </div>
  );
};

export default SelectableItem;
