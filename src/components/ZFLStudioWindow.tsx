import React, { useState, useCallback, useMemo } from 'react';
import ZWindow from './ZWindow';
import { cn } from '@/lib/utils';
import {
  Play, Pause, Square, SkipBack, SkipForward, Circle,
  Volume2, ChevronDown, ChevronRight, Folder, Music,
  Settings, Sliders, Waves, Grid3X3, MousePointer,
  Pencil, Magnet, Move, ZoomIn, ZoomOut, Scissors,
  RotateCcw, Save, FolderOpen, Plus, Minus, X,
  ChevronUp, Mic, Headphones, Lock, Unlock,
  Copy, Trash2, MoreVertical, Maximize2, Minimize2,
  Loader2, Wand2
} from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

interface ZFLStudioWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

interface Channel {
  id: string;
  name: string;
  type: 'synth' | 'sampler' | 'audio';
  color: string;
  volume: number;
  pan: number;
  muted: boolean;
  solo: boolean;
  steps: boolean[];
  pluginIcon?: string;
}

interface Pattern {
  id: string;
  name: string;
  color: string;
  bars: number;
}

interface PlaylistBlock {
  id: string;
  patternId: string;
  track: number;
  startBar: number;
  length: number;
}

interface MixerChannel {
  id: string;
  name: string;
  volume: number;
  pan: number;
  muted: boolean;
  solo: boolean;
  color: string;
  effects: string[];
}

interface PianoNote {
  id: string;
  pitch: number;
  start: number;
  duration: number;
  velocity: number;
}

type ViewMode = 'channel' | 'playlist' | 'piano' | 'mixer' | 'browser';
type ToolMode = 'select' | 'draw' | 'slice' | 'delete';

// =============================================================================
// FL STUDIO COLORS - Authentic gray/orange theme
// =============================================================================

const FL_COLORS = {
  bg: '#2a2a2a',
  bgDark: '#1e1e1e',
  bgLight: '#3a3a3a',
  bgLighter: '#4a4a4a',
  border: '#555555',
  borderLight: '#666666',
  text: '#cccccc',
  textDim: '#888888',
  textBright: '#ffffff',
  accent: '#ff6600',
  accentDark: '#cc5200',
  accentLight: '#ff8833',
  highlight: '#ffaa00',
  meter: '#00ff00',
  meterYellow: '#ffff00',
  meterRed: '#ff0000',
  stepOn: '#ff6600',
  stepOff: '#3a3a3a',
  stepBeat: '#444444',
  selected: '#ff6600',
  piano: {
    white: '#e8e8e8',
    black: '#2a2a2a',
    roll: '#1a1a1a',
  },
  channels: ['#ff5555', '#55ff55', '#5555ff', '#ffff55', '#ff55ff', '#55ffff', '#ff8855', '#88ff55'],
};

// =============================================================================
// DEMO DATA
// =============================================================================

const INITIAL_CHANNELS: Channel[] = [
  { id: 'ch1', name: 'Kick', type: 'sampler', color: FL_COLORS.channels[0], volume: 78, pan: 0, muted: false, solo: false, steps: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false] },
  { id: 'ch2', name: 'Snare', type: 'sampler', color: FL_COLORS.channels[1], volume: 72, pan: 0, muted: false, solo: false, steps: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false] },
  { id: 'ch3', name: 'HiHat', type: 'sampler', color: FL_COLORS.channels[2], volume: 65, pan: 10, muted: false, solo: false, steps: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false] },
  { id: 'ch4', name: 'Sytrus', type: 'synth', color: FL_COLORS.channels[3], volume: 80, pan: 0, muted: false, solo: false, steps: [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false], pluginIcon: 'sytrus' },
  { id: 'ch5', name: 'GrossBeat', type: 'synth', color: FL_COLORS.channels[4], volume: 75, pan: -15, muted: false, solo: false, steps: [false, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false], pluginIcon: 'grossbeat' },
];

const INITIAL_PATTERNS: Pattern[] = [
  { id: 'pat1', name: 'Pattern 1', color: FL_COLORS.channels[0], bars: 4 },
  { id: 'pat2', name: 'Pattern 2', color: FL_COLORS.channels[1], bars: 4 },
  { id: 'pat3', name: 'Bass Line', color: FL_COLORS.channels[3], bars: 8 },
];

const INITIAL_PLAYLIST: PlaylistBlock[] = [
  { id: 'blk1', patternId: 'pat1', track: 0, startBar: 0, length: 4 },
  { id: 'blk2', patternId: 'pat1', track: 0, startBar: 4, length: 4 },
  { id: 'blk3', patternId: 'pat2', track: 1, startBar: 4, length: 4 },
  { id: 'blk4', patternId: 'pat3', track: 2, startBar: 0, length: 8 },
];

const INITIAL_MIXER: MixerChannel[] = [
  { id: 'mix0', name: 'Master', volume: 80, pan: 0, muted: false, solo: false, color: FL_COLORS.accent, effects: ['Limiter'] },
  { id: 'mix1', name: 'Insert 1', volume: 75, pan: 0, muted: false, solo: false, color: FL_COLORS.channels[0], effects: ['EQ', 'Comp'] },
  { id: 'mix2', name: 'Insert 2', volume: 78, pan: 0, muted: false, solo: false, color: FL_COLORS.channels[1], effects: ['Reverb'] },
  { id: 'mix3', name: 'Insert 3', volume: 72, pan: -20, muted: false, solo: false, color: FL_COLORS.channels[2], effects: [] },
  { id: 'mix4', name: 'Insert 4', volume: 80, pan: 0, muted: false, solo: false, color: FL_COLORS.channels[3], effects: ['Delay', 'EQ'] },
  { id: 'mix5', name: 'Insert 5', volume: 70, pan: 20, muted: false, solo: false, color: FL_COLORS.channels[4], effects: [] },
  { id: 'mix6', name: 'Insert 6', volume: 75, pan: 0, muted: false, solo: false, color: FL_COLORS.channels[5], effects: [] },
  { id: 'mix7', name: 'Insert 7', volume: 75, pan: 0, muted: false, solo: false, color: FL_COLORS.channels[6], effects: [] },
];

