/**
 * zOS Sound System
 *
 * Authentic macOS-style system sounds using Web Audio API.
 * Synthesized sounds for low-latency, zero-dependency playback.
 */

// ============================================================================
// Types
// ============================================================================

export type SoundType =
  // UI Feedback
  | 'click'
  | 'menuClick'
  | 'buttonClick'
  | 'toggle'
  | 'sliderTick'
  // Alerts
  | 'alert'
  | 'error'
  | 'warning'
  | 'notification'
  // System
  | 'startup'
  | 'screenshot'
  | 'trashEmpty'
  | 'volumeChange'
  | 'typing'
  // Window Management
  | 'windowMinimize'
  | 'windowZoom'
  | 'windowClose'
  | 'dockBounce'
  // Named Alert Sounds (macOS style)
  | 'Basso'
  | 'Blow'
  | 'Bottle'
  | 'Frog'
  | 'Funk'
  | 'Glass'
  | 'Hero'
  | 'Morse'
  | 'Ping'
  | 'Pop'
  | 'Purr'
  | 'Sosumi'
  | 'Submarine'
  | 'Tink';

interface SoundOptions {
  volume?: number;      // 0-1, overrides system volume
  pan?: number;         // -1 (left) to 1 (right)
  playbackRate?: number;
}

interface SoundDefinition {
  generate: (ctx: AudioContext, gain: GainNode) => void;
  duration: number; // ms
}

// ============================================================================
// Audio Context Singleton
// ============================================================================

let audioContext: AudioContext | null = null;
let masterGain: GainNode | null = null;
let isInitialized = false;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    masterGain = audioContext.createGain();
    masterGain.connect(audioContext.destination);
    masterGain.gain.value = 0.75; // Default master volume
  }

  // Resume if suspended (browser autoplay policy)
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  return audioContext;
}

function getMasterGain(): GainNode {
  getAudioContext();
  return masterGain!;
}

// ============================================================================
// Sound Generators
// ============================================================================

