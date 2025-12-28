/**
 * zOS Cursor System
 *
 * Provides consistent, native-feeling cursor states throughout the application.
 * Cursor types mirror macOS behavior for familiarity.
 */

/**
 * Standard cursor types available in zOS.
 * Maps to CSS cursor values with custom enhancements.
 */
export const CursorType = {
  // Standard cursors
  DEFAULT: 'cursor-default',
  POINTER: 'cursor-pointer',
  TEXT: 'cursor-text',
  MOVE: 'cursor-move',
  GRAB: 'cursor-grab',
  GRABBING: 'cursor-grabbing',
  NOT_ALLOWED: 'cursor-not-allowed',
  WAIT: 'cursor-wait',
  PROGRESS: 'cursor-progress',
  CROSSHAIR: 'cursor-crosshair',
  HELP: 'cursor-help',
  CONTEXT_MENU: 'cursor-context-menu',
  COPY: 'cursor-copy',
  ALIAS: 'cursor-alias',
  CELL: 'cursor-cell',
  VERTICAL_TEXT: 'cursor-vertical-text',
  NONE: 'cursor-none',
  ZOOM_IN: 'cursor-zoom-in',
  ZOOM_OUT: 'cursor-zoom-out',

  // Resize cursors - edges
  RESIZE_N: 'cursor-n-resize',
  RESIZE_S: 'cursor-s-resize',
  RESIZE_E: 'cursor-e-resize',
  RESIZE_W: 'cursor-w-resize',
  RESIZE_NS: 'cursor-ns-resize',
  RESIZE_EW: 'cursor-ew-resize',

  // Resize cursors - corners
  RESIZE_NE: 'cursor-ne-resize',
  RESIZE_NW: 'cursor-nw-resize',
  RESIZE_SE: 'cursor-se-resize',
  RESIZE_SW: 'cursor-sw-resize',
  RESIZE_NESW: 'cursor-nesw-resize',
  RESIZE_NWSE: 'cursor-nwse-resize',

  // Custom zOS cursors (applied via CSS classes)
  WINDOW_DRAG: 'cursor-zos-window-drag',
  COLUMN_RESIZE: 'cursor-zos-column-resize',
  SPLIT_H: 'cursor-zos-split-h',
  SPLIT_V: 'cursor-zos-split-v',
  DOCK_DRAG: 'cursor-zos-dock-drag',
  SELECTION: 'cursor-zos-selection',
} as const;

export type CursorTypeValue = typeof CursorType[keyof typeof CursorType];

/**
 * Cursor context for different UI areas.
 * Helps determine appropriate cursor based on interaction zone.
 */
export type CursorContext =
  | 'window'
  | 'titlebar'
  | 'sidebar'
  | 'content'
  | 'dock'
  | 'menu'
  | 'dialog'
  | 'desktop';

/**
 * Interactive element types and their default cursor states.
 */
export const InteractiveCursors: Record<string, CursorTypeValue> = {
  // Buttons and links
  button: CursorType.POINTER,
  link: CursorType.POINTER,
  menuItem: CursorType.POINTER,
  tab: CursorType.POINTER,
  checkbox: CursorType.POINTER,
  radio: CursorType.POINTER,
  toggle: CursorType.POINTER,

  // Text elements
  input: CursorType.TEXT,
  textarea: CursorType.TEXT,
  contentEditable: CursorType.TEXT,
  selectableText: CursorType.TEXT,

  // Draggable elements
  draggable: CursorType.GRAB,
  dragging: CursorType.GRABBING,
  dockItem: CursorType.GRAB,
  windowTitlebar: CursorType.MOVE,

  // Resize handles
  resizeHandle: CursorType.RESIZE_SE,
  resizeN: CursorType.RESIZE_N,
  resizeS: CursorType.RESIZE_S,
  resizeE: CursorType.RESIZE_E,
  resizeW: CursorType.RESIZE_W,
  resizeNE: CursorType.RESIZE_NE,
  resizeNW: CursorType.RESIZE_NW,
  resizeSE: CursorType.RESIZE_SE,
  resizeSW: CursorType.RESIZE_SW,

  // Split panes
  splitHorizontal: CursorType.RESIZE_EW,
  splitVertical: CursorType.RESIZE_NS,
  columnResize: CursorType.RESIZE_EW,

  // States
  disabled: CursorType.NOT_ALLOWED,
  loading: CursorType.PROGRESS,
  waiting: CursorType.WAIT,
} as const;

