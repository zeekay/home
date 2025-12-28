// Menu Bar Context Menu
// Context menu for menu bar items and status icons

import React from 'react';
import {
  ContextMenu,
  ContextMenuTrigger,
  MacContextMenuContent,
  MacMenuItem,
  MacSeparator,
  MacSubmenu,
} from './ContextMenuBase';
import {
  Settings,
  Eye,
  EyeOff,
  Move,
  ArrowLeft,
  ArrowRight,
  Monitor,
  Power,
  RefreshCw,
  Info,
  X,
  Sparkles,
} from 'lucide-react';

type MenuBarItemType = 'system' | 'app' | 'status' | 'control-center' | 'notification';

interface MenuBarItem {
  id: string;
  name: string;
  type: MenuBarItemType;
  isHidden?: boolean;
  canHide?: boolean;
  canRemove?: boolean;
}

interface MenuBarContextMenuProps {
  children: React.ReactNode;
  item: MenuBarItem;
  onShowItem?: () => void;
  onHideItem?: () => void;
  onRemoveItem?: () => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  onOpenPreferences?: () => void;
  onRestartService?: () => void;
  onQuitService?: () => void;
  onAbout?: () => void;
}

const MenuBarContextMenu: React.FC<MenuBarContextMenuProps> = ({
  children,
  item,
  onShowItem,
  onHideItem,
  onRemoveItem,
  onMoveLeft,
  onMoveRight,
  onOpenPreferences,
  onRestartService,
  onQuitService,
  onAbout,
}) => {
  const isSystemItem = item.type === 'system';
  const isAppItem = item.type === 'app';
  const isStatusItem = item.type === 'status';
  const isControlCenter = item.type === 'control-center';
  const canHide = item.canHide ?? true;
  const canRemove = item.canRemove ?? false;
  const isHidden = item.isHidden ?? false;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <MacContextMenuContent>
        {/* Show/Hide */}
        {canHide && (
          <>
            {isHidden ? (
              <MacMenuItem
                icon={<Eye className="w-4 h-4" />}
                label={`Show ${item.name}`}
                onClick={onShowItem}
              />
            ) : (
              <MacMenuItem
                icon={<EyeOff className="w-4 h-4" />}
                label={`Hide ${item.name}`}
                onClick={onHideItem}
              />
            )}
          </>
        )}

        {/* Rearrange (for status items) */}
        {isStatusItem && (
          <>
            <MacSeparator />
            <MacMenuItem
              icon={<ArrowLeft className="w-4 h-4" />}
              label="Move Left"
              onClick={onMoveLeft}
            />
            <MacMenuItem
              icon={<ArrowRight className="w-4 h-4" />}
              label="Move Right"
              onClick={onMoveRight}
            />
          </>
        )}

        <MacSeparator />

        {/* Preferences */}
        <MacMenuItem
          icon={<Settings className="w-4 h-4" />}
          label={isControlCenter ? 'Control Center Preferences...' : `${item.name} Preferences...`}
          onClick={onOpenPreferences}
        />

        {/* App/Service specific actions */}
        {(isAppItem || isStatusItem) && (
          <>
            <MacSeparator />
            <MacMenuItem
              icon={<RefreshCw className="w-4 h-4" />}
              label="Restart"
              onClick={onRestartService}
            />
            {canRemove && (
              <MacMenuItem
                icon={<X className="w-4 h-4" />}
                label="Quit"
                onClick={onQuitService}
              />
            )}
          </>
        )}

        {/* About */}
        <MacSeparator />
        <MacMenuItem
          icon={<Info className="w-4 h-4" />}
          label={`About ${item.name}`}
          onClick={onAbout}
        />

        {/* Open System Preferences */}
        {isSystemItem && (
          <>
            <MacSeparator />
            <MacSubmenu icon={<Monitor className="w-4 h-4" />} label="Open System Settings">
              <MacMenuItem label="Displays" disabled />
              <MacMenuItem label="Sound" disabled />
              <MacMenuItem label="Network" disabled />
              <MacMenuItem label="Bluetooth" disabled />
              <MacSeparator />
              <MacMenuItem label="All Settings..." onClick={onOpenPreferences} />
            </MacSubmenu>
          </>
        )}
      </MacContextMenuContent>
    </ContextMenu>
  );
};

export default MenuBarContextMenu;
