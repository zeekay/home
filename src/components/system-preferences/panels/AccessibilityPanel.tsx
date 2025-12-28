import React, { useState } from 'react';
import {
  Accessibility, ZoomIn, Volume2, Eye, MousePointer, Hand,
  Sparkles, Contrast, Palette, MessageSquare
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { AccessibilitySettings } from '@/hooks/useSystemPreferences';

interface AccessibilityPanelProps {
  settings: AccessibilitySettings;
  onUpdate: (updates: Partial<AccessibilitySettings>) => void;
}

type CategoryType = 'vision' | 'hearing' | 'motor' | 'general';

const AccessibilityPanel: React.FC<AccessibilityPanelProps> = ({ settings, onUpdate }) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('vision');

  const categories = [
    { id: 'vision' as const, name: 'Vision', icon: Eye },
    { id: 'hearing' as const, name: 'Hearing', icon: Volume2 },
    { id: 'motor' as const, name: 'Motor', icon: Hand },
    { id: 'general' as const, name: 'General', icon: Sparkles },
  ];

  const renderCategoryContent = () => {
    switch (selectedCategory) {
      case 'vision':
        return (
          <div className="space-y-6">
            {/* Zoom */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ZoomIn className="w-4 h-4 text-blue-500" />
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Zoom</h3>
                </div>
                <Switch
                  checked={settings.zoom}
                  onCheckedChange={(checked) => onUpdate({ zoom: checked })}
                />
              </div>

              {settings.zoom && (
                <div className="space-y-4 pl-6">
                  <div className="space-y-2">
                    <label className="text-xs text-gray-500 dark:text-gray-400">Zoom Style</label>
                    <Select
                      value={settings.zoomStyle}
                      onValueChange={(value) => onUpdate({ zoomStyle: value as AccessibilitySettings['zoomStyle'] })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fullscreen">Full Screen</SelectItem>
                        <SelectItem value="pip">Picture-in-Picture</SelectItem>
                        <SelectItem value="splitScreen">Split Screen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-gray-500 dark:text-gray-400">
                      Zoom Level: {(settings.zoomLevel * 100).toFixed(0)}%
                    </label>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-500">100%</span>
                      <Slider
                        value={[settings.zoomLevel]}
                        onValueChange={(value) => onUpdate({ zoomLevel: value[0] })}
                        max={3}
                        min={1}
                        step={0.1}
                        className="flex-1"
                      />
                      <span className="text-xs text-gray-500">300%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* VoiceOver */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-purple-500" />
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">VoiceOver</h3>
                </div>
                <Switch
                  checked={settings.voiceOver}
                  onCheckedChange={(checked) => onUpdate({ voiceOver: checked })}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                VoiceOver reads aloud descriptions of items on the screen
              </p>

              {settings.voiceOver && (
                <div className="space-y-2 pl-6">
                  <label className="text-xs text-gray-500 dark:text-gray-400">Speaking Rate</label>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-500">Slow</span>
                    <Slider
                      value={[settings.voiceOverRate]}
                      onValueChange={(value) => onUpdate({ voiceOverRate: value[0] })}
                      max={100}
                      min={0}
                      step={5}
                      className="flex-1"
                    />
                    <span className="text-xs text-gray-500">Fast</span>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Spoken Content */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Spoken Content</h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Speak selection</span>
                  <Switch
                    checked={settings.speakSelection}
                    onCheckedChange={(checked) => onUpdate({ speakSelection: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Speak items under the pointer
                  </span>
                  <Switch
                    checked={settings.speakHoveredText}
                    onCheckedChange={(checked) => onUpdate({ speakHoveredText: checked })}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Display */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Contrast className="w-4 h-4 text-gray-500" />
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Display</h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Increase contrast</span>
                    <p className="text-xs text-gray-500">Make text and UI elements more defined</p>
                  </div>
                  <Switch
                    checked={settings.increaseContrast}
                    onCheckedChange={(checked) => onUpdate({ increaseContrast: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Reduce transparency</span>
                    <p className="text-xs text-gray-500">Improve contrast by reducing transparency</p>
                  </div>
                  <Switch
                    checked={settings.reduceTransparency}
                    onCheckedChange={(checked) => onUpdate({ reduceTransparency: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Differentiate without color
                    </span>
                    <p className="text-xs text-gray-500">Use shapes in addition to color</p>
                  </div>
                  <Switch
                    checked={settings.differentiateWithoutColor}
                    onCheckedChange={(checked) => onUpdate({ differentiateWithoutColor: checked })}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Cursor Size */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MousePointer className="w-4 h-4 text-gray-500" />
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Pointer Size</h3>
              </div>

              <div className="flex items-center gap-4">
                <MousePointer className="w-4 h-4 text-gray-400" />
                <Slider
                  value={[settings.cursorSize]}
                  onValueChange={(value) => onUpdate({ cursorSize: value[0] })}
                  max={3}
                  min={1}
                  step={0.25}
                  className="flex-1"
                />
                <MousePointer className="w-6 h-6 text-gray-600" />
              </div>

              {/* Cursor preview */}
              <div className="flex justify-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <div
                  className="bg-black dark:bg-white rounded-full"
                  style={{
                    width: 16 * settings.cursorSize,
                    height: 16 * settings.cursorSize,
                  }}
                />
              </div>
            </div>
          </div>
        );

      case 'hearing':
        return (
          <div className="space-y-6">
            {/* Flash Screen */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Flash the screen when an alert sound occurs
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Visual notification for audio alerts
                </p>
              </div>
              <Switch
                checked={settings.flashScreen}
                onCheckedChange={(checked) => onUpdate({ flashScreen: checked })}
              />
            </div>

            <Separator />

            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-center">
              <Volume2 className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Additional audio accessibility features coming soon
              </p>
            </div>
          </div>
        );

      case 'motor':
        return (
          <div className="space-y-6">
            {/* Reduce Motion */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Reduce motion</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Reduce the motion of the user interface
                </p>
              </div>
              <Switch
                checked={settings.reduceMotion}
                onCheckedChange={(checked) => onUpdate({ reduceMotion: checked })}
              />
            </div>

            <Separator />

            {/* Sticky Keys */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Sticky Keys</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Press modifier keys one at a time instead of holding them
                </p>
              </div>
              <Switch
                checked={settings.stickyKeys}
                onCheckedChange={(checked) => onUpdate({ stickyKeys: checked })}
              />
            </div>

            <Separator />

            {/* Slow Keys */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Slow Keys</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Adjust how long you must hold down a key before it is registered
                </p>
              </div>
              <Switch
                checked={settings.slowKeys}
                onCheckedChange={(checked) => onUpdate({ slowKeys: checked })}
              />
            </div>

            <Separator />

            {/* Mouse Keys */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Mouse Keys</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Control the pointer using the keyboard
                </p>
              </div>
              <Switch
                checked={settings.mouseKeys}
                onCheckedChange={(checked) => onUpdate({ mouseKeys: checked })}
              />
            </div>
          </div>
        );

      case 'general':
        return (
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                Accessibility Shortcut
              </h3>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Press Cmd + Option + F5 to quickly toggle accessibility features
              </p>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick Settings</h3>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Zoom', enabled: settings.zoom, key: 'zoom' },
                  { label: 'VoiceOver', enabled: settings.voiceOver, key: 'voiceOver' },
                  { label: 'Reduce Motion', enabled: settings.reduceMotion, key: 'reduceMotion' },
                  { label: 'High Contrast', enabled: settings.increaseContrast, key: 'increaseContrast' },
                  { label: 'Sticky Keys', enabled: settings.stickyKeys, key: 'stickyKeys' },
                  { label: 'Flash Screen', enabled: settings.flashScreen, key: 'flashScreen' },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => onUpdate({ [item.key]: !item.enabled })}
                    className={`
                      p-3 rounded-lg text-sm font-medium transition-colors
                      ${item.enabled
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}
                    `}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Tip: Many accessibility features can be enabled temporarily and will reset when you restart.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Accessibility className="w-6 h-6 text-blue-500" />
        <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100">Accessibility</h2>
      </div>

      <Separator />

      <div className="flex gap-4">
        {/* Category List */}
        <div className="w-1/3 space-y-1">
          {categories.map(({ id, name, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSelectedCategory(id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                ${selectedCategory === id
                  ? 'bg-blue-500 text-white'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'}
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm">{name}</span>
            </button>
          ))}
        </div>

        {/* Category Content */}
        <div className="flex-1 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          {renderCategoryContent()}
        </div>
      </div>
    </div>
  );
};

export default AccessibilityPanel;
