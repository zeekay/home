import { calculateDynamicPeaks } from './animationUtils';

// Get theme-specific color
export const getThemeColor = (themeName: string) => {
  switch (themeName) {
    case 'wireframe': return 'rgba(255,255,255,0.28)';
    case 'particles': return 'rgba(230, 230, 240, 0.30)';
    case 'matrix': return 'rgba(180, 255, 200, 0.25)';
    case 'waves': return 'rgba(180, 220, 255, 0.28)';
    case 'neon': return 'rgba(200, 180, 255, 0.32)';
    default: return 'rgba(255,255,255,0.28)';
  }
};

// Get initial wave animation state
export const getWaveAnimationInitialState = (numWaves: number) => {
  // Music-inspired frequency ratios (based on harmonic series)
  const musicalRatios = [1, 1.5, 2, 2.5, 3, 4, 6, 8, 12];
  
  // Dynamic peak creation variables
  const peakFrequencies = Array(5).fill(0).map(() => Math.random() * 0.01 + 0.002);
  const peakTimings = Array(5).fill(0).map(() => Math.random() * Math.PI * 2);
  
  // Create arrays for wave properties with enhanced vertical movement
  const waveAmplitudes = Array(numWaves).fill(0).map(() => Math.random() * 250 + 100); // Taller waves with more variance
  const waveFrequencies = Array(numWaves).fill(0).map(() => {
    // Apply musical ratios to frequencies
    const baseFreq = 0.003;
    const ratio = musicalRatios[Math.floor(Math.random() * musicalRatios.length)];
    return baseFreq * ratio * (0.4 + Math.random() * 0.7); // More randomness
  });
  const waveSpeeds = Array(numWaves).fill(0).map(() => Math.random() * 0.015 + 0.003); // Slower speeds for some waves
  const waveOffsets = Array(numWaves).fill(0);
  const wavePhases = Array(numWaves).fill(0).map(() => Math.random() * Math.PI * 2); // Random starting phases
  const waveDelays = Array(numWaves).fill(0).map(() => Math.random() * 5 + 2); // Random delays before peak
  
  // Vertical oscillation parameters
  const verticalOscFreqs = Array(numWaves).fill(0).map(() => Math.random() * 0.008 + 0.001); // Slower vertical oscillations
  const verticalOscAmps = Array(numWaves).fill(0).map(() => Math.random() * 80 + 40); // More dramatic vertical oscillation
  const verticalOscOffsets = Array(numWaves).fill(0).map(() => Math.random() * Math.PI * 2);
  
  // Dynamic opacity parameters
  const opacityOscFreqs = Array(numWaves).fill(0).map(() => Math.random() * 0.01 + 0.002); // Opacity oscillation frequencies
  const opacityOscAmps = Array(numWaves).fill(0).map(() => Math.random() * 0.05 + 0.03); // Stronger opacity oscillation
  const opacityOscOffsets = Array(numWaves).fill(0).map(() => Math.random() * Math.PI * 2); // Random phase offsets
  const baseOpacities = Array(numWaves).fill(0).map(() => Math.random() * 0.2 + 0.15); // Higher base opacity value for each wave
  
  // Glow parameters for each wave
  const glowRadii = Array(numWaves).fill(0).map(() => Math.random() * 6 + 3); // Increased glow radius
  const glowFreqs = Array(numWaves).fill(0).map(() => Math.random() * 0.008 + 0.001); // Glow animation frequency
  const glowOffsets = Array(numWaves).fill(0).map(() => Math.random() * Math.PI * 2); // Random phase offsets
  
  // Line width variation
  const lineWidths = Array(numWaves).fill(0).map(() => Math.random() * 1 + 1.2); // Varied line thickness
  const lineWidthFreqs = Array(numWaves).fill(0).map(() => Math.random() * 0.01 + 0.002);
  const lineWidthOffsets = Array(numWaves).fill(0).map(() => Math.random() * Math.PI * 2);
  
  // Z-axis simulation parameters (for 3D-like effect)
  const zFreqs = Array(numWaves).fill(0).map(() => Math.random() * 0.005 + 0.001);
  const zAmps = Array(numWaves).fill(0).map(() => Math.random() * 0.4 + 0.7); // Scale factor
  const zOffsets = Array(numWaves).fill(0).map(() => Math.random() * Math.PI * 2);
  
  // Ripple effect parameters
  const rippleFrequencies = Array(3).fill(0).map(() => Math.random() * 0.003 + 0.0005); // Slower ripple frequencies
  const rippleAmplitudes = Array(3).fill(0).map(() => Math.random() * 300 + 200); // Large ripple amplitudes
  const ripplePhases = Array(3).fill(0).map(() => Math.random() * Math.PI * 2); // Random starting phases
  const rippleSpeeds = Array(3).fill(0).map(() => Math.random() * 0.004 + 0.001); // Slow ripple speeds
  const rippleCenters = Array(3).fill(0).map(() => Math.random()); // Random positions along x-axis (0-1)
  const rippleWidth = Array(3).fill(0).map(() => Math.random() * 0.3 + 0.1); // Width of ripple effect (0.1-0.4)
  const rippleDecay = Array(3).fill(0).map(() => Math.random() * 0.2 + 0.7); // How quickly ripples fade (0.7-0.9)
  const rippleActive = Array(3).fill(false); // Initially no active ripples
  const rippleStartTimes = Array(3).fill(0); // When ripples start
  const rippleDurations = Array(3).fill(0).map(() => Math.random() * 6 + 4); // How long ripples last (4-10s)
  
  return {
    peakFrequencies,
    peakTimings,
    waveAmplitudes,
    waveFrequencies,
    waveSpeeds,
    waveOffsets,
    wavePhases,
    waveDelays,
    verticalOscFreqs,
    verticalOscAmps,
    verticalOscOffsets,
    opacityOscFreqs,
    opacityOscAmps,
    opacityOscOffsets,
    baseOpacities,
    glowRadii,
    glowFreqs,
    glowOffsets,
    lineWidths,
    lineWidthFreqs,
    lineWidthOffsets,
    zFreqs,
    zAmps,
    zOffsets,
    rippleFrequencies,
    rippleAmplitudes,
    ripplePhases,
    rippleSpeeds,
    rippleCenters,
    rippleWidth,
    rippleDecay,
    rippleActive,
    rippleStartTimes,
    rippleDurations
  };
};

