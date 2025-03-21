
import React from 'react';
import { InterestCategory } from './types';
import InterestCard from './InterestCard';
import { Separator } from "@/components/ui/separator";

interface InterestsTabProps {
  interests: InterestCategory[];
}

const InterestsTab: React.FC<InterestsTabProps> = ({ interests }) => {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100">Interests & Passions</h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Customize your profile by selecting areas that interest you
        </p>
      </div>
      
      <Separator className="my-4" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {interests.map((category, idx) => (
          <InterestCard key={idx} category={category} />
        ))}
      </div>
      
      <div className="pt-4 flex justify-end space-x-3">
        <button className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 text-sm">
          Reset to Default
        </button>
        <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm">
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default InterestsTab;
