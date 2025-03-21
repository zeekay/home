
// Create a global z-index manager
let globalZIndex = 40;

/**
 * Gets the next z-index value for window stacking
 * @returns The next z-index value
 */
export const getNextZIndex = () => ++globalZIndex;

/**
 * Returns the appropriate window style based on window type
 * @param windowType The type of window
 * @returns CSS class string for the window style
 */
export const getWindowStyle = (windowType: 'default' | 'terminal' | 'safari' | 'itunes' | 'textpad') => {
  switch (windowType) {
    case 'terminal':
      return 'bg-black/75 text-white backdrop-blur-md';
    case 'safari':
      return 'bg-white/95 dark:bg-gray-800/95 backdrop-blur-md';
    case 'itunes':
      return 'bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-gray-300/40 dark:border-gray-600/40';
    case 'textpad':
      return 'bg-white text-black';
    default:
      return 'bg-white/90 dark:bg-gray-800/90 backdrop-blur-md';
  }
};
