import React, { useState } from 'react';
import ZWindow from './ZWindow';
import ProfileTab from './system-preferences/ProfileTab';
import InterestsTab from './system-preferences/InterestsTab';
import CategoryTab from './system-preferences/CategoryTab';
import DisplaySettingsTab from './system-preferences/DisplaySettingsTab';
import AppearanceTab from './system-preferences/AppearanceTab';
import DockSettingsTab from './system-preferences/DockSettingsTab';
import AccessibilityTab from './system-preferences/AccessibilityTab';
import UsersTab from './system-preferences/UsersTab';
import {
  interests,
  technologyItems,
  computingItems,
  securityItems,
  artsItems
} from './system-preferences/interestsData';
import SystemPreferencesSidebar from './system-preferences/SystemPreferencesSidebar';

interface ZSystemPreferencesWindowProps {
  onClose: () => void;
  onFocus?: () => void;
  // Display settings
  theme: string;
  customBgUrl: string;
  onThemeChange: (theme: string) => void;
  onCustomBgUrlChange: (url: string) => void;
  // Appearance settings
  colorScheme: 'dark' | 'light' | 'auto';
  windowTransparency: number;
  fontSize: 'small' | 'medium' | 'large';
  onColorSchemeChange: (scheme: 'dark' | 'light' | 'auto') => void;
  onWindowTransparencyChange: (value: number) => void;
  onFontSizeChange: (size: 'small' | 'medium' | 'large') => void;
  // Dock settings
  dockPosition: 'bottom' | 'left' | 'right';
  dockSize: number;
  dockMagnification: boolean;
  dockMagnificationSize: number;
  dockAutoHide: boolean;
  onDockPositionChange: (position: 'bottom' | 'left' | 'right') => void;
  onDockSizeChange: (size: number) => void;
  onDockMagnificationChange: (enabled: boolean) => void;
  onDockMagnificationSizeChange: (size: number) => void;
  onDockAutoHideChange: (autoHide: boolean) => void;
}

const ZSystemPreferencesWindow: React.FC<ZSystemPreferencesWindowProps> = ({
  onClose,
  onFocus,
  // Display
  theme,
  customBgUrl,
  onThemeChange,
  onCustomBgUrlChange,
  // Appearance
  colorScheme,
  windowTransparency,
  fontSize,
  onColorSchemeChange,
  onWindowTransparencyChange,
  onFontSizeChange,
  // Dock
  dockPosition,
  dockSize,
  dockMagnification,
  dockMagnificationSize,
  dockAutoHide,
  onDockPositionChange,
  onDockSizeChange,
  onDockMagnificationChange,
  onDockMagnificationSizeChange,
  onDockAutoHideChange
}) => {
  const [activeTab, setActiveTab] = useState("display");

  // Content wrapper style based on active tab
  const contentClass = "bg-white dark:bg-gray-900 rounded-md p-6 flex-1 border border-gray-200 dark:border-gray-700 h-full overflow-y-auto";

  return (
    <ZWindow
      title="System Preferences"
      onClose={onClose}
      onFocus={onFocus}
      initialPosition={{ x: 150, y: 80 }}
      initialSize={{ width: 820, height: 580 }}
      windowType="default"
      className="z-50"
    >
      <div className="flex h-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
        {/* Left sidebar */}
        <SystemPreferencesSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Content area */}
        <div className="flex-1 p-4 overflow-auto">
          {/* System Settings Tabs */}
          {activeTab === 'display' && (
            <div className={contentClass}>
              <DisplaySettingsTab
                theme={theme}
                customBgUrl={customBgUrl}
                onThemeChange={onThemeChange}
                onCustomBgUrlChange={onCustomBgUrlChange}
              />
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className={contentClass}>
              <AppearanceTab
                colorScheme={colorScheme}
                windowTransparency={windowTransparency}
                fontSize={fontSize}
                onColorSchemeChange={onColorSchemeChange}
                onWindowTransparencyChange={onWindowTransparencyChange}
                onFontSizeChange={onFontSizeChange}
              />
            </div>
          )}

          {activeTab === 'dock' && (
            <div className={contentClass}>
              <DockSettingsTab
                dockPosition={dockPosition}
                dockSize={dockSize}
                dockMagnification={dockMagnification}
                dockMagnificationSize={dockMagnificationSize}
                dockAutoHide={dockAutoHide}
                onDockPositionChange={onDockPositionChange}
                onDockSizeChange={onDockSizeChange}
                onDockMagnificationChange={onDockMagnificationChange}
                onDockMagnificationSizeChange={onDockMagnificationSizeChange}
                onDockAutoHideChange={onDockAutoHideChange}
              />
            </div>
          )}

          {activeTab === 'accessibility' && (
            <div className={contentClass}>
              <AccessibilityTab />
            </div>
          )}

          {activeTab === 'users' && (
            <div className={contentClass}>
              <UsersTab />
            </div>
          )}

          {/* Personal Settings Tabs */}
          {activeTab === 'profile' && (
            <div className={contentClass}>
              <ProfileTab />
            </div>
          )}

          {activeTab === 'interests' && (
            <div className={contentClass}>
              <InterestsTab interests={interests} />
            </div>
          )}

          {activeTab === 'technology' && (
            <div className={contentClass}>
              <CategoryTab title="Technology Interests" color="blue" items={technologyItems} />
            </div>
          )}

          {activeTab === 'computing' && (
            <div className={contentClass}>
              <CategoryTab title="Computing & Advanced Technologies" color="purple" items={computingItems} />
            </div>
          )}

          {activeTab === 'security' && (
            <div className={contentClass}>
              <CategoryTab title="Security & Privacy" color="green" items={securityItems} />
            </div>
          )}

          {activeTab === 'arts' && (
            <div className={contentClass}>
              <CategoryTab title="Arts & Literature" color="orange" items={artsItems} />
            </div>
          )}
        </div>
      </div>
    </ZWindow>
  );
};

export default ZSystemPreferencesWindow;
