import React, { useState, useEffect } from 'react';
import ZWindow from './ZWindow';
import { Plus, X, Globe } from 'lucide-react';

interface ZClockWindowProps {
  onClose: () => void;
}

interface WorldClock {
  id: string;
  city: string;
  timezone: string;
  offset: string;
}

const defaultClocks: WorldClock[] = [
  { id: '1', city: 'San Francisco', timezone: 'America/Los_Angeles', offset: 'PDT' },
  { id: '2', city: 'New York', timezone: 'America/New_York', offset: 'EDT' },
  { id: '3', city: 'London', timezone: 'Europe/London', offset: 'BST' },
  { id: '4', city: 'Tokyo', timezone: 'Asia/Tokyo', offset: 'JST' },
];

const availableTimezones = [
  { city: 'San Francisco', timezone: 'America/Los_Angeles' },
  { city: 'New York', timezone: 'America/New_York' },
  { city: 'Chicago', timezone: 'America/Chicago' },
  { city: 'Denver', timezone: 'America/Denver' },
  { city: 'London', timezone: 'Europe/London' },
  { city: 'Paris', timezone: 'Europe/Paris' },
  { city: 'Berlin', timezone: 'Europe/Berlin' },
  { city: 'Moscow', timezone: 'Europe/Moscow' },
  { city: 'Dubai', timezone: 'Asia/Dubai' },
  { city: 'Mumbai', timezone: 'Asia/Kolkata' },
  { city: 'Singapore', timezone: 'Asia/Singapore' },
  { city: 'Hong Kong', timezone: 'Asia/Hong_Kong' },
  { city: 'Tokyo', timezone: 'Asia/Tokyo' },
  { city: 'Sydney', timezone: 'Australia/Sydney' },
  { city: 'Auckland', timezone: 'Pacific/Auckland' },
];

const ZClockWindow: React.FC<ZClockWindowProps> = ({ onClose }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [clocks, setClocks] = useState<WorldClock[]>(defaultClocks);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<'world' | 'analog'>('world');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getTimeInTimezone = (timezone: string) => {
    return currentTime.toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const getDateInTimezone = (timezone: string) => {
    return currentTime.toLocaleDateString('en-US', {
      timeZone: timezone,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTimeDifference = (timezone: string) => {
    const localOffset = currentTime.getTimezoneOffset();
    const targetDate = new Date(currentTime.toLocaleString('en-US', { timeZone: timezone }));
    const localDate = new Date(currentTime.toLocaleString('en-US'));
    const diff = (targetDate.getTime() - localDate.getTime()) / (1000 * 60 * 60);

    if (diff === 0) return 'Same time';
    if (diff > 0) return `+${diff}h`;
    return `${diff}h`;
  };

  const addClock = (city: string, timezone: string) => {
    const newClock: WorldClock = {
      id: Date.now().toString(),
      city,
      timezone,
      offset: '',
    };
    setClocks([...clocks, newClock]);
    setShowAddMenu(false);
  };

  const removeClock = (id: string) => {
    setClocks(clocks.filter(c => c.id !== id));
  };

  // Analog clock component
  const AnalogClock = () => {
    const seconds = currentTime.getSeconds();
    const minutes = currentTime.getMinutes();
    const hours = currentTime.getHours() % 12;

    const secondDeg = seconds * 6;
    const minuteDeg = minutes * 6 + seconds * 0.1;
    const hourDeg = hours * 30 + minutes * 0.5;

    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="relative w-64 h-64">
          {/* Clock face */}
          <div className="absolute inset-0 rounded-full bg-white border-4 border-gray-800">
            {/* Hour markers */}
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-4 bg-gray-800"
                style={{
                  left: '50%',
                  top: '8px',
                  transform: `translateX(-50%) rotate(${i * 30}deg)`,
                  transformOrigin: '50% 120px',
                }}
              />
            ))}
            {/* Minute markers */}
            {[...Array(60)].map((_, i) => {
              if (i % 5 === 0) return null;
              return (
                <div
                  key={`m-${i}`}
                  className="absolute w-0.5 h-2 bg-gray-400"
                  style={{
                    left: '50%',
                    top: '8px',
                    transform: `translateX(-50%) rotate(${i * 6}deg)`,
                    transformOrigin: '50% 120px',
                  }}
                />
              );
            })}
            {/* Center dot */}
            <div className="absolute left-1/2 top-1/2 w-3 h-3 bg-gray-800 rounded-full -translate-x-1/2 -translate-y-1/2 z-10" />
            {/* Hour hand */}
            <div
              className="absolute left-1/2 bottom-1/2 w-1.5 h-16 bg-gray-800 rounded-full origin-bottom"
              style={{ transform: `translateX(-50%) rotate(${hourDeg}deg)` }}
            />
            {/* Minute hand */}
            <div
              className="absolute left-1/2 bottom-1/2 w-1 h-24 bg-gray-600 rounded-full origin-bottom"
              style={{ transform: `translateX(-50%) rotate(${minuteDeg}deg)` }}
            />
            {/* Second hand */}
            <div
              className="absolute left-1/2 bottom-1/2 w-0.5 h-28 bg-orange-500 rounded-full origin-bottom"
              style={{ transform: `translateX(-50%) rotate(${secondDeg}deg)` }}
            />
          </div>
        </div>
        <div className="mt-6 text-center">
          <p className="text-white text-3xl font-light">
            {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
          <p className="text-white/60 text-sm mt-1">
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>
    );
  };

  return (
    <ZWindow
      title="Clock"
      onClose={onClose}
      initialPosition={{ x: 180, y: 80 }}
      initialSize={{ width: 380, height: 480 }}
      windowType="system"
    >
      <div className="flex flex-col h-full bg-[#1c1c1e]">
        {/* Tabs */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab('world')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'world' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-white/60 hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4 inline mr-2" />
            World Clock
          </button>
          <button
            onClick={() => setActiveTab('analog')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'analog' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-white/60 hover:text-white'
            }`}
          >
            Analog
          </button>
        </div>

        {activeTab === 'analog' ? (
          <AnalogClock />
        ) : (
          <>
            {/* World Clocks List */}
            <div className="flex-1 overflow-y-auto">
              {clocks.map((clock) => (
                <div
                  key={clock.id}
                  className="group flex items-center justify-between px-4 py-3 border-b border-white/5 hover:bg-white/5"
                >
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-white text-lg font-medium">{clock.city}</span>
                      <span className="text-white/40 text-xs">{getTimeDifference(clock.timezone)}</span>
                    </div>
                    <p className="text-white/50 text-xs">{getDateInTimezone(clock.timezone)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-white text-2xl font-light">
                      {getTimeInTimezone(clock.timezone)}
                    </span>
                    <button
                      onClick={() => removeClock(clock.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-opacity"
                    >
                      <X className="w-4 h-4 text-white/50" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Button */}
            <div className="relative p-4 border-t border-white/10">
              <button
                onClick={() => setShowAddMenu(!showAddMenu)}
                className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add City
              </button>

              {showAddMenu && (
                <div className="absolute bottom-full left-4 right-4 mb-2 bg-[#2c2c2e] rounded-lg shadow-xl border border-white/10 max-h-48 overflow-y-auto">
                  {availableTimezones
                    .filter(tz => !clocks.some(c => c.timezone === tz.timezone))
                    .map((tz) => (
                      <button
                        key={tz.timezone}
                        onClick={() => addClock(tz.city, tz.timezone)}
                        className="w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors text-sm"
                      >
                        {tz.city}
                      </button>
                    ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </ZWindow>
  );
};

export default ZClockWindow;
