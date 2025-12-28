// Selection System Components
// Finder-style rubber band and multi-selection for zOS

export { default as RubberBandSelection } from './RubberBandSelection';
export { default as SelectableItem } from './SelectableItem';
export { default as SelectionIndicator } from './SelectionIndicator';
export { default as DragGhost } from './DragGhost';

// Re-export context and types
export {
  SelectionProvider,
  useSelection,
  SELECTION_COLOR,
  SELECTION_BG,
  SELECTION_BORDER,
  type SelectableItem as SelectableItemType,
  type SelectionRect,
} from '@/contexts/SelectionContext';
