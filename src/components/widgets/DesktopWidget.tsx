import React, { useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { useWidgets, WIDGET_SIZES, type WidgetSize, type WidgetInstance } from '@/contexts/WidgetContext';

interface DesktopWidgetProps {
  widget: WidgetInstance;
  children: ReactNode;
  className?: string;
}

const DesktopWidget: React.FC<DesktopWidgetProps> = ({ widget, children, className }) => {
  const { editMode, removeWidget, moveWidget, resizeWidget } = useWidgets();
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);
  
  const dimensions = WIDGET_SIZES[widget.size];

  // Handle drag start
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!editMode) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - widget.position.x,
      y: e.clientY - widget.position.y,
    });
  }, [editMode, widget.position]);

  // Handle drag
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const menuBarHeight = 28;
      const dockHeight = 90;
      const padding = 10;
      
      const x = Math.max(padding, Math.min(e.clientX - dragOffset.x, window.innerWidth - dimensions.width - padding));
      const y = Math.max(menuBarHeight + padding, Math.min(e.clientY - dragOffset.y, window.innerHeight - dimensions.height - dockHeight - padding));
      
      moveWidget(widget.id, { x, y });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, widget.id, dimensions, moveWidget]);

  // Handle touch events for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!editMode) return;
    
    const touch = e.touches[0];
    setIsDragging(true);
    setDragOffset({
      x: touch.clientX - widget.position.x,
      y: touch.clientY - widget.position.y,
    });
  }, [editMode, widget.position]);

  useEffect(() => {
    if (!isDragging) return;

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const menuBarHeight = 28;
      const dockHeight = 90;
      const padding = 10;
      
      const x = Math.max(padding, Math.min(touch.clientX - dragOffset.x, window.innerWidth - dimensions.width - padding));
      const y = Math.max(menuBarHeight + padding, Math.min(touch.clientY - dragOffset.y, window.innerHeight - dimensions.height - dockHeight - padding));
      
      moveWidget(widget.id, { x, y });
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, dragOffset, widget.id, dimensions, moveWidget]);

  // Handle remove
  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    removeWidget(widget.id);
  }, [widget.id, removeWidget]);

  // Handle resize
  const handleResize = useCallback((size: WidgetSize) => {
    resizeWidget(widget.id, size);
    setShowSizeMenu(false);
  }, [widget.id, resizeWidget]);

  // Close size menu when clicking outside
  useEffect(() => {
    if (!showSizeMenu) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(e.target as Node)) {
        setShowSizeMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showSizeMenu]);

  return (
    <div
      ref={widgetRef}
      className={cn(
        'absolute rounded-3xl overflow-hidden',
        'vibrancy-widget',
        'transition-transform duration-200',
        isDragging && 'scale-105 shadow-2xl z-50',
        editMode && !isDragging && 'animate-widget-jiggle cursor-grab',
        editMode && isDragging && 'cursor-grabbing',
        className
      )}
      style={{
        left: widget.position.x,
        top: widget.position.y,
        width: dimensions.width,
        height: dimensions.height,
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Remove button - visible in edit mode */}
      {editMode && (
        <button
          onClick={handleRemove}
          className={cn(
            'absolute -top-2 -left-2 z-10',
            'w-6 h-6 rounded-full',
            'bg-gray-800 border border-white/30',
            'flex items-center justify-center',
            'hover:bg-gray-700 transition-colors',
            'shadow-lg'
          )}
        >
          <X className="w-3.5 h-3.5 text-white" />
        </button>
      )}

      {/* Size menu toggle - visible in edit mode */}
      {editMode && (
        <div className="absolute -bottom-2 -right-2 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowSizeMenu(!showSizeMenu);
            }}
            className={cn(
              'w-6 h-6 rounded-full',
              'bg-gray-800 border border-white/30',
              'flex items-center justify-center',
              'hover:bg-gray-700 transition-colors',
              'shadow-lg text-white text-xs font-bold'
            )}
          >
            {widget.size === 'small' ? 'S' : widget.size === 'medium' ? 'M' : 'L'}
          </button>
          
          {/* Size selection menu */}
          {showSizeMenu && (
            <div className="absolute bottom-8 right-0 bg-gray-800/95 backdrop-blur-sm rounded-lg border border-white/20 shadow-xl overflow-hidden">
              {(['small', 'medium', 'large'] as WidgetSize[]).map(size => (
                <button
                  key={size}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleResize(size);
                  }}
                  className={cn(
                    'block w-full px-4 py-2 text-left text-sm text-white/80 hover:bg-white/10 transition-colors',
                    widget.size === size && 'bg-white/10 text-white'
                  )}
                >
                  {size.charAt(0).toUpperCase() + size.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Widget content */}
      <div className="w-full h-full">
        {children}
      </div>
    </div>
  );
};

export default DesktopWidget;
