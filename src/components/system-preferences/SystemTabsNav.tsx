
import React from 'react';
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Heart, 
  Code, 
  Cpu, 
  Shield, 
  Music
} from 'lucide-react';

interface SystemTabsNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const SystemTabsNav: React.FC<SystemTabsNavProps> = ({ }) => {
  return (
    <div className="grid grid-cols-6 gap-2 mb-4">
      <TabsList className="grid grid-cols-6 gap-2">
        <TabsTrigger value="profile" className="flex flex-col items-center p-2">
          <User className="w-6 h-6 mb-1" />
          <span className="text-xs">Profile</span>
        </TabsTrigger>
        <TabsTrigger value="interests" className="flex flex-col items-center p-2">
          <Heart className="w-6 h-6 mb-1" />
          <span className="text-xs">Interests</span>
        </TabsTrigger>
        <TabsTrigger value="technology" className="flex flex-col items-center p-2">
          <Code className="w-6 h-6 mb-1" />
          <span className="text-xs">Tech</span>
        </TabsTrigger>
        <TabsTrigger value="computing" className="flex flex-col items-center p-2">
          <Cpu className="w-6 h-6 mb-1" />
          <span className="text-xs">Computing</span>
        </TabsTrigger>
        <TabsTrigger value="security" className="flex flex-col items-center p-2">
          <Shield className="w-6 h-6 mb-1" />
          <span className="text-xs">Security</span>
        </TabsTrigger>
        <TabsTrigger value="arts" className="flex flex-col items-center p-2">
          <Music className="w-6 h-6 mb-1" />
          <span className="text-xs">Arts</span>
        </TabsTrigger>
      </TabsList>
    </div>
  );
};

export default SystemTabsNav;
