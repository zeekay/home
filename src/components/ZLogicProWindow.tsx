import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import ZWindow from './ZWindow';
import { cn } from '@/lib/utils';
import {
  Play, Pause, SkipBack, SkipForward, Square, Circle, Repeat,
  Volume2, VolumeX, Headphones, Music, Piano, Mic2, Guitar,
  Drum, Waves, Sliders, Settings, Folder, FolderOpen,
  ChevronRight, ChevronDown, Plus, Minus, MoreHorizontal,
  Maximize2, Minimize2, Grid3X3, Layers, Scissors, MousePointer2,
  Pencil, Eraser, Move, ZoomIn, ZoomOut, Lock, Unlock,
  Bookmark, Flag, Clock, Timer, Gauge, Activity,
  LayoutGrid, PanelLeft, PanelBottom, SplitSquareVertical,
  ListMusic, Library, Wand2, Sparkles, Copy, Trash2, Download
} from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

interface Track {
  id: string;
  name: string;
  type: 'audio' | 'software' | 'drummer' | 'midi';
  color: string;
  icon: 'piano' | 'guitar' | 'drums' | 'synth' | 'vocal' | 'strings' | 'bass' | 'fx';
  armed: boolean;
  solo: boolean;
  muted: boolean;
  volume: number;
  pan: number;
  regions: Region[];
  automation: AutomationLane[];
  inputMonitor: boolean;
  frozen: boolean;
}

interface Region {
  id: string;
  name: string;
  startBeat: number;
  lengthBeats: number;
  color: string;
  looped: boolean;
  muted: boolean;
  notes?: MidiNote[];
}

interface MidiNote {
  pitch: number;
  startBeat: number;
  duration: number;
  velocity: number;
}

interface AutomationLane {
  id: string;
  parameter: string;
  visible: boolean;
  points: AutomationPoint[];
}

interface AutomationPoint {
  beat: number;
  value: number;
  curve: 'linear' | 'curve' | 'step';
}

interface Marker {
  id: string;
  beat: number;
  name: string;
  color: string;
}

interface LoopItem {
  id: string;
  name: string;
  category: string;
  bpm: number;
  key: string;
  duration: number;
  favorite: boolean;
}

interface Patch {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  icon: string;
}

type ViewMode = 'tracks' | 'mixer' | 'pianoRoll' | 'smartControls';
type ToolType = 'pointer' | 'pencil' | 'scissors' | 'eraser' | 'zoom' | 'move';
type LibraryTab = 'patches' | 'loops';

interface ZLogicProWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const TRACK_COLORS = [
  '#FF5F57', '#FEBC2E', '#28CD41', '#007AFF', '#5856D6',
  '#FF2D55', '#FF9500', '#34C759', '#5AC8FA', '#AF52DE',
];

const TRACK_ICONS: Record<Track['icon'], React.FC<{ className?: string }>> = {
  piano: Piano,
  guitar: Guitar,
  drums: Drum,
  synth: Waves,
  vocal: Mic2,
  strings: Music,
  bass: Guitar,
  fx: Sparkles,
};

const DEFAULT_TRACKS: Track[] = [
  {
    id: 'track-1',
    name: 'Piano',
    type: 'software',
    color: '#007AFF',
    icon: 'piano',
    armed: false,
    solo: false,
    muted: false,
    volume: 0.8,
    pan: 0,
    inputMonitor: false,
    frozen: false,
    regions: [
      { id: 'r1', name: 'Piano Intro', startBeat: 0, lengthBeats: 16, color: '#007AFF', looped: false, muted: false },
      { id: 'r2', name: 'Piano Verse', startBeat: 32, lengthBeats: 32, color: '#007AFF', looped: false, muted: false },
    ],
    automation: [],
  },
  {
    id: 'track-2',
    name: 'Bass',
    type: 'software',
    color: '#FF9500',
    icon: 'bass',
    armed: false,
    solo: false,
    muted: false,
    volume: 0.75,
    pan: 0,
    inputMonitor: false,
    frozen: false,
    regions: [
      { id: 'r3', name: 'Bass Line', startBeat: 16, lengthBeats: 48, color: '#FF9500', looped: true, muted: false },
    ],
    automation: [],
  },
  {
    id: 'track-3',
    name: 'Drums',
    type: 'drummer',
    color: '#FF2D55',
    icon: 'drums',
    armed: false,
    solo: false,
    muted: false,
    volume: 0.85,
    pan: 0,
    inputMonitor: false,
    frozen: false,
    regions: [
      { id: 'r4', name: 'Beat 1', startBeat: 0, lengthBeats: 64, color: '#FF2D55', looped: false, muted: false },
    ],
    automation: [],
  },
  {
    id: 'track-4',
    name: 'Synth Lead',
    type: 'software',
    color: '#5856D6',
    icon: 'synth',
    armed: true,
    solo: false,
    muted: false,
    volume: 0.7,
    pan: 0,
    inputMonitor: true,
    frozen: false,
    regions: [
      { id: 'r5', name: 'Lead Melody', startBeat: 48, lengthBeats: 16, color: '#5856D6', looped: false, muted: false },
    ],
    automation: [
      {
        id: 'auto-1',
        parameter: 'Volume',
        visible: true,
        points: [
          { beat: 0, value: 0.7, curve: 'linear' },
          { beat: 32, value: 0.9, curve: 'curve' },
          { beat: 64, value: 0.7, curve: 'linear' },
        ],
      },
    ],
  },
  {
    id: 'track-5',
    name: 'Vocals',
    type: 'audio',
    color: '#34C759',
    icon: 'vocal',
    armed: false,
    solo: false,
    muted: false,
    volume: 0.9,
    pan: 0,
    inputMonitor: false,
    frozen: false,
    regions: [
      { id: 'r6', name: 'Verse 1', startBeat: 16, lengthBeats: 32, color: '#34C759', looped: false, muted: false },
      { id: 'r7', name: 'Chorus', startBeat: 64, lengthBeats: 32, color: '#34C759', looped: false, muted: false },
    ],
    automation: [],
  },
];

const DEFAULT_MARKERS: Marker[] = [
  { id: 'm1', beat: 0, name: 'Intro', color: '#FF5F57' },
  { id: 'm2', beat: 16, name: 'Verse 1', color: '#28CD41' },
  { id: 'm3', beat: 48, name: 'Chorus', color: '#007AFF' },
  { id: 'm4', beat: 80, name: 'Verse 2', color: '#28CD41' },
];

