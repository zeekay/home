/**
 * Drag and Drop utilities
 * Re-exports from DragDropContext for convenience
 */

import { useCallback, useEffect, useRef } from 'react';
import { useDragDrop, DragItem, DragItemType, DragOperation } from '@/contexts/DragDropContext';

export type { DragItem, DragItemType, DragOperation };

/**
 * Hook for creating a drop target
 */
export function useDropTarget(
  id: string,
  accepts: DragItemType[],
  onDrop: (item: DragItem, operation: DragOperation) => void
) {
  const ref = useRef<HTMLElement>(null);
  const { registerDropZone, unregisterDropZone, isDragging, dragItem, activeDropZone, endDrag } = useDragDrop();

  // Memoize accepts to prevent infinite loops when callers pass inline arrays
  const acceptsKey = JSON.stringify(accepts);
  const acceptsRef = useRef(accepts);
  acceptsRef.current = accepts;

  useEffect(() => {
    if (ref.current) {
      registerDropZone(id, acceptsRef.current, ref.current);
    }
    return () => unregisterDropZone(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, acceptsKey, registerDropZone, unregisterDropZone]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (dragItem && acceptsRef.current.includes(dragItem.itemType)) {
      onDrop(dragItem, 'copy');
      endDrag();
    }
  }, [dragItem, onDrop, endDrag]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  return {
    ref,
    isOver: activeDropZone === id,
    canDrop: isDragging && dragItem ? acceptsRef.current.includes(dragItem.itemType) : false,
    dropProps: {
      onDrop: handleDrop,
      onDragOver: handleDragOver,
    },
  };
}

/**
 * Hook for creating a drag source
 */
export function useDragSource(item: DragItem) {
  const { startDrag, endDrag } = useDragDrop();

  const handleDragStart = useCallback((e: React.DragEvent) => {
    startDrag(item, e);
  }, [item, startDrag]);

  const handleDragEnd = useCallback(() => {
    endDrag();
  }, [endDrag]);

  return {
    dragProps: {
      draggable: true,
      onDragStart: handleDragStart,
      onDragEnd: handleDragEnd,
    },
  };
}
