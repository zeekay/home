import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// Notification types
export type NotificationType = 'app' | 'system' | 'calendar' | 'github';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body?: string;
  appIcon?: string;
  appName?: string;
  timestamp: number;
  read: boolean;
  actions?: { id: string; label: string }[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime?: string;
  color?: string;
  isAllDay?: boolean;
}

export interface WeatherData {
  temp: number;
  condition: string;
  high: number;
  low: number;
  location: string;
}

export interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  doNotDisturb: boolean;
  isOpen: boolean;
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => string;
  dismissNotification: (id: string) => void;
  dismissAll: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  toggleDoNotDisturb: () => void;
  setDoNotDisturb: (value: boolean) => void;
  openNotificationCenter: () => void;
  closeNotificationCenter: () => void;
  toggleNotificationCenter: () => void;
  
  // Today View data
  calendarEvents: CalendarEvent[];
  weather: WeatherData | null;
  stocks: StockData[];
}

const STORAGE_KEY = 'zos-notifications';
const DND_KEY = 'zos-dnd';

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Generate unique ID
let notificationCounter = 0;
const generateId = () => `notif-${Date.now()}-${++notificationCounter}`;

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load notifications from localStorage
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load notifications:', e);
    }
    return [];
  });

  const [doNotDisturb, setDoNotDisturbState] = useState(() => {
    return localStorage.getItem(DND_KEY) === 'true';
  });

  const [isOpen, setIsOpen] = useState(false);

  // Today View mock data
  const [calendarEvents] = useState<CalendarEvent[]>([
    { id: '1', title: 'Team Standup', startTime: '9:00 AM', endTime: '9:30 AM', color: '#0a84ff' },
    { id: '2', title: 'Code Review', startTime: '2:00 PM', endTime: '3:00 PM', color: '#30d158' },
    { id: '3', title: 'Design Sync', startTime: '4:30 PM', endTime: '5:00 PM', color: '#ff9f0a' },
  ]);

  const [weather] = useState<WeatherData>({
    temp: 72,
    condition: 'Partly Cloudy',
    high: 78,
    low: 65,
    location: 'San Francisco',
  });

  const [stocks] = useState<StockData[]>([
    { symbol: 'AAPL', price: 178.72, change: 2.34, changePercent: 1.33 },
    { symbol: 'GOOGL', price: 141.80, change: -0.92, changePercent: -0.64 },
    { symbol: 'MSFT', price: 378.91, change: 4.21, changePercent: 1.12 },
  ]);

  // Persist notifications
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);

  // Persist DND state
  useEffect(() => {
    localStorage.setItem(DND_KEY, String(doNotDisturb));
  }, [doNotDisturb]);

  // Listen for SDK notification events
  useEffect(() => {
    const handleNotification = (e: CustomEvent) => {
      const { id, title, body, type, icon, appName } = e.detail;
      if (!doNotDisturb) {
        setNotifications(prev => [{
          id: id || generateId(),
          type: type || 'app',
          title,
          body,
          appIcon: icon,
          appName,
          timestamp: Date.now(),
          read: false,
        }, ...prev]);
      }
    };

    const handleDismiss = (e: CustomEvent) => {
      const { id } = e.detail;
      setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const handleDismissAll = () => {
      setNotifications([]);
    };

    window.addEventListener('zos:notification', handleNotification as EventListener);
    window.addEventListener('zos:notification-dismiss', handleDismiss as EventListener);
    window.addEventListener('zos:notification-dismiss-all', handleDismissAll);

    return () => {
      window.removeEventListener('zos:notification', handleNotification as EventListener);
      window.removeEventListener('zos:notification-dismiss', handleDismiss as EventListener);
      window.removeEventListener('zos:notification-dismiss-all', handleDismissAll);
    };
  }, [doNotDisturb]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): string => {
    if (doNotDisturb) return '';
    
    const id = generateId();
    setNotifications(prev => [{
      ...notification,
      id,
      timestamp: Date.now(),
      read: false,
    }, ...prev]);
    return id;
  }, [doNotDisturb]);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const toggleDoNotDisturb = useCallback(() => {
    setDoNotDisturbState(prev => !prev);
  }, []);

  const setDoNotDisturb = useCallback((value: boolean) => {
    setDoNotDisturbState(value);
  }, []);

  const openNotificationCenter = useCallback(() => setIsOpen(true), []);
  const closeNotificationCenter = useCallback(() => setIsOpen(false), []);
  const toggleNotificationCenter = useCallback(() => setIsOpen(prev => !prev), []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      doNotDisturb,
      isOpen,
      addNotification,
      dismissNotification,
      dismissAll,
      markAsRead,
      markAllAsRead,
      toggleDoNotDisturb,
      setDoNotDisturb,
      openNotificationCenter,
      closeNotificationCenter,
      toggleNotificationCenter,
      calendarEvents,
      weather,
      stocks,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export default NotificationContext;
