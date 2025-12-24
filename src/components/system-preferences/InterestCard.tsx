
import React from 'react';
import { Heart } from 'lucide-react';
import { Code, Cpu, Bot, Palette, Library } from 'lucide-react';
import { InterestCategory } from './types';

interface InterestCardProps {
  category: InterestCategory;
}

const InterestCard: React.FC<InterestCardProps> = ({ category }) => {
  // Map of icon names to components
  const iconMap: Record<string, React.FC<{ className?: string }>> = {
    Code,
    Cpu,
    Bot,
    Palette,
    Library
  };
  
  // Get the appropriate icon component
  const IconComponent = iconMap[category.icon];

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-black/30 transition-colors duration-300">
      <div className="flex items-center mb-3">
        {IconComponent && <IconComponent className={`w-6 h-6 ${category.iconColor} animate-pulse`} />}
        <h3 className="ml-2 text-lg font-medium">{category.category}</h3>
      </div>
      <ul className="space-y-2">
        {category.items.map((item, itemIdx) => (
          <li key={itemIdx} className="flex items-center">
            <Heart className="w-4 h-4 text-red-500 mr-2 hover:scale-125 transition-transform" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InterestCard;
