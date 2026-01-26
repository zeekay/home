import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import ZWindow from './ZWindow';
import { cn } from '@/lib/utils';
import {
  MousePointer2,
  Hand,
  Square,
  Circle,
  Type,
  Pen,
  Frame,
  Component,
  Image,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Copy,
  Layers,
  Box,
  Palette,
  Settings,
  MessageSquare,
  Play,
  Share2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  MoreHorizontal,
  Plus,
  Minus,
  Search,
  Grid,
  Move,
  RotateCcw,
  Pipette,
  X,
  Check,
  Users,
  Folder,
  Star,
  Download,
  Upload,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
} from 'lucide-react';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface ZFigmaWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

type Tool = 'select' | 'hand' | 'frame' | 'rectangle' | 'ellipse' | 'text' | 'pen';
type Mode = 'design' | 'prototype' | 'inspect';

interface Point {
  x: number;
  y: number;
}

interface CanvasObject {
  id: string;
  type: 'frame' | 'rectangle' | 'ellipse' | 'text' | 'group' | 'component';
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
  parentId: string | null;
  children?: string[];
  text?: string;
  fontSize?: number;
  cornerRadius?: number;
  effects?: Effect[];
}

interface Effect {
  type: 'shadow' | 'blur';
  color?: string;
  blur: number;
  offsetX?: number;
  offsetY?: number;
}

interface MockCursor {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
}

interface Comment {
  id: string;
  author: string;
  content: string;
  x: number;
  y: number;
  timestamp: number;
  resolved: boolean;
}

interface FrameTemplate {
  name: string;
  width: number;
  height: number;
  icon: string;
}

// ============================================================================
// Constants
// ============================================================================

const FRAME_TEMPLATES: FrameTemplate[] = [
  { name: 'iPhone 15 Pro', width: 393, height: 852, icon: 'phone' },
  { name: 'iPhone 15 Pro Max', width: 430, height: 932, icon: 'phone' },
  { name: 'iPad Pro 12.9"', width: 1024, height: 1366, icon: 'tablet' },
  { name: 'MacBook Pro 16"', width: 1728, height: 1117, icon: 'laptop' },
  { name: 'Desktop', width: 1440, height: 900, icon: 'monitor' },
  { name: 'Twitter Post', width: 1200, height: 675, icon: 'social' },
  { name: 'Instagram Post', width: 1080, height: 1080, icon: 'social' },
  { name: 'Presentation', width: 1920, height: 1080, icon: 'presentation' },
];

const PRESET_COLORS = [
  '#000000', '#FFFFFF', '#F5F5F5', '#E0E0E0', '#9E9E9E', '#616161',
  '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3',
  '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39',
  '#FFEB3B', '#FFC107', '#FF9800', '#FF5722', '#795548', '#607D8B',
];

const MOCK_CURSORS: MockCursor[] = [
  { id: '1', name: 'Alice', color: '#F44336', x: 200, y: 150 },
  { id: '2', name: 'Bob', color: '#2196F3', x: 400, y: 300 },
  { id: '3', name: 'Carol', color: '#4CAF50', x: 600, y: 200 },
];

const generateId = () => Math.random().toString(36).substring(2, 15);

// ============================================================================
// Sub-Components
// ============================================================================

interface ToolButtonProps {
  icon: React.ReactNode;
  active?: boolean;
  onClick: () => void;
  tooltip: string;
  shortcut?: string;
}

const ToolButton: React.FC<ToolButtonProps> = ({ icon, active, onClick, tooltip, shortcut }) => (
  <button
    onClick={onClick}
    title={`${tooltip}${shortcut ? ` (${shortcut})` : ''}`}
    className={cn(
      "w-8 h-8 flex items-center justify-center rounded-md transition-colors",
      active ? "bg-blue-500 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
    )}
  >
    {icon}
  </button>
);

interface LayerItemProps {
  object: CanvasObject;
  depth: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  onRename: (id: string, name: string) => void;
  objects: CanvasObject[];
}

