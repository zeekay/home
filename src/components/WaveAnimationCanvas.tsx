
import React, { useEffect, useRef } from 'react';
import { calculateDynamicPeaks } from '@/utils/animationUtils';

interface WaveAnimationCanvasProps {
  theme: string;
}

const WaveAnimationCanvas: React.FC<WaveAnimationCanvasProps> = ({ theme }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const updateSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', updateSize);
    updateSize();
    
    // Get theme-specific color
    const getThemeColor = (themeName: string) => {
      switch (themeName) {
        case 'wireframe': return 'rgba(255,255,255,0.28)';
        case 'particles': return 'rgba(230, 230, 240, 0.30)';
        case 'matrix': return 'rgba(180, 255, 200, 0.25)';
        case 'waves': return 'rgba(180, 220, 255, 0.28)';
        case 'neon': return 'rgba(200, 180, 255, 0.32)';
        default: return 'rgba(255,255,255,0.28)';
      }
    };
    
    // Start animation based on theme
    const color = getThemeColor(theme);
    const cleanupFn = animateEnhancedWaves(ctx, canvas, { color });
    
    return () => {
      cleanupFn();
      window.removeEventListener('resize', updateSize);
    };
  }, [theme]);
  
  // Enhanced waves animation with increased width, dynamic peaks, and varied timing
  const animateEnhancedWaves = (
    ctx: CanvasRenderingContext2D, 
    canvas: HTMLCanvasElement,
    options = { color: 'rgba(255,255,255,0.28)' }
  ) => {
    // Increased number of waves for density
    const waves = 100;
    
    // Music-inspired frequency ratios (based on harmonic series)
    const musicalRatios = [1, 1.5, 2, 2.5, 3, 4, 6, 8, 12];
    
    // Dynamic peak creation variables
    const peakFrequencies = Array(5).fill(0).map(() => Math.random() * 0.01 + 0.002);
    const peakTimings = Array(5).fill(0).map(() => Math.random() * Math.PI * 2);
    
    // Create arrays for wave properties with enhanced vertical movement
    const waveAmplitudes = Array(waves).fill(0).map(() => Math.random() * 250 + 100); // Taller waves with more variance
    const waveFrequencies = Array(waves).fill(0).map(() => {
      // Apply musical ratios to frequencies
      const baseFreq = 0.003;
      const ratio = musicalRatios[Math.floor(Math.random() * musicalRatios.length)];
      return baseFreq * ratio * (0.4 + Math.random() * 0.7); // More randomness
    });
    const waveSpeeds = Array(waves).fill(0).map(() => Math.random() * 0.015 + 0.003); // Slower speeds for some waves
    const waveOffsets = Array(waves).fill(0);
    const wavePhases = Array(waves).fill(0).map(() => Math.random() * Math.PI * 2); // Random starting phases
    const waveDelays = Array(waves).fill(0).map(() => Math.random() * 5 + 2); // Random delays before peak
    
    // Vertical oscillation parameters
    const verticalOscFreqs = Array(waves).fill(0).map(() => Math.random() * 0.008 + 0.001); // Slower vertical oscillations
    const verticalOscAmps = Array(waves).fill(0).map(() => Math.random() * 80 + 40); // More dramatic vertical oscillation
    const verticalOscOffsets = Array(waves).fill(0).map(() => Math.random() * Math.PI * 2);
    
    // Dynamic opacity parameters
    const opacityOscFreqs = Array(waves).fill(0).map(() => Math.random() * 0.01 + 0.002); // Opacity oscillation frequencies
    const opacityOscAmps = Array(waves).fill(0).map(() => Math.random() * 0.05 + 0.03); // Stronger opacity oscillation
    const opacityOscOffsets = Array(waves).fill(0).map(() => Math.random() * Math.PI * 2); // Random phase offsets
    const baseOpacities = Array(waves).fill(0).map(() => Math.random() * 0.2 + 0.15); // Higher base opacity value for each wave
    
    // Glow parameters for each wave
    const glowRadii = Array(waves).fill(0).map(() => Math.random() * 6 + 3); // Increased glow radius
    const glowFreqs = Array(waves).fill(0).map(() => Math.random() * 0.008 + 0.001); // Glow animation frequency
    const glowOffsets = Array(waves).fill(0).map(() => Math.random() * Math.PI * 2); // Random phase offsets
    
    // Line width variation
    const lineWidths = Array(waves).fill(0).map(() => Math.random() * 1 + 1.2); // Varied line thickness
    const lineWidthFreqs = Array(waves).fill(0).map(() => Math.random() * 0.01 + 0.002);
    const lineWidthOffsets = Array(waves).fill(0).map(() => Math.random() * Math.PI * 2);
    
    // Z-axis simulation parameters (for 3D-like effect)
    const zFreqs = Array(waves).fill(0).map(() => Math.random() * 0.005 + 0.001);
    const zAmps = Array(waves).fill(0).map(() => Math.random() * 0.4 + 0.7); // Scale factor
    const zOffsets = Array(waves).fill(0).map(() => Math.random() * Math.PI * 2);
    
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
      
      time += 0.01;
      
      // Sort waves by simulated z-depth for proper drawing order
      const sortedWaveIndices = Array.from({ length: waves }, (_, i) => i).sort((a, b) => {
        const zDepthA = Math.sin(time * zFreqs[a] + zOffsets[a]) * 0.2 + 0.8;
        const zDepthB = Math.sin(time * zFreqs[b] + zOffsets[b]) * 0.2 + 0.8;
        return zDepthA - zDepthB; // Sort by z-depth to create layering effect
      });
      
      // Draw each wave line in z-sorted order
      sortedWaveIndices.forEach(index => {
        // Update offset for animation
        waveOffsets[index] += waveSpeeds[index];
        
        // Calculate dynamic opacity for this frame
        let dynamicOpacity = baseOpacities[index] + 
                           Math.sin(time * opacityOscFreqs[index] + opacityOscOffsets[index]) * 
                           opacityOscAmps[index];
        
        // Add opacity peaks that coordinate with wave height peaks
        const peakEffect = calculateDynamicPeaks(time, index, peakFrequencies, peakTimings, waveDelays[index]);
        if (peakEffect > 0.8) {
          dynamicOpacity += (peakEffect - 0.6) * 0.4; // Increase opacity when wave peaks (more pronounced)
        }
        
        // Ensure opacity stays within reasonable bounds (increased for more visibility)
        dynamicOpacity = Math.min(Math.max(dynamicOpacity, 0.05), 0.45);
        
        // Update the wave color with new opacity
        const rgbaColor = baseColor.replace(/[\d.]+\)$/, `${dynamicOpacity})`);
        
        // Calculate dynamic glow for this frame
        const glowRadius = glowRadii[index] * (1 + Math.sin(time * glowFreqs[index] + glowOffsets[index]) * 0.6);
        
        // Calculate dynamic line width
        const lineWidth = lineWidths[index] * (1 + Math.sin(time * lineWidthFreqs[index] + lineWidthOffsets[index]) * 0.3);
        
        // Calculate simulated z-depth for scaling effect
        const zDepth = zAmps[index] * (Math.sin(time * zFreqs[index] + zOffsets[index]) * 0.2 + 0.8);
        
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
        const dynamicPeakMultiplier = calculateDynamicPeaks(time, index, peakFrequencies, peakTimings, waveDelays[index]);
        
        // Calculate vertical flux for this wave
        const vertFlux = Math.sin(time * verticalOscFreqs[index] + verticalOscOffsets[index]) * verticalOscAmps[index];
        
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
          
          // Add vertical flux component and dynamic peak effect
          const amplitude = waveAmplitudes[index] * amplitudeModifier * dynamicPeakMultiplier * zDepth + vertFlux;
          
          // Calculate vertical position with phase offset for more varied waves
          const y = canvas.height / 2 + 
                  Math.sin((x * waveFrequencies[index]) + waveOffsets[index] + wavePhases[index]) * 
                  amplitude;
          
          points.push({x, y});
        }
        
        // Draw using points
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
  
  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full bg-black"
    />
  );
};

export default WaveAnimationCanvas;