const DEMO_LOOPS: LoopItem[] = [
  { id: 'loop1', name: 'Acoustic Strumming', category: 'Guitars', bpm: 120, key: 'C', duration: 8, favorite: true },
  { id: 'loop2', name: 'Indie Rock Beat', category: 'Drums', bpm: 120, key: '-', duration: 4, favorite: false },
  { id: 'loop3', name: 'Synth Pad Evolving', category: 'Synths', bpm: 120, key: 'Am', duration: 16, favorite: true },
  { id: 'loop4', name: 'Electric Bass Groove', category: 'Bass', bpm: 120, key: 'C', duration: 4, favorite: false },
  { id: 'loop5', name: 'Piano Ballad', category: 'Keyboards', bpm: 80, key: 'F', duration: 8, favorite: false },
  { id: 'loop6', name: 'Vocal Ooh Aah', category: 'Vocals', bpm: 120, key: 'C', duration: 4, favorite: true },
  { id: 'loop7', name: 'String Ensemble', category: 'Orchestral', bpm: 90, key: 'D', duration: 8, favorite: false },
  { id: 'loop8', name: 'Hip Hop Beat', category: 'Drums', bpm: 95, key: '-', duration: 4, favorite: true },
];

const DEMO_PATCHES: Patch[] = [
  { id: 'p1', name: 'Grand Piano', category: 'Keyboards', subcategory: 'Acoustic Pianos', icon: 'piano' },
  { id: 'p2', name: 'Electric Piano', category: 'Keyboards', subcategory: 'Electric Pianos', icon: 'piano' },
  { id: 'p3', name: 'Warm Pad', category: 'Synths', subcategory: 'Pads', icon: 'synth' },
  { id: 'p4', name: 'Lead Synth', category: 'Synths', subcategory: 'Leads', icon: 'synth' },
  { id: 'p5', name: 'Fingerstyle Bass', category: 'Bass', subcategory: 'Electric Bass', icon: 'bass' },
  { id: 'p6', name: 'Slap Bass', category: 'Bass', subcategory: 'Electric Bass', icon: 'bass' },
  { id: 'p7', name: 'Nylon Guitar', category: 'Guitars', subcategory: 'Acoustic', icon: 'guitar' },
  { id: 'p8', name: 'Distorted Guitar', category: 'Guitars', subcategory: 'Electric', icon: 'guitar' },
];

const BEAT_WIDTH = 20; // pixels per beat

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function formatTime(beats: number, bpm: number): string {
  const totalSeconds = (beats / bpm) * 60;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const frames = Math.floor((totalSeconds % 1) * 30);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
}

function formatBars(beats: number): string {
  const bars = Math.floor(beats / 4) + 1;
  const beat = (beats % 4) + 1;
  return `${bars}.${beat}.1`;
}

// =============================================================================
// SUBCOMPONENTS
// =============================================================================

// Transport Bar LCD Display
const LCDDisplay: React.FC<{
  isPlaying: boolean;
  currentBeat: number;
  bpm: number;
  timeSignature: string;
  key: string;
}> = ({ isPlaying, currentBeat, bpm, timeSignature, key }) => (
  <div className="flex items-center gap-4 px-4 py-2 bg-black rounded-lg border border-white/10">
    <div className="flex flex-col items-center min-w-[100px]">
      <span className="text-[10px] text-white/40 uppercase tracking-wider">Position</span>
      <span className="text-lg font-mono text-green-400 tabular-nums">{formatBars(currentBeat)}</span>
    </div>
    <div className="w-px h-8 bg-white/10" />
    <div className="flex flex-col items-center min-w-[80px]">
      <span className="text-[10px] text-white/40 uppercase tracking-wider">Time</span>
      <span className="text-lg font-mono text-green-400 tabular-nums">{formatTime(currentBeat, bpm)}</span>
    </div>
    <div className="w-px h-8 bg-white/10" />
    <div className="flex flex-col items-center">
      <span className="text-[10px] text-white/40 uppercase tracking-wider">Tempo</span>
      <span className="text-lg font-mono text-white tabular-nums">{bpm}</span>
    </div>
    <div className="w-px h-8 bg-white/10" />
    <div className="flex flex-col items-center">
      <span className="text-[10px] text-white/40 uppercase tracking-wider">Time Sig</span>
      <span className="text-lg font-mono text-white">{timeSignature}</span>
    </div>
    <div className="w-px h-8 bg-white/10" />
    <div className="flex flex-col items-center">
      <span className="text-[10px] text-white/40 uppercase tracking-wider">Key</span>
      <span className="text-lg font-mono text-white">{key}</span>
    </div>
  </div>
);

