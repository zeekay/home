
// Function to calculate dynamic peaks that occur at random intervals
export const calculateDynamicPeaks = (
  currentTime: number, 
  waveIndex: number,
  frequencies: number[],
  timings: number[],
  delay: number
) => {
  // Base multiplier
  let peakMultiplier = 0.6 + (Math.sin(currentTime * 0.1 + waveIndex) * 0.2); // Base height variation
  
  // Add dynamic peaks based on multiple sine waves with different frequencies
  frequencies.forEach((freq, i) => {
    const sinVal = Math.sin(currentTime * freq + timings[i] + (waveIndex * 0.1));
    
    // Only create peak when sine wave crosses high threshold and after delay
    if (sinVal > 0.95 && currentTime > delay) {
      // Calculate a spike effect that diminishes over time
      const timeSinceTrigger = 0.05; // Pretend we just started
      peakMultiplier += Math.exp(-timeSinceTrigger * 5) * 0.8; // Exponential decay
    }
  });
  
  return peakMultiplier;
};
