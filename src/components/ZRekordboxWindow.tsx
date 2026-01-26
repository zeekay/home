import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import ZWindow from './ZWindow';
import { cn } from '@/lib/utils';
import {
  Play, Pause, SkipBack, SkipForward, Music, Folder, List, Star,
  Search, ChevronRight, ChevronDown, Settings, Zap, Repeat,
  Volume2, Headphones, MoreHorizontal, Grid3X3, Disc3
} from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  bpm: number;
  key: string;
  duration: number;
  rating: number;
  color: string;
  dateAdded: number;
  waveformData: number[];
  cuePoints: CuePoint[];
  phrases: Phrase[];
}

interface CuePoint {
  id: string;
  position: number;
  color: string;
  name: string;
  type: 'cue' | 'loop' | 'hot';
}

interface Phrase {
  start: number;
  end: number;
  type: 'intro' | 'verse' | 'chorus' | 'bridge' | 'outro' | 'break';
  color: string;
}

interface Playlist {
  id: string;
  name: string;
  trackIds: string[];
  isFolder: boolean;
  children?: Playlist[];
  expanded?: boolean;
}

interface DeckState {
  trackId: string | null;
  isPlaying: boolean;
  currentTime: number;
  loopIn: number | null;
  loopOut: number | null;
  loopActive: boolean;
  tempo: number;
  pitch: number;
  keyLock: boolean;
  sync: boolean;
  eqHigh: number;
  eqMid: number;
  eqLow: number;
  filter: number;
  volume: number;
  hotCues: (CuePoint | null)[];
}

interface MixerState {
  crossfader: number;
  masterVolume: number;
  boothVolume: number;
  headphonesMix: number;
  headphonesVolume: number;
}

interface FXState {
  type: string;
  wet: number;
  param1: number;
  param2: number;
  active: boolean;
  beat: number;
}

type ViewSection = 'collection' | 'playlists' | 'explorer' | 'history';
type ExportMode = 'performance' | 'export';

