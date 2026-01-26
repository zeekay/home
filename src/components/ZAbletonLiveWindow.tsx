import React, { useState, useCallback, useMemo } from 'react';
import ZWindow from './ZWindow';
import { cn } from '@/lib/utils';
import {
  Play, Square, Circle, RotateCcw, ChevronRight, ChevronDown,
  Volume2, Headphones, Mic, Music, Sliders, Layers, FolderOpen,
  Drum, Piano, AudioWaveform, Sparkles, Plug, Settings, Grid3X3,
  LayoutList, Plus, MoreHorizontal, ChevronLeft, X
} from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

type TrackType = 'audio' | 'midi';
type ViewMode = 'session' | 'arrangement';

interface Clip {
  id: string;
  name: string;
  color: string;
  hasContent: boolean;
  isPlaying: boolean;
  isRecording: boolean;
  length: number; // in bars
  waveform?: number[]; // simplified waveform data
}

interface Track {
  id: string;
  name: string;
  type: TrackType;
  color: string;
  clips: (Clip | null)[]; // null for empty slots
  volume: number;
  pan: number;
  isMuted: boolean;
  isSoloed: boolean;
  isArmed: boolean;
  devices: Device[];
}

interface Device {
  id: string;
  name: string;
  type: 'instrument' | 'audioEffect' | 'midiEffect';
  isEnabled: boolean;
}

interface Scene {
  id: string;
  name: string;
  tempo?: number;
}

interface BrowserCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  items: BrowserItem[];
}

interface BrowserItem {
  id: string;
  name: string;
  type: 'preset' | 'sample' | 'device';
}

interface ZAbletonLiveWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

// =============================================================================
// CONSTANTS & DEMO DATA
// =============================================================================

const CLIP_COLORS = [
  '#FF5500', '#FF8800', '#FFCC00', '#88CC00', '#00CC88',
  '#00CCFF', '#0088FF', '#5500FF', '#AA00FF', '#FF00AA',
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'
];

const generateWaveform = (): number[] => {
  return Array.from({ length: 32 }, () => Math.random() * 0.8 + 0.1);
};

const generateDemoTracks = (): Track[] => {
  const trackNames = [
    { name: 'Drums', type: 'midi' as TrackType, color: '#FF5500' },
    { name: 'Bass', type: 'midi' as TrackType, color: '#00CCFF' },
    { name: 'Synth Lead', type: 'midi' as TrackType, color: '#AA00FF' },
    { name: 'Pad', type: 'midi' as TrackType, color: '#00CC88' },
    { name: 'Guitar', type: 'audio' as TrackType, color: '#FFCC00' },
    { name: 'Vocals', type: 'audio' as TrackType, color: '#FF00AA' },
    { name: 'FX', type: 'audio' as TrackType, color: '#45B7D1' },
    { name: 'Perc', type: 'midi' as TrackType, color: '#96CEB4' },
  ];

  return trackNames.map((t, idx) => ({
    id: `track-${idx}`,
    name: t.name,
    type: t.type,
    color: t.color,
    clips: Array.from({ length: 8 }, (_, sceneIdx) => {
      if (Math.random() > 0.4) {
        return {
          id: `clip-${idx}-${sceneIdx}`,
          name: `${t.name} ${sceneIdx + 1}`,
          color: t.color,
          hasContent: true,
          isPlaying: false,
          isRecording: false,
          length: [1, 2, 4, 8][Math.floor(Math.random() * 4)],
          waveform: t.type === 'audio' ? generateWaveform() : undefined,
        };
      }
      return null;
    }),
    volume: 0.75 + Math.random() * 0.25,
    pan: (Math.random() - 0.5) * 0.4,
    isMuted: false,
    isSoloed: false,
    isArmed: idx === 5, // Vocals track armed by default
    devices: idx === 0 ? [
      { id: 'dev-1', name: 'Drum Rack', type: 'instrument', isEnabled: true },
      { id: 'dev-2', name: 'Compressor', type: 'audioEffect', isEnabled: true },
    ] : idx === 2 ? [
      { id: 'dev-3', name: 'Wavetable', type: 'instrument', isEnabled: true },
      { id: 'dev-4', name: 'Chorus', type: 'audioEffect', isEnabled: true },
      { id: 'dev-5', name: 'Delay', type: 'audioEffect', isEnabled: false },
    ] : [],
  }));
};