const soundDefinitions: Record<SoundType, SoundDefinition> = {
  // --- UI Feedback ---
  click: {
    duration: 30,
    generate: (ctx, gain) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.015);
      oscGain.gain.setValueAtTime(0.3, ctx.currentTime);
      oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
      osc.connect(oscGain);
      oscGain.connect(gain);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.03);
    },
  },

  menuClick: {
    duration: 25,
    generate: (ctx, gain) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(2200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1800, ctx.currentTime + 0.02);
      oscGain.gain.setValueAtTime(0.15, ctx.currentTime);
      oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.025);
      osc.connect(oscGain);
      oscGain.connect(gain);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.025);
    },
  },

  buttonClick: {
    duration: 20,
    generate: (ctx, gain) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, ctx.currentTime);
      oscGain.gain.setValueAtTime(0.2, ctx.currentTime);
      oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);
      osc.connect(oscGain);
      oscGain.connect(gain);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.02);
    },
  },

  toggle: {
    duration: 50,
    generate: (ctx, gain) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.04);
      oscGain.gain.setValueAtTime(0.2, ctx.currentTime);
      oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(oscGain);
      oscGain.connect(gain);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);
    },
  },

  sliderTick: {
    duration: 10,
    generate: (ctx, gain) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2000, ctx.currentTime);
      oscGain.gain.setValueAtTime(0.08, ctx.currentTime);
      oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.01);
      osc.connect(oscGain);
      oscGain.connect(gain);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.01);
    },
  },

  // --- Alerts ---
  alert: {
    duration: 500,
    generate: (ctx, gain) => {
      // Two-tone alert like macOS
      [0, 0.15].forEach((delay, i) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime + delay);
        oscGain.gain.setValueAtTime(0, ctx.currentTime + delay);
        oscGain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + delay + 0.02);
        oscGain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + delay + 0.1);
        oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.2);
        osc.connect(oscGain);
        oscGain.connect(gain);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.2);
      });
    },
  },

  error: {
    duration: 300,
    generate: (ctx, gain) => {
      // Low thud sound for errors
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.15);
      oscGain.gain.setValueAtTime(0.4, ctx.currentTime);
      oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(oscGain);
      oscGain.connect(gain);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    },
  },

  warning: {
    duration: 400,
    generate: (ctx, gain) => {
      // Two quick high beeps
      [0, 0.12].forEach((delay) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(660, ctx.currentTime + delay);
        oscGain.gain.setValueAtTime(0.25, ctx.currentTime + delay);
        oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.1);
        osc.connect(oscGain);
        oscGain.connect(gain);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.1);
      });
    },
  },

  notification: {
    duration: 600,
    generate: (ctx, gain) => {
      // Tri-tone notification like macOS
      [0, 0.12, 0.24].forEach((delay, i) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'sine';
        const freq = [523.25, 659.25, 783.99][i]; // C5, E5, G5
        osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
        oscGain.gain.setValueAtTime(0.2, ctx.currentTime + delay);
        oscGain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + delay + 0.08);
        oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.15);
        osc.connect(oscGain);
        oscGain.connect(gain);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.15);
      });
    },
  },

  // --- System ---
  startup: {
    duration: 2500,
    generate: (ctx, gain) => {
      // Classic Mac startup chime - F major chord
      const frequencies = [349.23, 440, 523.25, 698.46]; // F4, A4, C5, F5
      frequencies.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        oscGain.gain.setValueAtTime(0.2, ctx.currentTime);
        oscGain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 1.5);
        oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);
        osc.connect(oscGain);
        oscGain.connect(gain);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 2.5);
      });
    },
  },

  screenshot: {
    duration: 400,
    generate: (ctx, gain) => {
      // Camera shutter click
      const noise = ctx.createBufferSource();
      const bufferSize = ctx.sampleRate * 0.1;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.1));
      }

      noise.buffer = buffer;
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.5, ctx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

      // High-pass filter for clickiness
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 2000;

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(gain);
      noise.start(ctx.currentTime);

      // Add a mechanical click
      const click = ctx.createOscillator();
      const clickGain = ctx.createGain();
      click.type = 'square';
      click.frequency.setValueAtTime(80, ctx.currentTime + 0.05);
      clickGain.gain.setValueAtTime(0.15, ctx.currentTime + 0.05);
      clickGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      click.connect(clickGain);
      clickGain.connect(gain);
      click.start(ctx.currentTime + 0.05);
      click.stop(ctx.currentTime + 0.1);
    },
  },

  trashEmpty: {
    duration: 800,
    generate: (ctx, gain) => {
      // Paper crumple + whoosh
      const noise = ctx.createBufferSource();
      const bufferSize = ctx.sampleRate * 0.6;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        const envelope = Math.sin((i / bufferSize) * Math.PI) * Math.exp(-i / (bufferSize * 0.3));
        data[i] = (Math.random() * 2 - 1) * envelope;
      }

      noise.buffer = buffer;
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.3, ctx.currentTime);

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(500, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.3);
      filter.Q.value = 1;

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(gain);
      noise.start(ctx.currentTime);
    },
  },

  volumeChange: {
    duration: 100,
    generate: (ctx, gain) => {
      // Pop sound
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      oscGain.gain.setValueAtTime(0.3, ctx.currentTime);
      oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(oscGain);
      oscGain.connect(gain);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    },
  },

  typing: {
    duration: 30,
    generate: (ctx, gain) => {
      // Subtle keyboard click
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(4000 + Math.random() * 500, ctx.currentTime);
      oscGain.gain.setValueAtTime(0.05, ctx.currentTime);
      oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 3000;

      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(gain);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.03);
    },
  },

  // --- Window Management ---
  windowMinimize: {
    duration: 300,
    generate: (ctx, gain) => {
      // Swoosh down
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.25);
      oscGain.gain.setValueAtTime(0.15, ctx.currentTime);
      oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(oscGain);
      oscGain.connect(gain);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    },
  },

  windowZoom: {
    duration: 200,
    generate: (ctx, gain) => {
      // Swoosh up
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);
      oscGain.gain.setValueAtTime(0.12, ctx.currentTime);
      oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.connect(oscGain);
      oscGain.connect(gain);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    },
  },

  windowClose: {
    duration: 150,
    generate: (ctx, gain) => {
      // Soft thud
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
      oscGain.gain.setValueAtTime(0.15, ctx.currentTime);
      oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(oscGain);
      oscGain.connect(gain);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    },
  },

  dockBounce: {
    duration: 200,
    generate: (ctx, gain) => {
      // Bouncy spring sound
      [0, 0.08].forEach((delay, i) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(i === 0 ? 500 : 400, ctx.currentTime + delay);
        oscGain.gain.setValueAtTime(0.2 - i * 0.1, ctx.currentTime + delay);
        oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.08);
        osc.connect(oscGain);
        oscGain.connect(gain);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.1);
      });
    },
  },

  // --- Named Alert Sounds ---
  Basso: {
    duration: 300,
    generate: (ctx, gain) => {
      // Deep bass thud
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(80, ctx.currentTime);
      oscGain.gain.setValueAtTime(0.5, ctx.currentTime);
      oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(oscGain);
      oscGain.connect(gain);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    },
  },

  Blow: {
    duration: 400,
    generate: (ctx, gain) => {
      // Airy blow
      const noise = ctx.createBufferSource();
      const bufferSize = ctx.sampleRate * 0.4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
      }
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 800;
      filter.Q.value = 2;
      const noiseGain = ctx.createGain();
      noiseGain.gain.value = 0.3;
      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(gain);
      noise.start(ctx.currentTime);
    },
  },

  Bottle: {
    duration: 600,
    generate: (ctx, gain) => {
      // Hollow bottle pop
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.5);
      oscGain.gain.setValueAtTime(0.3, ctx.currentTime);
      oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.connect(oscGain);
      oscGain.connect(gain);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.6);
    },
  },

  Frog: {
    duration: 400,
    generate: (ctx, gain) => {
      // Ribbit sound
      [0, 0.15].forEach((delay) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(250, ctx.currentTime + delay);
        osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + delay + 0.1);
        oscGain.gain.setValueAtTime(0.15, ctx.currentTime + delay);
        oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.12);
        osc.connect(oscGain);
        oscGain.connect(gain);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.15);
      });
    },
  },

  Funk: {
    duration: 300,
    generate: (ctx, gain) => {
      // Funky bass hit
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.15);
      oscGain.gain.setValueAtTime(0.25, ctx.currentTime);
      oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 500;
      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(gain);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    },
  },

  Glass: {
    duration: 500,
    generate: (ctx, gain) => {
      // Crystal glass ting
      [1, 2.5, 4].forEach((mult, i) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880 * mult, ctx.currentTime);
        oscGain.gain.setValueAtTime(0.15 / (i + 1), ctx.currentTime);
        oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.connect(oscGain);
        oscGain.connect(gain);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.5);
      });
    },
  },

  Hero: {
    duration: 800,
    generate: (ctx, gain) => {
      // Triumphant fanfare
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'triangle';
        const delay = i * 0.12;
        osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
        oscGain.gain.setValueAtTime(0.2, ctx.currentTime + delay);
        oscGain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + delay + 0.1);
        oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.3);
        osc.connect(oscGain);
        oscGain.connect(gain);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.4);
      });
    },
  },

  Morse: {
    duration: 500,
    generate: (ctx, gain) => {
      // Morse code beeps
      [0, 0.1, 0.25, 0.35].forEach((delay, i) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 800;
        const dur = i % 2 === 0 ? 0.05 : 0.1;
        oscGain.gain.setValueAtTime(0.2, ctx.currentTime + delay);
        oscGain.gain.setValueAtTime(0.2, ctx.currentTime + delay + dur - 0.01);
        oscGain.gain.linearRampToValueAtTime(0, ctx.currentTime + delay + dur);
        osc.connect(oscGain);
        oscGain.connect(gain);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + dur);
      });
    },
  },

  Ping: {
    duration: 400,
    generate: (ctx, gain) => {
      // Classic Mac ping
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1760, ctx.currentTime);
      oscGain.gain.setValueAtTime(0.25, ctx.currentTime);
      oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(oscGain);
      oscGain.connect(gain);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    },
  },

  Pop: {
    duration: 150,
    generate: (ctx, gain) => {
      // Quick pop
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.05);
      oscGain.gain.setValueAtTime(0.35, ctx.currentTime);
      oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(oscGain);
      oscGain.connect(gain);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    },
  },

  Purr: {
    duration: 600,
    generate: (ctx, gain) => {
      // Soft purring
      const osc = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      const oscGain = ctx.createGain();

      lfo.frequency.value = 25;
      lfoGain.gain.value = 20;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      osc.type = 'sine';
      osc.frequency.value = 100;
      oscGain.gain.setValueAtTime(0.2, ctx.currentTime);
      oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.connect(oscGain);
      oscGain.connect(gain);
      lfo.start(ctx.currentTime);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.6);
      lfo.stop(ctx.currentTime + 0.6);
    },
  },

  Sosumi: {
    duration: 500,
    generate: (ctx, gain) => {
      // Classic "So Sue Me" - three note melody
      const notes = [659.25, 783.99, 659.25]; // E5, G5, E5
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'sine';
        const delay = i * 0.1;
        osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
        oscGain.gain.setValueAtTime(0.25, ctx.currentTime + delay);
        oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.12);
        osc.connect(oscGain);
        oscGain.connect(gain);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.15);
      });
    },
  },

  Submarine: {
    duration: 800,
    generate: (ctx, gain) => {
      // Sonar ping
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      oscGain.gain.setValueAtTime(0.3, ctx.currentTime);
      oscGain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.1);
      oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.connect(oscGain);
      oscGain.connect(gain);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.8);
    },
  },

  Tink: {
    duration: 200,
    generate: (ctx, gain) => {
      // High metallic tink
      [2637, 5274].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        oscGain.gain.setValueAtTime(0.15 / (i + 1), ctx.currentTime);
        oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.connect(oscGain);
        oscGain.connect(gain);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.2);
      });
    },
  },
};

