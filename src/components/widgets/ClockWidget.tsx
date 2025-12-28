import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import DesktopWidget from './DesktopWidget';
import { type WidgetInstance } from '@/contexts/WidgetContext';

interface ClockWidgetProps {
  widget: WidgetInstance;
}

const ClockWidget: React.FC<ClockWidgetProps> = ({ widget }) => {
  const [time, setTime] = useState(new Date());
  const isSmall = widget.size === 'small';
  const isLarge = widget.size === 'large';

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate hand angles
  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours() % 12;
  
  const secondDeg = seconds * 6;
  const minuteDeg = minutes * 6 + seconds * 0.1;
  const hourDeg = hours * 30 + minutes * 0.5;

  // Analog clock for medium/large sizes
  const AnalogClock = () => {
    const clockSize = isLarge ? 280 : 120;
    const centerOffset = clockSize / 2;
    
    return (
      <div className="relative" style={{ width: clockSize, height: clockSize }}>
        {/* Clock face */}
        <div className="absolute inset-0 rounded-full bg-white/5 border border-white/20">
          {/* Hour markers */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className={cn(
                'absolute bg-white/80',
                isLarge ? 'w-1 h-4' : 'w-0.5 h-2'
              )}
              style={{
                left: '50%',
                top: isLarge ? '8px' : '4px',
                transform: `translateX(-50%) rotate(${i * 30}deg)`,
                transformOrigin: `50% ${centerOffset - (isLarge ? 8 : 4)}px`,
              }}
            />
          ))}
          
          {/* Center dot */}
          <div 
            className="absolute left-1/2 top-1/2 bg-orange-500 rounded-full -translate-x-1/2 -translate-y-1/2 z-10"
            style={{ width: isLarge ? 10 : 4, height: isLarge ? 10 : 4 }}
          />
          
          {/* Hour hand */}
          <div
            className="absolute left-1/2 bottom-1/2 bg-white rounded-full origin-bottom"
            style={{ 
              width: isLarge ? 4 : 2,
              height: isLarge ? 70 : 30,
              transform: `translateX(-50%) rotate(${hourDeg}deg)`,
            }}
          />
          
          {/* Minute hand */}
          <div
            className="absolute left-1/2 bottom-1/2 bg-white/80 rounded-full origin-bottom"
            style={{ 
              width: isLarge ? 3 : 1.5,
              height: isLarge ? 100 : 40,
              transform: `translateX(-50%) rotate(${minuteDeg}deg)`,
            }}
          />
          
          {/* Second hand */}
          <div
            className="absolute left-1/2 bottom-1/2 bg-orange-500 rounded-full origin-bottom"
            style={{ 
              width: isLarge ? 2 : 1,
              height: isLarge ? 110 : 45,
              transform: `translateX(-50%) rotate(${secondDeg}deg)`,
            }}
          />
        </div>
      </div>
    );
  };

  if (isSmall) {
    // Digital clock for small widget
    return (
      <DesktopWidget widget={widget}>
        <div className="flex flex-col items-center justify-center h-full p-4">
          <p className="text-white text-4xl font-light tracking-tight">
            {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
          </p>
          <p className="text-white/60 text-sm mt-1">
            {time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </p>
        </div>
      </DesktopWidget>
    );
  }

  // Analog clock for medium/large
  return (
    <DesktopWidget widget={widget}>
      <div className="flex flex-col items-center justify-center h-full p-4">
        <AnalogClock />
        {isLarge && (
          <div className="mt-4 text-center">
            <p className="text-white text-xl font-light">
              {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
            <p className="text-white/60 text-sm mt-1">
              {time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
        )}
      </div>
    </DesktopWidget>
  );
};

export default ClockWidget;