interface ZRekordboxWindowProps {
  onClose: () => void;
  onFocus?: () => void;
  isActive?: boolean;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const KEYS = ['1A', '2A', '3A', '4A', '5A', '6A', '7A', '8A', '9A', '10A', '11A', '12A',
              '1B', '2B', '3B', '4B', '5B', '6B', '7B', '8B', '9B', '10B', '11B', '12B'];

const PHRASE_COLORS: Record<string, string> = {
  intro: '#4CAF50',
  verse: '#2196F3',
  chorus: '#9C27B0',
  bridge: '#FF9800',
  outro: '#F44336',
  break: '#607D8B'
};

const FX_TYPES = ['Echo', 'Reverb', 'Flanger', 'Filter', 'Spiral', 'Roll', 'Slip Roll', 'Trans'];

const HOT_CUE_COLORS = ['#E91E63', '#FF5722', '#FFC107', '#4CAF50', '#00BCD4', '#2196F3', '#9C27B0', '#795548'];

// =============================================================================
// UTILITIES
// =============================================================================

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatTimeRemaining(current: number, total: number): string {
  const remaining = total - current;
  return `-${formatTime(remaining)}`;
}

function generateWaveform(length: number = 400): number[] {
  const data: number[] = [];
  let phase = 0;
  for (let i = 0; i < length; i++) {
    phase += 0.1 + Math.random() * 0.2;
    const base = Math.sin(phase) * 0.3 + 0.5;
    const noise = (Math.random() - 0.5) * 0.4;
    data.push(Math.max(0.1, Math.min(1, base + noise)));
  }
  return data;
}

function generatePhrases(duration: number): Phrase[] {
  const phrases: Phrase[] = [];
  const types: Phrase['type'][] = ['intro', 'verse', 'chorus', 'verse', 'chorus', 'bridge', 'chorus', 'outro'];
  let currentTime = 0;
  const avgPhraseLength = duration / types.length;

  types.forEach((type, i) => {
    const phraseLength = avgPhraseLength * (0.8 + Math.random() * 0.4);
    phrases.push({
      start: currentTime,
      end: Math.min(currentTime + phraseLength, duration),
      type,
      color: PHRASE_COLORS[type]
    });
    currentTime += phraseLength;
  });

  return phrases;
}

function generateDemoTracks(): Track[] {
  const artists = ['deadmau5', 'Eric Prydz', 'Adam Beyer', 'Charlotte de Witte', 'Amelie Lens', 'Carl Cox', 'Nina Kraviz', 'Tale Of Us'];
  const albums = ['Random Album Title', 'Opus', 'Drumcode', 'Selected', 'Higher Power', 'Intec Digital', 'Trip Records', 'Afterlife'];
  const titles = [
    'Strobe', 'Pjanoo', 'Drumcode 001', 'Closer', 'In Silence', 'I Want You', 'IMPRV', 'Nova',
    'Ghosts n Stuff', 'Generate', 'Capsule', 'Voices Of The Ancient', 'Energy', 'Global', 'Desire', 'Unity'
  ];

  return titles.map((title, i) => {
    const duration = 240 + Math.floor(Math.random() * 240);
    return {
      id: `track-${i}`,
      title,
      artist: artists[i % artists.length],
      album: albums[i % albums.length],
      bpm: 120 + Math.floor(Math.random() * 20),
      key: KEYS[Math.floor(Math.random() * KEYS.length)],
      duration,
      rating: Math.floor(Math.random() * 6),
      color: HOT_CUE_COLORS[i % HOT_CUE_COLORS.length],
      dateAdded: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
      waveformData: generateWaveform(),
      cuePoints: [],
      phrases: generatePhrases(duration)
    };
  });
}

function generateDemoPlaylists(tracks: Track[]): Playlist[] {
  return [
    {
      id: 'folder-1',
      name: 'Sets',
      trackIds: [],
      isFolder: true,
      expanded: true,
      children: [
        { id: 'pl-1', name: 'Club Night 2024', trackIds: tracks.slice(0, 4).map(t => t.id), isFolder: false },
        { id: 'pl-2', name: 'Festival Main Stage', trackIds: tracks.slice(2, 6).map(t => t.id), isFolder: false },
      ]
    },
    {
      id: 'folder-2',
      name: 'Genres',
      trackIds: [],
      isFolder: true,
      expanded: false,
      children: [
        { id: 'pl-3', name: 'Techno', trackIds: tracks.slice(0, 8).map(t => t.id), isFolder: false },
        { id: 'pl-4', name: 'House', trackIds: tracks.slice(4, 12).map(t => t.id), isFolder: false },
        { id: 'pl-5', name: 'Melodic', trackIds: tracks.slice(8, 16).map(t => t.id), isFolder: false },
      ]
    },
    { id: 'pl-6', name: 'Favorites', trackIds: tracks.filter(t => t.rating >= 4).map(t => t.id), isFolder: false },
  ];
}

// =============================================================================
// COMPONENTS
// =============================================================================

const Waveform: React.FC<{
  data: number[];
  currentTime: number;
  duration: number;
  phrases: Phrase[];
  color: string;
  cuePoints: CuePoint[];
  loopIn: number | null;
  loopOut: number | null;
  loopActive: boolean;
  onSeek: (time: number) => void;
  isPlaying: boolean;
}> = ({ data, currentTime, duration, phrases, color, cuePoints, loopIn, loopOut, loopActive, onSeek, isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const playheadX = (currentTime / duration) * width;

    ctx.clearRect(0, 0, width, height);

    // Draw phrases background
    phrases.forEach(phrase => {
      const startX = (phrase.start / duration) * width;
      const endX = (phrase.end / duration) * width;
      ctx.fillStyle = phrase.color + '30';
      ctx.fillRect(startX, 0, endX - startX, height);
    });

    // Draw loop region
    if (loopIn !== null && loopOut !== null) {
      const loopStartX = (loopIn / duration) * width;
      const loopEndX = (loopOut / duration) * width;
      ctx.fillStyle = loopActive ? 'rgba(76, 175, 80, 0.3)' : 'rgba(76, 175, 80, 0.15)';
      ctx.fillRect(loopStartX, 0, loopEndX - loopStartX, height);
    }

    // Draw waveform
    const barWidth = width / data.length;
    data.forEach((value, i) => {
      const x = i * barWidth;
      const barHeight = value * height * 0.8;
      const y = (height - barHeight) / 2;

      const isPlayed = x < playheadX;
      ctx.fillStyle = isPlayed ? color : color + '60';
      ctx.fillRect(x, y, barWidth - 1, barHeight);
    });

    // Draw cue points
    cuePoints.forEach(cue => {
      const cueX = (cue.position / duration) * width;
      ctx.fillStyle = cue.color;
      ctx.beginPath();
      ctx.moveTo(cueX, 0);
      ctx.lineTo(cueX + 6, 0);
      ctx.lineTo(cueX, 10);
      ctx.closePath();
      ctx.fill();
    });

    // Draw playhead
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(playheadX - 1, 0, 2, height);

  }, [data, currentTime, duration, phrases, color, cuePoints, loopIn, loopOut, loopActive]);

  const handleClick = (e: React.MouseEvent) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    onSeek(percent * duration);
  };

  return (
    <div ref={containerRef} className="relative w-full h-full cursor-pointer" onClick={handleClick}>
      <canvas ref={canvasRef} width={800} height={80} className="w-full h-full" />
    </div>
  );
};

