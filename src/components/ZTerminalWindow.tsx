
import React, { useEffect, useCallback } from 'react';
import ZWindow from './ZWindow';
import Terminal from './Terminal';
import TerminalTabBar from './terminal/TerminalTabBar';
import TerminalSearch from './terminal/TerminalSearch';
import TerminalProfileEditor from './terminal/TerminalProfileEditor';
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
import {
  Settings,
  Search,
  Server,
  Plus,
  SplitSquareVertical,
  SplitSquareHorizontal,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ZTerminalWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

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

      // Cmd+,: Settings/Profiles
      if (isMeta && e.key === ',') {
        e.preventDefault();
        setShowSettings(!showSettings);
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
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    tabs,
    activeTabId,
    activePaneId,
    panes,
    showSearch,
    showSettings,
    createNewTab,
    closeTab,
    closePane,
    splitPane,
    selectTab,
    navigatePane,
    setShowSearch,
    setShowSettings,
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

  // Get the active tab's title
  const activeTab = tabs.find(t => t.id === activeTabId);
  const windowTitle = `Terminal - ${activeTab?.title || 'bash'}`;

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
            className="opacity-50 hover:opacity-100 transition-opacity"
            title="Search (Cmd+F)"
          >
            <Search size={14} />
          </button>

          {/* SSH */}
          <button
            onClick={() => setShowSSHManager(!showSSHManager)}
            className="opacity-50 hover:opacity-100 transition-opacity"
            title="SSH Connections"
          >
            <Server size={14} />
          </button>

          {/* Profile selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="opacity-50 hover:opacity-100 transition-opacity"
                title="Settings (Cmd+,)"
              >
                <Settings size={14} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1 text-xs text-muted-foreground">
                Profiles
              </div>
              {profiles.map((profile) => (
                <DropdownMenuItem
                  key={profile.id}
                  onClick={() => setDefaultProfile(profile.id)}
                  className="flex items-center justify-between"
                >
                  <span>{profile.name}</span>
                  {profile.id === defaultProfileId && (
                    <span className="text-xs text-cyan-400">Active</span>
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleNewProfile}>
                <Plus size={12} className="mr-2" />
                New Profile...
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowSettings(!showSettings)}>
                <Settings size={12} className="mr-2" />
                Edit Current Profile...
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      }
    >
      <div className="flex flex-col h-full relative">
        {/* Tab bar */}
        <TerminalTabBar
          tabs={tabs}
          activeTabId={activeTabId}
          onTabSelect={selectTab}
          onTabClose={closeTab}
          onNewTab={createNewTab}
        />

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

        {/* Settings panel */}
        {showSettings && !showProfileEditor && (
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
                max={20}
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
                min={8}
                max={32}
                step={4}
                onValueChange={([v]) => {
                  const updated = { ...currentProfile, padding: v };
                  saveProfile(updated);
                }}
              />
              <span className="text-xs text-white/70">{currentProfile.padding}px</span>
            </div>
          </div>
        )}

        {/* Terminal content - render based on pane structure */}
        <div className="flex-1 min-h-0 flex">
          {currentRootPane && (
            <Terminal
              className="w-full h-full rounded-none"
              customFontSize={currentProfile.fontSize}
              customPadding={currentProfile.padding}
              customTheme="dark"
              sessionId={currentRootPane.sessionId}
            />
          )}
        </div>
      </div>
    </ZWindow>
  );
};

export default ZTerminalWindow;
