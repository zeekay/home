
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
        animateSoundWaves(ctx, canvas);
        break;
      case 'particles':
        animateSoundWaves(ctx, canvas, { color: 'rgba(160, 160, 170, 0.12)' });
        break;
      case 'matrix':
        animateSoundWaves(ctx, canvas, { color: 'rgba(120, 255, 150, 0.08)' });
        break;
      case 'waves':
        animateSoundWaves(ctx, canvas, { color: 'rgba(100, 160, 255, 0.10)' });
        break;
      case 'neon':
        animateSoundWaves(ctx, canvas, { color: 'rgba(140, 100, 255, 0.15)' });
        break;
      default:
        animateSoundWaves(ctx, canvas);
    }
    
    return () => {
      window.removeEventListener('resize', updateSize);
    };
  }, [theme, customImageUrl]);
  
  // Enhanced sound waves animation with more waves and musical ratios
  const animateSoundWaves = (
    ctx: CanvasRenderingContext2D, 
    canvas: HTMLCanvasElement,
    options = { color: 'rgba(255,255,255,0.12)' }
  ) => {
    // Increased number of waves - much more dense
    const waves = 100;
    
    // Music-inspired frequency ratios (based on harmonic series)
    const musicalRatios = [1, 1.5, 2, 2.5, 3, 4, 6, 8, 12];
    
    // Create arrays for wave properties
    const waveAmplitudes = Array(waves).fill(0).map(() => Math.random() * 120 + 40); // Taller waves
    const waveFrequencies = Array(waves).fill(0).map(() => {
      // Apply musical ratios to frequencies
      const baseFreq = 0.005;
      const ratio = musicalRatios[Math.floor(Math.random() * musicalRatios.length)];
      return baseFreq * ratio * (0.5 + Math.random() * 0.5); // Add some randomness
    });
    const waveSpeeds = Array(waves).fill(0).map(() => Math.random() * 0.02 + 0.005);
    const waveOffsets = Array(waves).fill(0);
    const wavePhases = Array(waves).fill(0).map(() => Math.random() * Math.PI * 2); // Random starting phases
    
    // Use a consistent color theme with different opacity levels
    const baseColor = options.color;
    const waveColors = Array(waves).fill(0).map((_, i) => {
      const opacity = 0.15 - (i % 5 * 0.02); // Varied opacity with 5 levels
      return baseColor.replace(/[\d.]+\)$/, `${opacity})`);
    });
    
    let animationId: number;
    
    const animate = () => {
      // Clear canvas with a complete clear for cleaner lines
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
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
        
        // Generate points for the wave - Use full viewport width
        for (let x = 0; x <= canvas.width; x += 5) {
          const normalizedX = x / canvas.width;
          // Shape amplitude so it's max in the middle, lower at edges - using a sine wave
          const amplitudeModifier = Math.sin(normalizedX * Math.PI);
          const amplitude = waveAmplitudes[index] * amplitudeModifier;
          
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
