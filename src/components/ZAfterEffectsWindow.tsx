import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import ZWindow from './ZWindow';
import { cn } from '@/lib/utils';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Eye, EyeOff, Lock, Unlock, ChevronRight, ChevronDown,
  Folder, Film, Image, Music, Settings, Layers, Box,
  Move, Hand, ZoomIn, RotateCcw, Anchor, Type, Square,
  Circle, Minus, Plus, Search, MoreHorizontal, X,
  Diamond, Star, Sparkles, Wand2, Palette, Sliders,
  Video, FileVideo, FileImage, FileAudio, Clock,
  GripVertical, Link2, Unlink, RefreshCw, FastForward
} from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

interface Keyframe {
  id: string;
  time: number;
  value: number | number[];
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'hold';
}

interface Property {
  name: string;
  value: number | number[];
  keyframes: Keyframe[];
  expanded?: boolean;
}

interface Layer {
  id: string;
  name: string;
  type: 'solid' | 'shape' | 'text' | 'footage' | 'composition' | 'null' | 'adjustment' | 'audio';
  color: string;
  visible: boolean;
  solo: boolean;
  locked: boolean;
  shy: boolean;
  effects: boolean;
  motionBlur: boolean;
  threeD: boolean;
  parent: string | null;
  inPoint: number;
  outPoint: number;
  startTime: number;
  duration: number;
  properties: {
    position: Property;
    scale: Property;
    rotation: Property;
    opacity: Property;
    anchorPoint?: Property;
  };
  expanded: boolean;
  selected: boolean;
}

interface Composition {
  id: string;
  name: string;
  width: number;
  height: number;
  frameRate: number;
  duration: number;
  backgroundColor: string;
  layers: Layer[];
}

interface FootageItem {
  id: string;
  name: string;
  type: 'video' | 'image' | 'audio' | 'composition' | 'solid' | 'folder';
  duration?: number;
  frameRate?: number;
  width?: number;
  height?: number;
  children?: FootageItem[];
  expanded?: boolean;
}

interface Effect {
  id: string;
  name: string;
  category: string;
  icon: React.ReactNode;
}

type ToolType = 'selection' | 'hand' | 'zoom' | 'rotate' | 'panBehind' | 'text' | 'shape' | 'pen';
type PanelType = 'project' | 'effects' | 'info';

interface ZAfterEffectsWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const LAYER_COLORS = [
  '#FF4444', '#FF8844', '#FFDD44', '#88DD44', '#44DD88',
  '#44DDDD', '#4488DD', '#8844DD', '#DD44DD', '#DD4488'
];

