import React, { useEffect, useCallback, useState } from 'react';
import ZWindow from './ZWindow';
import Terminal from './Terminal';
import TerminalTabBar from './terminal/TerminalTabBar';
import TerminalSearch from './terminal/TerminalSearch';
import TerminalProfileEditor from './terminal/TerminalProfileEditor';
import TerminalPaneContainer from './terminal/TerminalPaneContainer';
import SSHManager from './terminal/SSHManager';
import { useTerminalWindow } from '@/hooks/useTerminalWindow';
import { TerminalProfile, DEFAULT_PROFILES } from '@/types/terminal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Settings,
  Search,
  Server,
  Plus,
  X,
  SplitSquareVertical,
  SplitSquareHorizontal,
  Palette,
  Keyboard,
  Monitor,
  Bell,
  Terminal as TerminalIcon,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface ZTerminalWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

// Terminal preferences stored in localStorage
interface TerminalPreferences {
  confirmCloseMultipleTabs: boolean;
  showTabBar: boolean;
  tabBarPosition: 'top' | 'bottom';
  shellPath: string;
  loginShell: boolean;
  scrollbackLines: number;
  bellStyle: 'none' | 'visual' | 'audio' | 'both';
  openUrlOnClick: boolean;
  copyOnSelect: boolean;
  focusFollowsMouse: boolean;
}

const DEFAULT_PREFS: TerminalPreferences = {
  confirmCloseMultipleTabs: true,
  showTabBar: true,
  tabBarPosition: 'top',
  shellPath: '/bin/zsh',
  loginShell: true,
  scrollbackLines: 10000,
  bellStyle: 'visual',
  openUrlOnClick: true,
  copyOnSelect: false,
  focusFollowsMouse: false,
};

const PREFS_STORAGE_KEY = 'zos-terminal-preferences';

