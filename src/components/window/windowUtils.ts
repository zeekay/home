
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
      return 'bg-[#262a33] text-white';
    case 'safari':
      return 'bg-white/90 dark:bg-gray-800/90';
    case 'itunes':
      return 'bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800';
    default:
      return 'bg-white/90 dark:bg-gray-800/90';
  }
};