/**
 * Returns the appropriate cursor class for a given element type.
 */
export function getCursor(elementType: keyof typeof InteractiveCursors): string {
  return InteractiveCursors[elementType] || CursorType.DEFAULT;
}

/**
 * Combines cursor class with additional classes.
 */
export function withCursor(
  cursorType: CursorTypeValue,
  ...additionalClasses: string[]
): string {
  return [cursorType, ...additionalClasses].filter(Boolean).join(' ');
}

/**
 * Helper to get resize cursor based on edge/corner position.
 */
export function getResizeCursor(
  position: 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'
): CursorTypeValue {
  const cursorMap: Record<string, CursorTypeValue> = {
    n: CursorType.RESIZE_N,
    s: CursorType.RESIZE_S,
    e: CursorType.RESIZE_E,
    w: CursorType.RESIZE_W,
    ne: CursorType.RESIZE_NE,
    nw: CursorType.RESIZE_NW,
    se: CursorType.RESIZE_SE,
    sw: CursorType.RESIZE_SW,
  };
  return cursorMap[position] || CursorType.RESIZE_SE;
}

/**
 * Cursor classes for common Tailwind patterns.
 * Use these in className props for consistent cursor behavior.
 */
export const CursorClasses = {
  // Interactive elements
  interactive: 'cursor-pointer hover:cursor-pointer active:cursor-pointer',
  interactiveDisabled: 'cursor-not-allowed',

  // Text
  textSelectable: 'cursor-text select-text',
  textNonSelectable: 'cursor-default select-none',

  // Dragging
  draggable: 'cursor-grab active:cursor-grabbing',
  dragging: 'cursor-grabbing',

  // Window
  windowTitlebar: 'cursor-default active:cursor-move',
  windowResize: 'cursor-se-resize',

  // Resizers
  resizerHorizontal: 'cursor-ew-resize',
  resizerVertical: 'cursor-ns-resize',
  columnResizer: 'cursor-col-resize',
  rowResizer: 'cursor-row-resize',

  // Split panes
  splitPaneH: 'cursor-ew-resize hover:cursor-ew-resize',
  splitPaneV: 'cursor-ns-resize hover:cursor-ns-resize',

  // Progress states
  loading: 'cursor-progress',
  waiting: 'cursor-wait',

  // Selection
  crosshair: 'cursor-crosshair',
  cell: 'cursor-cell',

  // Actions
  zoomIn: 'cursor-zoom-in',
  zoomOut: 'cursor-zoom-out',
  help: 'cursor-help',
  copy: 'cursor-copy',
  alias: 'cursor-alias',

  // Context
  contextMenu: 'cursor-context-menu',

  // None
  hidden: 'cursor-none',
} as const;

/**
 * Type-safe cursor class getter.
 */
export function cursorClass(type: keyof typeof CursorClasses): string {
  return CursorClasses[type];
}

/**
 * Applies cursor based on drag state.
 * Use in components that support drag-and-drop.
 */
export function getDragCursor(isDragging: boolean): string {
  return isDragging ? CursorClasses.dragging : CursorClasses.draggable;
}

/**
 * Applies cursor based on loading state.
 */
export function getLoadingCursor(isLoading: boolean): string {
  return isLoading ? CursorClasses.loading : '';
}

/**
 * Applies cursor based on disabled state.
 */
export function getDisabledCursor(isDisabled: boolean): string {
  return isDisabled ? CursorClasses.interactiveDisabled : CursorClasses.interactive;
}