// Transport Controls
const TransportBar: React.FC<{
  isPlaying: boolean;
  isRecording: boolean;
  isLooping: boolean;
  currentBeat: number;
  bpm: number;
  timeSignature: string;
  projectKey: string;
  onPlay: () => void;
  onStop: () => void;
  onRecord: () => void;
  onRewind: () => void;
  onForward: () => void;
  onLoopToggle: () => void;
}> = ({
  isPlaying, isRecording, isLooping, currentBeat, bpm, timeSignature, projectKey,
  onPlay, onStop, onRecord, onRewind, onForward, onLoopToggle
}) => (
  <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-b from-[#3a3a3a] to-[#2a2a2a] border-b border-black/50">
    <div className="flex items-center gap-2">
      <button
        onClick={onRewind}
        className="p-2 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors"
      >
        <SkipBack className="w-4 h-4" />
      </button>
      <button
        onClick={onPlay}
        className={cn(
          "p-2 rounded transition-colors",
          isPlaying ? "bg-green-500/20 text-green-400" : "hover:bg-white/10 text-white/70 hover:text-white"
        )}
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </button>
      <button
        onClick={onStop}
        className="p-2 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors"
      >
        <Square className="w-4 h-4" />
      </button>
      <button
        onClick={onForward}
        className="p-2 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors"
      >
        <SkipForward className="w-4 h-4" />
      </button>
      <button
        onClick={onRecord}
        className={cn(
          "p-2 rounded transition-colors",
          isRecording ? "bg-red-500/20 text-red-500 animate-pulse" : "hover:bg-white/10 text-white/70 hover:text-white"
        )}
      >
        <Circle className={cn("w-4 h-4", isRecording && "fill-current")} />
      </button>
      <div className="w-px h-6 bg-white/10 mx-2" />
      <button
        onClick={onLoopToggle}
        className={cn(
          "p-2 rounded transition-colors",
          isLooping ? "bg-yellow-500/20 text-yellow-400" : "hover:bg-white/10 text-white/70 hover:text-white"
        )}
      >
        <Repeat className="w-4 h-4" />
      </button>
    </div>

    <LCDDisplay
      isPlaying={isPlaying}
      currentBeat={currentBeat}
      bpm={bpm}
      timeSignature={timeSignature}
      key={projectKey}
    />

    <div className="flex items-center gap-2">
      <button className="p-2 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors">
        <Gauge className="w-4 h-4" />
      </button>
      <button className="p-2 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors">
        <Activity className="w-4 h-4" />
      </button>
    </div>
  </div>
);

// Toolbar with Tool Selector
const Toolbar: React.FC<{
  currentTool: ToolType;
  onToolChange: (tool: ToolType) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  showLibrary: boolean;
  showInspector: boolean;
  onToggleLibrary: () => void;
  onToggleInspector: () => void;
}> = ({
  currentTool, onToolChange, viewMode, onViewModeChange,
  showLibrary, showInspector, onToggleLibrary, onToggleInspector
}) => {
  const tools: { id: ToolType; icon: React.FC<{ className?: string }>; label: string }[] = [
    { id: 'pointer', icon: MousePointer2, label: 'Pointer' },
    { id: 'pencil', icon: Pencil, label: 'Pencil' },
    { id: 'scissors', icon: Scissors, label: 'Scissors' },
    { id: 'eraser', icon: Eraser, label: 'Eraser' },
    { id: 'zoom', icon: ZoomIn, label: 'Zoom' },
    { id: 'move', icon: Move, label: 'Marquee' },
  ];

  return (
    <div className="flex items-center justify-between px-2 py-1 bg-gradient-to-b from-[#4a4a4a] to-[#3a3a3a] border-b border-black/50">
      <div className="flex items-center gap-1">
        <button
          onClick={onToggleLibrary}
          className={cn(
            "p-1.5 rounded transition-colors",
            showLibrary ? "bg-white/10 text-white" : "text-white/50 hover:text-white hover:bg-white/5"
          )}
          title="Library"
        >
          <Library className="w-4 h-4" />
        </button>
        <button
          onClick={onToggleInspector}
          className={cn(
            "p-1.5 rounded transition-colors",
            showInspector ? "bg-white/10 text-white" : "text-white/50 hover:text-white hover:bg-white/5"
          )}
          title="Inspector"
        >
          <PanelLeft className="w-4 h-4" />
        </button>
        <div className="w-px h-5 bg-white/10 mx-1" />

        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onToolChange(tool.id)}
            className={cn(
              "p-1.5 rounded transition-colors",
              currentTool === tool.id
                ? "bg-blue-500/30 text-blue-400"
                : "text-white/50 hover:text-white hover:bg-white/5"
            )}
            title={tool.label}
          >
            <tool.icon className="w-4 h-4" />
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1 bg-black/30 rounded p-0.5">
        <button
          onClick={() => onViewModeChange('tracks')}
          className={cn(
            "px-3 py-1 rounded text-xs font-medium transition-colors",
            viewMode === 'tracks' ? "bg-white/10 text-white" : "text-white/50 hover:text-white"
          )}
        >
          Tracks
        </button>
        <button
          onClick={() => onViewModeChange('mixer')}
          className={cn(
            "px-3 py-1 rounded text-xs font-medium transition-colors",
            viewMode === 'mixer' ? "bg-white/10 text-white" : "text-white/50 hover:text-white"
          )}
        >
          Mixer
        </button>
        <button
          onClick={() => onViewModeChange('pianoRoll')}
          className={cn(
            "px-3 py-1 rounded text-xs font-medium transition-colors",
            viewMode === 'pianoRoll' ? "bg-white/10 text-white" : "text-white/50 hover:text-white"
          )}
        >
          Piano Roll
        </button>
        <button
          onClick={() => onViewModeChange('smartControls')}
          className={cn(
            "px-3 py-1 rounded text-xs font-medium transition-colors",
            viewMode === 'smartControls' ? "bg-white/10 text-white" : "text-white/50 hover:text-white"
          )}
        >
          Smart Controls
        </button>
      </div>

      <div className="flex items-center gap-1">
        <button className="p-1.5 rounded text-white/50 hover:text-white hover:bg-white/5 transition-colors">
          <Grid3X3 className="w-4 h-4" />
        </button>
        <button className="p-1.5 rounded text-white/50 hover:text-white hover:bg-white/5 transition-colors">
          <Layers className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Track Header
const TrackHeader: React.FC<{
  track: Track;
  isSelected: boolean;
  onSelect: () => void;
  onToggleArm: () => void;
  onToggleSolo: () => void;
  onToggleMute: () => void;
  onVolumeChange: (volume: number) => void;
}> = ({ track, isSelected, onSelect, onToggleArm, onToggleSolo, onToggleMute, onVolumeChange }) => {
  const IconComponent = TRACK_ICONS[track.icon];

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-2 py-1 border-b border-black/30 cursor-pointer transition-colors",
        isSelected ? "bg-white/10" : "hover:bg-white/5"
      )}
      style={{ height: '60px' }}
      onClick={onSelect}
    >
      <div
        className="w-1 h-10 rounded-full"
        style={{ backgroundColor: track.color }}
      />
      <div
        className="w-8 h-8 rounded flex items-center justify-center"
        style={{ backgroundColor: `${track.color}30` }}
      >
        <IconComponent className="w-4 h-4" style={{ color: track.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-white truncate">{track.name}</p>
        <p className="text-[10px] text-white/40 capitalize">{track.type}</p>
      </div>
      <div className="flex items-center gap-0.5">
        <button
          onClick={(e) => { e.stopPropagation(); onToggleMute(); }}
          className={cn(
            "w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center transition-colors",
            track.muted ? "bg-yellow-500 text-black" : "bg-white/10 text-white/50 hover:text-white"
          )}
        >
          M
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleSolo(); }}
          className={cn(
            "w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center transition-colors",
            track.solo ? "bg-yellow-400 text-black" : "bg-white/10 text-white/50 hover:text-white"
          )}
        >
          S
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleArm(); }}
          className={cn(
            "w-5 h-5 rounded flex items-center justify-center transition-colors",
            track.armed ? "bg-red-500 text-white" : "bg-white/10 text-white/50 hover:text-white"
          )}
        >
          <Circle className={cn("w-2.5 h-2.5", track.armed && "fill-current")} />
        </button>
      </div>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={track.volume}
        onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
        onClick={(e) => e.stopPropagation()}
        className="w-12 h-1 accent-white/70"
      />
    </div>
  );
};

