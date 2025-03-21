
import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedBackgroundProps {
  className?: string;
  theme?: string;
  customImageUrl?: string;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ 
  className,
  theme = 'default',
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
    
    // Set gradient colors based on theme
    const getGradientColors = () => {
      switch (theme) {
        case 'ocean':
          return [
            { r: 30, g: 144, b: 255 },
            { r: 0, g: 206, b: 209 },
          ];
        case 'sunset':
          return [
            { r: 255, g: 120, b: 50 },
            { r: 255, g: 80, b: 160 },
          ];
        case 'forest':
          return [
            { r: 46, g: 139, b: 87 },
            { r: 20, g: 200, b: 150 },
          ];
        case 'lavender':
          return [
            { r: 147, g: 112, b: 219 },
            { r: 100, g: 90, b: 240 },
          ];
        default: // Default is blue-purple
          return [
            { r: 65, g: 105, b: 225 },
            { r: 138, g: 43, b: 226 },
          ];
      }
    };
    
    const colors = getGradientColors();
    
    // Create and animate the gradient
    let tick = 0;
    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Create gradient
      const time = tick * 0.002;
      const cx = canvas.width * (0.5 + 0.3 * Math.sin(time));
      const cy = canvas.height * (0.5 + 0.2 * Math.cos(time * 0.7));
      const radius = Math.min(canvas.width, canvas.height) * (0.5 + 0.3 * Math.sin(time * 0.5));
      
      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      
      // Add color stops
      const color1 = colors[0];
      const color2 = colors[1];
      
      gradient.addColorStop(0, `rgba(${color1.r}, ${color1.g}, ${color1.b}, 0.8)`);
      gradient.addColorStop(1, `rgba(${color2.r}, ${color2.g}, ${color2.b}, 0.8)`);
      
      // Fill with gradient
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Increment tick and request next frame
      tick++;
      requestAnimationFrame(animate);
    };
    
    const animationId = requestAnimationFrame(animate);
    
    return () => {
      window.removeEventListener('resize', updateSize);
      cancelAnimationFrame(animationId);
    };
  }, [theme, customImageUrl]);
  
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
          className="absolute inset-0 w-full h-full"
        />
      )}
      <div className="absolute inset-0 backdrop-blur-[2px]" />
    </div>
  );
};

export default AnimatedBackground;
