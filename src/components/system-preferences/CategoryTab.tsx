
import React from 'react';

interface CategoryTabProps {
  title: string;
  color: string;
  items: Array<{
    title: string;
    description: string;
  }>;
}

const CategoryTab: React.FC<CategoryTabProps> = ({ title, color, items }) => {
  return (
    <>
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className={`border-l-4 border-${color}-500 pl-4 py-2`}>
            <h3 className="font-medium">{item.title}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{item.description}</p>
          </div>
        ))}
      </div>
    </>
  );
};

export default CategoryTab;
