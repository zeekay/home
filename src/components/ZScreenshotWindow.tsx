import React, { useState, useRef, useCallback, useEffect } from 'react';
import ZWindow from './ZWindow';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Monitor,
  Square,
  Crop,
  Timer,
  Camera,
  Video,
  X,
  Check,
  ChevronDown,
  Folder,
  Settings,
  Share2,
  Copy,
  Download,
  Trash2,
  ArrowRight,
  Circle,
  Type,
  Highlighter,
  Pencil,
  Undo2,
  Redo2,
  RotateCcw,
  MousePointer2,
  Maximize2,
  Clock,
  Image,
  Play,
  Pause,
  StopCircle,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Move,
  ZoomIn,
  ZoomOut,
  Eye,
  EyeOff,
  Grid3X3,
} from 'lucide-react';

interface ZScreenshotWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

// Capture mode types
type CaptureMode = 'fullscreen' | 'window' | 'selection' | 'timed';
type TimerDelay = 3 | 5 | 10;
type SaveLocation = 'desktop' | 'documents' | 'clipboard' | 'custom';
type MarkupTool = 'pointer' | 'arrow' | 'rectangle' | 'circle' | 'text' | 'highlight' | 'pen';
type RecordingMode = 'screen' | 'window' | 'selection';

interface Screenshot {
  id: string;
  url: string;
  thumbnail?: string;
  timestamp: string;
  mode: CaptureMode;
  width: number;
  height: number;
  markup?: MarkupItem[];
}

interface MarkupItem {
  id: string;
  type: MarkupTool;
  x: number;
  y: number;
  width?: number;
  height?: number;
  endX?: number;
  endY?: number;
  text?: string;
  color: string;
  strokeWidth: number;
  points?: { x: number; y: number }[];
}

interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  mode: RecordingMode;
  includeAudio: boolean;
  includeMic: boolean;
}

const STORAGE_KEY = 'zscreenshot_gallery';

const COLORS = [
  '#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#00C7BE',
  '#007AFF', '#5856D6', '#AF52DE', '#FF2D55', '#FFFFFF',
  '#8E8E93', '#000000',
];

