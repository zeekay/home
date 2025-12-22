import React, { useEffect, useRef, useState } from 'react';
import { Twitter, ExternalLink, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { socialProfiles } from '@/data/socials';

interface TwitterFeedProps {
  className?: string;
}

declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: (element?: HTMLElement) => void;
        createTimeline: (
          dataSource: { sourceType: string; screenName?: string },
          element: HTMLElement,
          options?: Record<string, unknown>
        ) => Promise<HTMLElement>;
      };
    };
  }
}

const TwitterFeed: React.FC<TwitterFeedProps> = ({ className }) => {
  const embedContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  const twitterProfile = socialProfiles.twitter;
  const twitterHandle = twitterProfile.handle;

  useEffect(() => {
    // Load Twitter widgets script
    const loadTwitterScript = () => {
      if (window.twttr) {
        renderTimeline();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://platform.twitter.com/widgets.js';
      script.async = true;
      script.onload = () => {
        renderTimeline();
      };
      script.onerror = () => {
        setIsLoading(false);
        setHasError(true);
      };
      document.body.appendChild(script);
    };

    const renderTimeline = () => {
      if (!embedContainerRef.current || !window.twttr) return;

      // Clear existing content
      embedContainerRef.current.innerHTML = '';

      window.twttr.widgets
        .createTimeline(
          {
            sourceType: 'profile',
            screenName: twitterHandle,
          },
          embedContainerRef.current,
          {
            theme: 'dark',
            chrome: 'noheader nofooter noborders transparent',
            height: 500,
            dnt: true,
            tweetLimit: 10,
          }
        )
        .then(() => {
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
          setHasError(true);
        });
    };

    loadTwitterScript();
  }, [twitterHandle]);

  return (
    <div className={cn('glass-card rounded-xl overflow-hidden', className)}>
      {/* Header */}
      <div className="bg-accent/50 dark:bg-accent/30 p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center">
          <Twitter className="mr-2" size={18} />
          <h2 className="text-lg font-medium">X / Twitter</h2>
          <a
            href={twitterProfile.url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 text-xs py-0.5 px-2 bg-black text-white rounded-full hover:bg-zinc-800 transition-colors flex items-center gap-1"
          >
            @{twitterHandle}
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <a
          href={twitterProfile.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          View Profile <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Twitter Timeline Embed */}
      <div className="p-4 h-[520px] overflow-hidden bg-zinc-900/50">
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <RefreshCw className="w-8 h-8 animate-spin mb-3" />
            <p className="text-sm">Loading tweets...</p>
          </div>
        )}
        
        {hasError && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Twitter className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-sm mb-2">Could not load tweets</p>
            <a
              href={twitterProfile.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              View on X <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
        
        <div
          ref={embedContainerRef}
          className={cn(
            'h-full overflow-y-auto scrollbar-thin',
            isLoading || hasError ? 'hidden' : 'block'
          )}
        />
      </div>
    </div>
  );
};

export default TwitterFeed;
