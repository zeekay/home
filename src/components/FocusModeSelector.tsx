import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useFocusMode, FocusModeConfig } from '@/contexts/FocusModeContext';
import {
  Moon,
  Briefcase,
  User,
  BedDouble,
  Plus,
  ChevronRight,
  Clock,
  MapPin,
  Check,
  X,
  Settings,
} from 'lucide-react';

// Map icon names to components
const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Moon,
  Briefcase,
  User,
  BedDouble,
  Clock,
  MapPin,
};

const getIconComponent = (iconName: string): React.FC<{ className?: string }> => {
  return ICON_MAP[iconName] || Moon;
};

interface FocusModeSelectorProps {
  compact?: boolean; // For Control Center use
  onClose?: () => void;
  className?: string;
}

/**
 * FocusModeSelector - UI for selecting and managing focus modes
 * 
 * Can be used in:
 * - Control Center (compact mode)
 * - System Preferences (full mode)
 * - Menu bar dropdown
 */
export const FocusModeSelector: React.FC<FocusModeSelectorProps> = ({
  compact = true,
  onClose,
  className,
}) => {
  const { activeMode, modes, activateMode } = useFocusMode();
  const [showAll, setShowAll] = useState(false);

  // In compact mode, show only first 4 modes unless expanded
  const visibleModes = compact && !showAll ? modes.slice(0, 4) : modes;
  const hasMore = compact && modes.length > 4;

  const handleModeClick = (mode: FocusModeConfig) => {
    if (activeMode?.id === mode.id) {
      // Toggle off if clicking active mode
      activateMode(null);
    } else {
      activateMode(mode.id);
    }
  };

  if (compact) {
    return (
      <div className={cn('space-y-2', className)}>
        {/* Mode Grid */}
        <div className="grid grid-cols-2 gap-2">
          {visibleModes.map((mode) => {
            const Icon = getIconComponent(mode.icon);
            const isActive = activeMode?.id === mode.id;
            
            return (
              <button
                key={mode.id}
                onClick={() => handleModeClick(mode)}
                className={cn(
                  'p-3 rounded-xl text-left transition-all',
                  isActive
                    ? `${mode.color} text-white`
                    : 'bg-white/10 hover:bg-white/15 text-white/90'
                )}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium truncate">{mode.name}</span>
                </div>
                {isActive && mode.schedule?.enabled && (
                  <div className="flex items-center gap-1 mt-1 text-xs opacity-75">
                    <Clock className="w-3 h-3" />
                    <span>Scheduled</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Show More / Show Less */}
        {hasMore && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full flex items-center justify-center gap-1 py-1.5 text-xs text-white/60 hover:text-white/80 transition-colors"
          >
            <span>{showAll ? 'Show Less' : `Show ${modes.length - 4} More`}</span>
            <ChevronRight className={cn('w-3 h-3 transition-transform', showAll && 'rotate-90')} />
          </button>
        )}
      </div>
    );
  }

  // Full mode for System Preferences
  return (
    <div className={cn('space-y-4', className)}>
      {/* Active Mode Banner */}
      {activeMode && (
        <div className={cn('p-4 rounded-xl', activeMode.color)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {(() => {
                const Icon = getIconComponent(activeMode.icon);
                return <Icon className="w-6 h-6 text-white" />;
              })()}
              <div>
                <p className="text-white font-semibold">{activeMode.name}</p>
                <p className="text-white/75 text-sm">Active</p>
              </div>
            </div>
            <button
              onClick={() => activateMode(null)}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Mode List */}
      <div className="space-y-2">
        {modes.map((mode) => {
          const Icon = getIconComponent(mode.icon);
          const isActive = activeMode?.id === mode.id;
          
          return (
            <div
              key={mode.id}
              className={cn(
                'flex items-center gap-3 p-3 rounded-xl transition-all',
                isActive
                  ? `${mode.color} text-white`
                  : 'bg-white/5 hover:bg-white/10 text-white/90'
              )}
            >
              <button
                onClick={() => handleModeClick(mode)}
                className="flex-1 flex items-center gap-3 text-left"
              >
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center',
                  isActive ? 'bg-white/20' : mode.color
                )}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{mode.name}</p>
                  {mode.schedule?.enabled && (
                    <p className="text-sm opacity-75 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {mode.schedule.startTime} - {mode.schedule.endTime}
                    </p>
                  )}
                </div>
                {isActive && <Check className="w-5 h-5" />}
              </button>
              
              <button
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                onClick={() => {/* Open mode settings */}}
              >
                <Settings className="w-4 h-4 opacity-50" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Add Custom Mode */}
      <button
        className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white/80 transition-colors"
        onClick={() => {/* Open create mode dialog */}}
      >
        <Plus className="w-4 h-4" />
        <span>Add Focus Mode</span>
      </button>
    </div>
  );
};

/**
 * FocusModeIndicator - Small indicator for menu bar
 */
export const FocusModeIndicator: React.FC<{
  onClick?: () => void;
  className?: string;
}> = ({ onClick, className }) => {
  const { activeMode } = useFocusMode();

  if (!activeMode) return null;

  const Icon = getIconComponent(activeMode.icon);

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors',
        'hover:bg-white/10',
        className
      )}
      title={`Focus: ${activeMode.name}`}
    >
      <Icon className="w-3.5 h-3.5 opacity-90" />
    </button>
  );
};

/**
 * FocusModeQuickToggle - Single button to toggle between off and last mode
 */
export const FocusModeQuickToggle: React.FC<{
  className?: string;
}> = ({ className }) => {
  const { activeMode, modes, activateMode } = useFocusMode();
  
  const handleToggle = () => {
    if (activeMode) {
      activateMode(null);
    } else {
      // Activate DND by default, or first available mode
      const dnd = modes.find(m => m.id === 'dnd');
      activateMode(dnd?.id ?? modes[0]?.id ?? null);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={cn(
        'p-3 rounded-2xl text-left transition-colors flex-1',
        activeMode
          ? `${activeMode.color}`
          : 'bg-white/10 hover:bg-white/15'
      )}
    >
      <Moon className="w-5 h-5 mb-1" />
      <p className="text-sm font-semibold">Focus</p>
      <p className="text-xs opacity-70">
        {activeMode ? activeMode.name : 'Off'}
      </p>
    </button>
  );
};

export default FocusModeSelector;