// ============================================================================
// Sound Manager Class
// ============================================================================

class SoundManager {
  private enabled = true;
  private volume = 0.75;
  private lastVolumeChange = 0;
  private debounceTime = 50;

  /**
   * Initialize audio context on user interaction
   */
  init(): void {
    if (isInitialized) return;

    const initOnInteraction = () => {
      getAudioContext();
      isInitialized = true;
      document.removeEventListener('click', initOnInteraction);
      document.removeEventListener('keydown', initOnInteraction);
    };

    document.addEventListener('click', initOnInteraction);
    document.addEventListener('keydown', initOnInteraction);
  }

  /**
   * Set master volume (0-100)
   */
  setVolume(level: number): void {
    this.volume = Math.max(0, Math.min(100, level)) / 100;
    const gain = getMasterGain();
    gain.gain.value = this.volume;
  }

  /**
   * Get current volume (0-100)
   */
  getVolume(): number {
    return this.volume * 100;
  }

  /**
   * Enable/disable all sounds
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Check if sounds are enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Play a sound
   */
  play(type: SoundType, options: SoundOptions = {}): void {
    if (!this.enabled) return;

    const definition = soundDefinitions[type];
    if (!definition) {
      console.warn(`Unknown sound type: ${type}`);
      return;
    }

    try {
      const ctx = getAudioContext();
      const soundGain = ctx.createGain();

      // Apply volume (options > system)
      const volume = options.volume ?? this.volume;
      soundGain.gain.value = volume;

      // Apply panning if specified
      if (options.pan !== undefined) {
        const panner = ctx.createStereoPanner();
        panner.pan.value = Math.max(-1, Math.min(1, options.pan));
        soundGain.connect(panner);
        panner.connect(getMasterGain());
      } else {
        soundGain.connect(getMasterGain());
      }

      definition.generate(ctx, soundGain);

      // Dispatch haptic-like visual feedback event
      window.dispatchEvent(new CustomEvent('zos:sound-played', {
        detail: { type, duration: definition.duration }
      }));
    } catch (e) {
      console.error('Failed to play sound:', e);
    }
  }

