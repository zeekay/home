
import React, { useState } from 'react';
import MacWindow from './MacWindow';
import Terminal from './Terminal';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Settings } from 'lucide-react';

interface MacTerminalWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

const MacTerminalWindow: React.FC<MacTerminalWindowProps> = ({ onClose, onFocus }) => {
  const [customFontSize, setCustomFontSize] = useState(14);
  const [customPadding, setCustomPadding] = useState(16);
  const [customTheme, setCustomTheme] = useState('dark');
  const [showSettings, setShowSettings] = useState(false);

  const themes = [
    { id: 'dark', name: 'Dark' },
    { id: 'light', name: 'Light' },
    { id: 'blue', name: 'Blue' },
    { id: 'green', name: 'Green' },
    { id: 'purple', name: 'Purple' },
    { id: 'neon', name: 'Neon' },
    { id: 'retro', name: 'Retro' },
    { id: 'sunset', name: 'Sunset' },
    { id: 'ocean', name: 'Ocean' },
    { id: 'midnight', name: 'Midnight' },
    { id: 'matrix', name: 'Matrix' },
    { id: 'monokai', name: 'Monokai' },
    { id: 'dracula', name: 'Dracula' },
    { id: 'nord', name: 'Nord' },
    { id: 'pastel', name: 'Pastel' }
  ];

  return (
    <MacWindow
      title="Terminal – bash"
      onClose={onClose}
      onFocus={onFocus}
      initialPosition={{ x: 50, y: 50 }}
      initialSize={{ width: 700, height: 500 }}
      windowType="terminal"
      className="z-50"
      customControls={
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="ml-auto mr-4 opacity-50 hover:opacity-100 transition-opacity"
        >
          <Settings size={16} />
        </button>
      }
    >
      <div className="flex flex-col h-full">
        {showSettings && (
          <div className="bg-black/30 backdrop-blur-sm p-3 border-b border-white/10 flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/70">Theme:</span>
              <Select value={customTheme} onValueChange={setCustomTheme}>
                <SelectTrigger className="h-7 w-[120px] text-xs">
                  <SelectValue placeholder="Theme" />
                </SelectTrigger>
                <SelectContent>
                  {themes.map(theme => (
                    <SelectItem key={theme.id} value={theme.id} className="text-xs">
                      {theme.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/70">Font Size:</span>
              <Slider
                className="w-24"
                value={[customFontSize]}
                min={10}
                max={20}
                step={1}
                onValueChange={(values) => setCustomFontSize(values[0])}
              />
              <span className="text-xs text-white/70">{customFontSize}px</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/70">Padding:</span>
              <Slider
                className="w-24"
                value={[customPadding]}
                min={8}
                max={32}
                step={4}
                onValueChange={(values) => setCustomPadding(values[0])}
              />
              <span className="text-xs text-white/70">{customPadding}px</span>
            </div>
          </div>
        )}
        
        <Terminal 
          className="w-full flex-1 rounded-none" 
          customFontSize={customFontSize}
          customPadding={customPadding}
          customTheme={customTheme}
        />
      </div>
    </MacWindow>
  );
};

export default MacTerminalWindow;
