import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Monitor,
  Square,
  MousePointer2,
  Video,
  X,
  Timer,
  Settings,
} from 'lucide-react';

interface ScreenshotToolbarProps {
  isOpen: boolean;
  onClose: () => void;
}

type CaptureMode = 'fullscreen' | 'window' | 'selection' | 'record-screen' | 'record-selection';

interface ToolbarOption {
  id: CaptureMode;
  icon: React.ReactNode;
  label: string;
  shortcut: string;
}

const captureOptions: ToolbarOption[] = [
  {
    id: 'fullscreen',
    icon: <Monitor className="w-6 h-6" />,
    label: 'Capture Entire Screen',
    shortcut: '\u21E7\u23183',
  },
  {
    id: 'window',
    icon: <Square className="w-6 h-6" />,
    label: 'Capture Selected Window',
    shortcut: '\u21E7\u23184',
  },
  {
    id: 'selection',
    icon: <MousePointer2 className="w-6 h-6" />,
    label: 'Capture Selected Portion',
    shortcut: '\u21E7\u23184',
  },
  {
    id: 'record-screen',
    icon: <Video className="w-6 h-6" />,
    label: 'Record Entire Screen',
    shortcut: '\u21E7\u23185',
  },
  {
    id: 'record-selection',
    icon: <Video className="w-6 h-6" />,
    label: 'Record Selected Portion',
    shortcut: '\u21E7\u23185',
  },
];

const ScreenshotToolbar: React.FC<ScreenshotToolbarProps> = ({ isOpen, onClose }) => {
  const [selectedMode, setSelectedMode] = useState<CaptureMode>('selection');
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timerDuration, setTimerDuration] = useState(5);
  const [showOptions, setShowOptions] = useState(false);

  // Handle escape to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Capture action
  const handleCapture = useCallback(() => {
    const modeLabels: Record<CaptureMode, string> = {
      'fullscreen': 'Full screen',
      'window': 'Window',
      'selection': 'Selection',
      'record-screen': 'Screen recording',
      'record-selection': 'Selection recording',
    };

    if (timerEnabled) {
      toast.info(`${modeLabels[selectedMode]} capture in ${timerDuration} seconds...`);
      setTimeout(() => {
        toast.success(`${modeLabels[selectedMode]} captured and saved to Desktop`);
        onClose();
      }, timerDuration * 1000);
    } else {
      toast.success(`${modeLabels[selectedMode]} captured and saved to Desktop`);
      onClose();
    }
  }, [selectedMode, timerEnabled, timerDuration, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[50000] flex items-end justify-center pb-32"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Toolbar */}
      <div
        className={cn(
          "bg-black/80 backdrop-blur-2xl",
          "border border-white/20 rounded-2xl",
          "shadow-2xl",
          "p-3",
          "flex flex-col gap-3"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Main options */}
        <div className="flex items-center gap-1">
          {captureOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelectedMode(option.id)}
              className={cn(
                "p-3 rounded-xl transition-all",
                "flex flex-col items-center gap-1",
                selectedMode === option.id
                  ? "bg-blue-500 text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
              title={`${option.label} (${option.shortcut})`}
            >
              {option.icon}
            </button>
          ))}

          {/* Divider */}
          <div className="w-px h-12 bg-white/20 mx-2" />

          {/* Timer toggle */}
          <button
            onClick={() => setTimerEnabled(!timerEnabled)}
            className={cn(
              "p-3 rounded-xl transition-all",
              "flex flex-col items-center gap-1",
              timerEnabled
                ? "bg-yellow-500 text-white"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            )}
            title="Timer"
          >
            <Timer className="w-6 h-6" />
            {timerEnabled && (
              <span className="text-xs font-medium">{timerDuration}s</span>
            )}
          </button>

          {/* Options */}
          <button
            onClick={() => setShowOptions(!showOptions)}
            className={cn(
              "p-3 rounded-xl transition-all",
              "text-white/70 hover:bg-white/10 hover:text-white"
            )}
            title="Options"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>

        {/* Timer options (when enabled) */}
        {timerEnabled && (
          <div className="flex items-center gap-2 px-2">
            <span className="text-white/50 text-sm">Delay:</span>
            {[5, 10, 15].map((seconds) => (
              <button
                key={seconds}
                onClick={() => setTimerDuration(seconds)}
                className={cn(
                  "px-3 py-1 rounded-lg text-sm transition-all",
                  timerDuration === seconds
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "text-white/50 hover:text-white hover:bg-white/10"
                )}
              >
                {seconds}s
              </button>
            ))}
          </div>
        )}

        {/* Options panel */}
        {showOptions && (
          <div className="border-t border-white/10 pt-3 flex flex-col gap-2 px-2">
            <label className="flex items-center gap-2 text-white/70 text-sm cursor-pointer">
              <input type="checkbox" className="rounded" defaultChecked />
              Save to Desktop
            </label>
            <label className="flex items-center gap-2 text-white/70 text-sm cursor-pointer">
              <input type="checkbox" className="rounded" defaultChecked />
              Show Floating Thumbnail
            </label>
            <label className="flex items-center gap-2 text-white/70 text-sm cursor-pointer">
              <input type="checkbox" className="rounded" />
              Remember Last Selection
            </label>
            <label className="flex items-center gap-2 text-white/70 text-sm cursor-pointer">
              <input type="checkbox" className="rounded" />
              Show Mouse Pointer
            </label>
          </div>
        )}

        {/* Description and action */}
        <div className="flex items-center justify-between px-2">
          <span className="text-white/50 text-sm">
            {captureOptions.find(o => o.id === selectedMode)?.label}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-white/70 hover:bg-white/10 text-sm transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleCapture}
              className="px-4 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-all"
            >
              Capture
            </button>
          </div>
        </div>
      </div>

      {/* Close button (floating) */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white/70 hover:bg-black/70 hover:text-white transition-all"
        title="Close (Escape)"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Instructions overlay */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/50 text-sm">
        {selectedMode.includes('record')
          ? 'Click to record, or select a portion of the screen'
          : 'Click to capture, or select a portion of the screen'
        }
      </div>
    </div>
  );
};

export default ScreenshotToolbar;