const LayerItem: React.FC<LayerItemProps> = ({
  object, depth, isSelected, onSelect, onToggleVisibility, onToggleLock, onRename, objects,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(object.name);
  const [isExpanded, setIsExpanded] = useState(true);
  const children = objects.filter(o => o.parentId === object.id);

  const getIcon = () => {
    switch (object.type) {
      case 'frame': return <Frame className="w-3.5 h-3.5" />;
      case 'rectangle': return <Square className="w-3.5 h-3.5" />;
      case 'ellipse': return <Circle className="w-3.5 h-3.5" />;
      case 'text': return <Type className="w-3.5 h-3.5" />;
      case 'component': return <Component className="w-3.5 h-3.5 text-purple-400" />;
      default: return <Box className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-1 px-2 py-1 text-xs group cursor-pointer",
          isSelected ? "bg-blue-500/30 text-white" : "text-white/70 hover:bg-white/5"
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => onSelect(object.id)}
        onDoubleClick={() => setIsEditing(true)}
      >
        {children.length > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
            className="p-0.5 hover:bg-white/10 rounded"
          >
            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
        )}
        <span className={cn("flex-shrink-0", object.type === 'component' && "text-purple-400")}>
          {getIcon()}
        </span>
        {isEditing ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={() => { onRename(object.id, editName); setIsEditing(false); }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { onRename(object.id, editName); setIsEditing(false); }
              if (e.key === 'Escape') { setEditName(object.name); setIsEditing(false); }
            }}
            className="flex-1 bg-white/10 px-1 rounded text-white text-xs outline-none"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="flex-1 truncate">{object.name}</span>
        )}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleLock(object.id); }}
            className="p-1 hover:bg-white/10 rounded"
          >
            {object.locked ? <Lock className="w-3 h-3 text-yellow-500" /> : <Unlock className="w-3 h-3" />}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleVisibility(object.id); }}
            className="p-1 hover:bg-white/10 rounded"
          >
            {object.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3 text-white/40" />}
          </button>
        </div>
      </div>
      {isExpanded && children.map(child => (
        <LayerItem
          key={child.id}
          object={child}
          depth={depth + 1}
          isSelected={isSelected}
          onSelect={onSelect}
          onToggleVisibility={onToggleVisibility}
          onToggleLock={onToggleLock}
          onRename={onRename}
          objects={objects}
        />
      ))}
    </div>
  );
};

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label: string;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customColor, setCustomColor] = useState(color);

  return (
    <div className="relative">
      <div className="flex items-center justify-between">
        <span className="text-white/60 text-xs">{label}</span>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-2 py-1 bg-white/5 rounded hover:bg-white/10"
        >
          <div
            className="w-4 h-4 rounded border border-white/20"
            style={{ backgroundColor: color }}
          />
          <span className="text-white/70 text-xs uppercase">{color}</span>
        </button>
      </div>
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 bg-[#2d2d2d] rounded-lg shadow-xl border border-white/10 p-3 z-50 w-52">
          <div className="grid grid-cols-6 gap-1 mb-3">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => { onChange(c); setIsOpen(false); }}
                className={cn(
                  "w-6 h-6 rounded border-2 transition-transform hover:scale-110",
                  color === c ? "border-blue-500" : "border-transparent"
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Pipette className="w-4 h-4 text-white/50" />
            <input
              type="text"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              onBlur={() => onChange(customColor)}
              onKeyDown={(e) => e.key === 'Enter' && onChange(customColor)}
              className="flex-1 bg-white/5 px-2 py-1 rounded text-white text-xs outline-none"
              placeholder="#000000"
            />
          </div>
        </div>
      )}
    </div>
  );
};

interface PropertyInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
}

const PropertyInput: React.FC<PropertyInputProps> = ({
  label, value, onChange, unit = 'px', min, max, step = 1,
}) => (
  <div className="flex items-center justify-between gap-2">
    <span className="text-white/60 text-xs w-8">{label}</span>
    <div className="flex-1 flex items-center bg-white/5 rounded">
      <input
        type="number"
        value={Math.round(value)}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="flex-1 bg-transparent px-2 py-1 text-white text-xs outline-none w-full"
      />
      <span className="text-white/40 text-xs pr-2">{unit}</span>
    </div>
  </div>
);

// ============================================================================
// Main Component
// ============================================================================

