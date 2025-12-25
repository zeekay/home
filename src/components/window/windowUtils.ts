
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
export const getWindowStyle = (windowType: 'default' | 'terminal' | 'safari' | 'itunes' | 'textpad' | 'system' | 'about') => {
  switch (windowType) {
    case 'terminal':
      return 'bg-black text-white rounded-lg';
    case 'safari':
      return 'bg-white/95 dark:bg-gray-800/95 backdrop-blur-md';
    case 'itunes':
      return 'bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-gray-300/40 dark:border-gray-600/40';
    case 'textpad':
      return 'bg-black/80 text-gray-300 border-white/20'; // Matched to dock styling
    case 'system':
      return 'bg-white/90 dark:bg-gray-800/90 backdrop-blur-md';
    case 'about':
      return 'bg-white/90 dark:bg-gray-800/90 backdrop-blur-md';
    default:
      return 'bg-white/90 dark:bg-gray-800/90 backdrop-blur-md';
  }
};

/**
 * Calculates window size based on screen size
 * @param defaultSize The default size for desktop
 * @returns The responsive window size
 */
export const getResponsiveWindowSize = (defaultSize: { width: number, height: number }) => {
  // This function is intended to be used on the client
  if (typeof window === 'undefined') return defaultSize;
  
  const isMobile = window.innerWidth < 768;
  const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
  
  if (isMobile) {
    // For mobile, use nearly full screen with margins
    return {
      width: Math.min(defaultSize.width, window.innerWidth - 20),
      height: Math.min(defaultSize.height, window.innerHeight - 100)
    };
  }
  
  if (isTablet) {
    // For tablets, use a percentage of the screen
    return {
      width: Math.min(defaultSize.width, window.innerWidth * 0.85),
      height: Math.min(defaultSize.height, window.innerHeight * 0.8)
    };
  }
  
  // For desktop, use the default or limit by screen size
  return {
    width: Math.min(defaultSize.width, window.innerWidth - 100),
    height: Math.min(defaultSize.height, window.innerHeight - 100)
  };
};

/**
 * Calculates window position based on screen size
 * @param defaultPosition The default position for desktop
 * @returns The responsive window position
 */
export const getResponsiveWindowPosition = (defaultPosition: { x: number, y: number }) => {
  // This function is intended to be used on the client
  if (typeof window === 'undefined') return defaultPosition;
  
  const isMobile = window.innerWidth < 768;
  
  if (isMobile) {
    // Center on mobile
    return {
      x: Math.max(10, Math.floor((window.innerWidth - 320) / 2)),
      y: Math.max(10, Math.floor((window.innerHeight - 400) / 4))
    };
  }
  
  // For larger screens, use the default or ensure it's visible
  return {
    x: Math.min(Math.max(10, defaultPosition.x), window.innerWidth - 350),
    y: Math.min(Math.max(10, defaultPosition.y), window.innerHeight - 400)
  };
};
