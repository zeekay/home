import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import ZWindow from './ZWindow';
import { cn } from '@/lib/utils';
import {
  Plus,
  Trash2,
  Search,
  ChevronRight,
  ChevronDown,
  Square,
  Circle,
  Type,
  Image,
  Layers,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Copy,
  Scissors,
  ClipboardPaste,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignHorizontalJustifyCenter,
  AlignVerticalJustifyCenter,
  ArrowUpToLine,
  ArrowDownToLine,
  FlipHorizontal,
  FlipVertical,
  RotateCw,
  Move,
  MousePointer,
  Pen,
  Pencil,
  Grid3X3,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  Upload,
  Share2,
  Settings,
  Palette,
  Droplets,
  Sun,
  Component,
  FolderOpen,
  FileText,
  Check,
  X,
  ChevronLeft,
  MoreHorizontal,
  Link,
  Unlink,
  Command,
  Sparkles,
} from 'lucide-react';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface ZSketchWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

type LayerType = 'rectangle' | 'ellipse' | 'text' | 'image' | 'artboard' | 'group' | 'symbol';
type BlendMode = 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten';

interface Fill {
  id: string;
  enabled: boolean;
  type: 'solid' | 'gradient' | 'image';
  color: string;
  opacity: number;
}

interface Border {
  id: string;
  enabled: boolean;
  color: string;
  width: number;
  position: 'center' | 'inside' | 'outside';
}

interface Shadow {
  id: string;
  enabled: boolean;
  type: 'drop' | 'inner';
  color: string;
  x: number;
  y: number;
  blur: number;
  spread: number;
}

interface BlurEffect {
  enabled: boolean;
  type: 'gaussian' | 'motion' | 'zoom' | 'background';
  amount: number;
}

interface Layer {
  id: string;
  name: string;
  type: LayerType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
  expanded?: boolean;
  fills: Fill[];
  borders: Border[];
  shadows: Shadow[];
  blur: BlurEffect;
  blendMode: BlendMode;
  cornerRadius?: number;
  text?: string;
  fontSize?: number;
  fontWeight?: number;
  textAlign?: 'left' | 'center' | 'right';
  children?: string[];
  symbolId?: string;
  overrides?: Record<string, unknown>;
  constraints?: {
    horizontal: 'left' | 'right' | 'center' | 'scale' | 'leftRight';
    vertical: 'top' | 'bottom' | 'center' | 'scale' | 'topBottom';
  };
  prototypeLink?: string;
}

interface Artboard {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  backgroundColor: string;
  layerIds: string[];
}

interface Page {
  id: string;
  name: string;
  artboardIds: string[];
  isSymbolsPage?: boolean;
}

interface Symbol {
  id: string;
  name: string;
  sourceLayerId: string;
  instances: string[];
}

interface ColorVariable {
  id: string;
  name: string;
  value: string;
}

interface TextStyle {
  id: string;
  name: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  letterSpacing: number;
  color: string;
}

interface LayerStyle {
  id: string;
  name: string;
  fills: Fill[];
  borders: Border[];
  shadows: Shadow[];
}

interface ExportFormat {
  format: 'png' | 'jpg' | 'svg' | 'pdf' | 'webp';
  scale: number;
  suffix: string;
}

type ToolType = 'select' | 'artboard' | 'rectangle' | 'ellipse' | 'line' | 'text' | 'pen' | 'pencil' | 'zoom' | 'hand';
type InspectorTab = 'design' | 'prototype' | 'export';

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'zsketch_project';

const ARTBOARD_PRESETS = [
  { name: 'iPhone 15 Pro', width: 393, height: 852 },
  { name: 'iPhone 15 Pro Max', width: 430, height: 932 },
  { name: 'iPad Pro 11"', width: 834, height: 1194 },
  { name: 'iPad Pro 12.9"', width: 1024, height: 1366 },
  { name: 'MacBook Pro 14"', width: 1512, height: 982 },
  { name: 'MacBook Pro 16"', width: 1728, height: 1117 },
  { name: 'Desktop HD', width: 1440, height: 900 },
  { name: '4K Display', width: 3840, height: 2160 },
  { name: 'Apple Watch 45mm', width: 198, height: 242 },
  { name: 'Custom', width: 400, height: 400 },
];

const DEFAULT_COLORS = [
  '#000000', '#FFFFFF', '#FF3B30', '#FF9500', '#FFCC00', '#34C759',
  '#00C7BE', '#007AFF', '#5856D6', '#AF52DE', '#FF2D55', '#A2845E',
];

const generateId = () => Math.random().toString(36).substring(2, 15);

// ============================================================================
// Default Data
// ============================================================================

