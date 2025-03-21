
import React from 'react';
import { Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  RadioGroup,
  RadioGroupItem
} from '@/components/ui/radio-group';

interface ThemeSelectorProps {
  localTheme: string;
  onThemeChange: (value: string) => void;
}

// Define themes outside the component to avoid recreating on each render
const themes = [
  { id: 'default', name: 'Default', color: 'bg-gradient-to-br from-blue-500 to-purple-600' },
  { id: 'ocean', name: 'Ocean', color: 'bg-gradient-to-br from-blue-400 to-cyan-500' },
  { id: 'sunset', name: 'Sunset', color: 'bg-gradient-to-br from-orange-400 to-pink-600' },
  { id: 'forest', name: 'Forest', color: 'bg-gradient-to-br from-green-400 to-emerald-600' },
  { id: 'lavender', name: 'Lavender', color: 'bg-gradient-to-br from-purple-400 to-indigo-600' },
  { id: 'custom', name: 'Custom', color: 'bg-gray-200 dark:bg-gray-700' },
];

const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  localTheme,
  onThemeChange
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm flex items-center">
        <Palette className="w-4 h-4 mr-2" />
        Background Theme
      </label>
      <RadioGroup 
        value={localTheme}
        onValueChange={onThemeChange}
        className="grid grid-cols-3 gap-2"
      >
        {themes.map((theme) => (
          <div 
            key={theme.id}
            className="relative flex flex-col items-center"
          >
            <RadioGroupItem 
              value={theme.id} 
              id={theme.id}
              className="sr-only"
            />
            <label 
              htmlFor={theme.id}
              className={cn(
                "w-full aspect-square rounded-md cursor-pointer border-2 hover:opacity-90",
                theme.color,
                localTheme === theme.id ? "border-white shadow-lg" : "border-transparent"
              )}
            ></label>
            <span className="text-xs mt-1">{theme.name}</span>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export default ThemeSelector;
