import React from 'react';
import { useAccessibility, AccessibilitySettings } from '@/contexts/AccessibilityContext';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  ZoomIn,
  ZoomOut,
  Contrast,
  Type,
  Eye,
  Sparkles,
  RotateCcw,
  Accessibility,
} from 'lucide-react';

const AccessibilityTab: React.FC = () => {
  const {
    zoomLevel,
    highContrast,
    reduceMotion,
    reduceTransparency,
    textSize,
    voiceOverEnabled,
    colorFilter,
    zoomIn,
    zoomOut,
    resetZoom,
    setZoomLevel,
    toggleHighContrast,
    toggleReduceMotion,
    toggleReduceTransparency,
    toggleVoiceOver,
    setTextSize,
    setColorFilter,
    resetAll,
  } = useAccessibility();

  const textSizes: AccessibilitySettings['textSize'][] = ['small', 'medium', 'large', 'xlarge'];
  const colorFilters: { value: AccessibilitySettings['colorFilter']; label: string }[] = [
    { value: 'none', label: 'None' },
    { value: 'grayscale', label: 'Grayscale' },
    { value: 'protanopia', label: 'Protanopia (Red-blind)' },
    { value: 'deuteranopia', label: 'Deuteranopia (Green-blind)' },
    { value: 'tritanopia', label: 'Tritanopia (Blue-blind)' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Accessibility className="w-8 h-8 text-blue-500" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Accessibility</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Customize your experience for better accessibility
            </p>
          </div>
        </div>
        <button
          onClick={resetAll}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm",
            "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
            "transition-colors"
          )}
        >
          <RotateCcw className="w-4 h-4" />
          Reset All
        </button>
      </div>

      {/* Zoom Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
          <ZoomIn className="w-5 h-5" />
          <h3 className="font-medium">Zoom</h3>
        </div>

        <div className="pl-7 space-y-4">
          <div className="flex items-center gap-4">
            <button
              onClick={zoomOut}
              disabled={zoomLevel <= 0.5}
              className={cn(
                "p-2 rounded-lg border transition-colors",
                "border-gray-300 dark:border-gray-600",
                "hover:bg-gray-100 dark:hover:bg-gray-800",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              aria-label="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <div className="flex-1">
              <Slider
                value={[zoomLevel * 100]}
                onValueChange={([value]) => setZoomLevel(value / 100)}
                min={50}
                max={300}
                step={10}
                className="w-full"
              />
            </div>

            <button
              onClick={zoomIn}
              disabled={zoomLevel >= 3.0}
              className={cn(
                "p-2 rounded-lg border transition-colors",
                "border-gray-300 dark:border-gray-600",
                "hover:bg-gray-100 dark:hover:bg-gray-800",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              aria-label="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={resetZoom}
              className="text-sm text-blue-500 hover:text-blue-600"
            >
              Reset to 100%
            </button>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            Use Cmd/Ctrl + Plus/Minus to zoom, Cmd/Ctrl + 0 to reset
          </p>
        </div>
      </section>

      {/* Display Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
          <Contrast className="w-5 h-5" />
          <h3 className="font-medium">Display</h3>
        </div>

        <div className="pl-7 space-y-4">
          {/* High Contrast */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-gray-900 dark:text-white">Increase Contrast</Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Makes text and UI elements more distinct
              </p>
            </div>
            <Switch
              checked={highContrast}
              onCheckedChange={toggleHighContrast}
            />
          </div>

          {/* Reduce Transparency */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-gray-900 dark:text-white">Reduce Transparency</Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Makes backgrounds more solid
              </p>
            </div>
            <Switch
              checked={reduceTransparency}
              onCheckedChange={toggleReduceTransparency}
            />
          </div>

          {/* Reduce Motion */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-gray-900 dark:text-white">Reduce Motion</Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Minimizes animations and transitions
              </p>
            </div>
            <Switch
              checked={reduceMotion}
              onCheckedChange={toggleReduceMotion}
            />
          </div>
        </div>
      </section>

      {/* Text Size Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
          <Type className="w-5 h-5" />
          <h3 className="font-medium">Text Size</h3>
        </div>

        <div className="pl-7">
          <div className="flex items-center gap-2">
            {textSizes.map((size) => (
              <button
                key={size}
                onClick={() => setTextSize(size)}
                className={cn(
                  "px-4 py-2 rounded-lg border transition-colors capitalize",
                  textSize === size
                    ? "bg-blue-500 border-blue-500 text-white"
                    : "border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                {size === 'xlarge' ? 'X-Large' : size}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Color Filters Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
          <Eye className="w-5 h-5" />
          <h3 className="font-medium">Color Filters</h3>
        </div>

        <div className="pl-7 space-y-2">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Apply color filters to assist with color vision deficiencies
          </p>
          <div className="space-y-2">
            {colorFilters.map((filter) => (
              <label
                key={filter.value}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                  colorFilter === filter.value
                    ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500"
                    : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                )}
              >
                <input
                  type="radio"
                  name="colorFilter"
                  value={filter.value}
                  checked={colorFilter === filter.value}
                  onChange={() => setColorFilter(filter.value)}
                  className="w-4 h-4 text-blue-500"
                />
                <span className="text-sm text-gray-900 dark:text-white">
                  {filter.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </section>

      {/* VoiceOver Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
          <Sparkles className="w-5 h-5" />
          <h3 className="font-medium">VoiceOver</h3>
        </div>

        <div className="pl-7">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-gray-900 dark:text-white">Enable VoiceOver Mode</Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Enhances focus indicators and screen reader compatibility
              </p>
            </div>
            <Switch
              checked={voiceOverEnabled}
              onCheckedChange={toggleVoiceOver}
            />
          </div>
        </div>
      </section>

      {/* Keyboard Shortcuts Info */}
      <section className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Keyboard Shortcuts
        </h4>
        <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex justify-between">
            <span>Zoom In</span>
            <kbd className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">Cmd/Ctrl + =</kbd>
          </div>
          <div className="flex justify-between">
            <span>Zoom Out</span>
            <kbd className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">Cmd/Ctrl + -</kbd>
          </div>
          <div className="flex justify-between">
            <span>Reset Zoom</span>
            <kbd className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">Cmd/Ctrl + 0</kbd>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AccessibilityTab;
