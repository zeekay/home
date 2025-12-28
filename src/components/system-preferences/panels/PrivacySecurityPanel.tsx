import React, { useState } from 'react';
import {
  Shield, MapPin, Users, Calendar, Image, Camera, Mic,
  BarChart3, Lock, Flame, Check, X
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import type { PrivacySecuritySettings } from '@/hooks/useSystemPreferences';

interface PrivacySecurityPanelProps {
  settings: PrivacySecuritySettings;
  onUpdate: (updates: Partial<PrivacySecuritySettings>) => void;
}

type PrivacyCategory = 'location' | 'contacts' | 'calendars' | 'photos' | 'camera' | 'microphone' | 'analytics' | 'security';

const categoryInfo: Record<PrivacyCategory, { icon: React.ElementType; name: string; description: string }> = {
  location: { icon: MapPin, name: 'Location Services', description: 'Allow apps to request your location' },
  contacts: { icon: Users, name: 'Contacts', description: 'Apps that have requested access to your contacts' },
  calendars: { icon: Calendar, name: 'Calendars', description: 'Apps that have requested access to your calendars' },
  photos: { icon: Image, name: 'Photos', description: 'Apps that have requested access to your photos' },
  camera: { icon: Camera, name: 'Camera', description: 'Apps that have requested access to your camera' },
  microphone: { icon: Mic, name: 'Microphone', description: 'Apps that have requested access to your microphone' },
  analytics: { icon: BarChart3, name: 'Analytics & Improvements', description: 'Share usage data to help improve products' },
  security: { icon: Lock, name: 'Security', description: 'FileVault, Firewall, and other security settings' },
};

const mockApps = [
  { id: 'safari', name: 'Safari' },
  { id: 'maps', name: 'Maps' },
  { id: 'weather', name: 'Weather' },
  { id: 'calendar', name: 'Calendar' },
  { id: 'messages', name: 'Messages' },
  { id: 'facetime', name: 'FaceTime' },
  { id: 'photos', name: 'Photos' },
];

const PrivacySecurityPanel: React.FC<PrivacySecurityPanelProps> = ({ settings, onUpdate }) => {
  const [selectedCategory, setSelectedCategory] = useState<PrivacyCategory>('location');

  const renderCategoryContent = () => {
    switch (selectedCategory) {
      case 'location':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Location Services
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Allow apps and websites to request your location
                </p>
              </div>
              <Switch
                checked={settings.locationServices}
                onCheckedChange={(checked) => onUpdate({ locationServices: checked })}
              />
            </div>

            {settings.locationServices && (
              <>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Apps that have requested location access:
                  </p>
                  <div className="space-y-2">
                    {mockApps.slice(0, 4).map((app) => (
                      <div
                        key={app.id}
                        className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg"
                      >
                        <span className="text-sm text-gray-700 dark:text-gray-300">{app.name}</span>
                        <select
                          className="text-sm px-2 py-1 rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800"
                          defaultValue="whileUsing"
                        >
                          <option value="never">Never</option>
                          <option value="askNextTime">Ask Next Time</option>
                          <option value="whileUsing">While Using</option>
                          <option value="always">Always</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        );

      case 'contacts':
      case 'calendars':
      case 'photos':
      case 'camera':
      case 'microphone':
        const accessKey = `${selectedCategory}Apps` as keyof PrivacySecuritySettings;
        const currentApps = (settings[accessKey] as string[]) || [];

        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Apps that have requested {categoryInfo[selectedCategory].name.toLowerCase()} access:
            </p>
            <div className="space-y-2">
              {mockApps.map((app) => {
                const hasAccess = currentApps.includes(app.id);
                return (
                  <div
                    key={app.id}
                    className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg"
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300">{app.name}</span>
                    <Switch
                      checked={hasAccess}
                      onCheckedChange={(checked) => {
                        const newApps = checked
                          ? [...currentApps, app.id]
                          : currentApps.filter((id) => id !== app.id);
                        onUpdate({ [accessKey]: newApps });
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Share Mac Analytics
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Help improve zOS by sending anonymous usage data
                </p>
              </div>
              <Switch
                checked={settings.shareAnalytics}
                onCheckedChange={(checked) => onUpdate({ shareAnalytics: checked })}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Share with App Developers
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Share crash data and usage information with app developers
                </p>
              </div>
              <Switch
                checked={settings.shareWithAppDevelopers}
                onCheckedChange={(checked) => onUpdate({ shareWithAppDevelopers: checked })}
              />
            </div>

            <Separator />

            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                What data is collected?
              </h4>
              <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <li>- Usage patterns and app interactions</li>
                <li>- Performance metrics and crash reports</li>
                <li>- Hardware and software configuration</li>
                <li>- No personal data or content is collected</li>
              </ul>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-4">
            {/* FileVault */}
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-green-500" />
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    FileVault
                  </h4>
                </div>
                <div className={`flex items-center gap-1 text-xs ${settings.filevaultEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                  {settings.filevaultEnabled ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  {settings.filevaultEnabled ? 'On' : 'Off'}
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                FileVault encrypts your disk to protect your data
              </p>
              <Switch
                checked={settings.filevaultEnabled}
                onCheckedChange={(checked) => onUpdate({ filevaultEnabled: checked })}
              />
            </div>

            {/* Firewall */}
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Firewall
                  </h4>
                </div>
                <div className={`flex items-center gap-1 text-xs ${settings.firewallEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                  {settings.firewallEnabled ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  {settings.firewallEnabled ? 'On' : 'Off'}
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Firewall blocks unwanted incoming network connections
              </p>
              <Switch
                checked={settings.firewallEnabled}
                onCheckedChange={(checked) => onUpdate({ firewallEnabled: checked })}
              />
            </div>

            <Separator />

            {/* App Store Apps */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Allow apps from App Store
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Only run apps downloaded from the App Store
                </p>
              </div>
              <Switch
                checked={settings.allowAppStoreApps}
                onCheckedChange={(checked) => onUpdate({ allowAppStoreApps: checked })}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="w-6 h-6 text-blue-500" />
        <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100">Privacy & Security</h2>
      </div>

      <Separator />

      <div className="flex gap-4">
        {/* Category List */}
        <div className="w-1/3 space-y-1">
          {(Object.keys(categoryInfo) as PrivacyCategory[]).map((category) => {
            const info = categoryInfo[category];
            const Icon = info.icon;

            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                  ${selectedCategory === category
                    ? 'bg-blue-500 text-white'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'}
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{info.name}</span>
              </button>
            );
          })}
        </div>

        {/* Category Content */}
        <div className="flex-1 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {categoryInfo[selectedCategory].name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {categoryInfo[selectedCategory].description}
            </p>
          </div>

          <Separator className="mb-4" />

          {renderCategoryContent()}
        </div>
      </div>
    </div>
  );
};

export default PrivacySecurityPanel;