const ZFigmaWindow: React.FC<ZFigmaWindowProps> = ({ onClose, onFocus }) => {
  // State
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [mode, setMode] = useState<Mode>('design');
  const [zoom, setZoom] = useState(100);
  const [panOffset, setPanOffset] = useState<Point>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Point>({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<Point>({ x: 0, y: 0 });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [showComponents, setShowComponents] = useState(false);
  const [showAssets, setShowAssets] = useState(false);
  const [showFrameTemplates, setShowFrameTemplates] = useState(false);
  const [showMultiplayerCursors, setShowMultiplayerCursors] = useState(true);
  const [leftPanel, setLeftPanel] = useState<'layers' | 'assets' | 'components'>('layers');
  const [rightPanel, setRightPanel] = useState<'design' | 'prototype' | 'inspect'>('design');
  const [fileName, setFileName] = useState('Untitled');
  const [isEditingFileName, setIsEditingFileName] = useState(false);

  // Canvas objects
  const [objects, setObjects] = useState<CanvasObject[]>([
    {
      id: 'frame-1',
      type: 'frame',
      name: 'iPhone 15 Pro',
      x: 100,
      y: 100,
      width: 393,
      height: 852,
      rotation: 0,
      fill: '#FFFFFF',
      stroke: 'transparent',
      strokeWidth: 0,
      opacity: 1,
      visible: true,
      locked: false,
      parentId: null,
      children: ['rect-1', 'text-1'],
      cornerRadius: 0,
    },
    {
      id: 'rect-1',
      type: 'rectangle',
      name: 'Header',
      x: 116,
      y: 160,
      width: 361,
      height: 56,
      rotation: 0,
      fill: '#3B82F6',
      stroke: 'transparent',
      strokeWidth: 0,
      opacity: 1,
      visible: true,
      locked: false,
      parentId: 'frame-1',
      cornerRadius: 8,
    },
    {
      id: 'text-1',
      type: 'text',
      name: 'Welcome',
      x: 140,
      y: 240,
      width: 200,
      height: 32,
      rotation: 0,
      fill: '#1F2937',
      stroke: 'transparent',
      strokeWidth: 0,
      opacity: 1,
      visible: true,
      locked: false,
      parentId: 'frame-1',
      text: 'Welcome to zOS',
      fontSize: 24,
    },
    {
      id: 'ellipse-1',
      type: 'ellipse',
      name: 'Avatar',
      x: 550,
      y: 150,
      width: 80,
      height: 80,
      rotation: 0,
      fill: '#8B5CF6',
      stroke: '#6D28D9',
      strokeWidth: 2,
      opacity: 1,
      visible: true,
      locked: false,
      parentId: null,
      cornerRadius: 0,
    },
  ]);

  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      author: 'Alice',
      content: 'Can we make the header more vibrant?',
      x: 300,
      y: 180,
      timestamp: Date.now() - 3600000,
      resolved: false,
    },
  ]);

  const [mockCursors, setMockCursors] = useState<MockCursor[]>(MOCK_CURSORS);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Selected object
  const selectedObject = useMemo(() => {
    if (selectedIds.length === 1) {
      return objects.find(o => o.id === selectedIds[0]);
    }
    return null;
  }, [selectedIds, objects]);

  // Root level objects (no parent)
  const rootObjects = useMemo(() => objects.filter(o => !o.parentId), [objects]);

  // Animate mock cursors
  useEffect(() => {
    if (!showMultiplayerCursors) return;
    const interval = setInterval(() => {
      setMockCursors(prev => prev.map(cursor => ({
        ...cursor,
        x: cursor.x + (Math.random() - 0.5) * 20,
        y: cursor.y + (Math.random() - 0.5) * 20,
      })));
    }, 2000);
    return () => clearInterval(interval);
  }, [showMultiplayerCursors]);

  // Handlers
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left - panOffset.x) / (zoom / 100);
    const y = (e.clientY - rect.top - panOffset.y) / (zoom / 100);

    if (activeTool === 'hand' || e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      return;
    }

    if (activeTool === 'select') {
      // Check if clicking on an object
      const clickedObject = [...objects].reverse().find(obj => {
        if (!obj.visible || obj.locked) return false;
        return x >= obj.x && x <= obj.x + obj.width && y >= obj.y && y <= obj.y + obj.height;
      });

      if (clickedObject) {
        if (e.shiftKey) {
          setSelectedIds(prev =>
            prev.includes(clickedObject.id)
              ? prev.filter(id => id !== clickedObject.id)
              : [...prev, clickedObject.id]
          );
        } else {
          setSelectedIds([clickedObject.id]);
        }
      } else {
        setSelectedIds([]);
      }
      return;
    }

    if (['rectangle', 'ellipse', 'frame', 'text'].includes(activeTool)) {
      setIsDrawing(true);
      setDrawStart({ x, y });
    }
  }, [activeTool, objects, panOffset, zoom]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    if (isDrawing) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = (e.clientX - rect.left - panOffset.x) / (zoom / 100);
      const y = (e.clientY - rect.top - panOffset.y) / (zoom / 100);

      // Preview would be shown here in a full implementation
    }
  }, [isPanning, isDrawing, panStart, panOffset, zoom]);

  const handleCanvasMouseUp = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (isDrawing) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const endX = (e.clientX - rect.left - panOffset.x) / (zoom / 100);
      const endY = (e.clientY - rect.top - panOffset.y) / (zoom / 100);

      const minX = Math.min(drawStart.x, endX);
      const minY = Math.min(drawStart.y, endY);
      const width = Math.max(Math.abs(endX - drawStart.x), 20);
      const height = Math.max(Math.abs(endY - drawStart.y), 20);

      const newObject: CanvasObject = {
        id: generateId(),
        type: activeTool as CanvasObject['type'],
        name: `${activeTool.charAt(0).toUpperCase() + activeTool.slice(1)} ${objects.length + 1}`,
        x: minX,
        y: minY,
        width,
        height,
        rotation: 0,
        fill: activeTool === 'frame' ? '#FFFFFF' : '#3B82F6',
        stroke: 'transparent',
        strokeWidth: 0,
        opacity: 1,
        visible: true,
        locked: false,
        parentId: null,
        cornerRadius: 0,
        ...(activeTool === 'text' && { text: 'Text', fontSize: 16 }),
      };

      setObjects(prev => [...prev, newObject]);
      setSelectedIds([newObject.id]);
      setIsDrawing(false);
      setActiveTool('select');
    }
  }, [isPanning, isDrawing, drawStart, activeTool, objects.length, panOffset, zoom]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -10 : 10;
      setZoom(prev => Math.min(Math.max(prev + delta, 10), 400));
    } else {
      setPanOffset(prev => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY,
      }));
    }
  }, []);

  const updateObject = useCallback((id: string, updates: Partial<CanvasObject>) => {
    setObjects(prev => prev.map(obj => obj.id === id ? { ...obj, ...updates } : obj));
  }, []);

  const deleteSelected = useCallback(() => {
    setObjects(prev => prev.filter(obj => !selectedIds.includes(obj.id)));
    setSelectedIds([]);
  }, [selectedIds]);

  const duplicateSelected = useCallback(() => {
    const newObjects = selectedIds.map(id => {
      const obj = objects.find(o => o.id === id);
      if (!obj) return null;
      return {
        ...obj,
        id: generateId(),
        name: `${obj.name} copy`,
        x: obj.x + 20,
        y: obj.y + 20,
      };
    }).filter(Boolean) as CanvasObject[];

    setObjects(prev => [...prev, ...newObjects]);
    setSelectedIds(newObjects.map(o => o.id));
  }, [selectedIds, objects]);

  const addFrame = useCallback((template: FrameTemplate) => {
    const newFrame: CanvasObject = {
      id: generateId(),
      type: 'frame',
      name: template.name,
      x: 100 + Math.random() * 100,
      y: 100 + Math.random() * 100,
      width: template.width,
      height: template.height,
      rotation: 0,
      fill: '#FFFFFF',
      stroke: 'transparent',
      strokeWidth: 0,
      opacity: 1,
      visible: true,
      locked: false,
      parentId: null,
      children: [],
      cornerRadius: 0,
    };
    setObjects(prev => [...prev, newFrame]);
    setSelectedIds([newFrame.id]);
    setShowFrameTemplates(false);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'v' || e.key === 'V') setActiveTool('select');
      if (e.key === 'h' || e.key === 'H') setActiveTool('hand');
      if (e.key === 'f' || e.key === 'F') setActiveTool('frame');
      if (e.key === 'r' || e.key === 'R') setActiveTool('rectangle');
      if (e.key === 'o' || e.key === 'O') setActiveTool('ellipse');
      if (e.key === 't' || e.key === 'T') setActiveTool('text');
      if (e.key === 'p' || e.key === 'P') setActiveTool('pen');

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedIds.length > 0) {
          e.preventDefault();
          deleteSelected();
        }
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault();
        duplicateSelected();
      }

      if ((e.metaKey || e.ctrlKey) && e.key === '0') {
        e.preventDefault();
        setZoom(100);
        setPanOffset({ x: 0, y: 0 });
      }

      if ((e.metaKey || e.ctrlKey) && e.key === '=') {
        e.preventDefault();
        setZoom(prev => Math.min(prev + 25, 400));
      }

      if ((e.metaKey || e.ctrlKey) && e.key === '-') {
        e.preventDefault();
        setZoom(prev => Math.max(prev - 25, 10));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds, deleteSelected, duplicateSelected]);

  return (
    <ZWindow
      title="Figma"
      onClose={onClose}
      onFocus={onFocus}
      initialSize={{ width: 1400, height: 900 }}
      initialPosition={{ x: 50, y: 30 }}
      resizable
    >
      <div className="flex flex-col h-full bg-[#1e1e1e]">
        {/* Top Bar */}
        <div className="h-12 bg-[#2c2c2c] border-b border-white/10 flex items-center justify-between px-3">
          {/* Left section - Menu and file name */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button className="p-1.5 hover:bg-white/10 rounded">
                <MoreHorizontal className="w-4 h-4 text-white/70" />
              </button>
              {isEditingFileName ? (
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  onBlur={() => setIsEditingFileName(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setIsEditingFileName(false)}
                  className="bg-white/10 px-2 py-1 rounded text-white text-sm outline-none"
                  autoFocus
                />
              ) : (
                <button
                  onClick={() => setIsEditingFileName(true)}
                  className="text-white text-sm hover:bg-white/10 px-2 py-1 rounded flex items-center gap-1"
                >
                  {fileName}
                  <ChevronDown className="w-3 h-3" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-1 text-white/40">
              <button className="p-1.5 hover:bg-white/10 rounded hover:text-white/70">
                <Undo className="w-4 h-4" />
              </button>
              <button className="p-1.5 hover:bg-white/10 rounded hover:text-white/70">
                <Redo className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Center section - Tools */}
          <div className="flex items-center gap-1 bg-[#3c3c3c] rounded-lg p-1">
            <ToolButton
              icon={<MousePointer2 className="w-4 h-4" />}
              active={activeTool === 'select'}
              onClick={() => setActiveTool('select')}
              tooltip="Move"
              shortcut="V"
            />
            <ToolButton
              icon={<Hand className="w-4 h-4" />}
              active={activeTool === 'hand'}
              onClick={() => setActiveTool('hand')}
              tooltip="Hand"
              shortcut="H"
            />
            <div className="w-px h-5 bg-white/10 mx-1" />
            <div className="relative">
              <ToolButton
                icon={<Frame className="w-4 h-4" />}
                active={activeTool === 'frame'}
                onClick={() => {
                  setActiveTool('frame');
                  setShowFrameTemplates(!showFrameTemplates);
                }}
                tooltip="Frame"
                shortcut="F"
              />
              {showFrameTemplates && (
                <div className="absolute top-full left-0 mt-2 bg-[#2d2d2d] rounded-lg shadow-xl border border-white/10 py-2 w-48 z-50">
                  <div className="px-3 py-1 text-white/40 text-xs font-medium">Frame Templates</div>
                  {FRAME_TEMPLATES.map((template) => (
                    <button
                      key={template.name}
                      onClick={() => addFrame(template)}
                      className="w-full px-3 py-2 text-left text-white/70 hover:bg-white/10 text-xs flex justify-between items-center"
                    >
                      <span>{template.name}</span>
                      <span className="text-white/40">{template.width} x {template.height}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <ToolButton
              icon={<Square className="w-4 h-4" />}
              active={activeTool === 'rectangle'}
              onClick={() => setActiveTool('rectangle')}
              tooltip="Rectangle"
              shortcut="R"
            />
            <ToolButton
              icon={<Circle className="w-4 h-4" />}
              active={activeTool === 'ellipse'}
              onClick={() => setActiveTool('ellipse')}
              tooltip="Ellipse"
              shortcut="O"
            />
            <ToolButton
              icon={<Type className="w-4 h-4" />}
              active={activeTool === 'text'}
              onClick={() => setActiveTool('text')}
              tooltip="Text"
              shortcut="T"
            />
            <ToolButton
              icon={<Pen className="w-4 h-4" />}
              active={activeTool === 'pen'}
              onClick={() => setActiveTool('pen')}
              tooltip="Pen"
              shortcut="P"
            />
          </div>

          {/* Right section - Zoom and actions */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-[#3c3c3c] rounded-lg px-2 py-1">
              <button
                onClick={() => setZoom(prev => Math.max(prev - 25, 10))}
                className="p-1 hover:bg-white/10 rounded text-white/70"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-white/70 text-xs w-12 text-center">{zoom}%</span>
              <button
                onClick={() => setZoom(prev => Math.min(prev + 25, 400))}
                className="p-1 hover:bg-white/10 rounded text-white/70"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => setShowMultiplayerCursors(!showMultiplayerCursors)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors",
                showMultiplayerCursors ? "bg-green-500/20 text-green-400" : "bg-white/10 text-white/70"
              )}
            >
              <Users className="w-3.5 h-3.5" />
              <span>3</span>
            </button>

            <button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm transition-colors">
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel */}
          <div className="w-60 bg-[#252526] border-r border-white/10 flex flex-col">
            {/* Panel Tabs */}
            <div className="flex border-b border-white/10">
              <button
                onClick={() => setLeftPanel('layers')}
                className={cn(
                  "flex-1 py-2 text-xs font-medium transition-colors",
                  leftPanel === 'layers' ? "text-white border-b-2 border-blue-500" : "text-white/50 hover:text-white/70"
                )}
              >
                <Layers className="w-4 h-4 mx-auto" />
              </button>
              <button
                onClick={() => setLeftPanel('assets')}
                className={cn(
                  "flex-1 py-2 text-xs font-medium transition-colors",
                  leftPanel === 'assets' ? "text-white border-b-2 border-blue-500" : "text-white/50 hover:text-white/70"
                )}
              >
                <Image className="w-4 h-4 mx-auto" />
              </button>
              <button
                onClick={() => setLeftPanel('components')}
                className={cn(
                  "flex-1 py-2 text-xs font-medium transition-colors",
                  leftPanel === 'components' ? "text-white border-b-2 border-blue-500" : "text-white/50 hover:text-white/70"
                )}
              >
                <Component className="w-4 h-4 mx-auto" />
              </button>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto">
              {leftPanel === 'layers' && (
                <div className="py-2">
                  <div className="px-3 py-2 flex items-center justify-between">
                    <span className="text-white/40 text-xs font-medium">Layers</span>
                    <div className="flex items-center gap-1">
                      <button className="p-1 hover:bg-white/10 rounded text-white/50">
                        <Search className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  {rootObjects.map(obj => (
                    <LayerItem
                      key={obj.id}
                      object={obj}
                      depth={0}
                      isSelected={selectedIds.includes(obj.id)}
                      onSelect={(id) => setSelectedIds([id])}
                      onToggleVisibility={(id) => updateObject(id, { visible: !objects.find(o => o.id === id)?.visible })}
                      onToggleLock={(id) => updateObject(id, { locked: !objects.find(o => o.id === id)?.locked })}
                      onRename={(id, name) => updateObject(id, { name })}
                      objects={objects}
                    />
                  ))}
                </div>
              )}

              {leftPanel === 'assets' && (
                <div className="p-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Search className="w-4 h-4 text-white/40" />
                    <input
                      type="text"
                      placeholder="Search assets..."
                      className="flex-1 bg-transparent text-white text-sm placeholder:text-white/40 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 px-2 py-2 rounded hover:bg-white/5 cursor-pointer text-white/70">
                      <Folder className="w-4 h-4" />
                      <span className="text-xs">Icons</span>
                    </div>
                    <div className="flex items-center gap-2 px-2 py-2 rounded hover:bg-white/5 cursor-pointer text-white/70">
                      <Folder className="w-4 h-4" />
                      <span className="text-xs">Illustrations</span>
                    </div>
                    <div className="flex items-center gap-2 px-2 py-2 rounded hover:bg-white/5 cursor-pointer text-white/70">
                      <Folder className="w-4 h-4" />
                      <span className="text-xs">Photos</span>
                    </div>
                  </div>
                </div>
              )}

              {leftPanel === 'components' && (
                <div className="p-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Search className="w-4 h-4 text-white/40" />
                    <input
                      type="text"
                      placeholder="Search components..."
                      className="flex-1 bg-transparent text-white text-sm placeholder:text-white/40 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="aspect-square bg-white/5 rounded-lg flex items-center justify-center cursor-pointer hover:bg-white/10 border border-dashed border-white/20">
                      <Plus className="w-6 h-6 text-white/40" />
                    </div>
                    <div className="aspect-square bg-white/5 rounded-lg flex items-center justify-center cursor-pointer hover:bg-white/10">
                      <div className="w-8 h-8 bg-blue-500 rounded" />
                    </div>
                    <div className="aspect-square bg-white/5 rounded-lg flex items-center justify-center cursor-pointer hover:bg-white/10">
                      <div className="w-8 h-8 bg-purple-500 rounded-full" />
                    </div>
                    <div className="aspect-square bg-white/5 rounded-lg flex items-center justify-center cursor-pointer hover:bg-white/10">
                      <div className="w-10 h-3 bg-green-500 rounded-full" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Canvas Area */}
          <div
            ref={canvasRef}
            className="flex-1 bg-[#1a1a1a] relative overflow-hidden"
            style={{ cursor: activeTool === 'hand' || isPanning ? 'grab' : activeTool === 'select' ? 'default' : 'crosshair' }}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={() => { setIsPanning(false); setIsDrawing(false); }}
            onWheel={handleWheel}
          >
            {/* Grid Pattern */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
                `,
                backgroundSize: `${20 * (zoom / 100)}px ${20 * (zoom / 100)}px`,
                backgroundPosition: `${panOffset.x}px ${panOffset.y}px`,
              }}
            />

            {/* Canvas Objects */}
            <div
              className="absolute"
              style={{
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom / 100})`,
                transformOrigin: '0 0',
              }}
            >
              {objects.filter(o => o.visible).map(obj => {
                const isSelected = selectedIds.includes(obj.id);
                return (
                  <div
                    key={obj.id}
                    className={cn(
                      "absolute",
                      isSelected && "ring-2 ring-blue-500"
                    )}
                    style={{
                      left: obj.x,
                      top: obj.y,
                      width: obj.width,
                      height: obj.height,
                      transform: `rotate(${obj.rotation}deg)`,
                      opacity: obj.opacity,
                      backgroundColor: obj.type !== 'text' ? obj.fill : 'transparent',
                      border: obj.strokeWidth ? `${obj.strokeWidth}px solid ${obj.stroke}` : 'none',
                      borderRadius: obj.type === 'ellipse' ? '50%' : obj.cornerRadius || 0,
                      boxShadow: obj.type === 'frame' ? '0 4px 20px rgba(0,0,0,0.3)' : 'none',
                    }}
                  >
                    {obj.type === 'text' && (
                      <span
                        style={{
                          color: obj.fill,
                          fontSize: obj.fontSize,
                          fontWeight: 500,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {obj.text}
                      </span>
                    )}
                    {isSelected && !obj.locked && (
                      <>
                        {/* Resize handles */}
                        <div className="absolute -top-1 -left-1 w-2 h-2 bg-white border border-blue-500 cursor-nw-resize" />
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-white border border-blue-500 cursor-ne-resize" />
                        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white border border-blue-500 cursor-sw-resize" />
                        <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white border border-blue-500 cursor-se-resize" />
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border border-blue-500 cursor-n-resize" />
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border border-blue-500 cursor-s-resize" />
                        <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-white border border-blue-500 cursor-w-resize" />
                        <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-white border border-blue-500 cursor-e-resize" />
                      </>
                    )}
                  </div>
                );
              })}

              {/* Comments */}
              {showComments && comments.map(comment => (
                <div
                  key={comment.id}
                  className="absolute"
                  style={{ left: comment.x, top: comment.y }}
                >
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center cursor-pointer shadow-lg">
                    <MessageSquare className="w-3 h-3 text-white" />
                  </div>
                </div>
              ))}

              {/* Multiplayer Cursors */}
              {showMultiplayerCursors && mockCursors.map(cursor => (
                <div
                  key={cursor.id}
                  className="absolute pointer-events-none transition-all duration-1000"
                  style={{ left: cursor.x, top: cursor.y }}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M5.5 3L5.5 17L9.5 13L14.5 13L5.5 3Z"
                      fill={cursor.color}
                      stroke="white"
                      strokeWidth="1"
                    />
                  </svg>
                  <div
                    className="absolute left-4 top-4 px-2 py-0.5 rounded text-white text-xs whitespace-nowrap"
                    style={{ backgroundColor: cursor.color }}
                  >
                    {cursor.name}
                  </div>
                </div>
              ))}
            </div>

            {/* Status bar */}
            <div className="absolute bottom-0 left-0 right-0 h-6 bg-[#252526] border-t border-white/10 flex items-center justify-between px-3 text-xs text-white/50">
              <div className="flex items-center gap-4">
                <span>{objects.length} objects</span>
                {selectedIds.length > 0 && <span>{selectedIds.length} selected</span>}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setZoom(100); setPanOffset({ x: 0, y: 0 }); }}
                  className="hover:text-white/70"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
                <span>{zoom}%</span>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="w-64 bg-[#252526] border-l border-white/10 flex flex-col">
            {/* Mode Tabs */}
            <div className="flex border-b border-white/10">
              <button
                onClick={() => setRightPanel('design')}
                className={cn(
                  "flex-1 py-2.5 text-xs font-medium transition-colors",
                  rightPanel === 'design' ? "text-white border-b-2 border-blue-500" : "text-white/50 hover:text-white/70"
                )}
              >
                Design
              </button>
              <button
                onClick={() => setRightPanel('prototype')}
                className={cn(
                  "flex-1 py-2.5 text-xs font-medium transition-colors",
                  rightPanel === 'prototype' ? "text-white border-b-2 border-blue-500" : "text-white/50 hover:text-white/70"
                )}
              >
                Prototype
              </button>
              <button
                onClick={() => setRightPanel('inspect')}
                className={cn(
                  "flex-1 py-2.5 text-xs font-medium transition-colors",
                  rightPanel === 'inspect' ? "text-white border-b-2 border-blue-500" : "text-white/50 hover:text-white/70"
                )}
              >
                Inspect
              </button>
            </div>

            {/* Properties Content */}
            <div className="flex-1 overflow-y-auto">
              {selectedObject ? (
                <div className="p-3 space-y-4">
                  {/* Alignment */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 hover:bg-white/10 rounded text-white/50 hover:text-white/70">
                        <AlignLeft className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 hover:bg-white/10 rounded text-white/50 hover:text-white/70">
                        <AlignCenter className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 hover:bg-white/10 rounded text-white/50 hover:text-white/70">
                        <AlignRight className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 hover:bg-white/10 rounded text-white/50 hover:text-white/70">
                        <AlignStartVertical className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 hover:bg-white/10 rounded text-white/50 hover:text-white/70">
                        <AlignCenterVertical className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 hover:bg-white/10 rounded text-white/50 hover:text-white/70">
                        <AlignEndVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Position & Size */}
                  <div>
                    <div className="text-white/40 text-xs font-medium mb-2">Position</div>
                    <div className="grid grid-cols-2 gap-2">
                      <PropertyInput
                        label="X"
                        value={selectedObject.x}
                        onChange={(v) => updateObject(selectedObject.id, { x: v })}
                      />
                      <PropertyInput
                        label="Y"
                        value={selectedObject.y}
                        onChange={(v) => updateObject(selectedObject.id, { y: v })}
                      />
                      <PropertyInput
                        label="W"
                        value={selectedObject.width}
                        onChange={(v) => updateObject(selectedObject.id, { width: v })}
                        min={1}
                      />
                      <PropertyInput
                        label="H"
                        value={selectedObject.height}
                        onChange={(v) => updateObject(selectedObject.id, { height: v })}
                        min={1}
                      />
                    </div>
                  </div>

                  {/* Rotation */}
                  <div>
                    <PropertyInput
                      label="Rotation"
                      value={selectedObject.rotation}
                      onChange={(v) => updateObject(selectedObject.id, { rotation: v })}
                      unit="deg"
                      min={-360}
                      max={360}
                    />
                  </div>

                  {/* Corner Radius */}
                  {selectedObject.type !== 'ellipse' && selectedObject.type !== 'text' && (
                    <div>
                      <PropertyInput
                        label="Radius"
                        value={selectedObject.cornerRadius || 0}
                        onChange={(v) => updateObject(selectedObject.id, { cornerRadius: v })}
                        min={0}
                      />
                    </div>
                  )}

                  {/* Fill */}
                  <div>
                    <div className="text-white/40 text-xs font-medium mb-2">Fill</div>
                    <ColorPicker
                      color={selectedObject.fill}
                      onChange={(color) => updateObject(selectedObject.id, { fill: color })}
                      label=""
                    />
                  </div>

                  {/* Stroke */}
                  <div>
                    <div className="text-white/40 text-xs font-medium mb-2">Stroke</div>
                    <ColorPicker
                      color={selectedObject.stroke}
                      onChange={(color) => updateObject(selectedObject.id, { stroke: color })}
                      label=""
                    />
                    <div className="mt-2">
                      <PropertyInput
                        label="Width"
                        value={selectedObject.strokeWidth}
                        onChange={(v) => updateObject(selectedObject.id, { strokeWidth: v })}
                        min={0}
                        max={20}
                      />
                    </div>
                  </div>

                  {/* Opacity */}
                  <div>
                    <div className="text-white/40 text-xs font-medium mb-2">Opacity</div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={selectedObject.opacity * 100}
                        onChange={(e) => updateObject(selectedObject.id, { opacity: Number(e.target.value) / 100 })}
                        className="flex-1"
                      />
                      <span className="text-white/70 text-xs w-10 text-right">
                        {Math.round(selectedObject.opacity * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Text Properties */}
                  {selectedObject.type === 'text' && (
                    <div>
                      <div className="text-white/40 text-xs font-medium mb-2">Text</div>
                      <textarea
                        value={selectedObject.text || ''}
                        onChange={(e) => updateObject(selectedObject.id, { text: e.target.value })}
                        className="w-full bg-white/5 px-2 py-1.5 rounded text-white text-sm resize-none outline-none h-16"
                      />
                      <div className="mt-2">
                        <PropertyInput
                          label="Size"
                          value={selectedObject.fontSize || 16}
                          onChange={(v) => updateObject(selectedObject.id, { fontSize: v })}
                          min={8}
                          max={200}
                        />
                      </div>
                    </div>
                  )}

                  {/* Effects */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/40 text-xs font-medium">Effects</span>
                      <button className="p-1 hover:bg-white/10 rounded text-white/50">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-white/30 text-xs text-center py-2">
                      Click + to add drop shadow, blur, or other effects
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                    <button
                      onClick={duplicateSelected}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white/5 hover:bg-white/10 rounded text-white/70 text-xs transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Duplicate
                    </button>
                    <button
                      onClick={deleteSelected}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-500/10 hover:bg-red-500/20 rounded text-red-400 text-xs transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 space-y-4">
                  {rightPanel === 'design' && (
                    <>
                      <div className="text-white/40 text-xs text-center py-8">
                        Select an object to edit its properties
                      </div>
                      <div>
                        <div className="text-white/40 text-xs font-medium mb-2">Page</div>
                        <div className="flex items-center gap-2 px-2 py-1.5 bg-white/5 rounded text-white/70 text-xs">
                          <Grid className="w-4 h-4" />
                          <span>Page 1</span>
                        </div>
                      </div>
                    </>
                  )}

                  {rightPanel === 'prototype' && (
                    <div className="text-center py-8">
                      <Play className="w-12 h-12 mx-auto text-white/20 mb-4" />
                      <p className="text-white/40 text-xs mb-4">
                        Select a frame to add interactions
                      </p>
                      <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs transition-colors">
                        Present
                      </button>
                    </div>
                  )}

                  {rightPanel === 'inspect' && (
                    <div className="text-center py-8">
                      <Settings className="w-12 h-12 mx-auto text-white/20 mb-4" />
                      <p className="text-white/40 text-xs">
                        Select an object to inspect its CSS properties
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Comments Toggle */}
            <div className="border-t border-white/10 p-2">
              <button
                onClick={() => setShowComments(!showComments)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors",
                  showComments ? "bg-orange-500/20 text-orange-400" : "bg-white/5 text-white/70 hover:bg-white/10"
                )}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>Comments</span>
                </div>
                <span className="bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded text-xs">
                  {comments.filter(c => !c.resolved).length}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </ZWindow>
  );
};

export default ZFigmaWindow;
