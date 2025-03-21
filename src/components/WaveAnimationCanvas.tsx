
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
    
    // Set canvas dimensions
    const updateSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', updateSize);
    updateSize();
    
    // Get theme-specific color
    const color = getThemeColor(theme);
    
    // Start animation based on theme
    const cleanupFn = animateEnhancedWaves(ctx, canvas, { color });
    
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
