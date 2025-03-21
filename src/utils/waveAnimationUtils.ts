
import { calculateDynamicPeaks } from '@/utils/animationUtils';

export const getWaveAnimationInitialState = () => ({
  amplitude: 40,
  frequency: 0.02,
  phase: 0,
  peakCount: 6,
  peakSpacing: 150,
  peakOffset: 0,
  peakSharpness: 0.6,
  speed: 0.04,
  decayFactor: 0.98,
  noiseAmplitude: 5,
  noiseFrequency: 0.08,
  noiseOffset: 0,
  noiseSpeed: 0.06,
  noisePersistence: 0.5,
  noiseScale: 20,
  noiseOctaves: 4,
  color: { r: 40, g: 40, b: 60, a: 0.5 },
  peaks: [],
  lastUpdate: Date.now(),
});

export const getThemeColor = (theme: string) => {
  switch (theme) {
    case 'wireframe':
      return { r: 20, g: 20, b: 30, a: 0.5 };
    case 'particles':
      return { r: 80, g: 80, b: 90, a: 0.5 };
    case 'matrix':
      return { r: 0, g: 80, b: 0, a: 0.6 };
    case 'waves':
      return { r: 0, g: 50, b: 120, a: 0.5 };
    case 'neon':
      return { r: 110, g: 30, b: 220, a: 0.6 };
    case 'black':
      return { r: 0, g: 0, b: 0, a: 1.0 };
    default:
      return { r: 40, g: 40, b: 60, a: 0.5 };
  }
};

export const animateEnhancedWaves = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, initialColor: { r: number; g: number; b: number; a: number }) => {
  let animationFrameId: number;
  let state = getWaveAnimationInitialState();
  state.color = initialColor;
  
  const update = () => {
    const now = Date.now();
    const deltaTime = now - state.lastUpdate;
    state.lastUpdate = now;
    
    // Update noise
    state.noiseOffset += state.noiseSpeed * deltaTime * 0.001;
    
    // Calculate dynamic peaks - fixing the argument issue
    state.peaks = calculateDynamicPeaks(now, 0, [0.01, 0.02, 0.015], [0, 0.5, 1.0], 0);
    
    // Update peak offset for horizontal movement
    state.peakOffset += 0.5;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw waves
    for (let i = 0; i < state.peakCount; i++) {
      const peak = {
        xOffset: i * state.peakSpacing + state.peakOffset,
        yFactor: 0.5 + (i % 2 === 0 ? 0.5 : -0.5) * 0.5
      };
      
      ctx.beginPath();
      
      for (let x = 0; x <= canvas.width; x++) {
        const noiseValue = calculatePerlinNoise(x * state.noiseFrequency, state.noiseOffset, state.noiseOctaves, state.noisePersistence);
        const noiseOffset = noiseValue * state.noiseAmplitude;
        
        let y = canvas.height / 2;
        y += Math.sin((x + state.phase) * state.frequency + peak.xOffset) * state.amplitude * peak.yFactor;
        y += noiseOffset;
        
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      // Gradient for the wave
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, `rgba(${state.color.r}, ${state.color.g}, ${state.color.b}, 0)`);
      gradient.addColorStop(0.5, `rgba(${state.color.r}, ${state.color.g}, ${state.color.b}, ${state.color.a})`);
      gradient.addColorStop(1, `rgba(${state.color.r}, ${state.color.g}, ${state.color.b}, 0)`);
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    
    // Update phase for animation
    state.phase += state.speed * deltaTime * 0.001;
    
    animationFrameId = requestAnimationFrame(update);
  };
  
  update();
  
  return () => {
    cancelAnimationFrame(animationFrameId);
  };
};

// Function to calculate Perlin noise value
const calculatePerlinNoise = (x: number, offset: number, octaves: number, persistence: number): number => {
  let total = 0;
  let frequency = 1;
  let amplitude = 1;
  let maxValue = 0; // Used for normalizing result to 0.0 - 1.0
  
  for (let i = 0; i < octaves; i++) {
    total += interpolatedNoise(x * frequency + offset) * amplitude;
    
    maxValue += amplitude;
    
    amplitude *= persistence;
    frequency *= 2;
  }
  
  return total / maxValue;
};

// Function to generate smooth noise value
const interpolatedNoise = (x: number): number => {
  const integerX = Math.floor(x);
  const fractionalX = x - integerX;
  
  const v1 = smoothNoise(integerX);
  const v2 = smoothNoise(integerX + 1);
  
  return interpolate(v1, v2, fractionalX);
};

// Cosine interpolation
const interpolate = (a: number, b: number, x: number): number => {
  const f = (1 - Math.cos(x * Math.PI)) * 0.5;
  return a * (1 - f) + b * f;
};

// Function to generate smooth noise
const smoothNoise = (x: number): number => {
  return noise(x) / 2 + noise(x - 1) / 4 + noise(x + 1) / 4;
};

// Basic noise function (you can replace this with a better noise function)
const noise = (x: number): number => {
  const n = (x << 13) ^ x;
  return 1 - ((n * (n * n * 15731 + 789221) + 1376312589) & 0x7fffffff) / 1073741824;
};
