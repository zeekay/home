
import React from 'react';
import { TerminalProfile } from '@/types/terminal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface TerminalProfileEditorProps {
  profile: TerminalProfile;
  onChange: (profile: TerminalProfile) => void;
  onClose: () => void;
  onDelete?: () => void;
  isNew?: boolean;
}

const TerminalProfileEditor: React.FC<TerminalProfileEditorProps> = ({
  profile,
  onChange,
  onClose,
  onDelete,
  isNew = false,
}) => {
  const updateField = <K extends keyof TerminalProfile>(
    field: K,
    value: TerminalProfile[K]
  ) => {
    onChange({ ...profile, [field]: value });
  };

  return (
    <div className="bg-black/90 backdrop-blur-sm p-4 border-b border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-white">
          {isNew ? 'New Profile' : 'Edit Profile'}
        </h3>
        <button
          onClick={onClose}
          className="text-white/50 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Name */}
        <div className="space-y-1">
          <Label className="text-xs text-white/70">Name</Label>
          <Input
            value={profile.name}
            onChange={(e) => updateField('name', e.target.value)}
            className="h-7 text-xs bg-white/5 border-white/10"
          />
        </div>

        {/* Background Color */}
        <div className="space-y-1">
          <Label className="text-xs text-white/70">Background</Label>
          <div className="flex gap-2">
            <input
              type="color"
              value={profile.backgroundColor}
              onChange={(e) => updateField('backgroundColor', e.target.value)}
              className="w-8 h-7 rounded border border-white/10 cursor-pointer"
            />
            <Input
              value={profile.backgroundColor}
              onChange={(e) => updateField('backgroundColor', e.target.value)}
              className="h-7 text-xs bg-white/5 border-white/10 flex-1"
            />
          </div>
        </div>

        {/* Text Color */}
        <div className="space-y-1">
          <Label className="text-xs text-white/70">Text Color</Label>
          <div className="flex gap-2">
            <input
              type="color"
              value={profile.textColor}
              onChange={(e) => updateField('textColor', e.target.value)}
              className="w-8 h-7 rounded border border-white/10 cursor-pointer"
            />
            <Input
              value={profile.textColor}
              onChange={(e) => updateField('textColor', e.target.value)}
              className="h-7 text-xs bg-white/5 border-white/10 flex-1"
            />
          </div>
        </div>

        {/* Opacity */}
        <div className="space-y-1">
          <Label className="text-xs text-white/70">
            Opacity: {Math.round(profile.backgroundOpacity * 100)}%
          </Label>
          <Slider
            value={[profile.backgroundOpacity * 100]}
            min={20}
            max={100}
            step={5}
            onValueChange={([v]) => updateField('backgroundOpacity', v / 100)}
            className="w-full"
          />
        </div>

        {/* Font Size */}
        <div className="space-y-1">
          <Label className="text-xs text-white/70">
            Font Size: {profile.fontSize}px
          </Label>
          <Slider
            value={[profile.fontSize]}
            min={10}
            max={24}
            step={1}
            onValueChange={([v]) => updateField('fontSize', v)}
            className="w-full"
          />
        </div>

        {/* Padding */}
        <div className="space-y-1">
          <Label className="text-xs text-white/70">
            Padding: {profile.padding}px
          </Label>
          <Slider
            value={[profile.padding]}
            min={4}
            max={32}
            step={4}
            onValueChange={([v]) => updateField('padding', v)}
            className="w-full"
          />
        </div>

        {/* Font Family */}
        <div className="space-y-1">
          <Label className="text-xs text-white/70">Font</Label>
          <Select
            value={profile.fontFamily}
            onValueChange={(v) => updateField('fontFamily', v)}
          >
            <SelectTrigger className="h-7 text-xs bg-white/5 border-white/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monospace">System Mono</SelectItem>
              <SelectItem value="SF Mono, monospace">SF Mono</SelectItem>
              <SelectItem value="Menlo, monospace">Menlo</SelectItem>
              <SelectItem value="Monaco, monospace">Monaco</SelectItem>
              <SelectItem value="Consolas, monospace">Consolas</SelectItem>
              <SelectItem value="'Fira Code', monospace">Fira Code</SelectItem>
              <SelectItem value="'JetBrains Mono', monospace">JetBrains Mono</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Cursor Style */}
        <div className="space-y-1">
          <Label className="text-xs text-white/70">Cursor</Label>
          <Select
            value={profile.cursorStyle}
            onValueChange={(v) => updateField('cursorStyle', v as 'block' | 'underline' | 'bar')}
          >
            <SelectTrigger className="h-7 text-xs bg-white/5 border-white/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="block">Block</SelectItem>
              <SelectItem value="underline">Underline</SelectItem>
              <SelectItem value="bar">Bar</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between mt-4">
        {onDelete && !isNew && (
          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
            className="h-7 text-xs"
          >
            Delete Profile
          </Button>
        )}
        <div className="flex gap-2 ml-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-7 text-xs"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={onClose}
            className="h-7 text-xs"
          >
            {isNew ? 'Create' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TerminalProfileEditor;
