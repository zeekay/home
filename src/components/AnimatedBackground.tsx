
import React from 'react';
import { cn } from '@/lib/utils';
import WaveAnimationCanvas from './WaveAnimationCanvas';
import CustomImageBackground from './CustomImageBackground';

interface AnimatedBackgroundProps {
  className?: string;
  theme?: string;
  customImageUrl?: string;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ 
  className,
  theme = 'wireframe',
  customImageUrl 
}) => {
  return (
    <div className={cn('absolute inset-0 w-full h-full overflow-hidden z-0', className)}>
      {(theme === 'custom' && customImageUrl) ? (
        <CustomImageBackground imageUrl={customImageUrl} />
      ) : (
        <WaveAnimationCanvas theme={theme} />
      )}
      <div className="absolute inset-0 backdrop-blur-[1px]" />
    </div>
  );
};

export default AnimatedBackground;
