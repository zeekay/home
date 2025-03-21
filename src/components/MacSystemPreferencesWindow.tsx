
import React, { useState } from 'react';
import MacWindow from './MacWindow';
import { Tabs, TabsContent } from "@/components/ui/tabs";
import SystemTabsNav from './system-preferences/SystemTabsNav';
import ProfileTab from './system-preferences/ProfileTab';
import InterestsTab from './system-preferences/InterestsTab';
import CategoryTab from './system-preferences/CategoryTab';
import { 
  interests, 
  technologyItems, 
  computingItems, 
  securityItems, 
  artsItems 
} from './system-preferences/interestsData';

interface MacSystemPreferencesWindowProps {
  onClose: () => void;
}

const MacSystemPreferencesWindow: React.FC<MacSystemPreferencesWindowProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState("profile");
  
  return (
    <MacWindow
      title="System Preferences"
      onClose={onClose}
      initialPosition={{ x: 150, y: 80 }}
      initialSize={{ width: 720, height: 540 }}
      windowType="default"
      className="z-50"
    >
      <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-800 p-4">
        <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="w-full h-full">
          <SystemTabsNav activeTab={activeTab} setActiveTab={setActiveTab} />

          <TabsContent value="profile" className="bg-white dark:bg-gray-900 rounded-md p-6 flex-1 border border-gray-200 dark:border-gray-700">
            <ProfileTab />
          </TabsContent>

          <TabsContent value="interests" className="bg-white dark:bg-gray-900 rounded-md p-6 flex-1 border border-gray-200 dark:border-gray-700">
            <InterestsTab interests={interests} />
          </TabsContent>

          <TabsContent value="technology" className="bg-white dark:bg-gray-900 rounded-md p-6 flex-1 border border-gray-200 dark:border-gray-700">
            <CategoryTab title="Technology Interests" color="blue" items={technologyItems} />
          </TabsContent>

          <TabsContent value="computing" className="bg-white dark:bg-gray-900 rounded-md p-6 flex-1 border border-gray-200 dark:border-gray-700">
            <CategoryTab title="Computing & Advanced Technologies" color="purple" items={computingItems} />
          </TabsContent>

          <TabsContent value="security" className="bg-white dark:bg-gray-900 rounded-md p-6 flex-1 border border-gray-200 dark:border-gray-700">
            <CategoryTab title="Security & Privacy" color="green" items={securityItems} />
          </TabsContent>

          <TabsContent value="arts" className="bg-white dark:bg-gray-900 rounded-md p-6 flex-1 border border-gray-200 dark:border-gray-700">
            <CategoryTab title="Arts & Literature" color="orange" items={artsItems} />
          </TabsContent>
        </Tabs>
      </div>
    </MacWindow>
  );
};

export default MacSystemPreferencesWindow;
