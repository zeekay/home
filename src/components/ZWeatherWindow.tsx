import React, { useState, useEffect, useCallback } from 'react';
import ZWindow from './ZWindow';
import { logger } from '@/lib/logger';
import { Sun, Cloud, CloudRain, CloudSnow, Wind, Droplets, Eye, Gauge, MapPin, Loader2, RefreshCw, CloudFog, CloudLightning, Cloudy } from 'lucide-react';

interface ZWeatherWindowProps {
  onClose: () => void;
}

interface WeatherData {
  city: string;
  country: string;
  temp: number;
  high: number;
  low: number;
  condition: string;
  humidity: number;
  wind: number;
  visibility: number;
  pressure: number;
  hourly: { time: string; temp: number; condition: string }[];
  daily: { day: string; high: number; low: number; condition: string }[];
}

interface GeoLocation {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

const STORAGE_KEY = 'zos-weather-location';

// Map WMO weather codes to conditions
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
    case 'foggy':
      return <CloudFog className={`${sizeClass} text-gray-400`} />;
    case 'stormy':
      return <CloudLightning className={`${sizeClass} text-yellow-300`} />;
    default:
      return <Cloudy className={`${sizeClass} text-gray-300`} />;
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
    case 'foggy':
      return 'from-gray-300 via-gray-400 to-gray-500';
    case 'stormy':
      return 'from-gray-600 via-gray-700 to-gray-800';
    default:
      return 'from-blue-400 via-blue-500 to-blue-600';
  }
};

const getDayName = (dateStr: string, index: number): string => {
  if (index === 0) return 'Today';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

const formatHour = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  if (Math.abs(date.getTime() - now.getTime()) < 30 * 60 * 1000) return 'Now';
  return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
};

