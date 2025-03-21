
import React from 'react';
import { Heart } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { InterestCategory } from './types';

interface InterestCardProps {
  category: InterestCategory;
}

const InterestCard: React.FC<InterestCardProps> = ({ category }) => {
  // Dynamically get the icon component from lucide-react
  const IconComponent = LucideIcons[category.icon as keyof typeof LucideIcons];

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex items-center mb-3">
        {IconComponent && <IconComponent className={`w-6 h-6 ${category.iconColor}`} />}
        <h3 className="ml-2 text-lg font-medium">{category.category}</h3>
      </div>
      <ul className="space-y-2">
        {category.items.map((item, itemIdx) => (
          <li key={itemIdx} className="flex items-center">
            <Heart className="w-4 h-4 text-red-500 mr-2" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InterestCard;
