import React, { useState } from 'react';
import { LayoutPanelLeft, Image, Maximize2, Shrink, EyeOff, CornerDownRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { DesktopDockSettings, HotCornerAction } from '@/hooks/useSystemPreferences';

interface DesktopDockPanelProps {
  settings: DesktopDockSettings;
  onUpdate: (updates: Partial<DesktopDockSettings>) => void;
}

const wallpapers = [
  { id: 'gradient', name: 'Gradient', preview: 'bg-gradient-to-br from-purple-600 via-blue-500 to-cyan-400' },
  { id: 'wireframe', name: 'Wireframe', preview: 'bg-gradient-to-br from-gray-900 to-gray-800' },
  { id: 'particles', name: 'Particles', preview: 'bg-gradient-to-br from-gray-900 to-blue-900' },
  { id: 'matrix', name: 'Matrix', preview: 'bg-black' },
  { id: 'black', name: 'Solid Black', preview: 'bg-black' },
  { id: 'custom', name: 'Custom Image', preview: 'bg-gray-700' },
];

const hotCornerActions: { id: HotCornerAction; name: string }[] = [
  { id: 'none', name: '-' },
  { id: 'missionControl', name: 'Mission Control' },
  { id: 'appWindows', name: 'Application Windows' },
  { id: 'desktop', name: 'Desktop' },
  { id: 'notification', name: 'Notification Center' },
  { id: 'launchpad', name: 'Launchpad' },
  { id: 'lock', name: 'Lock Screen' },
  { id: 'sleep', name: 'Put Display to Sleep' },
  { id: 'screensaver', name: 'Start Screen Saver' },
];

const DesktopDockPanel: React.FC<DesktopDockPanelProps> = ({ settings, onUpdate }) => {
  const [customUrl, setCustomUrl] = useState('');

  const updateHotCorner = (corner: keyof DesktopDockSettings['hotCorners'], action: HotCornerAction) => {
    onUpdate({
      hotCorners: {
        ...settings.hotCorners,
        [corner]: action,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <LayoutPanelLeft className="w-6 h-6 text-orange-500" />
        <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100">Desktop & Dock</h2>
      </div>

      <Separator />

      {/* Wallpaper */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Image className="w-4 h-4 text-gray-500" />
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Wallpaper</h3>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {wallpapers.map((wp) => (
            <button
              key={wp.id}
              onClick={() => onUpdate({ wallpaper: wp.id })}
              className={`
                rounded-lg overflow-hidden transition-all
                ${settings.wallpaper === wp.id
                  ? 'ring-2 ring-blue-500 ring-offset-2'
                  : 'hover:ring-2 hover:ring-gray-300'}
              `}
            >
              <div className={`aspect-video w-full ${wp.preview}`} />
              <div className="p-2 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs font-medium text-gray-900 dark:text-gray-100">{wp.name}</p>
              </div>
            </button>
          ))}
        </div>

        {settings.wallpaper === 'custom' && (
          <div className="flex gap-2 mt-4">
            <Input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              className="flex-1"
            />
            <Button onClick={() => onUpdate({ wallpaper: customUrl })}>Apply</Button>
          </div>
        )}
      </div>

      <Separator />

      {/* Dock Size */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Shrink className="w-4 h-4 text-gray-500" />
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Dock Size</h3>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-500">Small</span>
          <Slider
            value={[settings.dockSize]}
            onValueChange={(value) => onUpdate({ dockSize: value[0] })}
            max={128}
            min={32}
            step={4}
            className="flex-1"
          />
          <span className="text-xs text-gray-500">Large</span>
        </div>
        <p className="text-center text-xs text-gray-600 dark:text-gray-400">{settings.dockSize}px</p>

        {/* Dock Preview */}
        <div className="flex justify-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="flex gap-2 p-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-700">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="rounded-xl bg-gradient-to-br from-blue-400 to-blue-600"
                style={{
                  width: Math.min(settings.dockSize * 0.6, 48),
                  height: Math.min(settings.dockSize * 0.6, 48),
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
            checked={settings.dockMagnification}
            onCheckedChange={(checked) => onUpdate({ dockMagnification: checked })}
          />
        </div>

        {settings.dockMagnification && (
          <div className="space-y-3 pl-6">
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-500">Min</span>
              <Slider
                value={[settings.dockMagnificationSize]}
                onValueChange={(value) => onUpdate({ dockMagnificationSize: value[0] })}
                max={256}
                min={64}
                step={8}
                className="flex-1"
              />
              <span className="text-xs text-gray-500">Max</span>
            </div>
            <p className="text-center text-xs text-gray-600 dark:text-gray-400">
              Max size: {settings.dockMagnificationSize}px
            </p>
          </div>
        )}
      </div>

      <Separator />

      {/* Position */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Position on screen</h3>

        <div className="grid grid-cols-3 gap-3">
          {(['left', 'bottom', 'right'] as const).map((pos) => (
            <button
              key={pos}
              onClick={() => onUpdate({ dockPosition: pos })}
              disabled={pos !== 'bottom'}
              className={`
                py-3 px-4 rounded-lg border-2 transition-all
                ${pos !== 'bottom' ? 'opacity-50 cursor-not-allowed' : ''}
                ${settings.dockPosition === pos
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700'}
              `}
            >
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-10 border-2 border-gray-300 dark:border-gray-600 rounded relative">
                  <div
                    className={`
                      absolute bg-gray-400 dark:bg-gray-500 rounded-sm
                      ${pos === 'left' ? 'left-0 top-1/2 -translate-y-1/2 w-1 h-6' : ''}
                      ${pos === 'bottom' ? 'bottom-0 left-1/2 -translate-x-1/2 w-8 h-1' : ''}
                      ${pos === 'right' ? 'right-0 top-1/2 -translate-y-1/2 w-1 h-6' : ''}
                    `}
                  />
                </div>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 capitalize">{pos}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Minimize Effect */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Minimize windows using</h3>
        <Select
          value={settings.minimizeEffect}
          onValueChange={(value) => onUpdate({ minimizeEffect: value as DesktopDockSettings['minimizeEffect'] })}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="genie">Genie Effect</SelectItem>
            <SelectItem value="scale">Scale Effect</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Dock Options */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Options</h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Automatically hide and show the Dock</span>
            <Switch
              checked={settings.autoHideDock}
              onCheckedChange={(checked) => onUpdate({ autoHideDock: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Animate opening applications</span>
            <Switch
              checked={settings.animateOpening}
              onCheckedChange={(checked) => onUpdate({ animateOpening: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Show indicators for open applications</span>
            <Switch
              checked={settings.showIndicators}
              onCheckedChange={(checked) => onUpdate({ showIndicators: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Show recent applications in Dock</span>
            <Switch
              checked={settings.showRecents}
              onCheckedChange={(checked) => onUpdate({ showRecents: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Minimize windows into application icon</span>
            <Switch
              checked={settings.minimizeToAppIcon}
              onCheckedChange={(checked) => onUpdate({ minimizeToAppIcon: checked })}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Hot Corners */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <CornerDownRight className="w-4 h-4 text-gray-500" />
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Hot Corners</h3>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Move your pointer to a corner to trigger an action
        </p>

        <div className="relative w-64 h-40 mx-auto border-2 border-gray-300 dark:border-gray-600 rounded-lg">
          {/* Screen representation */}
          <div className="absolute inset-4 bg-gray-100 dark:bg-gray-700 rounded" />

          {/* Top Left */}
          <div className="absolute -top-1 -left-1">
            <Select
              value={settings.hotCorners.topLeft}
              onValueChange={(value) => updateHotCorner('topLeft', value as HotCornerAction)}
            >
              <SelectTrigger className="w-8 h-8 p-0 rounded-full bg-blue-500 text-white text-xs">
                <span className="sr-only">Top Left</span>
              </SelectTrigger>
              <SelectContent>
                {hotCornerActions.map((action) => (
                  <SelectItem key={action.id} value={action.id}>{action.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Top Right */}
          <div className="absolute -top-1 -right-1">
            <Select
              value={settings.hotCorners.topRight}
              onValueChange={(value) => updateHotCorner('topRight', value as HotCornerAction)}
            >
              <SelectTrigger className="w-8 h-8 p-0 rounded-full bg-blue-500 text-white text-xs">
                <span className="sr-only">Top Right</span>
              </SelectTrigger>
              <SelectContent>
                {hotCornerActions.map((action) => (
                  <SelectItem key={action.id} value={action.id}>{action.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bottom Left */}
          <div className="absolute -bottom-1 -left-1">
            <Select
              value={settings.hotCorners.bottomLeft}
              onValueChange={(value) => updateHotCorner('bottomLeft', value as HotCornerAction)}
            >
              <SelectTrigger className="w-8 h-8 p-0 rounded-full bg-blue-500 text-white text-xs">
                <span className="sr-only">Bottom Left</span>
              </SelectTrigger>
              <SelectContent>
                {hotCornerActions.map((action) => (
                  <SelectItem key={action.id} value={action.id}>{action.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bottom Right */}
          <div className="absolute -bottom-1 -right-1">
            <Select
              value={settings.hotCorners.bottomRight}
              onValueChange={(value) => updateHotCorner('bottomRight', value as HotCornerAction)}
            >
              <SelectTrigger className="w-8 h-8 p-0 rounded-full bg-blue-500 text-white text-xs">
                <span className="sr-only">Bottom Right</span>
              </SelectTrigger>
              <SelectContent>
                {hotCornerActions.map((action) => (
                  <SelectItem key={action.id} value={action.id}>{action.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="text-center text-xs text-gray-500 dark:text-gray-400">
          Click a corner to set its action
        </div>
      </div>
    </div>
  );
};

export default DesktopDockPanel;