  /**
   * Play alert sound by name
   */
  playAlert(name: string): void {
    const soundType = name as SoundType;
    if (soundDefinitions[soundType]) {
      this.play(soundType);
    } else {
      // Fallback to default Ping
      this.play('Ping');
    }
  }

  /**
   * Play volume change sound with debouncing
   */
  playVolumeChange(): void {
    const now = Date.now();
    if (now - this.lastVolumeChange > this.debounceTime) {
      this.lastVolumeChange = now;
      this.play('volumeChange');
    }
  }

  /**
   * Cleanup
   */
  dispose(): void {
    if (audioContext) {
      audioContext.close();
      audioContext = null;
      masterGain = null;
      isInitialized = false;
    }
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const soundManager = new SoundManager();

// Auto-initialize on module load
if (typeof window !== 'undefined') {
  soundManager.init();
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Play a sound
 */
export function playSound(type: SoundType, options?: SoundOptions): void {
  soundManager.play(type, options);
}

/**
 * Play click sound
 */
export function playClick(): void {
  soundManager.play('click');
}

/**
 * Play notification sound
 */
export function playNotification(): void {
  soundManager.play('notification');
}

/**
 * Play alert sound
 */
export function playAlert(name?: string): void {
  if (name) {
    soundManager.playAlert(name);
  } else {
    soundManager.play('alert');
  }
}

/**
 * Play error sound
 */
export function playError(): void {
  soundManager.play('error');
}

/**
 * Play startup chime
 */
export function playStartup(): void {
  soundManager.play('startup');
}

/**
 * Play screenshot sound
 */
export function playScreenshot(): void {
  soundManager.play('screenshot');
}
