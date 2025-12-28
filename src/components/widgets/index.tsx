import React from 'react';
import { useWidgets, type WidgetInstance } from '@/contexts/WidgetContext';
import ClockWidget from './ClockWidget';
import WeatherWidget from './WeatherWidget';
import CalendarWidget from './CalendarWidget';
import StocksWidget from './StocksWidget';
import NotesWidget from './NotesWidget';
import PhotosWidget from './PhotosWidget';
import BatteryWidget from './BatteryWidget';
import WidgetGallery from './WidgetGallery';

// Widget component map
const WIDGET_COMPONENTS: Record<string, React.FC<{ widget: WidgetInstance }>> = {
  clock: ClockWidget,
  weather: WeatherWidget,
  calendar: CalendarWidget,
  stocks: StocksWidget,
  notes: NotesWidget,
  photos: PhotosWidget,
  battery: BatteryWidget,
};

// Render a single widget by type
const WidgetRenderer: React.FC<{ widget: WidgetInstance }> = ({ widget }) => {
  const Component = WIDGET_COMPONENTS[widget.type];
  if (!Component) return null;
  return <Component widget={widget} />;
};

// Widgets layer component for desktop
export const WidgetsLayer: React.FC = () => {
  const { widgets } = useWidgets();

  return (
    <>
      {/* Widget instances */}
      {widgets.map(widget => (
        <WidgetRenderer key={widget.id} widget={widget} />
      ))}

      {/* Widget gallery overlay */}
      <WidgetGallery />
    </>
  );
};

// Export individual widgets for direct use if needed
export { default as DesktopWidget } from './DesktopWidget';
export { default as ClockWidget } from './ClockWidget';
export { default as WeatherWidget } from './WeatherWidget';
export { default as CalendarWidget } from './CalendarWidget';
export { default as StocksWidget } from './StocksWidget';
export { default as NotesWidget } from './NotesWidget';
export { default as PhotosWidget } from './PhotosWidget';
export { default as BatteryWidget } from './BatteryWidget';
export { default as WidgetGallery } from './WidgetGallery';
