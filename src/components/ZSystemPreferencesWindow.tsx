import React, { useState } from 'react';
import ZWindow from './ZWindow';
import { useSystemPreferences } from '@/hooks/useSystemPreferences';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import {
  Settings, LayoutPanelLeft, Monitor, Volume2, Bell, Moon,
  Shield, Users, Keyboard, Accessibility, SearchIcon, RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Panel imports
import {
  GeneralPanel,
  DesktopDockPanel,
  DisplaysPanel,
  SoundPanel,
  NotificationsPanel,
  FocusPanel,
  PrivacySecurityPanel,
  UsersGroupsPanel,
  KeyboardPanel,
  AccessibilityPanel,
} from './system-preferences/panels';

interface ZSystemPreferencesWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

interface PreferenceCategory {
  id: string;
  name: string;
  icon: React.ElementType;
  section?: string;
  color?: string;
}

const ZSystemPreferencesWindow: React.FC<ZSystemPreferencesWindowProps> = ({
  onClose,
  onFocus,
}) => {
  const [activeTab, setActiveTab] = useState('general');
  const [searchQuery, setSearchQuery] = useState('');
  const prefs = useSystemPreferences();

  // System settings categories
  const categories: PreferenceCategory[] = [
    { id: 'general', name: 'General', icon: Settings, section: 'System', color: 'text-gray-500' },
    { id: 'desktop-dock', name: 'Desktop & Dock', icon: LayoutPanelLeft, color: 'text-orange-500' },
    { id: 'displays', name: 'Displays', icon: Monitor, color: 'text-blue-500' },
    { id: 'sound', name: 'Sound', icon: Volume2, color: 'text-pink-500' },
    { id: 'notifications', name: 'Notifications', icon: Bell, section: 'Notifications', color: 'text-red-500' },
    { id: 'focus', name: 'Focus', icon: Moon, color: 'text-purple-500' },
    { id: 'privacy-security', name: 'Privacy & Security', icon: Shield, section: 'Privacy', color: 'text-blue-600' },
    { id: 'users-groups', name: 'Users & Groups', icon: Users, section: 'Accounts', color: 'text-cyan-500' },
    { id: 'keyboard', name: 'Keyboard', icon: Keyboard, section: 'Input', color: 'text-gray-600' },
    { id: 'accessibility', name: 'Accessibility', icon: Accessibility, color: 'text-blue-500' },
  ];

  // Filter categories by search
  const filteredCategories = searchQuery
    ? categories.filter((cat) =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : categories;

  const renderSidebar = () => {
    let currentSection = '';

    return (
      <div className="w-[220px] bg-[#f1f1f1] dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
        {/* Search */}
        <div className="p-4 pb-2">
          <div className="relative">
            <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 h-9 rounded-lg"
            />
          </div>
        </div>

        <Separator className="mx-0 my-2 bg-gray-200 dark:bg-gray-700" />

        {/* Categories */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredCategories.map((category) => {
            const Icon = category.icon;
            const isActive = activeTab === category.id;
            const showSection = category.section && category.section !== currentSection;

            if (showSection) {
              currentSection = category.section!;
            }

            return (
              <React.Fragment key={category.id}>
                {showSection && (
                  <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium mt-2 first:mt-0">
                    {category.section}
                  </div>
                )}
                <button
                  onClick={() => setActiveTab(category.id)}
                  className={`
                    w-full flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors
                    ${isActive
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'}
                  `}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-white' : category.color}`} />
                  <span>{category.name}</span>
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-xs text-gray-500 hover:text-gray-700"
            onClick={() => prefs.resetToDefaults()}
          >
            <RotateCcw className="w-3 h-3 mr-2" />
            Reset All Settings
          </Button>
          <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">
            <div className="font-medium">zOS</div>
            <div>Version 4.2.0</div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    const contentClass = 'bg-white dark:bg-gray-900 rounded-lg p-6 h-full overflow-y-auto border border-gray-200 dark:border-gray-700';

    switch (activeTab) {
      case 'general':
        return (
          <div className={contentClass}>
            <GeneralPanel
              settings={prefs.general}
              onUpdate={prefs.updateGeneral}
            />
          </div>
        );

      case 'desktop-dock':
        return (
          <div className={contentClass}>
            <DesktopDockPanel
              settings={prefs.desktopDock}
              onUpdate={prefs.updateDesktopDock}
            />
          </div>
        );

      case 'displays':
        return (
          <div className={contentClass}>
            <DisplaysPanel
              settings={prefs.display}
              onUpdate={prefs.updateDisplay}
            />
          </div>
        );

      case 'sound':
        return (
          <div className={contentClass}>
            <SoundPanel
              settings={prefs.sound}
              onUpdate={prefs.updateSound}
            />
          </div>
        );

      case 'notifications':
        return (
          <div className={contentClass}>
            <NotificationsPanel
              settings={prefs.notifications}
              onUpdate={prefs.updateNotifications}
            />
          </div>
        );

      case 'focus':
        return (
          <div className={contentClass}>
            <FocusPanel
              settings={prefs.focus}
              onUpdate={prefs.updateFocus}
            />
          </div>
        );

      case 'privacy-security':
        return (
          <div className={contentClass}>
            <PrivacySecurityPanel
              settings={prefs.privacySecurity}
              onUpdate={prefs.updatePrivacySecurity}
            />
          </div>
        );

      case 'users-groups':
        return (
          <div className={contentClass}>
            <UsersGroupsPanel
              settings={prefs.users}
              onUpdate={prefs.updateUsers}
            />
          </div>
        );

      case 'keyboard':
        return (
          <div className={contentClass}>
            <KeyboardPanel
              settings={prefs.keyboard}
              onUpdate={prefs.updateKeyboard}
            />
          </div>
        );

      case 'accessibility':
        return (
          <div className={contentClass}>
            <AccessibilityPanel
              settings={prefs.accessibility}
              onUpdate={prefs.updateAccessibility}
            />
          </div>
        );

      default:
        return (
          <div className={contentClass}>
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a preference category</p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <ZWindow
      title="System Preferences"
      onClose={onClose}
      onFocus={onFocus}
      initialPosition={{ x: 150, y: 80 }}
      initialSize={{ width: 900, height: 640 }}
      windowType="default"
      className="z-50"
    >
      <div className="flex h-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
        {renderSidebar()}
        <div className="flex-1 p-4 overflow-hidden">
          {renderContent()}
        </div>
      </div>
    </ZWindow>
  );
};

export default ZSystemPreferencesWindow;