const ZWeatherWindow: React.FC<ZWeatherWindowProps> = ({ onClose }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeoLocation[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [location, setLocation] = useState<GeoLocation | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // localStorage unavailable or corrupted - use defaults
    }
    return null;
  });

  // Fetch weather data from Open-Meteo
  const fetchWeather = useCallback(async (lat: number, lon: number, cityName: string, country: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        `&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,surface_pressure` +
        `&hourly=temperature_2m,weather_code` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
        `&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto`
      );

      if (!response.ok) throw new Error('Failed to fetch weather');

      const data = await response.json();

      // Parse current weather
      const current = data.current;
      const hourly = data.hourly;
      const daily = data.daily;

      // Get hourly forecast (next 12 hours starting from current hour)
      const currentHour = new Date().getHours();
      const hourlyForecast = [];
      for (let i = 0; i < 12; i++) {
        const hourIndex = currentHour + i;
        if (hourIndex < hourly.time.length) {
          hourlyForecast.push({
            time: formatHour(hourly.time[hourIndex]),
            temp: Math.round(hourly.temperature_2m[hourIndex]),
            condition: getConditionFromWMO(hourly.weather_code[hourIndex])
          });
        }
      }

      // Get 7-day forecast
      const dailyForecast = daily.time.slice(0, 7).map((time: string, i: number) => ({
        day: getDayName(time, i),
        high: Math.round(daily.temperature_2m_max[i]),
        low: Math.round(daily.temperature_2m_min[i]),
        condition: getConditionFromWMO(daily.weather_code[i])
      }));

      setWeather({
        city: cityName,
        country: country,
        temp: Math.round(current.temperature_2m),
        high: Math.round(daily.temperature_2m_max[0]),
        low: Math.round(daily.temperature_2m_min[0]),
        condition: getConditionFromWMO(current.weather_code),
        humidity: current.relative_humidity_2m,
        wind: Math.round(current.wind_speed_10m),
        visibility: 10, // Open-Meteo doesn't provide visibility in free tier
        pressure: Math.round(current.surface_pressure * 0.02953), // hPa to inHg
        hourly: hourlyForecast,
        daily: dailyForecast
      });
    } catch (err) {
      setError('Unable to fetch weather data');
      logger.error('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Search for cities using Open-Meteo Geocoding API
  const searchCities = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`
      );

      if (!response.ok) return;

      const data = await response.json();
      if (data.results) {
        setSearchResults(data.results.map((r: { name: string; country?: string; latitude: number; longitude: number }) => ({
          name: r.name,
          country: r.country || '',
          latitude: r.latitude,
          longitude: r.longitude
        })));
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      logger.error('Search error:', err);
    }
  }, []);

  // Get user's location on mount
  useEffect(() => {
    if (location) {
      fetchWeather(location.latitude, location.longitude, location.name, location.country);
    } else if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          // Reverse geocode to get city name
          try {
            const response = await fetch(
              `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&count=1`
            );
            const data = await response.json();
            const cityName = data.results?.[0]?.name || 'Current Location';
            const country = data.results?.[0]?.country || '';
            const newLocation = { name: cityName, country, latitude, longitude };
            setLocation(newLocation);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newLocation));
            fetchWeather(latitude, longitude, cityName, country);
          } catch {
            fetchWeather(latitude, longitude, 'Current Location', '');
          }
        },
        () => {
          // Default to San Francisco if geolocation fails
          const defaultLocation = { name: 'San Francisco', country: 'United States', latitude: 37.7749, longitude: -122.4194 };
          setLocation(defaultLocation);
          fetchWeather(37.7749, -122.4194, 'San Francisco', 'United States');
        }
      );
    } else {
      // Default to San Francisco
      const defaultLocation = { name: 'San Francisco', country: 'United States', latitude: 37.7749, longitude: -122.4194 };
      setLocation(defaultLocation);
      fetchWeather(37.7749, -122.4194, 'San Francisco', 'United States');
    }
  }, [fetchWeather, location]);

  const selectCity = (city: GeoLocation) => {
    setLocation(city);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(city));
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
    fetchWeather(city.latitude, city.longitude, city.name, city.country);
  };

  const refresh = () => {
    if (location) {
      fetchWeather(location.latitude, location.longitude, location.name, location.country);
    }
  };

  if (loading && !weather) {
    return (
      <ZWindow
        title="Weather"
        onClose={onClose}
        initialPosition={{ x: 160, y: 60 }}
        initialSize={{ width: 380, height: 580 }}
        windowType="system"
      >
        <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-blue-400 to-blue-600">
          <Loader2 className="w-12 h-12 text-white animate-spin mb-4" />
          <p className="text-white/80">Loading weather data...</p>
        </div>
      </ZWindow>
    );
  }

  if (error && !weather) {
    return (
      <ZWindow
        title="Weather"
        onClose={onClose}
        initialPosition={{ x: 160, y: 60 }}
        initialSize={{ width: 380, height: 580 }}
        windowType="system"
      >
        <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-gray-400 to-gray-600">
          <Cloud className="w-16 h-16 text-white/50 mb-4" />
          <p className="text-white/80 mb-4">{error}</p>
          <button
            onClick={refresh}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </ZWindow>
    );
  }

  if (!weather) return null;

  return (
    <ZWindow
      title="Weather"
      onClose={onClose}
      initialPosition={{ x: 160, y: 60 }}
      initialSize={{ width: 380, height: 580 }}
      windowType="system"
    >
      <div className={`flex flex-col h-full bg-gradient-to-b ${getGradient(weather.condition)}`}>
        {/* City Selector */}
        <div className="flex items-center justify-between px-4 py-3 bg-black/10">
          <div className="flex-1 relative">
            {showSearch ? (
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    searchCities(e.target.value);
                  }}
                  placeholder="Search city..."
                  className="w-full bg-white/20 text-white placeholder:text-white/50 px-3 py-1 rounded-lg outline-none"
                  autoFocus
                  onBlur={() => {
                    setTimeout(() => {
                      if (!searchResults.length) {
                        setShowSearch(false);
                        setSearchQuery('');
                      }
                    }, 200);
                  }}
                />
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 rounded-lg shadow-xl border border-white/20 overflow-hidden z-20">
                    {searchResults.map((city, i) => (
                      <button
                        key={i}
                        onClick={() => selectCity(city)}
                        className="w-full px-3 py-2 text-left text-white hover:bg-white/10 transition-colors flex items-center gap-2"
                      >
                        <MapPin className="w-4 h-4 text-white/50" />
                        <span>{city.name}</span>
                        <span className="text-white/50 text-sm">{city.country}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowSearch(true)}
                className="flex items-center gap-2 hover:bg-white/10 px-2 py-1 rounded-lg transition-colors"
              >
                <MapPin className="w-4 h-4 text-white/80" />
                <span className="text-white font-medium text-lg">{weather.city}</span>
                {weather.country && (
                  <span className="text-white/60 text-sm">{weather.country}</span>
                )}
              </button>
            )}
          </div>
          <button
            onClick={refresh}
            disabled={loading}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 text-white/80 ${loading ? 'animate-spin' : ''}`} />
          </button>
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
                    style={{ width: `${((day.high - day.low) / 50) * 100}%` }}
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
    </ZWindow>
  );
};

export default ZWeatherWindow;
