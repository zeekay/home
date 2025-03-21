
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
  { id: 'wireframe', name: 'Classic', color: 'bg-gradient-to-br from-[#111] to-[#222]' },
  { id: 'particles', name: 'Silver', color: 'bg-gradient-to-br from-[#333] to-[#444]' },
  { id: 'matrix', name: 'Green', color: 'bg-gradient-to-br from-[#003300] to-[#005500]' },
  { id: 'waves', name: 'Blue', color: 'bg-gradient-to-br from-[#001133] to-[#002255]' },
  { id: 'neon', name: 'Purple', color: 'bg-gradient-to-br from-[#220033] to-[#330055]' },
  { id: 'custom', name: 'Custom', color: 'bg-gray-800' },
];

const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  localTheme,
  onThemeChange
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm flex items-center text-white">
        <Palette className="w-4 h-4 mr-2 text-purple-400" />
        Sound Wave Color
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
                "w-full aspect-square rounded-md cursor-pointer border-2 hover:opacity-90 transition-all duration-200",
                theme.color,
                localTheme === theme.id ? "border-white/50 shadow-lg scale-110" : "border-transparent"
              )}
            ></label>
            <span className="text-xs mt-1 text-white">{theme.name}</span>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export default ThemeSelector;
