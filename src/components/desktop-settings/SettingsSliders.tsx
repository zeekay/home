
import React from 'react';
import { Sliders, Palette } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface SettingsSlidersProps {
  localPadding: number;
  localOpacity: number;
  onPaddingChange: (value: number[]) => void;
  onOpacityChange: (value: number[]) => void;
}

const SettingsSliders: React.FC<SettingsSlidersProps> = ({
  localPadding,
  localOpacity,
  onPaddingChange,
  onOpacityChange
}) => {
  return (
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
          onValueChange={onPaddingChange}
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
          onValueChange={onOpacityChange}
        />
      </div>
    </div>
  );
};

export default SettingsSliders;
