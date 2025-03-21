
import React, { useState } from 'react';
import { Palette, RefreshCw } from 'lucide-react';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';

import SettingsSliders from './desktop-settings/SettingsSliders';
import ThemeSelector from './desktop-settings/ThemeSelector';
import BackgroundUploader from './desktop-settings/BackgroundUploader';

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
    <div className="fixed bottom-12 right-6 z-50">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button 
            className="w-12 h-12 flex items-center justify-center bg-black/60 rounded-xl hover:bg-gray-900/80 transition-all duration-200 hover:scale-125 shadow-lg group"
            title="Edit Background"
          >
            <Palette className="w-6 h-6 text-gray-400 group-hover:animate-pulse transition-all duration-300" />
          </button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-80 backdrop-blur-xl bg-black/80 border-0 p-4 rounded-xl shadow-2xl"
          side="top"
        >
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center text-white">
              <Palette className="w-4 h-4 mr-2 text-gray-400" />
              Background Settings
            </h3>
            
            <div className="space-y-3">
              {/* Sliders for padding and opacity */}
              <SettingsSliders
                localPadding={localPadding}
                localOpacity={localOpacity}
                onPaddingChange={handlePaddingChange}
                onOpacityChange={handleOpacityChange}
              />
              
              {/* Theme selector */}
              <ThemeSelector
                localTheme={localTheme}
                onThemeChange={handleThemeChange}
              />
              
              {/* Background uploader */}
              <BackgroundUploader
                uploadedImagePreview={uploadedImagePreview}
                setUploadedImagePreview={setUploadedImagePreview}
                handleFileUpload={handleFileUpload}
              />
              
              <button 
                onClick={resetSettings}
                className="w-full py-2 px-4 bg-gray-800 hover:bg-gray-700 rounded-md text-sm flex items-center justify-center text-white"
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
