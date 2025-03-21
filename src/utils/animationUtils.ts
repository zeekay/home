
// Function to calculate dynamic peaks that occur at random intervals with smooth transitions
export const calculateDynamicPeaks = (
  currentTime: number, 
  waveIndex: number,
  frequencies: number[],
  timings: number[],
  delay: number
) => {
  // Base multiplier with smoother sine wave
  let peakMultiplier = 0.6 + (Math.sin(currentTime * 0.08 + waveIndex * 0.2) * 0.2); // Slower base height variation
  
  // Add dynamic peaks based on multiple sine waves with different frequencies
  if (Array.isArray(frequencies)) {
    frequencies.forEach((freq, i) => {
      // Use smoother sine functions with easing
      const sinVal = Math.sin(currentTime * freq + timings[i] + (waveIndex * 0.1));
      
      // Use smoother transition for peaks using sigmoid-like function
      if (sinVal > 0.8 && currentTime > delay) {
        // Calculate how far above threshold we are (0-0.2 range)
        const aboveThreshold = (sinVal - 0.8) * 5; // Scale to 0-1 range
        
        // Apply sigmoid-like smoothstep function for gentler transition
        const smoothedIntensity = aboveThreshold * aboveThreshold * (3 - 2 * aboveThreshold);
        
        // Apply smoother peak effect with gradual falloff
        peakMultiplier += smoothedIntensity * 0.6;
      }
    });
  }
  
  return peakMultiplier;
};
