import React from 'react';
import { Palette, Sun, Moon, Monitor, Type, Layers } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";

interface AppearanceTabProps {
  colorScheme: 'dark' | 'light' | 'auto';
  windowTransparency: number;
  fontSize: 'small' | 'medium' | 'large';
  onColorSchemeChange: (scheme: 'dark' | 'light' | 'auto') => void;
  onWindowTransparencyChange: (value: number) => void;
  onFontSizeChange: (size: 'small' | 'medium' | 'large') => void;
}

const AppearanceTab: React.FC<AppearanceTabProps> = ({
  colorScheme,
  windowTransparency,
  fontSize,
  onColorSchemeChange,
  onWindowTransparencyChange,
  onFontSizeChange
}) => {
  const colorSchemes = [
    { id: 'light' as const, name: 'Light', icon: Sun, description: 'Light appearance' },
    { id: 'dark' as const, name: 'Dark', icon: Moon, description: 'Dark appearance' },
    { id: 'auto' as const, name: 'Auto', icon: Monitor, description: 'Match system' }
  ];

  const fontSizes = [
    { id: 'small' as const, name: 'Small', size: '12px' },
    { id: 'medium' as const, name: 'Medium', size: '14px' },
    { id: 'large' as const, name: 'Large', size: '16px' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Palette className="w-6 h-6 text-purple-500" />
        <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100">Appearance</h2>
      </div>

      <Separator />

      {/* Color Scheme */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Color Scheme</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Select the appearance for windows and menus
        </p>

        <div className="grid grid-cols-3 gap-4">
          {colorSchemes.map((scheme) => {
            const Icon = scheme.icon;
            return (
              <button
                key={scheme.id}
                onClick={() => onColorSchemeChange(scheme.id)}
                className={`
                  relative p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2
                  ${colorScheme === scheme.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}
                `}
              >
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center
                  ${scheme.id === 'light' ? 'bg-yellow-100 text-yellow-600' : ''}
                  ${scheme.id === 'dark' ? 'bg-gray-800 text-gray-200' : ''}
                  ${scheme.id === 'auto' ? 'bg-gradient-to-br from-yellow-100 to-gray-800 text-gray-600' : ''}
                `}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{scheme.name}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{scheme.description}</span>
                {colorScheme === scheme.id && (
                  <div className="absolute top-2 right-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Window Transparency */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-gray-500" />
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Window Transparency</h3>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Adjust the transparency level of window backgrounds
        </p>

        <div className="space-y-3">
          <Slider
            value={[windowTransparency]}
            onValueChange={(value) => onWindowTransparencyChange(value[0])}
            max={100}
            min={0}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Opaque</span>
            <span className="font-medium text-gray-700 dark:text-gray-300">{windowTransparency}%</span>
            <span>Transparent</span>
          </div>
        </div>

        {/* Preview */}
        <div className="relative h-20 rounded-lg overflow-hidden bg-gradient-to-br from-purple-500 to-blue-500">
          <div
            className="absolute inset-2 rounded-md bg-white dark:bg-gray-900 flex items-center justify-center text-sm text-gray-600 dark:text-gray-300"
            style={{ opacity: 1 - (windowTransparency / 100) * 0.5 }}
          >
            Preview Window
          </div>
        </div>
      </div>

      <Separator />

      {/* Font Size */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Type className="w-4 h-4 text-gray-500" />
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Text Size</h3>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Adjust the size of text throughout the system
        </p>

        <div className="flex gap-3">
          {fontSizes.map((size) => (
            <button
              key={size.id}
              onClick={() => onFontSizeChange(size.id)}
              className={`
                flex-1 py-3 px-4 rounded-lg border-2 transition-all flex flex-col items-center gap-1
                ${fontSize === size.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}
              `}
            >
              <span
                className="font-medium text-gray-900 dark:text-gray-100"
                style={{ fontSize: size.size }}
              >
                Aa
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{size.name}</span>
            </button>
          ))}
        </div>
      </div>

      <Separator />

      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg space-y-2">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Note: Some appearance settings may require a refresh to take full effect.
        </p>
      </div>
    </div>
  );
};

export default AppearanceTab;