const BROWSER_STRUCTURE = [
  { name: 'Packs', icon: 'folder', children: ['Vengeance', 'Splice', 'KSHMR', 'Cymatics'] },
  { name: 'Plugin database', icon: 'plugin', children: ['Generators', 'Effects', 'Installed'] },
  { name: 'Current project', icon: 'project', children: ['Patterns', 'Audio clips', 'Automation'] },
  { name: 'Plugin presets', icon: 'preset', children: ['Sytrus', 'Harmor', 'GrossBeat', 'Serum'] },
];

// =============================================================================
// SUBCOMPONENTS
// =============================================================================

// Transport Panel
const TransportPanel: React.FC<{
  isPlaying: boolean;
  isRecording: boolean;
  bpm: number;
  position: string;
  onPlay: () => void;
  onStop: () => void;
  onRecord: () => void;
  onBpmChange: (bpm: number) => void;
}> = ({ isPlaying, isRecording, bpm, position, onPlay, onStop, onRecord, onBpmChange }) => (
  <div className="flex items-center gap-2 px-3 py-1.5 border-b" style={{ backgroundColor: FL_COLORS.bgDark, borderColor: FL_COLORS.border }}>
    <div className="flex items-center gap-1">
      <button onClick={onStop} className="p-1.5 rounded hover:bg-white/10 transition-colors">
        <Square className="w-4 h-4" style={{ color: FL_COLORS.text }} />
      </button>
      <button onClick={onPlay} className="p-1.5 rounded transition-colors" style={{ backgroundColor: isPlaying ? FL_COLORS.accent : 'transparent' }}>
        {isPlaying ? <Pause className="w-4 h-4" style={{ color: FL_COLORS.textBright }} /> : <Play className="w-4 h-4" style={{ color: FL_COLORS.accent }} />}
      </button>
      <button onClick={onRecord} className="p-1.5 rounded transition-colors" style={{ backgroundColor: isRecording ? '#ff0000' : 'transparent' }}>
        <Circle className="w-4 h-4" style={{ color: isRecording ? '#ffffff' : '#ff0000' }} fill={isRecording ? '#ff0000' : 'none'} />
      </button>
    </div>

    <div className="h-6 w-px mx-1" style={{ backgroundColor: FL_COLORS.border }} />

    <div className="flex items-center gap-2">
      <SkipBack className="w-3.5 h-3.5 cursor-pointer hover:opacity-80" style={{ color: FL_COLORS.textDim }} />
      <div className="px-2 py-0.5 rounded text-xs font-mono" style={{ backgroundColor: FL_COLORS.bgLight, color: FL_COLORS.accent }}>
        {position}
      </div>
      <SkipForward className="w-3.5 h-3.5 cursor-pointer hover:opacity-80" style={{ color: FL_COLORS.textDim }} />
    </div>

    <div className="h-6 w-px mx-1" style={{ backgroundColor: FL_COLORS.border }} />

    <div className="flex items-center gap-1.5">
      <span className="text-xs" style={{ color: FL_COLORS.textDim }}>BPM</span>
      <input
        type="number"
        value={bpm}
        onChange={(e) => onBpmChange(parseInt(e.target.value) || 120)}
        className="w-14 px-1.5 py-0.5 rounded text-xs font-mono text-center focus:outline-none focus:ring-1"
        style={{ backgroundColor: FL_COLORS.bgLight, color: FL_COLORS.accent, borderColor: 'transparent' }}
      />
    </div>

    <div className="flex-1" />

    <div className="flex items-center gap-1">
      <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: FL_COLORS.bgLight, color: FL_COLORS.textDim }}>4/4</span>
      <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: FL_COLORS.bgLight, color: FL_COLORS.textDim }}>PAT</span>
    </div>
  </div>
);

// Toolbar
const Toolbar: React.FC<{
  toolMode: ToolMode;
  snapEnabled: boolean;
  magnetEnabled: boolean;
  onToolChange: (tool: ToolMode) => void;
  onSnapToggle: () => void;
  onMagnetToggle: () => void;
}> = ({ toolMode, snapEnabled, magnetEnabled, onToolChange, onSnapToggle, onMagnetToggle }) => (
  <div className="flex items-center gap-1 px-2 py-1 border-b" style={{ backgroundColor: FL_COLORS.bg, borderColor: FL_COLORS.border }}>
    <div className="flex items-center border rounded" style={{ borderColor: FL_COLORS.border }}>
      {[
        { id: 'select', icon: MousePointer, label: 'Select' },
        { id: 'draw', icon: Pencil, label: 'Draw' },
        { id: 'slice', icon: Scissors, label: 'Slice' },
        { id: 'delete', icon: Trash2, label: 'Delete' },
      ].map((tool) => (
        <button
          key={tool.id}
          onClick={() => onToolChange(tool.id as ToolMode)}
          className="p-1.5 transition-colors first:rounded-l last:rounded-r"
          style={{ backgroundColor: toolMode === tool.id ? FL_COLORS.accent : 'transparent' }}
          title={tool.label}
        >
          <tool.icon className="w-3.5 h-3.5" style={{ color: toolMode === tool.id ? FL_COLORS.textBright : FL_COLORS.textDim }} />
        </button>
      ))}
    </div>

    <div className="h-5 w-px mx-1" style={{ backgroundColor: FL_COLORS.border }} />

    <button onClick={onSnapToggle} className="p-1.5 rounded transition-colors" style={{ backgroundColor: snapEnabled ? FL_COLORS.accent : 'transparent' }} title="Snap">
      <Grid3X3 className="w-3.5 h-3.5" style={{ color: snapEnabled ? FL_COLORS.textBright : FL_COLORS.textDim }} />
    </button>
    <button onClick={onMagnetToggle} className="p-1.5 rounded transition-colors" style={{ backgroundColor: magnetEnabled ? FL_COLORS.accent : 'transparent' }} title="Magnet">
      <Magnet className="w-3.5 h-3.5" style={{ color: magnetEnabled ? FL_COLORS.textBright : FL_COLORS.textDim }} />
    </button>

    <div className="h-5 w-px mx-1" style={{ backgroundColor: FL_COLORS.border }} />

    <button className="p-1.5 rounded hover:bg-white/10 transition-colors" title="Zoom In">
      <ZoomIn className="w-3.5 h-3.5" style={{ color: FL_COLORS.textDim }} />
    </button>
    <button className="p-1.5 rounded hover:bg-white/10 transition-colors" title="Zoom Out">
      <ZoomOut className="w-3.5 h-3.5" style={{ color: FL_COLORS.textDim }} />
    </button>

    <div className="flex-1" />

    <div className="flex items-center gap-1">
      <button className="p-1.5 rounded hover:bg-white/10 transition-colors" title="Undo">
        <RotateCcw className="w-3.5 h-3.5" style={{ color: FL_COLORS.textDim }} />
      </button>
      <button className="p-1.5 rounded hover:bg-white/10 transition-colors" title="Save">
        <Save className="w-3.5 h-3.5" style={{ color: FL_COLORS.textDim }} />
      </button>
    </div>
  </div>
);

