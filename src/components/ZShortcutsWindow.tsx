import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import ZWindow from './ZWindow';
import { cn } from '@/lib/utils';
import {
  Plus,
  Play,
  Trash2,
  Copy,
  Download,
  Upload,
  Search,
  ChevronRight,
  GripVertical,
  X,
  Settings,
  Keyboard,
  Clock,
  AppWindow,
  Menu,
  Sunrise,
  Moon,
  Code,
  Headphones,
  Share,
  Edit3,
  Globe,
  StickyNote,
  MessageCircle,
  Bell,
  Terminal,
  Music,
  CloudSun,
  MessageSquare,
  Check,
  MoreHorizontal,
} from 'lucide-react';
import {
  useShortcuts,
  Shortcut,
  ShortcutAction,
  ACTION_DEFINITIONS,
  GALLERY_SHORTCUTS,
  ActionType,
  TriggerType,
} from '@/contexts/ShortcutsContext';

interface ZShortcutsWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

// Icon mapping for actions
const ACTION_ICONS: Record<string, React.FC<{ className?: string }>> = {
  'app-window': AppWindow,
  'globe': Globe,
  'sticky-note': StickyNote,
  'message-circle': MessageCircle,
  'bell': Bell,
  'terminal': Terminal,
  'moon': Moon,
  'music': Music,
  'cloud-sun': CloudSun,
  'clock': Clock,
  'message-square': MessageSquare,
};

// Icon mapping for gallery shortcuts
const GALLERY_ICONS: Record<string, React.FC<{ className?: string }>> = {
  'sunrise': Sunrise,
  'edit-3': Edit3,
  'moon': Moon,
  'code': Code,
  'headphones': Headphones,
  'share': Share,
};

// Trigger type icons
const TRIGGER_ICONS: Record<TriggerType, React.FC<{ className?: string }>> = {
  keyboard: Keyboard,
  menuBar: Menu,
  scheduled: Clock,
  appEvent: AppWindow,
};

type ViewMode = 'library' | 'gallery' | 'editor';

