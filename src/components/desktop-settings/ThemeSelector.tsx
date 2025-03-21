
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
  { id: 'wireframe', name: 'Wireframe', color: 'bg-[#111]' },
  { id: 'particles', name: 'Particles', color: 'bg-[#0a0a0d]' },
  { id: 'matrix', name: 'Matrix', color: 'bg-gradient-to-br from-[#0a0a0d] to-[#111]' },
  { id: 'waves', name: 'Waves', color: 'bg-gradient-to-b from-[#0a0a0d] to-[#111]' },
  { id: 'neon', name: 'Neon', color: 'bg-[#050508]' },
  { id: 'custom', name: 'Custom', color: 'bg-gray-900' },
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
                localTheme === theme.id ? "border-white/50 shadow-lg" : "border-transparent"
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