const loadPreferences = (): TerminalPreferences => {
  try {
    const saved = localStorage.getItem(PREFS_STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_PREFS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Failed to load terminal preferences:', e);
  }
  return { ...DEFAULT_PREFS };
};

const savePreferencesToStorage = (prefs: TerminalPreferences): void => {
  try {
    localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.error('Failed to save terminal preferences:', e);
  }
};

const ZTerminalWindow: React.FC<ZTerminalWindowProps> = ({ onClose, onFocus }) => {
  const state = useTerminalWindow();
  const {
    tabs,
    activeTabId,
    createNewTab,
    closeTab,
    selectTab,
    panes,
    activePaneId,
    splitPane,
    closePane,
    navigatePane,
    focusPane,
    profiles,
    defaultProfileId,
    currentProfile,
    setDefaultProfile,
    saveProfile,
    deleteProfile,
    sshConnections,
    saveSSHConnection,
    deleteSSHConnection,
    connectSSH,
    showSearch,
    setShowSearch,
    showSettings,
    setShowSettings,
    showSSHManager,
    setShowSSHManager,
    showProfileEditor,
    setShowProfileEditor,
    editingProfile,
    setEditingProfile,
    searchMatchCount,
    searchCurrentMatch,
    handleSearch,
    currentRootPane,
  } = state;

  // Local state for full preferences panel
  const [showPreferencesPanel, setShowPreferencesPanel] = useState(false);
  const [preferences, setPreferences] = useState<TerminalPreferences>(loadPreferences);
  const [prefsTab, setPrefsTab] = useState('general');

  // Save preferences when they change
  useEffect(() => {
    savePreferencesToStorage(preferences);
  }, [preferences]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey;

      // Cmd+T: New tab
      if (isMeta && e.key === 't') {
        e.preventDefault();
        createNewTab();
        return;
      }

      // Cmd+W: Close pane/tab
      if (isMeta && e.key === 'w') {
        e.preventDefault();
        const tabPanes = Object.values(panes).filter(p => p.tabId === activeTabId);
        if (tabPanes.length > 1) {
          closePane(activePaneId);
        } else if (tabs.length > 1) {
          closeTab(activeTabId);
        } else {
          onClose();
        }
        return;
      }

      // Cmd+D: Vertical split
      if (isMeta && e.key === 'd' && !e.shiftKey) {
        e.preventDefault();
        splitPane(activePaneId, 'vertical');
        return;
      }

      // Cmd+Shift+D: Horizontal split
      if (isMeta && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        splitPane(activePaneId, 'horizontal');
        return;
      }

      // Cmd+F: Search
      if (isMeta && e.key === 'f') {
        e.preventDefault();
        setShowSearch(!showSearch);
        return;
      }

      // Cmd+,: Preferences panel
      if (isMeta && e.key === ',') {
        e.preventDefault();
        setShowPreferencesPanel(!showPreferencesPanel);
        return;
      }

      // Cmd+Shift+[: Previous tab
      if (isMeta && e.shiftKey && e.key === '[') {
        e.preventDefault();
        const currentIndex = tabs.findIndex(t => t.id === activeTabId);
        const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        selectTab(tabs[prevIndex].id);
        return;
      }

      // Cmd+Shift+]: Next tab
      if (isMeta && e.shiftKey && e.key === ']') {
        e.preventDefault();
        const currentIndex = tabs.findIndex(t => t.id === activeTabId);
        const nextIndex = (currentIndex + 1) % tabs.length;
        selectTab(tabs[nextIndex].id);
        return;
      }

      // Cmd+Option+Arrow: Navigate panes
      if (isMeta && e.altKey) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          navigatePane('left');
          return;
        }
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          navigatePane('right');
          return;
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          navigatePane('up');
          return;
        }
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          navigatePane('down');
          return;
        }
      }

      // Cmd+1-9: Switch tabs
      if (isMeta && e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        const tabIndex = parseInt(e.key) - 1;
        if (tabs[tabIndex]) {
          selectTab(tabs[tabIndex].id);
        }
        return;
      }

      // Escape: Close overlays
      if (e.key === 'Escape') {
        if (showPreferencesPanel) {
          setShowPreferencesPanel(false);
          return;
        }
        if (showSearch) {
          setShowSearch(false);
          return;
        }
        if (showSSHManager) {
          setShowSSHManager(false);
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    tabs,
    activeTabId,
    activePaneId,
    panes,
    showSearch,
    showPreferencesPanel,
    showSSHManager,
    createNewTab,
    closeTab,
    closePane,
    splitPane,
    selectTab,
    navigatePane,
    setShowSearch,
    setShowSSHManager,
    onClose,
  ]);

  const handleNewProfile = useCallback(() => {
    const newProfile: TerminalProfile = {
      id: `custom-${Date.now()}`,
      name: 'Custom Profile',
      backgroundColor: '#1a1a1a',
      backgroundOpacity: 0.95,
      textColor: '#ffffff',
      fontSize: 14,
      fontFamily: 'monospace',
      cursorStyle: 'block',
      cursorBlink: true,
      padding: 16,
    };
    setEditingProfile(newProfile);
    setShowProfileEditor(true);
  }, [setEditingProfile, setShowProfileEditor]);

  const handleEditProfile = useCallback((profile: TerminalProfile) => {
    setEditingProfile({ ...profile });
    setShowProfileEditor(true);
  }, [setEditingProfile, setShowProfileEditor]);

  // Get profile by ID
  const getProfile = useCallback((profileId: string): TerminalProfile => {
    return profiles.find(p => p.id === profileId) || currentProfile;
  }, [profiles, currentProfile]);

  // Check if there are multiple panes in current tab
  const tabPaneCount = Object.values(panes).filter(p => p.tabId === activeTabId).length;
  const isSinglePane = tabPaneCount <= 1;

  // Get the active tab's title
  const activeTab = tabs.find(t => t.id === activeTabId);
  const windowTitle = `Terminal - ${activeTab?.title || 'bash'}`;

  // Render the full preferences panel
  const renderPreferencesPanel = () => (
    <div className="absolute inset-0 z-50 bg-black/98 backdrop-blur-sm flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-white/10">
        <h2 className="text-sm font-medium text-white flex items-center gap-2">
          <Settings size={16} />
          Terminal Preferences
        </h2>
        <button
          onClick={() => setShowPreferencesPanel(false)}
          className="text-white/50 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <Tabs
          value={prefsTab}
          onValueChange={setPrefsTab}
          className="flex-1 flex"
        >
          {/* Sidebar */}
          <div className="w-44 border-r border-white/10 p-2 flex-shrink-0">
            <TabsList className="flex flex-col w-full h-auto bg-transparent space-y-1">
              <TabsTrigger
                value="general"
                className="w-full justify-start gap-2 px-3 py-2 text-xs data-[state=active]:bg-white/10 rounded"
              >
                <Monitor size={14} />
                General
              </TabsTrigger>
              <TabsTrigger
                value="profiles"
                className="w-full justify-start gap-2 px-3 py-2 text-xs data-[state=active]:bg-white/10 rounded"
              >
                <Palette size={14} />
                Profiles
              </TabsTrigger>
              <TabsTrigger
                value="keyboard"
                className="w-full justify-start gap-2 px-3 py-2 text-xs data-[state=active]:bg-white/10 rounded"
              >
                <Keyboard size={14} />
                Keyboard
              </TabsTrigger>
              <TabsTrigger
                value="advanced"
                className="w-full justify-start gap-2 px-3 py-2 text-xs data-[state=active]:bg-white/10 rounded"
              >
                <TerminalIcon size={14} />
                Advanced
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 overflow-auto">
            {/* General Settings */}
            <TabsContent value="general" className="m-0 space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-white/90 border-b border-white/10 pb-2">
                  Window
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-xs text-white/80">Show Tab Bar</Label>
                      <p className="text-[10px] text-white/50">Display tabs at the top of the window</p>
                    </div>
                    <Switch
                      checked={preferences.showTabBar}
                      onCheckedChange={(v) =>
                        setPreferences(prev => ({ ...prev, showTabBar: v }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-xs text-white/80">Confirm closing multiple tabs</Label>
                      <p className="text-[10px] text-white/50">Ask before closing window with multiple tabs</p>
                    </div>
                    <Switch
                      checked={preferences.confirmCloseMultipleTabs}
                      onCheckedChange={(v) =>
                        setPreferences(prev => ({ ...prev, confirmCloseMultipleTabs: v }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium text-white/90 border-b border-white/10 pb-2">
                  Shell
                </h3>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-white/80">Default Shell</Label>
                    <Input
                      value={preferences.shellPath}
                      onChange={(e) =>
                        setPreferences(prev => ({ ...prev, shellPath: e.target.value }))
                      }
                      placeholder="/bin/zsh"
                      className="h-8 text-xs bg-white/5 border-white/10"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-xs text-white/80">Run as login shell</Label>
                      <p className="text-[10px] text-white/50">Execute shell as a login shell</p>
                    </div>
                    <Switch
                      checked={preferences.loginShell}
                      onCheckedChange={(v) =>
                        setPreferences(prev => ({ ...prev, loginShell: v }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium text-white/90 border-b border-white/10 pb-2">
                  <Bell size={14} className="inline mr-2" />
                  Bell
                </h3>

                <div className="space-y-1">
                  <Label className="text-xs text-white/80">Bell Style</Label>
                  <Select
                    value={preferences.bellStyle}
                    onValueChange={(v: 'none' | 'visual' | 'audio' | 'both') =>
                      setPreferences(prev => ({ ...prev, bellStyle: v }))
                    }
                  >
                    <SelectTrigger className="h-8 text-xs bg-white/5 border-white/10 w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" className="text-xs">None</SelectItem>
                      <SelectItem value="visual" className="text-xs">Visual</SelectItem>
                      <SelectItem value="audio" className="text-xs">Audio</SelectItem>
                      <SelectItem value="both" className="text-xs">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Profiles */}
            <TabsContent value="profiles" className="m-0 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <h3 className="text-sm font-medium text-white/90">Terminal Profiles</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleNewProfile}
                  className="h-7 text-xs"
                >
                  <Plus size={12} className="mr-1" />
                  New Profile
                </Button>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-white/70">Default Profile</Label>
                <Select value={defaultProfileId} onValueChange={setDefaultProfile}>
                  <SelectTrigger className="h-8 text-xs bg-white/5 border-white/10 w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles.map((p) => (
                      <SelectItem key={p.id} value={p.id} className="text-xs">
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <ScrollArea className="h-[280px] pr-2">
                <div className="grid grid-cols-2 gap-3">
                  {profiles.map((profile) => (
                    <div
                      key={profile.id}
                      onClick={() => handleEditProfile(profile)}
                      className={cn(
                        'p-3 rounded-lg border cursor-pointer transition-all',
                        'hover:border-white/30 hover:scale-[1.02]',
                        profile.id === defaultProfileId
                          ? 'border-cyan-500/50 bg-cyan-500/10'
                          : 'border-white/10 bg-white/5'
                      )}
                    >
                      <div
                        className="h-14 rounded mb-2 flex items-center justify-center text-sm overflow-hidden"
                        style={{
                          backgroundColor: profile.backgroundColor,
                          color: profile.textColor,
                          opacity: profile.backgroundOpacity,
                          fontFamily: profile.fontFamily,
                          fontSize: `${Math.min(profile.fontSize, 12)}px`,
                        }}
                      >
                        <span>Terminal</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/80 truncate">{profile.name}</span>
                        {profile.id === defaultProfileId && (
                          <span className="text-[10px] text-cyan-400 flex-shrink-0 ml-1">Default</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Keyboard Shortcuts */}
            <TabsContent value="keyboard" className="m-0 space-y-4">
              <h3 className="text-sm font-medium text-white/90 border-b border-white/10 pb-2">
                Keyboard Shortcuts
              </h3>

              <ScrollArea className="h-[320px] pr-2">
                <div className="space-y-1 text-xs">
                  {[
                    { section: 'Tabs', shortcuts: [
                      { key: 'Cmd+T', action: 'New Tab' },
                      { key: 'Cmd+W', action: 'Close Tab/Pane' },
                      { key: 'Cmd+Shift+[', action: 'Previous Tab' },
                      { key: 'Cmd+Shift+]', action: 'Next Tab' },
                      { key: 'Cmd+1-9', action: 'Switch to Tab 1-9' },
                    ]},
                    { section: 'Panes', shortcuts: [
                      { key: 'Cmd+D', action: 'Split Vertically' },
                      { key: 'Cmd+Shift+D', action: 'Split Horizontally' },
                      { key: 'Cmd+Option+Arrow', action: 'Navigate Panes' },
                    ]},
                    { section: 'Terminal', shortcuts: [
                      { key: 'Cmd+K', action: 'Clear Screen' },
                      { key: 'Cmd+F', action: 'Find' },
                      { key: 'Cmd+A', action: 'Select All' },
                      { key: 'Cmd+C', action: 'Copy' },
                      { key: 'Cmd+V', action: 'Paste' },
                    ]},
                    { section: 'Window', shortcuts: [
                      { key: 'Cmd+,', action: 'Preferences' },
                      { key: 'Escape', action: 'Close Overlays' },
                    ]},
                  ].map((group) => (
                    <div key={group.section} className="mb-4">
                      <h4 className="text-[11px] font-medium text-white/60 uppercase tracking-wide mb-2">
                        {group.section}
                      </h4>
                      {group.shortcuts.map((shortcut) => (
                        <div
                          key={shortcut.key}
                          className="flex items-center justify-between py-1.5 border-b border-white/5"
                        >
                          <span className="text-white/70">{shortcut.action}</span>
                          <kbd className="px-2 py-0.5 bg-white/10 rounded text-white/80 font-mono text-[11px]">
                            {shortcut.key}
                          </kbd>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Advanced */}
            <TabsContent value="advanced" className="m-0 space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-white/90 border-b border-white/10 pb-2">
                  Terminal Buffer
                </h3>

                <div className="space-y-2">
                  <Label className="text-xs text-white/80">
                    Scrollback Lines: {preferences.scrollbackLines.toLocaleString()}
                  </Label>
                  <Slider
                    value={[preferences.scrollbackLines]}
                    min={1000}
                    max={100000}
                    step={1000}
                    onValueChange={([v]) =>
                      setPreferences(prev => ({ ...prev, scrollbackLines: v }))
                    }
                    className="w-64"
                  />
                  <p className="text-[10px] text-white/50">
                    Number of lines kept in scroll history
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium text-white/90 border-b border-white/10 pb-2">
                  Behavior
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-xs text-white/80">Open URLs on click</Label>
                      <p className="text-[10px] text-white/50">Cmd+click opens links in browser</p>
                    </div>
                    <Switch
                      checked={preferences.openUrlOnClick}
                      onCheckedChange={(v) =>
                        setPreferences(prev => ({ ...prev, openUrlOnClick: v }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-xs text-white/80">Copy on select</Label>
                      <p className="text-[10px] text-white/50">Automatically copy selected text</p>
                    </div>
                    <Switch
                      checked={preferences.copyOnSelect}
                      onCheckedChange={(v) =>
                        setPreferences(prev => ({ ...prev, copyOnSelect: v }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-xs text-white/80">Focus follows mouse</Label>
                      <p className="text-[10px] text-white/50">Click pane to focus, not just hover</p>
                    </div>
                    <Switch
                      checked={preferences.focusFollowsMouse}
                      onCheckedChange={(v) =>
                        setPreferences(prev => ({ ...prev, focusFollowsMouse: v }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreferences(DEFAULT_PREFS)}
                  className="h-7 text-xs"
                >
                  Reset to Defaults
                </Button>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );

  return (
    <ZWindow
      title={windowTitle}
      onClose={onClose}
      onFocus={onFocus}
      initialPosition={{ x: 50, y: 50 }}
      initialSize={{ width: 800, height: 550 }}
      windowType="terminal"
      className="z-50"
      customControls={
        <div className="flex items-center gap-2 ml-auto mr-4">
          {/* Split buttons */}
          <button
            onClick={() => splitPane(activePaneId, 'vertical')}
            className="opacity-50 hover:opacity-100 transition-opacity"
            title="Split Vertical (Cmd+D)"
          >
            <SplitSquareVertical size={14} />
          </button>
          <button
            onClick={() => splitPane(activePaneId, 'horizontal')}
            className="opacity-50 hover:opacity-100 transition-opacity"
            title="Split Horizontal (Cmd+Shift+D)"
          >
            <SplitSquareHorizontal size={14} />
          </button>

          {/* Search */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={cn(
              'opacity-50 hover:opacity-100 transition-opacity',
              showSearch && 'opacity-100 text-cyan-400'
            )}
            title="Search (Cmd+F)"
          >
            <Search size={14} />
          </button>

          {/* SSH */}
          <button
            onClick={() => setShowSSHManager(!showSSHManager)}
            className={cn(
              'opacity-50 hover:opacity-100 transition-opacity',
              showSSHManager && 'opacity-100 text-cyan-400'
            )}
            title="SSH Connections"
          >
            <Server size={14} />
          </button>

          {/* Profile/Settings dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="opacity-50 hover:opacity-100 transition-opacity"
                title="Settings (Cmd+,)"
              >
                <Settings size={14} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <div className="px-2 py-1 text-xs text-muted-foreground">
                Quick Settings
              </div>
              <DropdownMenuItem onClick={() => setShowSettings(!showSettings)}>
                Adjust Current Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <div className="px-2 py-1 text-xs text-muted-foreground">
                Profiles
              </div>
              {profiles.slice(0, 8).map((profile) => (
                <DropdownMenuItem
                  key={profile.id}
                  onClick={() => setDefaultProfile(profile.id)}
                  className="flex items-center justify-between"
                >
                  <span className="truncate">{profile.name}</span>
                  {profile.id === defaultProfileId && (
                    <span className="text-xs text-cyan-400 ml-2">Active</span>
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleNewProfile}>
                <Plus size={12} className="mr-2" />
                New Profile...
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowPreferencesPanel(true)}>
                <Settings size={12} className="mr-2" />
                Preferences...
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      }
    >
      <div className="flex flex-col h-full relative">
        {/* Tab bar */}
        {preferences.showTabBar && (
          <TerminalTabBar
            tabs={tabs}
            activeTabId={activeTabId}
            onTabSelect={selectTab}
            onTabClose={closeTab}
            onNewTab={createNewTab}
          />
        )}

        {/* Search overlay */}
        <TerminalSearch
          isOpen={showSearch}
          onClose={() => setShowSearch(false)}
          onSearch={handleSearch}
          matchCount={searchMatchCount}
          currentMatch={searchCurrentMatch}
        />

        {/* SSH Manager */}
        {showSSHManager && (
          <SSHManager
            connections={sshConnections}
            onConnect={connectSSH}
            onSave={saveSSHConnection}
            onDelete={deleteSSHConnection}
            onClose={() => setShowSSHManager(false)}
          />
        )}

        {/* Profile Editor */}
        {showProfileEditor && editingProfile && (
          <TerminalProfileEditor
            profile={editingProfile}
            onChange={setEditingProfile}
            onClose={() => {
              saveProfile(editingProfile);
            }}
            onDelete={
              !DEFAULT_PROFILES.some(p => p.id === editingProfile.id)
                ? () => {
                    deleteProfile(editingProfile.id);
                    setShowProfileEditor(false);
                  }
                : undefined
            }
            isNew={!profiles.some(p => p.id === editingProfile.id)}
          />
        )}

        {/* Quick settings panel (inline) */}
        {showSettings && !showProfileEditor && !showPreferencesPanel && (
          <div className="bg-black/30 backdrop-blur-sm p-3 border-b border-white/10 flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/70">Profile:</span>
              <Select value={defaultProfileId} onValueChange={setDefaultProfile}>
                <SelectTrigger className="h-7 w-[140px] text-xs">
                  <SelectValue placeholder="Profile" />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id} className="text-xs">
                      {profile.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button
                onClick={() => handleEditProfile(currentProfile)}
                className="text-xs text-cyan-400 hover:text-cyan-300"
              >
                Edit
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-white/70">Font Size:</span>
              <Slider
                className="w-24"
                value={[currentProfile.fontSize]}
                min={10}
                max={24}
                step={1}
                onValueChange={([v]) => {
                  const updated = { ...currentProfile, fontSize: v };
                  saveProfile(updated);
                }}
              />
              <span className="text-xs text-white/70">{currentProfile.fontSize}px</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-white/70">Padding:</span>
              <Slider
                className="w-24"
                value={[currentProfile.padding]}
                min={4}
                max={32}
                step={4}
                onValueChange={([v]) => {
                  const updated = { ...currentProfile, padding: v };
                  saveProfile(updated);
                }}
              />
              <span className="text-xs text-white/70">{currentProfile.padding}px</span>
            </div>

            <button
              onClick={() => setShowPreferencesPanel(true)}
              className="text-xs text-white/50 hover:text-white ml-auto"
            >
              All Preferences...
            </button>
          </div>
        )}

        {/* Terminal content - render based on pane structure */}
        <div className="flex-1 min-h-0 flex">
          {currentRootPane ? (
            <TerminalPaneContainer
              pane={currentRootPane}
              profile={currentProfile}
              onSplit={splitPane}
              onClose={closePane}
              onFocus={focusPane}
              getProfile={getProfile}
              isSinglePane={isSinglePane}
            />
          ) : (
            <Terminal
              className="w-full h-full rounded-none"
              customFontSize={currentProfile.fontSize}
              customPadding={currentProfile.padding}
              customTheme="dark"
            />
          )}
        </div>

        {/* Full Preferences Panel */}
        {showPreferencesPanel && renderPreferencesPanel()}
      </div>
    </ZWindow>
  );
};

export default ZTerminalWindow;
