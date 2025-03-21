
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
            { r: 30, g: 144, b: 255, a: 0.7 },
            { r: 0, g: 206, b: 209, a: 0.7 },
            { r: 65, g: 105, b: 225, a: 0.7 },
          ];
        case 'sunset':
          return [
            { r: 255, g: 120, b: 50, a: 0.7 },
            { r: 255, g: 80, b: 160, a: 0.7 },
            { r: 255, g: 190, b: 100, a: 0.7 },
          ];
        case 'forest':
          return [
            { r: 46, g: 139, b: 87, a: 0.7 },
            { r: 20, g: 200, b: 150, a: 0.7 },
            { r: 60, g: 179, b: 113, a: 0.7 },
          ];
        case 'lavender':
          return [
            { r: 147, g: 112, b: 219, a: 0.7 },
            { r: 100, g: 90, b: 240, a: 0.7 },
            { r: 186, g: 85, b: 211, a: 0.7 },
          ];
        default: // Stripe-like gradient
          return [
            { r: 106, g: 48, b: 255, a: 0.7 },
            { r: 0, g: 209, b: 255, a: 0.7 },
            { r: 255, g: 86, b: 145, a: 0.7 },
            { r: 255, g: 189, b: 80, a: 0.7 },
          ];
      }
    };
    
    const colors = getGradientColors();
    
    // Create gradient blobs
    class GradientBlob {
      x: number;
      y: number;
      radius: number;
      color: { r: number; g: number; b: number; a: number };
      vx: number;
      vy: number;
      
      constructor(color: { r: number; g: number; b: number; a: number }) {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.radius = Math.random() * (canvas.width / 3) + (canvas.width / 6);
        this.color = color;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
      }
      
      update() {
        this.x += this.vx;
        this.y += this.vy;
        
        // Bounce off edges
        if (this.x < -this.radius) this.x = canvas.width + this.radius;
        if (this.x > canvas.width + this.radius) this.x = -this.radius;
        if (this.y < -this.radius) this.y = canvas.height + this.radius;
        if (this.y > canvas.height + this.radius) this.y = -this.radius;
      }
      
      draw(ctx: CanvasRenderingContext2D) {
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        gradient.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.color.a})`);
        gradient.addColorStop(1, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // Create blobs
    const blobs: GradientBlob[] = [];
    colors.forEach(color => {
      // Create 2 blobs per color for more variety
      blobs.push(new GradientBlob(color));
      blobs.push(new GradientBlob(color));
    });
    
    // Animation loop
    const animate = () => {
      // Clear canvas with a slight fade effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw blobs
      blobs.forEach(blob => {
        blob.update();
        blob.draw(ctx);
      });
      
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
      <div className="absolute inset-0 backdrop-blur-[1px]" />
    </div>
  );
};

export default AnimatedBackground;