const EFFECTS_LIST: Effect[] = [
  { id: 'blur-gaussian', name: 'Gaussian Blur', category: 'Blur & Sharpen', icon: <Circle className="w-3 h-3" /> },
  { id: 'blur-motion', name: 'Motion Blur', category: 'Blur & Sharpen', icon: <Minus className="w-3 h-3" /> },
  { id: 'blur-radial', name: 'Radial Blur', category: 'Blur & Sharpen', icon: <RefreshCw className="w-3 h-3" /> },
  { id: 'color-curves', name: 'Curves', category: 'Color Correction', icon: <Sliders className="w-3 h-3" /> },
  { id: 'color-levels', name: 'Levels', category: 'Color Correction', icon: <Sliders className="w-3 h-3" /> },
  { id: 'color-hue', name: 'Hue/Saturation', category: 'Color Correction', icon: <Palette className="w-3 h-3" /> },
  { id: 'distort-warp', name: 'Bezier Warp', category: 'Distort', icon: <Box className="w-3 h-3" /> },
  { id: 'distort-bulge', name: 'Bulge', category: 'Distort', icon: <Circle className="w-3 h-3" /> },
  { id: 'generate-fill', name: 'Fill', category: 'Generate', icon: <Square className="w-3 h-3" /> },
  { id: 'generate-gradient', name: 'Gradient Ramp', category: 'Generate', icon: <Minus className="w-3 h-3" /> },
  { id: 'glow', name: 'Glow', category: 'Stylize', icon: <Sparkles className="w-3 h-3" /> },
  { id: 'drop-shadow', name: 'Drop Shadow', category: 'Perspective', icon: <Square className="w-3 h-3" /> },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function formatTimecode(frames: number, fps: number): string {
  const totalSeconds = frames / fps;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const remainingFrames = Math.floor(frames % fps);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${remainingFrames.toString().padStart(2, '0')}`;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

// =============================================================================
// DEMO DATA
// =============================================================================

function createDemoLayers(): Layer[] {
  return [
    {
      id: 'layer-1',
      name: 'Title Text',
      type: 'text',
      color: LAYER_COLORS[0],
      visible: true,
      solo: false,
      locked: false,
      shy: false,
      effects: true,
      motionBlur: true,
      threeD: false,
      parent: null,
      inPoint: 0,
      outPoint: 150,
      startTime: 0,
      duration: 150,
      properties: {
        position: { name: 'Position', value: [960, 540], keyframes: [
          { id: 'k1', time: 0, value: [960, 800], easing: 'ease-out' },
          { id: 'k2', time: 30, value: [960, 540], easing: 'ease-in-out' },
        ], expanded: false },
        scale: { name: 'Scale', value: [100, 100], keyframes: [
          { id: 'k3', time: 0, value: [50, 50], easing: 'ease-out' },
          { id: 'k4', time: 30, value: [100, 100], easing: 'ease-in-out' },
        ], expanded: false },
        rotation: { name: 'Rotation', value: 0, keyframes: [], expanded: false },
        opacity: { name: 'Opacity', value: 100, keyframes: [
          { id: 'k5', time: 0, value: 0, easing: 'linear' },
          { id: 'k6', time: 15, value: 100, easing: 'linear' },
        ], expanded: false },
      },
      expanded: true,
      selected: true,
    },
    {
      id: 'layer-2',
      name: 'Logo',
      type: 'composition',
      color: LAYER_COLORS[1],
      visible: true,
      solo: false,
      locked: false,
      shy: false,
      effects: false,
      motionBlur: false,
      threeD: false,
      parent: null,
      inPoint: 15,
      outPoint: 180,
      startTime: 15,
      duration: 165,
      properties: {
        position: { name: 'Position', value: [960, 300], keyframes: [], expanded: false },
        scale: { name: 'Scale', value: [75, 75], keyframes: [
          { id: 'k7', time: 15, value: [0, 0], easing: 'ease-out' },
          { id: 'k8', time: 45, value: [80, 80], easing: 'ease-in-out' },
          { id: 'k9', time: 60, value: [75, 75], easing: 'ease-in-out' },
        ], expanded: false },
        rotation: { name: 'Rotation', value: 0, keyframes: [], expanded: false },
        opacity: { name: 'Opacity', value: 100, keyframes: [], expanded: false },
      },
      expanded: false,
      selected: false,
    },
    {
      id: 'layer-3',
      name: 'Particle Background',
      type: 'solid',
      color: LAYER_COLORS[4],
      visible: true,
      solo: false,
      locked: false,
      shy: false,
      effects: true,
      motionBlur: false,
      threeD: false,
      parent: null,
      inPoint: 0,
      outPoint: 300,
      startTime: 0,
      duration: 300,
      properties: {
        position: { name: 'Position', value: [960, 540], keyframes: [], expanded: false },
        scale: { name: 'Scale', value: [100, 100], keyframes: [], expanded: false },
        rotation: { name: 'Rotation', value: 0, keyframes: [], expanded: false },
        opacity: { name: 'Opacity', value: 100, keyframes: [], expanded: false },
      },
      expanded: false,
      selected: false,
    },
    {
      id: 'layer-4',
      name: 'Audio Track',
      type: 'audio',
      color: LAYER_COLORS[6],
      visible: true,
      solo: false,
      locked: false,
      shy: false,
      effects: false,
      motionBlur: false,
      threeD: false,
      parent: null,
      inPoint: 0,
      outPoint: 300,
      startTime: 0,
      duration: 300,
      properties: {
        position: { name: 'Position', value: [0, 0], keyframes: [], expanded: false },
        scale: { name: 'Scale', value: [100, 100], keyframes: [], expanded: false },
        rotation: { name: 'Rotation', value: 0, keyframes: [], expanded: false },
        opacity: { name: 'Opacity', value: 100, keyframes: [], expanded: false },
      },
      expanded: false,
      selected: false,
    },
    {
      id: 'layer-5',
      name: 'Background Solid',
      type: 'solid',
      color: LAYER_COLORS[8],
      visible: true,
      solo: false,
      locked: true,
      shy: false,
      effects: false,
      motionBlur: false,
      threeD: false,
      parent: null,
      inPoint: 0,
      outPoint: 300,
      startTime: 0,
      duration: 300,
      properties: {
        position: { name: 'Position', value: [960, 540], keyframes: [], expanded: false },
        scale: { name: 'Scale', value: [100, 100], keyframes: [], expanded: false },
        rotation: { name: 'Rotation', value: 0, keyframes: [], expanded: false },
        opacity: { name: 'Opacity', value: 100, keyframes: [], expanded: false },
      },
      expanded: false,
      selected: false,
    },
  ];
}

function createDemoProject(): FootageItem[] {
  return [
    {
      id: 'folder-1',
      name: 'Compositions',
      type: 'folder',
      expanded: true,
      children: [
        { id: 'comp-1', name: 'Main Comp', type: 'composition', width: 1920, height: 1080, frameRate: 30, duration: 300 },
        { id: 'comp-2', name: 'Logo Animation', type: 'composition', width: 1920, height: 1080, frameRate: 30, duration: 90 },
        { id: 'comp-3', name: 'Lower Third', type: 'composition', width: 1920, height: 1080, frameRate: 30, duration: 150 },
      ],
    },
    {
      id: 'folder-2',
      name: 'Footage',
      type: 'folder',
      expanded: true,
      children: [
        { id: 'footage-1', name: 'interview_01.mp4', type: 'video', width: 1920, height: 1080, frameRate: 24, duration: 1800 },
        { id: 'footage-2', name: 'b-roll_city.mov', type: 'video', width: 4096, height: 2160, frameRate: 60, duration: 600 },
        { id: 'footage-3', name: 'background.jpg', type: 'image', width: 3840, height: 2160 },
      ],
    },
    {
      id: 'folder-3',
      name: 'Audio',
      type: 'folder',
      expanded: false,
      children: [
        { id: 'audio-1', name: 'music_track.mp3', type: 'audio', duration: 180 },
        { id: 'audio-2', name: 'voiceover.wav', type: 'audio', duration: 120 },
      ],
    },
    {
      id: 'solid-1',
      name: 'Black Solid',
      type: 'solid',
      width: 1920,
      height: 1080,
    },
  ];
}

// =============================================================================
// COMPONENTS
// =============================================================================

const ToolButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  shortcut?: string;
}> = ({ icon, label, active, onClick, shortcut }) => (
  <button
    onClick={onClick}
    title={`${label}${shortcut ? ` (${shortcut})` : ''}`}
    className={cn(
      "p-1.5 rounded transition-colors",
      active ? "bg-[#5a5aff] text-white" : "text-gray-300 hover:bg-white/10"
    )}
  >
    {icon}
  </button>
);

const ProjectPanel: React.FC<{
  items: FootageItem[];
  onToggleFolder: (id: string) => void;
  selectedItemId: string | null;
  onSelectItem: (id: string) => void;
}> = ({ items, onToggleFolder, selectedItemId, onSelectItem }) => {
  const renderItem = (item: FootageItem, depth: number = 0) => {
    const isFolder = item.type === 'folder';
    const Icon = {
      folder: Folder,
      video: FileVideo,
      image: FileImage,
      audio: FileAudio,
      composition: Film,
      solid: Square,
    }[item.type] || FileVideo;

    return (
      <div key={item.id}>
        <div
          className={cn(
            "flex items-center gap-1.5 px-2 py-1 cursor-pointer text-xs",
            selectedItemId === item.id ? "bg-[#5a5aff]/30" : "hover:bg-white/5"
          )}
          style={{ paddingLeft: `${8 + depth * 16}px` }}
          onClick={() => {
            if (isFolder) onToggleFolder(item.id);
            else onSelectItem(item.id);
          }}
          onDoubleClick={() => onSelectItem(item.id)}
        >
          {isFolder && (
            <span className="w-3 h-3 flex items-center justify-center text-gray-500">
              {item.expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </span>
          )}
          {!isFolder && <span className="w-3" />}
          <Icon className={cn("w-3.5 h-3.5", item.type === 'composition' ? "text-purple-400" : "text-gray-400")} />
          <span className="text-gray-200 truncate flex-1">{item.name}</span>
          {item.frameRate && <span className="text-gray-500 text-[10px]">{item.frameRate}fps</span>}
        </div>
        {isFolder && item.expanded && item.children?.map(child => renderItem(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-auto">
      {items.map(item => renderItem(item))}
    </div>
  );
};

const EffectsPanel: React.FC<{
  effects: Effect[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
}> = ({ effects, searchQuery, onSearchChange }) => {
  const categories = useMemo(() => {
    const cats: Record<string, Effect[]> = {};
    effects.forEach(effect => {
      if (!cats[effect.category]) cats[effect.category] = [];
      if (!searchQuery || effect.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        cats[effect.category].push(effect);
      }
    });
    return Object.entries(cats).filter(([_, items]) => items.length > 0);
  }, [effects, searchQuery]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-2 border-b border-gray-700">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search effects..."
            className="w-full pl-6 pr-2 py-1 bg-gray-800 border border-gray-600 rounded text-xs text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-[#5a5aff]"
          />
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        {categories.map(([category, categoryEffects]) => (
          <div key={category}>
            <div className="px-2 py-1 text-[10px] font-semibold text-gray-500 uppercase tracking-wider bg-gray-800/50">
              {category}
            </div>
            {categoryEffects.map(effect => (
              <div
                key={effect.id}
                className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-white/5 text-xs text-gray-300"
                draggable
              >
                {effect.icon}
                <span>{effect.name}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

const CompositionViewer: React.FC<{
  composition: Composition;
  currentTime: number;
  layers: Layer[];
  selectedLayerId: string | null;
  zoom: number;
}> = ({ composition, currentTime, layers, selectedLayerId, zoom }) => {
  const canvasRef = useRef<HTMLDivElement>(null);

  // Calculate visible motion paths for selected layer
  const selectedLayer = layers.find(l => l.id === selectedLayerId);
  const motionPath = useMemo(() => {
    if (!selectedLayer) return null;
    const posKeyframes = selectedLayer.properties.position.keyframes;
    if (posKeyframes.length < 2) return null;
    return posKeyframes.map(kf => ({
      time: kf.time,
      x: (kf.value as number[])[0],
      y: (kf.value as number[])[1],
    }));
  }, [selectedLayer]);

  const scaleRatio = zoom / 100;
  const scaledWidth = composition.width * scaleRatio;
  const scaledHeight = composition.height * scaleRatio;

  return (
    <div className="flex-1 flex flex-col bg-[#1a1a2e] overflow-hidden">
      {/* Comp Info Bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-gray-800/50 border-b border-gray-700 text-xs">
        <span className="text-gray-300">{composition.name}</span>
        <span className="text-gray-500">{composition.width} x {composition.height}</span>
        <span className="text-gray-500">{zoom}%</span>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 flex items-center justify-center overflow-auto p-4 bg-[#0d0d1a]">
        <div
          ref={canvasRef}
          className="relative bg-[#1a1a2e] shadow-2xl"
          style={{ width: scaledWidth, height: scaledHeight }}
        >
          {/* Composition background */}
          <div className="absolute inset-0" style={{ backgroundColor: composition.backgroundColor }} />

          {/* Layer representations */}
          {layers.filter(l => l.visible && l.type !== 'audio').reverse().map(layer => {
            const pos = layer.properties.position.value as number[];
            const scale = layer.properties.scale.value as number[];
            const rotation = layer.properties.rotation.value as number;
            const opacity = layer.properties.opacity.value as number;
            const isSelected = layer.id === selectedLayerId;

            return (
              <div
                key={layer.id}
                className={cn(
                  "absolute border transition-all",
                  isSelected ? "border-[#5a5aff] border-2" : "border-transparent"
                )}
                style={{
                  left: pos[0] * scaleRatio - 50,
                  top: pos[1] * scaleRatio - 25,
                  width: 100 * (scale[0] / 100),
                  height: 50 * (scale[1] / 100),
                  transform: `rotate(${rotation}deg)`,
                  opacity: opacity / 100,
                }}
              >
                <div className={cn(
                  "w-full h-full flex items-center justify-center text-white text-xs",
                  layer.type === 'text' ? "bg-transparent" : "bg-white/20"
                )}>
                  {layer.type === 'text' && <Type className="w-6 h-6" />}
                  {layer.type === 'composition' && <Film className="w-6 h-6" />}
                  {layer.type === 'solid' && <Square className="w-6 h-6" />}
                  {layer.type === 'shape' && <Circle className="w-6 h-6" />}
                </div>

                {/* Selection handles */}
                {isSelected && (
                  <>
                    <div className="absolute -top-1 -left-1 w-2 h-2 bg-[#5a5aff] border border-white" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#5a5aff] border border-white" />
                    <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-[#5a5aff] border border-white" />
                    <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#5a5aff] border border-white" />
                    {/* Anchor point */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3">
                      <div className="absolute inset-0 border border-[#5a5aff] rounded-full" />
                      <div className="absolute top-1/2 left-0 right-0 h-px bg-[#5a5aff]" />
                      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[#5a5aff]" />
                    </div>
                  </>
                )}
              </div>
            );
          })}

          {/* Motion path */}
          {motionPath && motionPath.length > 1 && (
            <svg className="absolute inset-0 pointer-events-none" style={{ width: scaledWidth, height: scaledHeight }}>
              <path
                d={`M ${motionPath.map(p => `${p.x * scaleRatio},${p.y * scaleRatio}`).join(' L ')}`}
                fill="none"
                stroke="#5a5aff"
                strokeWidth="1"
                strokeDasharray="4,4"
              />
              {motionPath.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x * scaleRatio}
                  cy={p.y * scaleRatio}
                  r={4}
                  fill={i === 0 ? "#5a5aff" : "#ffffff"}
                  stroke="#5a5aff"
                  strokeWidth="1"
                />
              ))}
            </svg>
          )}

          {/* Safe area guides */}
          <div className="absolute inset-0 pointer-events-none border border-dashed border-cyan-500/20" style={{
            margin: `${scaledHeight * 0.05}px ${scaledWidth * 0.05}px`
          }} />
        </div>
      </div>
    </div>
  );
};

const TimelineLayer: React.FC<{
  layer: Layer;
  index: number;
  currentTime: number;
  totalDuration: number;
  pixelsPerFrame: number;
  onToggleVisibility: () => void;
  onToggleSolo: () => void;
  onToggleLock: () => void;
  onToggleExpand: () => void;
  onSelect: () => void;
  onTogglePropertyExpand: (propName: string) => void;
  layers: Layer[];
}> = ({
  layer, index, currentTime, totalDuration, pixelsPerFrame,
  onToggleVisibility, onToggleSolo, onToggleLock, onToggleExpand,
  onSelect, onTogglePropertyExpand, layers
}) => {
  const layerWidth = layer.duration * pixelsPerFrame;
  const layerOffset = layer.startTime * pixelsPerFrame;

  const LayerIcon = {
    text: Type,
    composition: Film,
    solid: Square,
    shape: Circle,
    footage: Video,
    audio: Music,
    null: Anchor,
    adjustment: Sliders,
  }[layer.type] || Layers;

  const parentLayer = layer.parent ? layers.find(l => l.id === layer.parent) : null;

  return (
    <div className={cn("border-b border-gray-700", layer.selected && "bg-[#5a5aff]/10")}>
      {/* Layer header row */}
      <div className="flex items-center h-6 text-xs">
        {/* Layer switches */}
        <div className="w-[200px] flex items-center gap-0.5 px-1 bg-gray-800/50 border-r border-gray-700 h-full shrink-0">
          {/* Shy */}
          <button
            onClick={() => {}}
            className={cn("p-0.5 rounded", layer.shy ? "text-[#5a5aff]" : "text-gray-500 hover:text-gray-300")}
            title="Shy"
          >
            <Star className="w-3 h-3" />
          </button>

          {/* Visibility */}
          <button
            onClick={onToggleVisibility}
            className={cn("p-0.5 rounded", layer.visible ? "text-gray-300" : "text-gray-600")}
            title="Visibility"
          >
            {layer.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          </button>

          {/* Solo */}
          <button
            onClick={onToggleSolo}
            className={cn("p-0.5 rounded", layer.solo ? "text-yellow-500" : "text-gray-500 hover:text-gray-300")}
            title="Solo"
          >
            <span className="text-[10px] font-bold">S</span>
          </button>

          {/* Lock */}
          <button
            onClick={onToggleLock}
            className={cn("p-0.5 rounded", layer.locked ? "text-red-500" : "text-gray-500 hover:text-gray-300")}
            title="Lock"
          >
            {layer.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
          </button>

          {/* Effects indicator */}
          <span className={cn("text-[10px] font-bold px-0.5", layer.effects ? "text-purple-400" : "text-gray-600")}>fx</span>

          {/* Motion blur */}
          <span className={cn("text-[10px] font-bold px-0.5", layer.motionBlur ? "text-blue-400" : "text-gray-600")}>M</span>
        </div>

        {/* Layer name */}
        <div
          className="w-[150px] flex items-center gap-1 px-2 cursor-pointer bg-gray-800/30 border-r border-gray-700 h-full shrink-0"
          onClick={onSelect}
        >
          <button onClick={onToggleExpand} className="p-0.5">
            {layer.expanded ? <ChevronDown className="w-3 h-3 text-gray-500" /> : <ChevronRight className="w-3 h-3 text-gray-500" />}
          </button>
          <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: layer.color }} />
          <LayerIcon className="w-3 h-3 text-gray-400" />
          <span className={cn("truncate flex-1", layer.selected ? "text-white" : "text-gray-300")}>{layer.name}</span>
        </div>

        {/* Parent column */}
        <div className="w-[60px] flex items-center justify-center border-r border-gray-700 h-full shrink-0 bg-gray-800/20">
          {parentLayer ? (
            <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
              <Link2 className="w-2.5 h-2.5" />
              {layers.indexOf(parentLayer) + 1}
            </span>
          ) : (
            <span className="text-[10px] text-gray-600">None</span>
          )}
        </div>

        {/* Timeline bar */}
        <div className="flex-1 relative h-full bg-gray-900/50">
          {/* Layer bar */}
          <div
            className={cn(
              "absolute top-0.5 bottom-0.5 rounded-sm cursor-pointer transition-colors",
              layer.selected ? "ring-1 ring-[#5a5aff]" : ""
            )}
            style={{
              left: layerOffset,
              width: layerWidth,
              backgroundColor: layer.color + '80',
            }}
          >
            {/* Audio waveform visualization */}
            {layer.type === 'audio' && (
              <div className="absolute inset-0 flex items-center justify-evenly opacity-60">
                {Array.from({ length: Math.floor(layerWidth / 3) }).map((_, i) => (
                  <div
                    key={i}
                    className="w-0.5 bg-white/60 rounded-full"
                    style={{ height: `${20 + Math.sin(i * 0.5) * 40 + Math.random() * 20}%` }}
                  />
                ))}
              </div>
            )}

            {/* In/out handles */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/20 cursor-ew-resize hover:bg-white/40" />
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/20 cursor-ew-resize hover:bg-white/40" />
          </div>

          {/* Keyframe diamonds */}
          {Object.values(layer.properties).flatMap(prop =>
            prop.keyframes.map(kf => (
              <div
                key={kf.id}
                className="absolute top-1/2 -translate-y-1/2 cursor-pointer z-10"
                style={{ left: kf.time * pixelsPerFrame - 4 }}
              >
                <Diamond className={cn(
                  "w-3 h-3 transform rotate-45",
                  layer.selected ? "text-yellow-400 fill-yellow-400" : "text-gray-400"
                )} />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Expanded properties */}
      {layer.expanded && (
        <div className="bg-gray-900/30">
          {/* Transform group */}
          <div className="flex items-center h-5 text-[10px] text-gray-400 border-b border-gray-800">
            <div className="w-[200px] shrink-0" />
            <div className="w-[150px] shrink-0 pl-6 flex items-center gap-1">
              <ChevronDown className="w-2.5 h-2.5" />
              <span>Transform</span>
            </div>
            <div className="w-[60px] shrink-0" />
            <div className="flex-1" />
          </div>

          {/* Individual properties */}
          {['position', 'scale', 'rotation', 'opacity'].map(propKey => {
            const prop = layer.properties[propKey as keyof typeof layer.properties];
            if (!prop) return null;

            const value = Array.isArray(prop.value) ? prop.value.join(', ') : prop.value.toString();
            const hasKeyframes = prop.keyframes.length > 0;

            return (
              <div key={propKey} className="flex items-center h-5 text-[10px] border-b border-gray-800/50">
                <div className="w-[200px] shrink-0 flex items-center justify-end pr-2">
                  <button className={cn(
                    "w-3 h-3 flex items-center justify-center rounded-full",
                    hasKeyframes ? "bg-yellow-500/20" : "hover:bg-white/10"
                  )}>
                    <Diamond className={cn("w-2 h-2", hasKeyframes ? "text-yellow-400" : "text-gray-600")} />
                  </button>
                </div>
                <div className="w-[150px] shrink-0 pl-10 flex items-center gap-2">
                  <span className="text-gray-400">{prop.name}</span>
                  <span className="text-gray-500">{value}</span>
                </div>
                <div className="w-[60px] shrink-0" />
                <div className="flex-1 relative h-full">
                  {/* Property keyframes on timeline */}
                  {prop.keyframes.map(kf => (
                    <div
                      key={kf.id}
                      className="absolute top-1/2 -translate-y-1/2"
                      style={{ left: kf.time * pixelsPerFrame - 3 }}
                    >
                      <Diamond className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const Timeline: React.FC<{
  composition: Composition;
  layers: Layer[];
  currentTime: number;
  workAreaStart: number;
  workAreaEnd: number;
  isPlaying: boolean;
  onTimeChange: (time: number) => void;
  onTogglePlay: () => void;
  onLayerUpdate: (layerId: string, updates: Partial<Layer>) => void;
  onSelectLayer: (layerId: string) => void;
}> = ({
  composition, layers, currentTime, workAreaStart, workAreaEnd,
  isPlaying, onTimeChange, onTogglePlay, onLayerUpdate, onSelectLayer
}) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [pixelsPerFrame] = useState(4);
  const totalWidth = composition.duration * pixelsPerFrame;

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const frame = Math.max(0, Math.min(composition.duration, Math.round(x / pixelsPerFrame)));
    onTimeChange(frame);
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e2e]">
      {/* Timeline controls bar */}
      <div className="flex items-center gap-2 px-2 py-1 bg-gray-800 border-b border-gray-700">
        {/* Playback controls */}
        <button onClick={() => onTimeChange(0)} className="p-1 hover:bg-white/10 rounded text-gray-300">
          <SkipBack className="w-4 h-4" />
        </button>
        <button onClick={onTogglePlay} className="p-1 hover:bg-white/10 rounded text-gray-300">
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
        <button onClick={() => onTimeChange(composition.duration)} className="p-1 hover:bg-white/10 rounded text-gray-300">
          <SkipForward className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-gray-600 mx-1" />

        {/* RAM Preview */}
        <button className="flex items-center gap-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs text-gray-300">
          <FastForward className="w-3 h-3" />
          RAM Preview
        </button>

        {/* Skip frames */}
        <select className="bg-gray-700 text-gray-300 text-xs rounded px-1 py-0.5 border border-gray-600">
          <option>Skip 0</option>
          <option>Skip 1</option>
          <option>Skip 2</option>
        </select>

        <div className="flex-1" />

        {/* Timecode display */}
        <div className="font-mono text-xs text-gray-300 bg-gray-900 px-2 py-1 rounded">
          {formatTimecode(currentTime, composition.frameRate)}
        </div>
      </div>

      {/* Timeline ruler and layers */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Time ruler */}
          <div className="h-6 bg-gray-800/50 border-b border-gray-700 flex shrink-0">
            <div className="w-[200px] shrink-0 bg-gray-800 border-r border-gray-700 flex items-center px-2 text-[10px] text-gray-500">
              Switches
            </div>
            <div className="w-[150px] shrink-0 bg-gray-800 border-r border-gray-700 flex items-center px-2 text-[10px] text-gray-500">
              Layer Name
            </div>
            <div className="w-[60px] shrink-0 bg-gray-800 border-r border-gray-700 flex items-center justify-center text-[10px] text-gray-500">
              Parent
            </div>
            <div
              ref={timelineRef}
              className="flex-1 relative overflow-hidden cursor-pointer"
              onClick={handleTimelineClick}
            >
              {/* Frame markers */}
              <div className="absolute inset-0 flex items-end" style={{ width: totalWidth }}>
                {Array.from({ length: Math.ceil(composition.duration / 30) + 1 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute bottom-0 flex flex-col items-center"
                    style={{ left: i * 30 * pixelsPerFrame }}
                  >
                    <span className="text-[9px] text-gray-500 mb-0.5">{i}s</span>
                    <div className="w-px h-2 bg-gray-600" />
                  </div>
                ))}
              </div>

              {/* Work area bar */}
              <div
                className="absolute top-0 h-2 bg-blue-500/30 border-x border-blue-500"
                style={{
                  left: workAreaStart * pixelsPerFrame,
                  width: (workAreaEnd - workAreaStart) * pixelsPerFrame,
                }}
              />

              {/* Current time indicator */}
              <div
                className="absolute top-0 bottom-0 w-px bg-[#5a5aff] z-20"
                style={{ left: currentTime * pixelsPerFrame }}
              >
                <div className="absolute -top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#5a5aff]" style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }} />
              </div>
            </div>
          </div>

          {/* Layer list with timeline */}
          <div className="flex-1 overflow-auto">
            {layers.map((layer, index) => (
              <TimelineLayer
                key={layer.id}
                layer={layer}
                index={index}
                currentTime={currentTime}
                totalDuration={composition.duration}
                pixelsPerFrame={pixelsPerFrame}
                onToggleVisibility={() => onLayerUpdate(layer.id, { visible: !layer.visible })}
                onToggleSolo={() => onLayerUpdate(layer.id, { solo: !layer.solo })}
                onToggleLock={() => onLayerUpdate(layer.id, { locked: !layer.locked })}
                onToggleExpand={() => onLayerUpdate(layer.id, { expanded: !layer.expanded })}
                onSelect={() => onSelectLayer(layer.id)}
                onTogglePropertyExpand={(propName) => {}}
                layers={layers}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const ZAfterEffectsWindow: React.FC<ZAfterEffectsWindowProps> = ({ onClose, onFocus }) => {
  // State
  const [selectedTool, setSelectedTool] = useState<ToolType>('selection');
  const [leftPanel, setLeftPanel] = useState<PanelType>('project');
  const [projectItems, setProjectItems] = useState<FootageItem[]>(createDemoProject);
  const [selectedProjectItem, setSelectedProjectItem] = useState<string | null>(null);
  const [effectsSearch, setEffectsSearch] = useState('');

  const [composition] = useState<Composition>({
    id: 'main-comp',
    name: 'Main Comp',
    width: 1920,
    height: 1080,
    frameRate: 30,
    duration: 300,
    backgroundColor: '#1a1a2e',
    layers: [],
  });

  const [layers, setLayers] = useState<Layer[]>(createDemoLayers);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [workAreaStart, setWorkAreaStart] = useState(0);
  const [workAreaEnd, setWorkAreaEnd] = useState(300);
  const [viewerZoom, setViewerZoom] = useState(50);
  const [isMuted, setIsMuted] = useState(false);

  const selectedLayerId = layers.find(l => l.selected)?.id || null;

  // Playback
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime(prev => {
        const next = prev + 1;
        if (next >= workAreaEnd) {
          return workAreaStart;
        }
        return next;
      });
    }, 1000 / composition.frameRate);

    return () => clearInterval(interval);
  }, [isPlaying, workAreaStart, workAreaEnd, composition.frameRate]);

  // Handlers
  const toggleFolder = useCallback((id: string) => {
    setProjectItems(prev => {
      const toggle = (items: FootageItem[]): FootageItem[] =>
        items.map(item => {
          if (item.id === id) return { ...item, expanded: !item.expanded };
          if (item.children) return { ...item, children: toggle(item.children) };
          return item;
        });
      return toggle(prev);
    });
  }, []);

  const handleLayerUpdate = useCallback((layerId: string, updates: Partial<Layer>) => {
    setLayers(prev => prev.map(layer =>
      layer.id === layerId ? { ...layer, ...updates } : layer
    ));
  }, []);

  const handleSelectLayer = useCallback((layerId: string) => {
    setLayers(prev => prev.map(layer => ({
      ...layer,
      selected: layer.id === layerId
    })));
  }, []);

  const tools: { id: ToolType; icon: React.ReactNode; label: string; shortcut: string }[] = [
    { id: 'selection', icon: <Move className="w-4 h-4" />, label: 'Selection Tool', shortcut: 'V' },
    { id: 'hand', icon: <Hand className="w-4 h-4" />, label: 'Hand Tool', shortcut: 'H' },
    { id: 'zoom', icon: <ZoomIn className="w-4 h-4" />, label: 'Zoom Tool', shortcut: 'Z' },
    { id: 'rotate', icon: <RotateCcw className="w-4 h-4" />, label: 'Rotation Tool', shortcut: 'W' },
    { id: 'panBehind', icon: <Anchor className="w-4 h-4" />, label: 'Pan Behind Tool', shortcut: 'Y' },
    { id: 'text', icon: <Type className="w-4 h-4" />, label: 'Text Tool', shortcut: 'Ctrl+T' },
    { id: 'shape', icon: <Square className="w-4 h-4" />, label: 'Shape Tool', shortcut: 'Q' },
  ];

  return (
    <ZWindow
      title="After Effects"
      onClose={onClose}
      onFocus={onFocus}
      defaultWidth={1400}
      defaultHeight={900}
      minWidth={1000}
      minHeight={600}
      defaultPosition={{ x: 50, y: 30 }}
    >
      <div className="flex flex-col h-full bg-[#1e1e2e] text-gray-200">
        {/* Top toolbar */}
        <div className="flex items-center gap-1 px-2 py-1 bg-gray-800 border-b border-gray-700">
          {/* Tools */}
          {tools.map(tool => (
            <ToolButton
              key={tool.id}
              icon={tool.icon}
              label={tool.label}
              active={selectedTool === tool.id}
              onClick={() => setSelectedTool(tool.id)}
              shortcut={tool.shortcut}
            />
          ))}

          <div className="w-px h-6 bg-gray-600 mx-2" />

          {/* View controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setViewerZoom(z => Math.max(10, z - 10))}
              className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-xs text-gray-400 w-10 text-center">{viewerZoom}%</span>
            <button
              onClick={() => setViewerZoom(z => Math.min(400, z + 10))}
              className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <div className="flex-1" />

          {/* Audio/Preview controls */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={cn("p-1.5 rounded transition-colors", isMuted ? "text-red-400" : "text-gray-400 hover:text-white")}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left panel - Project/Effects */}
          <div className="w-64 flex flex-col border-r border-gray-700 bg-gray-800/30 shrink-0">
            {/* Panel tabs */}
            <div className="flex border-b border-gray-700">
              {(['project', 'effects'] as PanelType[]).map(panel => (
                <button
                  key={panel}
                  onClick={() => setLeftPanel(panel)}
                  className={cn(
                    "flex-1 px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                    leftPanel === panel
                      ? "bg-gray-700 text-white border-b-2 border-[#5a5aff]"
                      : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                  )}
                >
                  {panel === 'project' && <Folder className="w-3 h-3 inline mr-1" />}
                  {panel === 'effects' && <Wand2 className="w-3 h-3 inline mr-1" />}
                  {panel}
                </button>
              ))}
            </div>

            {/* Panel content */}
            {leftPanel === 'project' && (
              <ProjectPanel
                items={projectItems}
                onToggleFolder={toggleFolder}
                selectedItemId={selectedProjectItem}
                onSelectItem={setSelectedProjectItem}
              />
            )}
            {leftPanel === 'effects' && (
              <EffectsPanel
                effects={EFFECTS_LIST}
                searchQuery={effectsSearch}
                onSearchChange={setEffectsSearch}
              />
            )}
          </div>

          {/* Center - Composition viewer */}
          <div className="flex-1 flex flex-col min-w-0">
            <CompositionViewer
              composition={composition}
              currentTime={currentTime}
              layers={layers}
              selectedLayerId={selectedLayerId}
              zoom={viewerZoom}
            />
          </div>

          {/* Right panel - Layer properties */}
          <div className="w-56 flex flex-col border-l border-gray-700 bg-gray-800/30 shrink-0">
            <div className="px-3 py-2 border-b border-gray-700 text-xs font-medium text-gray-300">
              Properties
            </div>

            {selectedLayerId ? (
              <div className="flex-1 overflow-auto p-2">
                {(() => {
                  const layer = layers.find(l => l.id === selectedLayerId);
                  if (!layer) return null;

                  return (
                    <div className="space-y-3">
                      {/* Layer info */}
                      <div className="p-2 bg-gray-800/50 rounded">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 rounded" style={{ backgroundColor: layer.color }} />
                          <span className="text-xs font-medium text-gray-200">{layer.name}</span>
                        </div>
                        <div className="text-[10px] text-gray-500 capitalize">{layer.type} Layer</div>
                      </div>

                      {/* Transform properties */}
                      <div>
                        <div className="flex items-center gap-1 text-[10px] font-medium text-gray-400 mb-2">
                          <ChevronDown className="w-3 h-3" />
                          Transform
                        </div>

                        {Object.entries(layer.properties).map(([key, prop]) => (
                          <div key={key} className="flex items-center gap-2 py-1">
                            <button className={cn(
                              "w-3 h-3 flex items-center justify-center rounded-full",
                              prop.keyframes.length > 0 ? "bg-yellow-500/20" : "hover:bg-white/10"
                            )}>
                              <Diamond className={cn("w-2 h-2", prop.keyframes.length > 0 ? "text-yellow-400" : "text-gray-600")} />
                            </button>
                            <span className="text-[10px] text-gray-400 w-14">{prop.name}</span>
                            <input
                              type="text"
                              value={Array.isArray(prop.value) ? prop.value.join(', ') : prop.value}
                              readOnly
                              className="flex-1 bg-gray-800 border border-gray-600 rounded px-1 py-0.5 text-[10px] text-gray-300"
                            />
                          </div>
                        ))}
                      </div>

                      {/* Effects list */}
                      {layer.effects && (
                        <div>
                          <div className="flex items-center gap-1 text-[10px] font-medium text-gray-400 mb-2">
                            <ChevronDown className="w-3 h-3" />
                            Effects
                          </div>
                          <div className="text-[10px] text-purple-400 bg-purple-500/10 rounded px-2 py-1">
                            Glow + Drop Shadow
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500 text-xs">
                Select a layer
              </div>
            )}
          </div>
        </div>

        {/* Bottom - Timeline */}
        <div className="h-[280px] border-t border-gray-700 shrink-0">
          <Timeline
            composition={composition}
            layers={layers}
            currentTime={currentTime}
            workAreaStart={workAreaStart}
            workAreaEnd={workAreaEnd}
            isPlaying={isPlaying}
            onTimeChange={setCurrentTime}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            onLayerUpdate={handleLayerUpdate}
            onSelectLayer={handleSelectLayer}
          />
        </div>
      </div>
    </ZWindow>
  );
};

export default ZAfterEffectsWindow;
