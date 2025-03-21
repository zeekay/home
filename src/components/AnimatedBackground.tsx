
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
  
  // Enhanced sound waves animation (like the iconic t-shirt design)
  const animateSoundWaves = (
    ctx: CanvasRenderingContext2D, 
    canvas: HTMLCanvasElement,
    options = { color: 'rgba(255,255,255,0.12)' }
  ) => {
    // Number of wave lines - use more for a denser look
    const waves = 8;
    const waveAmplitudes = Array(waves).fill(0).map(() => Math.random() * 40 + 20);
    const waveFrequencies = Array(waves).fill(0).map(() => Math.random() * 0.01 + 0.005);
    const waveSpeeds = Array(waves).fill(0).map(() => Math.random() * 0.02 + 0.005);
    const waveOffsets = Array(waves).fill(0);
    
    // Use a consistent color theme with different opacity levels
    const baseColor = options.color;
    const waveColors = Array(waves).fill(0).map((_, i) => {
      const opacity = 0.15 - (i * 0.015); // Decreasing opacity
      return baseColor.replace(/[\d.]+\)$/, `${opacity})`);
    });
    
    let animationId: number;
    
    const animate = () => {
      // Clear canvas with a complete clear for cleaner lines
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Focus waves in the middle two-thirds of the screen
      const centerY = canvas.height / 2;
      const horizontalMargin = canvas.width / 6; // 1/6 margin on each side
      
      // Draw each wave line
      waveOffsets.forEach((offset, index) => {
        // Update offset for animation
        waveOffsets[index] += waveSpeeds[index];
        
        // Draw the wave line with a smooth vector-like appearance
        ctx.beginPath();
        ctx.strokeStyle = waveColors[index % waveColors.length];
        ctx.lineWidth = 2;
        
        // Use bezier curves for smoother, more vector-like waves
        let points: {x: number, y: number}[] = [];
        
        // Generate points for the wave
        for (let x = horizontalMargin; x <= canvas.width - horizontalMargin; x += 5) {
          const normalizedX = (x - horizontalMargin) / (canvas.width - 2 * horizontalMargin);
          const amplitude = waveAmplitudes[index] * Math.sin(normalizedX * Math.PI); // Amplitude reduces at edges
          
          const y = centerY + 
                  Math.sin((x * waveFrequencies[index]) + waveOffsets[index]) * 
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
