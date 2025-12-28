import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import ZWindow from './ZWindow';
import { logger } from '@/lib/logger';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sun, Cloud, CloudRain, CloudSnow, Wind, Droplets, Eye, Gauge, MapPin,
  Loader2, RefreshCw, CloudFog, CloudLightning, Cloudy, Sunrise, Sunset,
  Thermometer, Navigation, AlertTriangle, Search, X, Plus, GripVertical,
  Map, ChevronRight, Clock, Umbrella, Moon, CloudDrizzle,
  CloudHail, Snowflake, Star, Trash2, Check, MapPinned
} from 'lucide-react';

interface ZWeatherWindowProps {
  onClose: () => void;
}

interface HourlyData {
  time: string;
  temp: number;
  feelsLike: number;
  condition: string;
  precipitation: number;
  precipProbability: number;
  windSpeed: number;
  windDirection: number;
  humidity: number;
  uvIndex: number;
  visibility: number;
  isDay: boolean;
}

interface DailyData {
  date: string;
  day: string;
  high: number;
  low: number;
  condition: string;
  precipitation: number;
  precipProbability: number;
  windSpeed: number;
  uvIndex: number;
  sunrise: string;
  sunset: string;
}

interface WeatherData {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
  temp: number;
  feelsLike: number;
  high: number;
  low: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  visibility: number;
  pressure: number;
  uvIndex: number;
  dewPoint: number;
  cloudCover: number;
  sunrise: string;
  sunset: string;
  isDay: boolean;
  hourly: HourlyData[];
  daily: DailyData[];
  alerts: WeatherAlert[];
  aqi?: AirQualityData;
  lastUpdated: number;
}

interface WeatherAlert {
  event: string;
  headline: string;
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  description: string;
  start: string;
  end: string;
}

interface AirQualityData {
  aqi: number;
  category: string;
  pm25: number;
  pm10: number;
  o3: number;
  no2: number;
}

interface GeoLocation {
  id: string;
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  isCurrentLocation?: boolean;
}

interface SavedLocation extends GeoLocation {
  order: number;
}

// Storage keys
const STORAGE_KEY = 'zos-weather-locations';
const ACTIVE_LOCATION_KEY = 'zos-weather-active';
const CACHE_KEY = 'zos-weather-cache';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// WMO Weather Codes mapping
const WMO_CODES: Record<number, { condition: string; description: string }> = {
  0: { condition: 'clear', description: 'Clear sky' },
  1: { condition: 'mostly-clear', description: 'Mainly clear' },
  2: { condition: 'partly-cloudy', description: 'Partly cloudy' },
  3: { condition: 'cloudy', description: 'Overcast' },
  45: { condition: 'foggy', description: 'Fog' },
  48: { condition: 'foggy', description: 'Depositing rime fog' },
  51: { condition: 'drizzle', description: 'Light drizzle' },
  53: { condition: 'drizzle', description: 'Moderate drizzle' },
  55: { condition: 'drizzle', description: 'Dense drizzle' },
  56: { condition: 'freezing-drizzle', description: 'Freezing drizzle' },
  57: { condition: 'freezing-drizzle', description: 'Dense freezing drizzle' },
  61: { condition: 'rainy', description: 'Slight rain' },
  63: { condition: 'rainy', description: 'Moderate rain' },
  65: { condition: 'rainy', description: 'Heavy rain' },
  66: { condition: 'freezing-rain', description: 'Freezing rain' },
  67: { condition: 'freezing-rain', description: 'Heavy freezing rain' },
  71: { condition: 'snowy', description: 'Slight snow' },
  73: { condition: 'snowy', description: 'Moderate snow' },
  75: { condition: 'snowy', description: 'Heavy snow' },
  77: { condition: 'snow-grains', description: 'Snow grains' },
  80: { condition: 'showers', description: 'Slight showers' },
  81: { condition: 'showers', description: 'Moderate showers' },
  82: { condition: 'showers', description: 'Violent showers' },
  85: { condition: 'snow-showers', description: 'Slight snow showers' },
  86: { condition: 'snow-showers', description: 'Heavy snow showers' },
  95: { condition: 'stormy', description: 'Thunderstorm' },
  96: { condition: 'stormy-hail', description: 'Thunderstorm with slight hail' },
  99: { condition: 'stormy-hail', description: 'Thunderstorm with heavy hail' },
};

const getConditionFromWMO = (code: number): { condition: string; description: string } => {
  return WMO_CODES[code] || { condition: 'cloudy', description: 'Unknown' };
};

const getWeatherIcon = (condition: string, size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md', isDay: boolean = true) => {
  const sizes = {
    xs: 'w-4 h-4',
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };
  const sizeClass = sizes[size];

  const icons: Record<string, React.ReactNode> = {
    'clear': isDay
      ? <Sun className={`${sizeClass} text-yellow-400`} />
      : <Moon className={`${sizeClass} text-blue-200`} />,
    'mostly-clear': isDay
      ? <Sun className={`${sizeClass} text-yellow-300`} />
      : <Moon className={`${sizeClass} text-blue-200`} />,
    'partly-cloudy': <Cloudy className={`${sizeClass} text-gray-300`} />,
    'cloudy': <Cloud className={`${sizeClass} text-gray-400`} />,
    'foggy': <CloudFog className={`${sizeClass} text-gray-400`} />,
    'drizzle': <CloudDrizzle className={`${sizeClass} text-blue-300`} />,
    'freezing-drizzle': <CloudDrizzle className={`${sizeClass} text-blue-200`} />,
    'rainy': <CloudRain className={`${sizeClass} text-blue-400`} />,
    'freezing-rain': <CloudRain className={`${sizeClass} text-blue-200`} />,
    'snowy': <CloudSnow className={`${sizeClass} text-blue-100`} />,
    'snow-grains': <Snowflake className={`${sizeClass} text-blue-100`} />,
    'showers': <CloudRain className={`${sizeClass} text-blue-400`} />,
    'snow-showers': <CloudSnow className={`${sizeClass} text-blue-100`} />,
    'stormy': <CloudLightning className={`${sizeClass} text-yellow-300`} />,
    'stormy-hail': <CloudHail className={`${sizeClass} text-purple-300`} />,
  };

  return icons[condition] || <Cloud className={`${sizeClass} text-gray-300`} />;
};

