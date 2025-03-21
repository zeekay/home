
import React from 'react';
import { Tabs, TabsList } from "@/components/ui/tabs";
import { 
  User, 
  Heart, 
  Code, 
  Cpu, 
  Shield, 
  Music,
  SearchIcon
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
}

const SystemPreferencesSidebar: React.FC<SystemPreferencesSidebarProps> = ({ activeTab, setActiveTab }) => {
  // Define categories with their icons
  const categories: PreferenceCategory[] = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'interests', name: 'Interests', icon: Heart },
    { id: 'technology', name: 'Technology', icon: Code },
    { id: 'computing', name: 'Computing', icon: Cpu },
    { id: 'security', name: 'Security & Privacy', icon: Shield },
    { id: 'arts', name: 'Arts & Media', icon: Music },
  ];

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
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = activeTab === category.id;
            
            return (
              <div
                key={category.id}
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
            );
          })}
        </TabsList>
      </Tabs>
    </div>
  );
};

export default SystemPreferencesSidebar;
