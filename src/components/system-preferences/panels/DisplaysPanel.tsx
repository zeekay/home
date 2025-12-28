import React from 'react';
import { Monitor, Sun, Moon, Eye } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { DisplaySettings } from '@/hooks/useSystemPreferences';

interface DisplaysPanelProps {
  settings: DisplaySettings;
  onUpdate: (updates: Partial<DisplaySettings>) => void;
}

const DisplaysPanel: React.FC<DisplaysPanelProps> = ({ settings, onUpdate }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Monitor className="w-6 h-6 text-blue-500" />
        <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100">Displays</h2>
      </div>

      <Separator />

      {/* Resolution */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Resolution</h3>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => onUpdate({ resolution: 'default' })}
            className={`
              p-4 rounded-lg border-2 transition-all text-center
              ${settings.resolution === 'default'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}
            `}
          >
            <Monitor className="w-8 h-8 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Default for display</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Best for this display</p>
          </button>

          <button
            onClick={() => onUpdate({ resolution: 'scaled' })}
            className={`
              p-4 rounded-lg border-2 transition-all text-center
              ${settings.resolution === 'scaled'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}
            `}
          >
            <div className="flex justify-center gap-1 mb-2">
              <Monitor className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              <Monitor className="w-8 h-8 text-gray-600 dark:text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Scaled</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Choose a scaled resolution</p>
          </button>
        </div>

        {settings.resolution === 'scaled' && (
          <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Larger Text</span>
              <span>More Space</span>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  onClick={() => onUpdate({ scaledResolution: level })}
                  className={`
                    flex-1 py-3 rounded-lg border-2 transition-all
                    ${settings.scaledResolution === level
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}
                  `}
                >
                  <div
                    className="mx-auto bg-gray-300 dark:bg-gray-600 rounded"
                    style={{
                      width: 16 + level * 4,
                      height: 12 + level * 3,
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Brightness */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sun className="w-4 h-4 text-gray-500" />
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Brightness</h3>
        </div>

        <div className="flex items-center gap-4">
          <Sun className="w-4 h-4 text-gray-400" />
          <Slider
            value={[settings.brightness]}
            onValueChange={(value) => onUpdate({ brightness: value[0] })}
            max={100}
            min={0}
            step={1}
            className="flex-1"
          />
          <Sun className="w-5 h-5 text-yellow-500" />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Automatically adjust brightness</span>
          <Switch
            checked={settings.autoAdjustBrightness}
            onCheckedChange={(checked) => onUpdate({ autoAdjustBrightness: checked })}
          />
        </div>
      </div>

      <Separator />

      {/* True Tone */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">True Tone</h3>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Automatically adapt display to ambient lighting conditions
            </p>
          </div>
          <Switch
            checked={settings.trueTone}
            onCheckedChange={(checked) => onUpdate({ trueTone: checked })}
          />
        </div>
      </div>

      <Separator />

      {/* Night Shift */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-orange-500" />
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Night Shift</h3>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Shift colors to the warmer end of the spectrum at night
            </p>
          </div>
          <Switch
            checked={settings.nightShift}
            onCheckedChange={(checked) => onUpdate({ nightShift: checked })}
          />
        </div>

        {settings.nightShift && (
          <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Schedule</h4>
              <Select
                value={settings.nightShiftSchedule}
                onValueChange={(value) => onUpdate({ nightShiftSchedule: value as DisplaySettings['nightShiftSchedule'] })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="off">Off</SelectItem>
                  <SelectItem value="sunset">Sunset to Sunrise</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {settings.nightShiftSchedule === 'custom' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 dark:text-gray-400">From</label>
                  <input
                    type="time"
                    value={settings.nightShiftFrom}
                    onChange={(e) => onUpdate({ nightShiftFrom: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 dark:text-gray-400">To</label>
                  <input
                    type="time"
                    value={settings.nightShiftTo}
                    onChange={(e) => onUpdate({ nightShiftTo: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Color Temperature</h4>
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-500">Less Warm</span>
                <Slider
                  value={[settings.nightShiftWarmth]}
                  onValueChange={(value) => onUpdate({ nightShiftWarmth: value[0] })}
                  max={100}
                  min={0}
                  step={1}
                  className="flex-1"
                />
                <span className="text-xs text-gray-500">More Warm</span>
              </div>

              {/* Color temperature preview */}
              <div
                className="h-8 rounded-lg transition-all"
                style={{
                  background: `linear-gradient(to right,
                    hsl(220, 70%, 50%),
                    hsl(${40 - settings.nightShiftWarmth * 0.2}, ${70 + settings.nightShiftWarmth * 0.2}%, 50%)
                  )`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Display Info */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-8 border-2 border-gray-300 dark:border-gray-600 rounded flex items-center justify-center">
            <Monitor className="w-6 h-6 text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Built-in Display</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Resolution: Native {settings.resolution === 'scaled' ? `(Scaled ${settings.scaledResolution})` : ''}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisplaysPanel;
