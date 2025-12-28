import React from 'react';
import { Settings, Sun, Moon, Monitor, Palette } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { GeneralSettings } from '@/hooks/useSystemPreferences';

interface GeneralPanelProps {
  settings: GeneralSettings;
  onUpdate: (updates: Partial<GeneralSettings>) => void;
}

const accentColors = [
  { id: 'blue', name: 'Blue', color: 'bg-blue-500' },
  { id: 'purple', name: 'Purple', color: 'bg-purple-500' },
  { id: 'pink', name: 'Pink', color: 'bg-pink-500' },
  { id: 'red', name: 'Red', color: 'bg-red-500' },
  { id: 'orange', name: 'Orange', color: 'bg-orange-500' },
  { id: 'yellow', name: 'Yellow', color: 'bg-yellow-500' },
  { id: 'green', name: 'Green', color: 'bg-green-500' },
  { id: 'graphite', name: 'Graphite', color: 'bg-gray-500' },
] as const;

const GeneralPanel: React.FC<GeneralPanelProps> = ({ settings, onUpdate }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="w-6 h-6 text-gray-500" />
        <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100">General</h2>
      </div>

      <Separator />

      {/* Appearance */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Appearance</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Select the appearance for windows and menus
        </p>

        <div className="grid grid-cols-3 gap-4">
          {[
            { id: 'light', name: 'Light', icon: Sun },
            { id: 'dark', name: 'Dark', icon: Moon },
            { id: 'auto', name: 'Auto', icon: Monitor },
          ].map(({ id, name, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onUpdate({ appearance: id as GeneralSettings['appearance'] })}
              className={`
                relative p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2
                ${settings.appearance === id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}
              `}
            >
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center
                ${id === 'light' ? 'bg-yellow-100 text-yellow-600' : ''}
                ${id === 'dark' ? 'bg-gray-800 text-gray-200' : ''}
                ${id === 'auto' ? 'bg-gradient-to-br from-yellow-100 to-gray-800 text-gray-600' : ''}
              `}>
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{name}</span>
              {settings.appearance === id && (
                <div className="absolute top-2 right-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Accent Color */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-gray-500" />
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Accent Color</h3>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Select the accent color for buttons, selections, and highlights
        </p>

        <div className="flex gap-2">
          {accentColors.map((color) => (
            <button
              key={color.id}
              onClick={() => onUpdate({ accentColor: color.id as GeneralSettings['accentColor'] })}
              className={`
                w-8 h-8 rounded-full ${color.color} transition-all
                ${settings.accentColor === color.id
                  ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 ring-gray-400'
                  : 'hover:scale-110'}
              `}
              title={color.name}
            >
              {settings.accentColor === color.id && (
                <svg className="w-full h-full text-white p-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Sidebar Icon Size */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Sidebar Icon Size</h3>
        <div className="flex gap-3">
          {(['small', 'medium', 'large'] as const).map((size) => (
            <button
              key={size}
              onClick={() => onUpdate({ sidebarIconSize: size })}
              className={`
                flex-1 py-2 px-4 rounded-lg border-2 transition-all capitalize
                ${settings.sidebarIconSize === size
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}
              `}
            >
              <span className="text-sm text-gray-700 dark:text-gray-300">{size}</span>
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Scroll Bars */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Scroll Bars</h3>
        <Select
          value={settings.scrollBars}
          onValueChange={(value) => onUpdate({ scrollBars: value as GeneralSettings['scrollBars'] })}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="automatic">Automatically based on mouse or trackpad</SelectItem>
            <SelectItem value="whenScrolling">When scrolling</SelectItem>
            <SelectItem value="always">Always</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Click Scroll Bar */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Click in scroll bar to</h3>
        <div className="flex gap-3">
          {[
            { id: 'jump', name: 'Jump to the spot that\'s clicked' },
            { id: 'page', name: 'Jump to the next page' },
          ].map((option) => (
            <button
              key={option.id}
              onClick={() => onUpdate({ clickScrollBar: option.id as GeneralSettings['clickScrollBar'] })}
              className={`
                flex-1 py-2 px-3 rounded-lg border-2 transition-all text-left
                ${settings.clickScrollBar === option.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}
              `}
            >
              <span className="text-xs text-gray-700 dark:text-gray-300">{option.name}</span>
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Recent Items */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Recent Items</h3>
        <Select
          value={String(settings.recentItems)}
          onValueChange={(value) => onUpdate({ recentItems: parseInt(value, 10) })}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[5, 10, 15, 20, 30, 50].map((num) => (
              <SelectItem key={num} value={String(num)}>{num} items</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Handoff */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Allow Handoff between this computer and your iCloud devices</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Continue tasks seamlessly across devices
          </p>
        </div>
        <Switch
          checked={settings.handoff}
          onCheckedChange={(checked) => onUpdate({ handoff: checked })}
        />
      </div>
    </div>
  );
};

export default GeneralPanel;