const JogWheel: React.FC<{
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onScratch: (delta: number) => void;
  deckNumber: number;
}> = ({ isPlaying, currentTime, duration, onScratch, deckNumber }) => {
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const lastAngleRef = useRef(0);
  const centerRef = useRef({ x: 0, y: 0 });
  const wheelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isPlaying && !isDragging) {
      const interval = setInterval(() => {
        setRotation(prev => prev + 2);
      }, 16);
      return () => clearInterval(interval);
    }
  }, [isPlaying, isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!wheelRef.current) return;
    const rect = wheelRef.current.getBoundingClientRect();
    centerRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
    const angle = Math.atan2(
      e.clientY - centerRef.current.y,
      e.clientX - centerRef.current.x
    );
    lastAngleRef.current = angle;
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const angle = Math.atan2(
        e.clientY - centerRef.current.y,
        e.clientX - centerRef.current.x
      );
      const delta = angle - lastAngleRef.current;
      lastAngleRef.current = angle;
      setRotation(prev => prev + (delta * 180 / Math.PI));
      onScratch(delta * 10);
    };

    const handleMouseUp = () => setIsDragging(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, onScratch]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="relative">
      {/* Outer ring with progress */}
      <div className="w-32 h-32 rounded-full bg-gray-900 p-1 relative">
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="60"
            stroke="rgba(139, 92, 246, 0.3)"
            strokeWidth="4"
            fill="none"
          />
          <circle
            cx="64"
            cy="64"
            r="60"
            stroke="#8B5CF6"
            strokeWidth="4"
            fill="none"
            strokeDasharray={`${progress * 3.77} 377`}
            className="transition-all duration-100"
          />
        </svg>

        {/* Jog wheel */}
        <div
          ref={wheelRef}
          className={cn(
            "w-full h-full rounded-full cursor-grab active:cursor-grabbing",
            "bg-gradient-to-br from-gray-800 to-gray-900",
            "border-2 border-gray-700",
            "flex items-center justify-center",
            isDragging && "ring-2 ring-purple-500"
          )}
          style={{ transform: `rotate(${rotation}deg)` }}
          onMouseDown={handleMouseDown}
        >
          {/* Center label */}
          <div className="w-16 h-16 rounded-full bg-gray-950 flex items-center justify-center">
            <span className="text-purple-400 font-bold text-xl">{deckNumber}</span>
          </div>

          {/* Position marker */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-1 h-3 bg-purple-500 rounded" />
        </div>
      </div>
    </div>
  );
};

const EQKnob: React.FC<{
  value: number;
  onChange: (value: number) => void;
  label: string;
  color?: string;
}> = ({ value, onChange, label, color = '#8B5CF6' }) => {
  const knobRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);
  const startValueRef = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    startYRef.current = e.clientY;
    startValueRef.current = value;
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = (startYRef.current - e.clientY) / 100;
      const newValue = Math.max(-1, Math.min(1, startValueRef.current + delta));
      onChange(newValue);
    };

    const handleMouseUp = () => setIsDragging(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, onChange]);

  const rotation = value * 135;

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        ref={knobRef}
        className={cn(
          "w-8 h-8 rounded-full cursor-ns-resize",
          "bg-gradient-to-b from-gray-700 to-gray-800",
          "border border-gray-600",
          "flex items-center justify-center",
          isDragging && "ring-2 ring-purple-500"
        )}
        style={{ transform: `rotate(${rotation}deg)` }}
        onMouseDown={handleMouseDown}
        onDoubleClick={() => onChange(0)}
      >
        <div className="w-0.5 h-3 rounded-full" style={{ backgroundColor: color }} />
      </div>
      <span className="text-[10px] text-gray-400 uppercase">{label}</span>
    </div>
  );
};

const VolumeSlider: React.FC<{
  value: number;
  onChange: (value: number) => void;
  vertical?: boolean;
  color?: string;
}> = ({ value, onChange, vertical = false, color = '#8B5CF6' }) => {
  return (
    <div className={cn("relative", vertical ? "h-24 w-2" : "w-24 h-2")}>
      <div className="absolute inset-0 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="rounded-full transition-all"
          style={{
            backgroundColor: color,
            ...(vertical
              ? { width: '100%', height: `${value * 100}%`, bottom: 0, position: 'absolute' }
              : { height: '100%', width: `${value * 100}%` })
          }}
        />
      </div>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className={cn(
          "absolute inset-0 opacity-0 cursor-pointer",
          vertical && "writing-mode-vertical"
        )}
        style={vertical ? { writingMode: 'vertical-lr', direction: 'rtl' } as React.CSSProperties : undefined}
      />
    </div>
  );
};

const HotCuePad: React.FC<{
  cue: CuePoint | null;
  index: number;
  onTrigger: () => void;
  onSet: () => void;
  onDelete: () => void;
}> = ({ cue, index, onTrigger, onSet, onDelete }) => {
  return (
    <button
      className={cn(
        "w-10 h-10 rounded-lg font-bold text-sm transition-all",
        "border border-gray-700",
        cue
          ? "text-white shadow-lg"
          : "bg-gray-800/50 text-gray-500 hover:bg-gray-700/50"
      )}
      style={cue ? { backgroundColor: cue.color } : undefined}
      onClick={cue ? onTrigger : onSet}
      onContextMenu={(e) => { e.preventDefault(); if (cue) onDelete(); }}
    >
      {index + 1}
    </button>
  );
};

const PerformancePad: React.FC<{
  label: string;
  active?: boolean;
  color?: string;
  onTrigger: () => void;
}> = ({ label, active, color = '#8B5CF6', onTrigger }) => {
  return (
    <button
      className={cn(
        "w-full aspect-square rounded-lg font-medium text-xs transition-all",
        "border border-gray-700",
        active
          ? "text-white shadow-lg"
          : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50"
      )}
      style={active ? { backgroundColor: color } : undefined}
      onClick={onTrigger}
    >
      {label}
    </button>
  );
};