const generateScenes = (): Scene[] => {
  return Array.from({ length: 8 }, (_, idx) => ({
    id: `scene-${idx}`,
    name: idx === 0 ? 'Intro' : idx === 1 ? 'Verse' : idx === 2 ? 'Buildup' :
          idx === 3 ? 'Drop' : idx === 4 ? 'Breakdown' : idx === 5 ? 'Drop 2' :
          idx === 6 ? 'Outro' : `Scene ${idx + 1}`,
    tempo: idx === 3 || idx === 5 ? 128 : undefined,
  }));
};

const browserCategories: BrowserCategory[] = [
  {
    id: 'sounds',
    name: 'Sounds',
    icon: <Music className="w-4 h-4" />,
    items: [
      { id: 's1', name: 'Ambient Pad', type: 'preset' },
      { id: 's2', name: 'Analog Bass', type: 'preset' },
      { id: 's3', name: 'Bright Lead', type: 'preset' },
    ]
  },
  {
    id: 'drums',
    name: 'Drums',
    icon: <Drum className="w-4 h-4" />,
    items: [
      { id: 'd1', name: '808 Kit', type: 'preset' },
      { id: 'd2', name: 'Acoustic Kit', type: 'preset' },
      { id: 'd3', name: 'Electronic Kit', type: 'preset' },
    ]
  },
  {
    id: 'instruments',
    name: 'Instruments',
    icon: <Piano className="w-4 h-4" />,
    items: [
      { id: 'i1', name: 'Wavetable', type: 'device' },
      { id: 'i2', name: 'Operator', type: 'device' },
      { id: 'i3', name: 'Sampler', type: 'device' },
    ]
  },
  {
    id: 'audioEffects',
    name: 'Audio Effects',
    icon: <AudioWaveform className="w-4 h-4" />,
    items: [
      { id: 'ae1', name: 'Reverb', type: 'device' },
      { id: 'ae2', name: 'Delay', type: 'device' },
      { id: 'ae3', name: 'Compressor', type: 'device' },
      { id: 'ae4', name: 'EQ Eight', type: 'device' },
    ]
  },
  {
    id: 'midiEffects',
    name: 'MIDI Effects',
    icon: <Sparkles className="w-4 h-4" />,
    items: [
      { id: 'me1', name: 'Arpeggiator', type: 'device' },
      { id: 'me2', name: 'Chord', type: 'device' },
      { id: 'me3', name: 'Scale', type: 'device' },
    ]
  },
  {
    id: 'plugins',
    name: 'Plug-ins',
    icon: <Plug className="w-4 h-4" />,
    items: [
      { id: 'p1', name: 'Serum', type: 'device' },
      { id: 'p2', name: 'Massive X', type: 'device' },
      { id: 'p3', name: 'Kontakt', type: 'device' },
    ]
  },
];

// =============================================================================
// COMPONENTS
// =============================================================================

const VUMeter: React.FC<{ level: number; className?: string }> = ({ level, className }) => {
  const segments = 12;
  const activeSegments = Math.floor(level * segments);

  return (
    <div className={cn("flex flex-col-reverse gap-px", className)}>
      {Array.from({ length: segments }, (_, i) => (
        <div
          key={i}
          className={cn(
            "w-full h-1 rounded-sm transition-colors",
            i < activeSegments
              ? i >= segments - 2 ? "bg-red-500" : i >= segments - 4 ? "bg-yellow-500" : "bg-green-500"
              : "bg-white/10"
          )}
        />
      ))}
    </div>
  );
};