// Browser Panel
const BrowserPanel: React.FC<{ expanded: boolean; onToggle: () => void }> = ({ expanded, onToggle }) => {
  const [expandedFolders, setExpandedFolders] = useState<string[]>(['Packs']);

  const toggleFolder = (name: string) => {
    setExpandedFolders(prev => prev.includes(name) ? prev.filter(f => f !== name) : [...prev, name]);
  };

  if (!expanded) {
    return (
      <div className="w-6 flex flex-col items-center py-2 cursor-pointer" style={{ backgroundColor: FL_COLORS.bgDark }} onClick={onToggle}>
        <ChevronRight className="w-4 h-4" style={{ color: FL_COLORS.textDim }} />
      </div>
    );
  }

  return (
    <div className="w-48 flex flex-col border-r" style={{ backgroundColor: FL_COLORS.bgDark, borderColor: FL_COLORS.border }}>
      <div className="flex items-center justify-between px-2 py-1.5 border-b" style={{ borderColor: FL_COLORS.border }}>
        <span className="text-xs font-medium" style={{ color: FL_COLORS.text }}>Browser</span>
        <ChevronDown className="w-4 h-4 cursor-pointer hover:opacity-80" style={{ color: FL_COLORS.textDim }} onClick={onToggle} />
      </div>
      <div className="flex-1 overflow-y-auto p-1">
        {BROWSER_STRUCTURE.map((folder) => (
          <div key={folder.name}>
            <div
              className="flex items-center gap-1.5 px-1.5 py-1 rounded cursor-pointer hover:bg-white/5 transition-colors"
              onClick={() => toggleFolder(folder.name)}
            >
              {expandedFolders.includes(folder.name) ? (
                <ChevronDown className="w-3 h-3" style={{ color: FL_COLORS.textDim }} />
              ) : (
                <ChevronRight className="w-3 h-3" style={{ color: FL_COLORS.textDim }} />
              )}
              <Folder className="w-3.5 h-3.5" style={{ color: FL_COLORS.accent }} />
              <span className="text-xs truncate" style={{ color: FL_COLORS.text }}>{folder.name}</span>
            </div>
            {expandedFolders.includes(folder.name) && (
              <div className="ml-4 space-y-0.5">
                {folder.children.map((child) => (
                  <div key={child} className="flex items-center gap-1.5 px-1.5 py-0.5 rounded cursor-pointer hover:bg-white/5 transition-colors">
                    <Music className="w-3 h-3" style={{ color: FL_COLORS.textDim }} />
                    <span className="text-xs truncate" style={{ color: FL_COLORS.textDim }}>{child}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Pattern Selector
const PatternSelector: React.FC<{
  patterns: Pattern[];
  selectedPattern: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
}> = ({ patterns, selectedPattern, onSelect, onAdd }) => (
  <div className="flex items-center gap-1 px-2 py-1 border-b" style={{ backgroundColor: FL_COLORS.bg, borderColor: FL_COLORS.border }}>
    <span className="text-xs mr-2" style={{ color: FL_COLORS.textDim }}>Pattern:</span>
    <select
      value={selectedPattern}
      onChange={(e) => onSelect(e.target.value)}
      className="px-2 py-0.5 rounded text-xs focus:outline-none cursor-pointer"
      style={{ backgroundColor: FL_COLORS.bgLight, color: FL_COLORS.accent, border: 'none' }}
    >
      {patterns.map((p) => (
        <option key={p.id} value={p.id}>{p.name}</option>
      ))}
    </select>
    <button onClick={onAdd} className="p-1 rounded hover:bg-white/10 transition-colors" title="Add Pattern">
      <Plus className="w-3.5 h-3.5" style={{ color: FL_COLORS.accent }} />
    </button>
    <div className="flex-1" />
    <div className="flex items-center gap-1">
      {patterns.slice(0, 5).map((p) => (
        <button
          key={p.id}
          onClick={() => onSelect(p.id)}
          className="w-5 h-5 rounded text-xs font-bold transition-colors"
          style={{
            backgroundColor: selectedPattern === p.id ? p.color : FL_COLORS.bgLight,
            color: selectedPattern === p.id ? FL_COLORS.textBright : FL_COLORS.textDim
          }}
        >
          {patterns.indexOf(p) + 1}
        </button>
      ))}
    </div>
  </div>
);

// Channel Rack (Step Sequencer)
const ChannelRack: React.FC<{
  channels: Channel[];
  onToggleStep: (channelId: string, step: number) => void;
  onToggleMute: (channelId: string) => void;
  onToggleSolo: (channelId: string) => void;
  onVolumeChange: (channelId: string, volume: number) => void;
  onOpenPlugin: (channelId: string) => void;
  currentStep: number;
}> = ({ channels, onToggleStep, onToggleMute, onToggleSolo, onVolumeChange, onOpenPlugin, currentStep }) => (
  <div className="flex-1 overflow-auto" style={{ backgroundColor: FL_COLORS.bg }}>
    <div className="min-w-max">
      {/* Header */}
      <div className="flex items-center border-b sticky top-0" style={{ backgroundColor: FL_COLORS.bgDark, borderColor: FL_COLORS.border }}>
        <div className="w-36 px-2 py-1.5">
          <span className="text-xs font-medium" style={{ color: FL_COLORS.textDim }}>Channel</span>
        </div>
        <div className="flex-1 flex">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              className="w-6 text-center py-1.5"
              style={{
                backgroundColor: i % 4 === 0 ? FL_COLORS.stepBeat : 'transparent',
                color: FL_COLORS.textDim
              }}
            >
              <span className="text-[10px]">{i + 1}</span>
            </div>
          ))}
        </div>
        <div className="w-16 px-2 py-1.5 text-center">
          <span className="text-xs" style={{ color: FL_COLORS.textDim }}>Vol</span>
        </div>
      </div>

      {/* Channels */}
      {channels.map((channel) => (
        <div key={channel.id} className="flex items-center border-b hover:bg-white/5 transition-colors" style={{ borderColor: FL_COLORS.border }}>
          {/* Channel Info */}
          <div className="w-36 flex items-center gap-2 px-2 py-1.5">
            <div className="w-2 h-8 rounded" style={{ backgroundColor: channel.color }} />
            <div className="flex flex-col flex-1 min-w-0">
              <button
                onClick={() => onOpenPlugin(channel.id)}
                className="text-xs font-medium truncate text-left hover:opacity-80 transition-opacity"
                style={{ color: FL_COLORS.text }}
              >
                {channel.name}
              </button>
              <div className="flex items-center gap-1 mt-0.5">
                <button
                  onClick={() => onToggleMute(channel.id)}
                  className="px-1 py-0.5 rounded text-[10px] font-bold transition-colors"
                  style={{
                    backgroundColor: channel.muted ? FL_COLORS.accent : FL_COLORS.bgLight,
                    color: channel.muted ? FL_COLORS.textBright : FL_COLORS.textDim
                  }}
                >
                  M
                </button>
                <button
                  onClick={() => onToggleSolo(channel.id)}
                  className="px-1 py-0.5 rounded text-[10px] font-bold transition-colors"
                  style={{
                    backgroundColor: channel.solo ? FL_COLORS.highlight : FL_COLORS.bgLight,
                    color: channel.solo ? FL_COLORS.bgDark : FL_COLORS.textDim
                  }}
                >
                  S
                </button>
              </div>
            </div>
          </div>

          {/* Step Sequencer */}
          <div className="flex-1 flex">
            {channel.steps.map((active, i) => (
              <button
                key={i}
                onClick={() => onToggleStep(channel.id, i)}
                className="w-6 h-10 border-r transition-all"
                style={{
                  backgroundColor: active
                    ? currentStep === i ? FL_COLORS.accentLight : channel.color
                    : currentStep === i ? FL_COLORS.bgLighter : (i % 4 === 0 ? FL_COLORS.stepBeat : FL_COLORS.stepOff),
                  borderColor: FL_COLORS.border,
                  opacity: channel.muted ? 0.4 : 1
                }}
              />
            ))}
          </div>

          {/* Volume Slider */}
          <div className="w-16 px-2 py-1.5 flex items-center justify-center">
            <input
              type="range"
              min="0"
              max="100"
              value={channel.volume}
              onChange={(e) => onVolumeChange(channel.id, parseInt(e.target.value))}
              className="w-12 h-1 appearance-none cursor-pointer rounded"
              style={{
                background: `linear-gradient(to right, ${FL_COLORS.accent} ${channel.volume}%, ${FL_COLORS.bgLight} ${channel.volume}%)`
              }}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Playlist View
const PlaylistView: React.FC<{
  blocks: PlaylistBlock[];
  patterns: Pattern[];
  totalBars: number;
  onBlockClick: (blockId: string) => void;
}> = ({ blocks, patterns, totalBars, onBlockClick }) => {
  const tracks = 8;
  const barWidth = 60;

  const getPattern = (id: string) => patterns.find(p => p.id === id);

  return (
    <div className="flex-1 overflow-auto" style={{ backgroundColor: FL_COLORS.bgDark }}>
      <div className="min-w-max min-h-full">
        {/* Timeline Header */}
        <div className="flex items-center border-b sticky top-0" style={{ backgroundColor: FL_COLORS.bg, borderColor: FL_COLORS.border }}>
          <div className="w-24 px-2 py-1.5">
            <span className="text-xs font-medium" style={{ color: FL_COLORS.textDim }}>Track</span>
          </div>
          <div className="flex">
            {Array.from({ length: totalBars }).map((_, i) => (
              <div
                key={i}
                className="text-center py-1.5 border-l"
                style={{
                  width: barWidth,
                  backgroundColor: i % 4 === 0 ? FL_COLORS.bgLight : 'transparent',
                  borderColor: FL_COLORS.border,
                  color: FL_COLORS.textDim
                }}
              >
                <span className="text-[10px]">{i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tracks */}
        {Array.from({ length: tracks }).map((_, trackIdx) => (
          <div key={trackIdx} className="flex items-center border-b" style={{ borderColor: FL_COLORS.border, height: 32 }}>
            {/* Track Label */}
            <div className="w-24 px-2 flex items-center gap-2">
              <span className="text-xs" style={{ color: FL_COLORS.textDim }}>Track {trackIdx + 1}</span>
            </div>

            {/* Track Content */}
            <div className="relative flex-1" style={{ height: 28 }}>
              {/* Grid Lines */}
              <div className="absolute inset-0 flex">
                {Array.from({ length: totalBars }).map((_, i) => (
                  <div
                    key={i}
                    className="border-l"
                    style={{
                      width: barWidth,
                      backgroundColor: i % 4 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                      borderColor: FL_COLORS.border
                    }}
                  />
                ))}
              </div>

              {/* Pattern Blocks */}
              {blocks.filter(b => b.track === trackIdx).map((block) => {
                const pattern = getPattern(block.patternId);
                if (!pattern) return null;
                return (
                  <div
                    key={block.id}
                    onClick={() => onBlockClick(block.id)}
                    className="absolute top-0.5 bottom-0.5 rounded cursor-pointer hover:brightness-110 transition-all"
                    style={{
                      left: block.startBar * barWidth,
                      width: block.length * barWidth - 2,
                      backgroundColor: pattern.color,
                      opacity: 0.85
                    }}
                  >
                    <span className="text-[10px] font-medium px-1 truncate block" style={{ color: FL_COLORS.textBright }}>
                      {pattern.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Piano Roll
const PianoRoll: React.FC<{
  notes: PianoNote[];
  onNoteClick: (noteId: string) => void;
  toolMode: ToolMode;
}> = ({ notes, onNoteClick, toolMode }) => {
  const octaves = 2;
  const notesPerOctave = 12;
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const isBlackKey = (i: number) => [1, 3, 6, 8, 10].includes(i % 12);
  const bars = 8;
  const beatWidth = 30;

  return (
    <div className="flex-1 flex overflow-hidden" style={{ backgroundColor: FL_COLORS.piano.roll }}>
      {/* Piano Keys */}
      <div className="w-16 flex-shrink-0 border-r" style={{ borderColor: FL_COLORS.border }}>
        {Array.from({ length: octaves * notesPerOctave }).reverse().map((_, i) => {
          const noteIdx = (octaves * notesPerOctave - 1 - i) % 12;
          const octave = Math.floor((octaves * notesPerOctave - 1 - i) / 12) + 3;
          const black = isBlackKey(noteIdx);
          return (
            <div
              key={i}
              className="h-4 flex items-center justify-end pr-1 text-[9px] font-medium border-b"
              style={{
                backgroundColor: black ? FL_COLORS.piano.black : FL_COLORS.piano.white,
                borderColor: FL_COLORS.border,
                color: black ? FL_COLORS.text : FL_COLORS.bgDark
              }}
            >
              {noteNames[noteIdx]}{octave}
            </div>
          );
        })}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto">
        <div className="relative" style={{ width: bars * 4 * beatWidth, height: octaves * notesPerOctave * 16 }}>
          {/* Grid Lines */}
          {Array.from({ length: octaves * notesPerOctave }).map((_, row) => (
            <div
              key={row}
              className="absolute w-full h-4 border-b"
              style={{
                top: row * 16,
                backgroundColor: isBlackKey((octaves * notesPerOctave - 1 - row) % 12) ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.02)',
                borderColor: FL_COLORS.border
              }}
            />
          ))}

          {/* Beat Lines */}
          {Array.from({ length: bars * 4 + 1 }).map((_, col) => (
            <div
              key={col}
              className="absolute top-0 bottom-0 w-px"
              style={{
                left: col * beatWidth,
                backgroundColor: col % 4 === 0 ? FL_COLORS.borderLight : FL_COLORS.border
              }}
            />
          ))}

          {/* Notes */}
          {notes.map((note) => (
            <div
              key={note.id}
              onClick={() => onNoteClick(note.id)}
              className="absolute rounded cursor-pointer hover:brightness-110 transition-all"
              style={{
                left: note.start * beatWidth,
                top: ((octaves * notesPerOctave) - 1 - note.pitch) * 16,
                width: note.duration * beatWidth - 1,
                height: 15,
                backgroundColor: FL_COLORS.accent,
                opacity: 0.8 + (note.velocity / 500)
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Mixer View
const MixerView: React.FC<{
  channels: MixerChannel[];
  onVolumeChange: (id: string, volume: number) => void;
  onPanChange: (id: string, pan: number) => void;
  onToggleMute: (id: string) => void;
  onToggleSolo: (id: string) => void;
}> = ({ channels, onVolumeChange, onPanChange, onToggleMute, onToggleSolo }) => (
  <div className="flex-1 flex overflow-x-auto p-2 gap-1" style={{ backgroundColor: FL_COLORS.bgDark }}>
    {channels.map((channel, idx) => (
      <div
        key={channel.id}
        className="flex flex-col items-center p-1.5 rounded min-w-[60px]"
        style={{ backgroundColor: FL_COLORS.bg }}
      >
        {/* Channel Name */}
        <div className="w-full text-center mb-1 truncate">
          <span className="text-[10px] font-medium" style={{ color: idx === 0 ? FL_COLORS.accent : FL_COLORS.text }}>
            {channel.name}
          </span>
        </div>

        {/* Effects Slots */}
        <div className="w-full space-y-0.5 mb-2">
          {[0, 1, 2].map((slot) => (
            <div
              key={slot}
              className="w-full h-4 rounded text-[8px] text-center leading-4 truncate"
              style={{
                backgroundColor: channel.effects[slot] ? FL_COLORS.bgLight : FL_COLORS.bgDark,
                color: FL_COLORS.textDim
              }}
            >
              {channel.effects[slot] || ''}
            </div>
          ))}
        </div>

        {/* Pan Knob */}
        <div className="relative w-8 h-8 mb-2">
          <div
            className="absolute inset-0 rounded-full border-2"
            style={{ borderColor: FL_COLORS.border }}
          />
          <div
            className="absolute top-1/2 left-1/2 w-0.5 h-3 origin-bottom rounded"
            style={{
              backgroundColor: FL_COLORS.accent,
              transform: `translate(-50%, -100%) rotate(${channel.pan * 1.35}deg)`
            }}
          />
        </div>

        {/* Volume Meter */}
        <div className="relative w-4 h-32 rounded mb-2" style={{ backgroundColor: FL_COLORS.bgDark }}>
          <div
            className="absolute bottom-0 left-0 right-0 rounded transition-all"
            style={{
              height: `${channel.volume}%`,
              background: channel.volume > 90 ? `linear-gradient(to top, ${FL_COLORS.meter}, ${FL_COLORS.meterYellow}, ${FL_COLORS.meterRed})`
                : channel.volume > 70 ? `linear-gradient(to top, ${FL_COLORS.meter}, ${FL_COLORS.meterYellow})`
                : FL_COLORS.meter
            }}
          />
        </div>

        {/* Mute/Solo Buttons */}
        <div className="flex gap-1 mb-1">
          <button
            onClick={() => onToggleMute(channel.id)}
            className="w-5 h-5 rounded text-[10px] font-bold transition-colors"
            style={{
              backgroundColor: channel.muted ? FL_COLORS.accent : FL_COLORS.bgLight,
              color: channel.muted ? FL_COLORS.textBright : FL_COLORS.textDim
            }}
          >
            M
          </button>
          <button
            onClick={() => onToggleSolo(channel.id)}
            className="w-5 h-5 rounded text-[10px] font-bold transition-colors"
            style={{
              backgroundColor: channel.solo ? FL_COLORS.highlight : FL_COLORS.bgLight,
              color: channel.solo ? FL_COLORS.bgDark : FL_COLORS.textDim
            }}
          >
            S
          </button>
        </div>

        {/* Color Indicator */}
        <div className="w-full h-1 rounded" style={{ backgroundColor: channel.color }} />
      </div>
    ))}
  </div>
);

// Plugin Window Mockup
const PluginWindow: React.FC<{
  name: string;
  type: 'sytrus' | 'grossbeat' | 'edison' | 'default';
  onClose: () => void;
}> = ({ name, type, onClose }) => (
  <div
    className="absolute rounded-lg shadow-2xl overflow-hidden border z-50"
    style={{
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: FL_COLORS.bgDark,
      borderColor: FL_COLORS.border,
      width: type === 'sytrus' ? 480 : type === 'grossbeat' ? 400 : 360,
      height: type === 'sytrus' ? 320 : type === 'grossbeat' ? 280 : 240
    }}
  >
    {/* Plugin Title Bar */}
    <div className="flex items-center justify-between px-2 py-1.5 border-b" style={{ backgroundColor: FL_COLORS.bg, borderColor: FL_COLORS.border }}>
      <div className="flex items-center gap-2">
        <Wand2 className="w-4 h-4" style={{ color: FL_COLORS.accent }} />
        <span className="text-xs font-medium" style={{ color: FL_COLORS.text }}>{name}</span>
      </div>
      <button onClick={onClose} className="p-1 rounded hover:bg-white/10 transition-colors">
        <X className="w-3.5 h-3.5" style={{ color: FL_COLORS.textDim }} />
      </button>
    </div>

    {/* Plugin Content */}
    <div className="p-4 flex flex-col items-center justify-center h-full">
      {type === 'sytrus' && (
        <>
          <div className="text-2xl font-bold mb-2" style={{ color: FL_COLORS.accent }}>SYTRUS</div>
          <div className="grid grid-cols-6 gap-2 mb-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-10 h-10 rounded-full border-2 flex items-center justify-center" style={{ borderColor: FL_COLORS.accent }}>
                <span className="text-xs" style={{ color: FL_COLORS.text }}>OP{i + 1}</span>
              </div>
            ))}
          </div>
          <div className="w-full h-24 rounded border" style={{ backgroundColor: FL_COLORS.bgLight, borderColor: FL_COLORS.border }}>
            <div className="p-2 text-xs" style={{ color: FL_COLORS.textDim }}>FM Matrix / Waveform Display</div>
          </div>
        </>
      )}

      {type === 'grossbeat' && (
        <>
          <div className="text-xl font-bold mb-2" style={{ color: FL_COLORS.highlight }}>Gross Beat</div>
          <div className="w-full h-32 rounded border relative" style={{ backgroundColor: FL_COLORS.bgLight, borderColor: FL_COLORS.border }}>
            <svg className="w-full h-full" viewBox="0 0 100 50">
              <path d="M0,25 Q25,10 50,25 T100,25" fill="none" stroke={FL_COLORS.accent} strokeWidth="2" />
              <path d="M0,35 L25,35 L25,15 L50,15 L50,35 L75,35 L75,15 L100,15" fill="none" stroke={FL_COLORS.highlight} strokeWidth="1.5" />
            </svg>
          </div>
          <div className="flex gap-2 mt-4">
            {['Time', 'Volume', 'Pitch'].map((label) => (
              <button key={label} className="px-3 py-1 rounded text-xs" style={{ backgroundColor: FL_COLORS.bgLight, color: FL_COLORS.text }}>
                {label}
              </button>
            ))}
          </div>
        </>
      )}

      {type === 'edison' && (
        <>
          <div className="text-xl font-bold mb-2" style={{ color: '#00aaff' }}>Edison</div>
          <div className="w-full h-24 rounded border relative overflow-hidden" style={{ backgroundColor: '#001a33', borderColor: FL_COLORS.border }}>
            <svg className="w-full h-full" viewBox="0 0 200 50">
              {Array.from({ length: 100 }).map((_, i) => {
                const h = Math.random() * 40 + 5;
                return (
                  <rect key={i} x={i * 2} y={25 - h/2} width="1.5" height={h} fill="#00aaff" opacity="0.8" />
                );
              })}
            </svg>
          </div>
          <div className="flex gap-2 mt-4">
            <button className="px-2 py-1 rounded text-xs" style={{ backgroundColor: FL_COLORS.bgLight, color: FL_COLORS.text }}>
              <Scissors className="w-3 h-3" />
            </button>
            <button className="px-2 py-1 rounded text-xs" style={{ backgroundColor: FL_COLORS.bgLight, color: FL_COLORS.text }}>
              <Copy className="w-3 h-3" />
            </button>
            <button className="px-2 py-1 rounded text-xs" style={{ backgroundColor: FL_COLORS.bgLight, color: FL_COLORS.text }}>
              <Waves className="w-3 h-3" />
            </button>
          </div>
        </>
      )}

      {type === 'default' && (
        <div className="text-center">
          <Sliders className="w-12 h-12 mb-2 mx-auto" style={{ color: FL_COLORS.accent }} />
          <div className="text-lg font-medium" style={{ color: FL_COLORS.text }}>{name}</div>
          <div className="text-xs mt-1" style={{ color: FL_COLORS.textDim }}>Plugin Interface</div>
        </div>
      )}
    </div>
  </div>
);

// View Tabs
const ViewTabs: React.FC<{
  activeView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}> = ({ activeView, onViewChange }) => (
  <div className="flex items-center border-b" style={{ backgroundColor: FL_COLORS.bgDark, borderColor: FL_COLORS.border }}>
    {[
      { id: 'channel', label: 'Channel Rack', icon: Grid3X3 },
      { id: 'playlist', label: 'Playlist', icon: Music },
      { id: 'piano', label: 'Piano Roll', icon: Waves },
      { id: 'mixer', label: 'Mixer', icon: Sliders },
    ].map((tab) => (
      <button
        key={tab.id}
        onClick={() => onViewChange(tab.id as ViewMode)}
        className="flex items-center gap-1.5 px-3 py-2 border-r transition-colors"
        style={{
          backgroundColor: activeView === tab.id ? FL_COLORS.bg : 'transparent',
          borderColor: FL_COLORS.border,
          color: activeView === tab.id ? FL_COLORS.accent : FL_COLORS.textDim
        }}
      >
        <tab.icon className="w-4 h-4" />
        <span className="text-xs font-medium">{tab.label}</span>
      </button>
    ))}
  </div>
);

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const ZFLStudioWindow: React.FC<ZFLStudioWindowProps> = ({ onClose, onFocus }) => {
  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [bpm, setBpm] = useState(140);
  const [position, setPosition] = useState('001:01:000');
  const [currentStep, setCurrentStep] = useState(-1);

  const [activeView, setActiveView] = useState<ViewMode>('channel');
  const [toolMode, setToolMode] = useState<ToolMode>('draw');
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [magnetEnabled, setMagnetEnabled] = useState(true);
  const [browserExpanded, setBrowserExpanded] = useState(true);

  const [channels, setChannels] = useState<Channel[]>(INITIAL_CHANNELS);
  const [patterns, setPatterns] = useState<Pattern[]>(INITIAL_PATTERNS);
  const [selectedPattern, setSelectedPattern] = useState('pat1');
  const [playlistBlocks] = useState<PlaylistBlock[]>(INITIAL_PLAYLIST);
  const [mixerChannels, setMixerChannels] = useState<MixerChannel[]>(INITIAL_MIXER);
  const [pianoNotes] = useState<PianoNote[]>([
    { id: 'n1', pitch: 12, start: 0, duration: 2, velocity: 100 },
    { id: 'n2', pitch: 16, start: 2, duration: 1, velocity: 90 },
    { id: 'n3', pitch: 19, start: 3, duration: 1, velocity: 85 },
    { id: 'n4', pitch: 12, start: 4, duration: 2, velocity: 100 },
    { id: 'n5', pitch: 14, start: 6, duration: 2, velocity: 95 },
  ]);

  const [openPlugin, setOpenPlugin] = useState<{ name: string; type: 'sytrus' | 'grossbeat' | 'edison' | 'default' } | null>(null);

  // Playback simulation
  React.useEffect(() => {
    if (!isPlaying) {
      setCurrentStep(-1);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % 16);
    }, (60 / bpm) * 1000 / 4);

    return () => clearInterval(interval);
  }, [isPlaying, bpm]);

  // Handlers
  const handlePlay = useCallback(() => setIsPlaying((prev) => !prev), []);
  const handleStop = useCallback(() => { setIsPlaying(false); setCurrentStep(-1); }, []);
  const handleRecord = useCallback(() => setIsRecording((prev) => !prev), []);

  const handleToggleStep = useCallback((channelId: string, step: number) => {
    setChannels((prev) => prev.map((ch) =>
      ch.id === channelId
        ? { ...ch, steps: ch.steps.map((s, i) => i === step ? !s : s) }
        : ch
    ));
  }, []);

  const handleToggleChannelMute = useCallback((channelId: string) => {
    setChannels((prev) => prev.map((ch) => ch.id === channelId ? { ...ch, muted: !ch.muted } : ch));
  }, []);

  const handleToggleChannelSolo = useCallback((channelId: string) => {
    setChannels((prev) => prev.map((ch) => ch.id === channelId ? { ...ch, solo: !ch.solo } : ch));
  }, []);

  const handleChannelVolumeChange = useCallback((channelId: string, volume: number) => {
    setChannels((prev) => prev.map((ch) => ch.id === channelId ? { ...ch, volume } : ch));
  }, []);

  const handleMixerVolumeChange = useCallback((id: string, volume: number) => {
    setMixerChannels((prev) => prev.map((ch) => ch.id === id ? { ...ch, volume } : ch));
  }, []);

  const handleMixerPanChange = useCallback((id: string, pan: number) => {
    setMixerChannels((prev) => prev.map((ch) => ch.id === id ? { ...ch, pan } : ch));
  }, []);

  const handleToggleMixerMute = useCallback((id: string) => {
    setMixerChannels((prev) => prev.map((ch) => ch.id === id ? { ...ch, muted: !ch.muted } : ch));
  }, []);

  const handleToggleMixerSolo = useCallback((id: string) => {
    setMixerChannels((prev) => prev.map((ch) => ch.id === id ? { ...ch, solo: !ch.solo } : ch));
  }, []);

  const handleOpenChannelPlugin = useCallback((channelId: string) => {
    const channel = channels.find((ch) => ch.id === channelId);
    if (channel) {
      const pluginType = channel.pluginIcon === 'sytrus' ? 'sytrus'
        : channel.pluginIcon === 'grossbeat' ? 'grossbeat'
        : 'default';
      setOpenPlugin({ name: channel.name, type: pluginType });
    }
  }, [channels]);

  const handleAddPattern = useCallback(() => {
    const newPattern: Pattern = {
      id: `pat${patterns.length + 1}`,
      name: `Pattern ${patterns.length + 1}`,
      color: FL_COLORS.channels[patterns.length % FL_COLORS.channels.length],
      bars: 4
    };
    setPatterns((prev) => [...prev, newPattern]);
    setSelectedPattern(newPattern.id);
  }, [patterns.length]);

  return (
    <ZWindow
      title="FL Studio 21"
      onClose={onClose}
      onFocus={onFocus}
      defaultWidth={1100}
      defaultHeight={700}
      minWidth={900}
      minHeight={600}
      defaultPosition={{ x: 80, y: 60 }}
      windowType="default"
    >
      <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: FL_COLORS.bg }}>
        {/* Transport */}
        <TransportPanel
          isPlaying={isPlaying}
          isRecording={isRecording}
          bpm={bpm}
          position={position}
          onPlay={handlePlay}
          onStop={handleStop}
          onRecord={handleRecord}
          onBpmChange={setBpm}
        />

        {/* Toolbar */}
        <Toolbar
          toolMode={toolMode}
          snapEnabled={snapEnabled}
          magnetEnabled={magnetEnabled}
          onToolChange={setToolMode}
          onSnapToggle={() => setSnapEnabled(!snapEnabled)}
          onMagnetToggle={() => setMagnetEnabled(!magnetEnabled)}
        />

        {/* Pattern Selector */}
        <PatternSelector
          patterns={patterns}
          selectedPattern={selectedPattern}
          onSelect={setSelectedPattern}
          onAdd={handleAddPattern}
        />

        {/* View Tabs */}
        <ViewTabs activeView={activeView} onViewChange={setActiveView} />

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Browser */}
          <BrowserPanel expanded={browserExpanded} onToggle={() => setBrowserExpanded(!browserExpanded)} />

          {/* Active View */}
          {activeView === 'channel' && (
            <ChannelRack
              channels={channels}
              onToggleStep={handleToggleStep}
              onToggleMute={handleToggleChannelMute}
              onToggleSolo={handleToggleChannelSolo}
              onVolumeChange={handleChannelVolumeChange}
              onOpenPlugin={handleOpenChannelPlugin}
              currentStep={currentStep}
            />
          )}

          {activeView === 'playlist' && (
            <PlaylistView
              blocks={playlistBlocks}
              patterns={patterns}
              totalBars={16}
              onBlockClick={() => {}}
            />
          )}

          {activeView === 'piano' && (
            <PianoRoll
              notes={pianoNotes}
              onNoteClick={() => {}}
              toolMode={toolMode}
            />
          )}

          {activeView === 'mixer' && (
            <MixerView
              channels={mixerChannels}
              onVolumeChange={handleMixerVolumeChange}
              onPanChange={handleMixerPanChange}
              onToggleMute={handleToggleMixerMute}
              onToggleSolo={handleToggleMixerSolo}
            />
          )}

          {/* Plugin Window */}
          {openPlugin && (
            <PluginWindow
              name={openPlugin.name}
              type={openPlugin.type}
              onClose={() => setOpenPlugin(null)}
            />
          )}
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between px-3 py-1 border-t" style={{ backgroundColor: FL_COLORS.bgDark, borderColor: FL_COLORS.border }}>
          <div className="flex items-center gap-4">
            <span className="text-[10px]" style={{ color: FL_COLORS.textDim }}>CPU: 12%</span>
            <span className="text-[10px]" style={{ color: FL_COLORS.textDim }}>RAM: 342MB</span>
            <span className="text-[10px]" style={{ color: FL_COLORS.textDim }}>Polyphony: 24</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-1 rounded hover:bg-white/10 transition-colors" title="Edison">
              <Waves className="w-3.5 h-3.5" style={{ color: '#00aaff' }} />
            </button>
            <button
              className="p-1 rounded hover:bg-white/10 transition-colors"
              title="Edison"
              onClick={() => setOpenPlugin({ name: 'Edison', type: 'edison' })}
            >
              <Mic className="w-3.5 h-3.5" style={{ color: FL_COLORS.textDim }} />
            </button>
            <button className="p-1 rounded hover:bg-white/10 transition-colors" title="Headphones">
              <Headphones className="w-3.5 h-3.5" style={{ color: FL_COLORS.textDim }} />
            </button>
            <span className="text-[10px]" style={{ color: FL_COLORS.accent }}>ASIO 256 smp @ 44.1kHz</span>
          </div>
        </div>
      </div>
    </ZWindow>
  );
};

export default ZFLStudioWindow;