const Deck: React.FC<{
  deckNumber: 1 | 2;
  track: Track | null;
  state: DeckState;
  onStateChange: (state: Partial<DeckState>) => void;
  tracks: Track[];
}> = ({ deckNumber, track, state, onStateChange, tracks }) => {
  const progressRef = useRef<number | null>(null);

  useEffect(() => {
    if (state.isPlaying && track) {
      progressRef.current = window.setInterval(() => {
        onStateChange({
          currentTime: Math.min(state.currentTime + 0.1, track.duration)
        });

        // Handle loop
        if (state.loopActive && state.loopIn !== null && state.loopOut !== null) {
          if (state.currentTime >= state.loopOut) {
            onStateChange({ currentTime: state.loopIn });
          }
        }

        // Handle end of track
        if (state.currentTime >= track.duration) {
          onStateChange({ isPlaying: false, currentTime: 0 });
        }
      }, 100);

      return () => {
        if (progressRef.current) clearInterval(progressRef.current);
      };
    }
  }, [state.isPlaying, state.currentTime, track, state.loopActive, state.loopIn, state.loopOut]);

  const handleScratch = (delta: number) => {
    if (!track) return;
    const newTime = Math.max(0, Math.min(track.duration, state.currentTime + delta));
    onStateChange({ currentTime: newTime });
  };

  const setHotCue = (index: number) => {
    if (!track) return;
    const newHotCues = [...state.hotCues];
    newHotCues[index] = {
      id: `hc-${deckNumber}-${index}`,
      position: state.currentTime,
      color: HOT_CUE_COLORS[index],
      name: `Cue ${index + 1}`,
      type: 'hot'
    };
    onStateChange({ hotCues: newHotCues });
  };

  const triggerHotCue = (index: number) => {
    const cue = state.hotCues[index];
    if (cue) {
      onStateChange({ currentTime: cue.position, isPlaying: true });
    }
  };

  const deleteHotCue = (index: number) => {
    const newHotCues = [...state.hotCues];
    newHotCues[index] = null;
    onStateChange({ hotCues: newHotCues });
  };

  const toggleLoop = () => {
    if (state.loopIn === null) {
      onStateChange({ loopIn: state.currentTime });
    } else if (state.loopOut === null) {
      onStateChange({ loopOut: state.currentTime, loopActive: true });
    } else {
      onStateChange({ loopIn: null, loopOut: null, loopActive: false });
    }
  };

  const isLeftDeck = deckNumber === 1;

  return (
    <div className={cn(
      "flex-1 flex flex-col gap-2 p-2 bg-gray-900/50 rounded-lg border border-gray-800",
      isLeftDeck ? "items-start" : "items-end"
    )}>
      {/* Track Info */}
      <div className={cn("w-full flex items-start gap-3", !isLeftDeck && "flex-row-reverse")}>
        <div className={cn("flex-1 min-w-0", !isLeftDeck && "text-right")}>
          <h3 className="text-white font-semibold truncate">{track?.title || 'No Track Loaded'}</h3>
          <p className="text-gray-400 text-sm truncate">{track?.artist || '-'}</p>
        </div>
        <div className={cn("flex gap-4 text-sm", !isLeftDeck && "flex-row-reverse")}>
          <div className="text-center">
            <div className="text-purple-400 font-mono font-bold">{track?.bpm?.toFixed(1) || '-'}</div>
            <div className="text-gray-500 text-xs">BPM</div>
          </div>
          <div className="text-center">
            <div className="text-green-400 font-mono font-bold">{track?.key || '-'}</div>
            <div className="text-gray-500 text-xs">KEY</div>
          </div>
        </div>
      </div>

      {/* Time Display */}
      <div className={cn("flex gap-4 text-sm font-mono", !isLeftDeck && "flex-row-reverse")}>
        <span className="text-white">{track ? formatTime(state.currentTime) : '0:00'}</span>
        <span className="text-gray-500">{track ? formatTimeRemaining(state.currentTime, track.duration) : '-0:00'}</span>
      </div>

      {/* Waveform */}
      <div className="w-full h-16 bg-gray-950 rounded-lg overflow-hidden border border-gray-800">
        {track ? (
          <Waveform
            data={track.waveformData}
            currentTime={state.currentTime}
            duration={track.duration}
            phrases={track.phrases}
            color={track.color}
            cuePoints={track.cuePoints}
            loopIn={state.loopIn}
            loopOut={state.loopOut}
            loopActive={state.loopActive}
            onSeek={(time) => onStateChange({ currentTime: time })}
            isPlaying={state.isPlaying}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600">
            <Music className="w-6 h-6" />
          </div>
        )}
      </div>

      {/* Phrase Analysis Strip */}
      <div className="w-full h-4 bg-gray-950 rounded overflow-hidden flex">
        {track?.phrases.map((phrase, i) => (
          <div
            key={i}
            className="h-full flex items-center justify-center text-[8px] text-white/70 uppercase"
            style={{
              backgroundColor: phrase.color,
              width: `${((phrase.end - phrase.start) / track.duration) * 100}%`
            }}
          >
            {phrase.type.slice(0, 3)}
          </div>
        ))}
      </div>

      {/* Controls Row */}
      <div className={cn("w-full flex items-center gap-4", !isLeftDeck && "flex-row-reverse")}>
        {/* Jog Wheel */}
        <JogWheel
          isPlaying={state.isPlaying}
          currentTime={state.currentTime}
          duration={track?.duration || 0}
          onScratch={handleScratch}
          deckNumber={deckNumber}
        />

        {/* Play/Cue Controls */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              className={cn(
                "w-12 h-10 rounded-lg font-bold text-sm",
                "bg-gray-800 border border-gray-700 text-gray-300",
                "hover:bg-gray-700 transition-colors"
              )}
              onClick={() => onStateChange({ currentTime: 0, isPlaying: false })}
            >
              CUE
            </button>
            <button
              className={cn(
                "w-12 h-10 rounded-lg font-bold text-sm transition-colors",
                state.isPlaying
                  ? "bg-purple-600 text-white"
                  : "bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700"
              )}
              onClick={() => onStateChange({ isPlaying: !state.isPlaying })}
            >
              {state.isPlaying ? <Pause className="w-4 h-4 mx-auto" /> : <Play className="w-4 h-4 mx-auto" />}
            </button>
          </div>

          {/* Sync and Loop */}
          <div className="flex gap-2">
            <button
              className={cn(
                "w-12 h-8 rounded text-xs font-medium transition-colors",
                state.sync
                  ? "bg-orange-500 text-white"
                  : "bg-gray-800 border border-gray-700 text-gray-400 hover:bg-gray-700"
              )}
              onClick={() => onStateChange({ sync: !state.sync })}
            >
              SYNC
            </button>
            <button
              className={cn(
                "w-12 h-8 rounded text-xs font-medium transition-colors",
                state.loopActive
                  ? "bg-green-500 text-white"
                  : state.loopIn !== null
                    ? "bg-green-500/50 text-white"
                    : "bg-gray-800 border border-gray-700 text-gray-400 hover:bg-gray-700"
              )}
              onClick={toggleLoop}
            >
              {state.loopActive ? 'LOOP' : state.loopIn !== null ? 'OUT' : 'IN'}
            </button>
          </div>
        </div>

        {/* Hot Cues */}
        <div className="grid grid-cols-4 gap-1">
          {state.hotCues.map((cue, i) => (
            <HotCuePad
              key={i}
              cue={cue}
              index={i}
              onTrigger={() => triggerHotCue(i)}
              onSet={() => setHotCue(i)}
              onDelete={() => deleteHotCue(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const Mixer: React.FC<{
  deck1: DeckState;
  deck2: DeckState;
  mixer: MixerState;
  fx1: FXState;
  fx2: FXState;
  onDeck1Change: (state: Partial<DeckState>) => void;
  onDeck2Change: (state: Partial<DeckState>) => void;
  onMixerChange: (state: Partial<MixerState>) => void;
  onFX1Change: (state: Partial<FXState>) => void;
  onFX2Change: (state: Partial<FXState>) => void;
}> = ({ deck1, deck2, mixer, fx1, fx2, onDeck1Change, onDeck2Change, onMixerChange, onFX1Change, onFX2Change }) => {
  return (
    <div className="flex flex-col gap-3 p-3 bg-gray-900/70 rounded-lg border border-gray-800 min-w-[280px]">
      {/* FX Section */}
      <div className="flex gap-4">
        {/* FX1 */}
        <div className="flex-1 p-2 bg-gray-950/50 rounded border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">FX 1</span>
            <select
              value={fx1.type}
              onChange={(e) => onFX1Change({ type: e.target.value })}
              className="bg-transparent text-xs text-purple-400 border-none outline-none cursor-pointer"
            >
              {FX_TYPES.map(fx => (
                <option key={fx} value={fx} className="bg-gray-900">{fx}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <EQKnob value={fx1.wet * 2 - 1} onChange={(v) => onFX1Change({ wet: (v + 1) / 2 })} label="WET" />
            <button
              className={cn(
                "flex-1 h-6 rounded text-xs font-medium transition-colors",
                fx1.active ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-500"
              )}
              onClick={() => onFX1Change({ active: !fx1.active })}
            >
              ON
            </button>
          </div>
        </div>

        {/* FX2 */}
        <div className="flex-1 p-2 bg-gray-950/50 rounded border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">FX 2</span>
            <select
              value={fx2.type}
              onChange={(e) => onFX2Change({ type: e.target.value })}
              className="bg-transparent text-xs text-blue-400 border-none outline-none cursor-pointer"
            >
              {FX_TYPES.map(fx => (
                <option key={fx} value={fx} className="bg-gray-900">{fx}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <EQKnob value={fx2.wet * 2 - 1} onChange={(v) => onFX2Change({ wet: (v + 1) / 2 })} label="WET" color="#3B82F6" />
            <button
              className={cn(
                "flex-1 h-6 rounded text-xs font-medium transition-colors",
                fx2.active ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-500"
              )}
              onClick={() => onFX2Change({ active: !fx2.active })}
            >
              ON
            </button>
          </div>
        </div>
      </div>

      {/* EQ Section */}
      <div className="flex gap-6 justify-center">
        {/* Deck 1 EQ */}
        <div className="flex flex-col gap-2 items-center">
          <span className="text-xs text-purple-400 font-medium">CH 1</span>
          <EQKnob value={deck1.eqHigh} onChange={(v) => onDeck1Change({ eqHigh: v })} label="HI" />
          <EQKnob value={deck1.eqMid} onChange={(v) => onDeck1Change({ eqMid: v })} label="MID" />
          <EQKnob value={deck1.eqLow} onChange={(v) => onDeck1Change({ eqLow: v })} label="LOW" />
          <EQKnob value={deck1.filter} onChange={(v) => onDeck1Change({ filter: v })} label="FILTER" color="#22C55E" />
        </div>

        {/* Channel Faders */}
        <div className="flex gap-3 items-end">
          <div className="flex flex-col items-center gap-1">
            <VolumeSlider value={deck1.volume} onChange={(v) => onDeck1Change({ volume: v })} vertical />
            <span className="text-[10px] text-gray-500">1</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <VolumeSlider value={deck2.volume} onChange={(v) => onDeck2Change({ volume: v })} vertical color="#3B82F6" />
            <span className="text-[10px] text-gray-500">2</span>
          </div>
        </div>

        {/* Deck 2 EQ */}
        <div className="flex flex-col gap-2 items-center">
          <span className="text-xs text-blue-400 font-medium">CH 2</span>
          <EQKnob value={deck2.eqHigh} onChange={(v) => onDeck2Change({ eqHigh: v })} label="HI" color="#3B82F6" />
          <EQKnob value={deck2.eqMid} onChange={(v) => onDeck2Change({ eqMid: v })} label="MID" color="#3B82F6" />
          <EQKnob value={deck2.eqLow} onChange={(v) => onDeck2Change({ eqLow: v })} label="LOW" color="#3B82F6" />
          <EQKnob value={deck2.filter} onChange={(v) => onDeck2Change({ filter: v })} label="FILTER" color="#22C55E" />
        </div>
      </div>

      {/* Crossfader */}
      <div className="flex flex-col items-center gap-1">
        <div className="w-full px-4">
          <input
            type="range"
            min="-1"
            max="1"
            step="0.01"
            value={mixer.crossfader}
            onChange={(e) => onMixerChange({ crossfader: parseFloat(e.target.value) })}
            className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6
              [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-gradient-to-b
              [&::-webkit-slider-thumb]:from-gray-300 [&::-webkit-slider-thumb]:to-gray-500
              [&::-webkit-slider-thumb]:rounded [&::-webkit-slider-thumb]:cursor-pointer"
          />
        </div>
        <div className="flex justify-between w-full px-4 text-[10px] text-gray-500">
          <span>A</span>
          <span>CROSSFADER</span>
          <span>B</span>
        </div>
      </div>

      {/* Master/Booth */}
      <div className="flex justify-center gap-6">
        <div className="flex items-center gap-2">
          <Volume2 className="w-3 h-3 text-gray-500" />
          <VolumeSlider value={mixer.masterVolume} onChange={(v) => onMixerChange({ masterVolume: v })} />
          <span className="text-[10px] text-gray-500">MST</span>
        </div>
        <div className="flex items-center gap-2">
          <Headphones className="w-3 h-3 text-gray-500" />
          <VolumeSlider value={mixer.headphonesVolume} onChange={(v) => onMixerChange({ headphonesVolume: v })} color="#22C55E" />
          <span className="text-[10px] text-gray-500">CUE</span>
        </div>
      </div>
    </div>
  );
};

const LibraryBrowser: React.FC<{
  tracks: Track[];
  playlists: Playlist[];
  selectedSection: ViewSection;
  selectedPlaylistId: string | null;
  onSectionChange: (section: ViewSection) => void;
  onPlaylistSelect: (id: string) => void;
  onLoadToDeck: (trackId: string, deck: 1 | 2) => void;
}> = ({ tracks, playlists, selectedSection, selectedPlaylistId, onSectionChange, onPlaylistSelect, onLoadToDeck }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'artist' | 'bpm' | 'key'>('title');
  const [sortAsc, setSortAsc] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['folder-1']));

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const getPlaylistTracks = () => {
    if (selectedSection === 'collection') return tracks;
    if (!selectedPlaylistId) return [];

    const findPlaylist = (items: Playlist[]): Playlist | null => {
      for (const item of items) {
        if (item.id === selectedPlaylistId) return item;
        if (item.children) {
          const found = findPlaylist(item.children);
          if (found) return found;
        }
      }
      return null;
    };

    const playlist = findPlaylist(playlists);
    if (!playlist) return [];
    return tracks.filter(t => playlist.trackIds.includes(t.id));
  };

  const displayedTracks = useMemo(() => {
    let result = getPlaylistTracks();

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(query) ||
        t.artist.toLowerCase().includes(query) ||
        t.album.toLowerCase().includes(query)
      );
    }

    result.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortAsc ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });

    return result;
  }, [tracks, selectedSection, selectedPlaylistId, searchQuery, sortBy, sortAsc, playlists]);

  const renderPlaylistItem = (item: Playlist, depth: number = 0) => {
    const isExpanded = expandedFolders.has(item.id);
    const isSelected = selectedPlaylistId === item.id;

    return (
      <div key={item.id}>
        <button
          className={cn(
            "w-full flex items-center gap-2 px-2 py-1.5 text-sm text-left rounded transition-colors",
            isSelected ? "bg-purple-600/30 text-purple-300" : "text-gray-300 hover:bg-gray-800"
          )}
          style={{ paddingLeft: `${8 + depth * 16}px` }}
          onClick={() => {
            if (item.isFolder) {
              toggleFolder(item.id);
            } else {
              onPlaylistSelect(item.id);
              onSectionChange('playlists');
            }
          }}
        >
          {item.isFolder ? (
            isExpanded ? <ChevronDown className="w-3 h-3 text-gray-500" /> : <ChevronRight className="w-3 h-3 text-gray-500" />
          ) : (
            <List className="w-3 h-3 text-gray-500" />
          )}
          {item.isFolder ? <Folder className="w-4 h-4 text-yellow-500" /> : null}
          <span className="truncate">{item.name}</span>
          {!item.isFolder && (
            <span className="text-gray-500 text-xs ml-auto">{item.trackIds.length}</span>
          )}
        </button>
        {item.isFolder && isExpanded && item.children && (
          <div>
            {item.children.map(child => renderPlaylistItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(column);
      setSortAsc(true);
    }
  };

  return (
    <div className="flex h-full bg-gray-950">
      {/* Sidebar */}
      <div className="w-48 border-r border-gray-800 flex flex-col">
        <div className="p-2 border-b border-gray-800">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full pl-7 pr-2 py-1 bg-gray-900 border border-gray-800 rounded text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto p-2">
          {/* Main Sections */}
          <div className="space-y-1 mb-4">
            <button
              className={cn(
                "w-full flex items-center gap-2 px-2 py-1.5 text-sm text-left rounded transition-colors",
                selectedSection === 'collection' ? "bg-purple-600/30 text-purple-300" : "text-gray-300 hover:bg-gray-800"
              )}
              onClick={() => { onSectionChange('collection'); onPlaylistSelect(''); }}
            >
              <Disc3 className="w-4 h-4" />
              Collection
            </button>
            <button
              className={cn(
                "w-full flex items-center gap-2 px-2 py-1.5 text-sm text-left rounded transition-colors",
                selectedSection === 'history' ? "bg-purple-600/30 text-purple-300" : "text-gray-300 hover:bg-gray-800"
              )}
              onClick={() => onSectionChange('history')}
            >
              <Repeat className="w-4 h-4" />
              History
            </button>
          </div>

          {/* Playlists */}
          <div className="text-xs text-gray-500 uppercase tracking-wider px-2 mb-2">Playlists</div>
          <div className="space-y-0.5">
            {playlists.map(item => renderPlaylistItem(item))}
          </div>
        </div>
      </div>

      {/* Track List */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center px-3 py-1.5 bg-gray-900/50 border-b border-gray-800 text-xs text-gray-500">
          <div className="w-8">#</div>
          <button className="flex-1 text-left hover:text-white transition-colors" onClick={() => handleSort('title')}>
            Title {sortBy === 'title' && (sortAsc ? '^' : 'v')}
          </button>
          <button className="w-32 text-left hover:text-white transition-colors" onClick={() => handleSort('artist')}>
            Artist {sortBy === 'artist' && (sortAsc ? '^' : 'v')}
          </button>
          <button className="w-16 text-center hover:text-white transition-colors" onClick={() => handleSort('bpm')}>
            BPM {sortBy === 'bpm' && (sortAsc ? '^' : 'v')}
          </button>
          <button className="w-12 text-center hover:text-white transition-colors" onClick={() => handleSort('key')}>
            Key {sortBy === 'key' && (sortAsc ? '^' : 'v')}
          </button>
          <div className="w-16 text-center">Rating</div>
          <div className="w-12 text-center">Time</div>
          <div className="w-16"></div>
        </div>

        {/* Tracks */}
        <div className="flex-1 overflow-auto">
          {displayedTracks.map((track, index) => (
            <div
              key={track.id}
              className="flex items-center px-3 py-1 text-sm hover:bg-gray-900/50 group border-b border-gray-900"
            >
              <div className="w-8 text-gray-600">{index + 1}</div>
              <div className="flex-1 min-w-0 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: track.color }} />
                <span className="text-white truncate">{track.title}</span>
              </div>
              <div className="w-32 text-gray-400 truncate">{track.artist}</div>
              <div className="w-16 text-center text-purple-400 font-mono text-xs">{track.bpm}</div>
              <div className="w-12 text-center text-green-400 font-mono text-xs">{track.key}</div>
              <div className="w-16 text-center">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star
                    key={i}
                    className={cn(
                      "w-3 h-3 inline",
                      i <= track.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-700"
                    )}
                  />
                ))}
              </div>
              <div className="w-12 text-center text-gray-500 text-xs">{formatTime(track.duration)}</div>
              <div className="w-16 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  className="px-2 py-0.5 bg-purple-600 hover:bg-purple-500 text-white text-xs rounded"
                  onClick={() => onLoadToDeck(track.id, 1)}
                >
                  1
                </button>
                <button
                  className="px-2 py-0.5 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded"
                  onClick={() => onLoadToDeck(track.id, 2)}
                >
                  2
                </button>
              </div>
            </div>
          ))}

          {displayedTracks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-600">
              <Music className="w-12 h-12 mb-3" />
              <p>No tracks found</p>
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="px-3 py-1 bg-gray-900/50 border-t border-gray-800 text-xs text-gray-500 flex justify-between">
          <span>{displayedTracks.length} tracks</span>
          <span>rekordbox 7.0</span>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const ZRekordboxWindow: React.FC<ZRekordboxWindowProps> = ({ onClose, onFocus, isActive }) => {
  const [tracks] = useState<Track[]>(() => generateDemoTracks());
  const [playlists] = useState<Playlist[]>(() => generateDemoPlaylists(tracks));

  const [deck1, setDeck1] = useState<DeckState>({
    trackId: tracks[0]?.id || null,
    isPlaying: false,
    currentTime: 0,
    loopIn: null,
    loopOut: null,
    loopActive: false,
    tempo: 0,
    pitch: 0,
    keyLock: false,
    sync: false,
    eqHigh: 0,
    eqMid: 0,
    eqLow: 0,
    filter: 0,
    volume: 0.8,
    hotCues: Array(8).fill(null)
  });

  const [deck2, setDeck2] = useState<DeckState>({
    trackId: tracks[1]?.id || null,
    isPlaying: false,
    currentTime: 0,
    loopIn: null,
    loopOut: null,
    loopActive: false,
    tempo: 0,
    pitch: 0,
    keyLock: false,
    sync: false,
    eqHigh: 0,
    eqMid: 0,
    eqLow: 0,
    filter: 0,
    volume: 0.8,
    hotCues: Array(8).fill(null)
  });

  const [mixer, setMixer] = useState<MixerState>({
    crossfader: 0,
    masterVolume: 0.8,
    boothVolume: 0.6,
    headphonesMix: 0.5,
    headphonesVolume: 0.7
  });

  const [fx1, setFX1] = useState<FXState>({
    type: 'Echo',
    wet: 0.5,
    param1: 0.5,
    param2: 0.5,
    active: false,
    beat: 1
  });

  const [fx2, setFX2] = useState<FXState>({
    type: 'Reverb',
    wet: 0.5,
    param1: 0.5,
    param2: 0.5,
    active: false,
    beat: 1
  });

  const [selectedSection, setSelectedSection] = useState<ViewSection>('collection');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [exportMode, setExportMode] = useState<ExportMode>('performance');

  const track1 = useMemo(() => tracks.find(t => t.id === deck1.trackId) || null, [tracks, deck1.trackId]);
  const track2 = useMemo(() => tracks.find(t => t.id === deck2.trackId) || null, [tracks, deck2.trackId]);

  const loadToDeck = useCallback((trackId: string, deckNum: 1 | 2) => {
    if (deckNum === 1) {
      setDeck1(prev => ({
        ...prev,
        trackId,
        currentTime: 0,
        isPlaying: false,
        loopIn: null,
        loopOut: null,
        loopActive: false,
        hotCues: Array(8).fill(null)
      }));
    } else {
      setDeck2(prev => ({
        ...prev,
        trackId,
        currentTime: 0,
        isPlaying: false,
        loopIn: null,
        loopOut: null,
        loopActive: false,
        hotCues: Array(8).fill(null)
      }));
    }
  }, []);

  return (
    <ZWindow
      title="rekordbox"
      onClose={onClose}
      onFocus={onFocus}
      isActive={isActive}
      initialSize={{ width: 1200, height: 800 }}
      initialPosition={{ x: 80, y: 40 }}
      windowType="default"
    >
      <div className="flex flex-col h-full bg-gray-950 text-white">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-900/80 border-b border-gray-800">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                <Disc3 className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-white">rekordbox</span>
            </div>

            {/* Mode Toggle */}
            <div className="flex bg-gray-800 rounded-lg p-0.5">
              <button
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded transition-colors",
                  exportMode === 'export' ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
                )}
                onClick={() => setExportMode('export')}
              >
                EXPORT
              </button>
              <button
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded transition-colors",
                  exportMode === 'performance' ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
                )}
                onClick={() => setExportMode('performance')}
              >
                PERFORMANCE
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-gray-800 transition-colors">
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-gray-800 transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Decks and Mixer */}
          <div className="flex gap-2 p-2 border-b border-gray-800">
            <Deck
              deckNumber={1}
              track={track1}
              state={deck1}
              onStateChange={(s) => setDeck1(prev => ({ ...prev, ...s }))}
              tracks={tracks}
            />

            <Mixer
              deck1={deck1}
              deck2={deck2}
              mixer={mixer}
              fx1={fx1}
              fx2={fx2}
              onDeck1Change={(s) => setDeck1(prev => ({ ...prev, ...s }))}
              onDeck2Change={(s) => setDeck2(prev => ({ ...prev, ...s }))}
              onMixerChange={(s) => setMixer(prev => ({ ...prev, ...s }))}
              onFX1Change={(s) => setFX1(prev => ({ ...prev, ...s }))}
              onFX2Change={(s) => setFX2(prev => ({ ...prev, ...s }))}
            />

            <Deck
              deckNumber={2}
              track={track2}
              state={deck2}
              onStateChange={(s) => setDeck2(prev => ({ ...prev, ...s }))}
              tracks={tracks}
            />
          </div>

          {/* Library Browser */}
          <div className="flex-1 min-h-0">
            <LibraryBrowser
              tracks={tracks}
              playlists={playlists}
              selectedSection={selectedSection}
              selectedPlaylistId={selectedPlaylistId}
              onSectionChange={setSelectedSection}
              onPlaylistSelect={setSelectedPlaylistId}
              onLoadToDeck={loadToDeck}
            />
          </div>
        </div>
      </div>
    </ZWindow>
  );
};

export default ZRekordboxWindow;
