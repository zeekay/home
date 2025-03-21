
import React, { useState } from 'react';
import { Settings, Image, Sliders, Palette, RefreshCw, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import {
  RadioGroup,
  RadioGroupItem
} from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';

interface DesktopSettingsProps {
  onPaddingChange: (padding: number) => void;
  onOpacityChange: (opacity: number) => void;
  onThemeChange: (theme: string) => void;
  onCustomBgChange: (url: string) => void;
  currentPadding: number;
  currentOpacity: number;
  currentTheme: string;
  currentBgUrl: string;
}

const themes = [
  { id: 'default', name: 'Default', color: 'bg-gradient-to-br from-blue-500 to-purple-600' },
  { id: 'ocean', name: 'Ocean', color: 'bg-gradient-to-br from-blue-400 to-cyan-500' },
  { id: 'sunset', name: 'Sunset', color: 'bg-gradient-to-br from-orange-400 to-pink-600' },
  { id: 'forest', name: 'Forest', color: 'bg-gradient-to-br from-green-400 to-emerald-600' },
  { id: 'lavender', name: 'Lavender', color: 'bg-gradient-to-br from-purple-400 to-indigo-600' },
  { id: 'custom', name: 'Custom', color: 'bg-gray-200 dark:bg-gray-700' },
];

const DesktopSettings: React.FC<DesktopSettingsProps> = ({
  onPaddingChange,
  onOpacityChange,
  onThemeChange,
  onCustomBgChange,
  currentPadding,
  currentOpacity,
  currentTheme,
  currentBgUrl
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localPadding, setLocalPadding] = useState(currentPadding);
  const [localOpacity, setLocalOpacity] = useState(currentOpacity);
  const [localTheme, setLocalTheme] = useState(currentTheme);
  const [localBgUrl, setLocalBgUrl] = useState(currentBgUrl);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);

  const handlePaddingChange = (value: number[]) => {
    setLocalPadding(value[0]);
    onPaddingChange(value[0]);
  };

  const handleOpacityChange = (value: number[]) => {
    setLocalOpacity(value[0]);
    onOpacityChange(value[0]);
  };

  const handleThemeChange = (value: string) => {
    setLocalTheme(value);
    onThemeChange(value);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setUploadedImagePreview(result);
        setLocalBgUrl(result);
        onCustomBgChange(result);
        // Automatically set theme to custom when uploading an image
        setLocalTheme('custom');
        onThemeChange('custom');
      };
      reader.readAsDataURL(file);
    }
  };

  const resetSettings = () => {
    setLocalPadding(1);
    onPaddingChange(1);
    setLocalOpacity(0.7);
    onOpacityChange(0.7);
    setLocalTheme('default');
    onThemeChange('default');
    setLocalBgUrl('');
    onCustomBgChange('');
    setUploadedImagePreview(null);
  };

  return (
    <div className="fixed bottom-24 right-6 z-50">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button 
            className="bg-white/20 dark:bg-black/20 backdrop-blur-lg p-3 rounded-full shadow-lg hover:bg-white/30 dark:hover:bg-black/30 transition-colors"
            title="Desktop Settings"
          >
            <Settings className="w-5 h-5 text-white" />
          </button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-80 backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 border border-white/20 p-4 rounded-xl shadow-2xl"
          side="top"
        >
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              Desktop Settings
            </h3>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <label className="text-sm flex items-center">
                    <Sliders className="w-4 h-4 mr-2" />
                    Window Padding
                  </label>
                  <span className="text-xs">{localPadding.toFixed(1)}x</span>
                </div>
                <Slider 
                  value={[localPadding]} 
                  min={0.5} 
                  max={3} 
                  step={0.1} 
                  onValueChange={handlePaddingChange}
                />
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between">
                  <label className="text-sm flex items-center">
                    <Palette className="w-4 h-4 mr-2" />
                    Window Opacity
                  </label>
                  <span className="text-xs">{Math.round(localOpacity * 100)}%</span>
                </div>
                <Slider 
                  value={[localOpacity]} 
                  min={0.3} 
                  max={1} 
                  step={0.05} 
                  onValueChange={handleOpacityChange}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm flex items-center">
                  <Palette className="w-4 h-4 mr-2" />
                  Background Theme
                </label>
                <RadioGroup 
                  value={localTheme}
                  onValueChange={handleThemeChange}
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
              
              <Dialog>
                <DialogTrigger asChild>
                  <button 
                    className="w-full py-2 px-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md text-sm flex items-center justify-center"
                  >
                    <Image className="w-4 h-4 mr-2" />
                    Upload Custom Background
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload Custom Background</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                      {uploadedImagePreview ? (
                        <div className="relative">
                          <img 
                            src={uploadedImagePreview} 
                            alt="Preview" 
                            className="max-h-48 mx-auto rounded-md object-cover"
                          />
                          <button 
                            onClick={() => setUploadedImagePreview(null)}
                            className="absolute top-2 right-2 bg-black/50 p-1 rounded-full"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Image className="w-10 h-10 text-gray-400 mx-auto" />
                          <p className="text-sm text-gray-500">Drag and drop or click to upload</p>
                        </div>
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              <button 
                onClick={resetSettings}
                className="w-full py-2 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md text-sm flex items-center justify-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset to Default
              </button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DesktopSettings;
