import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Battery, BatteryCharging, BatteryFull, BatteryLow, BatteryMedium, BatteryWarning } from 'lucide-react';
import DesktopWidget from './DesktopWidget';
import { type WidgetInstance } from '@/contexts/WidgetContext';

interface BatteryWidgetProps {
  widget: WidgetInstance;
}

interface BatteryState {
  level: number;
  charging: boolean;
  chargingTime: number | null;
  dischargingTime: number | null;
}

const BatteryWidget: React.FC<BatteryWidgetProps> = ({ widget }) => {
  const [battery, setBattery] = useState<BatteryState>({
    level: 85,
    charging: false,
    chargingTime: null,
    dischargingTime: null,
  });

  useEffect(() => {
    // Try to use the Battery API if available
    const getBattery = async () => {
      try {
        // @ts-ignore - Battery API not in all type definitions
        if ('getBattery' in navigator) {
          // @ts-ignore
          const batteryManager = await navigator.getBattery();

          const updateBattery = () => {
            setBattery({
              level: Math.round(batteryManager.level * 100),
              charging: batteryManager.charging,
              chargingTime: batteryManager.chargingTime,
              dischargingTime: batteryManager.dischargingTime,
            });
          };

          updateBattery();
          batteryManager.addEventListener('levelchange', updateBattery);
          batteryManager.addEventListener('chargingchange', updateBattery);

          return () => {
            batteryManager.removeEventListener('levelchange', updateBattery);
            batteryManager.removeEventListener('chargingchange', updateBattery);
          };
        }
      } catch {
        // Battery API not available, use simulated data
      }
    };

    getBattery();
  }, []);

  const getBatteryIcon = () => {
    if (battery.charging) return BatteryCharging;
    if (battery.level >= 80) return BatteryFull;
    if (battery.level >= 50) return BatteryMedium;
    if (battery.level >= 20) return BatteryLow;
    return BatteryWarning;
  };

  const getBatteryColor = () => {
    if (battery.charging) return 'text-green-400';
    if (battery.level >= 50) return 'text-green-400';
    if (battery.level >= 20) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getTimeRemaining = () => {
    if (battery.charging && battery.chargingTime && battery.chargingTime !== Infinity) {
      const hours = Math.floor(battery.chargingTime / 3600);
      const minutes = Math.floor((battery.chargingTime % 3600) / 60);
      return `${hours}h ${minutes}m until full`;
    }
    if (!battery.charging && battery.dischargingTime && battery.dischargingTime !== Infinity) {
      const hours = Math.floor(battery.dischargingTime / 3600);
      const minutes = Math.floor((battery.dischargingTime % 3600) / 60);
      return `${hours}h ${minutes}m remaining`;
    }
    return battery.charging ? 'Charging...' : 'On Battery';
  };

  const BatteryIcon = getBatteryIcon();

  return (
    <DesktopWidget widget={widget}>
      <div className="flex flex-col items-center justify-center h-full p-4">
        {/* Battery Icon */}
        <BatteryIcon className={cn('w-12 h-12', getBatteryColor())} />

        {/* Percentage */}
        <p className="text-white text-3xl font-light mt-2">
          {battery.level}%
        </p>

        {/* Status */}
        <p className="text-white/60 text-xs mt-1 text-center">
          {getTimeRemaining()}
        </p>

        {/* Battery bar */}
        <div className="w-full mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              battery.level >= 50 ? 'bg-green-400' :
              battery.level >= 20 ? 'bg-yellow-400' : 'bg-red-400'
            )}
            style={{ width: `${battery.level}%` }}
          />
        </div>
      </div>
    </DesktopWidget>
  );
};

export default BatteryWidget;
