
import React from 'react';
import { InterestCategory } from './types';
import InterestCard from './InterestCard';

interface InterestsTabProps {
  interests: InterestCategory[];
}

const InterestsTab: React.FC<InterestsTabProps> = ({ interests }) => {
  return (
    <>
      <h2 className="text-xl font-bold mb-4">Interests & Passions</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {interests.map((category, idx) => (
          <InterestCard key={idx} category={category} />
        ))}
      </div>
    </>
  );
};

export default InterestsTab;
