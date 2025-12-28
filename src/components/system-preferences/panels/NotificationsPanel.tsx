import React, { useState } from 'react';
import { Bell, BellOff, Clock, Eye, MessageSquare, Calendar, Mail, Folder, Globe } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { NotificationSettings, NotificationAppSettings } from '@/hooks/useSystemPreferences';

interface NotificationsPanelProps {
  settings: NotificationSettings;
  onUpdate: (updates: Partial<NotificationSettings>) => void;
}

const appIcons: Record<string, React.ElementType> = {
  calendar: Calendar,
  messages: MessageSquare,
  mail: Mail,
  finder: Folder,
  safari: Globe,
};

const appNames: Record<string, string> = {
  calendar: 'Calendar',
  messages: 'Messages',
  mail: 'Mail',
  finder: 'Finder',
  safari: 'Safari',
};

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ settings, onUpdate }) => {
  const [selectedApp, setSelectedApp] = useState<string | null>(null);

  const updateAppSetting = (appId: string, updates: Partial<NotificationAppSettings>) => {
    const newApps = settings.apps.map((app) =>
      app.appId === appId ? { ...app, ...updates } : app
    );
    onUpdate({ apps: newApps });
  };

  const selectedAppSettings = selectedApp
    ? settings.apps.find((a) => a.appId === selectedApp)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Bell className="w-6 h-6 text-red-500" />
        <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100">Notifications</h2>
      </div>

      <Separator />

      {/* Global Settings */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Notification Previews</h3>
        <Select
          value={settings.showPreviews}
          onValueChange={(value) => onUpdate({ showPreviews: value as NotificationSettings['showPreviews'] })}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="always">Always</SelectItem>
            <SelectItem value="whenUnlocked">When Unlocked</SelectItem>
            <SelectItem value="never">Never</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Show message content in notifications
        </p>
      </div>

      <Separator />

      {/* Do Not Disturb */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BellOff className="w-4 h-4 text-purple-500" />
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Do Not Disturb</h3>
          </div>
          <Switch
            checked={settings.doNotDisturb}
            onCheckedChange={(checked) => onUpdate({ doNotDisturb: checked })}
          />
        </div>

        {settings.doNotDisturb && (
          <div className="pl-6 space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Schedule</span>
              <Switch
                checked={settings.dndSchedule}
                onCheckedChange={(checked) => onUpdate({ dndSchedule: checked })}
              />
            </div>

            {settings.dndSchedule && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 dark:text-gray-400">From</label>
                  <input
                    type="time"
                    value={settings.dndFrom}
                    onChange={(e) => onUpdate({ dndFrom: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 dark:text-gray-400">To</label>
                  <input
                    type="time"
                    value={settings.dndTo}
                    onChange={(e) => onUpdate({ dndTo: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                  />
                </div>
              </div>
            )}

            <Separator />

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Allow calls from contacts</span>
              <Switch
                checked={settings.dndAllowCalls}
                onCheckedChange={(checked) => onUpdate({ dndAllowCalls: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Allow repeated calls</span>
              <Switch
                checked={settings.dndAllowRepeatedCalls}
                onCheckedChange={(checked) => onUpdate({ dndAllowRepeatedCalls: checked })}
              />
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* App Notifications */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Application Notifications</h3>

        <div className="flex gap-4">
          {/* App List */}
          <div className="w-1/3 space-y-1 max-h-64 overflow-y-auto">
            {settings.apps.map((app) => {
              const Icon = appIcons[app.appId] || Bell;
              return (
                <button
                  key={app.appId}
                  onClick={() => setSelectedApp(app.appId)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                    ${selectedApp === app.appId
                      ? 'bg-blue-500 text-white'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'}
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm">{appNames[app.appId] || app.appId}</span>
                  {!app.enabled && (
                    <BellOff className="w-3 h-3 ml-auto opacity-50" />
                  )}
                </button>
              );
            })}
          </div>

          {/* App Settings */}
          <div className="flex-1 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            {selectedAppSettings ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {appNames[selectedAppSettings.appId]}
                  </h4>
                  <Switch
                    checked={selectedAppSettings.enabled}
                    onCheckedChange={(checked) =>
                      updateAppSetting(selectedAppSettings.appId, { enabled: checked })
                    }
                  />
                </div>

                {selectedAppSettings.enabled && (
                  <>
                    <Separator />

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Show banners</span>
                        <Switch
                          checked={selectedAppSettings.banners}
                          onCheckedChange={(checked) =>
                            updateAppSetting(selectedAppSettings.appId, { banners: checked })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Play sounds</span>
                        <Switch
                          checked={selectedAppSettings.sounds}
                          onCheckedChange={(checked) =>
                            updateAppSetting(selectedAppSettings.appId, { sounds: checked })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Show badges</span>
                        <Switch
                          checked={selectedAppSettings.badges}
                          onCheckedChange={(checked) =>
                            updateAppSetting(selectedAppSettings.appId, { badges: checked })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Show in Notification Center
                        </span>
                        <Switch
                          checked={selectedAppSettings.showInNotificationCenter}
                          onCheckedChange={(checked) =>
                            updateAppSetting(selectedAppSettings.appId, {
                              showInNotificationCenter: checked,
                            })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Show on Lock Screen
                        </span>
                        <Switch
                          checked={selectedAppSettings.showOnLockScreen}
                          onCheckedChange={(checked) =>
                            updateAppSetting(selectedAppSettings.appId, {
                              showOnLockScreen: checked,
                            })
                          }
                        />
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Notification Grouping
                        </span>
                        <Select
                          value={selectedAppSettings.grouping}
                          onValueChange={(value) =>
                            updateAppSetting(selectedAppSettings.appId, {
                              grouping: value as NotificationAppSettings['grouping'],
                            })
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="automatic">Automatic</SelectItem>
                            <SelectItem value="byApp">By App</SelectItem>
                            <SelectItem value="off">Off</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Select an app to configure notifications</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPanel;
