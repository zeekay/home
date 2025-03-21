
import React from 'react';

interface CustomImageBackgroundProps {
  imageUrl: string;
}

const CustomImageBackground: React.FC<CustomImageBackgroundProps> = ({ imageUrl }) => {
  return (
    <div 
      className="absolute inset-0 w-full h-full bg-cover bg-center"
      style={{ backgroundImage: `url(${imageUrl})` }}
    />
  );
};

export default CustomImageBackground;
