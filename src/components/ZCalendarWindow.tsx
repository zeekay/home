import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  List,
  Grid3X3,
  LayoutGrid,
  Clock,
  MapPin,
  Bell,
  Repeat,
  Car,
  Trash2,
  Check,
  ExternalLink,
  Upload,
  Download,
  Globe,
  Settings,
} from 'lucide-react';
import ZWindow from './ZWindow';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

// ============================================================================
// Types
// ============================================================================

type ViewType = 'day' | 'week' | 'month' | 'year' | 'agenda';
type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO string
  end: string; // ISO string
  allDay: boolean;
  location?: string;
  notes?: string;
  calendarId: string;
  repeat: RepeatType;
  alerts: number[]; // minutes before
  travelTime?: number; // minutes
  color?: string;
}

interface CalendarData {
  id: string;
  name: string;
  color: string;
  visible: boolean;
  group?: string;
  subscribed?: boolean;
  url?: string;
}

interface CalendarState {
  events: CalendarEvent[];
  calendars: CalendarData[];
  settings: {
    showWeekNumbers: boolean;
    defaultView: ViewType;
    timezone: string;
    firstDayOfWeek: 0 | 1; // 0 = Sunday, 1 = Monday
  };
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'zos-calendar-data';
const CAL_LINK = 'zeekay/15min';

const DEFAULT_CALENDARS: CalendarData[] = [
  { id: 'personal', name: 'Personal', color: '#0a84ff', visible: true, group: 'My Calendars' },
  { id: 'work', name: 'Work', color: '#30d158', visible: true, group: 'My Calendars' },
  { id: 'family', name: 'Family', color: '#ff9f0a', visible: true, group: 'My Calendars' },
  { id: 'birthdays', name: 'Birthdays', color: '#bf5af2', visible: true, group: 'Other' },
];

const DEFAULT_STATE: CalendarState = {
  events: [],
  calendars: DEFAULT_CALENDARS,
  settings: {
    showWeekNumbers: true,
    defaultView: 'month',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    firstDayOfWeek: 0,
  },
};

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// ============================================================================
// Utility Functions
// ============================================================================

const generateId = () => Math.random().toString(36).substr(2, 9);

const loadCalendarState = (): CalendarState => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      return { ...DEFAULT_STATE, ...parsed };
    }
  } catch (e) {
    console.error('Failed to load calendar state:', e);
  }
  return DEFAULT_STATE;
};

const saveCalendarState = (state: CalendarState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save calendar state:', e);
  }
};

const startOfDay = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

const startOfWeek = (date: Date, firstDay: 0 | 1 = 0): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day - firstDay + 7) % 7;
  d.setDate(d.getDate() - diff);
  return startOfDay(d);
};

const endOfWeek = (date: Date, firstDay: 0 | 1 = 0): Date => {
  const d = startOfWeek(date, firstDay);
  d.setDate(d.getDate() + 6);
  return endOfDay(d);
};

const startOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

const endOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
};

const isSameDay = (d1: Date, d2: Date): boolean => {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
};

const isSameMonth = (d1: Date, d2: Date): boolean => {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth();
};

const isToday = (date: Date): boolean => isSameDay(date, new Date());

const addDays = (date: Date, days: number): Date => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const addMonths = (date: Date, months: number): Date => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
};

const addYears = (date: Date, years: number): Date => {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + years);
  return d;
};

const getWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};

const formatTimeRange = (start: Date, end: Date): string => {
  return `${formatTime(start)} - ${formatTime(end)}`;
};

const getMonthGrid = (date: Date, firstDay: 0 | 1 = 0): Date[][] => {
  const first = startOfMonth(date);
  const last = endOfMonth(date);
  const start = startOfWeek(first, firstDay);
  const weeks: Date[][] = [];
  let current = new Date(start);

  while (current <= last || weeks.length < 6) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(new Date(current));
      current = addDays(current, 1);
    }
    weeks.push(week);
    if (weeks.length >= 6) break;
  }

  return weeks;
};

const getEventsForDay = (events: CalendarEvent[], date: Date, calendars: CalendarData[]): CalendarEvent[] => {
  const visibleCalendars = calendars.filter(c => c.visible).map(c => c.id);
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  return events.filter(event => {
    if (!visibleCalendars.includes(event.calendarId)) return false;
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);
    return (eventStart <= dayEnd && eventEnd >= dayStart);
  });
};

const parseICS = (icsContent: string): CalendarEvent[] => {
  const events: CalendarEvent[] = [];
  const lines = icsContent.split(/\r?\n/);
  let currentEvent: Partial<CalendarEvent> | null = null;

  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      currentEvent = {
        id: generateId(),
        calendarId: 'personal',
        repeat: 'none',
        alerts: [],
        allDay: false,
      };
    } else if (line === 'END:VEVENT' && currentEvent) {
      if (currentEvent.title && currentEvent.start && currentEvent.end) {
        events.push(currentEvent as CalendarEvent);
      }
      currentEvent = null;
    } else if (currentEvent) {
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':');

      if (key === 'SUMMARY') {
        currentEvent.title = value;
      } else if (key === 'DTSTART' || key.startsWith('DTSTART;')) {
        const isAllDay = key.includes('VALUE=DATE') && !key.includes('VALUE=DATE-TIME');
        currentEvent.allDay = isAllDay;
        currentEvent.start = parseICSDate(value, isAllDay);
      } else if (key === 'DTEND' || key.startsWith('DTEND;')) {
        const isAllDay = key.includes('VALUE=DATE') && !key.includes('VALUE=DATE-TIME');
        currentEvent.end = parseICSDate(value, isAllDay);
      } else if (key === 'LOCATION') {
        currentEvent.location = value;
      } else if (key === 'DESCRIPTION') {
        currentEvent.notes = value;
      }
    }
  }

  return events;
};

const parseICSDate = (value: string, isAllDay: boolean): string => {
  if (isAllDay) {
    const year = parseInt(value.substr(0, 4));
    const month = parseInt(value.substr(4, 2)) - 1;
    const day = parseInt(value.substr(6, 2));
    return new Date(year, month, day).toISOString();
  }
  const year = parseInt(value.substr(0, 4));
  const month = parseInt(value.substr(4, 2)) - 1;
  const day = parseInt(value.substr(6, 2));
  const hour = parseInt(value.substr(9, 2) || '0');
  const min = parseInt(value.substr(11, 2) || '0');
  const sec = parseInt(value.substr(13, 2) || '0');
  return new Date(Date.UTC(year, month, day, hour, min, sec)).toISOString();
};