const getGradient = (condition: string, isDay: boolean = true): string => {
  if (!isDay) {
    return 'from-indigo-900 via-slate-800 to-slate-900';
  }

  const gradients: Record<string, string> = {
    'clear': 'from-sky-400 via-blue-500 to-blue-600',
    'mostly-clear': 'from-sky-400 via-blue-500 to-blue-600',
    'partly-cloudy': 'from-blue-400 via-blue-500 to-gray-500',
    'cloudy': 'from-gray-400 via-gray-500 to-gray-600',
    'foggy': 'from-gray-300 via-gray-400 to-gray-500',
    'drizzle': 'from-gray-400 via-slate-500 to-slate-600',
    'freezing-drizzle': 'from-blue-300 via-blue-400 to-gray-500',
    'rainy': 'from-gray-500 via-slate-600 to-slate-700',
    'freezing-rain': 'from-blue-400 via-slate-500 to-slate-600',
    'snowy': 'from-slate-300 via-blue-200 to-blue-300',
    'snow-grains': 'from-slate-300 via-blue-200 to-blue-300',
    'showers': 'from-gray-500 via-slate-600 to-slate-700',
    'snow-showers': 'from-slate-400 via-blue-300 to-blue-400',
    'stormy': 'from-gray-600 via-slate-700 to-slate-800',
    'stormy-hail': 'from-purple-600 via-slate-700 to-slate-800',
  };

  return gradients[condition] || 'from-blue-400 via-blue-500 to-blue-600';
};

const getWindDirection = (degrees: number): string => {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return directions[Math.round(degrees / 22.5) % 16];
};

const getUVCategory = (uv: number): { label: string; color: string } => {
  if (uv <= 2) return { label: 'Low', color: 'text-green-400' };
  if (uv <= 5) return { label: 'Moderate', color: 'text-yellow-400' };
  if (uv <= 7) return { label: 'High', color: 'text-orange-400' };
  if (uv <= 10) return { label: 'Very High', color: 'text-red-400' };
  return { label: 'Extreme', color: 'text-purple-400' };
};

const getAQICategory = (aqi: number): { label: string; color: string; bgColor: string } => {
  if (aqi <= 50) return { label: 'Good', color: 'text-green-400', bgColor: 'bg-green-500' };
  if (aqi <= 100) return { label: 'Moderate', color: 'text-yellow-400', bgColor: 'bg-yellow-500' };
  if (aqi <= 150) return { label: 'Unhealthy for Sensitive', color: 'text-orange-400', bgColor: 'bg-orange-500' };
  if (aqi <= 200) return { label: 'Unhealthy', color: 'text-red-400', bgColor: 'bg-red-500' };
  if (aqi <= 300) return { label: 'Very Unhealthy', color: 'text-purple-400', bgColor: 'bg-purple-500' };
  return { label: 'Hazardous', color: 'text-rose-400', bgColor: 'bg-rose-900' };
};

const formatTime = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};

const formatHour = (isoString: string, now: Date): string => {
  const date = new Date(isoString);
  if (Math.abs(date.getTime() - now.getTime()) < 30 * 60 * 1000) return 'Now';
  return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
};

