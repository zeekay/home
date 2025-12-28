import React, { useRef, useCallback } from 'react';
import { Volume2, VolumeX, Mic, Bell, Speaker } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { SoundSettings } from '@/hooks/useSystemPreferences';
import { soundManager, playSound } from '@/lib/sounds';

interface SoundPanelProps {
  settings: SoundSettings;
  onUpdate: (updates: Partial<SoundSettings>) => void;
}

const alertSounds = [
  'Basso', 'Blow', 'Bottle', 'Frog', 'Funk', 'Glass', 'Hero',
  'Morse', 'Ping', 'Pop', 'Purr', 'Sosumi', 'Submarine', 'Tink',
];

const outputDevices = [
  'Built-in Speakers',
  'External Headphones',
  'AirPods Pro',
  'HomePod',
  'Bluetooth Speaker',
];

const inputDevices = [
  'Built-in Microphone',
  'External Microphone',
  'AirPods Pro',
  'USB Microphone',
];

const SoundPanel: React.FC<SoundPanelProps> = ({ settings, onUpdate }) => {
  const lastVolumeRef = useRef(settings.outputVolume);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Play volume change sound with debouncing
  const handleVolumeChange = useCallback((value: number[]) => {
    const newVolume = value[0];
    onUpdate({ outputVolume: newVolume, outputMuted: false });

    // Play feedback sound when volume changes (debounced)
    if (settings.playFeedback && Math.abs(newVolume - lastVolumeRef.current) >= 5) {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        soundManager.setVolume(newVolume);
        playSound('volumeChange');
        lastVolumeRef.current = newVolume;
      }, 100);
    }
  }, [onUpdate, settings.playFeedback]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Volume2 className="w-6 h-6 text-pink-500" />
        <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100">Sound</h2>
      </div>

      <Separator />

      {/* Output */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Speaker className="w-4 h-4 text-gray-500" />
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Output</h3>
        </div>

        <div className="space-y-4">
          <Select
            value={settings.outputDevice}
            onValueChange={(value) => onUpdate({ outputDevice: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {outputDevices.map((device) => (
                <SelectItem key={device} value={device}>
                  <div className="flex items-center gap-2">
                    <Speaker className="w-4 h-4" />
                    {device}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Output Volume</span>
              <button
                onClick={() => onUpdate({ outputMuted: !settings.outputMuted })}
                className={`p-2 rounded-lg transition-colors ${
                  settings.outputMuted
                    ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {settings.outputMuted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
            </div>

            <div className="flex items-center gap-4">
              <VolumeX className="w-4 h-4 text-gray-400" />
              <Slider
                value={[settings.outputMuted ? 0 : settings.outputVolume]}
                onValueChange={handleVolumeChange}
                max={100}
                min={0}
                step={1}
                className="flex-1"
                disabled={settings.outputMuted}
              />
              <Volume2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>

            {/* Volume meter visualization */}
            <div className="flex gap-0.5 h-2">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-sm transition-colors ${
                    i < (settings.outputMuted ? 0 : settings.outputVolume / 5)
                      ? i < 14
                        ? 'bg-green-500'
                        : i < 17
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Input */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Mic className="w-4 h-4 text-gray-500" />
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Input</h3>
        </div>

        <div className="space-y-4">
          <Select
            value={settings.inputDevice}
            onValueChange={(value) => onUpdate({ inputDevice: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {inputDevices.map((device) => (
                <SelectItem key={device} value={device}>
                  <div className="flex items-center gap-2">
                    <Mic className="w-4 h-4" />
                    {device}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="space-y-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Input Volume</span>
            <div className="flex items-center gap-4">
              <Mic className="w-4 h-4 text-gray-400" />
              <Slider
                value={[settings.inputVolume]}
                onValueChange={(value) => onUpdate({ inputVolume: value[0] })}
                max={100}
                min={0}
                step={1}
                className="flex-1"
              />
              <Mic className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>

            {/* Input level visualization */}
            <div className="flex gap-0.5 h-2">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-sm transition-colors ${
                    // Simulate random input level for visual effect
                    i < Math.random() * settings.inputVolume / 5
                      ? 'bg-green-500'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Input level</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Alert Sounds */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-gray-500" />
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Alert Sound</h3>
        </div>

        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
          {alertSounds.map((sound) => (
            <button
              key={sound}
              onClick={() => {
                onUpdate({ alertSound: sound });
                // Play synthesized sound preview
                soundManager.setVolume(settings.alertVolume);
                soundManager.playAlert(sound);
              }}
              className={`
                py-2 px-3 rounded-lg text-left transition-all
                ${settings.alertSound === sound
                  ? 'bg-blue-500 text-white'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}
              `}
            >
              <span className="text-sm">{sound}</span>
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Alert Volume</span>
          <div className="flex items-center gap-4">
            <Bell className="w-4 h-4 text-gray-400" />
            <Slider
              value={[settings.alertVolume]}
              onValueChange={(value) => onUpdate({ alertVolume: value[0] })}
              max={100}
              min={0}
              step={1}
              className="flex-1"
            />
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </div>
        </div>
      </div>

      <Separator />

      {/* Sound Effects */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Sound Effects</h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Play sound on startup
            </span>
            <Switch
              checked={settings.playStartupSound}
              onCheckedChange={(checked) => onUpdate({ playStartupSound: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Play feedback when volume is changed
            </span>
            <Switch
              checked={settings.playFeedback}
              onCheckedChange={(checked) => onUpdate({ playFeedback: checked })}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Current Status */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500 dark:text-gray-400">Output</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">{settings.outputDevice}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Input</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">{settings.inputDevice}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoundPanel;
