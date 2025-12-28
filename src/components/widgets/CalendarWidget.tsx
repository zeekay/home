import React, { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import DesktopWidget from './DesktopWidget';
import { type WidgetInstance } from '@/contexts/WidgetContext';

interface CalendarWidgetProps {
  widget: WidgetInstance;
}

interface Event {
  id: string;
  title: string;
  time: string;
  color: string;
}

const SAMPLE_EVENTS: Event[] = [
  { id: '1', title: 'Team Standup', time: '9:00 AM', color: 'bg-blue-500' },
  { id: '2', title: 'Design Review', time: '11:00 AM', color: 'bg-purple-500' },
  { id: '3', title: 'Lunch with Alex', time: '12:30 PM', color: 'bg-green-500' },
  { id: '4', title: 'Product Planning', time: '2:00 PM', color: 'bg-orange-500' },
  { id: '5', title: 'Code Review', time: '4:00 PM', color: 'bg-red-500' },
];

const CalendarWidget: React.FC<CalendarWidgetProps> = ({ widget }) => {
  const [currentDate] = useState(new Date());
  const isSmall = widget.size === 'small';
  const isLarge = widget.size === 'large';

  const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long' });
  const dayNumber = currentDate.getDate();

  // Generate mini calendar for large size
  const miniCalendar = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    
    return days;
  }, [currentDate]);

  if (isSmall) {
    return (
      <DesktopWidget widget={widget}>
        <div className="flex flex-col items-center justify-center h-full p-4">
          <p className="text-red-500 text-xs font-semibold uppercase">{dayName}</p>
          <p className="text-white text-6xl font-light">{dayNumber}</p>
          <p className="text-white/60 text-sm">{monthName}</p>
        </div>
      </DesktopWidget>
    );
  }

  return (
    <DesktopWidget widget={widget}>
      <div className="flex flex-col h-full p-4">
        {/* Header */}
        <div className="text-center mb-3">
          <p className="text-red-500 text-xs font-semibold uppercase">{dayName}</p>
          <p className="text-white text-4xl font-light">{dayNumber}</p>
          <p className="text-white/60 text-sm">{monthName}</p>
        </div>

        {isLarge && (
          <>
            {/* Mini calendar */}
            <div className="mb-4">
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <span key={i} className="text-white/40">{d}</span>
                ))}
                {miniCalendar.map((day, i) => (
                  <span
                    key={i}
                    className={cn(
                      'py-0.5',
                      day === dayNumber && 'bg-red-500 rounded-full text-white',
                      day && day !== dayNumber && 'text-white/70',
                    )}
                  >
                    {day || ''}
                  </span>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-white/10 my-2" />
          </>
        )}

        {/* Events */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {SAMPLE_EVENTS.slice(0, isLarge ? 5 : 3).map(event => (
            <div key={event.id} className="flex items-center gap-2">
              <div className={cn('w-1 h-8 rounded-full', event.color)} />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm truncate">{event.title}</p>
                <p className="text-white/50 text-xs">{event.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DesktopWidget>
  );
};

export default CalendarWidget;
