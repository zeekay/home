import React from 'react';
import { LayoutPanelLeft, Maximize2, Shrink, EyeOff } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

interface DockSettingsTabProps {
  dockPosition: 'bottom' | 'left' | 'right';
  dockSize: number;
  dockMagnification: boolean;
  dockMagnificationSize: number;
  dockAutoHide: boolean;
  onDockPositionChange: (position: 'bottom' | 'left' | 'right') => void;
  onDockSizeChange: (size: number) => void;
  onDockMagnificationChange: (enabled: boolean) => void;
  onDockMagnificationSizeChange: (size: number) => void;
  onDockAutoHideChange: (autoHide: boolean) => void;
}

const DockSettingsTab: React.FC<DockSettingsTabProps> = ({
  dockPosition,
  dockSize,
  dockMagnification,
  dockMagnificationSize,
  dockAutoHide,
  onDockPositionChange,
  onDockSizeChange,
  onDockMagnificationChange,
  onDockMagnificationSizeChange,
  onDockAutoHideChange
}) => {
  const positions = [
    { id: 'left' as const, name: 'Left', disabled: true },
    { id: 'bottom' as const, name: 'Bottom', disabled: false },
    { id: 'right' as const, name: 'Right', disabled: true }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <LayoutPanelLeft className="w-6 h-6 text-orange-500" />
        <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100">Dock</h2>
      </div>

      <Separator />

      {/* Dock Size */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Shrink className="w-4 h-4 text-gray-500" />
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Size</h3>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Adjust the size of the Dock icons
        </p>

        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500">Small</span>
            <Slider
              value={[dockSize]}
              onValueChange={(value) => onDockSizeChange(value[0])}
              max={128}
              min={32}
              step={4}
              className="flex-1"
            />
            <span className="text-xs text-gray-500">Large</span>
          </div>
          <p className="text-center text-xs text-gray-600 dark:text-gray-400">
            {dockSize}px
          </p>
        </div>

        {/* Size Preview */}
        <div className="flex justify-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="flex gap-2 p-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-700">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="rounded-xl bg-gradient-to-br from-blue-400 to-blue-600"
                style={{
                  width: Math.min(dockSize * 0.6, 48),
                  height: Math.min(dockSize * 0.6, 48)
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <Separator />

      {/* Magnification */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Maximize2 className="w-4 h-4 text-gray-500" />
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Magnification</h3>
          </div>
          <Switch
            checked={dockMagnification}
            onCheckedChange={onDockMagnificationChange}
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Magnify icons when you hover over them
        </p>

        {dockMagnification && (
          <div className="space-y-3 pl-6">
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-500">Min</span>
              <Slider
                value={[dockMagnificationSize]}
                onValueChange={(value) => onDockMagnificationSizeChange(value[0])}
                max={256}
                min={64}
                step={8}
                className="flex-1"
              />
              <span className="text-xs text-gray-500">Max</span>
            </div>
            <p className="text-center text-xs text-gray-600 dark:text-gray-400">
              Max size: {dockMagnificationSize}px
            </p>
          </div>
        )}
      </div>

      <Separator />

      {/* Position */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Position on screen</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Choose where the Dock appears on your screen
        </p>

        <div className="grid grid-cols-3 gap-3">
          {positions.map((pos) => (
            <button
              key={pos.id}
              onClick={() => !pos.disabled && onDockPositionChange(pos.id)}
              disabled={pos.disabled}
              className={`
                py-3 px-4 rounded-lg border-2 transition-all
                ${pos.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                ${dockPosition === pos.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}
              `}
            >
              <div className="flex flex-col items-center gap-2">
                {/* Position diagram */}
                <div className="w-12 h-10 border-2 border-gray-300 dark:border-gray-600 rounded relative">
                  <div
                    className={`
                      absolute bg-gray-400 dark:bg-gray-500 rounded-sm
                      ${pos.id === 'left' ? 'left-0 top-1/2 -translate-y-1/2 w-1 h-6' : ''}
                      ${pos.id === 'bottom' ? 'bottom-0 left-1/2 -translate-x-1/2 w-8 h-1' : ''}
                      ${pos.id === 'right' ? 'right-0 top-1/2 -translate-y-1/2 w-1 h-6' : ''}
                    `}
                  />
                </div>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{pos.name}</span>
                {pos.disabled && (
                  <span className="text-[10px] text-gray-400">(Coming soon)</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Auto-hide */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-gray-500" />
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Automatically hide and show the Dock</h3>
          </div>
          <Switch
            checked={dockAutoHide}
            onCheckedChange={onDockAutoHideChange}
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          The Dock will hide when not in use and appear when you move the pointer to the bottom of the screen
        </p>
      </div>

      <Separator />

      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Tip: You can also resize the Dock by dragging the divider line between apps and folders.
        </p>
      </div>
    </div>
  );
};

export default DockSettingsTab;
