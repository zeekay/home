import React, { useState } from 'react';
import {
  Moon, Briefcase, User, Bed, Plus, Trash2,
  Clock, Users, AppWindow, Edit2, Check, X
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { FocusSettings, FocusMode } from '@/hooks/useSystemPreferences';

interface FocusPanelProps {
  settings: FocusSettings;
  onUpdate: (updates: Partial<FocusSettings>) => void;
}

const iconMap: Record<string, React.ElementType> = {
  Moon: Moon,
  Briefcase: Briefcase,
  User: User,
  Bed: Bed,
};

const colorMap: Record<string, string> = {
  purple: 'bg-purple-500',
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  indigo: 'bg-indigo-500',
  red: 'bg-red-500',
  orange: 'bg-orange-500',
  pink: 'bg-pink-500',
};

const availableApps = [
  { id: 'mail', name: 'Mail' },
  { id: 'calendar', name: 'Calendar' },
  { id: 'notes', name: 'Notes' },
  { id: 'messages', name: 'Messages' },
  { id: 'music', name: 'Music' },
  { id: 'photos', name: 'Photos' },
  { id: 'safari', name: 'Safari' },
  { id: 'clock', name: 'Clock' },
  { id: 'finder', name: 'Finder' },
];

const FocusPanel: React.FC<FocusPanelProps> = ({ settings, onUpdate }) => {
  const [selectedModeId, setSelectedModeId] = useState<string | null>(
    settings.focusModes[0]?.id || null
  );
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');

  const selectedMode = settings.focusModes.find((m) => m.id === selectedModeId);

  const updateMode = (modeId: string, updates: Partial<FocusMode>) => {
    const newModes = settings.focusModes.map((mode) =>
      mode.id === modeId ? { ...mode, ...updates } : mode
    );
    onUpdate({ focusModes: newModes });
  };

  const activateMode = (modeId: string | null) => {
    onUpdate({ activeFocusId: modeId });
  };

  const createNewMode = () => {
    const newMode: FocusMode = {
      id: `custom-${Date.now()}`,
      name: 'New Focus',
      icon: 'Moon',
      color: 'purple',
      enabled: true,
      silenceNotifications: false,
      allowedApps: [],
      allowedPeople: [],
    };
    onUpdate({ focusModes: [...settings.focusModes, newMode] });
    setSelectedModeId(newMode.id);
    setEditingName(true);
    setNewName(newMode.name);
  };

  const deleteMode = (modeId: string) => {
    // Don't delete default modes
    if (['dnd', 'work', 'personal', 'sleep'].includes(modeId)) return;

    const newModes = settings.focusModes.filter((m) => m.id !== modeId);
    onUpdate({ focusModes: newModes });

    if (selectedModeId === modeId) {
      setSelectedModeId(newModes[0]?.id || null);
    }

    if (settings.activeFocusId === modeId) {
      onUpdate({ activeFocusId: null });
    }
  };

  const toggleAppAllowed = (appId: string) => {
    if (!selectedMode) return;

    const isAllowed = selectedMode.allowedApps.includes(appId);
    const newAllowedApps = isAllowed
      ? selectedMode.allowedApps.filter((id) => id !== appId)
      : [...selectedMode.allowedApps, appId];

    updateMode(selectedMode.id, { allowedApps: newAllowedApps });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Moon className="w-6 h-6 text-purple-500" />
        <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100">Focus</h2>
      </div>

      <Separator />

      {/* Active Focus Status */}
      {settings.activeFocusId && (
        <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${colorMap[settings.focusModes.find((m) => m.id === settings.activeFocusId)?.color || 'purple']} flex items-center justify-center`}>
              {(() => {
                const mode = settings.focusModes.find((m) => m.id === settings.activeFocusId);
                const Icon = iconMap[mode?.icon || 'Moon'] || Moon;
                return <Icon className="w-5 h-5 text-white" />;
              })()}
            </div>
            <div>
              <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                {settings.focusModes.find((m) => m.id === settings.activeFocusId)?.name} is On
              </p>
              <p className="text-xs text-purple-600 dark:text-purple-400">
                Notifications are silenced
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => activateMode(null)}
          >
            Turn Off
          </Button>
        </div>
      )}

      {/* Focus Modes List */}
      <div className="flex gap-4">
        {/* Mode List */}
        <div className="w-1/3 space-y-2">
          {settings.focusModes.map((mode) => {
            const Icon = iconMap[mode.icon] || Moon;
            const isActive = settings.activeFocusId === mode.id;

            return (
              <button
                key={mode.id}
                onClick={() => setSelectedModeId(mode.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors
                  ${selectedModeId === mode.id
                    ? 'bg-blue-500 text-white'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'}
                `}
              >
                <div className={`w-8 h-8 rounded-full ${colorMap[mode.color]} flex items-center justify-center`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <span className="text-sm font-medium">{mode.name}</span>
                  {isActive && (
                    <span className="ml-2 text-xs opacity-75">Active</span>
                  )}
                </div>
              </button>
            );
          })}

          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={createNewMode}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Focus
          </Button>
        </div>

        {/* Mode Settings */}
        <div className="flex-1 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          {selectedMode ? (
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full ${colorMap[selectedMode.color]} flex items-center justify-center`}>
                    {(() => {
                      const Icon = iconMap[selectedMode.icon] || Moon;
                      return <Icon className="w-6 h-6 text-white" />;
                    })()}
                  </div>

                  {editingName ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="w-40"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          updateMode(selectedMode.id, { name: newName });
                          setEditingName(false);
                        }}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingName(false)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {selectedMode.name}
                      </h3>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setNewName(selectedMode.name);
                          setEditingName(true);
                        }}
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {!['dnd', 'work', 'personal', 'sleep'].includes(selectedMode.id) && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-500"
                      onClick={() => deleteMode(selectedMode.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant={settings.activeFocusId === selectedMode.id ? 'default' : 'outline'}
                    onClick={() =>
                      activateMode(
                        settings.activeFocusId === selectedMode.id ? null : selectedMode.id
                      )
                    }
                  >
                    {settings.activeFocusId === selectedMode.id ? 'Turn Off' : 'Turn On'}
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Silence Notifications */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Silence Notifications
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Hide all notification banners
                  </p>
                </div>
                <Switch
                  checked={selectedMode.silenceNotifications}
                  onCheckedChange={(checked) =>
                    updateMode(selectedMode.id, { silenceNotifications: checked })
                  }
                />
              </div>

              <Separator />

              {/* Allowed Apps */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AppWindow className="w-4 h-4 text-gray-500" />
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Allowed Apps
                  </h4>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Apps that can still send notifications during this Focus
                </p>

                <div className="grid grid-cols-3 gap-2">
                  {availableApps.map((app) => {
                    const isAllowed = selectedMode.allowedApps.includes(app.id);
                    return (
                      <button
                        key={app.id}
                        onClick={() => toggleAppAllowed(app.id)}
                        className={`
                          py-2 px-3 rounded-lg text-sm transition-colors
                          ${isAllowed
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-2 border-blue-500'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-2 border-transparent'}
                        `}
                      >
                        {app.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Schedule */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Schedule
                  </h4>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Turn on automatically
                  </span>
                  <Switch
                    checked={selectedMode.schedule?.enabled ?? false}
                    onCheckedChange={(checked) =>
                      updateMode(selectedMode.id, {
                        schedule: {
                          enabled: checked,
                          days: selectedMode.schedule?.days ?? [1, 2, 3, 4, 5],
                          from: selectedMode.schedule?.from ?? '09:00',
                          to: selectedMode.schedule?.to ?? '17:00',
                        },
                      })
                    }
                  />
                </div>

                {selectedMode.schedule?.enabled && (
                  <div className="grid grid-cols-2 gap-4 pl-4">
                    <div className="space-y-2">
                      <label className="text-xs text-gray-500 dark:text-gray-400">From</label>
                      <input
                        type="time"
                        value={selectedMode.schedule.from}
                        onChange={(e) =>
                          updateMode(selectedMode.id, {
                            schedule: { ...selectedMode.schedule!, from: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-gray-500 dark:text-gray-400">To</label>
                      <input
                        type="time"
                        value={selectedMode.schedule.to}
                        onChange={(e) =>
                          updateMode(selectedMode.id, {
                            schedule: { ...selectedMode.schedule!, to: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <Moon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Select a Focus mode to configure</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Share Across Devices */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Share Across Devices
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Sync Focus state with other devices
          </p>
        </div>
        <Switch
          checked={settings.shareAcrossDevices}
          onCheckedChange={(checked) => onUpdate({ shareAcrossDevices: checked })}
        />
      </div>
    </div>
  );
};

export default FocusPanel;
