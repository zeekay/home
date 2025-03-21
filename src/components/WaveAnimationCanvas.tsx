
import React, { useEffect, useRef } from 'react';
import { calculateDynamicPeaks } from '@/utils/animationUtils';
import { 
  getWaveAnimationInitialState, 
  getThemeColor, 
  animateEnhancedWaves 
} from '@/utils/waveAnimationUtils';

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
    
    // Set canvas dimensions with high DPI support for smoother lines
    const updateSize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      
      // Scale context for high DPI displays
      ctx.scale(dpr, dpr);
    };
    
    window.addEventListener('resize', updateSize);
    updateSize();
    
    // Get theme-specific color
    const themeColor = getThemeColor(theme);
    
    // Start animation based on theme
    const cleanupFn = animateEnhancedWaves(ctx, canvas, themeColor);
    
    return () => {
      cleanupFn();
      window.removeEventListener('resize', updateSize);
    };
  }, [theme]);
  
  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full bg-black"
    />
  );
};

export default WaveAnimationCanvas;