const createDefaultProject = (): {
  pages: Page[];
  artboards: Record<string, Artboard>;
  layers: Record<string, Layer>;
  symbols: Record<string, Symbol>;
  colorVariables: ColorVariable[];
  textStyles: TextStyle[];
  layerStyles: LayerStyle[];
} => {
  const mainPageId = generateId();
  const symbolsPageId = generateId();
  const artboardId = generateId();
  const rectId = generateId();
  const textId = generateId();

  return {
    pages: [
      { id: mainPageId, name: 'Page 1', artboardIds: [artboardId] },
      { id: symbolsPageId, name: 'Symbols', artboardIds: [], isSymbolsPage: true },
    ],
    artboards: {
      [artboardId]: {
        id: artboardId,
        name: 'Artboard 1',
        x: 100,
        y: 100,
        width: 393,
        height: 852,
        backgroundColor: '#FFFFFF',
        layerIds: [rectId, textId],
      },
    },
    layers: {
      [rectId]: {
        id: rectId,
        name: 'Rectangle',
        type: 'rectangle',
        x: 50,
        y: 100,
        width: 293,
        height: 200,
        rotation: 0,
        opacity: 100,
        visible: true,
        locked: false,
        fills: [{ id: generateId(), enabled: true, type: 'solid', color: '#007AFF', opacity: 100 }],
        borders: [],
        shadows: [],
        blur: { enabled: false, type: 'gaussian', amount: 0 },
        blendMode: 'normal',
        cornerRadius: 12,
      },
      [textId]: {
        id: textId,
        name: 'Welcome Text',
        type: 'text',
        x: 50,
        y: 340,
        width: 293,
        height: 40,
        rotation: 0,
        opacity: 100,
        visible: true,
        locked: false,
        fills: [{ id: generateId(), enabled: true, type: 'solid', color: '#000000', opacity: 100 }],
        borders: [],
        shadows: [],
        blur: { enabled: false, type: 'gaussian', amount: 0 },
        blendMode: 'normal',
        text: 'Welcome to Sketch',
        fontSize: 24,
        fontWeight: 600,
        textAlign: 'center',
      },
    },
    symbols: {},
    colorVariables: [
      { id: generateId(), name: 'Primary', value: '#007AFF' },
      { id: generateId(), name: 'Success', value: '#34C759' },
      { id: generateId(), name: 'Warning', value: '#FF9500' },
      { id: generateId(), name: 'Danger', value: '#FF3B30' },
      { id: generateId(), name: 'Text Primary', value: '#000000' },
      { id: generateId(), name: 'Text Secondary', value: '#8E8E93' },
      { id: generateId(), name: 'Background', value: '#F2F2F7' },
    ],
    textStyles: [
      { id: generateId(), name: 'Heading 1', fontFamily: 'SF Pro Display', fontSize: 34, fontWeight: 700, lineHeight: 1.2, letterSpacing: 0, color: '#000000' },
      { id: generateId(), name: 'Heading 2', fontFamily: 'SF Pro Display', fontSize: 28, fontWeight: 600, lineHeight: 1.25, letterSpacing: 0, color: '#000000' },
      { id: generateId(), name: 'Body', fontFamily: 'SF Pro Text', fontSize: 17, fontWeight: 400, lineHeight: 1.5, letterSpacing: 0, color: '#000000' },
      { id: generateId(), name: 'Caption', fontFamily: 'SF Pro Text', fontSize: 12, fontWeight: 400, lineHeight: 1.4, letterSpacing: 0, color: '#8E8E93' },
    ],
    layerStyles: [
      {
        id: generateId(),
        name: 'Card',
        fills: [{ id: generateId(), enabled: true, type: 'solid', color: '#FFFFFF', opacity: 100 }],
        borders: [],
        shadows: [{ id: generateId(), enabled: true, type: 'drop', color: 'rgba(0,0,0,0.1)', x: 0, y: 2, blur: 8, spread: 0 }],
      },
      {
        id: generateId(),
        name: 'Button Primary',
        fills: [{ id: generateId(), enabled: true, type: 'solid', color: '#007AFF', opacity: 100 }],
        borders: [],
        shadows: [],
      },
    ],
  };
};

// ============================================================================
// Sub-Components
// ============================================================================

interface ToolButtonProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const ToolButton: React.FC<ToolButtonProps> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    title={label}
    className={cn(
      'p-1.5 rounded transition-colors',
      active ? 'bg-[#007AFF] text-white' : 'text-[#333] hover:bg-black/5'
    )}
  >
    {icon}
  </button>
);

interface LayerRowProps {
  layer: Layer;
  depth: number;
  selected: boolean;
  onSelect: () => void;
  onToggleVisible: () => void;
  onToggleLock: () => void;
}

const LayerRow: React.FC<LayerRowProps> = ({
  layer,
  depth,
  selected,
  onSelect,
  onToggleVisible,
  onToggleLock,
}) => {
  const getLayerIcon = () => {
    switch (layer.type) {
      case 'rectangle': return <Square className="w-3.5 h-3.5" />;
      case 'ellipse': return <Circle className="w-3.5 h-3.5" />;
      case 'text': return <Type className="w-3.5 h-3.5" />;
      case 'image': return <Image className="w-3.5 h-3.5" />;
      case 'group': return <Layers className="w-3.5 h-3.5" />;
      case 'symbol': return <Component className="w-3.5 h-3.5" />;
      case 'artboard': return <Grid3X3 className="w-3.5 h-3.5" />;
      default: return <Square className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 h-7 px-2 cursor-pointer group text-[13px]',
        selected ? 'bg-[#007AFF] text-white' : 'text-[#333] hover:bg-black/5'
      )}
      style={{ paddingLeft: `${8 + depth * 16}px` }}
      onClick={onSelect}
    >
      <span className={cn('flex-shrink-0', layer.visible ? '' : 'opacity-40')}>
        {getLayerIcon()}
      </span>
      <span className={cn('flex-1 truncate', layer.visible ? '' : 'opacity-40')}>
        {layer.name}
      </span>
      <button
        onClick={(e) => { e.stopPropagation(); onToggleLock(); }}
        className={cn(
          'p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity',
          selected ? 'hover:bg-white/20' : 'hover:bg-black/10'
        )}
      >
        {layer.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3 opacity-40" />}
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onToggleVisible(); }}
        className={cn(
          'p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity',
          selected ? 'hover:bg-white/20' : 'hover:bg-black/10'
        )}
      >
        {layer.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
      </button>
    </div>
  );
};

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label?: string;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {label && <span className="text-[11px] text-[#888] mb-1 block">{label}</span>}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-6 h-6 rounded border border-black/10 shadow-sm"
        style={{ backgroundColor: color }}
      />
      {isOpen && (
        <div className="absolute top-8 left-0 z-50 bg-white rounded-lg shadow-xl border border-black/10 p-2">
          <div className="grid grid-cols-6 gap-1 mb-2">
            {DEFAULT_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => { onChange(c); setIsOpen(false); }}
                className={cn(
                  'w-6 h-6 rounded border',
                  color === c ? 'border-[#007AFF] ring-1 ring-[#007AFF]' : 'border-black/10'
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <input
            type="color"
            value={color}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-8 rounded cursor-pointer"
          />
        </div>
      )}
    </div>
  );
};

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}

const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  label,
  min = 0,
  max = 9999,
  step = 1,
  suffix,
}) => (
  <div className="flex flex-col">
    {label && <span className="text-[11px] text-[#888] mb-1">{label}</span>}
    <div className="flex items-center gap-1">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="w-full px-2 py-1 text-[13px] bg-white border border-black/10 rounded focus:outline-none focus:border-[#007AFF] text-[#333]"
      />
      {suffix && <span className="text-[11px] text-[#888]">{suffix}</span>}
    </div>
  </div>
);

