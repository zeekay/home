import React from 'react';
import { Tabs, TabsList } from "@/components/ui/tabs";
import {
  User,
  Heart,
  Code,
  Cpu,
  Shield,
  Music,
  SearchIcon,
  Monitor,
  Palette,
  LayoutPanelLeft
} from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

interface SystemPreferencesSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

interface PreferenceCategory {
  id: string;
  name: string;
  icon: React.ElementType;
  section?: string;
}

const SystemPreferencesSidebar: React.FC<SystemPreferencesSidebarProps> = ({ activeTab, setActiveTab }) => {
  // System settings categories
  const systemCategories: PreferenceCategory[] = [
    { id: 'display', name: 'Display', icon: Monitor, section: 'System' },
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'dock', name: 'Dock', icon: LayoutPanelLeft },
  ];

  // Profile/personal categories
  const personalCategories: PreferenceCategory[] = [
    { id: 'profile', name: 'Profile', icon: User, section: 'Personal' },
    { id: 'interests', name: 'Interests', icon: Heart },
    { id: 'technology', name: 'Technology', icon: Code },
    { id: 'computing', name: 'Computing', icon: Cpu },
    { id: 'security', name: 'Security & Privacy', icon: Shield },
    { id: 'arts', name: 'Arts & Media', icon: Music },
  ];

  const renderCategory = (category: PreferenceCategory, isFirst: boolean = false) => {
    const Icon = category.icon;
    const isActive = activeTab === category.id;

    return (
      <React.Fragment key={category.id}>
        {category.section && (
          <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">
            {category.section}
          </div>
        )}
        <div
          onClick={() => setActiveTab(category.id)}
          className={`
            flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer text-sm
            ${isActive
              ? 'bg-blue-500 text-white'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'}
          `}
        >
          <Icon className="h-5 w-5" />
          <span>{category.name}</span>
        </div>
      </React.Fragment>
    );
  };

  return (
    <div className="w-[220px] bg-[#f1f1f1] dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Search bar at top */}
      <div className="p-4 pb-2">
        <div className="relative">
          <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search"
            className="pl-8 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 h-9 rounded-lg"
          />
        </div>
      </div>

      <Separator className="mx-0 my-2 bg-gray-200 dark:bg-gray-700" />

      {/* Categories list - styled to look like macOS */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        orientation="vertical"
        className="flex-1 overflow-y-auto p-2"
      >
        <TabsList className="flex flex-col h-auto bg-transparent p-0 space-y-1">
          {/* System Settings */}
          {systemCategories.map((category, index) => renderCategory(category, index === 0))}

          <Separator className="my-2 bg-gray-200 dark:bg-gray-700" />

          {/* Personal Settings */}
          {personalCategories.map((category, index) => renderCategory(category, index === 0))}
        </TabsList>
      </Tabs>

      {/* OS Version info at bottom */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center text-xs text-gray-500 dark:text-gray-400">
          <div className="font-medium">zOS</div>
          <div>Version 4.2.0</div>
          <div className="mt-1 text-[10px]">1983-2025 Zach Kelling</div>
        </div>
      </div>
    </div>
  );
};

export default SystemPreferencesSidebar;
