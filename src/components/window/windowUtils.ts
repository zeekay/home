
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
export const getWindowStyle = (windowType: 'default' | 'terminal' | 'safari' | 'itunes') => {
  switch (windowType) {
    case 'terminal':
      return 'bg-black/75 text-white backdrop-blur-md';
    case 'safari':
      return 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-md';
    case 'itunes':
      return 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-md';
    default:
      return 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-md';
  }
};