// Calculate ripple effect at a specific position
const calculateRippleEffect = (
  normalizedX: number, 
  currentTime: number, 
  state: ReturnType<typeof getWaveAnimationInitialState>,
  canvasWidth: number
) => {
  let totalRippleEffect = 0;
  
  // Process each ripple
  for (let i = 0; i < state.rippleActive.length; i++) {
    if (!state.rippleActive[i]) continue;
    
    // Calculate time since ripple started
    const rippleTime = currentTime - state.rippleStartTimes[i];
    
    // Check if ripple is still active based on duration
    if (rippleTime > state.rippleDurations[i]) {
      state.rippleActive[i] = false;
      continue;
    }
    
    // Calculate ripple progress (0 to 1)
    const rippleProgress = rippleTime / state.rippleDurations[i];
    
    // Ripple expands outward from center
    const rippleCenter = state.rippleCenters[i];
    const rippleDistance = Math.abs(normalizedX - rippleCenter);
    
    // The ripple wave moves outward over time
    // For natural ripple behavior, we use a sigmoid-like function that smoothly transitions
    const expansionProgress = Math.min(rippleProgress * 1.5, 1); // Slightly faster than the fade
    const rippleExpansion = expansionProgress * 0.5; // Control how far the ripple spreads
    
    // Only affect waves within the expanding ripple width + base width
    const effectiveWidth = state.rippleWidth[i] + rippleExpansion;
    
    if (rippleDistance <= effectiveWidth) {
      // Calculate intensity based on distance from center and ripple decay
      const normalizedDistance = rippleDistance / effectiveWidth;
      
      // Create a wave-like pattern that diminishes with distance from center
      const waveIntensity = Math.cos(normalizedDistance * Math.PI * 2 + state.ripplePhases[i] + currentTime * state.rippleFrequencies[i]) * 
                            (1 - normalizedDistance) * 
                            (1 - Math.pow(rippleProgress, 0.7)); // Fade out as ripple progresses
      
      totalRippleEffect += waveIntensity * state.rippleAmplitudes[i] * Math.pow(state.rippleDecay[i], rippleProgress * 10);
    }
  }
  
  return totalRippleEffect;
};