const ZShortcutsWindow: React.FC<ZShortcutsWindowProps> = ({ onClose, onFocus }) => {
  const {
    shortcuts,
    createShortcut,
    updateShortcut,
    deleteShortcut,
    duplicateShortcut,
    runShortcut,
    importShortcut,
    exportShortcut,
    addFromGallery,
  } = useShortcuts();

  const [viewMode, setViewMode] = useState<ViewMode>('library');
  const [selectedShortcutId, setSelectedShortcutId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedAction, setDraggedAction] = useState<ActionType | null>(null);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [showActionPalette, setShowActionPalette] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedShortcut = useMemo(
    () => shortcuts.find(s => s.id === selectedShortcutId),
    [shortcuts, selectedShortcutId]
  );

  const filteredShortcuts = useMemo(() => {
    if (!searchQuery) return shortcuts;
    const q = searchQuery.toLowerCase();
    return shortcuts.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q)
    );
  }, [shortcuts, searchQuery]);

  // Create new shortcut
  const handleNewShortcut = useCallback(() => {
    const newShortcut = createShortcut({
      name: 'New Shortcut',
      description: 'Add a description',
      icon: 'play',
      color: '#007AFF',
      actions: [],
      connections: [],
      enabled: true,
    });
    setSelectedShortcutId(newShortcut.id);
    setViewMode('editor');
  }, [createShortcut]);

  // Handle drop action onto canvas
  const handleCanvasDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedAction || !selectedShortcut || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const actionDef = ACTION_DEFINITIONS.find(a => a.type === draggedAction);
    if (!actionDef) return;

    const defaultParams: Record<string, string | number | boolean> = {};
    actionDef.params.forEach(p => {
      if (p.default !== undefined) {
        defaultParams[p.key] = p.default;
      }
    });

    const newAction: ShortcutAction = {
      id: Math.random().toString(36).substring(2, 15),
      type: draggedAction,
      label: actionDef.label,
      params: defaultParams,
      position: { x: Math.max(0, x - 80), y: Math.max(0, y - 30) },
    };

    updateShortcut(selectedShortcut.id, {
      actions: [...selectedShortcut.actions, newAction],
    });
    setDraggedAction(null);
  }, [draggedAction, selectedShortcut, updateShortcut]);

  // Handle action position update
  const handleActionDrag = useCallback((actionId: string, deltaX: number, deltaY: number) => {
    if (!selectedShortcut) return;

    updateShortcut(selectedShortcut.id, {
      actions: selectedShortcut.actions.map(a =>
        a.id === actionId
          ? { ...a, position: { x: a.position.x + deltaX, y: a.position.y + deltaY } }
          : a
      ),
    });
  }, [selectedShortcut, updateShortcut]);

  // Remove action
  const handleRemoveAction = useCallback((actionId: string) => {
    if (!selectedShortcut) return;

    updateShortcut(selectedShortcut.id, {
      actions: selectedShortcut.actions.filter(a => a.id !== actionId),
      connections: selectedShortcut.connections.filter(c => c.from !== actionId && c.to !== actionId),
    });
  }, [selectedShortcut, updateShortcut]);

  // Handle connection
  const handleStartConnection = useCallback((actionId: string) => {
    setConnecting(actionId);
  }, []);

  const handleEndConnection = useCallback((actionId: string) => {
    if (!connecting || !selectedShortcut || connecting === actionId) {
      setConnecting(null);
      return;
    }

    // Check if connection already exists
    const exists = selectedShortcut.connections.some(
      c => c.from === connecting && c.to === actionId
    );

    if (!exists) {
      updateShortcut(selectedShortcut.id, {
        connections: [...selectedShortcut.connections, { from: connecting, to: actionId }],
      });
    }
    setConnecting(null);
  }, [connecting, selectedShortcut, updateShortcut]);

  // Handle import
  const handleImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const imported = importShortcut(content);
      if (imported) {
        setSelectedShortcutId(imported.id);
        setViewMode('editor');
      }
    };
    reader.readAsText(file);
  }, [importShortcut]);

  // Handle export
  const handleExport = useCallback((id: string) => {
    const json = exportShortcut(id);
    if (!json) return;

    const shortcut = shortcuts.find(s => s.id === id);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${shortcut?.name || 'shortcut'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [exportShortcut, shortcuts]);

  // Update action params
  const handleUpdateActionParams = useCallback((actionId: string, params: Record<string, string | number | boolean>) => {
    if (!selectedShortcut) return;

    updateShortcut(selectedShortcut.id, {
      actions: selectedShortcut.actions.map(a =>
        a.id === actionId ? { ...a, params } : a
      ),
    });
  }, [selectedShortcut, updateShortcut]);

  // Render action block
  const renderActionBlock = (action: ShortcutAction, index: number) => {
    const actionDef = ACTION_DEFINITIONS.find(a => a.type === action.type);
    const IconComponent = ACTION_ICONS[actionDef?.icon || 'app-window'] || AppWindow;

    return (
      <div
        key={action.id}
        className={cn(
          "absolute bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 w-44 cursor-move select-none",
          connecting === action.id && "ring-2 ring-blue-500",
          connecting && connecting !== action.id && "hover:ring-2 hover:ring-green-500"
        )}
        style={{ left: action.position.x, top: action.position.y }}
        draggable
        onDragStart={(e) => {
          const startX = e.clientX;
          const startY = e.clientY;
          e.dataTransfer.setData('actionMove', JSON.stringify({ id: action.id, startX, startY }));
        }}
        onDragEnd={(e) => {
          const data = e.dataTransfer.getData('actionMove');
          if (data) {
            const { id, startX, startY } = JSON.parse(data);
            handleActionDrag(id, e.clientX - startX, e.clientY - startY);
          }
        }}
        onClick={() => {
          if (connecting && connecting !== action.id) {
            handleEndConnection(action.id);
          }
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <IconComponent className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-white truncate">{action.label}</div>
            <div className="text-[10px] text-white/50">{action.type}</div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveAction(action.id);
            }}
            className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-red-400"
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* Connection points */}
        <div className="flex justify-between">
          <div
            className="w-3 h-3 rounded-full bg-green-500 cursor-pointer hover:scale-125 transition-transform"
            title="Input"
            onClick={(e) => {
              e.stopPropagation();
              if (connecting) handleEndConnection(action.id);
            }}
          />
          <div
            className="w-3 h-3 rounded-full bg-orange-500 cursor-pointer hover:scale-125 transition-transform"
            title="Output - Click to connect"
            onClick={(e) => {
              e.stopPropagation();
              handleStartConnection(action.id);
            }}
          />
        </div>

        {/* Params preview */}
        <div className="mt-2 space-y-1">
          {Object.entries(action.params).slice(0, 2).map(([key, value]) => (
            <div key={key} className="text-[10px] text-white/40 truncate">
              {key}: {String(value)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render connection lines
  const renderConnections = () => {
    if (!selectedShortcut) return null;

    return selectedShortcut.connections.map((conn, i) => {
      const fromAction = selectedShortcut.actions.find(a => a.id === conn.from);
      const toAction = selectedShortcut.actions.find(a => a.id === conn.to);
      if (!fromAction || !toAction) return null;

      const x1 = fromAction.position.x + 170;
      const y1 = fromAction.position.y + 40;
      const x2 = toAction.position.x + 6;
      const y2 = toAction.position.y + 40;

      const midX = (x1 + x2) / 2;

      return (
        <svg
          key={i}
          className="absolute inset-0 pointer-events-none"
          style={{ width: '100%', height: '100%' }}
        >
          <path
            d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
            fill="none"
            stroke="rgba(59, 130, 246, 0.5)"
            strokeWidth="2"
          />
          <circle cx={x2} cy={y2} r="4" fill="#3B82F6" />
        </svg>
      );
    });
  };

  // Library view
  const renderLibrary = () => (
    <div className="flex-1 overflow-y-auto p-4">
      {filteredShortcuts.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
            <Play className="w-8 h-8 text-white/30" />
          </div>
          <p className="text-white/50 text-sm">No shortcuts yet</p>
          <p className="text-white/30 text-xs mt-1">Create one or browse the gallery</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filteredShortcuts.map(shortcut => {
            const TriggerIcon = shortcut.trigger ? TRIGGER_ICONS[shortcut.trigger.type] : null;

            return (
              <div
                key={shortcut.id}
                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 cursor-pointer transition-colors group"
                onClick={() => {
                  setSelectedShortcutId(shortcut.id);
                  setViewMode('editor');
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: shortcut.color + '30' }}
                  >
                    <Play className="w-5 h-5" style={{ color: shortcut.color }} />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        runShortcut(shortcut.id);
                      }}
                      className="p-1.5 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400"
                      title="Run"
                    >
                      <Play className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateShortcut(shortcut.id);
                      }}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/60"
                      title="Duplicate"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExport(shortcut.id);
                      }}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/60"
                      title="Export"
                    >
                      <Download className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteShortcut(shortcut.id);
                      }}
                      className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="font-medium text-white text-sm mb-1">{shortcut.name}</div>
                <div className="text-white/40 text-xs mb-2 line-clamp-2">{shortcut.description}</div>
                <div className="flex items-center gap-2 text-[10px] text-white/30">
                  <span>{shortcut.actions.length} action{shortcut.actions.length !== 1 ? 's' : ''}</span>
                  {TriggerIcon && (
                    <>
                      <span>|</span>
                      <TriggerIcon className="w-3 h-3" />
                      <span>{shortcut.trigger?.value}</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // Gallery view
  const renderGallery = () => (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="grid grid-cols-2 gap-3">
        {GALLERY_SHORTCUTS.map((template, index) => {
          const IconComponent = GALLERY_ICONS[template.icon] || Play;

          return (
            <div
              key={index}
              className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 cursor-pointer transition-colors group"
              onClick={() => {
                const newShortcut = addFromGallery(index);
                setSelectedShortcutId(newShortcut.id);
                setViewMode('editor');
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: template.color + '30' }}
                >
                  <IconComponent className="w-5 h-5" style={{ color: template.color }} />
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addFromGallery(index);
                  }}
                  className="p-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Add to Library"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              <div className="font-medium text-white text-sm mb-1">{template.name}</div>
              <div className="text-white/40 text-xs line-clamp-2">{template.description}</div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Editor view
  const renderEditor = () => {
    if (!selectedShortcut) return null;

    return (
      <div className="flex-1 flex">
        {/* Action palette */}
        <div className="w-56 bg-black/20 border-r border-white/10 flex flex-col">
          <div className="p-3 border-b border-white/10">
            <div className="text-xs text-white/50 font-medium uppercase tracking-wide">Actions</div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {ACTION_DEFINITIONS.map(action => {
              const IconComponent = ACTION_ICONS[action.icon] || AppWindow;
              return (
                <div
                  key={action.type}
                  className="flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 cursor-grab active:cursor-grabbing transition-colors"
                  draggable
                  onDragStart={() => setDraggedAction(action.type)}
                  onDragEnd={() => setDraggedAction(null)}
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <IconComponent className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-white font-medium truncate">{action.label}</div>
                    <div className="text-[10px] text-white/40 truncate">{action.description}</div>
                  </div>
                  <GripVertical className="w-3 h-3 text-white/20" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 flex flex-col">
          {/* Editor toolbar */}
          <div className="h-12 px-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewMode('library')}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/60"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
              </button>
              <input
                type="text"
                value={selectedShortcut.name}
                onChange={(e) => updateShortcut(selectedShortcut.id, { name: e.target.value })}
                className="bg-transparent text-white font-medium text-sm outline-none border-b border-transparent hover:border-white/20 focus:border-blue-500 px-1"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => runShortcut(selectedShortcut.id)}
                className="px-3 py-1.5 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 text-xs font-medium flex items-center gap-1.5"
              >
                <Play className="w-3 h-3" />
                Run
              </button>
              <button
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/60"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Canvas area */}
          <div
            ref={canvasRef}
            className={cn(
              "flex-1 relative overflow-auto",
              draggedAction && "bg-blue-500/5 border-2 border-dashed border-blue-500/20"
            )}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleCanvasDrop}
          >
            {selectedShortcut.actions.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-white/30 text-sm">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-white/5 flex items-center justify-center">
                    <Plus className="w-6 h-6" />
                  </div>
                  <p>Drag actions here to build your shortcut</p>
                </div>
              </div>
            ) : (
              <>
                {renderConnections()}
                {selectedShortcut.actions.map((action, index) => renderActionBlock(action, index))}
              </>
            )}

            {connecting && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-blue-500/90 text-white text-xs px-3 py-1.5 rounded-full">
                Click another action to connect, or press Escape to cancel
              </div>
            )}
          </div>

          {/* Trigger configuration */}
          <div className="h-14 px-4 border-t border-white/10 flex items-center gap-4 bg-black/20">
            <div className="text-xs text-white/40">Trigger:</div>
            <div className="flex gap-2">
              {(['keyboard', 'menuBar', 'scheduled', 'appEvent'] as TriggerType[]).map(type => {
                const Icon = TRIGGER_ICONS[type];
                const isActive = selectedShortcut.trigger?.type === type;
                return (
                  <button
                    key={type}
                    onClick={() => {
                      if (isActive) {
                        updateShortcut(selectedShortcut.id, { trigger: undefined });
                      } else {
                        updateShortcut(selectedShortcut.id, {
                          trigger: { type, value: type === 'keyboard' ? 'Cmd+Shift+?' : '' },
                        });
                      }
                    }}
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      isActive ? "bg-blue-500/20 text-blue-400" : "bg-white/5 text-white/40 hover:bg-white/10"
                    )}
                    title={type}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
            {selectedShortcut.trigger && (
              <input
                type="text"
                value={selectedShortcut.trigger.value}
                onChange={(e) => updateShortcut(selectedShortcut.id, {
                  trigger: { ...selectedShortcut.trigger!, value: e.target.value },
                })}
                placeholder={
                  selectedShortcut.trigger.type === 'keyboard' ? 'e.g. Cmd+Shift+X' :
                  selectedShortcut.trigger.type === 'scheduled' ? 'e.g. 0 9 * * *' :
                  selectedShortcut.trigger.type === 'appEvent' ? 'App name' : 'Quick action name'
                }
                className="flex-1 bg-white/5 px-3 py-1.5 rounded-lg text-white text-xs outline-none border border-white/10 focus:border-blue-500"
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  // Cancel connecting on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && connecting) {
        setConnecting(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [connecting]);

  return (
    <ZWindow
      title="Shortcuts"
      onClose={onClose}
      onFocus={onFocus}
      defaultWidth={900}
      defaultHeight={600}
      minWidth={700}
      minHeight={450}
      defaultPosition={{ x: 150, y: 80 }}
    >
      <div className="flex h-full bg-[#1e1e1e]">
        {/* Sidebar */}
        <div className="w-48 bg-[#252526] border-r border-white/10 flex flex-col">
          <div className="p-3 border-b border-white/10">
            <button
              onClick={handleNewShortcut}
              className="w-full px-3 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Shortcut
            </button>
          </div>

          <div className="flex-1 p-2 space-y-1">
            <button
              onClick={() => setViewMode('library')}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                viewMode === 'library' || viewMode === 'editor'
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:bg-white/5"
              )}
            >
              <Play className="w-4 h-4" />
              My Shortcuts
            </button>
            <button
              onClick={() => setViewMode('gallery')}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                viewMode === 'gallery'
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:bg-white/5"
              )}
            >
              <Search className="w-4 h-4" />
              Gallery
            </button>
          </div>

          <div className="p-2 border-t border-white/10">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImport}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/60 hover:bg-white/5 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Import
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          {viewMode !== 'editor' && (
            <div className="h-12 px-4 border-b border-white/10 flex items-center justify-between">
              <span className="text-white/80 font-medium text-sm">
                {viewMode === 'library' ? 'My Shortcuts' : 'Gallery'}
              </span>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg">
                <Search className="w-4 h-4 text-white/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="bg-transparent text-white text-sm placeholder:text-white/40 outline-none w-40"
                />
              </div>
            </div>
          )}

          {/* Content */}
          {viewMode === 'library' && renderLibrary()}
          {viewMode === 'gallery' && renderGallery()}
          {viewMode === 'editor' && renderEditor()}
        </div>
      </div>
    </ZWindow>
  );
};

export default ZShortcutsWindow;
