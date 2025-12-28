import React, { useState } from 'react';
import { Keyboard, Lightbulb, Globe, Command, Zap } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import type { KeyboardSettings } from '@/hooks/useSystemPreferences';

interface KeyboardPanelProps {
  settings: KeyboardSettings;
  onUpdate: (updates: Partial<KeyboardSettings>) => void;
}

type TabType = 'keyboard' | 'shortcuts' | 'input';

const KeyboardPanel: React.FC<KeyboardPanelProps> = ({ settings, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<TabType>('keyboard');

  const toggleShortcut = (categoryIndex: number, shortcutIndex: number) => {
    const newShortcuts = [...settings.shortcuts];
    newShortcuts[categoryIndex] = {
      ...newShortcuts[categoryIndex],
      shortcuts: newShortcuts[categoryIndex].shortcuts.map((s, i) =>
        i === shortcutIndex ? { ...s, enabled: !s.enabled } : s
      ),
    };
    onUpdate({ shortcuts: newShortcuts });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'keyboard':
        return (
          <div className="space-y-6">
            {/* Key Repeat */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Key Repeat</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-500 w-12">Slow</span>
                  <Slider
                    value={[settings.keyRepeatRate]}
                    onValueChange={(value) => onUpdate({ keyRepeatRate: value[0] })}
                    max={10}
                    min={1}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-xs text-gray-500 w-12 text-right">Fast</span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-500 w-12">Long</span>
                  <Slider
                    value={[settings.delayUntilRepeat]}
                    onValueChange={(value) => onUpdate({ delayUntilRepeat: value[0] })}
                    max={5}
                    min={1}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-xs text-gray-500 w-12 text-right">Short</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Delay Until Repeat
                </p>
              </div>

              {/* Key Repeat Test Area */}
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <input
                  type="text"
                  placeholder="Type here to test key repeat..."
                  className="w-full bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400"
                />
              </div>
            </div>

            <Separator />

            {/* Modifier Keys */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Modifier Keys</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 dark:text-gray-400">Caps Lock Key</label>
                  <Select
                    value={settings.capsLockAction}
                    onValueChange={(value) => onUpdate({ capsLockAction: value as KeyboardSettings['capsLockAction'] })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="capsLock">Caps Lock</SelectItem>
                      <SelectItem value="control">Control</SelectItem>
                      <SelectItem value="option">Option</SelectItem>
                      <SelectItem value="command">Command</SelectItem>
                      <SelectItem value="escape">Escape</SelectItem>
                      <SelectItem value="none">No Action</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-gray-500 dark:text-gray-400">Function (fn) Key</label>
                  <Select
                    value={settings.fnKeyAction}
                    onValueChange={(value) => onUpdate({ fnKeyAction: value as KeyboardSettings['fnKeyAction'] })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="specialFeatures">Special Features</SelectItem>
                      <SelectItem value="fKeys">F1, F2, etc. Keys</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Keyboard Backlight */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-500" />
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Keyboard Backlight</h3>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Adjust keyboard brightness in low light
                </span>
                <Switch
                  checked={settings.adjustBrightness}
                  onCheckedChange={(checked) => onUpdate({ adjustBrightness: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Turn keyboard backlight off after inactivity
                </span>
                <Switch
                  checked={settings.keyboardBacklight}
                  onCheckedChange={(checked) => onUpdate({ keyboardBacklight: checked })}
                />
              </div>

              {settings.keyboardBacklight && (
                <div className="pl-4">
                  <Select
                    value={String(settings.backlightTimeout)}
                    onValueChange={(value) => onUpdate({ backlightTimeout: parseInt(value, 10) })}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 seconds</SelectItem>
                      <SelectItem value="10">10 seconds</SelectItem>
                      <SelectItem value="30">30 seconds</SelectItem>
                      <SelectItem value="60">1 minute</SelectItem>
                      <SelectItem value="300">5 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        );

      case 'shortcuts':
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Keyboard shortcuts for common actions
            </p>

            {settings.shortcuts.map((category, categoryIndex) => (
              <div key={category.category} className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Command className="w-4 h-4" />
                  {category.category}
                </h4>

                <div className="space-y-1 pl-6">
                  {category.shortcuts.map((shortcut, shortcutIndex) => (
                    <div
                      key={shortcut.name}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={shortcut.enabled}
                          onCheckedChange={() => toggleShortcut(categoryIndex, shortcutIndex)}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {shortcut.name}
                        </span>
                      </div>
                      <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-600 dark:text-gray-400">
                        {shortcut.key}
                      </code>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <Separator />

            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Tip: You can customize shortcuts by clicking on the key combination and pressing a new shortcut.
              </p>
            </div>
          </div>
        );

      case 'input':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Input Sources</h3>
            </div>

            <div className="space-y-2">
              {settings.inputSources.map((source) => (
                <div
                  key={source}
                  className={`
                    flex items-center justify-between p-3 rounded-lg
                    ${settings.currentInputSource === source
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500'
                      : 'bg-gray-100 dark:bg-gray-800'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-gray-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{source}</span>
                  </div>
                  {settings.currentInputSource === source && (
                    <span className="text-xs text-blue-500">Current</span>
                  )}
                </div>
              ))}
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Show Input menu in menu bar
              </span>
              <Switch checked={true} />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Automatically switch to document's input source
              </span>
              <Switch checked={false} />
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
        <Keyboard className="w-6 h-6 text-gray-500" />
        <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100">Keyboard</h2>
      </div>

      <Separator />

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
        {[
          { id: 'keyboard', label: 'Keyboard', icon: Keyboard },
          { id: 'shortcuts', label: 'Shortcuts', icon: Zap },
          { id: 'input', label: 'Input Sources', icon: Globe },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as TabType)}
            className={`
              flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md transition-colors
              ${activeTab === id
                ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-gray-100'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'}
            `}
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        {renderContent()}
      </div>
    </div>
  );
};

export default KeyboardPanel;