const ZScreenshotWindow: React.FC<ZScreenshotWindowProps> = ({ onClose, onFocus }) => {
  // Capture settings
  const [captureMode, setCaptureMode] = useState<CaptureMode>('fullscreen');
  const [timerDelay, setTimerDelay] = useState<TimerDelay>(5);
  const [saveLocation, setSaveLocation] = useState<SaveLocation>('desktop');
  const [showFloatingThumbnail, setShowFloatingThumbnail] = useState(true);
  const [rememberLastSelection, setRememberLastSelection] = useState(true);
  const [showPointer, setShowPointer] = useState(false);

  // UI state
  const [activeView, setActiveView] = useState<'capture' | 'gallery' | 'editor' | 'recording'>('capture');
  const [showOptions, setShowOptions] = useState(false);
  const [showTimerDropdown, setShowTimerDropdown] = useState(false);
  const [showSaveDropdown, setShowSaveDropdown] = useState(false);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Gallery state
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [selectedScreenshot, setSelectedScreenshot] = useState<Screenshot | null>(null);
  const [galleryFilter, setGalleryFilter] = useState<'all' | 'today' | 'week'>('all');

  // Editor state
  const [activeTool, setActiveTool] = useState<MarkupTool>('pointer');
  const [activeColor, setActiveColor] = useState('#FF3B30');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [markupItems, setMarkupItems] = useState<MarkupItem[]>([]);
  const [undoStack, setUndoStack] = useState<MarkupItem[][]>([]);
  const [redoStack, setRedoStack] = useState<MarkupItem[][]>([]);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Recording state
  const [recording, setRecording] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    mode: 'screen',
    includeAudio: true,
    includeMic: false,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load screenshots from storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setScreenshots(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load screenshots:', error);
    }
  }, []);

  // Save screenshots to storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(screenshots));
    } catch (error) {
      console.error('Failed to save screenshots:', error);
    }
  }, [screenshots]);

  // Recording timer
  useEffect(() => {
    if (recording.isRecording && !recording.isPaused) {
      recordingTimerRef.current = setInterval(() => {
        setRecording(prev => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);
    }
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [recording.isRecording, recording.isPaused]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const captureScreenshot = useCallback(async () => {
    // Simulate screenshot capture
    const mockScreenshot: Screenshot = {
      id: `screenshot-${Date.now()}`,
      url: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080"><rect fill="#1a1a2e" width="100%" height="100%"/><text x="50%" y="50%" text-anchor="middle" fill="#fff" font-size="48">Screenshot ${new Date().toLocaleTimeString()}</text></svg>`)}`,
      timestamp: new Date().toISOString(),
      mode: captureMode,
      width: 1920,
      height: 1080,
    };

    setScreenshots(prev => [mockScreenshot, ...prev]);

    if (showFloatingThumbnail) {
      toast.success('Screenshot saved', {
        description: `Saved to ${saveLocation}`,
        action: {
          label: 'View',
          onClick: () => {
            setSelectedScreenshot(mockScreenshot);
            setActiveView('editor');
          },
        },
      });
    }
  }, [captureMode, saveLocation, showFloatingThumbnail]);

  const startCapture = useCallback(() => {
    if (captureMode === 'timed') {
      setIsCountingDown(true);
      setCountdown(timerDelay);

      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsCountingDown(false);
            captureScreenshot();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      captureScreenshot();
    }
  }, [captureMode, timerDelay, captureScreenshot]);

  const deleteScreenshot = (id: string) => {
    setScreenshots(prev => prev.filter(s => s.id !== id));
    if (selectedScreenshot?.id === id) {
      setSelectedScreenshot(null);
      setActiveView('gallery');
    }
    toast.success('Screenshot deleted');
  };

  const copyToClipboard = async () => {
    if (!selectedScreenshot) return;
    try {
      await navigator.clipboard.writeText(selectedScreenshot.url);
      toast.success('Copied to clipboard');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const shareScreenshot = async () => {
    if (!selectedScreenshot) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Screenshot',
          url: selectedScreenshot.url,
        });
      } catch { /* User cancelled */ }
    } else {
      copyToClipboard();
    }
  };

  const addMarkup = (item: MarkupItem) => {
    setUndoStack(prev => [...prev, markupItems]);
    setRedoStack([]);
    setMarkupItems(prev => [...prev, item]);
  };

  const undo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setRedoStack(prev => [...prev, markupItems]);
    setMarkupItems(previous);
    setUndoStack(prev => prev.slice(0, -1));
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack(prev => [...prev, markupItems]);
    setMarkupItems(next);
    setRedoStack(prev => prev.slice(0, -1));
  };

  const resetMarkup = () => {
    setUndoStack(prev => [...prev, markupItems]);
    setRedoStack([]);
    setMarkupItems([]);
  };

  const startRecording = () => {
    setRecording({
      isRecording: true,
      isPaused: false,
      duration: 0,
      mode: 'screen',
      includeAudio: recording.includeAudio,
      includeMic: recording.includeMic,
    });
    toast.success('Recording started');
  };

  const stopRecording = () => {
    setRecording(prev => ({ ...prev, isRecording: false, isPaused: false }));
    toast.success('Recording saved', { description: `Duration: ${formatDuration(recording.duration)}` });
  };

  const togglePauseRecording = () => {
    setRecording(prev => ({ ...prev, isPaused: !prev.isPaused }));
  };

  // Filter screenshots by date
  const filteredScreenshots = screenshots.filter(s => {
    if (galleryFilter === 'all') return true;
    const date = new Date(s.timestamp);
    const now = new Date();
    if (galleryFilter === 'today') {
      return date.toDateString() === now.toDateString();
    }
    if (galleryFilter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return date >= weekAgo;
    }
    return true;
  });

  // Capture mode button component
  const CaptureModeButton = ({ mode, icon: Icon, label, active }: {
    mode: CaptureMode;
    icon: React.ElementType;
    label: string;
    active: boolean;
  }) => (
    <button
      onClick={() => setCaptureMode(mode)}
      className={cn(
        'flex flex-col items-center gap-2 p-4 rounded-xl transition-all',
        active
          ? 'bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/50'
          : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
      )}
    >
      <Icon className="w-8 h-8" />
      <span className="text-xs font-medium">{label}</span>
    </button>
  );

  // Toolbar button component
  const ToolbarButton = ({ icon: Icon, label, active, onClick, disabled }: {
    icon: React.ElementType;
    label: string;
    active?: boolean;
    onClick: () => void;
    disabled?: boolean;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex flex-col items-center gap-1 p-2 rounded-lg transition-colors',
        active
          ? 'bg-blue-500/20 text-blue-400'
          : 'text-white/60 hover:text-white hover:bg-white/5',
        disabled && 'opacity-40 cursor-not-allowed'
      )}
      title={label}
    >
      <Icon className="w-5 h-5" />
      <span className="text-[10px]">{label}</span>
    </button>
  );

  const renderCaptureView = () => (
    <div className="flex flex-col h-full">
      {/* Mode selection */}
      <div className="p-6 border-b border-white/10">
        <h3 className="text-sm font-medium text-white/60 mb-4">Capture Mode</h3>
        <div className="grid grid-cols-4 gap-3">
          <CaptureModeButton
            mode="fullscreen"
            icon={Monitor}
            label="Full Screen"
            active={captureMode === 'fullscreen'}
          />
          <CaptureModeButton
            mode="window"
            icon={Square}
            label="Window"
            active={captureMode === 'window'}
          />
          <CaptureModeButton
            mode="selection"
            icon={Crop}
            label="Selection"
            active={captureMode === 'selection'}
          />
          <CaptureModeButton
            mode="timed"
            icon={Timer}
            label="Timed"
            active={captureMode === 'timed'}
          />
        </div>
      </div>

      {/* Timer settings (visible when timed mode) */}
      {captureMode === 'timed' && (
        <div className="px-6 py-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/70">Timer Delay</span>
            <div className="relative">
              <button
                onClick={() => setShowTimerDropdown(!showTimerDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg text-sm text-white hover:bg-white/15 transition-colors"
              >
                <Clock className="w-4 h-4" />
                {timerDelay} seconds
                <ChevronDown className="w-4 h-4" />
              </button>
              {showTimerDropdown && (
                <div className="absolute right-0 mt-1 w-32 bg-[#2a2a2a] rounded-lg shadow-xl border border-white/10 overflow-hidden z-10">
                  {([3, 5, 10] as TimerDelay[]).map(delay => (
                    <button
                      key={delay}
                      onClick={() => { setTimerDelay(delay); setShowTimerDropdown(false); }}
                      className={cn(
                        'w-full px-3 py-2 text-sm text-left hover:bg-white/10 transition-colors',
                        timerDelay === delay ? 'text-blue-400' : 'text-white/70'
                      )}
                    >
                      {delay} seconds
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Options */}
      <div className="flex-1 p-6 space-y-4 overflow-auto">
        <h3 className="text-sm font-medium text-white/60">Options</h3>

        {/* Save location */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <Folder className="w-5 h-5 text-white/40" />
            <span className="text-sm text-white/80">Save to</span>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowSaveDropdown(!showSaveDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg text-sm text-white hover:bg-white/15 transition-colors"
            >
              {saveLocation.charAt(0).toUpperCase() + saveLocation.slice(1)}
              <ChevronDown className="w-4 h-4" />
            </button>
            {showSaveDropdown && (
              <div className="absolute right-0 mt-1 w-40 bg-[#2a2a2a] rounded-lg shadow-xl border border-white/10 overflow-hidden z-10">
                {(['desktop', 'documents', 'clipboard', 'custom'] as SaveLocation[]).map(loc => (
                  <button
                    key={loc}
                    onClick={() => { setSaveLocation(loc); setShowSaveDropdown(false); }}
                    className={cn(
                      'w-full px-3 py-2 text-sm text-left hover:bg-white/10 transition-colors',
                      saveLocation === loc ? 'text-blue-400' : 'text-white/70'
                    )}
                  >
                    {loc.charAt(0).toUpperCase() + loc.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Show floating thumbnail */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <Image className="w-5 h-5 text-white/40" />
            <span className="text-sm text-white/80">Show Floating Thumbnail</span>
          </div>
          <button
            onClick={() => setShowFloatingThumbnail(!showFloatingThumbnail)}
            className={cn(
              'w-11 h-6 rounded-full transition-colors relative',
              showFloatingThumbnail ? 'bg-blue-500' : 'bg-white/20'
            )}
          >
            <div className={cn(
              'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
              showFloatingThumbnail ? 'left-6' : 'left-1'
            )} />
          </button>
        </div>

        {/* Remember last selection */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <Grid3X3 className="w-5 h-5 text-white/40" />
            <span className="text-sm text-white/80">Remember Last Selection</span>
          </div>
          <button
            onClick={() => setRememberLastSelection(!rememberLastSelection)}
            className={cn(
              'w-11 h-6 rounded-full transition-colors relative',
              rememberLastSelection ? 'bg-blue-500' : 'bg-white/20'
            )}
          >
            <div className={cn(
              'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
              rememberLastSelection ? 'left-6' : 'left-1'
            )} />
          </button>
        </div>

        {/* Show pointer */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <MousePointer2 className="w-5 h-5 text-white/40" />
            <span className="text-sm text-white/80">Show Mouse Pointer</span>
          </div>
          <button
            onClick={() => setShowPointer(!showPointer)}
            className={cn(
              'w-11 h-6 rounded-full transition-colors relative',
              showPointer ? 'bg-blue-500' : 'bg-white/20'
            )}
          >
            <div className={cn(
              'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
              showPointer ? 'left-6' : 'left-1'
            )} />
          </button>
        </div>
      </div>

      {/* Capture button */}
      <div className="p-6 border-t border-white/10">
        {isCountingDown ? (
          <div className="flex flex-col items-center gap-2">
            <div className="text-5xl font-light text-white">{countdown}</div>
            <button
              onClick={() => { setIsCountingDown(false); setCountdown(0); }}
              className="text-sm text-white/60 hover:text-white"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={startCapture}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors text-sm font-medium"
          >
            <Camera className="w-5 h-5" />
            Capture {captureMode === 'fullscreen' ? 'Screen' : captureMode === 'window' ? 'Window' : captureMode === 'selection' ? 'Selection' : `in ${timerDelay}s`}
          </button>
        )}
      </div>
    </div>
  );

  const renderGalleryView = () => (
    <div className="flex flex-col h-full">
      {/* Gallery header */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <h3 className="text-sm font-medium text-white">Screenshots</h3>
        <div className="flex items-center gap-2">
          {(['all', 'today', 'week'] as const).map(filter => (
            <button
              key={filter}
              onClick={() => setGalleryFilter(filter)}
              className={cn(
                'px-3 py-1 text-xs rounded-full transition-colors',
                galleryFilter === filter
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              )}
            >
              {filter === 'all' ? 'All' : filter === 'today' ? 'Today' : 'This Week'}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery grid */}
      <div className="flex-1 overflow-auto p-4">
        {filteredScreenshots.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-white/40">
            <Camera className="w-12 h-12 mb-4" />
            <p className="text-sm">No screenshots yet</p>
            <p className="text-xs mt-1">Take a screenshot to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {filteredScreenshots.map(screenshot => (
              <button
                key={screenshot.id}
                onClick={() => {
                  setSelectedScreenshot(screenshot);
                  setActiveView('editor');
                }}
                className="group relative aspect-video bg-white/5 rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500/50 transition-all"
              >
                <img
                  src={screenshot.url}
                  alt="Screenshot"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ZoomIn className="w-6 h-6 text-white" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                  <p className="text-[10px] text-white/80">{formatDate(screenshot.timestamp)}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteScreenshot(screenshot.id); }}
                  className="absolute top-2 right-2 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-white/70 hover:text-red-400"
                >
                  <X className="w-3 h-3" />
                </button>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderEditorView = () => {
    if (!selectedScreenshot) return null;

    return (
      <div className="flex flex-col h-full">
        {/* Editor header */}
        <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between">
          <button
            onClick={() => { setActiveView('gallery'); setSelectedScreenshot(null); setMarkupItems([]); }}
            className="flex items-center gap-2 text-sm text-white/60 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={copyToClipboard}
              className="p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              title="Copy"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={shareScreenshot}
              className="p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => deleteScreenshot(selectedScreenshot.id)}
              className="p-2 text-white/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Markup toolbar */}
        <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <ToolbarButton icon={MousePointer2} label="Select" active={activeTool === 'pointer'} onClick={() => setActiveTool('pointer')} />
            <ToolbarButton icon={ArrowRight} label="Arrow" active={activeTool === 'arrow'} onClick={() => setActiveTool('arrow')} />
            <ToolbarButton icon={Square} label="Rectangle" active={activeTool === 'rectangle'} onClick={() => setActiveTool('rectangle')} />
            <ToolbarButton icon={Circle} label="Circle" active={activeTool === 'circle'} onClick={() => setActiveTool('circle')} />
            <ToolbarButton icon={Type} label="Text" active={activeTool === 'text'} onClick={() => setActiveTool('text')} />
            <ToolbarButton icon={Highlighter} label="Highlight" active={activeTool === 'highlight'} onClick={() => setActiveTool('highlight')} />
            <ToolbarButton icon={Pencil} label="Pen" active={activeTool === 'pen'} onClick={() => setActiveTool('pen')} />
          </div>

          <div className="flex items-center gap-2">
            {/* Color picker */}
            <div className="flex items-center gap-1 px-2 py-1 bg-white/5 rounded-lg">
              {COLORS.slice(0, 6).map(color => (
                <button
                  key={color}
                  onClick={() => setActiveColor(color)}
                  className={cn(
                    'w-5 h-5 rounded-full border-2 transition-transform',
                    activeColor === color ? 'border-white scale-110' : 'border-transparent'
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            <div className="w-px h-6 bg-white/10" />

            <ToolbarButton icon={Undo2} label="Undo" onClick={undo} disabled={undoStack.length === 0} />
            <ToolbarButton icon={Redo2} label="Redo" onClick={redo} disabled={redoStack.length === 0} />
            <ToolbarButton icon={RotateCcw} label="Reset" onClick={resetMarkup} disabled={markupItems.length === 0} />
          </div>
        </div>

        {/* Canvas area */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-black/30">
          <div className="relative" style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center' }}>
            <img
              src={selectedScreenshot.url}
              alt="Screenshot"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full pointer-events-auto"
              style={{ cursor: activeTool === 'pointer' ? 'default' : 'crosshair' }}
            />
          </div>
        </div>

        {/* Zoom controls */}
        <div className="px-4 py-2 border-t border-white/10 flex items-center justify-center gap-2">
          <button
            onClick={() => setZoomLevel(Math.max(0.25, zoomLevel - 0.25))}
            className="p-1.5 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-sm text-white/60 w-16 text-center">{Math.round(zoomLevel * 100)}%</span>
          <button
            onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.25))}
            className="p-1.5 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="ml-2 p-1.5 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  const renderRecordingView = () => (
    <div className="flex flex-col h-full">
      {/* Recording mode selection */}
      <div className="p-6 border-b border-white/10">
        <h3 className="text-sm font-medium text-white/60 mb-4">Recording Mode</h3>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setRecording(prev => ({ ...prev, mode: 'screen' }))}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-xl transition-all',
              recording.mode === 'screen'
                ? 'bg-red-500/20 text-red-400 ring-1 ring-red-500/50'
                : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
            )}
          >
            <Monitor className="w-8 h-8" />
            <span className="text-xs font-medium">Entire Screen</span>
          </button>
          <button
            onClick={() => setRecording(prev => ({ ...prev, mode: 'window' }))}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-xl transition-all',
              recording.mode === 'window'
                ? 'bg-red-500/20 text-red-400 ring-1 ring-red-500/50'
                : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
            )}
          >
            <Square className="w-8 h-8" />
            <span className="text-xs font-medium">Window</span>
          </button>
          <button
            onClick={() => setRecording(prev => ({ ...prev, mode: 'selection' }))}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-xl transition-all',
              recording.mode === 'selection'
                ? 'bg-red-500/20 text-red-400 ring-1 ring-red-500/50'
                : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
            )}
          >
            <Crop className="w-8 h-8" />
            <span className="text-xs font-medium">Selection</span>
          </button>
        </div>
      </div>

      {/* Audio options */}
      <div className="p-6 space-y-4">
        <h3 className="text-sm font-medium text-white/60">Audio Options</h3>

        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-white/40" />
            <span className="text-sm text-white/80">System Audio</span>
          </div>
          <button
            onClick={() => setRecording(prev => ({ ...prev, includeAudio: !prev.includeAudio }))}
            className={cn(
              'w-11 h-6 rounded-full transition-colors relative',
              recording.includeAudio ? 'bg-red-500' : 'bg-white/20'
            )}
          >
            <div className={cn(
              'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
              recording.includeAudio ? 'left-6' : 'left-1'
            )} />
          </button>
        </div>

        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <Mic className="w-5 h-5 text-white/40" />
            <span className="text-sm text-white/80">Microphone</span>
          </div>
          <button
            onClick={() => setRecording(prev => ({ ...prev, includeMic: !prev.includeMic }))}
            className={cn(
              'w-11 h-6 rounded-full transition-colors relative',
              recording.includeMic ? 'bg-red-500' : 'bg-white/20'
            )}
          >
            <div className={cn(
              'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
              recording.includeMic ? 'left-6' : 'left-1'
            )} />
          </button>
        </div>
      </div>

      <div className="flex-1" />

      {/* Recording controls */}
      <div className="p-6 border-t border-white/10">
        {recording.isRecording ? (
          <div className="space-y-4">
            {/* Recording status */}
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <div className={cn(
                  'w-3 h-3 rounded-full',
                  recording.isPaused ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'
                )} />
                <span className="text-2xl font-mono text-white">{formatDuration(recording.duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={togglePauseRecording}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-lg transition-colors"
              >
                {recording.isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                {recording.isPaused ? 'Resume' : 'Pause'}
              </button>
              <button
                onClick={stopRecording}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                <StopCircle className="w-5 h-5" />
                Stop Recording
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={startRecording}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors text-sm font-medium"
          >
            <Video className="w-5 h-5" />
            Start Recording
          </button>
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeView) {
      case 'capture':
        return renderCaptureView();
      case 'gallery':
        return renderGalleryView();
      case 'editor':
        return renderEditorView();
      case 'recording':
        return renderRecordingView();
      default:
        return renderCaptureView();
    }
  };

  return (
    <ZWindow
      title="Screenshot"
      onClose={onClose}
      onFocus={onFocus}
      initialPosition={{ x: 200, y: 100 }}
      initialSize={{ width: 520, height: 580 }}
      windowType="default"
    >
      <div className="h-full flex flex-col bg-[#1a1a1a]">
        {/* Tab bar */}
        <div className="flex items-center border-b border-white/10 px-2">
          <button
            onClick={() => setActiveView('capture')}
            className={cn(
              'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
              activeView === 'capture'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-white/60 hover:text-white'
            )}
          >
            <Camera className="w-4 h-4" />
            Capture
          </button>
          <button
            onClick={() => setActiveView('recording')}
            className={cn(
              'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
              activeView === 'recording'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-white/60 hover:text-white'
            )}
          >
            <Video className="w-4 h-4" />
            Record
            {recording.isRecording && (
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
          </button>
          <button
            onClick={() => setActiveView('gallery')}
            className={cn(
              'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
              activeView === 'gallery' || activeView === 'editor'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-white/60 hover:text-white'
            )}
          >
            <Image className="w-4 h-4" />
            Gallery
            {screenshots.length > 0 && (
              <span className="text-xs bg-white/10 px-1.5 py-0.5 rounded-full">
                {screenshots.length}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {renderContent()}
        </div>
      </div>
    </ZWindow>
  );
};

export default ZScreenshotWindow;
