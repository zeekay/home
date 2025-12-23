import React, { useState } from 'react';
import { Monitor, Image, Sparkles, Grid3X3, Square, Link2 } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface DisplaySettingsTabProps {
  theme: string;
  customBgUrl: string;
  onThemeChange: (theme: string) => void;
  onCustomBgUrlChange: (url: string) => void;
}

interface ThemeOption {
  id: string;
  name: string;
  preview: React.ReactNode;
  description: string;
}

const DisplaySettingsTab: React.FC<DisplaySettingsTabProps> = ({
  theme,
  customBgUrl,
  onThemeChange,
  onCustomBgUrlChange
}) => {
  const [customUrl, setCustomUrl] = useState(customBgUrl);

  const themeOptions: ThemeOption[] = [
    {
      id: 'wireframe',
      name: 'Wireframe',
      description: 'Animated geometric wireframe',
      preview: (
        <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center overflow-hidden">
          <Grid3X3 className="w-8 h-8 text-cyan-400/60" />
        </div>
      )
    },
    {
      id: 'gradient',
      name: 'Gradient',
      description: 'Smooth color transitions',
      preview: (
        <div className="w-full h-full bg-gradient-to-br from-purple-600 via-blue-500 to-cyan-400" />
      )
    },
    {
      id: 'particles',
      name: 'Particles',
      description: 'Floating particle system',
      preview: (
        <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-white/60" />
        </div>
      )
    },
    {
      id: 'matrix',
      name: 'Matrix',
      description: 'Digital rain effect',
      preview: (
        <div className="w-full h-full bg-black flex items-center justify-center font-mono text-green-500 text-xs">
          01010
        </div>
      )
    },
    {
      id: 'black',
      name: 'Solid Black',
      description: 'Minimal dark background',
      preview: (
        <div className="w-full h-full bg-black flex items-center justify-center">
          <Square className="w-6 h-6 text-gray-800" />
        </div>
      )
    },
    {
      id: 'custom',
      name: 'Custom Image',
      description: 'Use your own image URL',
      preview: (
        <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
          <Image className="w-8 h-8 text-gray-500" />
        </div>
      )
    }
  ];

  const handleApplyCustomUrl = () => {
    if (customUrl.trim()) {
      onCustomBgUrlChange(customUrl.trim());
      onThemeChange('custom');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Monitor className="w-6 h-6 text-blue-500" />
        <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100">Display</h2>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Desktop Background</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Choose a background theme for your desktop
        </p>

        <div className="grid grid-cols-3 gap-4">
          {themeOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => {
                if (option.id !== 'custom') {
                  onThemeChange(option.id);
                } else if (customUrl.trim()) {
                  onCustomBgUrlChange(customUrl.trim());
                  onThemeChange('custom');
                }
              }}
              className={`
                group relative rounded-lg overflow-hidden transition-all
                ${theme === option.id
                  ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-900'
                  : 'hover:ring-2 hover:ring-gray-300 dark:hover:ring-gray-600'}
              `}
            >
              <div className="aspect-video w-full">
                {option.preview}
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              <div className="p-2 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs font-medium text-gray-900 dark:text-gray-100">{option.name}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{option.description}</p>
              </div>
              {theme === option.id && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <Link2 className="w-4 h-4" />
          Custom Image URL
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Enter a URL to use as your desktop background
        </p>
        <div className="flex gap-2">
          <Input
            type="url"
            placeholder="https://example.com/image.jpg"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            className="flex-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
          />
          <Button
            onClick={handleApplyCustomUrl}
            disabled={!customUrl.trim()}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            Apply
          </Button>
        </div>
        {theme === 'custom' && customBgUrl && (
          <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Custom background active</span>
          </div>
        )}
      </div>

      <Separator />

      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Current theme: <span className="font-medium text-gray-700 dark:text-gray-300">{themeOptions.find(t => t.id === theme)?.name || 'Unknown'}</span>
        </p>
      </div>
    </div>
  );
};

export default DisplaySettingsTab;
