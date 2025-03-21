
import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedBackgroundProps {
  className?: string;
  theme?: string;
  customImageUrl?: string;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ 
  className,
  theme = 'wireframe',
  customImageUrl 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (theme === 'custom' && customImageUrl) {
      // Skip canvas animation when using custom image
      return;
    }
    
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
    
    // Different animation based on theme
    switch (theme) {
      case 'wireframe':
        animateEnhancedWaves(ctx, canvas);
        break;
      case 'particles':
        animateEnhancedWaves(ctx, canvas, { color: 'rgba(160, 160, 170, 0.12)' });
        break;
      case 'matrix':
        animateEnhancedWaves(ctx, canvas, { color: 'rgba(120, 255, 150, 0.08)' });
        break;
      case 'waves':
        animateEnhancedWaves(ctx, canvas, { color: 'rgba(100, 160, 255, 0.10)' });
        break;
      case 'neon':
        animateEnhancedWaves(ctx, canvas, { color: 'rgba(140, 100, 255, 0.15)' });
        break;
      default:
        animateEnhancedWaves(ctx, canvas);
    }
    
    return () => {
      window.removeEventListener('resize', updateSize);
    };
  }, [theme, customImageUrl]);
  
  // Enhanced waves animation with increased width, dynamic peaks, and varied timing
  const animateEnhancedWaves = (
    ctx: CanvasRenderingContext2D, 
    canvas: HTMLCanvasElement,
    options = { color: 'rgba(255,255,255,0.12)' }
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
    
    // Use a consistent color theme with different opacity levels
    const baseColor = options.color;
    const waveColors = Array(waves).fill(0).map((_, i) => {
      const opacity = 0.2 - (i % 5 * 0.02); // Slightly increased opacity
      return baseColor.replace(/[\d.]+\)$/, `${opacity})`);
    });
    
    let animationId: number;
    let time = 0;
    
    const animate = () => {
      // Clear canvas with a complete clear for cleaner lines
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      time += 0.01;
      
      // Draw each wave line
      waveOffsets.forEach((offset, index) => {
        // Update offset for animation
        waveOffsets[index] += waveSpeeds[index];
        
        // Draw the wave line with a smooth vector-like appearance
        ctx.beginPath();
        ctx.strokeStyle = waveColors[index % waveColors.length];
        ctx.lineWidth = 1.5;
        
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
          const amplitude = waveAmplitudes[index] * amplitudeModifier * dynamicPeakMultiplier + vertFlux;
          
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
      });
      
      animationId = requestAnimationFrame(animate);
    };
    
    // Function to calculate dynamic peaks that occur at random intervals
    const calculateDynamicPeaks = (
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
    
    animate();
    
    return () => cancelAnimationFrame(animationId);
  };
  
  return (
    <div className={cn('absolute inset-0 w-full h-full overflow-hidden z-0', className)}>
      {(theme === 'custom' && customImageUrl) ? (
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${customImageUrl})` }}
        />
      ) : (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full bg-black"
        />
      )}
      <div className="absolute inset-0 backdrop-blur-[1px]" />
    </div>
  );
};

export default AnimatedBackground;
