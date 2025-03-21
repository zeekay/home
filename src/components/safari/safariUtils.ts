
/**
 * Calculate size reduction for recursive Safari windows
 * @param baseSize The original size value
 * @param depth The recursion depth level
 * @returns The reduced size value
 */
export const calculateSizeReduction = (baseSize: number, depth: number): number => {
  // Reduce by 10% for each level of recursion
  return baseSize * Math.pow(0.9, depth);
};

/**
 * Check if the current Safari window is running inside an iframe
 * @returns Boolean indicating if the window is in an iframe
 */
export const checkIfInIframe = (): boolean => {
  try {
    return window.self !== window.top;
  } catch (e) {
    // If accessing window.top throws an error, we're definitely in an iframe
    return true;
  }
};
