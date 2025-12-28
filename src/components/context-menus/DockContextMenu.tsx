// Dock Context Menu
// Enhanced context menu for dock items (apps)

import React, { useState } from 'react';
import {
  ContextMenu,
  ContextMenuTrigger,
  MacContextMenuContent,
  MacMenuItem,
  MacSeparator,
  MacSubmenu,
} from './ContextMenuBase';
import {
  ExternalLink,
  Plus,
  X,
  Settings,
  Info,
  Eye,
  EyeOff,
  Folder,
  Pin,
  PinOff,
  Power,
  RotateCcw,
  Clock,
  File,
  FileText,
  Layers,
  Monitor,
  Sparkles,
} from 'lucide-react';
import { getAppMenuConfig } from '@/config/appMenus';

interface DockApp {
  id: string;
  name: string;
  isRunning?: boolean;
  isPinned?: boolean;
  hasRecentItems?: boolean;
  recentItems?: Array<{ id: string; name: string; path: string }>;
}

interface DockContextMenuProps {
  children: React.ReactNode;
  app: DockApp;
  spaces?: Array<{ id: string; name: string }>;
  onOpen?: () => void;
  onNewWindow?: () => void;
  onShowAllWindows?: () => void;
  onHide?: () => void;
  onQuit?: () => void;
  onForceQuit?: () => void;
  onKeepInDock?: () => void;
  onRemoveFromDock?: () => void;
  onOpenAtLogin?: () => void;
  onShowInFinder?: () => void;
  onShowAbout?: () => void;
  onOpenRecentItem?: (itemId: string) => void;
  onClearRecents?: () => void;
  onMoveToSpace?: (spaceId: string) => void;
  onAssignToAllSpaces?: () => void;
}

const DockContextMenu: React.FC<DockContextMenuProps> = ({
  children,
  app,
  spaces = [],
  onOpen,
  onNewWindow,
  onShowAllWindows,
  onHide,
  onQuit,
  onForceQuit,
  onKeepInDock,
  onRemoveFromDock,
  onOpenAtLogin,
  onShowInFinder,
  onShowAbout,
  onOpenRecentItem,
  onClearRecents,
  onMoveToSpace,
  onAssignToAllSpaces,
}) => {
  const menuConfig = getAppMenuConfig(app.id);
  const isRunning = app.isRunning ?? false;
  const isPinned = app.isPinned ?? true;
  const isFinder = app.id === 'finder';
  const hasRecentItems = app.recentItems && app.recentItems.length > 0;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <MacContextMenuContent>
        {/* App-specific menu items from config */}
        {menuConfig?.items.map((item, idx) => {
          if (item.separator) {
            return <MacSeparator key={idx} />;
          }
          return (
            <MacMenuItem
              key={idx}
              label={item.label}
              shortcut={item.shortcut}
              onClick={() => {
                if (item.action === 'new' || item.action === 'showAll') {
                  onOpen?.();
                }
              }}
            />
          );
        })}

        {menuConfig && <MacSeparator />}

        {/* Open/New Window */}
        {!isRunning ? (
          <MacMenuItem
            icon={<ExternalLink className="w-4 h-4" />}
            label="Open"
            onClick={onOpen}
          />
        ) : (
          <MacMenuItem
            icon={<Plus className="w-4 h-4" />}
            label="New Window"
            shortcut="Cmd+N"
            onClick={onNewWindow}
          />
        )}

        {/* Open Recent */}
        {menuConfig?.hasRecents && (
          <MacSubmenu icon={<Clock className="w-4 h-4" />} label="Open Recent">
            {hasRecentItems ? (
              <>
                {app.recentItems?.map((item) => (
                  <MacMenuItem
                    key={item.id}
                    icon={<File className="w-4 h-4" />}
                    label={item.name}
                    onClick={() => onOpenRecentItem?.(item.id)}
                  />
                ))}
                <MacSeparator />
                <MacMenuItem
                  label="Clear Menu"
                  onClick={onClearRecents}
                />
              </>
            ) : (
              <>
                <MacMenuItem label="No Recent Items" disabled />
                <MacSeparator />
                <MacMenuItem label="Clear Menu" disabled />
              </>
            )}
          </MacSubmenu>
        )}

        <MacSeparator />

        {/* Options submenu */}
        <MacSubmenu icon={<Settings className="w-4 h-4" />} label="Options">
          {isPinned ? (
            <MacMenuItem
              icon={<PinOff className="w-4 h-4" />}
              label="Remove from Dock"
              onClick={onRemoveFromDock}
              disabled={isFinder}
            />
          ) : (
            <MacMenuItem
              icon={<Pin className="w-4 h-4" />}
              label="Keep in Dock"
              onClick={onKeepInDock}
            />
          )}
          <MacMenuItem
            icon={<Power className="w-4 h-4" />}
            label="Open at Login"
            onClick={onOpenAtLogin}
          />
          <MacMenuItem
            icon={<Folder className="w-4 h-4" />}
            label="Show in Finder"
            onClick={onShowInFinder}
          />

          {/* Assign to Desktop */}
          {spaces.length > 0 && (
            <>
              <MacSeparator />
              <MacSubmenu icon={<Layers className="w-4 h-4" />} label="Assign to">
                <MacMenuItem
                  label="All Desktops"
                  onClick={onAssignToAllSpaces}
                />
                <MacMenuItem label="None" />
                <MacSeparator />
                {spaces.map((space) => (
                  <MacMenuItem
                    key={space.id}
                    label={space.name}
                    onClick={() => onMoveToSpace?.(space.id)}
                  />
                ))}
              </MacSubmenu>
            </>
          )}
        </MacSubmenu>

        <MacSeparator />

        {/* Show All Windows / Hide */}
        {isRunning && (
          <>
            <MacMenuItem
              icon={<Eye className="w-4 h-4" />}
              label="Show All Windows"
              onClick={onShowAllWindows}
            />
            <MacMenuItem
              icon={<EyeOff className="w-4 h-4" />}
              label="Hide"
              shortcut="Cmd+H"
              onClick={onHide}
            />
            <MacSeparator />
          </>
        )}

        {/* About */}
        <MacMenuItem
          icon={<Info className="w-4 h-4" />}
          label={`About ${app.name}`}
          onClick={onShowAbout}
        />

        {/* Quit */}
        {isRunning && !isFinder && (
          <>
            <MacSeparator />
            <MacMenuItem
              icon={<X className="w-4 h-4" />}
              label="Quit"
              shortcut="Cmd+Q"
              onClick={onQuit}
            />
            <MacMenuItem
              icon={<RotateCcw className="w-4 h-4" />}
              label="Force Quit"
              shortcut="Opt+Cmd+Esc"
              danger
              onClick={onForceQuit}
            />
          </>
        )}
      </MacContextMenuContent>
    </ContextMenu>
  );
};

export default DockContextMenu;
