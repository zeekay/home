import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useNotifications, Notification, CalendarEvent } from '@/contexts/NotificationContext';
import {
  X,
  Moon,
  Bell,
  Calendar,
  Cloud,
  Sun,
  CloudRain,
  TrendingUp,
  TrendingDown,
  Github,
  Mail,
  MessageSquare,
  Settings,
  Music,
  Folder,
  Terminal,
  Code,
  Globe,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';

// App icon mapping
const APP_ICONS: Record<string, React.ReactNode> = {
  'Mail': <Mail className="w-4 h-4" />,
  'Messages': <MessageSquare className="w-4 h-4" />,
  'GitHub': <Github className="w-4 h-4" />,
  'Calendar': <Calendar className="w-4 h-4" />,
  'Music': <Music className="w-4 h-4" />,
  'Finder': <Folder className="w-4 h-4" />,
  'Terminal': <Terminal className="w-4 h-4" />,
  'Xcode': <Code className="w-4 h-4" />,
  'Safari': <Globe className="w-4 h-4" />,
  'System': <Settings className="w-4 h-4" />,
};

// Weather icon based on condition
const WeatherIcon: React.FC<{ condition: string }> = ({ condition }) => {
  const lower = condition.toLowerCase();
  if (lower.includes('rain') || lower.includes('storm')) {
    return <CloudRain className="w-8 h-8 text-blue-400" />;
  }
  if (lower.includes('cloud')) {
    return <Cloud className="w-8 h-8 text-gray-300" />;
  }
  return <Sun className="w-8 h-8 text-yellow-400" />;
};

// Format relative time
const formatRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

// Single notification item
const NotificationItem: React.FC<{
  notification: Notification;
  onDismiss: (id: string) => void;
}> = ({ notification, onDismiss }) => {
  const appIcon = APP_ICONS[notification.appName || ''] || <Bell className="w-4 h-4" />;

  return (
    <div className={cn(
      "group relative p-3 rounded-xl transition-all",
      "bg-white/5 hover:bg-white/10 backdrop-blur-sm",
      !notification.read && "ring-1 ring-white/20"
    )}>
      <button
        onClick={() => onDismiss(notification.id)}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-white/10 transition-opacity"
        aria-label="Dismiss notification"
      >
        <X className="w-3 h-3 text-white/50" />
      </button>

      <div className="flex gap-3">
        {/* App Icon */}
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
          notification.type === 'github' ? "bg-[#24292e]" :
          notification.type === 'calendar' ? "bg-gradient-to-br from-red-500 to-red-600" :
          notification.type === 'system' ? "bg-gradient-to-br from-gray-500 to-gray-600" :
          "bg-gradient-to-br from-blue-500 to-blue-600"
        )}>
          {appIcon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/50 font-medium uppercase tracking-wide">
              {notification.appName || 'System'}
            </span>
            <span className="text-xs text-white/30">
              {formatRelativeTime(notification.timestamp)}
            </span>
          </div>
          <p className="text-sm font-medium text-white/90 truncate">
            {notification.title}
          </p>
          {notification.body && (
            <p className="text-xs text-white/60 line-clamp-2 mt-0.5">
              {notification.body}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Calendar event item
const CalendarEventItem: React.FC<{ event: CalendarEvent }> = ({ event }) => (
  <div className="flex items-center gap-3 py-2">
    <div
      className="w-1 h-8 rounded-full"
      style={{ backgroundColor: event.color || '#0a84ff' }}
    />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-white/90 truncate">{event.title}</p>
      <p className="text-xs text-white/50">
        {event.isAllDay ? 'All Day' : `${event.startTime}${event.endTime ? ` - ${event.endTime}` : ''}`}
      </p>
    </div>
  </div>
);

// Today View Weather Widget
const WeatherWidget: React.FC = () => {
  const { weather } = useNotifications();
  if (!weather) return null;

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-white/50 font-medium">{weather.location}</p>
          <p className="text-4xl font-light text-white">{weather.temp}°</p>
          <p className="text-sm text-white/70">{weather.condition}</p>
        </div>
        <WeatherIcon condition={weather.condition} />
      </div>
      <div className="flex gap-4 mt-3 pt-3 border-t border-white/10">
        <span className="text-xs text-white/50">H: {weather.high}°</span>
        <span className="text-xs text-white/50">L: {weather.low}°</span>
      </div>
    </div>
  );
};

// Today View Calendar Widget
const CalendarWidget: React.FC = () => {
  const { calendarEvents } = useNotifications();
  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  const dateStr = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

  return (
    <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-white/90">{dayName}</p>
          <p className="text-xs text-white/50">{dateStr}</p>
        </div>
        <Calendar className="w-5 h-5 text-red-500" />
      </div>
      {calendarEvents.length > 0 ? (
        <div className="space-y-1">
          {calendarEvents.slice(0, 3).map(event => (
            <CalendarEventItem key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-white/50 text-center py-4">No events today</p>
      )}
    </div>
  );
};

// Today View Stocks Widget
const StocksWidget: React.FC = () => {
  const { stocks } = useNotifications();

  return (
    <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-white/90">Stocks</p>
      </div>
      <div className="space-y-3">
        {stocks.map(stock => (
          <div key={stock.symbol} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/90">{stock.symbol}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-white/90">${stock.price.toFixed(2)}</p>
              <div className={cn(
                "flex items-center gap-1 text-xs",
                stock.change >= 0 ? "text-green-400" : "text-red-400"
              )}>
                {stock.change >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>{stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Notification Center component
const NotificationCenter: React.FC = () => {
  const {
    notifications,
    isOpen,
    doNotDisturb,
    closeNotificationCenter,
    dismissNotification,
    dismissAll,
    toggleDoNotDisturb,
  } = useNotifications();

  const panelRef = useRef<HTMLDivElement>(null);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeNotificationCenter();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeNotificationCenter]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isOpen && panelRef.current && !panelRef.current.contains(e.target as Node)) {
        // Check if click is on the notification icon in menubar
        const target = e.target as HTMLElement;
        if (target.closest('[data-notification-trigger]')) return;
        closeNotificationCenter();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, closeNotificationCenter]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/20 transition-opacity z-40",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={cn(
          "fixed top-[25px] right-0 bottom-0 w-[350px] z-50",
          "vibrancy-notification",
          "transform transition-transform duration-300 ease-out",
          "flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Moon className={cn(
              "w-5 h-5",
              doNotDisturb ? "text-purple-400" : "text-white/50"
            )} />
            <div>
              <p className="text-sm font-medium text-white/90">Do Not Disturb</p>
              <p className="text-xs text-white/50">
                {doNotDisturb ? 'Notifications are paused' : 'Notifications are on'}
              </p>
            </div>
          </div>
          <Switch
            checked={doNotDisturb}
            onCheckedChange={toggleDoNotDisturb}
            className="data-[state=checked]:bg-purple-500"
          />
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {/* Today View Widgets */}
          <div className="p-4 space-y-3">
            <WeatherWidget />
            <CalendarWidget />
            <StocksWidget />
          </div>

          {/* Notifications Section */}
          <div className="p-4 pt-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white/90">Notifications</h3>
              {notifications.length > 0 && (
                <button
                  onClick={dismissAll}
                  className="text-xs text-white/50 hover:text-white/70 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>

            {notifications.length > 0 ? (
              <div className="space-y-2">
                {notifications.map(notification => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onDismiss={dismissNotification}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Bell className="w-10 h-10 text-white/20 mx-auto mb-3" />
                <p className="text-sm text-white/50">No Notifications</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationCenter;