interface SectionHeaderProps {
  title: string;
  onAdd?: () => void;
  expanded?: boolean;
  onToggle?: () => void;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, onAdd, expanded, onToggle }) => (
  <div className="flex items-center justify-between px-3 py-2 border-b border-black/5">
    <button
      onClick={onToggle}
      className="flex items-center gap-1 text-[12px] font-medium text-[#333] hover:text-black"
    >
      {onToggle && (expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />)}
      {title}
    </button>
    {onAdd && (
      <button onClick={onAdd} className="p-1 rounded hover:bg-black/5 text-[#888] hover:text-[#333]">
        <Plus className="w-3.5 h-3.5" />
      </button>
    )}
  </div>
);

// ============================================================================
// Main Component
// ============================================================================

const ZSketchWindow: React.FC<ZSketchWindowProps> = ({ onClose, onFocus }) => {
  // Project state
  const [pages, setPages] = useState<Page[]>([]);
  const [artboards, setArtboards] = useState<Record<string, Artboard>>({});
  const [layers, setLayers] = useState<Record<string, Layer>>({});
  const [symbols, setSymbols] = useState<Record<string, Symbol>>({});
  const [colorVariables, setColorVariables] = useState<ColorVariable[]>([]);
  const [textStyles, setTextStyles] = useState<TextStyle[]>([]);
  const [layerStyles, setLayerStyles] = useState<LayerStyle[]>([]);

  // UI state
  const [currentPageId, setCurrentPageId] = useState<string>('');
  const [selectedLayerIds, setSelectedLayerIds] = useState<Set<string>>(new Set());
  const [selectedArtboardId, setSelectedArtboardId] = useState<string | null>(null);
  const [currentTool, setCurrentTool] = useState<ToolType>('select');
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>('design');
  const [zoom, setZoom] = useState(100);
  const [showInsertMenu, setShowInsertMenu] = useState(false);
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagesExpanded, setPagesExpanded] = useState(true);
  const [layersExpanded, setLayersExpanded] = useState(true);

  // Inspector section states
  const [alignmentExpanded, setAlignmentExpanded] = useState(true);
  const [styleExpanded, setStyleExpanded] = useState(true);
  const [fillsExpanded, setFillsExpanded] = useState(true);
  const [bordersExpanded, setBordersExpanded] = useState(true);
  const [shadowsExpanded, setShadowsExpanded] = useState(true);
  const [blurExpanded, setBlurExpanded] = useState(false);

  // Export options
  const [exportFormats, setExportFormats] = useState<ExportFormat[]>([
    { format: 'png', scale: 1, suffix: '' },
    { format: 'png', scale: 2, suffix: '@2x' },
  ]);

  // Canvas ref
  const canvasRef = useRef<HTMLDivElement>(null);

  // Load/save project
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        setPages(data.pages || []);
        setArtboards(data.artboards || {});
        setLayers(data.layers || {});
        setSymbols(data.symbols || {});
        setColorVariables(data.colorVariables || []);
        setTextStyles(data.textStyles || []);
        setLayerStyles(data.layerStyles || []);
        if (data.pages?.[0]?.id) setCurrentPageId(data.pages[0].id);
      } else {
        const defaultData = createDefaultProject();
        setPages(defaultData.pages);
        setArtboards(defaultData.artboards);
        setLayers(defaultData.layers);
        setSymbols(defaultData.symbols);
        setColorVariables(defaultData.colorVariables);
        setTextStyles(defaultData.textStyles);
        setLayerStyles(defaultData.layerStyles);
        setCurrentPageId(defaultData.pages[0].id);
      }
    } catch (e) {
      console.error('Failed to load project:', e);
      const defaultData = createDefaultProject();
      setPages(defaultData.pages);
      setArtboards(defaultData.artboards);
      setLayers(defaultData.layers);
      setSymbols(defaultData.symbols);
      setColorVariables(defaultData.colorVariables);
      setTextStyles(defaultData.textStyles);
      setLayerStyles(defaultData.layerStyles);
      setCurrentPageId(defaultData.pages[0].id);
    }
  }, []);

  useEffect(() => {
    if (pages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          pages, artboards, layers, symbols, colorVariables, textStyles, layerStyles,
        }));
      } catch (e) {
        console.error('Failed to save project:', e);
      }
    }
  }, [pages, artboards, layers, symbols, colorVariables, textStyles, layerStyles]);

  // Current page and artboards
  const currentPage = useMemo(() => pages.find(p => p.id === currentPageId), [pages, currentPageId]);
  const currentArtboards = useMemo(() => {
    if (!currentPage) return [];
    return currentPage.artboardIds.map(id => artboards[id]).filter(Boolean);
  }, [currentPage, artboards]);

  // Selected layer
  const selectedLayer = useMemo(() => {
    const ids = Array.from(selectedLayerIds);
    return ids.length === 1 ? layers[ids[0]] : null;
  }, [selectedLayerIds, layers]);

  // Actions
  const addPage = useCallback(() => {
    const newPage: Page = {
      id: generateId(),
      name: `Page ${pages.length + 1}`,
      artboardIds: [],
    };
    setPages(prev => [...prev, newPage]);
    setCurrentPageId(newPage.id);
  }, [pages.length]);

  const addArtboard = useCallback((preset?: typeof ARTBOARD_PRESETS[0]) => {
    if (!currentPage) return;

    const newArtboard: Artboard = {
      id: generateId(),
      name: preset?.name || 'Artboard',
      x: 100 + currentArtboards.length * 50,
      y: 100,
      width: preset?.width || 400,
      height: preset?.height || 400,
      backgroundColor: '#FFFFFF',
      layerIds: [],
    };

    setArtboards(prev => ({ ...prev, [newArtboard.id]: newArtboard }));
    setPages(prev => prev.map(p =>
      p.id === currentPageId ? { ...p, artboardIds: [...p.artboardIds, newArtboard.id] } : p
    ));
    setShowInsertMenu(false);
  }, [currentPage, currentPageId, currentArtboards.length]);

  const addShape = useCallback((type: 'rectangle' | 'ellipse') => {
    const artboardId = selectedArtboardId || currentArtboards[0]?.id;
    if (!artboardId) return;

    const newLayer: Layer = {
      id: generateId(),
      name: type === 'rectangle' ? 'Rectangle' : 'Oval',
      type,
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      rotation: 0,
      opacity: 100,
      visible: true,
      locked: false,
      fills: [{ id: generateId(), enabled: true, type: 'solid', color: '#D8D8D8', opacity: 100 }],
      borders: [{ id: generateId(), enabled: true, color: '#979797', width: 1, position: 'center' }],
      shadows: [],
      blur: { enabled: false, type: 'gaussian', amount: 0 },
      blendMode: 'normal',
      cornerRadius: 0,
    };

    setLayers(prev => ({ ...prev, [newLayer.id]: newLayer }));
    setArtboards(prev => ({
      ...prev,
      [artboardId]: {
        ...prev[artboardId],
        layerIds: [...prev[artboardId].layerIds, newLayer.id],
      },
    }));
    setSelectedLayerIds(new Set([newLayer.id]));
    setShowInsertMenu(false);
    setCurrentTool('select');
  }, [selectedArtboardId, currentArtboards]);

  const addText = useCallback(() => {
    const artboardId = selectedArtboardId || currentArtboards[0]?.id;
    if (!artboardId) return;

    const newLayer: Layer = {
      id: generateId(),
      name: 'Text',
      type: 'text',
      x: 50,
      y: 50,
      width: 200,
      height: 24,
      rotation: 0,
      opacity: 100,
      visible: true,
      locked: false,
      fills: [{ id: generateId(), enabled: true, type: 'solid', color: '#000000', opacity: 100 }],
      borders: [],
      shadows: [],
      blur: { enabled: false, type: 'gaussian', amount: 0 },
      blendMode: 'normal',
      text: 'Type something',
      fontSize: 16,
      fontWeight: 400,
      textAlign: 'left',
    };

    setLayers(prev => ({ ...prev, [newLayer.id]: newLayer }));
    setArtboards(prev => ({
      ...prev,
      [artboardId]: {
        ...prev[artboardId],
        layerIds: [...prev[artboardId].layerIds, newLayer.id],
      },
    }));
    setSelectedLayerIds(new Set([newLayer.id]));
    setShowInsertMenu(false);
    setCurrentTool('select');
  }, [selectedArtboardId, currentArtboards]);

  const updateLayer = useCallback((layerId: string, updates: Partial<Layer>) => {
    setLayers(prev => ({
      ...prev,
      [layerId]: { ...prev[layerId], ...updates },
    }));
  }, []);

  const deleteSelectedLayers = useCallback(() => {
    const ids = Array.from(selectedLayerIds);
    if (ids.length === 0) return;

    setLayers(prev => {
      const next = { ...prev };
      ids.forEach(id => delete next[id]);
      return next;
    });

    setArtboards(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(abId => {
        next[abId] = {
          ...next[abId],
          layerIds: next[abId].layerIds.filter(id => !ids.includes(id)),
        };
      });
      return next;
    });

    setSelectedLayerIds(new Set());
  }, [selectedLayerIds]);

  const createSymbol = useCallback(() => {
    if (!selectedLayer) return;

    const newSymbol: Symbol = {
      id: generateId(),
      name: `${selectedLayer.name} Symbol`,
      sourceLayerId: selectedLayer.id,
      instances: [],
    };

    setSymbols(prev => ({ ...prev, [newSymbol.id]: newSymbol }));
    updateLayer(selectedLayer.id, { type: 'symbol', symbolId: newSymbol.id });
  }, [selectedLayer, updateLayer]);

  const addFill = useCallback(() => {
    if (!selectedLayer) return;
    const newFill: Fill = {
      id: generateId(),
      enabled: true,
      type: 'solid',
      color: '#D8D8D8',
      opacity: 100,
    };
    updateLayer(selectedLayer.id, { fills: [...selectedLayer.fills, newFill] });
  }, [selectedLayer, updateLayer]);

  const addBorder = useCallback(() => {
    if (!selectedLayer) return;
    const newBorder: Border = {
      id: generateId(),
      enabled: true,
      color: '#979797',
      width: 1,
      position: 'center',
    };
    updateLayer(selectedLayer.id, { borders: [...selectedLayer.borders, newBorder] });
  }, [selectedLayer, updateLayer]);

  const addShadow = useCallback(() => {
    if (!selectedLayer) return;
    const newShadow: Shadow = {
      id: generateId(),
      enabled: true,
      type: 'drop',
      color: 'rgba(0,0,0,0.25)',
      x: 0,
      y: 2,
      blur: 4,
      spread: 0,
    };
    updateLayer(selectedLayer.id, { shadows: [...selectedLayer.shadows, newShadow] });
  }, [selectedLayer, updateLayer]);

  const addExportFormat = useCallback(() => {
    setExportFormats(prev => [...prev, { format: 'png', scale: 1, suffix: '' }]);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedLayerIds.size > 0) {
          e.preventDefault();
          deleteSelectedLayers();
        }
      }
      if (e.key === 'v' && !e.metaKey && !e.ctrlKey) setCurrentTool('select');
      if (e.key === 'a' && !e.metaKey && !e.ctrlKey) setCurrentTool('artboard');
      if (e.key === 'r' && !e.metaKey && !e.ctrlKey) setCurrentTool('rectangle');
      if (e.key === 'o' && !e.metaKey && !e.ctrlKey) setCurrentTool('ellipse');
      if (e.key === 't' && !e.metaKey && !e.ctrlKey) setCurrentTool('text');
      if (e.key === 'z' && !e.metaKey && !e.ctrlKey) setCurrentTool('zoom');
      if ((e.metaKey || e.ctrlKey) && e.key === '=') { e.preventDefault(); setZoom(z => Math.min(z + 25, 400)); }
      if ((e.metaKey || e.ctrlKey) && e.key === '-') { e.preventDefault(); setZoom(z => Math.max(z - 25, 25)); }
      if ((e.metaKey || e.ctrlKey) && e.key === '0') { e.preventDefault(); setZoom(100); }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedLayerIds, deleteSelectedLayers]);

  // Render toolbar
  const renderToolbar = () => (
    <div className="h-10 bg-[#F6F6F6] border-b border-black/10 flex items-center px-3 gap-2">
      {/* Insert Menu */}
      <div className="relative">
        <button
          onClick={() => setShowInsertMenu(!showInsertMenu)}
          className={cn(
            'flex items-center gap-1 px-2 py-1 rounded text-[13px] font-medium transition-colors',
            showInsertMenu ? 'bg-[#007AFF] text-white' : 'text-[#333] hover:bg-black/5'
          )}
        >
          <Plus className="w-4 h-4" />
          Insert
        </button>
        {showInsertMenu && (
          <div className="absolute top-9 left-0 z-50 w-48 bg-white rounded-lg shadow-xl border border-black/10 py-1">
            <button onClick={() => addArtboard(ARTBOARD_PRESETS[0])} className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] text-[#333] hover:bg-[#007AFF] hover:text-white">
              <Grid3X3 className="w-4 h-4" /> Artboard
            </button>
            <div className="h-px bg-black/5 my-1" />
            <button onClick={() => addShape('rectangle')} className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] text-[#333] hover:bg-[#007AFF] hover:text-white">
              <Square className="w-4 h-4" /> Rectangle <span className="ml-auto text-[11px] text-[#888]">R</span>
            </button>
            <button onClick={() => addShape('ellipse')} className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] text-[#333] hover:bg-[#007AFF] hover:text-white">
              <Circle className="w-4 h-4" /> Oval <span className="ml-auto text-[11px] text-[#888]">O</span>
            </button>
            <button onClick={addText} className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] text-[#333] hover:bg-[#007AFF] hover:text-white">
              <Type className="w-4 h-4" /> Text <span className="ml-auto text-[11px] text-[#888]">T</span>
            </button>
            <button className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] text-[#333] hover:bg-[#007AFF] hover:text-white">
              <Image className="w-4 h-4" /> Image
            </button>
            <div className="h-px bg-black/5 my-1" />
            <button className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] text-[#333] hover:bg-[#007AFF] hover:text-white">
              <Component className="w-4 h-4" /> Symbol...
            </button>
          </div>
        )}
      </div>

      {/* Create Symbol */}
      <button
        onClick={createSymbol}
        disabled={!selectedLayer}
        className={cn(
          'flex items-center gap-1 px-2 py-1 rounded text-[13px] font-medium transition-colors',
          selectedLayer ? 'text-[#333] hover:bg-black/5' : 'text-[#999] cursor-not-allowed'
        )}
      >
        <Sparkles className="w-4 h-4" />
        Create Symbol
      </button>

      <div className="w-px h-5 bg-black/10 mx-1" />

      {/* Tools */}
      <div className="flex items-center gap-0.5">
        <ToolButton icon={<MousePointer className="w-4 h-4" />} label="Select (V)" active={currentTool === 'select'} onClick={() => setCurrentTool('select')} />
        <ToolButton icon={<Grid3X3 className="w-4 h-4" />} label="Artboard (A)" active={currentTool === 'artboard'} onClick={() => setCurrentTool('artboard')} />
        <ToolButton icon={<Square className="w-4 h-4" />} label="Rectangle (R)" active={currentTool === 'rectangle'} onClick={() => setCurrentTool('rectangle')} />
        <ToolButton icon={<Circle className="w-4 h-4" />} label="Oval (O)" active={currentTool === 'ellipse'} onClick={() => setCurrentTool('ellipse')} />
        <ToolButton icon={<Type className="w-4 h-4" />} label="Text (T)" active={currentTool === 'text'} onClick={() => setCurrentTool('text')} />
        <ToolButton icon={<Pen className="w-4 h-4" />} label="Vector (P)" active={currentTool === 'pen'} onClick={() => setCurrentTool('pen')} />
        <ToolButton icon={<Pencil className="w-4 h-4" />} label="Pencil" active={currentTool === 'pencil'} onClick={() => setCurrentTool('pencil')} />
      </div>

      <div className="flex-1" />

      {/* Zoom */}
      <div className="flex items-center gap-1">
        <button onClick={() => setZoom(z => Math.max(z - 25, 25))} className="p-1 rounded text-[#333] hover:bg-black/5">
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="text-[12px] text-[#333] w-12 text-center">{zoom}%</span>
        <button onClick={() => setZoom(z => Math.min(z + 25, 400))} className="p-1 rounded text-[#333] hover:bg-black/5">
          <ZoomIn className="w-4 h-4" />
        </button>
        <button onClick={() => setZoom(100)} className="p-1 rounded text-[#333] hover:bg-black/5" title="Zoom to 100%">
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      <div className="w-px h-5 bg-black/10 mx-1" />

      {/* View Options */}
      <button className="p-1.5 rounded text-[#333] hover:bg-black/5" title="View Settings">
        <Settings className="w-4 h-4" />
      </button>
      <button className="p-1.5 rounded text-[#333] hover:bg-black/5" title="Share">
        <Share2 className="w-4 h-4" />
      </button>
    </div>
  );

  // Render left sidebar (Pages + Layers)
  const renderLeftSidebar = () => (
    <div className="w-56 bg-[#F6F6F6] border-r border-black/10 flex flex-col">
      {/* Pages */}
      <div className="border-b border-black/10">
        <SectionHeader
          title="Pages"
          onAdd={addPage}
          expanded={pagesExpanded}
          onToggle={() => setPagesExpanded(!pagesExpanded)}
        />
        {pagesExpanded && (
          <div className="py-1">
            {pages.map(page => (
              <button
                key={page.id}
                onClick={() => setCurrentPageId(page.id)}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-1.5 text-[13px]',
                  currentPageId === page.id ? 'bg-[#007AFF] text-white' : 'text-[#333] hover:bg-black/5'
                )}
              >
                {page.isSymbolsPage ? <Component className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                {page.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Layers */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <SectionHeader
          title="Layers"
          expanded={layersExpanded}
          onToggle={() => setLayersExpanded(!layersExpanded)}
        />
        {layersExpanded && (
          <div className="flex-1 overflow-y-auto">
            {currentArtboards.map(artboard => (
              <div key={artboard.id}>
                <button
                  onClick={() => setSelectedArtboardId(artboard.id)}
                  className={cn(
                    'w-full flex items-center gap-1.5 h-7 px-2 text-[13px] font-medium',
                    selectedArtboardId === artboard.id ? 'bg-[#E5E5E5]' : 'hover:bg-black/5'
                  )}
                >
                  <ChevronDown className="w-3 h-3" />
                  <Grid3X3 className="w-3.5 h-3.5 text-[#666]" />
                  <span className="text-[#333]">{artboard.name}</span>
                </button>
                {artboard.layerIds.map(layerId => {
                  const layer = layers[layerId];
                  if (!layer) return null;
                  return (
                    <LayerRow
                      key={layer.id}
                      layer={layer}
                      depth={1}
                      selected={selectedLayerIds.has(layer.id)}
                      onSelect={() => setSelectedLayerIds(new Set([layer.id]))}
                      onToggleVisible={() => updateLayer(layer.id, { visible: !layer.visible })}
                      onToggleLock={() => updateLayer(layer.id, { locked: !layer.locked })}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Render canvas
  const renderCanvas = () => (
    <div
      ref={canvasRef}
      className="flex-1 bg-[#E5E5E5] overflow-auto relative"
      onClick={() => setSelectedLayerIds(new Set())}
    >
      <div
        className="absolute"
        style={{
          transform: `scale(${zoom / 100})`,
          transformOrigin: 'top left',
        }}
      >
        {currentArtboards.map(artboard => (
          <div
            key={artboard.id}
            className="absolute shadow-lg"
            style={{
              left: artboard.x,
              top: artboard.y,
              width: artboard.width,
              height: artboard.height,
              backgroundColor: artboard.backgroundColor,
            }}
            onClick={(e) => { e.stopPropagation(); setSelectedArtboardId(artboard.id); }}
          >
            {/* Artboard name */}
            <div className="absolute -top-6 left-0 text-[11px] text-[#666] font-medium">
              {artboard.name}
            </div>
            {/* Layers */}
            {artboard.layerIds.map(layerId => {
              const layer = layers[layerId];
              if (!layer || !layer.visible) return null;

              const isSelected = selectedLayerIds.has(layer.id);
              const fill = layer.fills.find(f => f.enabled);
              const border = layer.borders.find(b => b.enabled);

              return (
                <div
                  key={layer.id}
                  className={cn(
                    'absolute cursor-move',
                    isSelected && 'ring-2 ring-[#007AFF]'
                  )}
                  style={{
                    left: layer.x,
                    top: layer.y,
                    width: layer.width,
                    height: layer.height,
                    backgroundColor: fill?.color || 'transparent',
                    opacity: layer.opacity / 100,
                    borderRadius: layer.cornerRadius,
                    border: border ? `${border.width}px solid ${border.color}` : undefined,
                    transform: `rotate(${layer.rotation}deg)`,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!layer.locked) setSelectedLayerIds(new Set([layer.id]));
                  }}
                >
                  {layer.type === 'text' && (
                    <div
                      className="w-full h-full flex items-center justify-center p-2"
                      style={{
                        fontSize: layer.fontSize,
                        fontWeight: layer.fontWeight,
                        textAlign: layer.textAlign,
                        color: fill?.color || '#000',
                      }}
                    >
                      {layer.text}
                    </div>
                  )}
                  {layer.type === 'ellipse' && (
                    <div
                      className="w-full h-full rounded-full"
                      style={{
                        backgroundColor: fill?.color || 'transparent',
                        border: border ? `${border.width}px solid ${border.color}` : undefined,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );

  // Render right sidebar (Inspector)
  const renderInspector = () => (
    <div className="w-64 bg-[#F6F6F6] border-l border-black/10 flex flex-col overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-black/10">
        {(['design', 'prototype', 'export'] as InspectorTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setInspectorTab(tab)}
            className={cn(
              'flex-1 py-2 text-[12px] font-medium capitalize transition-colors',
              inspectorTab === tab
                ? 'text-[#007AFF] border-b-2 border-[#007AFF]'
                : 'text-[#666] hover:text-[#333]'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {inspectorTab === 'design' && selectedLayer && (
          <>
            {/* Alignment */}
            <div className="border-b border-black/5">
              <SectionHeader
                title="Alignment"
                expanded={alignmentExpanded}
                onToggle={() => setAlignmentExpanded(!alignmentExpanded)}
              />
              {alignmentExpanded && (
                <div className="px-3 pb-3">
                  <div className="flex gap-1">
                    <button className="flex-1 p-2 rounded bg-white border border-black/10 hover:bg-black/5">
                      <AlignLeft className="w-4 h-4 mx-auto text-[#333]" />
                    </button>
                    <button className="flex-1 p-2 rounded bg-white border border-black/10 hover:bg-black/5">
                      <AlignHorizontalJustifyCenter className="w-4 h-4 mx-auto text-[#333]" />
                    </button>
                    <button className="flex-1 p-2 rounded bg-white border border-black/10 hover:bg-black/5">
                      <AlignRight className="w-4 h-4 mx-auto text-[#333]" />
                    </button>
                    <button className="flex-1 p-2 rounded bg-white border border-black/10 hover:bg-black/5">
                      <ArrowUpToLine className="w-4 h-4 mx-auto text-[#333]" />
                    </button>
                    <button className="flex-1 p-2 rounded bg-white border border-black/10 hover:bg-black/5">
                      <AlignVerticalJustifyCenter className="w-4 h-4 mx-auto text-[#333]" />
                    </button>
                    <button className="flex-1 p-2 rounded bg-white border border-black/10 hover:bg-black/5">
                      <ArrowDownToLine className="w-4 h-4 mx-auto text-[#333]" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Style (Position & Size) */}
            <div className="border-b border-black/5">
              <SectionHeader
                title="Style"
                expanded={styleExpanded}
                onToggle={() => setStyleExpanded(!styleExpanded)}
              />
              {styleExpanded && (
                <div className="px-3 pb-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <NumberInput label="X" value={selectedLayer.x} onChange={(v) => updateLayer(selectedLayer.id, { x: v })} />
                    <NumberInput label="Y" value={selectedLayer.y} onChange={(v) => updateLayer(selectedLayer.id, { y: v })} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <NumberInput label="Width" value={selectedLayer.width} onChange={(v) => updateLayer(selectedLayer.id, { width: v })} />
                    <NumberInput label="Height" value={selectedLayer.height} onChange={(v) => updateLayer(selectedLayer.id, { height: v })} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <NumberInput label="Rotation" value={selectedLayer.rotation} onChange={(v) => updateLayer(selectedLayer.id, { rotation: v })} suffix="°" />
                    <NumberInput label="Opacity" value={selectedLayer.opacity} onChange={(v) => updateLayer(selectedLayer.id, { opacity: v })} min={0} max={100} suffix="%" />
                  </div>
                  {selectedLayer.type === 'rectangle' && (
                    <NumberInput label="Corner Radius" value={selectedLayer.cornerRadius || 0} onChange={(v) => updateLayer(selectedLayer.id, { cornerRadius: v })} />
                  )}
                </div>
              )}
            </div>

            {/* Fills */}
            <div className="border-b border-black/5">
              <SectionHeader
                title="Fills"
                onAdd={addFill}
                expanded={fillsExpanded}
                onToggle={() => setFillsExpanded(!fillsExpanded)}
              />
              {fillsExpanded && selectedLayer.fills.length > 0 && (
                <div className="px-3 pb-3 space-y-2">
                  {selectedLayer.fills.map((fill, idx) => (
                    <div key={fill.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={fill.enabled}
                        onChange={(e) => {
                          const newFills = [...selectedLayer.fills];
                          newFills[idx] = { ...fill, enabled: e.target.checked };
                          updateLayer(selectedLayer.id, { fills: newFills });
                        }}
                        className="w-3.5 h-3.5"
                      />
                      <ColorPicker
                        color={fill.color}
                        onChange={(c) => {
                          const newFills = [...selectedLayer.fills];
                          newFills[idx] = { ...fill, color: c };
                          updateLayer(selectedLayer.id, { fills: newFills });
                        }}
                      />
                      <span className="text-[12px] text-[#333] flex-1">{fill.color.toUpperCase()}</span>
                      <button
                        onClick={() => {
                          const newFills = selectedLayer.fills.filter((_, i) => i !== idx);
                          updateLayer(selectedLayer.id, { fills: newFills });
                        }}
                        className="p-1 rounded hover:bg-black/5 text-[#888]"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Borders */}
            <div className="border-b border-black/5">
              <SectionHeader
                title="Borders"
                onAdd={addBorder}
                expanded={bordersExpanded}
                onToggle={() => setBordersExpanded(!bordersExpanded)}
              />
              {bordersExpanded && selectedLayer.borders.length > 0 && (
                <div className="px-3 pb-3 space-y-2">
                  {selectedLayer.borders.map((border, idx) => (
                    <div key={border.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={border.enabled}
                        onChange={(e) => {
                          const newBorders = [...selectedLayer.borders];
                          newBorders[idx] = { ...border, enabled: e.target.checked };
                          updateLayer(selectedLayer.id, { borders: newBorders });
                        }}
                        className="w-3.5 h-3.5"
                      />
                      <ColorPicker
                        color={border.color}
                        onChange={(c) => {
                          const newBorders = [...selectedLayer.borders];
                          newBorders[idx] = { ...border, color: c };
                          updateLayer(selectedLayer.id, { borders: newBorders });
                        }}
                      />
                      <input
                        type="number"
                        value={border.width}
                        onChange={(e) => {
                          const newBorders = [...selectedLayer.borders];
                          newBorders[idx] = { ...border, width: Number(e.target.value) };
                          updateLayer(selectedLayer.id, { borders: newBorders });
                        }}
                        className="w-12 px-1 py-0.5 text-[12px] bg-white border border-black/10 rounded text-[#333]"
                        min={0}
                      />
                      <button
                        onClick={() => {
                          const newBorders = selectedLayer.borders.filter((_, i) => i !== idx);
                          updateLayer(selectedLayer.id, { borders: newBorders });
                        }}
                        className="p-1 rounded hover:bg-black/5 text-[#888]"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Shadows */}
            <div className="border-b border-black/5">
              <SectionHeader
                title="Shadows"
                onAdd={addShadow}
                expanded={shadowsExpanded}
                onToggle={() => setShadowsExpanded(!shadowsExpanded)}
              />
              {shadowsExpanded && selectedLayer.shadows.length > 0 && (
                <div className="px-3 pb-3 space-y-3">
                  {selectedLayer.shadows.map((shadow, idx) => (
                    <div key={shadow.id} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={shadow.enabled}
                          onChange={(e) => {
                            const newShadows = [...selectedLayer.shadows];
                            newShadows[idx] = { ...shadow, enabled: e.target.checked };
                            updateLayer(selectedLayer.id, { shadows: newShadows });
                          }}
                          className="w-3.5 h-3.5"
                        />
                        <span className="text-[12px] text-[#333] flex-1">
                          {shadow.type === 'drop' ? 'Drop Shadow' : 'Inner Shadow'}
                        </span>
                        <button
                          onClick={() => {
                            const newShadows = selectedLayer.shadows.filter((_, i) => i !== idx);
                            updateLayer(selectedLayer.id, { shadows: newShadows });
                          }}
                          className="p-1 rounded hover:bg-black/5 text-[#888]"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="grid grid-cols-4 gap-1">
                        <NumberInput label="X" value={shadow.x} onChange={(v) => {
                          const newShadows = [...selectedLayer.shadows];
                          newShadows[idx] = { ...shadow, x: v };
                          updateLayer(selectedLayer.id, { shadows: newShadows });
                        }} />
                        <NumberInput label="Y" value={shadow.y} onChange={(v) => {
                          const newShadows = [...selectedLayer.shadows];
                          newShadows[idx] = { ...shadow, y: v };
                          updateLayer(selectedLayer.id, { shadows: newShadows });
                        }} />
                        <NumberInput label="Blur" value={shadow.blur} onChange={(v) => {
                          const newShadows = [...selectedLayer.shadows];
                          newShadows[idx] = { ...shadow, blur: v };
                          updateLayer(selectedLayer.id, { shadows: newShadows });
                        }} />
                        <NumberInput label="Spread" value={shadow.spread} onChange={(v) => {
                          const newShadows = [...selectedLayer.shadows];
                          newShadows[idx] = { ...shadow, spread: v };
                          updateLayer(selectedLayer.id, { shadows: newShadows });
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Blur */}
            <div className="border-b border-black/5">
              <SectionHeader
                title="Blur"
                expanded={blurExpanded}
                onToggle={() => setBlurExpanded(!blurExpanded)}
              />
              {blurExpanded && (
                <div className="px-3 pb-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedLayer.blur.enabled}
                      onChange={(e) => updateLayer(selectedLayer.id, { blur: { ...selectedLayer.blur, enabled: e.target.checked } })}
                      className="w-3.5 h-3.5"
                    />
                    <span className="text-[12px] text-[#333]">Gaussian Blur</span>
                  </div>
                  <NumberInput
                    label="Amount"
                    value={selectedLayer.blur.amount}
                    onChange={(v) => updateLayer(selectedLayer.id, { blur: { ...selectedLayer.blur, amount: v } })}
                  />
                </div>
              )}
            </div>
          </>
        )}

        {inspectorTab === 'design' && !selectedLayer && (
          <div className="flex flex-col items-center justify-center h-48 text-[#888] text-[13px]">
            <Layers className="w-8 h-8 mb-2 opacity-50" />
            Select a layer to inspect
          </div>
        )}

        {inspectorTab === 'prototype' && (
          <div className="p-3">
            <div className="text-[12px] text-[#888] mb-3">
              Add interactions to create clickable prototypes.
            </div>
            {selectedLayer ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Link className="w-4 h-4 text-[#666]" />
                  <span className="text-[13px] text-[#333]">Link to</span>
                </div>
                <select className="w-full px-2 py-1.5 text-[13px] bg-white border border-black/10 rounded text-[#333]">
                  <option>None</option>
                  {currentArtboards.map(ab => (
                    <option key={ab.id} value={ab.id}>{ab.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="text-center text-[#888] text-[12px] py-8">
                Select a layer to add prototype links
              </div>
            )}
          </div>
        )}

        {inspectorTab === 'export' && (
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[12px] font-medium text-[#333]">Export Formats</span>
              <button onClick={addExportFormat} className="p-1 rounded hover:bg-black/5 text-[#888]">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {exportFormats.map((format, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-white rounded border border-black/10 p-2">
                  <select
                    value={format.scale}
                    onChange={(e) => {
                      const newFormats = [...exportFormats];
                      newFormats[idx] = { ...format, scale: Number(e.target.value) };
                      setExportFormats(newFormats);
                    }}
                    className="w-14 px-1 py-0.5 text-[12px] bg-transparent border border-black/10 rounded text-[#333]"
                  >
                    <option value={0.5}>0.5x</option>
                    <option value={1}>1x</option>
                    <option value={2}>2x</option>
                    <option value={3}>3x</option>
                  </select>
                  <input
                    type="text"
                    value={format.suffix}
                    placeholder="Suffix"
                    onChange={(e) => {
                      const newFormats = [...exportFormats];
                      newFormats[idx] = { ...format, suffix: e.target.value };
                      setExportFormats(newFormats);
                    }}
                    className="w-16 px-1 py-0.5 text-[12px] bg-transparent border border-black/10 rounded text-[#333]"
                  />
                  <select
                    value={format.format}
                    onChange={(e) => {
                      const newFormats = [...exportFormats];
                      newFormats[idx] = { ...format, format: e.target.value as ExportFormat['format'] };
                      setExportFormats(newFormats);
                    }}
                    className="flex-1 px-1 py-0.5 text-[12px] bg-transparent border border-black/10 rounded text-[#333]"
                  >
                    <option value="png">PNG</option>
                    <option value="jpg">JPG</option>
                    <option value="svg">SVG</option>
                    <option value="pdf">PDF</option>
                    <option value="webp">WebP</option>
                  </select>
                  <button
                    onClick={() => setExportFormats(exportFormats.filter((_, i) => i !== idx))}
                    className="p-1 rounded hover:bg-black/5 text-[#888]"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <button className="w-full mt-3 py-2 bg-[#007AFF] text-white text-[13px] font-medium rounded hover:bg-[#0066DD] transition-colors flex items-center justify-center gap-2">
              <Download className="w-4 h-4" />
              Export Selected
            </button>
          </div>
        )}

        {/* Color Variables */}
        {inspectorTab === 'design' && (
          <div className="border-t border-black/5 mt-2">
            <SectionHeader title="Color Variables" />
            <div className="px-3 pb-3">
              <div className="flex flex-wrap gap-1">
                {colorVariables.map(cv => (
                  <button
                    key={cv.id}
                    title={cv.name}
                    className="w-6 h-6 rounded border border-black/10 shadow-sm hover:scale-110 transition-transform"
                    style={{ backgroundColor: cv.value }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Text Styles */}
        {inspectorTab === 'design' && (
          <div className="border-t border-black/5">
            <SectionHeader title="Text Styles" />
            <div className="px-3 pb-3 space-y-1">
              {textStyles.map(ts => (
                <button
                  key={ts.id}
                  className="w-full text-left px-2 py-1 rounded hover:bg-black/5 text-[12px] text-[#333]"
                >
                  {ts.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Layer Styles */}
        {inspectorTab === 'design' && (
          <div className="border-t border-black/5">
            <SectionHeader title="Layer Styles" />
            <div className="px-3 pb-3 space-y-1">
              {layerStyles.map(ls => (
                <button
                  key={ls.id}
                  className="w-full text-left px-2 py-1 rounded hover:bg-black/5 text-[12px] text-[#333]"
                >
                  {ls.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <ZWindow
      title="Sketch"
      onClose={onClose}
      onFocus={onFocus}
      defaultWidth={1200}
      defaultHeight={800}
      minWidth={900}
      minHeight={600}
      defaultPosition={{ x: 80, y: 40 }}
    >
      <div className="h-full flex flex-col bg-[#FFFFFF]">
        {renderToolbar()}
        <div className="flex-1 flex overflow-hidden">
          {renderLeftSidebar()}
          {renderCanvas()}
          {renderInspector()}
        </div>
      </div>
    </ZWindow>
  );
};

export default ZSketchWindow;
