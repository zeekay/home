
import React, { useState, useCallback } from 'react';

interface WindowControlsProps {
  onClose: () => void;
  onMinimize: () => void;
  onMaximize?: () => void;
  isMaximized?: boolean;
  isActive?: boolean;
  disabled?: boolean;
}

// Apple traffic light exact colors
const COLORS = {
  close: {
    bg: '#FF5F57',
    bgHover: '#FF5F57',
    bgPressed: '#BF4942',
    icon: '#4D0000',
    inactive: '#4D4D4D',
    inactiveBorder: '#3D3D3D',
  },
  minimize: {
    bg: '#FFBD2E',
    bgHover: '#FFBD2E',
    bgPressed: '#BF9022',
    icon: '#985700',
    inactive: '#4D4D4D',
    inactiveBorder: '#3D3D3D',
  },
  maximize: {
    bg: '#28C840',
    bgHover: '#28C840',
    bgPressed: '#1E9930',
    icon: '#006500',
    inactive: '#4D4D4D',
    inactiveBorder: '#3D3D3D',
  },
} as const;

// SVG icons matching Apple's exact design
const CloseIcon = () => (
  <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M1.5 1.5L6.5 6.5M6.5 1.5L1.5 6.5"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>
);

const MinimizeIcon = () => (
  <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M1.5 4H6.5"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>
);

const MaximizeIcon = () => (
  <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M1.5 1.5L6.5 6.5M6.5 1.5L1.5 6.5"
      stroke="currentColor"
      strokeWidth="0"
      fill="none"
    />
    <path
      d="M1.5 2.5V1.5H2.5M5.5 1.5H6.5V2.5M6.5 5.5V6.5H5.5M2.5 6.5H1.5V5.5"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const RestoreIcon = () => (
  <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M2.5 2.5L5.5 5.5M5.5 2.5L2.5 5.5"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="round"
    />
  </svg>
);

// Fullscreen arrows icon (shown with Option key)
const FullscreenIcon = () => (
  <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M1 3V1H3M5 1H7V3M7 5V7H5M3 7H1V5"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface TrafficLightButtonProps {
  type: 'close' | 'minimize' | 'maximize';
  onClick: (e: React.MouseEvent) => void;
  isGroupHovered: boolean;
  isActive: boolean;
  isMaximized?: boolean;
  isOptionPressed?: boolean;
  disabled?: boolean;
  tooltip: string;
}

const TrafficLightButton: React.FC<TrafficLightButtonProps> = ({
  type,
  onClick,
  isGroupHovered,
  isActive,
  isMaximized = false,
  isOptionPressed = false,
  disabled = false,
  tooltip,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const colors = COLORS[type];

  const getBackgroundColor = () => {
    if (!isActive) return colors.inactive;
    if (disabled) return colors.inactive;
    if (isPressed) return colors.bgPressed;
    return colors.bg;
  };

  const getBorderColor = () => {
    if (!isActive) return colors.inactiveBorder;
    if (disabled) return colors.inactiveBorder;
    return 'transparent';
  };

  const getIcon = () => {
    if (!isActive || disabled) return null;
    if (!isGroupHovered && !isFocused) return null;

    const iconColor = colors.icon;

    switch (type) {
      case 'close':
        return <CloseIcon />;
      case 'minimize':
        return <MinimizeIcon />;
      case 'maximize':
        if (isOptionPressed) {
          return <FullscreenIcon />;
        }
        return isMaximized ? <RestoreIcon /> : <MaximizeIcon />;
      default:
        return null;
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPressed(true);
  };

  const handleMouseUp = () => {
    setIsPressed(false);
  };

  const handleMouseLeave = () => {
    setIsPressed(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled) {
      onClick(e);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!disabled) {
        onClick(e as unknown as React.MouseEvent);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      title={tooltip}
      aria-label={tooltip}
      aria-disabled={disabled}
      className="relative flex items-center justify-center transition-all duration-75"
      style={{
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        backgroundColor: getBackgroundColor(),
        border: `0.5px solid ${getBorderColor()}`,
        boxShadow: isActive && !disabled
          ? 'inset 0 0 0 0.5px rgba(0,0,0,0.1), 0 1px 0 rgba(255,255,255,0.05)'
          : 'inset 0 0 0 0.5px rgba(0,0,0,0.2)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        outline: 'none',
        // Focus ring for accessibility
        ...(isFocused && !disabled ? {
          boxShadow: `0 0 0 2px rgba(59, 130, 246, 0.5), inset 0 0 0 0.5px rgba(0,0,0,0.1)`,
        } : {}),
      }}
    >
      <span
        className="flex items-center justify-center transition-opacity duration-75"
        style={{
          color: colors.icon,
          opacity: (isGroupHovered || isFocused) && isActive && !disabled ? 1 : 0,
        }}
      >
        {getIcon()}
      </span>
    </button>
  );
};

const WindowControls: React.FC<WindowControlsProps> = ({
  onClose,
  onMinimize,
  onMaximize,
  isMaximized = false,
  isActive = true,
  disabled = false,
}) => {
  const [isGroupHovered, setIsGroupHovered] = useState(false);
  const [isOptionPressed, setIsOptionPressed] = useState(false);

  // Track Option key state for fullscreen behavior
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Alt') {
      setIsOptionPressed(true);
    }
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Alt') {
      setIsOptionPressed(false);
    }
  }, []);

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const handleMaximizeClick = (e: React.MouseEvent) => {
    if (onMaximize) {
      // Option+click behavior could trigger fullscreen in a real implementation
      // For now, just call the regular maximize
      onMaximize();
    }
  };

  return (
    <div
      className="flex items-center"
      style={{
        gap: '8px',
        paddingLeft: '0px', // 12px from window edge is handled by parent padding
      }}
      role="group"
      aria-label="Window controls"
      onMouseEnter={() => setIsGroupHovered(true)}
      onMouseLeave={() => setIsGroupHovered(false)}
    >
      <TrafficLightButton
        type="close"
        onClick={onClose}
        isGroupHovered={isGroupHovered}
        isActive={isActive}
        disabled={disabled}
        tooltip="Close"
      />
      <TrafficLightButton
        type="minimize"
        onClick={onMinimize}
        isGroupHovered={isGroupHovered}
        isActive={isActive}
        disabled={disabled}
        tooltip="Minimize"
      />
      <TrafficLightButton
        type="maximize"
        onClick={handleMaximizeClick}
        isGroupHovered={isGroupHovered}
        isActive={isActive}
        isMaximized={isMaximized}
        isOptionPressed={isOptionPressed}
        disabled={disabled || !onMaximize}
        tooltip={
          isOptionPressed
            ? 'Enter Full Screen'
            : isMaximized
              ? 'Exit Full Screen'
              : 'Zoom'
        }
      />
    </div>
  );
};

export default WindowControls;
