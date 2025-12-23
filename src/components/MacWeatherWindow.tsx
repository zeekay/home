import React, { useState } from 'react';
import MacWindow from './MacWindow';
import { Sun, Cloud, CloudRain, CloudSnow, Wind, Droplets, Eye, Gauge, MapPin, Plus } from 'lucide-react';

interface MacWeatherWindowProps {
  onClose: () => void;
}

interface WeatherData {
  city: string;
  temp: number;
  high: number;
  low: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy';
  humidity: number;
  wind: number;
  visibility: number;
  pressure: number;
  hourly: { time: string; temp: number; condition: string }[];
  daily: { day: string; high: number; low: number; condition: string }[];
}

const weatherData: Record<string, WeatherData> = {
  'San Francisco': {
    city: 'San Francisco',
    temp: 62,
    high: 68,
    low: 54,
    condition: 'cloudy',
    humidity: 72,
    wind: 12,
    visibility: 10,
    pressure: 30.1,
    hourly: [
      { time: 'Now', temp: 62, condition: 'cloudy' },
      { time: '1PM', temp: 64, condition: 'cloudy' },
      { time: '2PM', temp: 66, condition: 'sunny' },
      { time: '3PM', temp: 68, condition: 'sunny' },
      { time: '4PM', temp: 67, condition: 'sunny' },
      { time: '5PM', temp: 64, condition: 'cloudy' },
      { time: '6PM', temp: 60, condition: 'cloudy' },
    ],
    daily: [
      { day: 'Today', high: 68, low: 54, condition: 'cloudy' },
      { day: 'Tue', high: 72, low: 56, condition: 'sunny' },
      { day: 'Wed', high: 70, low: 55, condition: 'sunny' },
      { day: 'Thu', high: 65, low: 52, condition: 'rainy' },
      { day: 'Fri', high: 63, low: 50, condition: 'rainy' },
      { day: 'Sat', high: 67, low: 53, condition: 'cloudy' },
      { day: 'Sun', high: 71, low: 55, condition: 'sunny' },
    ],
  },
  'New York': {
    city: 'New York',
    temp: 78,
    high: 85,
    low: 72,
    condition: 'sunny',
    humidity: 55,
    wind: 8,
    visibility: 10,
    pressure: 30.2,
    hourly: [
      { time: 'Now', temp: 78, condition: 'sunny' },
      { time: '1PM', temp: 81, condition: 'sunny' },
      { time: '2PM', temp: 84, condition: 'sunny' },
      { time: '3PM', temp: 85, condition: 'sunny' },
      { time: '4PM', temp: 83, condition: 'cloudy' },
      { time: '5PM', temp: 80, condition: 'cloudy' },
      { time: '6PM', temp: 76, condition: 'cloudy' },
    ],
    daily: [
      { day: 'Today', high: 85, low: 72, condition: 'sunny' },
      { day: 'Tue', high: 88, low: 74, condition: 'sunny' },
      { day: 'Wed', high: 86, low: 73, condition: 'cloudy' },
      { day: 'Thu', high: 82, low: 70, condition: 'rainy' },
      { day: 'Fri', high: 79, low: 68, condition: 'rainy' },
      { day: 'Sat', high: 81, low: 69, condition: 'sunny' },
      { day: 'Sun', high: 84, low: 71, condition: 'sunny' },
    ],
  },
  'Tokyo': {
    city: 'Tokyo',
    temp: 82,
    high: 88,
    low: 76,
    condition: 'sunny',
    humidity: 68,
    wind: 5,
    visibility: 8,
    pressure: 29.9,
    hourly: [
      { time: 'Now', temp: 82, condition: 'sunny' },
      { time: '1PM', temp: 85, condition: 'sunny' },
      { time: '2PM', temp: 87, condition: 'sunny' },
      { time: '3PM', temp: 88, condition: 'sunny' },
      { time: '4PM', temp: 86, condition: 'cloudy' },
      { time: '5PM', temp: 83, condition: 'cloudy' },
      { time: '6PM', temp: 80, condition: 'cloudy' },
    ],
    daily: [
      { day: 'Today', high: 88, low: 76, condition: 'sunny' },
      { day: 'Tue', high: 86, low: 75, condition: 'cloudy' },
      { day: 'Wed', high: 84, low: 74, condition: 'rainy' },
      { day: 'Thu', high: 82, low: 73, condition: 'rainy' },
      { day: 'Fri', high: 85, low: 74, condition: 'cloudy' },
      { day: 'Sat', high: 87, low: 76, condition: 'sunny' },
      { day: 'Sun', high: 89, low: 77, condition: 'sunny' },
    ],
  },
};

