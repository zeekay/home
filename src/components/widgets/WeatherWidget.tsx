import React, { useState, useEffect, useCallback } from 'react';
import { Sun, Cloud, CloudRain, CloudSnow, CloudFog, CloudLightning, Loader2 } from 'lucide-react';
import DesktopWidget from './DesktopWidget';
import { type WidgetInstance } from '@/contexts/WidgetContext';

interface WeatherWidgetProps {
  widget: WidgetInstance;
}

interface WeatherData {
  temp: number;
  condition: string;
  high: number;
  low: number;
  city: string;
}

const STORAGE_KEY = 'zos-weather-location';

const getConditionFromWMO = (code: number): string => {
  if (code === 0) return 'sunny';
  if (code <= 3) return 'cloudy';
  if (code <= 49) return 'foggy';
  if (code <= 69) return 'rainy';
  if (code <= 79) return 'snowy';
  if (code <= 82) return 'rainy';
  if (code <= 86) return 'snowy';
  if (code <= 99) return 'stormy';
  return 'cloudy';
};

const getWeatherIcon = (condition: string, size: 'sm' | 'lg' = 'lg') => {
  const sizeClass = size === 'sm' ? 'w-6 h-6' : 'w-12 h-12';
  switch (condition) {
    case 'sunny': return <Sun className={`${sizeClass} text-yellow-400`} />;
    case 'cloudy': return <Cloud className={`${sizeClass} text-gray-300`} />;
    case 'rainy': return <CloudRain className={`${sizeClass} text-blue-400`} />;
    case 'snowy': return <CloudSnow className={`${sizeClass} text-blue-200`} />;
    case 'foggy': return <CloudFog className={`${sizeClass} text-gray-400`} />;
    case 'stormy': return <CloudLightning className={`${sizeClass} text-yellow-300`} />;
    default: return <Cloud className={`${sizeClass} text-gray-300`} />;
  }
};

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ widget }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const isSmall = widget.size === 'small';
  const isLarge = widget.size === 'large';

  const fetchWeather = useCallback(async (lat: number, lon: number, cityName: string) => {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        `&current=temperature_2m,weather_code` +
        `&daily=temperature_2m_max,temperature_2m_min` +
        `&temperature_unit=fahrenheit&timezone=auto`
      );
      
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      
      setWeather({
        temp: Math.round(data.current.temperature_2m),
        condition: getConditionFromWMO(data.current.weather_code),
        high: Math.round(data.daily.temperature_2m_max[0]),
        low: Math.round(data.daily.temperature_2m_min[0]),
        city: cityName,
      });
    } catch {
      setWeather({
        temp: 72,
        condition: 'sunny',
        high: 78,
        low: 65,
        city: 'Unknown',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadWeather = async () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const location = JSON.parse(saved);
          await fetchWeather(location.latitude, location.longitude, location.name);
          return;
        }
      } catch { /* use geolocation */ }
      
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            await fetchWeather(position.coords.latitude, position.coords.longitude, 'Current Location');
          },
          () => {
            // Default to San Francisco
            fetchWeather(37.7749, -122.4194, 'San Francisco');
          }
        );
      } else {
        fetchWeather(37.7749, -122.4194, 'San Francisco');
      }
    };
    
    loadWeather();
  }, [fetchWeather]);

  if (loading) {
    return (
      <DesktopWidget widget={widget}>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 text-white/60 animate-spin" />
        </div>
      </DesktopWidget>
    );
  }

  if (!weather) return null;

  if (isSmall) {
    return (
      <DesktopWidget widget={widget}>
        <div className="flex flex-col items-center justify-center h-full p-4">
          {getWeatherIcon(weather.condition, 'lg')}
          <p className="text-white text-3xl font-light mt-2">{weather.temp}°</p>
          <p className="text-white/60 text-xs mt-1 truncate max-w-full">{weather.city}</p>
        </div>
      </DesktopWidget>
    );
  }

  return (
    <DesktopWidget widget={widget}>
      <div className="flex flex-col h-full p-4">
        <p className="text-white/70 text-sm truncate">{weather.city}</p>
        
        <div className="flex-1 flex flex-col items-center justify-center">
          {getWeatherIcon(weather.condition, 'lg')}
          <p className="text-white text-5xl font-light mt-2">{weather.temp}°</p>
          <p className="text-white/70 text-sm capitalize mt-1">{weather.condition}</p>
        </div>
        
        <div className="flex justify-center gap-6 text-sm">
          <span className="text-white/60">H: {weather.high}°</span>
          <span className="text-white/60">L: {weather.low}°</span>
        </div>

        {isLarge && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-white/50 text-xs text-center">
              Feels like {weather.temp - 2}° - {weather.temp + 2}°
            </p>
          </div>
        )}
      </div>
    </DesktopWidget>
  );
};

export default WeatherWidget;