// Track Regions (Timeline)
const TrackRegions: React.FC<{
  track: Track;
  currentBeat: number;
  totalBeats: number;
  zoom: number;
}> = ({ track, currentBeat, totalBeats, zoom }) => (
  <div
    className="relative h-[60px] border-b border-black/30 bg-[#1a1a1a]"
    style={{ width: `${totalBeats * BEAT_WIDTH * zoom}px` }}
  >
    {track.regions.map((region) => (
      <div
        key={region.id}
        className={cn(
          "absolute top-1 bottom-1 rounded cursor-pointer transition-opacity",
          region.muted && "opacity-50"
        )}
        style={{
          left: `${region.startBeat * BEAT_WIDTH * zoom}px`,
          width: `${region.lengthBeats * BEAT_WIDTH * zoom}px`,
          backgroundColor: `${region.color}40`,
          borderLeft: `3px solid ${region.color}`,
        }}
      >
        <div className="px-1.5 py-0.5 text-[10px] text-white/80 truncate font-medium">
          {region.name}
        </div>
        {region.looped && (
          <div className="absolute right-1 top-0.5">
            <Repeat className="w-2.5 h-2.5 text-white/50" />
          </div>
        )}
        {/* Waveform/Note visualization placeholder */}
        <div className="absolute inset-x-0 bottom-1 top-5 mx-1 overflow-hidden">
          <div className="h-full flex items-center gap-px">
            {Array.from({ length: Math.floor(region.lengthBeats * 2) }).map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-white/20 rounded-sm"
                style={{ height: `${20 + Math.random() * 60}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    ))}
    {/* Automation lane */}
    {track.automation.filter(a => a.visible).map((lane) => (
      <svg
        key={lane.id}
        className="absolute inset-0 pointer-events-none"
        style={{ width: `${totalBeats * BEAT_WIDTH * zoom}px`, height: '60px' }}
      >
        <path
          d={lane.points.map((p, i) =>
            `${i === 0 ? 'M' : 'L'} ${p.beat * BEAT_WIDTH * zoom} ${60 - p.value * 50}`
          ).join(' ')}
          fill="none"
          stroke="#FEBC2E"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {lane.points.map((p, i) => (
          <circle
            key={i}
            cx={p.beat * BEAT_WIDTH * zoom}
            cy={60 - p.value * 50}
            r="4"
            fill="#FEBC2E"
            className="cursor-pointer"
          />
        ))}
      </svg>
    ))}
  </div>
);

// Marker Track
const MarkerTrack: React.FC<{
  markers: Marker[];
  totalBeats: number;
  zoom: number;
}> = ({ markers, totalBeats, zoom }) => (
  <div
    className="relative h-6 bg-[#252525] border-b border-black/50"
    style={{ width: `${totalBeats * BEAT_WIDTH * zoom}px` }}
  >
    {markers.map((marker) => (
      <div
        key={marker.id}
        className="absolute top-0 flex items-start cursor-pointer group"
        style={{ left: `${marker.beat * BEAT_WIDTH * zoom}px` }}
      >
        <div
          className="w-px h-full"
          style={{ backgroundColor: marker.color }}
        />
        <div
          className="px-1.5 py-0.5 text-[9px] font-medium text-white rounded-br"
          style={{ backgroundColor: marker.color }}
        >
          {marker.name}
        </div>
      </div>
    ))}
  </div>
);

// Timeline Ruler
const TimelineRuler: React.FC<{
  totalBeats: number;
  zoom: number;
  currentBeat: number;
  loopStart: number;
  loopEnd: number;
  isLooping: boolean;
}> = ({ totalBeats, zoom, currentBeat, loopStart, loopEnd, isLooping }) => {
  const bars = Math.ceil(totalBeats / 4);

  return (
    <div
      className="relative h-6 bg-[#2a2a2a] border-b border-black/50"
      style={{ width: `${totalBeats * BEAT_WIDTH * zoom}px` }}
    >
      {/* Loop region */}
      {isLooping && (
        <div
          className="absolute top-0 bottom-0 bg-yellow-500/20"
          style={{
            left: `${loopStart * BEAT_WIDTH * zoom}px`,
            width: `${(loopEnd - loopStart) * BEAT_WIDTH * zoom}px`,
          }}
        />
      )}

      {/* Bar markers */}
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className="absolute top-0 h-full border-l border-white/20 flex items-end"
          style={{ left: `${i * 4 * BEAT_WIDTH * zoom}px` }}
        >
          <span className="text-[10px] text-white/40 ml-1 mb-0.5">{i + 1}</span>
        </div>
      ))}

      {/* Beat markers */}
      {Array.from({ length: totalBeats }).map((_, i) => (
        i % 4 !== 0 && (
          <div
            key={i}
            className="absolute top-3 h-3 border-l border-white/10"
            style={{ left: `${i * BEAT_WIDTH * zoom}px` }}
          />
        )
      ))}

      {/* Playhead */}
      <div
        className="absolute top-0 h-full w-px bg-white z-10"
        style={{ left: `${currentBeat * BEAT_WIDTH * zoom}px` }}
      >
        <div className="absolute -top-0 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-white" />
      </div>
    </div>
  );
};

// Library Panel
const LibraryPanel: React.FC<{
  tab: LibraryTab;
  onTabChange: (tab: LibraryTab) => void;
  loops: LoopItem[];
  patches: Patch[];
}> = ({ tab, onTabChange, loops, patches }) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Keyboards', 'Drums']);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const filteredLoops = loops.filter(l =>
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const loopsByCategory = filteredLoops.reduce((acc, loop) => {
    if (!acc[loop.category]) acc[loop.category] = [];
    acc[loop.category].push(loop);
    return acc;
  }, {} as Record<string, LoopItem[]>);

  const patchesByCategory = patches.reduce((acc, patch) => {
    if (!acc[patch.category]) acc[patch.category] = [];
    acc[patch.category].push(patch);
    return acc;
  }, {} as Record<string, Patch[]>);

  return (
    <div className="w-56 bg-[#1e1e1e] border-r border-black/50 flex flex-col">
      <div className="flex border-b border-black/50">
        <button
          onClick={() => onTabChange('patches')}
          className={cn(
            "flex-1 px-3 py-2 text-xs font-medium transition-colors",
            tab === 'patches' ? "bg-white/5 text-white" : "text-white/50 hover:text-white"
          )}
        >
          Patches
        </button>
        <button
          onClick={() => onTabChange('loops')}
          className={cn(
            "flex-1 px-3 py-2 text-xs font-medium transition-colors",
            tab === 'loops' ? "bg-white/5 text-white" : "text-white/50 hover:text-white"
          )}
        >
          Loops
        </button>
      </div>

      <div className="p-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search..."
          className="w-full px-2 py-1 bg-black/30 border border-white/10 rounded text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/20"
        />
      </div>

      <div className="flex-1 overflow-auto">
        {tab === 'patches' && (
          <div className="space-y-0.5">
            {Object.entries(patchesByCategory).map(([category, categoryPatches]) => (
              <div key={category}>
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center gap-1 px-2 py-1.5 text-xs text-white/70 hover:bg-white/5"
                >
                  {expandedCategories.includes(category) ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronRight className="w-3 h-3" />
                  )}
                  <Folder className="w-3 h-3" />
                  {category}
                </button>
                {expandedCategories.includes(category) && (
                  <div className="ml-4 space-y-0.5">
                    {categoryPatches.map(patch => (
                      <div
                        key={patch.id}
                        className="flex items-center gap-2 px-2 py-1 text-xs text-white/60 hover:bg-white/5 hover:text-white cursor-pointer rounded"
                      >
                        {TRACK_ICONS[patch.icon as keyof typeof TRACK_ICONS] &&
                          React.createElement(TRACK_ICONS[patch.icon as keyof typeof TRACK_ICONS], { className: "w-3 h-3" })
                        }
                        {patch.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === 'loops' && (
          <div className="space-y-0.5">
            {Object.entries(loopsByCategory).map(([category, categoryLoops]) => (
              <div key={category}>
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center gap-1 px-2 py-1.5 text-xs text-white/70 hover:bg-white/5"
                >
                  {expandedCategories.includes(category) ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronRight className="w-3 h-3" />
                  )}
                  <ListMusic className="w-3 h-3" />
                  {category}
                  <span className="ml-auto text-white/30">{categoryLoops.length}</span>
                </button>
                {expandedCategories.includes(category) && (
                  <div className="ml-4 space-y-0.5">
                    {categoryLoops.map(loop => (
                      <div
                        key={loop.id}
                        className="flex items-center gap-2 px-2 py-1 text-xs hover:bg-white/5 cursor-pointer rounded group"
                        draggable
                      >
                        <Waves className="w-3 h-3 text-white/40" />
                        <span className="flex-1 text-white/60 group-hover:text-white truncate">{loop.name}</span>
                        <span className="text-[10px] text-white/30">{loop.bpm}</span>
                        {loop.favorite && <Bookmark className="w-2.5 h-2.5 text-yellow-500 fill-current" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Inspector Panel
const InspectorPanel: React.FC<{
  selectedTrack: Track | null;
  onUpdateTrack: (updates: Partial<Track>) => void;
}> = ({ selectedTrack, onUpdateTrack }) => {
  if (!selectedTrack) {
    return (
      <div className="w-56 bg-[#1e1e1e] border-r border-black/50 flex items-center justify-center">
        <p className="text-xs text-white/30">No track selected</p>
      </div>
    );
  }

  return (
    <div className="w-56 bg-[#1e1e1e] border-r border-black/50 flex flex-col overflow-hidden">
      <div className="p-3 border-b border-black/50">
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-8 h-8 rounded flex items-center justify-center"
            style={{ backgroundColor: `${selectedTrack.color}30` }}
          >
            {React.createElement(TRACK_ICONS[selectedTrack.icon], {
              className: "w-4 h-4",
              style: { color: selectedTrack.color }
            })}
          </div>
          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={selectedTrack.name}
              onChange={(e) => onUpdateTrack({ name: e.target.value })}
              className="w-full bg-transparent text-sm font-medium text-white border-b border-transparent hover:border-white/20 focus:border-white/40 focus:outline-none"
            />
            <p className="text-[10px] text-white/40 capitalize">{selectedTrack.type} Track</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-3 space-y-4">
        <div>
          <h4 className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Volume</h4>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={selectedTrack.volume}
              onChange={(e) => onUpdateTrack({ volume: parseFloat(e.target.value) })}
              className="flex-1 h-1 accent-white/70"
            />
            <span className="text-xs text-white/50 w-10 text-right">
              {Math.round(selectedTrack.volume * 100)}%
            </span>
          </div>
        </div>

        <div>
          <h4 className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Pan</h4>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/30">L</span>
            <input
              type="range"
              min="-1"
              max="1"
              step="0.01"
              value={selectedTrack.pan}
              onChange={(e) => onUpdateTrack({ pan: parseFloat(e.target.value) })}
              className="flex-1 h-1 accent-white/70"
            />
            <span className="text-[10px] text-white/30">R</span>
          </div>
        </div>

        <div>
          <h4 className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Options</h4>
          <div className="space-y-1">
            <label className="flex items-center gap-2 text-xs text-white/60 hover:text-white cursor-pointer">
              <input
                type="checkbox"
                checked={selectedTrack.inputMonitor}
                onChange={(e) => onUpdateTrack({ inputMonitor: e.target.checked })}
                className="rounded border-white/20"
              />
              Input Monitoring
            </label>
            <label className="flex items-center gap-2 text-xs text-white/60 hover:text-white cursor-pointer">
              <input
                type="checkbox"
                checked={selectedTrack.frozen}
                onChange={(e) => onUpdateTrack({ frozen: e.target.checked })}
                className="rounded border-white/20"
              />
              Freeze Track
            </label>
          </div>
        </div>

        <div>
          <h4 className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Regions</h4>
          <div className="space-y-1">
            {selectedTrack.regions.map(region => (
              <div
                key={region.id}
                className="flex items-center gap-2 px-2 py-1 bg-white/5 rounded text-xs"
              >
                <div className="w-2 h-2 rounded" style={{ backgroundColor: region.color }} />
                <span className="flex-1 text-white/70 truncate">{region.name}</span>
                <span className="text-white/30">{region.lengthBeats}b</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Channel Strip (for Mixer view)
const ChannelStrip: React.FC<{
  track: Track;
  isSelected: boolean;
  onSelect: () => void;
  onToggleMute: () => void;
  onToggleSolo: () => void;
  onVolumeChange: (volume: number) => void;
  onPanChange: (pan: number) => void;
}> = ({ track, isSelected, onSelect, onToggleMute, onToggleSolo, onVolumeChange, onPanChange }) => {
  const IconComponent = TRACK_ICONS[track.icon];
  const meterLevel = track.muted ? 0 : track.volume * 0.7 + Math.random() * 0.3;

  return (
    <div
      className={cn(
        "flex flex-col items-center p-2 w-20 bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a] border-r border-black/50 cursor-pointer",
        isSelected && "bg-white/5"
      )}
      onClick={onSelect}
    >
      {/* Pan knob */}
      <div className="mb-2">
        <div className="relative w-8 h-8 rounded-full bg-black/50 border border-white/10">
          <div
            className="absolute top-1/2 left-1/2 w-4 h-0.5 bg-white/50 origin-left"
            style={{ transform: `translate(-50%, -50%) rotate(${track.pan * 135}deg)` }}
          />
        </div>
      </div>

      {/* Fader */}
      <div className="relative flex-1 w-4 min-h-[120px] bg-black/30 rounded my-2">
        <div
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-500 to-green-400 rounded transition-all"
          style={{ height: `${meterLevel * 100}%` }}
        />
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={track.volume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-0 w-full h-full opacity-0 cursor-ns-resize"
          style={{ writingMode: 'bt-lr', WebkitAppearance: 'slider-vertical' } as React.CSSProperties}
        />
      </div>

      {/* Volume display */}
      <span className="text-[10px] text-white/50 mb-2 tabular-nums">
        {track.volume > 0 ? Math.round((track.volume - 1) * 60) : '-inf'} dB
      </span>

      {/* Buttons */}
      <div className="flex gap-1 mb-2">
        <button
          onClick={(e) => { e.stopPropagation(); onToggleMute(); }}
          className={cn(
            "w-6 h-5 rounded text-[9px] font-bold flex items-center justify-center",
            track.muted ? "bg-yellow-500 text-black" : "bg-white/10 text-white/50"
          )}
        >
          M
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleSolo(); }}
          className={cn(
            "w-6 h-5 rounded text-[9px] font-bold flex items-center justify-center",
            track.solo ? "bg-yellow-400 text-black" : "bg-white/10 text-white/50"
          )}
        >
          S
        </button>
      </div>

      {/* Track icon */}
      <div
        className="w-10 h-10 rounded flex items-center justify-center mb-1"
        style={{ backgroundColor: `${track.color}30` }}
      >
        <IconComponent className="w-5 h-5" style={{ color: track.color }} />
      </div>

      {/* Track name */}
      <span className="text-[10px] text-white/70 truncate w-full text-center">{track.name}</span>
    </div>
  );
};

// Mixer View
const MixerView: React.FC<{
  tracks: Track[];
  selectedTrackId: string | null;
  onSelectTrack: (id: string) => void;
  onToggleMute: (id: string) => void;
  onToggleSolo: (id: string) => void;
  onVolumeChange: (id: string, volume: number) => void;
  onPanChange: (id: string, pan: number) => void;
}> = ({ tracks, selectedTrackId, onSelectTrack, onToggleMute, onToggleSolo, onVolumeChange, onPanChange }) => (
  <div className="flex-1 flex overflow-x-auto bg-[#1a1a1a]">
    {tracks.map((track) => (
      <ChannelStrip
        key={track.id}
        track={track}
        isSelected={track.id === selectedTrackId}
        onSelect={() => onSelectTrack(track.id)}
        onToggleMute={() => onToggleMute(track.id)}
        onToggleSolo={() => onToggleSolo(track.id)}
        onVolumeChange={(v) => onVolumeChange(track.id, v)}
        onPanChange={(p) => onPanChange(track.id, p)}
      />
    ))}
    {/* Master channel */}
    <div className="flex flex-col items-center p-2 w-24 bg-gradient-to-b from-[#3a3a3a] to-[#2a2a2a] border-l-2 border-white/20">
      <span className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Master</span>
      <div className="relative flex-1 w-6 min-h-[120px] bg-black/30 rounded my-2">
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500 to-blue-400 rounded" style={{ height: '70%' }} />
      </div>
      <span className="text-[10px] text-white/50 mb-2">0.0 dB</span>
      <Headphones className="w-5 h-5 text-white/50" />
    </div>
  </div>
);

// Piano Roll View
const PianoRollView: React.FC<{
  selectedTrack: Track | null;
  zoom: number;
}> = ({ selectedTrack, zoom }) => {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octaves = [5, 4, 3, 2, 1];
  const allNotes = octaves.flatMap(oct => notes.map(n => `${n}${oct}`).reverse()).reverse();
  const totalBeats = 64;

  return (
    <div className="flex-1 flex overflow-hidden bg-[#1a1a1a]">
      {/* Piano keys */}
      <div className="w-16 flex flex-col border-r border-black/50">
        {allNotes.map((note, i) => {
          const isBlack = note.includes('#');
          return (
            <div
              key={i}
              className={cn(
                "h-4 flex items-center justify-end px-1 text-[9px] border-b border-black/20",
                isBlack ? "bg-[#2a2a2a] text-white/40" : "bg-[#3a3a3a] text-white/60"
              )}
            >
              {note}
            </div>
          );
        })}
      </div>

      {/* Note grid */}
      <div className="flex-1 overflow-auto">
        <div style={{ width: `${totalBeats * BEAT_WIDTH * zoom}px` }}>
          {allNotes.map((note, rowIdx) => {
            const isBlack = note.includes('#');
            return (
              <div
                key={rowIdx}
                className={cn(
                  "h-4 border-b border-black/20 relative",
                  isBlack ? "bg-[#1a1a1a]" : "bg-[#222]"
                )}
              >
                {/* Beat lines */}
                {Array.from({ length: totalBeats }).map((_, beatIdx) => (
                  <div
                    key={beatIdx}
                    className={cn(
                      "absolute top-0 bottom-0 border-l",
                      beatIdx % 4 === 0 ? "border-white/20" : "border-white/5"
                    )}
                    style={{ left: `${beatIdx * BEAT_WIDTH * zoom}px` }}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Smart Controls View
const SmartControlsView: React.FC<{
  selectedTrack: Track | null;
}> = ({ selectedTrack }) => {
  const [controls, setControls] = useState({
    cutoff: 0.5,
    resonance: 0.3,
    attack: 0.1,
    decay: 0.3,
    sustain: 0.7,
    release: 0.4,
    reverb: 0.3,
    delay: 0.2,
  });

  const Knob: React.FC<{ value: number; label: string; onChange: (v: number) => void }> = ({ value, label, onChange }) => (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-12 h-12 rounded-full bg-gradient-to-b from-[#4a4a4a] to-[#2a2a2a] border border-white/10 shadow-lg">
        <div
          className="absolute top-1/2 left-1/2 w-5 h-1 bg-white rounded origin-left"
          style={{ transform: `translate(-25%, -50%) rotate(${value * 270 - 135}deg)` }}
        />
      </div>
      <span className="text-[10px] text-white/50">{label}</span>
    </div>
  );

  if (!selectedTrack) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a]">
        <p className="text-white/30">Select a track to view Smart Controls</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a] p-6 overflow-auto">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div
            className="w-16 h-16 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${selectedTrack.color}30` }}
          >
            {React.createElement(TRACK_ICONS[selectedTrack.icon], {
              className: "w-8 h-8",
              style: { color: selectedTrack.color }
            })}
          </div>
          <div>
            <h3 className="text-lg font-medium text-white">{selectedTrack.name}</h3>
            <p className="text-sm text-white/50">{selectedTrack.type} Instrument</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-8 mb-8">
          <Knob value={controls.cutoff} label="Cutoff" onChange={(v) => setControls(p => ({ ...p, cutoff: v }))} />
          <Knob value={controls.resonance} label="Resonance" onChange={(v) => setControls(p => ({ ...p, resonance: v }))} />
          <Knob value={controls.attack} label="Attack" onChange={(v) => setControls(p => ({ ...p, attack: v }))} />
          <Knob value={controls.decay} label="Decay" onChange={(v) => setControls(p => ({ ...p, decay: v }))} />
        </div>

        <div className="grid grid-cols-4 gap-8 mb-8">
          <Knob value={controls.sustain} label="Sustain" onChange={(v) => setControls(p => ({ ...p, sustain: v }))} />
          <Knob value={controls.release} label="Release" onChange={(v) => setControls(p => ({ ...p, release: v }))} />
          <Knob value={controls.reverb} label="Reverb" onChange={(v) => setControls(p => ({ ...p, reverb: v }))} />
          <Knob value={controls.delay} label="Delay" onChange={(v) => setControls(p => ({ ...p, delay: v }))} />
        </div>

        <div className="p-4 bg-black/20 rounded-lg">
          <h4 className="text-xs text-white/40 uppercase tracking-wider mb-3">ADSR Envelope</h4>
          <svg className="w-full h-24" viewBox="0 0 200 60">
            <path
              d={`M 0 60 L ${controls.attack * 50} 10 L ${controls.attack * 50 + controls.decay * 50} ${60 - controls.sustain * 50} L ${150} ${60 - controls.sustain * 50} L ${150 + controls.release * 50} 60`}
              fill="none"
              stroke={selectedTrack.color}
              strokeWidth="2"
            />
            <path
              d={`M 0 60 L ${controls.attack * 50} 10 L ${controls.attack * 50 + controls.decay * 50} ${60 - controls.sustain * 50} L ${150} ${60 - controls.sustain * 50} L ${150 + controls.release * 50} 60 Z`}
              fill={`${selectedTrack.color}20`}
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const ZLogicProWindow: React.FC<ZLogicProWindowProps> = ({ onClose, onFocus }) => {
  // State
  const [tracks, setTracks] = useState<Track[]>(DEFAULT_TRACKS);
  const [markers, setMarkers] = useState<Marker[]>(DEFAULT_MARKERS);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>('track-1');
  const [viewMode, setViewMode] = useState<ViewMode>('tracks');
  const [currentTool, setCurrentTool] = useState<ToolType>('pointer');
  const [showLibrary, setShowLibrary] = useState(true);
  const [showInspector, setShowInspector] = useState(true);
  const [libraryTab, setLibraryTab] = useState<LibraryTab>('patches');

  // Transport state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isLooping, setIsLooping] = useState(true);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [loopStart, setLoopStart] = useState(16);
  const [loopEnd, setLoopEnd] = useState(48);
  const [bpm, setBpm] = useState(120);
  const [timeSignature, setTimeSignature] = useState('4/4');
  const [projectKey, setProjectKey] = useState('C Major');
  const [zoom, setZoom] = useState(1);

  const totalBeats = 128;
  const playIntervalRef = useRef<number | null>(null);
  const timelineScrollRef = useRef<HTMLDivElement>(null);

  // Selected track
  const selectedTrack = useMemo(() =>
    tracks.find(t => t.id === selectedTrackId) || null,
    [tracks, selectedTrackId]
  );

  // Playback effect
  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = window.setInterval(() => {
        setCurrentBeat(prev => {
          let next = prev + 0.25; // 16th notes at 120bpm = 125ms
          if (isLooping && next >= loopEnd) {
            next = loopStart;
          } else if (next >= totalBeats) {
            next = 0;
          }
          return next;
        });
      }, (60 / bpm / 4) * 1000);
    } else {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    }
    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, [isPlaying, bpm, isLooping, loopStart, loopEnd, totalBeats]);

  // Scroll timeline with playhead
  useEffect(() => {
    if (timelineScrollRef.current && isPlaying) {
      const playheadPos = currentBeat * BEAT_WIDTH * zoom;
      const scrollLeft = timelineScrollRef.current.scrollLeft;
      const viewWidth = timelineScrollRef.current.clientWidth;

      if (playheadPos > scrollLeft + viewWidth - 100 || playheadPos < scrollLeft) {
        timelineScrollRef.current.scrollLeft = playheadPos - 100;
      }
    }
  }, [currentBeat, zoom, isPlaying]);

  // Handlers
  const handlePlay = useCallback(() => setIsPlaying(p => !p), []);
  const handleStop = useCallback(() => {
    setIsPlaying(false);
    setCurrentBeat(0);
  }, []);
  const handleRecord = useCallback(() => {
    setIsRecording(r => !r);
    if (!isRecording) setIsPlaying(true);
  }, [isRecording]);
  const handleRewind = useCallback(() => setCurrentBeat(Math.max(0, currentBeat - 4)), [currentBeat]);
  const handleForward = useCallback(() => setCurrentBeat(Math.min(totalBeats, currentBeat + 4)), [currentBeat, totalBeats]);
  const handleLoopToggle = useCallback(() => setIsLooping(l => !l), []);

  const handleToggleMute = useCallback((trackId: string) => {
    setTracks(prev => prev.map(t =>
      t.id === trackId ? { ...t, muted: !t.muted } : t
    ));
  }, []);

  const handleToggleSolo = useCallback((trackId: string) => {
    setTracks(prev => prev.map(t =>
      t.id === trackId ? { ...t, solo: !t.solo } : t
    ));
  }, []);

  const handleToggleArm = useCallback((trackId: string) => {
    setTracks(prev => prev.map(t =>
      t.id === trackId ? { ...t, armed: !t.armed } : t
    ));
  }, []);

  const handleVolumeChange = useCallback((trackId: string, volume: number) => {
    setTracks(prev => prev.map(t =>
      t.id === trackId ? { ...t, volume } : t
    ));
  }, []);

  const handlePanChange = useCallback((trackId: string, pan: number) => {
    setTracks(prev => prev.map(t =>
      t.id === trackId ? { ...t, pan } : t
    ));
  }, []);

  const handleUpdateTrack = useCallback((updates: Partial<Track>) => {
    if (!selectedTrackId) return;
    setTracks(prev => prev.map(t =>
      t.id === selectedTrackId ? { ...t, ...updates } : t
    ));
  }, [selectedTrackId]);

  return (
    <ZWindow
      title="Logic Pro"
      onClose={onClose}
      onFocus={onFocus}
      defaultWidth={1200}
      defaultHeight={800}
      minWidth={900}
      minHeight={600}
      defaultPosition={{ x: 60, y: 40 }}
      windowType="default"
    >
      <div className="flex flex-col h-full bg-[#222] overflow-hidden">
        {/* Toolbar */}
        <Toolbar
          currentTool={currentTool}
          onToolChange={setCurrentTool}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          showLibrary={showLibrary}
          showInspector={showInspector}
          onToggleLibrary={() => setShowLibrary(s => !s)}
          onToggleInspector={() => setShowInspector(s => !s)}
        />

        {/* Transport */}
        <TransportBar
          isPlaying={isPlaying}
          isRecording={isRecording}
          isLooping={isLooping}
          currentBeat={currentBeat}
          bpm={bpm}
          timeSignature={timeSignature}
          projectKey={projectKey}
          onPlay={handlePlay}
          onStop={handleStop}
          onRecord={handleRecord}
          onRewind={handleRewind}
          onForward={handleForward}
          onLoopToggle={handleLoopToggle}
        />

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Library Panel */}
          {showLibrary && (
            <LibraryPanel
              tab={libraryTab}
              onTabChange={setLibraryTab}
              loops={DEMO_LOOPS}
              patches={DEMO_PATCHES}
            />
          )}

          {/* Inspector Panel */}
          {showInspector && (
            <InspectorPanel
              selectedTrack={selectedTrack}
              onUpdateTrack={handleUpdateTrack}
            />
          )}

          {/* Main View */}
          {viewMode === 'tracks' && (
            <div className="flex-1 flex overflow-hidden">
              {/* Track Headers */}
              <div className="w-52 flex flex-col border-r border-black/50 bg-[#252525]">
                {/* Marker track header */}
                <div className="h-6 border-b border-black/50 px-2 flex items-center">
                  <Flag className="w-3 h-3 text-white/40 mr-1" />
                  <span className="text-[10px] text-white/40">Markers</span>
                </div>
                {/* Timeline ruler header */}
                <div className="h-6 border-b border-black/50 px-2 flex items-center justify-between">
                  <span className="text-[10px] text-white/40">Timeline</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setZoom(z => Math.max(0.5, z - 0.25))} className="p-0.5 rounded hover:bg-white/10">
                      <ZoomOut className="w-3 h-3 text-white/40" />
                    </button>
                    <button onClick={() => setZoom(z => Math.min(2, z + 0.25))} className="p-0.5 rounded hover:bg-white/10">
                      <ZoomIn className="w-3 h-3 text-white/40" />
                    </button>
                  </div>
                </div>
                {/* Track headers */}
                {tracks.map((track) => (
                  <TrackHeader
                    key={track.id}
                    track={track}
                    isSelected={track.id === selectedTrackId}
                    onSelect={() => setSelectedTrackId(track.id)}
                    onToggleArm={() => handleToggleArm(track.id)}
                    onToggleSolo={() => handleToggleSolo(track.id)}
                    onToggleMute={() => handleToggleMute(track.id)}
                    onVolumeChange={(v) => handleVolumeChange(track.id, v)}
                  />
                ))}
                {/* Add track button */}
                <button className="flex items-center gap-2 px-3 py-2 text-xs text-white/50 hover:text-white hover:bg-white/5 border-b border-black/30">
                  <Plus className="w-3 h-3" />
                  Add Track
                </button>
              </div>

              {/* Timeline Area */}
              <div ref={timelineScrollRef} className="flex-1 overflow-auto">
                <div className="min-w-max">
                  {/* Marker track */}
                  <MarkerTrack markers={markers} totalBeats={totalBeats} zoom={zoom} />
                  {/* Timeline ruler */}
                  <TimelineRuler
                    totalBeats={totalBeats}
                    zoom={zoom}
                    currentBeat={currentBeat}
                    loopStart={loopStart}
                    loopEnd={loopEnd}
                    isLooping={isLooping}
                  />
                  {/* Track regions */}
                  {tracks.map((track) => (
                    <TrackRegions
                      key={track.id}
                      track={track}
                      currentBeat={currentBeat}
                      totalBeats={totalBeats}
                      zoom={zoom}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {viewMode === 'mixer' && (
            <MixerView
              tracks={tracks}
              selectedTrackId={selectedTrackId}
              onSelectTrack={setSelectedTrackId}
              onToggleMute={handleToggleMute}
              onToggleSolo={handleToggleSolo}
              onVolumeChange={handleVolumeChange}
              onPanChange={handlePanChange}
            />
          )}

          {viewMode === 'pianoRoll' && (
            <PianoRollView selectedTrack={selectedTrack} zoom={zoom} />
          )}

          {viewMode === 'smartControls' && (
            <SmartControlsView selectedTrack={selectedTrack} />
          )}
        </div>
      </div>
    </ZWindow>
  );
};

export default ZLogicProWindow;