const exportToICS = (events: CalendarEvent[]): string => {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//zOS Calendar//EN',
  ];

  for (const event of events) {
    const start = new Date(event.start);
    const end = new Date(event.end);
    const formatDate = (d: Date) => {
      return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${event.id}@zos-calendar`);
    lines.push(`DTSTAMP:${formatDate(new Date())}`);
    lines.push(`DTSTART:${formatDate(start)}`);
    lines.push(`DTEND:${formatDate(end)}`);
    lines.push(`SUMMARY:${event.title}`);
    if (event.location) lines.push(`LOCATION:${event.location}`);
    if (event.notes) lines.push(`DESCRIPTION:${event.notes}`);
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
};

// ============================================================================
// Components
// ============================================================================

interface ZCalendarWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

const ZCalendarWindow: React.FC<ZCalendarWindowProps> = ({ onClose, onFocus }) => {
  // State
  const [state, setState] = useState<CalendarState>(loadCalendarState);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<ViewType>('month');
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [showCalEmbed, setShowCalEmbed] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Persist state
  useEffect(() => {
    saveCalendarState(state);
  }, [state]);

  // Navigation
  const navigate = useCallback((direction: number) => {
    setCurrentDate(prev => {
      switch (view) {
        case 'day':
          return addDays(prev, direction);
        case 'week':
          return addDays(prev, direction * 7);
        case 'month':
          return addMonths(prev, direction);
        case 'year':
          return addYears(prev, direction);
        case 'agenda':
          return addMonths(prev, direction);
        default:
          return prev;
      }
    });
  }, [view]);

  const goToToday = useCallback(() => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  }, []);

  // Event handlers
  const handleCreateEvent = useCallback((date?: Date) => {
    const startDate = date || selectedDate;
    const start = new Date(startDate);
    start.setHours(9, 0, 0, 0);
    const end = new Date(start);
    end.setHours(10, 0, 0, 0);

    setEditingEvent({
      id: '',
      title: '',
      start: start.toISOString(),
      end: end.toISOString(),
      allDay: false,
      calendarId: state.calendars.find(c => c.visible)?.id || 'personal',
      repeat: 'none',
      alerts: [15],
    });
    setShowEventModal(true);
  }, [selectedDate, state.calendars]);

  const handleSaveEvent = useCallback((event: CalendarEvent) => {
    setState(prev => {
      if (event.id) {
        return {
          ...prev,
          events: prev.events.map(e => e.id === event.id ? event : e),
        };
      } else {
        return {
          ...prev,
          events: [...prev.events, { ...event, id: generateId() }],
        };
      }
    });
    setShowEventModal(false);
    setEditingEvent(null);
  }, []);

  const handleDeleteEvent = useCallback((eventId: string) => {
    setState(prev => ({
      ...prev,
      events: prev.events.filter(e => e.id !== eventId),
    }));
    setShowEventModal(false);
    setEditingEvent(null);
  }, []);

  const handleEditEvent = useCallback((event: CalendarEvent) => {
    setEditingEvent(event);
    setShowEventModal(true);
  }, []);

  const toggleCalendarVisibility = useCallback((calendarId: string) => {
    setState(prev => ({
      ...prev,
      calendars: prev.calendars.map(c =>
        c.id === calendarId ? { ...c, visible: !c.visible } : c
      ),
    }));
  }, []);

  const handleImportICS = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const importedEvents = parseICS(content);
      setState(prev => ({
        ...prev,
        events: [...prev.events, ...importedEvents],
      }));
    };
    reader.readAsText(file);
    e.target.value = '';
  }, []);

  const handleExportICS = useCallback(() => {
    const icsContent = exportToICS(state.events);
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'calendar.ics';
    a.click();
    URL.revokeObjectURL(url);
  }, [state.events]);

  // Drag and drop
  const handleDragStart = useCallback((event: CalendarEvent) => {
    setDraggedEvent(event);
  }, []);

  const handleDrop = useCallback((date: Date, hour?: number) => {
    if (!draggedEvent) return;

    const oldStart = new Date(draggedEvent.start);
    const oldEnd = new Date(draggedEvent.end);
    const duration = oldEnd.getTime() - oldStart.getTime();

    const newStart = new Date(date);
    if (hour !== undefined) {
      newStart.setHours(hour, 0, 0, 0);
    } else {
      newStart.setHours(oldStart.getHours(), oldStart.getMinutes(), 0, 0);
    }
    const newEnd = new Date(newStart.getTime() + duration);

    setState(prev => ({
      ...prev,
      events: prev.events.map(e =>
        e.id === draggedEvent.id
          ? { ...e, start: newStart.toISOString(), end: newEnd.toISOString() }
          : e
      ),
    }));
    setDraggedEvent(null);
  }, [draggedEvent]);

  // Title formatting
  const title = useMemo(() => {
    switch (view) {
      case 'day':
        return currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
      case 'week':
        const weekStart = startOfWeek(currentDate, state.settings.firstDayOfWeek);
        const weekEnd = endOfWeek(currentDate, state.settings.firstDayOfWeek);
        if (weekStart.getMonth() === weekEnd.getMonth()) {
          return `${MONTHS_FULL[weekStart.getMonth()]} ${weekStart.getDate()}-${weekEnd.getDate()}, ${weekStart.getFullYear()}`;
        }
        return `${MONTHS_SHORT[weekStart.getMonth()]} ${weekStart.getDate()} - ${MONTHS_SHORT[weekEnd.getMonth()]} ${weekEnd.getDate()}, ${weekStart.getFullYear()}`;
      case 'month':
        return `${MONTHS_FULL[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
      case 'year':
        return `${currentDate.getFullYear()}`;
      case 'agenda':
        return 'Upcoming Events';
      default:
        return '';
    }
  }, [view, currentDate, state.settings.firstDayOfWeek]);

  return (
    <ZWindow
      title="Calendar"
      onClose={onClose}
      onFocus={onFocus}
      defaultWidth={1100}
      defaultHeight={750}
      minWidth={850}
      minHeight={600}
      defaultPosition={{ x: 80, y: 30 }}
    >
      <div className="h-full flex overflow-hidden bg-[#1d1d1f]/95 backdrop-blur-xl">
        {/* Sidebar */}
        <div
          className={cn(
            "flex flex-col border-r border-white/10 bg-[#252527]/80 transition-all duration-200",
            sidebarCollapsed ? "w-0 overflow-hidden" : "w-56"
          )}
        >
          {/* Mini Calendar */}
          <div className="p-3 border-b border-white/10">
            <MiniMonthNavigator
              currentDate={currentDate}
              selectedDate={selectedDate}
              onSelectDate={(date) => {
                setSelectedDate(date);
                setCurrentDate(date);
              }}
              firstDayOfWeek={state.settings.firstDayOfWeek}
              events={state.events}
              calendars={state.calendars}
            />
          </div>

          {/* Calendar List */}
          <ScrollArea className="flex-1">
            <div className="p-3">
              <CalendarList
                calendars={state.calendars}
                onToggleVisibility={toggleCalendarVisibility}
              />
            </div>
          </ScrollArea>

          {/* Upcoming Events */}
          <div className="border-t border-white/10 p-3">
            <h3 className="text-xs font-medium text-white/50 uppercase mb-2">Upcoming</h3>
            <UpcomingEvents
              events={state.events}
              calendars={state.calendars}
              onEventClick={handleEditEvent}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-[#2d2d2f]/80">
            {/* Left - Sidebar toggle & Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
                title={sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}
              >
                <LayoutGrid className="w-4 h-4 text-white/70" />
              </button>
              <div className="h-4 w-px bg-white/10 mx-1" />
              <button
                onClick={() => navigate(-1)}
                className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-white/70" />
              </button>
              <button
                onClick={() => navigate(1)}
                className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-white/70" />
              </button>
              <button
                onClick={goToToday}
                className="ml-2 px-3 py-1 text-sm text-white/80 hover:bg-white/10 rounded-md transition-colors"
              >
                Today
              </button>
            </div>

            {/* Center - Title */}
            <h2 className="text-white font-medium">{title}</h2>

            {/* Right - View switcher & Actions */}
            <div className="flex items-center gap-2">
              {/* View Switcher */}
              <div className="flex bg-white/5 rounded-md p-0.5">
                {[
                  { id: 'day', icon: Clock, label: 'Day' },
                  { id: 'week', icon: Grid3X3, label: 'Week' },
                  { id: 'month', icon: CalendarIcon, label: 'Month' },
                  { id: 'year', icon: LayoutGrid, label: 'Year' },
                  { id: 'agenda', icon: List, label: 'Agenda' },
                ].map(({ id, icon: Icon, label }) => (
                  <button
                    key={id}
                    onClick={() => setView(id as ViewType)}
                    className={cn(
                      "px-2.5 py-1 text-xs rounded transition-colors",
                      view === id
                        ? "bg-white/15 text-white"
                        : "text-white/60 hover:text-white/80"
                    )}
                    title={label}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>

              <div className="h-4 w-px bg-white/10 mx-1" />

              {/* Import/Export */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".ics"
                onChange={handleImportICS}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
                title="Import ICS"
              >
                <Upload className="w-4 h-4 text-white/70" />
              </button>
              <button
                onClick={handleExportICS}
                className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
                title="Export ICS"
              >
                <Download className="w-4 h-4 text-white/70" />
              </button>

              {/* Cal.com */}
              <button
                onClick={() => setShowCalEmbed(!showCalEmbed)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 text-sm rounded-md transition-colors",
                  showCalEmbed
                    ? "bg-[#0a84ff] text-white"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                )}
                title="Book a meeting"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              {/* Settings */}
              <button
                onClick={() => setShowSettings(true)}
                className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
                title="Settings"
              >
                <Settings className="w-4 h-4 text-white/70" />
              </button>

              {/* New Event */}
              <button
                onClick={() => handleCreateEvent()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0a84ff] hover:bg-[#0077ed] text-white text-sm font-medium rounded-md transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Event
              </button>
            </div>
          </div>

          {/* View Content */}
          <div className="flex-1 overflow-hidden relative">
            {showCalEmbed ? (
              <CalEmbedView />
            ) : (
              <>
                {view === 'day' && (
                  <DayView
                    date={currentDate}
                    events={state.events}
                    calendars={state.calendars}
                    onEventClick={handleEditEvent}
                    onCreateEvent={handleCreateEvent}
                    onDragStart={handleDragStart}
                    onDrop={handleDrop}
                  />
                )}
                {view === 'week' && (
                  <WeekView
                    date={currentDate}
                    events={state.events}
                    calendars={state.calendars}
                    onEventClick={handleEditEvent}
                    onCreateEvent={handleCreateEvent}
                    onDragStart={handleDragStart}
                    onDrop={handleDrop}
                    firstDayOfWeek={state.settings.firstDayOfWeek}
                    showWeekNumbers={state.settings.showWeekNumbers}
                  />
                )}
                {view === 'month' && (
                  <MonthView
                    date={currentDate}
                    selectedDate={selectedDate}
                    events={state.events}
                    calendars={state.calendars}
                    onSelectDate={setSelectedDate}
                    onEventClick={handleEditEvent}
                    onCreateEvent={handleCreateEvent}
                    onDragStart={handleDragStart}
                    onDrop={handleDrop}
                    firstDayOfWeek={state.settings.firstDayOfWeek}
                    showWeekNumbers={state.settings.showWeekNumbers}
                  />
                )}
                {view === 'year' && (
                  <YearView
                    date={currentDate}
                    events={state.events}
                    calendars={state.calendars}
                    onSelectMonth={(month) => {
                      setCurrentDate(month);
                      setView('month');
                    }}
                    firstDayOfWeek={state.settings.firstDayOfWeek}
                  />
                )}
                {view === 'agenda' && (
                  <AgendaView
                    date={currentDate}
                    events={state.events}
                    calendars={state.calendars}
                    onEventClick={handleEditEvent}
                  />
                )}
              </>
            )}
          </div>
        </div>

        {/* Event Modal */}
        <EventModal
          open={showEventModal}
          event={editingEvent}
          calendars={state.calendars}
          onClose={() => {
            setShowEventModal(false);
            setEditingEvent(null);
          }}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
        />

        {/* Settings Modal */}
        <SettingsModal
          open={showSettings}
          settings={state.settings}
          calendars={state.calendars}
          onClose={() => setShowSettings(false)}
          onSave={(settings) => {
            setState(prev => ({ ...prev, settings }));
            setShowSettings(false);
          }}
          onAddCalendar={(calendar) => {
            setState(prev => ({
              ...prev,
              calendars: [...prev.calendars, calendar],
            }));
          }}
          onDeleteCalendar={(id) => {
            setState(prev => ({
              ...prev,
              calendars: prev.calendars.filter(c => c.id !== id),
            }));
          }}
        />
      </div>
    </ZWindow>
  );
};

// ============================================================================
// Mini Month Navigator
// ============================================================================

interface MiniMonthNavigatorProps {
  currentDate: Date;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  firstDayOfWeek: 0 | 1;
  events: CalendarEvent[];
  calendars: CalendarData[];
}

const MiniMonthNavigator: React.FC<MiniMonthNavigatorProps> = ({
  currentDate,
  selectedDate,
  onSelectDate,
  firstDayOfWeek,
  events,
  calendars,
}) => {
  const [displayMonth, setDisplayMonth] = useState(currentDate);

  useEffect(() => {
    setDisplayMonth(currentDate);
  }, [currentDate]);

  const grid = getMonthGrid(displayMonth, firstDayOfWeek);
  const weekdays = firstDayOfWeek === 1
    ? ['M', 'T', 'W', 'T', 'F', 'S', 'S']
    : ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => setDisplayMonth(addMonths(displayMonth, -1))}
          className="p-1 hover:bg-white/10 rounded transition-colors"
        >
          <ChevronLeft className="w-3 h-3 text-white/70" />
        </button>
        <span className="text-xs font-medium text-white/80">
          {MONTHS_SHORT[displayMonth.getMonth()]} {displayMonth.getFullYear()}
        </span>
        <button
          onClick={() => setDisplayMonth(addMonths(displayMonth, 1))}
          className="p-1 hover:bg-white/10 rounded transition-colors"
        >
          <ChevronRight className="w-3 h-3 text-white/70" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 text-center">
        {weekdays.map((day, i) => (
          <div key={i} className="text-[10px] text-white/40 py-1">
            {day}
          </div>
        ))}
        {grid.flat().map((date, i) => {
          const isCurrentMonth = isSameMonth(date, displayMonth);
          const hasEvents = getEventsForDay(events, date, calendars).length > 0;

          return (
            <button
              key={i}
              onClick={() => onSelectDate(date)}
              className={cn(
                "text-[11px] py-1 rounded transition-colors relative",
                isCurrentMonth ? "text-white/80" : "text-white/30",
                isToday(date) && "bg-[#0a84ff] text-white font-medium",
                isSameDay(date, selectedDate) && !isToday(date) && "bg-white/20",
                !isToday(date) && !isSameDay(date, selectedDate) && "hover:bg-white/10"
              )}
            >
              {date.getDate()}
              {hasEvents && !isToday(date) && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#0a84ff] rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// Calendar List
// ============================================================================

interface CalendarListProps {
  calendars: CalendarData[];
  onToggleVisibility: (id: string) => void;
}

const CalendarList: React.FC<CalendarListProps> = ({ calendars, onToggleVisibility }) => {
  const groups = calendars.reduce((acc, cal) => {
    const group = cal.group || 'Other';
    if (!acc[group]) acc[group] = [];
    acc[group].push(cal);
    return acc;
  }, {} as Record<string, CalendarData[]>);

  return (
    <div className="space-y-3">
      {Object.entries(groups).map(([group, cals]) => (
        <div key={group}>
          <h4 className="text-xs font-medium text-white/50 uppercase mb-1.5">{group}</h4>
          <div className="space-y-0.5">
            {cals.map(cal => (
              <button
                key={cal.id}
                onClick={() => onToggleVisibility(cal.id)}
                className="flex items-center gap-2 w-full px-2 py-1 rounded hover:bg-white/5 transition-colors"
              >
                <div
                  className={cn(
                    "w-3 h-3 rounded-sm flex items-center justify-center transition-colors",
                    cal.visible ? "bg-current" : "border border-current opacity-40"
                  )}
                  style={{ color: cal.color }}
                >
                  {cal.visible && <Check className="w-2 h-2 text-white" />}
                </div>
                <span className={cn(
                  "text-sm",
                  cal.visible ? "text-white/80" : "text-white/40"
                )}>
                  {cal.name}
                </span>
                {cal.subscribed && (
                  <Globe className="w-3 h-3 text-white/30 ml-auto" />
                )}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// Upcoming Events
// ============================================================================

interface UpcomingEventsProps {
  events: CalendarEvent[];
  calendars: CalendarData[];
  onEventClick: (event: CalendarEvent) => void;
}

const UpcomingEvents: React.FC<UpcomingEventsProps> = ({ events, calendars, onEventClick }) => {
  const upcoming = events
    .filter(e => {
      const cal = calendars.find(c => c.id === e.calendarId);
      return cal?.visible && new Date(e.start) >= new Date();
    })
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 5);

  if (upcoming.length === 0) {
    return <p className="text-xs text-white/40">No upcoming events</p>;
  }

  return (
    <div className="space-y-1.5">
      {upcoming.map(event => {
        const cal = calendars.find(c => c.id === event.calendarId);
        const start = new Date(event.start);

        return (
          <button
            key={event.id}
            onClick={() => onEventClick(event)}
            className="w-full text-left p-1.5 rounded hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: cal?.color || '#0a84ff' }}
              />
              <span className="text-xs text-white/80 truncate">{event.title}</span>
            </div>
            <p className="text-[10px] text-white/40 ml-4">
              {isToday(start) ? 'Today' : start.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              {!event.allDay && ` at ${formatTime(start)}`}
            </p>
          </button>
        );
      })}
    </div>
  );
};

// ============================================================================
// Day View
// ============================================================================

interface DayViewProps {
  date: Date;
  events: CalendarEvent[];
  calendars: CalendarData[];
  onEventClick: (event: CalendarEvent) => void;
  onCreateEvent: (date: Date) => void;
  onDragStart: (event: CalendarEvent) => void;
  onDrop: (date: Date, hour?: number) => void;
}

const DayView: React.FC<DayViewProps> = ({
  date,
  events,
  calendars,
  onEventClick,
  onCreateEvent,
  onDragStart,
  onDrop,
}) => {
  const dayEvents = getEventsForDay(events, date, calendars);
  const allDayEvents = dayEvents.filter(e => e.allDay);
  const timedEvents = dayEvents.filter(e => !e.allDay);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to 8 AM
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 8 * 60;
    }
  }, [date]);

  const getEventPosition = (event: CalendarEvent) => {
    const start = new Date(event.start);
    const end = new Date(event.end);
    const top = (start.getHours() * 60 + start.getMinutes());
    const height = Math.max(30, (end.getTime() - start.getTime()) / 60000);
    return { top, height };
  };

  return (
    <div className="h-full flex flex-col">
      {/* All-day events */}
      {allDayEvents.length > 0 && (
        <div className="border-b border-white/10 p-2 bg-[#252527]/50">
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/50 w-16">all-day</span>
            <div className="flex-1 flex flex-wrap gap-1">
              {allDayEvents.map(event => {
                const cal = calendars.find(c => c.id === event.calendarId);
                return (
                  <button
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className="px-2 py-0.5 rounded text-xs text-white truncate max-w-[200px]"
                    style={{ backgroundColor: cal?.color || '#0a84ff' }}
                  >
                    {event.title}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Time grid */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="relative" style={{ height: 24 * 60 }}>
          {/* Hour lines */}
          {HOURS.map(hour => (
            <div
              key={hour}
              className="absolute left-0 right-0 border-t border-white/5"
              style={{ top: hour * 60 }}
            >
              <span className="absolute -top-2.5 left-2 text-xs text-white/40 w-14">
                {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
              </span>
            </div>
          ))}

          {/* Current time indicator */}
          {isToday(date) && (
            <div
              className="absolute left-16 right-0 h-0.5 bg-red-500 z-20"
              style={{ top: new Date().getHours() * 60 + new Date().getMinutes() }}
            >
              <div className="absolute -left-2 -top-1.5 w-3 h-3 bg-red-500 rounded-full" />
            </div>
          )}

          {/* Click to create */}
          <div
            className="absolute left-20 right-4"
            style={{ top: 0, height: 24 * 60 }}
            onDoubleClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const minutes = Math.floor((e.clientY - rect.top) / 60) * 60;
              const hour = Math.floor(minutes / 60);
              const newDate = new Date(date);
              newDate.setHours(hour, 0, 0, 0);
              onCreateEvent(newDate);
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const hour = Math.floor((e.clientY - rect.top) / 60);
              onDrop(date, hour);
            }}
          >
            {/* Timed events */}
            {timedEvents.map(event => {
              const cal = calendars.find(c => c.id === event.calendarId);
              const { top, height } = getEventPosition(event);
              const start = new Date(event.start);
              const end = new Date(event.end);

              return (
                <div
                  key={event.id}
                  draggable
                  onDragStart={() => onDragStart(event)}
                  onClick={() => onEventClick(event)}
                  className="absolute left-0 right-0 px-2 py-1 rounded text-xs cursor-pointer overflow-hidden hover:ring-2 hover:ring-white/30 transition-shadow"
                  style={{
                    top,
                    height,
                    backgroundColor: cal?.color || '#0a84ff',
                  }}
                >
                  <div className="font-medium text-white truncate">{event.title}</div>
                  {height >= 40 && (
                    <div className="text-white/80">{formatTimeRange(start, end)}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

// ============================================================================
// Week View
// ============================================================================

interface WeekViewProps {
  date: Date;
  events: CalendarEvent[];
  calendars: CalendarData[];
  onEventClick: (event: CalendarEvent) => void;
  onCreateEvent: (date: Date) => void;
  onDragStart: (event: CalendarEvent) => void;
  onDrop: (date: Date, hour?: number) => void;
  firstDayOfWeek: 0 | 1;
  showWeekNumbers: boolean;
}

const WeekView: React.FC<WeekViewProps> = ({
  date,
  events,
  calendars,
  onEventClick,
  onCreateEvent,
  onDragStart,
  onDrop,
  firstDayOfWeek,
  showWeekNumbers,
}) => {
  const weekStart = startOfWeek(date, firstDayOfWeek);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 8 * 60;
    }
  }, [date]);

  const getEventPosition = (event: CalendarEvent, dayStart: Date) => {
    const start = new Date(event.start);
    const end = new Date(event.end);
    const dayStartTime = startOfDay(dayStart);
    const dayEndTime = endOfDay(dayStart);

    const effectiveStart = start < dayStartTime ? dayStartTime : start;
    const effectiveEnd = end > dayEndTime ? dayEndTime : end;

    const top = (effectiveStart.getHours() * 60 + effectiveStart.getMinutes());
    const height = Math.max(30, (effectiveEnd.getTime() - effectiveStart.getTime()) / 60000);
    return { top, height };
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex border-b border-white/10 bg-[#252527]/50">
        {showWeekNumbers && (
          <div className="w-8 flex-shrink-0 text-center py-2 text-xs text-white/30">
            W{getWeekNumber(weekStart)}
          </div>
        )}
        <div className="w-16 flex-shrink-0" />
        {days.map((day, i) => (
          <div
            key={i}
            className="flex-1 text-center py-2 border-l border-white/5"
          >
            <div className="text-xs text-white/50">{WEEKDAYS_SHORT[day.getDay()]}</div>
            <div className={cn(
              "text-lg font-medium",
              isToday(day) ? "text-[#0a84ff]" : "text-white/80"
            )}>
              {day.getDate()}
            </div>
          </div>
        ))}
      </div>

      {/* Time grid */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="flex" style={{ height: 24 * 60 }}>
          {showWeekNumbers && <div className="w-8 flex-shrink-0" />}

          {/* Time labels */}
          <div className="w-16 flex-shrink-0 relative">
            {HOURS.map(hour => (
              <span
                key={hour}
                className="absolute left-2 text-xs text-white/40"
                style={{ top: hour * 60 - 6 }}
              >
                {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
              </span>
            ))}
          </div>

          {/* Day columns */}
          {days.map((day, dayIndex) => {
            const dayEvents = getEventsForDay(events, day, calendars).filter(e => !e.allDay);

            return (
              <div
                key={dayIndex}
                className="flex-1 relative border-l border-white/5"
                onDoubleClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const hour = Math.floor((e.clientY - rect.top) / 60);
                  const newDate = new Date(day);
                  newDate.setHours(hour, 0, 0, 0);
                  onCreateEvent(newDate);
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const hour = Math.floor((e.clientY - rect.top) / 60);
                  onDrop(day, hour);
                }}
              >
                {/* Hour lines */}
                {HOURS.map(hour => (
                  <div
                    key={hour}
                    className="absolute left-0 right-0 border-t border-white/5"
                    style={{ top: hour * 60 }}
                  />
                ))}

                {/* Current time indicator */}
                {isToday(day) && (
                  <div
                    className="absolute left-0 right-0 h-0.5 bg-red-500 z-20"
                    style={{ top: new Date().getHours() * 60 + new Date().getMinutes() }}
                  />
                )}

                {/* Events */}
                {dayEvents.map(event => {
                  const cal = calendars.find(c => c.id === event.calendarId);
                  const { top, height } = getEventPosition(event, day);

                  return (
                    <div
                      key={event.id}
                      draggable
                      onDragStart={() => onDragStart(event)}
                      onClick={() => onEventClick(event)}
                      className="absolute left-0.5 right-0.5 px-1 py-0.5 rounded text-[10px] cursor-pointer overflow-hidden hover:ring-2 hover:ring-white/30 transition-shadow"
                      style={{
                        top,
                        height,
                        backgroundColor: cal?.color || '#0a84ff',
                      }}
                    >
                      <div className="font-medium text-white truncate">{event.title}</div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

// ============================================================================
// Month View
// ============================================================================

interface MonthViewProps {
  date: Date;
  selectedDate: Date;
  events: CalendarEvent[];
  calendars: CalendarData[];
  onSelectDate: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  onCreateEvent: (date: Date) => void;
  onDragStart: (event: CalendarEvent) => void;
  onDrop: (date: Date) => void;
  firstDayOfWeek: 0 | 1;
  showWeekNumbers: boolean;
}

const MonthView: React.FC<MonthViewProps> = ({
  date,
  selectedDate,
  events,
  calendars,
  onSelectDate,
  onEventClick,
  onCreateEvent,
  onDragStart,
  onDrop,
  firstDayOfWeek,
  showWeekNumbers,
}) => {
  const grid = getMonthGrid(date, firstDayOfWeek);
  const weekdays = firstDayOfWeek === 1
    ? [...WEEKDAYS_SHORT.slice(1), WEEKDAYS_SHORT[0]]
    : WEEKDAYS_SHORT;

  return (
    <div className="h-full flex flex-col">
      {/* Weekday headers */}
      <div className="flex border-b border-white/10 bg-[#252527]/50">
        {showWeekNumbers && (
          <div className="w-8 flex-shrink-0 text-center py-2 text-xs text-white/30">
            Wk
          </div>
        )}
        {weekdays.map((day, i) => (
          <div
            key={i}
            className="flex-1 text-center py-2 text-xs text-white/50 border-l border-white/5 first:border-l-0"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex-1 flex flex-col">
        {grid.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-1 border-b border-white/5 last:border-b-0">
            {showWeekNumbers && (
              <div className="w-8 flex-shrink-0 flex items-start justify-center pt-1 text-xs text-white/30">
                {getWeekNumber(week[0])}
              </div>
            )}
            {week.map((day, dayIndex) => {
              const isCurrentMonth = isSameMonth(day, date);
              const dayEvents = getEventsForDay(events, day, calendars);

              return (
                <div
                  key={dayIndex}
                  className={cn(
                    "flex-1 border-l border-white/5 first:border-l-0 p-1 min-h-[80px] cursor-pointer transition-colors",
                    !isCurrentMonth && "bg-black/20",
                    isSameDay(day, selectedDate) && "bg-white/5"
                  )}
                  onClick={() => onSelectDate(day)}
                  onDoubleClick={() => onCreateEvent(day)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => onDrop(day)}
                >
                  <div className={cn(
                    "w-6 h-6 flex items-center justify-center rounded-full text-sm mb-1",
                    isToday(day) && "bg-[#0a84ff] text-white font-medium",
                    !isToday(day) && isCurrentMonth && "text-white/80",
                    !isToday(day) && !isCurrentMonth && "text-white/30"
                  )}>
                    {day.getDate()}
                  </div>
                  <div className="space-y-0.5 overflow-hidden">
                    {dayEvents.slice(0, 3).map(event => {
                      const cal = calendars.find(c => c.id === event.calendarId);
                      return (
                        <div
                          key={event.id}
                          draggable
                          onDragStart={(e) => {
                            e.stopPropagation();
                            onDragStart(event);
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick(event);
                          }}
                          className="text-[10px] px-1 py-0.5 rounded truncate cursor-pointer hover:ring-1 hover:ring-white/30"
                          style={{ backgroundColor: cal?.color || '#0a84ff' }}
                        >
                          {!event.allDay && (
                            <span className="text-white/70 mr-1">
                              {formatTime(new Date(event.start))}
                            </span>
                          )}
                          <span className="text-white">{event.title}</span>
                        </div>
                      );
                    })}
                    {dayEvents.length > 3 && (
                      <div className="text-[10px] text-white/50 px-1">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// Year View
// ============================================================================

interface YearViewProps {
  date: Date;
  events: CalendarEvent[];
  calendars: CalendarData[];
  onSelectMonth: (date: Date) => void;
  firstDayOfWeek: 0 | 1;
}

const YearView: React.FC<YearViewProps> = ({
  date,
  events,
  calendars,
  onSelectMonth,
  firstDayOfWeek,
}) => {
  const year = date.getFullYear();
  const months = Array.from({ length: 12 }, (_, i) => new Date(year, i, 1));

  return (
    <ScrollArea className="h-full">
      <div className="grid grid-cols-3 md:grid-cols-4 gap-4 p-4">
        {months.map((monthDate, i) => {
          const grid = getMonthGrid(monthDate, firstDayOfWeek);
          const weekdays = firstDayOfWeek === 1
            ? ['M', 'T', 'W', 'T', 'F', 'S', 'S']
            : ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

          return (
            <div
              key={i}
              className="bg-[#252527]/50 rounded-lg p-3 cursor-pointer hover:bg-[#252527]/80 transition-colors"
              onClick={() => onSelectMonth(monthDate)}
            >
              <h3 className="text-sm font-medium text-white/80 mb-2">
                {MONTHS_FULL[i]}
              </h3>
              <div className="grid grid-cols-7 gap-0.5 text-center">
                {weekdays.map((day, j) => (
                  <div key={j} className="text-[8px] text-white/30">
                    {day}
                  </div>
                ))}
                {grid.flat().map((day, j) => {
                  const isCurrentMonth = isSameMonth(day, monthDate);
                  const hasEvents = getEventsForDay(events, day, calendars).length > 0;

                  return (
                    <div
                      key={j}
                      className={cn(
                        "text-[9px] py-0.5 rounded relative",
                        isCurrentMonth ? "text-white/60" : "text-white/20",
                        isToday(day) && "bg-[#0a84ff] text-white font-medium"
                      )}
                    >
                      {day.getDate()}
                      {hasEvents && !isToday(day) && (
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-0.5 bg-[#0a84ff] rounded-full" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};

// ============================================================================
// Agenda View
// ============================================================================

interface AgendaViewProps {
  date: Date;
  events: CalendarEvent[];
  calendars: CalendarData[];
  onEventClick: (event: CalendarEvent) => void;
}

const AgendaView: React.FC<AgendaViewProps> = ({
  date,
  events,
  calendars,
  onEventClick,
}) => {
  const visibleCalendars = calendars.filter(c => c.visible).map(c => c.id);

  // Get events for the next 30 days
  const endDate = addDays(date, 30);
  const upcomingEvents = events
    .filter(e => {
      if (!visibleCalendars.includes(e.calendarId)) return false;
      const eventStart = new Date(e.start);
      return eventStart >= startOfDay(date) && eventStart <= endDate;
    })
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  // Group by date
  const grouped = upcomingEvents.reduce((acc, event) => {
    const dateKey = startOfDay(new Date(event.start)).toISOString();
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(event);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {Object.entries(grouped).map(([dateKey, dateEvents]) => {
          const eventDate = new Date(dateKey);

          return (
            <div key={dateKey}>
              <div className="flex items-center gap-3 mb-2">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex flex-col items-center justify-center",
                  isToday(eventDate) ? "bg-[#0a84ff]" : "bg-white/10"
                )}>
                  <span className="text-[10px] text-white/60 uppercase">
                    {WEEKDAYS_SHORT[eventDate.getDay()]}
                  </span>
                  <span className="text-sm font-medium text-white">
                    {eventDate.getDate()}
                  </span>
                </div>
                <div>
                  <div className="text-white/80 font-medium">
                    {eventDate.toLocaleDateString('en-US', { weekday: 'long' })}
                  </div>
                  <div className="text-xs text-white/50">
                    {eventDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 ml-[52px]">
                {dateEvents.map(event => {
                  const cal = calendars.find(c => c.id === event.calendarId);
                  const start = new Date(event.start);
                  const end = new Date(event.end);

                  return (
                    <button
                      key={event.id}
                      onClick={() => onEventClick(event)}
                      className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-1 h-full min-h-[40px] rounded-full flex-shrink-0"
                          style={{ backgroundColor: cal?.color || '#0a84ff' }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-white">{event.title}</div>
                          <div className="text-sm text-white/50">
                            {event.allDay ? 'All day' : formatTimeRange(start, end)}
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-white/40">
                              <MapPin className="w-3 h-3" />
                              {event.location}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {Object.keys(grouped).length === 0 && (
          <div className="text-center py-12">
            <CalendarIcon className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/50">No upcoming events</p>
            <p className="text-sm text-white/30">Events for the next 30 days will appear here</p>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

// ============================================================================
// Cal.com Embed View
// ============================================================================

const CalEmbedView: React.FC = () => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="h-full relative">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1d1d1f] z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-white/20 border-t-[#0a84ff] rounded-full animate-spin" />
            <p className="text-white/50 text-sm">Loading booking calendar...</p>
          </div>
        </div>
      )}
      <iframe
        src={`https://cal.com/${CAL_LINK}?embed=true&theme=dark&layout=month_view`}
        className={cn(
          "w-full h-full border-0 transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0"
        )}
        onLoad={() => setLoaded(true)}
        allow="camera; microphone; fullscreen; display-capture"
      />
    </div>
  );
};

// ============================================================================
// Event Modal
// ============================================================================

interface EventModalProps {
  open: boolean;
  event: CalendarEvent | null;
  calendars: CalendarData[];
  onClose: () => void;
  onSave: (event: CalendarEvent) => void;
  onDelete: (eventId: string) => void;
}

const EventModal: React.FC<EventModalProps> = ({
  open,
  event,
  calendars,
  onClose,
  onSave,
  onDelete,
}) => {
  const [formData, setFormData] = useState<CalendarEvent | null>(null);

  useEffect(() => {
    setFormData(event);
  }, [event]);

  if (!formData) return null;

  const isEditing = !!formData.id;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim()) {
      onSave(formData);
    }
  };

  const formatDateTimeLocal = (iso: string) => {
    const d = new Date(iso);
    return d.toISOString().slice(0, 16);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#2d2d2f] border-white/10 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Event' : 'New Event'}</DialogTitle>
          <DialogDescription className="text-white/50">
            {isEditing ? 'Modify the event details below' : 'Fill in the event details below'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Event title"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#0a84ff]"
              autoFocus
            />
          </div>

          {/* All-day toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="allDay"
              checked={formData.allDay}
              onChange={(e) => setFormData({ ...formData, allDay: e.target.checked })}
              className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#0a84ff] focus:ring-[#0a84ff]"
            />
            <label htmlFor="allDay" className="text-sm text-white/80">All-day</label>
          </div>

          {/* Date/Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/50 mb-1 block">Start</label>
              <input
                type={formData.allDay ? "date" : "datetime-local"}
                value={formData.allDay
                  ? formData.start.split('T')[0]
                  : formatDateTimeLocal(formData.start)
                }
                onChange={(e) => {
                  const value = formData.allDay
                    ? new Date(e.target.value + 'T00:00:00').toISOString()
                    : new Date(e.target.value).toISOString();
                  setFormData({ ...formData, start: value });
                }}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0a84ff]"
              />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">End</label>
              <input
                type={formData.allDay ? "date" : "datetime-local"}
                value={formData.allDay
                  ? formData.end.split('T')[0]
                  : formatDateTimeLocal(formData.end)
                }
                onChange={(e) => {
                  const value = formData.allDay
                    ? new Date(e.target.value + 'T23:59:59').toISOString()
                    : new Date(e.target.value).toISOString();
                  setFormData({ ...formData, end: value });
                }}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0a84ff]"
              />
            </div>
          </div>

          {/* Calendar */}
          <div>
            <label className="text-xs text-white/50 mb-1 block">Calendar</label>
            <select
              value={formData.calendarId}
              onChange={(e) => setFormData({ ...formData, calendarId: e.target.value })}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0a84ff]"
            >
              {calendars.filter(c => !c.subscribed).map(cal => (
                <option key={cal.id} value={cal.id} className="bg-[#2d2d2f]">
                  {cal.name}
                </option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="text-xs text-white/50 mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Location
            </label>
            <input
              type="text"
              value={formData.location || ''}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Add location"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a84ff]"
            />
          </div>

          {/* Repeat */}
          <div>
            <label className="text-xs text-white/50 mb-1 flex items-center gap-1">
              <Repeat className="w-3 h-3" /> Repeat
            </label>
            <select
              value={formData.repeat}
              onChange={(e) => setFormData({ ...formData, repeat: e.target.value as RepeatType })}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0a84ff]"
            >
              <option value="none" className="bg-[#2d2d2f]">Never</option>
              <option value="daily" className="bg-[#2d2d2f]">Daily</option>
              <option value="weekly" className="bg-[#2d2d2f]">Weekly</option>
              <option value="monthly" className="bg-[#2d2d2f]">Monthly</option>
              <option value="yearly" className="bg-[#2d2d2f]">Yearly</option>
            </select>
          </div>

          {/* Alert */}
          <div>
            <label className="text-xs text-white/50 mb-1 flex items-center gap-1">
              <Bell className="w-3 h-3" /> Alert
            </label>
            <select
              value={formData.alerts[0] || 0}
              onChange={(e) => setFormData({ ...formData, alerts: [parseInt(e.target.value)] })}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0a84ff]"
            >
              <option value="0" className="bg-[#2d2d2f]">None</option>
              <option value="5" className="bg-[#2d2d2f]">5 minutes before</option>
              <option value="15" className="bg-[#2d2d2f]">15 minutes before</option>
              <option value="30" className="bg-[#2d2d2f]">30 minutes before</option>
              <option value="60" className="bg-[#2d2d2f]">1 hour before</option>
              <option value="1440" className="bg-[#2d2d2f]">1 day before</option>
            </select>
          </div>

          {/* Travel Time */}
          <div>
            <label className="text-xs text-white/50 mb-1 flex items-center gap-1">
              <Car className="w-3 h-3" /> Travel Time
            </label>
            <select
              value={formData.travelTime || 0}
              onChange={(e) => setFormData({ ...formData, travelTime: parseInt(e.target.value) || undefined })}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0a84ff]"
            >
              <option value="0" className="bg-[#2d2d2f]">None</option>
              <option value="5" className="bg-[#2d2d2f]">5 minutes</option>
              <option value="15" className="bg-[#2d2d2f]">15 minutes</option>
              <option value="30" className="bg-[#2d2d2f]">30 minutes</option>
              <option value="60" className="bg-[#2d2d2f]">1 hour</option>
              <option value="90" className="bg-[#2d2d2f]">1.5 hours</option>
              <option value="120" className="bg-[#2d2d2f]">2 hours</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs text-white/50 mb-1 block">Notes</label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add notes"
              rows={3}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a84ff] resize-none"
            />
          </div>

          {/* Actions */}
          <DialogFooter className="flex gap-2">
            {isEditing && (
              <button
                type="button"
                onClick={() => onDelete(formData.id)}
                className="flex items-center gap-1.5 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors mr-auto"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#0a84ff] hover:bg-[#0077ed] text-white rounded-lg transition-colors"
            >
              {isEditing ? 'Save' : 'Create'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ============================================================================
// Settings Modal
// ============================================================================

interface SettingsModalProps {
  open: boolean;
  settings: CalendarState['settings'];
  calendars: CalendarData[];
  onClose: () => void;
  onSave: (settings: CalendarState['settings']) => void;
  onAddCalendar: (calendar: CalendarData) => void;
  onDeleteCalendar: (id: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  open,
  settings,
  calendars,
  onClose,
  onSave,
  onAddCalendar,
  onDeleteCalendar,
}) => {
  const [formData, setFormData] = useState(settings);
  const [newCalName, setNewCalName] = useState('');
  const [newCalColor, setNewCalColor] = useState('#0a84ff');

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleAddCalendar = () => {
    if (newCalName.trim()) {
      onAddCalendar({
        id: generateId(),
        name: newCalName.trim(),
        color: newCalColor,
        visible: true,
        group: 'My Calendars',
      });
      setNewCalName('');
      setNewCalColor('#0a84ff');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#2d2d2f] border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle>Calendar Settings</DialogTitle>
          <DialogDescription className="text-white/50">
            Configure calendar preferences and manage calendars
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* General Settings */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-white/80">General</h3>

            <div className="flex items-center justify-between">
              <label className="text-sm text-white/60">Show week numbers</label>
              <input
                type="checkbox"
                checked={formData.showWeekNumbers}
                onChange={(e) => setFormData({ ...formData, showWeekNumbers: e.target.checked })}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#0a84ff] focus:ring-[#0a84ff]"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm text-white/60">Start week on</label>
              <select
                value={formData.firstDayOfWeek}
                onChange={(e) => setFormData({ ...formData, firstDayOfWeek: parseInt(e.target.value) as 0 | 1 })}
                className="px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0a84ff]"
              >
                <option value="0" className="bg-[#2d2d2f]">Sunday</option>
                <option value="1" className="bg-[#2d2d2f]">Monday</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm text-white/60">Default view</label>
              <select
                value={formData.defaultView}
                onChange={(e) => setFormData({ ...formData, defaultView: e.target.value as ViewType })}
                className="px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0a84ff]"
              >
                <option value="day" className="bg-[#2d2d2f]">Day</option>
                <option value="week" className="bg-[#2d2d2f]">Week</option>
                <option value="month" className="bg-[#2d2d2f]">Month</option>
                <option value="year" className="bg-[#2d2d2f]">Year</option>
                <option value="agenda" className="bg-[#2d2d2f]">Agenda</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm text-white/60">Timezone</label>
              <span className="text-sm text-white/40">{formData.timezone}</span>
            </div>
          </div>

          {/* Calendars */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-white/80">Calendars</h3>

            <div className="space-y-1.5">
              {calendars.filter(c => !c.subscribed).map(cal => (
                <div key={cal.id} className="flex items-center gap-2 p-2 rounded bg-white/5">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: cal.color }}
                  />
                  <span className="flex-1 text-sm text-white/80">{cal.name}</span>
                  {!['personal', 'work', 'family', 'birthdays'].includes(cal.id) && (
                    <button
                      onClick={() => onDeleteCalendar(cal.id)}
                      className="p-1 text-white/40 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add new calendar */}
            <div className="flex gap-2">
              <input
                type="color"
                value={newCalColor}
                onChange={(e) => setNewCalColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
              />
              <input
                type="text"
                value={newCalName}
                onChange={(e) => setNewCalName(e.target.value)}
                placeholder="New calendar name"
                className="flex-1 px-2 py-1 bg-white/5 border border-white/10 rounded text-white placeholder:text-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a84ff]"
                onKeyDown={(e) => e.key === 'Enter' && handleAddCalendar()}
              />
              <button
                onClick={handleAddCalendar}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-sm rounded transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            className="px-4 py-2 bg-[#0a84ff] hover:bg-[#0077ed] text-white rounded-lg transition-colors"
          >
            Save
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ZCalendarWindow;
