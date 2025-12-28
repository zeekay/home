import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Image as ImageIcon } from 'lucide-react';
import DesktopWidget from './DesktopWidget';
import { type WidgetInstance } from '@/contexts/WidgetContext';

interface PhotosWidgetProps {
  widget: WidgetInstance;
}

// Sample photos from Unsplash
const SAMPLE_PHOTOS = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1518173946687-a4c036bc1f8e?w=800&h=600&fit=crop',
];

const PhotosWidget: React.FC<PhotosWidgetProps> = ({ widget }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const isSmall = widget.size === 'small';
  const isLarge = widget.size === 'large';

  // Auto-advance slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % SAMPLE_PHOTOS.length);
      setLoading(true);
      setError(false);
    }, 5000); // Change photo every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const currentPhoto = SAMPLE_PHOTOS[currentIndex];

  return (
    <DesktopWidget widget={widget}>
      <div className="relative w-full h-full overflow-hidden rounded-3xl bg-black">
        {/* Loading/Error state */}
        {(loading || error) && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/5">
            <ImageIcon className={cn(
              'text-white/30',
              isSmall ? 'w-8 h-8' : 'w-12 h-12'
            )} />
          </div>
        )}

        {/* Photo */}
        <img
          src={currentPhoto}
          alt={`Photo ${currentIndex + 1}`}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-500',
            loading && 'opacity-0',
            !loading && 'opacity-100'
          )}
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Progress indicators */}
        {!isSmall && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {SAMPLE_PHOTOS.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setCurrentIndex(i);
                  setLoading(true);
                }}
                className={cn(
                  'w-1.5 h-1.5 rounded-full transition-all',
                  i === currentIndex
                    ? 'bg-white w-4'
                    : 'bg-white/50 hover:bg-white/70'
                )}
              />
            ))}
          </div>
        )}

        {/* Photo info for large size */}
        {isLarge && (
          <div className="absolute bottom-8 left-4 right-4">
            <p className="text-white/80 text-sm">Photo {currentIndex + 1} of {SAMPLE_PHOTOS.length}</p>
            <p className="text-white/50 text-xs mt-1">From your Photo Library</p>
          </div>
        )}
      </div>
    </DesktopWidget>
  );
};

export default PhotosWidget;
