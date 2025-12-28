
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { TerminalPane, TerminalProfile, SplitDirection } from '@/types/terminal';
import { cn } from '@/lib/utils';
import Terminal from '@/components/Terminal';

interface TerminalPaneContainerProps {
  pane: TerminalPane;
  profile: TerminalProfile;
  onSplit: (paneId: string, direction: SplitDirection) => void;
  onClose: (paneId: string) => void;
  onFocus: (paneId: string) => void;
  getProfile: (profileId: string) => TerminalProfile;
  isSinglePane: boolean;
}

interface PaneNodeProps {
  pane: TerminalPane;
  profile: TerminalProfile;
  getProfile: (profileId: string) => TerminalProfile;
  onFocus: (paneId: string) => void;
  onClose: (paneId: string) => void;
  onSplit: (paneId: string, direction: SplitDirection) => void;
  depth: number;
  isSinglePane: boolean;
}

const PaneNode: React.FC<PaneNodeProps> = ({
  pane,
  profile,
  getProfile,
  onFocus,
  onClose,
  onSplit,
  depth,
  isSinglePane,
}) => {
  const [splitRatio, setSplitRatio] = useState(pane.splitRatio);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      let ratio: number;

      if (pane.splitDirection === 'vertical') {
        ratio = (e.clientX - rect.left) / rect.width;
      } else {
        ratio = (e.clientY - rect.top) / rect.height;
      }

      // Clamp between 20% and 80%
      ratio = Math.max(0.2, Math.min(0.8, ratio));
      setSplitRatio(ratio);
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [pane.splitDirection]);

  // Leaf node - render terminal
  if (!pane.children) {
    const paneProfile = getProfile(pane.profileId);
    return (
      <div
        className={cn(
          'flex-1 min-w-0 min-h-0 relative',
          pane.isActive && 'ring-1 ring-cyan-500/50'
        )}
        onClick={() => onFocus(pane.id)}
      >
        <Terminal
          className="w-full h-full"
          customFontSize={paneProfile.fontSize}
          customPadding={paneProfile.padding}
          customTheme="dark"
          sessionId={pane.sessionId}
        />
      </div>
    );
  }

  // Split node - render children
  const [first, second] = pane.children;
  const isVertical = pane.splitDirection === 'vertical';

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex flex-1 min-w-0 min-h-0',
        isVertical ? 'flex-row' : 'flex-col'
      )}
    >
      <div
        style={{
          [isVertical ? 'width' : 'height']: `${splitRatio * 100}%`,
        }}
        className="flex min-w-0 min-h-0"
      >
        <PaneNode
          pane={first}
          profile={getProfile(first.profileId)}
          getProfile={getProfile}
          onFocus={onFocus}
          onClose={onClose}
          onSplit={onSplit}
          depth={depth + 1}
          isSinglePane={false}
        />
      </div>

      {/* Resize divider */}
      <div
        onMouseDown={handleDragStart}
        className={cn(
          'flex-shrink-0 bg-white/10 hover:bg-cyan-500/50 transition-colors',
          isVertical
            ? 'w-1 cursor-col-resize hover:w-1.5'
            : 'h-1 cursor-row-resize hover:h-1.5'
        )}
      />

      <div
        style={{
          [isVertical ? 'width' : 'height']: `${(1 - splitRatio) * 100}%`,
        }}
        className="flex min-w-0 min-h-0"
      >
        <PaneNode
          pane={second}
          profile={getProfile(second.profileId)}
          getProfile={getProfile}
          onFocus={onFocus}
          onClose={onClose}
          onSplit={onSplit}
          depth={depth + 1}
          isSinglePane={false}
        />
      </div>
    </div>
  );
};

const TerminalPaneContainer: React.FC<TerminalPaneContainerProps> = ({
  pane,
  profile,
  onSplit,
  onClose,
  onFocus,
  getProfile,
  isSinglePane,
}) => {
  return (
    <div className="flex-1 flex min-h-0 min-w-0">
      <PaneNode
        pane={pane}
        profile={profile}
        getProfile={getProfile}
        onFocus={onFocus}
        onClose={onClose}
        onSplit={onSplit}
        depth={0}
        isSinglePane={isSinglePane}
      />
    </div>
  );
};

export default TerminalPaneContainer;