const ClipSlot: React.FC<{
  clip: Clip | null;
  isSelected: boolean;
  onSelect: () => void;
  onPlay: () => void;
  trackType: TrackType;
}> = ({ clip, isSelected, onSelect, onPlay, trackType }) => {
  if (!clip) {
    return (
      <div
        onClick={onSelect}
        className={cn(
          "h-16 border border-white/5 rounded-sm flex items-center justify-center",
          "hover:border-white/20 transition-colors cursor-pointer",
          isSelected && "border-orange-500"
        )}
      >
        <div className="w-2 h-2 rounded-full border border-white/20" />
      </div>
    );
  }

  return (
    <div
      onClick={onSelect}
      onDoubleClick={onPlay}
      className={cn(
        "h-16 rounded-sm p-1 flex flex-col cursor-pointer transition-all relative overflow-hidden",
        isSelected && "ring-1 ring-orange-500",
        clip.isPlaying && "ring-2 ring-green-500"
      )}
      style={{ backgroundColor: clip.color + '40' }}
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{ backgroundColor: clip.color }}
      />

      {/* Waveform or MIDI visualization */}
      <div className="flex-1 relative z-10 flex items-end gap-px px-0.5">
        {trackType === 'audio' && clip.waveform ? (
          clip.waveform.map((v, i) => (
            <div
              key={i}
              className="flex-1 bg-white/60 rounded-t-sm"
              style={{ height: `${v * 100}%` }}
            />
          ))
        ) : (
          // MIDI note visualization
          <div className="flex-1 flex items-center justify-center">
            <div className="flex gap-0.5">
              {[0.6, 0.8, 0.5, 0.9, 0.7].map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-white/60 rounded-sm"
                  style={{ height: `${h * 30}px` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <span className="text-[9px] text-white truncate relative z-10 mt-0.5 font-medium">
        {clip.name}
      </span>

      {clip.isPlaying && (
        <div className="absolute top-1 left-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      )}
    </div>
  );
};

const TrackHeader: React.FC<{
  track: Track;
  isSelected: boolean;
  onSelect: () => void;
  onToggleMute: () => void;
  onToggleSolo: () => void;
  onToggleArm: () => void;
}> = ({ track, isSelected, onSelect, onToggleMute, onToggleSolo, onToggleArm }) => {
  return (
    <div
      onClick={onSelect}
      className={cn(
        "p-2 border-b border-white/5 cursor-pointer transition-colors",
        isSelected ? "bg-white/10" : "hover:bg-white/5"
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-2 h-8 rounded-sm"
          style={{ backgroundColor: track.color }}
        />
        <div className="flex-1 min-w-0">
          <span className="text-xs font-medium text-white truncate block">
            {track.name}
          </span>
          <span className="text-[10px] text-white/40">
            {track.type === 'midi' ? 'MIDI' : 'Audio'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={(e) => { e.stopPropagation(); onToggleArm(); }}
          className={cn(
            "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors",
            track.isArmed ? "bg-red-500 text-white" : "bg-white/10 text-white/40 hover:bg-white/20"
          )}
        >
          <Circle className="w-3 h-3" fill={track.isArmed ? "currentColor" : "none"} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleSolo(); }}
          className={cn(
            "w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold transition-colors",
            track.isSoloed ? "bg-yellow-500 text-black" : "bg-white/10 text-white/40 hover:bg-white/20"
          )}
        >
          S
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleMute(); }}
          className={cn(
            "w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold transition-colors",
            track.isMuted ? "bg-orange-500 text-black" : "bg-white/10 text-white/40 hover:bg-white/20"
          )}
        >
          M
        </button>
      </div>
    </div>
  );
};

const TrackMixer: React.FC<{
  track: Track;
  onVolumeChange: (volume: number) => void;
  onPanChange: (pan: number) => void;
}> = ({ track, onVolumeChange, onPanChange }) => {
  return (
    <div className="flex flex-col items-center gap-2 p-2 bg-[#1a1a1a] rounded min-w-[60px]">
      <span className="text-[9px] text-white/60 truncate max-w-full">{track.name}</span>

      <div className="flex gap-1 h-24">
        <VUMeter level={track.isMuted ? 0 : track.volume * (0.5 + Math.random() * 0.5)} className="w-2" />
        <VUMeter level={track.isMuted ? 0 : track.volume * (0.5 + Math.random() * 0.5)} className="w-2" />
      </div>

      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={track.volume}
        onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
        className="w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2
          [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white
          [&::-webkit-slider-thumb]:rounded-sm [&::-webkit-slider-thumb]:cursor-pointer
          rotate-[-90deg]"
        style={{ width: '80px', marginTop: '30px', marginBottom: '30px' }}
      />

      <div className="text-[10px] text-white/60">
        {track.volume >= 1 ? '0.0' : `-${((1 - track.volume) * 60).toFixed(1)}`} dB
      </div>

      <div className="flex items-center gap-1 text-[10px]">
        <span className="text-white/40">L</span>
        <input
          type="range"
          min="-1"
          max="1"
          step="0.01"
          value={track.pan}
          onChange={(e) => onPanChange(parseFloat(e.target.value))}
          className="w-12 h-1 bg-white/20 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2
            [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:bg-orange-500
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
        />
        <span className="text-white/40">R</span>
      </div>
    </div>
  );
};

const DeviceChain: React.FC<{
  track: Track | null;
  onToggleDevice: (deviceId: string) => void;
}> = ({ track, onToggleDevice }) => {
  if (!track || track.devices.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-white/30 text-sm">
        <span>Drop an instrument or effect here</span>
      </div>
    );
  }

  return (
    <div className="flex gap-2 p-2 h-full overflow-x-auto">
      {track.devices.map((device) => (
        <div
          key={device.id}
          className={cn(
            "flex-shrink-0 w-48 h-full rounded-lg p-3 flex flex-col",
            device.isEnabled ? "bg-[#2a2a2a]" : "bg-[#1a1a1a] opacity-50"
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleDevice(device.id)}
                className={cn(
                  "w-4 h-4 rounded-sm flex items-center justify-center",
                  device.isEnabled ? "bg-orange-500" : "bg-white/20"
                )}
              >
                {device.isEnabled && <div className="w-2 h-2 bg-white rounded-sm" />}
              </button>
              <span className="text-xs font-medium text-white">{device.name}</span>
            </div>
            <button className="text-white/40 hover:text-white">
              <X className="w-3 h-3" />
            </button>
          </div>

          {/* Mock device controls */}
          <div className="flex-1 grid grid-cols-3 gap-2">
            {['Mix', 'Time', 'Fdbk'].map((param) => (
              <div key={param} className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-white/10 flex items-center justify-center">
                  <div className="w-1 h-3 bg-orange-500 rounded-full transform -rotate-45" />
                </div>
                <span className="text-[8px] text-white/40 mt-1">{param}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const Browser: React.FC<{
  isOpen: boolean;
  selectedCategory: string | null;
  onSelectCategory: (id: string) => void;
  onClose: () => void;
}> = ({ isOpen, selectedCategory, onSelectCategory, onClose }) => {
  if (!isOpen) return null;

  const category = browserCategories.find(c => c.id === selectedCategory);

  return (
    <div className="w-56 bg-[#1a1a1a] border-r border-white/5 flex flex-col">
      <div className="flex items-center justify-between p-2 border-b border-white/5">
        <span className="text-xs font-medium text-white/70">Browser</span>
        <button onClick={onClose} className="text-white/40 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Categories */}
        <div className="w-24 border-r border-white/5 overflow-y-auto">
          {browserCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={cn(
                "w-full px-2 py-2 flex items-center gap-2 text-left transition-colors",
                selectedCategory === cat.id
                  ? "bg-orange-500/20 text-orange-500"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              {cat.icon}
              <span className="text-[10px] truncate">{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-1">
          {category?.items.map((item) => (
            <div
              key={item.id}
              className="px-2 py-1.5 text-xs text-white/70 hover:bg-white/5 rounded cursor-pointer"
              draggable
            >
              {item.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const ZAbletonLiveWindow: React.FC<ZAbletonLiveWindowProps> = ({ onClose, onFocus }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('session');
  const [tracks, setTracks] = useState<Track[]>(generateDemoTracks);
  const [scenes] = useState<Scene[]>(generateScenes);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>('track-0');
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isLooping, setIsLooping] = useState(true);
  const [tempo, setTempo] = useState(120);
  const [timeSignature] = useState({ numerator: 4, denominator: 4 });
  const [playingSceneIdx, setPlayingSceneIdx] = useState<number | null>(null);
  const [browserOpen, setBrowserOpen] = useState(true);
  const [browserCategory, setBrowserCategory] = useState<string | null>('sounds');
  const [showMixer, setShowMixer] = useState(true);

  const selectedTrack = useMemo(
    () => tracks.find(t => t.id === selectedTrackId) || null,
    [tracks, selectedTrackId]
  );

  const masterLevel = useMemo(() => {
    if (!isPlaying) return 0;
    const activeLevel = tracks
      .filter(t => !t.isMuted)
      .reduce((sum, t) => sum + t.volume, 0) / tracks.length;
    return activeLevel * (0.7 + Math.random() * 0.3);
  }, [isPlaying, tracks]);

  const toggleTrackMute = useCallback((trackId: string) => {
    setTracks(prev => prev.map(t =>
      t.id === trackId ? { ...t, isMuted: !t.isMuted } : t
    ));
  }, []);

  const toggleTrackSolo = useCallback((trackId: string) => {
    setTracks(prev => prev.map(t =>
      t.id === trackId ? { ...t, isSoloed: !t.isSoloed } : t
    ));
  }, []);

  const toggleTrackArm = useCallback((trackId: string) => {
    setTracks(prev => prev.map(t =>
      t.id === trackId ? { ...t, isArmed: !t.isArmed } : t
    ));
  }, []);

  const setTrackVolume = useCallback((trackId: string, volume: number) => {
    setTracks(prev => prev.map(t =>
      t.id === trackId ? { ...t, volume } : t
    ));
  }, []);

  const setTrackPan = useCallback((trackId: string, pan: number) => {
    setTracks(prev => prev.map(t =>
      t.id === trackId ? { ...t, pan } : t
    ));
  }, []);

  const toggleDeviceEnabled = useCallback((deviceId: string) => {
    setTracks(prev => prev.map(t => ({
      ...t,
      devices: t.devices.map(d =>
        d.id === deviceId ? { ...d, isEnabled: !d.isEnabled } : d
      )
    })));
  }, []);

  const playScene = useCallback((sceneIdx: number) => {
    setPlayingSceneIdx(sceneIdx);
    setIsPlaying(true);
    setTracks(prev => prev.map(t => ({
      ...t,
      clips: t.clips.map((c, idx) =>
        c ? { ...c, isPlaying: idx === sceneIdx } : null
      )
    })));
  }, []);

  const stopAll = useCallback(() => {
    setIsPlaying(false);
    setPlayingSceneIdx(null);
    setTracks(prev => prev.map(t => ({
      ...t,
      clips: t.clips.map(c => c ? { ...c, isPlaying: false } : null)
    })));
  }, []);

  return (
    <ZWindow
      title="Ableton Live"
      onClose={onClose}
      onFocus={onFocus}
      defaultWidth={1200}
      defaultHeight={800}
      minWidth={900}
      minHeight={600}
      defaultPosition={{ x: 80, y: 40 }}
    >
      <div className="flex flex-col h-full bg-[#1e1e1e] text-white select-none">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-2 py-1 bg-[#2a2a2a] border-b border-white/5">
          {/* Left: View toggles */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setViewMode('session')}
              className={cn(
                "px-2 py-1 rounded text-xs font-medium transition-colors",
                viewMode === 'session' ? "bg-orange-500 text-white" : "text-white/60 hover:text-white"
              )}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('arrangement')}
              className={cn(
                "px-2 py-1 rounded text-xs font-medium transition-colors",
                viewMode === 'arrangement' ? "bg-orange-500 text-white" : "text-white/60 hover:text-white"
              )}
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-white/10 mx-2" />
            <button
              onClick={() => setBrowserOpen(!browserOpen)}
              className={cn(
                "px-2 py-1 rounded text-xs transition-colors",
                browserOpen ? "text-orange-500" : "text-white/60 hover:text-white"
              )}
            >
              <FolderOpen className="w-4 h-4" />
            </button>
          </div>

          {/* Center: Transport */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 mr-4">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={cn(
                  "p-2 rounded transition-colors",
                  isPlaying ? "bg-green-500 text-white" : "bg-white/10 text-white hover:bg-white/20"
                )}
              >
                <Play className="w-4 h-4" fill={isPlaying ? "currentColor" : "none"} />
              </button>
              <button
                onClick={stopAll}
                className="p-2 rounded bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <Square className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsRecording(!isRecording)}
                className={cn(
                  "p-2 rounded transition-colors",
                  isRecording ? "bg-red-500 text-white" : "bg-white/10 text-white hover:bg-white/20"
                )}
              >
                <Circle className="w-4 h-4" fill={isRecording ? "currentColor" : "none"} />
              </button>
            </div>

            <button
              onClick={() => setIsLooping(!isLooping)}
              className={cn(
                "p-1 rounded transition-colors",
                isLooping ? "text-orange-500" : "text-white/40 hover:text-white"
              )}
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 px-3 py-1 bg-[#1a1a1a] rounded">
              <span className="text-xs text-white/40">BPM</span>
              <input
                type="number"
                value={tempo}
                onChange={(e) => setTempo(parseInt(e.target.value) || 120)}
                className="w-12 bg-transparent text-sm font-mono text-orange-500 outline-none text-center"
              />
            </div>

            <div className="px-2 py-1 bg-[#1a1a1a] rounded text-xs text-white/60 font-mono">
              {timeSignature.numerator}/{timeSignature.denominator}
            </div>

            <div className="px-3 py-1 bg-[#1a1a1a] rounded text-sm font-mono text-white">
              {isPlaying ? '1.2.3' : '1.1.1'}
            </div>
          </div>

          {/* Right: Master & utilities */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMixer(!showMixer)}
              className={cn(
                "px-2 py-1 rounded text-xs transition-colors",
                showMixer ? "text-orange-500" : "text-white/60 hover:text-white"
              )}
            >
              <Sliders className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1 px-2 py-1 bg-[#1a1a1a] rounded">
              <span className="text-[10px] text-white/40">Master</span>
              <VUMeter level={masterLevel} className="w-2 h-4" />
              <VUMeter level={masterLevel * 0.95} className="w-2 h-4" />
            </div>
            <button className="p-1 text-white/40 hover:text-white">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Browser Sidebar */}
          <Browser
            isOpen={browserOpen}
            selectedCategory={browserCategory}
            onSelectCategory={setBrowserCategory}
            onClose={() => setBrowserOpen(false)}
          />

          {/* Session/Arrangement View */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {viewMode === 'session' ? (
              /* Session View */
              <div className="flex-1 flex overflow-hidden">
                {/* Track Headers + Clip Grid */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Track Names Row */}
                  <div className="flex border-b border-white/5 bg-[#252525]">
                    <div className="w-20 p-2 border-r border-white/5" />
                    {tracks.map((track) => (
                      <div
                        key={track.id}
                        className={cn(
                          "w-24 flex-shrink-0 p-1 border-r border-white/5 cursor-pointer",
                          selectedTrackId === track.id && "bg-white/5"
                        )}
                        onClick={() => setSelectedTrackId(track.id)}
                      >
                        <div className="flex items-center gap-1">
                          <div
                            className="w-2 h-6 rounded-sm"
                            style={{ backgroundColor: track.color }}
                          />
                          <span className="text-[10px] text-white/80 truncate">{track.name}</span>
                        </div>
                        <div className="flex gap-0.5 mt-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleTrackArm(track.id); }}
                            className={cn(
                              "w-4 h-4 rounded-full flex items-center justify-center",
                              track.isArmed ? "bg-red-500" : "bg-white/10"
                            )}
                          >
                            <Circle className="w-2 h-2" fill={track.isArmed ? "white" : "none"} stroke={track.isArmed ? "white" : "#666"} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleTrackSolo(track.id); }}
                            className={cn(
                              "w-4 h-4 rounded text-[8px] font-bold flex items-center justify-center",
                              track.isSoloed ? "bg-yellow-500 text-black" : "bg-white/10 text-white/40"
                            )}
                          >
                            S
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleTrackMute(track.id); }}
                            className={cn(
                              "w-4 h-4 rounded text-[8px] font-bold flex items-center justify-center",
                              track.isMuted ? "bg-orange-500 text-black" : "bg-white/10 text-white/40"
                            )}
                          >
                            M
                          </button>
                        </div>
                      </div>
                    ))}
                    {/* Master track */}
                    <div className="w-20 flex-shrink-0 p-1 bg-[#2a2a2a]">
                      <span className="text-[10px] text-orange-500 font-medium">Master</span>
                    </div>
                  </div>

                  {/* Clip Grid */}
                  <div className="flex-1 overflow-auto">
                    {scenes.map((scene, sceneIdx) => (
                      <div key={scene.id} className="flex border-b border-white/5">
                        {/* Scene launcher */}
                        <div className="w-20 p-2 border-r border-white/5 flex items-center justify-between bg-[#1a1a1a]">
                          <span className="text-[10px] text-white/60 truncate">{scene.name}</span>
                          <button
                            onClick={() => playScene(sceneIdx)}
                            className={cn(
                              "w-5 h-5 rounded flex items-center justify-center transition-colors",
                              playingSceneIdx === sceneIdx
                                ? "bg-green-500 text-white"
                                : "bg-white/10 text-white/60 hover:bg-white/20"
                            )}
                          >
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Clips */}
                        {tracks.map((track) => (
                          <div
                            key={`${track.id}-${sceneIdx}`}
                            className={cn(
                              "w-24 flex-shrink-0 p-0.5 border-r border-white/5",
                              selectedTrackId === track.id && "bg-white/5"
                            )}
                          >
                            <ClipSlot
                              clip={track.clips[sceneIdx]}
                              isSelected={selectedClipId === track.clips[sceneIdx]?.id}
                              onSelect={() => {
                                setSelectedTrackId(track.id);
                                setSelectedClipId(track.clips[sceneIdx]?.id || null);
                              }}
                              onPlay={() => {
                                if (track.clips[sceneIdx]) {
                                  playScene(sceneIdx);
                                }
                              }}
                              trackType={track.type}
                            />
                          </div>
                        ))}

                        {/* Master scene info */}
                        <div className="w-20 flex-shrink-0 p-2 bg-[#1a1a1a] flex items-center">
                          {scene.tempo && (
                            <span className="text-[10px] text-orange-500/60">{scene.tempo} BPM</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Arrangement View */
              <div className="flex-1 flex flex-col overflow-hidden bg-[#1a1a1a]">
                <div className="p-4 text-center text-white/40">
                  <LayoutList className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Arrangement View</p>
                  <p className="text-xs text-white/20">Timeline-based editing</p>
                </div>
              </div>
            )}

            {/* Mixer (collapsible) */}
            {showMixer && (
              <div className="h-40 border-t border-white/5 bg-[#1a1a1a] flex overflow-x-auto">
                {tracks.map((track) => (
                  <TrackMixer
                    key={track.id}
                    track={track}
                    onVolumeChange={(v) => setTrackVolume(track.id, v)}
                    onPanChange={(p) => setTrackPan(track.id, p)}
                  />
                ))}
                {/* Master mixer */}
                <div className="flex flex-col items-center gap-2 p-2 bg-[#252525] rounded min-w-[60px]">
                  <span className="text-[9px] text-orange-500 font-medium">Master</span>
                  <div className="flex gap-1 h-24">
                    <VUMeter level={masterLevel} className="w-3" />
                    <VUMeter level={masterLevel * 0.95} className="w-3" />
                  </div>
                  <div className="text-[10px] text-white/60">0.0 dB</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Device Chain (bottom panel) */}
        <div className="h-24 border-t border-white/5 bg-[#1a1a1a]">
          <DeviceChain
            track={selectedTrack}
            onToggleDevice={toggleDeviceEnabled}
          />
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between px-2 py-1 bg-[#2a2a2a] border-t border-white/5 text-[10px] text-white/40">
          <div className="flex items-center gap-4">
            <span>CPU: 12%</span>
            <span>Disk: 3%</span>
            <span>MIDI: In</span>
          </div>
          <div className="flex items-center gap-4">
            <span>{tracks.length} Tracks</span>
            <span>{scenes.length} Scenes</span>
            <span>48000 Hz / 24-bit</span>
          </div>
        </div>
      </div>
    </ZWindow>
  );
};

export default ZAbletonLiveWindow;
