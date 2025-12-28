import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { X, Plus, Clock, Cloud, Calendar, TrendingUp, StickyNote, Image, Battery } from 'lucide-react';
import { useWidgets, WIDGET_METADATA, type WidgetType, type WidgetSize } from '@/contexts/WidgetContext';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Clock,
  Cloud,
  Calendar,
  TrendingUp,
  StickyNote,
  Image,
  Battery,
};

const WidgetGallery: React.FC = () => {
  const { showGallery, closeGallery, addWidget } = useWidgets();
  const [selectedType, setSelectedType] = useState<WidgetType | null>(null);
  const [selectedSize, setSelectedSize] = useState<WidgetSize>('small');

  if (!showGallery) return null;

  const handleAdd = () => {
    if (selectedType) {
      addWidget(selectedType, selectedSize);
      setSelectedType(null);
      setSelectedSize('small');
    }
  };

  const widgetTypes = Object.entries(WIDGET_METADATA) as [WidgetType, typeof WIDGET_METADATA[WidgetType]][];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeGallery}
      />

      {/* Gallery Panel */}
      <div className="relative w-full max-w-lg mx-4 bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-white text-lg font-semibold">Add Widget</h2>
          <button
            onClick={closeGallery}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white/70" />
          </button>
        </div>

        {/* Widget Grid */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {selectedType === null ? (
            <div className="grid grid-cols-2 gap-3">
              {widgetTypes.map(([type, meta]) => {
                const IconComponent = ICON_MAP[meta.icon] || Clock;
                return (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={cn(
                      'flex flex-col items-center p-4 rounded-xl',
                      'bg-white/5 hover:bg-white/10 border border-white/10',
                      'transition-all hover:scale-[1.02]'
                    )}
                  >
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-3">
                      <IconComponent className="w-6 h-6 text-white/80" />
                    </div>
                    <p className="text-white font-medium text-sm">{meta.name}</p>
                    <p className="text-white/50 text-xs mt-1 text-center">{meta.description}</p>
                  </button>
                );
              })}
            </div>
          ) : (
            /* Size Selection */
            <div className="space-y-4">
              <button
                onClick={() => setSelectedType(null)}
                className="text-white/60 hover:text-white text-sm flex items-center gap-1"
              >
                Back to widgets
              </button>

              <div className="flex items-center gap-3 mb-4">
                {(() => {
                  const meta = WIDGET_METADATA[selectedType];
                  const IconComponent = ICON_MAP[meta.icon] || Clock;
                  return (
                    <>
                      <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                        <IconComponent className="w-6 h-6 text-white/80" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{meta.name}</p>
                        <p className="text-white/50 text-sm">{meta.description}</p>
                      </div>
                    </>
                  );
                })()}
              </div>

              <p className="text-white/70 text-sm mb-3">Choose a size:</p>

              <div className="grid grid-cols-3 gap-3">
                {WIDGET_METADATA[selectedType].availableSizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      'flex flex-col items-center p-4 rounded-xl border transition-all',
                      selectedSize === size
                        ? 'bg-blue-500/20 border-blue-500'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    )}
                  >
                    <div className={cn(
                      'bg-white/10 rounded-lg mb-2',
                      size === 'small' && 'w-8 h-8',
                      size === 'medium' && 'w-8 h-16',
                      size === 'large' && 'w-16 h-16',
                    )} />
                    <p className="text-white text-sm capitalize">{size}</p>
                  </button>
                ))}
              </div>

              <button
                onClick={handleAdd}
                className={cn(
                  'w-full mt-4 py-3 rounded-xl font-medium flex items-center justify-center gap-2',
                  'bg-blue-500 hover:bg-blue-600 text-white transition-colors'
                )}
              >
                <Plus className="w-5 h-5" />
                Add Widget
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WidgetGallery;