// Trigger new ripples at random intervals
const manageRipples = (
  time: number, 
  state: ReturnType<typeof getWaveAnimationInitialState>
) => {
  // Randomly trigger new ripples, more likely when none are active
  const activeRippleCount = state.rippleActive.filter(active => active).length;
  const baseChance = 0.005 - (activeRippleCount * 0.002); // Less likely to trigger new ripples if many are active
  
  if (Math.random() < baseChance) {
    // Find an inactive ripple slot
    for (let i = 0; i < state.rippleActive.length; i++) {
      if (!state.rippleActive[i]) {
        // Activate this ripple
        state.rippleActive[i] = true;
        state.rippleStartTimes[i] = time;
        state.rippleCenters[i] = Math.random(); // Random position 0-1
        state.rippleDurations[i] = Math.random() * 6 + 4; // 4-10 seconds
        state.rippleWidth[i] = Math.random() * 0.3 + 0.1; // 0.1-0.4 width
        break;
      }
    }
  }
};

// Enhanced waves animation with increased width, dynamic peaks, and varied timing
export const animateEnhancedWaves = (
  ctx: CanvasRenderingContext2D, 
  canvas: HTMLCanvasElement,
  options = { color: 'rgba(255,255,255,0.28)' }
) => {
  // Increased number of waves for density
  const waves = 100;
  
  // Get all animation state
  const state = getWaveAnimationInitialState(waves);
  
  // Use a consistent color theme with different opacity levels
  const baseColor = options.color;
  const waveColors = Array(waves).fill(0).map((_, i) => {
    // The opacity will be dynamically updated during animation
    return baseColor.replace(/[\d.]+\)$/, `0)`); // Start with 0 opacity, will be updated during animation
  });
  
  let animationId: number;
  let time = 0;
  
  const animate = () => {
    // Clear canvas with a complete clear for cleaner lines
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Use a smaller time increment for smoother animations
    time += 0.006;
    
    // Manage ripple effects
    manageRipples(time, state);
    
    // Sort waves by simulated z-depth for proper drawing order
    const sortedWaveIndices = Array.from({ length: waves }, (_, i) => i).sort((a, b) => {
      const zDepthA = Math.sin(time * state.zFreqs[a] + state.zOffsets[a]) * 0.2 + 0.8;
      const zDepthB = Math.sin(time * state.zFreqs[b] + state.zOffsets[b]) * 0.2 + 0.8;
      return zDepthA - zDepthB; // Sort by z-depth to create layering effect
    });
    
    // Draw each wave line in z-sorted order
    sortedWaveIndices.forEach(index => {
      // Update offset with smoother interpolation
      state.waveOffsets[index] += state.waveSpeeds[index] * 0.7; // Reduce speed for smoother movement
      
      // Calculate dynamic opacity for this frame
      let dynamicOpacity = state.baseOpacities[index] + 
                        Math.sin(time * state.opacityOscFreqs[index] + state.opacityOscOffsets[index]) * 
                        state.opacityOscAmps[index];
      
      // Add opacity peaks that coordinate with wave height peaks
      const peakEffect = calculateDynamicPeaks(
        time, 
        index, 
        state.peakFrequencies, 
        state.peakTimings, 
        state.waveDelays[index]
      );
      
      if (peakEffect > 0.8) {
        dynamicOpacity += (peakEffect - 0.6) * 0.4; // Increase opacity when wave peaks (more pronounced)
      }
      
      // Ensure opacity stays within reasonable bounds (increased for more visibility)
      dynamicOpacity = Math.min(Math.max(dynamicOpacity, 0.05), 0.45);
      
      // Update the wave color with new opacity
      const rgbaColor = baseColor.replace(/[\d.]+\)$/, `${dynamicOpacity})`);
      
      // Calculate dynamic glow for this frame
      const glowRadius = state.glowRadii[index] * (1 + Math.sin(time * state.glowFreqs[index] + state.glowOffsets[index]) * 0.6);
      
      // Calculate dynamic line width
      const lineWidth = state.lineWidths[index] * (1 + Math.sin(time * state.lineWidthFreqs[index] + state.lineWidthOffsets[index]) * 0.3);
      
      // Calculate simulated z-depth for scaling effect
      const zDepth = state.zAmps[index] * (Math.sin(time * state.zFreqs[index] + state.zOffsets[index]) * 0.2 + 0.8);
      
      // Draw the wave line with a smooth vector-like appearance
      ctx.beginPath();
      ctx.strokeStyle = rgbaColor;
      ctx.lineWidth = lineWidth;
      
      // Add glow effect
      ctx.shadowBlur = glowRadius;
      ctx.shadowColor = rgbaColor;
      
      // Use bezier curves for smoother, more vector-like waves
      let points: {x: number, y: number}[] = [];
      
      // Calculate dynamic peaks based on time
      const dynamicPeakMultiplier = calculateDynamicPeaks(
        time, 
        index, 
        state.peakFrequencies, 
        state.peakTimings, 
        state.waveDelays[index]
      );
      
      // Calculate vertical flux for this wave
      const vertFlux = Math.sin(time * state.verticalOscFreqs[index] + state.verticalOscOffsets[index]) * state.verticalOscAmps[index];
      
      // Generate points for the wave - Extend 33% wider
      const widthExtension = 1.33; // 33% wider
      for (let x = -canvas.width * (widthExtension - 1) / 2; x <= canvas.width * widthExtension; x += 3) {
        // Normalize x to the canvas width for amplitude calculations
        const normalizedX = (x + (canvas.width * (widthExtension - 1) / 2)) / (canvas.width * widthExtension);
        
        // Shape amplitude to be max in the center 60% of the viewport (narrower center focus)
        let amplitudeModifier;
        if (normalizedX < 0.2 || normalizedX > 0.8) {
          // Taper edges for smooth transition
          amplitudeModifier = normalizedX < 0.2 
            ? normalizedX * 5 // Ramp up from left edge
            : (1 - normalizedX) * 5; // Ramp down to right edge
        } else {
          // Center 60% - with dynamic height variation
          const centerPosition = Math.abs(normalizedX - 0.5) * 2; // 0 at center, 1 at edges
          amplitudeModifier = 1.0 - (centerPosition * 0.2); // Slight decrease toward edges
        }
        
        // Calculate ripple effect at this position
        const rippleEffect = calculateRippleEffect(normalizedX, time, state, canvas.width);
        
        // Add vertical flux component, dynamic peak effect, and ripple effect
        const amplitude = state.waveAmplitudes[index] * amplitudeModifier * dynamicPeakMultiplier * zDepth + vertFlux + rippleEffect;
        
        // Calculate vertical position with phase offset for more varied waves
        const y = canvas.height / 2 + 
                Math.sin((x * state.waveFrequencies[index]) + state.waveOffsets[index] + state.wavePhases[index]) * 
                amplitude;
        
        points.push({x, y});
      }
      
      // Draw using points with smoother interpolation
      if (points.length > 0) {
        ctx.moveTo(points[0].x, points[0].y);
        
        // Use quadratic curves between points for smoother appearance
        for (let i = 0; i < points.length - 1; i++) {
          const xc = (points[i].x + points[i + 1].x) / 2;
          const yc = (points[i].y + points[i + 1].y) / 2;
          ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
        }
        
        // Complete the curve
        const lastPoint = points[points.length - 1];
        ctx.lineTo(lastPoint.x, lastPoint.y);
      }
      
      ctx.stroke();
      
      // Reset shadow for next line to avoid cumulative glow effect
      ctx.shadowBlur = 0;
    });
    
    animationId = requestAnimationFrame(animate);
  };
  
  animate();
  
  return () => cancelAnimationFrame(animationId);
};