const formatDay = (dateStr: string, index: number): string => {
  if (index === 0) return 'Today';
  if (index === 1) return 'Tomorrow';
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

const formatDayFull = (dateStr: string): string => {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
};

const generateLocationId = (loc: { latitude: number; longitude: number }): string => {
  return `${loc.latitude.toFixed(4)}_${loc.longitude.toFixed(4)}`;
};

// View type for the app
type ViewType = 'current' | 'hourly' | 'daily' | 'details' | 'locations' | 'maps' | 'alerts';

const ZWeatherWindow: React.FC<ZWeatherWindowProps> = ({ onClose }) => {
  // State
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<ViewType>('current');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeoLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Saved locations
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Active location
  const [activeLocationId, setActiveLocationId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(ACTIVE_LOCATION_KEY);
    } catch {
      return null;
    }
  });

  // Weather cache
  const [cache, setCache] = useState<Record<string, WeatherData>>(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : {};
    } catch {
      return {};
    }
  });

  // Drag state for reordering
  const [draggedLocation, setDraggedLocation] = useState<string | null>(null);

  // Selected day for detailed view
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);

  // Map type
  const [mapType, setMapType] = useState<'radar' | 'temperature' | 'precipitation'>('radar');

  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const hourlyScrollRef = useRef<HTMLDivElement>(null);

  // Persist saved locations
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedLocations));
    } catch {
      // Storage unavailable
    }
  }, [savedLocations]);

  // Persist active location
  useEffect(() => {
    try {
      if (activeLocationId) {
        localStorage.setItem(ACTIVE_LOCATION_KEY, activeLocationId);
      } else {
        localStorage.removeItem(ACTIVE_LOCATION_KEY);
      }
    } catch {
      // Storage unavailable
    }
  }, [activeLocationId]);

  // Persist cache
  useEffect(() => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch {
      // Storage unavailable
    }
  }, [cache]);

  // Fetch weather data
  const fetchWeather = useCallback(async (location: GeoLocation, useCache: boolean = true): Promise<WeatherData | null> => {
    const locId = generateLocationId(location);

    // Check cache
    if (useCache && cache[locId]) {
      const cached = cache[locId];
      if (Date.now() - cached.lastUpdated < CACHE_DURATION) {
        return cached;
      }
    }

    try {
      // Fetch weather from Open-Meteo
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?` +
        `latitude=${location.latitude}&longitude=${location.longitude}` +
        `&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m` +
        `&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,rain,showers,snowfall,snow_depth,weather_code,pressure_msl,surface_pressure,cloud_cover,visibility,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index,is_day` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,rain_sum,showers_sum,snowfall_sum,precipitation_hours,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant` +
        `&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto`
      );

      if (!weatherResponse.ok) throw new Error('Failed to fetch weather');
      const weatherData = await weatherResponse.json();

      // Try to fetch air quality
      let aqiData: AirQualityData | undefined;
      try {
        const aqiResponse = await fetch(
          `https://air-quality-api.open-meteo.com/v1/air-quality?` +
          `latitude=${location.latitude}&longitude=${location.longitude}` +
          `&current=us_aqi,pm10,pm2_5,ozone,nitrogen_dioxide`
        );
        if (aqiResponse.ok) {
          const aqi = await aqiResponse.json();
          if (aqi.current) {
            aqiData = {
              aqi: aqi.current.us_aqi || 0,
              category: getAQICategory(aqi.current.us_aqi || 0).label,
              pm25: aqi.current.pm2_5 || 0,
              pm10: aqi.current.pm10 || 0,
              o3: aqi.current.ozone || 0,
              no2: aqi.current.nitrogen_dioxide || 0,
            };
          }
        }
      } catch {
        // AQI optional
      }

      const current = weatherData.current;
      const hourly = weatherData.hourly;
      const daily = weatherData.daily;
      const now = new Date();
      const currentHourIndex = hourly.time.findIndex((t: string) => new Date(t) >= now) || 0;

      // Parse hourly data (next 48 hours)
      const hourlyForecast: HourlyData[] = [];
      for (let i = 0; i < 48 && (currentHourIndex + i) < hourly.time.length; i++) {
        const idx = currentHourIndex + i;
        hourlyForecast.push({
          time: hourly.time[idx],
          temp: Math.round(hourly.temperature_2m[idx]),
          feelsLike: Math.round(hourly.apparent_temperature[idx]),
          condition: getConditionFromWMO(hourly.weather_code[idx]).condition,
          precipitation: hourly.precipitation[idx] || 0,
          precipProbability: hourly.precipitation_probability[idx] || 0,
          windSpeed: Math.round(hourly.wind_speed_10m[idx]),
          windDirection: hourly.wind_direction_10m[idx],
          humidity: hourly.relative_humidity_2m[idx],
          uvIndex: hourly.uv_index[idx] || 0,
          visibility: Math.round((hourly.visibility[idx] || 10000) / 1609.34), // meters to miles
          isDay: hourly.is_day[idx] === 1,
        });
      }

      // Parse daily data (10 days)
      const dailyForecast: DailyData[] = daily.time.slice(0, 10).map((date: string, i: number) => ({
        date,
        day: formatDay(date, i),
        high: Math.round(daily.temperature_2m_max[i]),
        low: Math.round(daily.temperature_2m_min[i]),
        condition: getConditionFromWMO(daily.weather_code[i]).condition,
        precipitation: daily.precipitation_sum[i] || 0,
        precipProbability: daily.precipitation_probability_max[i] || 0,
        windSpeed: Math.round(daily.wind_speed_10m_max[i]),
        uvIndex: Math.round(daily.uv_index_max[i] || 0),
        sunrise: daily.sunrise[i],
        sunset: daily.sunset[i],
      }));

      // Generate alerts based on conditions
      const alerts: WeatherAlert[] = [];

      // UV alert
      if (daily.uv_index_max[0] >= 8) {
        alerts.push({
          event: 'UV Index Warning',
          headline: `Very High UV Index of ${Math.round(daily.uv_index_max[0])} expected`,
          severity: daily.uv_index_max[0] >= 11 ? 'extreme' : 'severe',
          description: 'Extreme UV levels. Avoid sun exposure during midday hours. Wear protective clothing and use SPF 50+ sunscreen.',
          start: now.toISOString(),
          end: daily.sunset[0],
        });
      }

      // Heat advisory
      if (daily.temperature_2m_max[0] >= 100) {
        alerts.push({
          event: 'Excessive Heat Warning',
          headline: `High of ${Math.round(daily.temperature_2m_max[0])}F expected`,
          severity: 'severe',
          description: 'Dangerously hot conditions. Stay hydrated and avoid prolonged outdoor activities.',
          start: now.toISOString(),
          end: daily.sunset[0],
        });
      }

      // Storm warning
      if ([95, 96, 99].includes(current.weather_code) || [95, 96, 99].includes(hourly.weather_code[currentHourIndex])) {
        alerts.push({
          event: 'Thunderstorm Warning',
          headline: 'Thunderstorm activity in the area',
          severity: 'moderate',
          description: 'Thunderstorms are occurring or expected. Seek shelter and avoid outdoor activities.',
          start: now.toISOString(),
          end: new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString(),
        });
      }

      const result: WeatherData = {
        city: location.name,
        country: location.country,
        latitude: location.latitude,
        longitude: location.longitude,
        timezone: weatherData.timezone,
        temp: Math.round(current.temperature_2m),
        feelsLike: Math.round(current.apparent_temperature),
        high: Math.round(daily.temperature_2m_max[0]),
        low: Math.round(daily.temperature_2m_min[0]),
        condition: getConditionFromWMO(current.weather_code).condition,
        humidity: current.relative_humidity_2m,
        windSpeed: Math.round(current.wind_speed_10m),
        windDirection: current.wind_direction_10m,
        visibility: Math.round((hourly.visibility[currentHourIndex] || 10000) / 1609.34),
        pressure: Math.round(current.pressure_msl * 0.02953), // hPa to inHg
        uvIndex: hourly.uv_index[currentHourIndex] || 0,
        dewPoint: Math.round(hourly.dew_point_2m[currentHourIndex]),
        cloudCover: current.cloud_cover,
        sunrise: daily.sunrise[0],
        sunset: daily.sunset[0],
        isDay: current.is_day === 1,
        hourly: hourlyForecast,
        daily: dailyForecast,
        alerts,
        aqi: aqiData,
        lastUpdated: Date.now(),
      };

      // Update cache
      setCache(prev => ({ ...prev, [locId]: result }));

      return result;
    } catch (err) {
      logger.error('Weather fetch error:', err);
      throw new Error('Unable to fetch weather data');
    }
  }, [cache]);

  // Search cities
  const searchCities = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=en&format=json`
      );

      if (!response.ok) return;

      const data = await response.json();
      if (data.results) {
        setSearchResults(data.results.map((r: { name: string; country?: string; admin1?: string; latitude: number; longitude: number }) => ({
          id: generateLocationId(r),
          name: r.name,
          country: r.country || '',
          admin1: r.admin1,
          latitude: r.latitude,
          longitude: r.longitude,
        })));
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      logger.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Get current location
  const getCurrentLocation = useCallback(async (): Promise<GeoLocation | null> => {
    if (!('geolocation' in navigator)) return null;

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&count=1`
            );
            const data = await response.json();
            const cityName = data.results?.[0]?.name || 'Current Location';
            const country = data.results?.[0]?.country || '';
            resolve({
              id: generateLocationId({ latitude, longitude }),
              name: cityName,
              country,
              latitude,
              longitude,
              isCurrentLocation: true,
            });
          } catch {
            resolve({
              id: generateLocationId({ latitude, longitude }),
              name: 'Current Location',
              country: '',
              latitude,
              longitude,
              isCurrentLocation: true,
            });
          }
        },
        () => resolve(null),
        { timeout: 10000 }
      );
    });
  }, []);

  // Load weather on mount
  useEffect(() => {
    const loadWeather = async () => {
      setLoading(true);
      setError(null);

      try {
        let location: GeoLocation | null = null;

        // Try to find active location in saved locations
        if (activeLocationId) {
          const saved = savedLocations.find(l => l.id === activeLocationId);
          if (saved) {
            location = saved;
          }
        }

        // If no active location, try current location
        if (!location) {
          location = await getCurrentLocation();
          if (location) {
            // Add current location to saved if not exists
            const exists = savedLocations.some(l => l.isCurrentLocation);
            if (!exists) {
              const newSaved: SavedLocation = { ...location, order: 0 };
              setSavedLocations(prev => [newSaved, ...prev.map(l => ({ ...l, order: l.order + 1 }))]);
            }
            setActiveLocationId(location.id);
          }
        }

        // Fallback to San Francisco
        if (!location) {
          location = {
            id: '37.7749_-122.4194',
            name: 'San Francisco',
            country: 'United States',
            latitude: 37.7749,
            longitude: -122.4194,
          };
          // Add to saved if empty
          if (savedLocations.length === 0) {
            setSavedLocations([{ ...location, order: 0 }]);
          }
          setActiveLocationId(location.id);
        }

        const data = await fetchWeather(location);
        if (data) {
          setWeather(data);
        }
      } catch (err) {
        setError('Unable to load weather data');
        logger.error('Load weather error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadWeather();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Select a location
  const selectLocation = useCallback(async (location: GeoLocation) => {
    setLoading(true);
    setError(null);
    setView('current');
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
    setActiveLocationId(location.id);

    try {
      const data = await fetchWeather(location, false);
      if (data) {
        setWeather(data);
      }
    } catch {
      setError('Unable to fetch weather');
    } finally {
      setLoading(false);
    }
  }, [fetchWeather]);

  // Add a location
  const addLocation = useCallback((location: GeoLocation) => {
    const exists = savedLocations.some(l => l.id === location.id);
    if (!exists) {
      const newLocation: SavedLocation = {
        ...location,
        order: savedLocations.length,
      };
      setSavedLocations(prev => [...prev, newLocation]);
    }
    selectLocation(location);
  }, [savedLocations, selectLocation]);

  // Remove a location
  const removeLocation = useCallback((locationId: string) => {
    setSavedLocations(prev => prev.filter(l => l.id !== locationId));
    if (activeLocationId === locationId && savedLocations.length > 1) {
      const remaining = savedLocations.filter(l => l.id !== locationId);
      if (remaining.length > 0) {
        selectLocation(remaining[0]);
      }
    }
  }, [activeLocationId, savedLocations, selectLocation]);

  // Refresh weather
  const refresh = useCallback(async () => {
    if (!weather) return;

    setLoading(true);
    try {
      const data = await fetchWeather({
        id: generateLocationId(weather),
        name: weather.city,
        country: weather.country,
        latitude: weather.latitude,
        longitude: weather.longitude,
      }, false);
      if (data) {
        setWeather(data);
      }
    } catch {
      // Keep existing data on refresh error
    } finally {
      setLoading(false);
    }
  }, [weather, fetchWeather]);

  // Find temperature range for display
  const tempRange = useMemo(() => {
    if (!weather) return { min: 0, max: 100 };
    const temps = weather.daily.flatMap(d => [d.high, d.low]);
    return {
      min: Math.min(...temps) - 5,
      max: Math.max(...temps) + 5,
    };
  }, [weather]);

  // Current hour precipitation forecast (next hour)
  const nextHourPrecip = useMemo(() => {
    if (!weather?.hourly.length) return null;
    const nextHour = weather.hourly.slice(0, 6);
    const hasPrecip = nextHour.some(h => h.precipProbability > 30);
    if (!hasPrecip) return null;
    return nextHour;
  }, [weather]);

  // Render loading state
  if (loading && !weather) {
    return (
      <ZWindow
        title="Weather"
        onClose={onClose}
        initialPosition={{ x: 160, y: 60 }}
        initialSize={{ width: 420, height: 680 }}
        windowType="system"
      >
        <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-blue-400 to-blue-600">
          <Loader2 className="w-12 h-12 text-white animate-spin mb-4" />
          <p className="text-white/80">Loading weather data...</p>
        </div>
      </ZWindow>
    );
  }

  // Render error state
  if (error && !weather) {
    return (
      <ZWindow
        title="Weather"
        onClose={onClose}
        initialPosition={{ x: 160, y: 60 }}
        initialSize={{ width: 420, height: 680 }}
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

  const gradient = getGradient(weather.condition, weather.isDay);
  const { description: conditionDescription } = getConditionFromWMO(
    Object.entries(WMO_CODES).find(([, v]) => v.condition === weather.condition)?.[0]
      ? parseInt(Object.entries(WMO_CODES).find(([, v]) => v.condition === weather.condition)![0])
      : 0
  );

  return (
    <ZWindow
      title="Weather"
      onClose={onClose}
      initialPosition={{ x: 160, y: 60 }}
      initialSize={{ width: 420, height: 680 }}
      windowType="system"
    >
      <div className={`flex flex-col h-full bg-gradient-to-b ${gradient} overflow-hidden`}>
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 bg-black/10 backdrop-blur-sm flex-shrink-0">
          <div className="flex-1">
            {showSearch ? (
              <div className="relative">
                <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1.5">
                  <Search className="w-4 h-4 text-white/60" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      searchCities(e.target.value);
                    }}
                    placeholder="Search city..."
                    className="flex-1 bg-transparent text-white placeholder:text-white/50 outline-none text-sm"
                    autoFocus
                  />
                  {isSearching && <Loader2 className="w-4 h-4 text-white/60 animate-spin" />}
                  <button onClick={() => { setShowSearch(false); setSearchQuery(''); setSearchResults([]); }}>
                    <X className="w-4 h-4 text-white/60 hover:text-white" />
                  </button>
                </div>
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-xl border border-white/10 overflow-hidden z-50 max-h-64 overflow-y-auto">
                    {searchResults.map((city) => {
                      const isSaved = savedLocations.some(l => l.id === city.id);
                      return (
                        <button
                          key={city.id}
                          onClick={() => addLocation(city)}
                          className="w-full px-3 py-2.5 text-left text-white hover:bg-white/10 transition-colors flex items-center gap-2"
                        >
                          <MapPin className="w-4 h-4 text-white/50 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="block truncate">{city.name}</span>
                            <span className="text-white/50 text-xs block truncate">
                              {city.admin1 ? `${city.admin1}, ` : ''}{city.country}
                            </span>
                          </div>
                          {isSaved && <Check className="w-4 h-4 text-green-400 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowSearch(true)}
                className="flex items-center gap-2 hover:bg-white/10 px-2 py-1 rounded-lg transition-colors group"
              >
                <MapPin className="w-4 h-4 text-white/80" />
                <span className="text-white font-medium truncate max-w-[200px]">{weather.city}</span>
                <ChevronRight className="w-4 h-4 text-white/50 group-hover:text-white/80" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setView('locations')}
              className={`p-2 rounded-lg transition-colors ${view === 'locations' ? 'bg-white/20' : 'hover:bg-white/10'}`}
              title="Locations"
            >
              <Star className="w-4 h-4 text-white/80" />
            </button>
            <button
              onClick={refresh}
              disabled={loading}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 text-white/80 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Alerts Banner */}
        {weather.alerts.length > 0 && view !== 'alerts' && (
          <button
            onClick={() => setView('alerts')}
            className="mx-3 mt-2 bg-red-500/30 hover:bg-red-500/40 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2 transition-colors"
          >
            <AlertTriangle className="w-4 h-4 text-red-300" />
            <span className="text-white text-sm flex-1 text-left truncate">
              {weather.alerts[0].headline}
            </span>
            <ChevronRight className="w-4 h-4 text-white/60" />
          </button>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-3 py-2 overflow-x-auto flex-shrink-0">
          {(['current', 'hourly', 'daily', 'details', 'maps'] as ViewType[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                view === v
                  ? 'bg-white/20 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {v === 'current' ? 'Now' : v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="px-3 pb-4">
            {/* Current View */}
            {view === 'current' && (
              <div className="space-y-3">
                {/* Main Temperature Display */}
                <div className="text-center py-4">
                  <div className="flex justify-center mb-2">
                    {getWeatherIcon(weather.condition, 'xl', weather.isDay)}
                  </div>
                  <p className="text-7xl font-thin text-white tabular-nums">{weather.temp}°</p>
                  <p className="text-white/90 text-lg capitalize mt-1">{conditionDescription}</p>
                  <div className="flex items-center justify-center gap-4 text-white/70 text-sm mt-2">
                    <span className="flex items-center gap-1">
                      <Thermometer className="w-4 h-4" />
                      Feels like {weather.feelsLike}°
                    </span>
                    <span>H:{weather.high}° L:{weather.low}°</span>
                  </div>
                </div>

                {/* Next Hour Precipitation Widget */}
                {nextHourPrecip && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                    <div className="flex items-center gap-2 text-white/70 text-xs mb-2">
                      <Umbrella className="w-3 h-3" />
                      NEXT HOUR PRECIPITATION
                    </div>
                    <div className="flex items-end gap-1 h-12">
                      {nextHourPrecip.map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div
                            className="w-full bg-blue-400/50 rounded-t"
                            style={{ height: `${Math.max(4, h.precipProbability)}%` }}
                          />
                          <span className="text-[10px] text-white/60">{h.precipProbability}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Compact Hourly Scroll */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                  <div className="flex items-center gap-2 text-white/70 text-xs mb-2">
                    <Clock className="w-3 h-3" />
                    HOURLY FORECAST
                  </div>
                  <div
                    ref={hourlyScrollRef}
                    className="flex gap-4 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-white/20"
                  >
                    {weather.hourly.slice(0, 24).map((hour, i) => (
                      <div key={i} className="flex flex-col items-center min-w-[48px]">
                        <span className="text-white/60 text-xs mb-1">
                          {formatHour(hour.time, new Date())}
                        </span>
                        {getWeatherIcon(hour.condition, 'sm', hour.isDay)}
                        <span className="text-white text-sm mt-1">{hour.temp}°</span>
                        {hour.precipProbability > 10 && (
                          <span className="text-blue-300 text-[10px]">{hour.precipProbability}%</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 10-Day Compact */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                  <div className="flex items-center gap-2 text-white/70 text-xs mb-2">
                    <Sun className="w-3 h-3" />
                    10-DAY FORECAST
                  </div>
                  {weather.daily.map((day, i) => (
                    <button
                      key={i}
                      onClick={() => { setSelectedDayIndex(i); setView('daily'); }}
                      className="w-full flex items-center justify-between py-2 border-b border-white/10 last:border-0 hover:bg-white/5 -mx-1 px-1 rounded transition-colors"
                    >
                      <span className="text-white w-16 text-left">{day.day}</span>
                      <div className="flex items-center gap-2">
                        {day.precipProbability > 20 && (
                          <span className="text-blue-300 text-xs">{day.precipProbability}%</span>
                        )}
                        {getWeatherIcon(day.condition, 'sm', true)}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-white/50 text-sm w-8 text-right">{day.low}°</span>
                        <div className="w-20 h-1.5 bg-white/20 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-300 via-yellow-200 to-orange-300 rounded-full"
                            style={{
                              marginLeft: `${((day.low - tempRange.min) / (tempRange.max - tempRange.min)) * 100}%`,
                              width: `${((day.high - day.low) / (tempRange.max - tempRange.min)) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-white text-sm w-8">{day.high}°</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Quick Details Grid */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                    <div className="flex items-center gap-1.5 text-white/60 text-xs mb-1">
                      <Sunrise className="w-3 h-3" />
                      SUNRISE
                    </div>
                    <p className="text-white text-lg">{formatTime(weather.sunrise)}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                    <div className="flex items-center gap-1.5 text-white/60 text-xs mb-1">
                      <Sunset className="w-3 h-3" />
                      SUNSET
                    </div>
                    <p className="text-white text-lg">{formatTime(weather.sunset)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Hourly View */}
            {view === 'hourly' && (
              <div className="space-y-3">
                {/* Temperature Graph */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                  <div className="flex items-center gap-2 text-white/70 text-xs mb-3">
                    <Thermometer className="w-3 h-3" />
                    24-HOUR TEMPERATURE
                  </div>
                  <div className="h-32 flex items-end gap-1">
                    {weather.hourly.slice(0, 24).map((hour, i) => {
                      const temps = weather.hourly.slice(0, 24).map(h => h.temp);
                      const min = Math.min(...temps);
                      const max = Math.max(...temps);
                      const range = max - min || 1;
                      const height = ((hour.temp - min) / range) * 80 + 20;

                      return (
                        <div key={i} className="flex-1 flex flex-col items-center">
                          <span className="text-[10px] text-white mb-1">{hour.temp}°</span>
                          <div
                            className="w-full bg-gradient-to-t from-blue-400 to-orange-300 rounded-t opacity-70"
                            style={{ height: `${height}%` }}
                          />
                          <span className="text-[9px] text-white/50 mt-1">
                            {i % 3 === 0 ? formatHour(hour.time, new Date()) : ''}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Hourly Details */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                  <div className="flex items-center gap-2 text-white/70 text-xs mb-2">
                    <Clock className="w-3 h-3" />
                    HOURLY DETAILS
                  </div>
                  <div className="space-y-1">
                    {weather.hourly.slice(0, 24).map((hour, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0"
                      >
                        <span className="text-white/70 text-sm w-12">
                          {formatHour(hour.time, new Date())}
                        </span>
                        {getWeatherIcon(hour.condition, 'sm', hour.isDay)}
                        <span className="text-white font-medium w-10">{hour.temp}°</span>
                        <div className="flex-1 flex items-center gap-4 text-xs text-white/60">
                          {hour.precipProbability > 0 && (
                            <span className="flex items-center gap-1">
                              <Umbrella className="w-3 h-3 text-blue-300" />
                              {hour.precipProbability}%
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Wind className="w-3 h-3" />
                            {hour.windSpeed} mph
                          </span>
                          <span className="flex items-center gap-1">
                            <Droplets className="w-3 h-3" />
                            {hour.humidity}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Daily View */}
            {view === 'daily' && (
              <div className="space-y-3">
                {weather.daily.map((day, i) => {
                  const isSelected = selectedDayIndex === i;

                  return (
                    <div
                      key={i}
                      className={`bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden transition-all ${
                        isSelected ? 'ring-2 ring-white/30' : ''
                      }`}
                    >
                      <button
                        onClick={() => setSelectedDayIndex(isSelected ? null : i)}
                        className="w-full p-3 flex items-center gap-3"
                      >
                        <div className="flex-1 text-left">
                          <p className="text-white font-medium">{day.day}</p>
                          <p className="text-white/60 text-xs">{formatDayFull(day.date)}</p>
                        </div>
                        {getWeatherIcon(day.condition, 'md', true)}
                        <div className="text-right">
                          <p className="text-white">{day.high}° / {day.low}°</p>
                          {day.precipProbability > 10 && (
                            <p className="text-blue-300 text-xs flex items-center justify-end gap-1">
                              <Umbrella className="w-3 h-3" />
                              {day.precipProbability}%
                            </p>
                          )}
                        </div>
                        <ChevronRight className={`w-5 h-5 text-white/50 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                      </button>

                      {isSelected && (
                        <div className="px-3 pb-3 border-t border-white/10 pt-3 space-y-3">
                          {/* Day details */}
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-2 text-white/70">
                              <Sunrise className="w-4 h-4" />
                              <span>Sunrise: {formatTime(day.sunrise)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-white/70">
                              <Sunset className="w-4 h-4" />
                              <span>Sunset: {formatTime(day.sunset)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-white/70">
                              <Wind className="w-4 h-4" />
                              <span>Wind: {day.windSpeed} mph</span>
                            </div>
                            <div className="flex items-center gap-2 text-white/70">
                              <Sun className="w-4 h-4" />
                              <span>UV Index: {day.uvIndex}</span>
                            </div>
                          </div>

                          {/* Hourly for this day */}
                          <div>
                            <p className="text-white/60 text-xs mb-2">HOURLY</p>
                            <div className="flex gap-3 overflow-x-auto pb-1">
                              {weather.hourly
                                .filter(h => h.time.startsWith(day.date))
                                .map((hour, hi) => (
                                  <div key={hi} className="flex flex-col items-center min-w-[42px]">
                                    <span className="text-white/60 text-xs">{formatHour(hour.time, new Date())}</span>
                                    {getWeatherIcon(hour.condition, 'xs', hour.isDay)}
                                    <span className="text-white text-sm">{hour.temp}°</span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Details View */}
            {view === 'details' && (
              <div className="space-y-3">
                {/* Sun Times */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-center">
                      <Sunrise className="w-8 h-8 text-yellow-300 mx-auto mb-1" />
                      <p className="text-white text-lg">{formatTime(weather.sunrise)}</p>
                      <p className="text-white/60 text-xs">Sunrise</p>
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="h-1 bg-white/20 rounded-full relative">
                        {weather.isDay && (
                          <div
                            className="absolute w-3 h-3 bg-yellow-400 rounded-full -top-1 shadow-lg"
                            style={{
                              left: `${((Date.now() - new Date(weather.sunrise).getTime()) /
                                (new Date(weather.sunset).getTime() - new Date(weather.sunrise).getTime())) * 100}%`
                            }}
                          />
                        )}
                      </div>
                    </div>
                    <div className="text-center">
                      <Sunset className="w-8 h-8 text-orange-400 mx-auto mb-1" />
                      <p className="text-white text-lg">{formatTime(weather.sunset)}</p>
                      <p className="text-white/60 text-xs">Sunset</p>
                    </div>
                  </div>
                </div>

                {/* UV Index */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                  <div className="flex items-center gap-2 text-white/60 text-xs mb-2">
                    <Sun className="w-3 h-3" />
                    UV INDEX
                  </div>
                  <div className="flex items-center gap-3">
                    <p className={`text-3xl font-light ${getUVCategory(weather.uvIndex).color}`}>
                      {Math.round(weather.uvIndex)}
                    </p>
                    <div className="flex-1">
                      <p className={`font-medium ${getUVCategory(weather.uvIndex).color}`}>
                        {getUVCategory(weather.uvIndex).label}
                      </p>
                      <div className="h-1.5 bg-white/20 rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-400 via-yellow-400 via-orange-400 to-purple-500 rounded-full"
                          style={{ width: `${Math.min(100, weather.uvIndex * 8)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Air Quality */}
                {weather.aqi && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                    <div className="flex items-center gap-2 text-white/60 text-xs mb-2">
                      <Wind className="w-3 h-3" />
                      AIR QUALITY
                    </div>
                    <div className="flex items-center gap-3">
                      <p className={`text-3xl font-light ${getAQICategory(weather.aqi.aqi).color}`}>
                        {weather.aqi.aqi}
                      </p>
                      <div className="flex-1">
                        <p className={`font-medium ${getAQICategory(weather.aqi.aqi).color}`}>
                          {weather.aqi.category}
                        </p>
                        <div className="h-1.5 bg-white/20 rounded-full mt-1 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${getAQICategory(weather.aqi.aqi).bgColor}`}
                            style={{ width: `${Math.min(100, weather.aqi.aqi / 3)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-white/60">
                      <span>PM2.5: {weather.aqi.pm25.toFixed(1)} ug/m3</span>
                      <span>PM10: {weather.aqi.pm10.toFixed(1)} ug/m3</span>
                      <span>O3: {weather.aqi.o3.toFixed(1)} ug/m3</span>
                      <span>NO2: {weather.aqi.no2.toFixed(1)} ug/m3</span>
                    </div>
                  </div>
                )}

                {/* Detailed Conditions */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                    <div className="flex items-center gap-1.5 text-white/60 text-xs mb-1">
                      <Thermometer className="w-3 h-3" />
                      FEELS LIKE
                    </div>
                    <p className="text-white text-2xl">{weather.feelsLike}°</p>
                    <p className="text-white/50 text-xs mt-1">
                      {weather.feelsLike > weather.temp ? 'Humidity makes it feel warmer' :
                       weather.feelsLike < weather.temp ? 'Wind makes it feel cooler' :
                       'Similar to actual temperature'}
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                    <div className="flex items-center gap-1.5 text-white/60 text-xs mb-1">
                      <Droplets className="w-3 h-3" />
                      HUMIDITY
                    </div>
                    <p className="text-white text-2xl">{weather.humidity}%</p>
                    <p className="text-white/50 text-xs mt-1">
                      Dew point: {weather.dewPoint}°
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                    <div className="flex items-center gap-1.5 text-white/60 text-xs mb-1">
                      <Wind className="w-3 h-3" />
                      WIND
                    </div>
                    <p className="text-white text-2xl">{weather.windSpeed} mph</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Navigation
                        className="w-3 h-3 text-white/50"
                        style={{ transform: `rotate(${weather.windDirection + 180}deg)` }}
                      />
                      <span className="text-white/50 text-xs">
                        {getWindDirection(weather.windDirection)}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                    <div className="flex items-center gap-1.5 text-white/60 text-xs mb-1">
                      <Eye className="w-3 h-3" />
                      VISIBILITY
                    </div>
                    <p className="text-white text-2xl">{weather.visibility} mi</p>
                    <p className="text-white/50 text-xs mt-1">
                      {weather.visibility >= 10 ? 'Clear' : weather.visibility >= 5 ? 'Moderate' : 'Poor'}
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                    <div className="flex items-center gap-1.5 text-white/60 text-xs mb-1">
                      <Gauge className="w-3 h-3" />
                      PRESSURE
                    </div>
                    <p className="text-white text-2xl">{weather.pressure} in</p>
                    <p className="text-white/50 text-xs mt-1">
                      {weather.pressure >= 30.2 ? 'High' : weather.pressure <= 29.8 ? 'Low' : 'Normal'}
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                    <div className="flex items-center gap-1.5 text-white/60 text-xs mb-1">
                      <Cloud className="w-3 h-3" />
                      CLOUD COVER
                    </div>
                    <p className="text-white text-2xl">{weather.cloudCover}%</p>
                    <p className="text-white/50 text-xs mt-1">
                      {weather.cloudCover <= 20 ? 'Clear' : weather.cloudCover <= 50 ? 'Partly cloudy' :
                       weather.cloudCover <= 80 ? 'Mostly cloudy' : 'Overcast'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Maps View */}
            {view === 'maps' && (
              <div className="space-y-3">
                <div className="flex gap-2 mb-3">
                  {(['radar', 'temperature', 'precipitation'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setMapType(type)}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        mapType === type
                          ? 'bg-white/20 text-white'
                          : 'bg-white/5 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden">
                  <div className="aspect-video bg-slate-800/50 flex items-center justify-center">
                    <div className="text-center text-white/50">
                      <Map className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">
                        {mapType.charAt(0).toUpperCase() + mapType.slice(1)} Map
                      </p>
                      <p className="text-xs mt-1 opacity-70">
                        {weather.city}, {weather.country}
                      </p>
                      <p className="text-xs mt-2 opacity-50">
                        Lat: {weather.latitude.toFixed(4)}, Lon: {weather.longitude.toFixed(4)}
                      </p>
                    </div>
                  </div>
                  <div className="p-3 text-center text-white/60 text-xs">
                    Interactive weather maps require a premium API key.
                    <br />
                    Map tiles from OpenWeatherMap or similar services.
                  </div>
                </div>
              </div>
            )}

            {/* Locations View */}
            {view === 'locations' && (
              <div className="space-y-3">
                {/* Add Location Button */}
                <button
                  onClick={() => { setShowSearch(true); searchInputRef.current?.focus(); }}
                  className="w-full bg-white/10 backdrop-blur-sm rounded-xl p-3 flex items-center gap-3 hover:bg-white/15 transition-colors"
                >
                  <Plus className="w-5 h-5 text-white/70" />
                  <span className="text-white/70">Add Location</span>
                </button>

                {/* Current Location */}
                <button
                  onClick={async () => {
                    const loc = await getCurrentLocation();
                    if (loc) {
                      const exists = savedLocations.some(l => l.isCurrentLocation);
                      if (!exists) {
                        setSavedLocations(prev => [{ ...loc, order: 0 }, ...prev.map(l => ({ ...l, order: l.order + 1 }))]);
                      }
                      selectLocation(loc);
                    }
                  }}
                  className="w-full bg-white/10 backdrop-blur-sm rounded-xl p-3 flex items-center gap-3 hover:bg-white/15 transition-colors"
                >
                  <MapPinned className="w-5 h-5 text-blue-400" />
                  <span className="text-white">Use Current Location</span>
                </button>

                {/* Saved Locations */}
                {savedLocations.length > 0 && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden">
                    {savedLocations
                      .sort((a, b) => a.order - b.order)
                      .map((location) => {
                        const isActive = location.id === activeLocationId;
                        const cachedWeather = cache[location.id];

                        return (
                          <div
                            key={location.id}
                            className={`flex items-center gap-3 p-3 border-b border-white/10 last:border-0 ${
                              draggedLocation === location.id ? 'opacity-50' : ''
                            }`}
                            draggable
                            onDragStart={() => setDraggedLocation(location.id)}
                            onDragEnd={() => setDraggedLocation(null)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => {
                              if (draggedLocation && draggedLocation !== location.id) {
                                setSavedLocations(prev => {
                                  const dragIndex = prev.findIndex(l => l.id === draggedLocation);
                                  const dropIndex = prev.findIndex(l => l.id === location.id);
                                  const newLocations = [...prev];
                                  const [dragged] = newLocations.splice(dragIndex, 1);
                                  newLocations.splice(dropIndex, 0, dragged);
                                  return newLocations.map((l, i) => ({ ...l, order: i }));
                                });
                              }
                            }}
                          >
                            <GripVertical className="w-4 h-4 text-white/30 cursor-grab" />

                            <button
                              onClick={() => selectLocation(location)}
                              className="flex-1 text-left"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-white font-medium">{location.name}</span>
                                {location.isCurrentLocation && (
                                  <MapPinned className="w-3 h-3 text-blue-400" />
                                )}
                                {isActive && (
                                  <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded">Active</span>
                                )}
                              </div>
                              <span className="text-white/50 text-xs">{location.country}</span>
                            </button>

                            {cachedWeather && (
                              <div className="flex items-center gap-2">
                                {getWeatherIcon(cachedWeather.condition, 'sm', cachedWeather.isDay)}
                                <span className="text-white text-lg">{cachedWeather.temp}°</span>
                              </div>
                            )}

                            {savedLocations.length > 1 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeLocation(location.id);
                                }}
                                className="p-1 hover:bg-white/10 rounded transition-colors"
                              >
                                <Trash2 className="w-4 h-4 text-white/50 hover:text-red-400" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}

            {/* Alerts View */}
            {view === 'alerts' && (
              <div className="space-y-3">
                {weather.alerts.length === 0 ? (
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                    <Check className="w-12 h-12 text-green-400 mx-auto mb-2" />
                    <p className="text-white font-medium">No Active Alerts</p>
                    <p className="text-white/60 text-sm mt-1">
                      There are no weather alerts for {weather.city}
                    </p>
                  </div>
                ) : (
                  weather.alerts.map((alert, i) => (
                    <div
                      key={i}
                      className={`rounded-xl overflow-hidden ${
                        alert.severity === 'extreme' ? 'bg-red-500/30' :
                        alert.severity === 'severe' ? 'bg-orange-500/30' :
                        alert.severity === 'moderate' ? 'bg-yellow-500/30' :
                        'bg-blue-500/30'
                      }`}
                    >
                      <div className="p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className={`w-5 h-5 ${
                            alert.severity === 'extreme' ? 'text-red-300' :
                            alert.severity === 'severe' ? 'text-orange-300' :
                            alert.severity === 'moderate' ? 'text-yellow-300' :
                            'text-blue-300'
                          }`} />
                          <span className="text-white font-medium">{alert.event}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded uppercase ${
                            alert.severity === 'extreme' ? 'bg-red-500/50' :
                            alert.severity === 'severe' ? 'bg-orange-500/50' :
                            alert.severity === 'moderate' ? 'bg-yellow-500/50' :
                            'bg-blue-500/50'
                          }`}>
                            {alert.severity}
                          </span>
                        </div>
                        <p className="text-white/90 text-sm mb-2">{alert.headline}</p>
                        <p className="text-white/70 text-xs">{alert.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-white/50 text-xs">
                          <span>From: {formatTime(alert.start)}</span>
                          <span>Until: {formatTime(alert.end)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                <button
                  onClick={() => setView('current')}
                  className="w-full bg-white/10 backdrop-blur-sm rounded-xl p-3 text-white/70 hover:bg-white/15 transition-colors"
                >
                  Back to Weather
                </button>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer - Last Updated */}
        <div className="px-3 py-2 bg-black/10 text-center text-white/40 text-xs flex-shrink-0">
          Updated {new Date(weather.lastUpdated).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
        </div>
      </div>
    </ZWindow>
  );
};

export default ZWeatherWindow;
