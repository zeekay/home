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
        animateParticles(ctx, canvas);
        break;
      case 'matrix':
        animateMatrix(ctx, canvas);
        break;
      case 'waves':
        animateWaves(ctx, canvas);
        break;
      case 'neon':
        animateNeon(ctx, canvas);
        break;
      default:
        animateSoundWaves(ctx, canvas);
    }
    
    return () => {
      window.removeEventListener('resize', updateSize);
    };
  }, [theme, customImageUrl]);
  
  // Sound waves animation (like the iconic t-shirt design)
  const animateSoundWaves = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const waves = 5; // Number of wave lines
    const waveAmplitudes = Array(waves).fill(0).map(() => Math.random() * 30 + 15);
    const waveFrequencies = Array(waves).fill(0).map(() => Math.random() * 0.02 + 0.01);
    const waveSpeeds = Array(waves).fill(0).map(() => Math.random() * 0.03 + 0.01);
    const waveOffsets = Array(waves).fill(0);
    const waveColors = ['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.12)', 'rgba(255,255,255,0.09)', 'rgba(255,255,255,0.06)', 'rgba(255,255,255,0.03)'];
    
    let animationId: number;
    
    const animate = () => {
      // Clear canvas with slight fade effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const centerY = canvas.height / 2;
      
      // Draw each wave line
      waveOffsets.forEach((offset, index) => {
        // Update offset for animation
        waveOffsets[index] += waveSpeeds[index];
        
        // Draw the wave line
        ctx.beginPath();
        ctx.strokeStyle = waveColors[index % waveColors.length];
        ctx.lineWidth = 2;
        
        for (let x = 0; x < canvas.width; x += 1) {
          const y = centerY + 
                   Math.sin((x * waveFrequencies[index]) + waveOffsets[index]) * 
                   waveAmplitudes[index] * 
                   (1 - Math.abs(x / canvas.width - 0.5) * 1.5); // Amplitude decreases toward edges
          
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        
        ctx.stroke();
      });
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => cancelAnimationFrame(animationId);
  };
  
  // Floating particles animation
  const animateParticles = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const particles: {x: number, y: number, size: number, vx: number, vy: number, alpha: number}[] = [];
    const particleCount = 100;
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        alpha: Math.random() * 0.6 + 0.2
      });
    }
    
    let animationId: number;
    
    const animate = () => {
      // Clear canvas with slight fade effect
      ctx.fillStyle = 'rgba(10, 10, 13, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Wrap around screen edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(160, 160, 170, ${particle.alpha})`;
        ctx.fill();
      });
      
      // Draw connections between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(120, 120, 130, ${0.15 * (1 - distance / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => cancelAnimationFrame(animationId);
  };
  
  // Matrix-like rain effect
  const animateMatrix = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    
    // Start position of each column
    const drops: number[] = Array(columns).fill(1);
    
    // Characters to display
    const chars = '01';
    
    let animationId: number;
    
    const animate = () => {
      // Semi-transparent black to create trail effect
      ctx.fillStyle = 'rgba(10, 10, 13, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Set text color and font
      ctx.fillStyle = '#333';
      ctx.font = `${fontSize}px monospace`;
      
      // Loop through drops
      for (let i = 0; i < drops.length; i++) {
        // Random character
        const text = chars[Math.floor(Math.random() * chars.length)];
        
        // x = i*fontSize, y = value of drops[i]*fontSize
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        
        // Randomly reset some drops to top
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        
        // Increment y coordinate
        drops[i]++;
      }
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => cancelAnimationFrame(animationId);
  };
  
  // Smooth wave animation
  const animateWaves = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const waves = [
      { amplitude: 50, frequency: 0.01, speed: 0.02, offset: 0, y: canvas.height * 0.3 },
      { amplitude: 30, frequency: 0.02, speed: 0.03, offset: 0, y: canvas.height * 0.5 },
      { amplitude: 20, frequency: 0.04, speed: 0.01, offset: 0, y: canvas.height * 0.7 }
    ];
    
    let animationId: number;
    
    const animate = () => {
      // Clear canvas
      ctx.fillStyle = 'rgba(10, 10, 13, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw each wave
      waves.forEach(wave => {
        wave.offset += wave.speed;
        
        ctx.beginPath();
        ctx.moveTo(0, wave.y);
        
        for (let x = 0; x < canvas.width; x++) {
          const y = wave.y + Math.sin((x * wave.frequency) + wave.offset) * wave.amplitude;
          ctx.lineTo(x, y);
        }
        
        ctx.strokeStyle = 'rgba(50, 50, 55, 0.2)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => cancelAnimationFrame(animationId);
  };
  
  // Neon glow animation
  const animateNeon = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const lines: {x1: number, y1: number, x2: number, y2: number, hue: number, speed: number}[] = [];
    const lineCount = 15;
    
    // Create random lines
    for (let i = 0; i < lineCount; i++) {
      lines.push({
        x1: Math.random() * canvas.width,
        y1: Math.random() * canvas.height,
        x2: Math.random() * canvas.width,
        y2: Math.random() * canvas.height,
        hue: 220 + Math.random() * 40, // Bluish hue
        speed: 0.2 + Math.random() * 0.5
      });
    }
    
    let animationId: number;
    let time = 0;
    
    const animate = () => {
      time += 0.01;
      
      // Clear canvas with fade effect
      ctx.fillStyle = 'rgba(5, 5, 8, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw lines
      lines.forEach(line => {
        // Move line endpoints in a circular motion
        line.x1 += Math.cos(time * line.speed) * 1;
        line.y1 += Math.sin(time * line.speed) * 1;
        line.x2 += Math.cos(time * line.speed + Math.PI) * 1;
        line.y2 += Math.sin(time * line.speed + Math.PI) * 1;
        
        // Keep lines within canvas
        if (line.x1 < 0 || line.x1 > canvas.width) line.x1 = Math.random() * canvas.width;
        if (line.y1 < 0 || line.y1 > canvas.height) line.y1 = Math.random() * canvas.height;
        if (line.x2 < 0 || line.x2 > canvas.width) line.x2 = Math.random() * canvas.width;
        if (line.y2 < 0 || line.y2 > canvas.height) line.y2 = Math.random() * canvas.height;
        
        // Draw line with glow effect
        ctx.beginPath();
        ctx.moveTo(line.x1, line.y1);
        ctx.lineTo(line.x2, line.y2);
        
        // Create glow effect with multiple strokes
        for (let size = 3; size > 0; size--) {
          ctx.strokeStyle = `hsla(${line.hue}, 100%, ${20 + size * 20}%, ${0.05 + size * 0.05})`;
          ctx.lineWidth = size * 2;
          ctx.stroke();
        }
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