const getWeatherIcon = (condition: string, size: 'sm' | 'md' | 'lg' = 'md') => {
  const sizeClass = size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-16 h-16' : 'w-8 h-8';
  switch (condition) {
    case 'sunny':
      return <Sun className={`${sizeClass} text-yellow-400`} />;
    case 'cloudy':
      return <Cloud className={`${sizeClass} text-gray-300`} />;
    case 'rainy':
      return <CloudRain className={`${sizeClass} text-blue-400`} />;
    case 'snowy':
      return <CloudSnow className={`${sizeClass} text-blue-200`} />;
    default:
      return <Sun className={`${sizeClass} text-yellow-400`} />;
  }
};

const getGradient = (condition: string) => {
  switch (condition) {
    case 'sunny':
      return 'from-blue-400 via-blue-500 to-blue-600';
    case 'cloudy':
      return 'from-gray-400 via-gray-500 to-gray-600';
    case 'rainy':
      return 'from-gray-500 via-gray-600 to-gray-700';
    case 'snowy':
      return 'from-blue-200 via-blue-300 to-blue-400';
    default:
      return 'from-blue-400 via-blue-500 to-blue-600';
  }
};

const MacWeatherWindow: React.FC<MacWeatherWindowProps> = ({ onClose }) => {
  const [selectedCity, setSelectedCity] = useState('San Francisco');
  const weather = weatherData[selectedCity];

  return (
    <MacWindow
      title="Weather"
      onClose={onClose}
      initialPosition={{ x: 160, y: 60 }}
      initialSize={{ width: 380, height: 580 }}
      windowType="system"
    >
      <div className={`flex flex-col h-full bg-gradient-to-b ${getGradient(weather.condition)}`}>
        {/* City Selector */}
        <div className="flex items-center justify-between px-4 py-3 bg-black/10">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-white/80" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-transparent text-white font-medium text-lg outline-none cursor-pointer"
            >
              {Object.keys(weatherData).map((city) => (
                <option key={city} value={city} className="bg-gray-800 text-white">
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Weather Display */}
        <div className="flex-shrink-0 text-center py-6">
          <div className="flex justify-center mb-2">
            {getWeatherIcon(weather.condition, 'lg')}
          </div>
          <p className="text-8xl font-thin text-white">{weather.temp}°</p>
          <p className="text-white/80 text-lg capitalize">{weather.condition}</p>
          <p className="text-white/60 text-sm">H:{weather.high}° L:{weather.low}°</p>
        </div>

        {/* Hourly Forecast */}
        <div className="mx-4 bg-white/10 backdrop-blur-sm rounded-xl p-3 mb-3">
          <div className="flex overflow-x-auto gap-4 pb-1">
            {weather.hourly.map((hour, index) => (
              <div key={index} className="flex flex-col items-center min-w-[50px]">
                <span className="text-white/70 text-xs mb-1">{hour.time}</span>
                {getWeatherIcon(hour.condition, 'sm')}
                <span className="text-white text-sm mt-1">{hour.temp}°</span>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Forecast */}
        <div className="mx-4 bg-white/10 backdrop-blur-sm rounded-xl p-3 mb-3 flex-1 overflow-y-auto">
          {weather.daily.map((day, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-2 border-b border-white/10 last:border-0"
            >
              <span className="text-white w-16">{day.day}</span>
              {getWeatherIcon(day.condition, 'sm')}
              <div className="flex items-center gap-4">
                <span className="text-white/50 text-sm">{day.low}°</span>
                <div className="w-20 h-1 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-300 to-orange-300 rounded-full"
                    style={{ width: `${((day.high - day.low) / 30) * 100}%` }}
                  />
                </div>
                <span className="text-white text-sm">{day.high}°</span>
              </div>
            </div>
          ))}
        </div>

        {/* Weather Details */}
        <div className="mx-4 mb-4 grid grid-cols-2 gap-2">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <div className="flex items-center gap-2 text-white/60 text-xs mb-1">
              <Droplets className="w-3 h-3" />
              HUMIDITY
            </div>
            <p className="text-white text-xl">{weather.humidity}%</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <div className="flex items-center gap-2 text-white/60 text-xs mb-1">
              <Wind className="w-3 h-3" />
              WIND
            </div>
            <p className="text-white text-xl">{weather.wind} mph</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <div className="flex items-center gap-2 text-white/60 text-xs mb-1">
              <Eye className="w-3 h-3" />
              VISIBILITY
            </div>
            <p className="text-white text-xl">{weather.visibility} mi</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <div className="flex items-center gap-2 text-white/60 text-xs mb-1">
              <Gauge className="w-3 h-3" />
              PRESSURE
            </div>
            <p className="text-white text-xl">{weather.pressure} in</p>
          </div>
        </div>
      </div>
    </MacWindow>
  );
};

export default MacWeatherWindow;
