import { useState, useCallback, useEffect } from 'react';
import {
  TerminalTab,
  TerminalPane,
  TerminalProfile,
  SSHConnection,
  DEFAULT_PROFILES,
  SplitDirection,
} from '@/types/terminal';

const STORAGE_KEYS = {
  PROFILES: 'zos-terminal-profiles',
  SSH_CONNECTIONS: 'zos-terminal-ssh',
  DEFAULT_PROFILE: 'zos-terminal-default-profile',
};

// Generate unique IDs
const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Create a new tab with its root pane
const createTab = (profileId: string): { tab: TerminalTab; pane: TerminalPane } => {
  const tabId = generateId('tab');
  const paneId = generateId('pane');
  const sessionId = generateId('session');

  return {
    tab: {
      id: tabId,
      title: 'bash',
      sessionId,
      profileId,
      isActive: true,
    },
    pane: {
      id: paneId,
      tabId,
      sessionId,
      profileId,
      splitRatio: 0.5,
      isActive: true,
    },
  };
};

export interface UseTerminalWindowState {
  // Tabs
  tabs: TerminalTab[];
  activeTabId: string;
  createNewTab: () => void;
  closeTab: (tabId: string) => void;
  selectTab: (tabId: string) => void;
  updateTabTitle: (tabId: string, title: string) => void;

  // Panes
  panes: Record<string, TerminalPane>;
  activePaneId: string;
  splitPane: (paneId: string, direction: SplitDirection) => void;
  closePane: (paneId: string) => void;
  focusPane: (paneId: string) => void;
  navigatePane: (direction: 'up' | 'down' | 'left' | 'right') => void;

  // Profiles
  profiles: TerminalProfile[];
  defaultProfileId: string;
  currentProfile: TerminalProfile;
  setDefaultProfile: (profileId: string) => void;
  saveProfile: (profile: TerminalProfile) => void;
  deleteProfile: (profileId: string) => void;
  setPaneProfile: (paneId: string, profileId: string) => void;

  // SSH
  sshConnections: SSHConnection[];
  saveSSHConnection: (connection: SSHConnection) => void;
  deleteSSHConnection: (connectionId: string) => void;
  connectSSH: (connection: SSHConnection) => void;

  // UI State
  showSearch: boolean;
  setShowSearch: (show: boolean) => void;
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  showSSHManager: boolean;
  setShowSSHManager: (show: boolean) => void;
  showProfileEditor: boolean;
  setShowProfileEditor: (show: boolean) => void;
  editingProfile: TerminalProfile | null;
  setEditingProfile: (profile: TerminalProfile | null) => void;

  // Search
  searchMatchCount: number;
  searchCurrentMatch: number;
  handleSearch: (query: string, direction: 'next' | 'prev') => void;

  // Root pane for current tab
  currentRootPane: TerminalPane | null;
}

export function useTerminalWindow(): UseTerminalWindowState {
  // Load saved profiles from localStorage
  const loadProfiles = (): TerminalProfile[] => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILES);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with defaults, keeping user modifications
        const defaultIds = new Set(DEFAULT_PROFILES.map(p => p.id));
        const customProfiles = parsed.filter((p: TerminalProfile) => !defaultIds.has(p.id));
        return [...DEFAULT_PROFILES, ...customProfiles];
      }
    } catch (e) {
      console.error('Failed to load profiles:', e);
    }
    return [...DEFAULT_PROFILES];
  };

  // Load SSH connections from localStorage
  const loadSSHConnections = (): SSHConnection[] => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SSH_CONNECTIONS);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to load SSH connections:', e);
      return [];
    }
  };

  // Load default profile ID
  const loadDefaultProfileId = (): string => {
    try {
      return localStorage.getItem(STORAGE_KEYS.DEFAULT_PROFILE) || 'default';
    } catch (e) {
      return 'default';
    }
  };

  // Initialize state
  const [profiles, setProfiles] = useState<TerminalProfile[]>(loadProfiles);
  const [sshConnections, setSSHConnections] = useState<SSHConnection[]>(loadSSHConnections);
  const [defaultProfileId, setDefaultProfileIdState] = useState(loadDefaultProfileId);

  // Create initial tab and pane
  const initial = createTab(defaultProfileId);
  const [tabs, setTabs] = useState<TerminalTab[]>([initial.tab]);
  const [panes, setPanes] = useState<Record<string, TerminalPane>>({
    [initial.pane.id]: initial.pane,
  });
  const [activeTabId, setActiveTabId] = useState(initial.tab.id);
  const [activePaneId, setActivePaneId] = useState(initial.pane.id);

  // UI state
  const [showSearch, setShowSearch] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSSHManager, setShowSSHManager] = useState(false);
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [editingProfile, setEditingProfile] = useState<TerminalProfile | null>(null);

  // Search state
  const [searchMatchCount, setSearchMatchCount] = useState(0);
  const [searchCurrentMatch, setSearchCurrentMatch] = useState(0);

  // Persist profiles
  useEffect(() => {
    const customProfiles = profiles.filter(p =>
      !DEFAULT_PROFILES.some(dp => dp.id === p.id)
    );
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify([
      ...profiles.filter(p => DEFAULT_PROFILES.some(dp => dp.id === p.id)),
      ...customProfiles,
    ]));
  }, [profiles]);

  // Persist SSH connections
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SSH_CONNECTIONS, JSON.stringify(sshConnections));
  }, [sshConnections]);

  // Persist default profile
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DEFAULT_PROFILE, defaultProfileId);
  }, [defaultProfileId]);

  // Get current profile
  const currentProfile = profiles.find(p => p.id === defaultProfileId) || profiles[0];

  // Get root pane for current tab
  const currentRootPane = Object.values(panes).find(
    p => p.tabId === activeTabId && !Object.values(panes).some(parent =>
      parent.children?.some(child => child.id === p.id)
    )
  ) || null;

  // Tab operations
  const createNewTab = useCallback(() => {
    const { tab, pane } = createTab(defaultProfileId);
    setTabs(prev => [...prev.map(t => ({ ...t, isActive: false })), { ...tab, isActive: true }]);
    setPanes(prev => ({ ...prev, [pane.id]: pane }));
    setActiveTabId(tab.id);
    setActivePaneId(pane.id);
  }, [defaultProfileId]);

  const closeTab = useCallback((tabId: string) => {
    setTabs(prev => {
      if (prev.length <= 1) return prev;
      const newTabs = prev.filter(t => t.id !== tabId);
      // If closing active tab, activate the previous one
      if (tabId === activeTabId) {
        const closingIndex = prev.findIndex(t => t.id === tabId);
        const newActiveIndex = Math.max(0, closingIndex - 1);
        newTabs[newActiveIndex] = { ...newTabs[newActiveIndex], isActive: true };
        setActiveTabId(newTabs[newActiveIndex].id);
        // Find a pane in the new active tab
        const newActivePane = Object.values(panes).find(p => p.tabId === newTabs[newActiveIndex].id);
        if (newActivePane) {
          setActivePaneId(newActivePane.id);
        }
      }
      return newTabs;
    });
    // Clean up panes for the closed tab
    setPanes(prev => {
      const newPanes = { ...prev };
      Object.keys(newPanes).forEach(key => {
        if (newPanes[key].tabId === tabId) {
          delete newPanes[key];
        }
      });
      return newPanes;
    });
  }, [activeTabId, panes]);

  const selectTab = useCallback((tabId: string) => {
    setTabs(prev => prev.map(t => ({ ...t, isActive: t.id === tabId })));
    setActiveTabId(tabId);
    // Find and activate a pane in the selected tab
    const tabPane = Object.values(panes).find(p => p.tabId === tabId);
    if (tabPane) {
      setActivePaneId(tabPane.id);
    }
  }, [panes]);

  const updateTabTitle = useCallback((tabId: string, title: string) => {
    setTabs(prev => prev.map(t => t.id === tabId ? { ...t, title } : t));
  }, []);

  // Pane operations
  const splitPane = useCallback((paneId: string, direction: SplitDirection) => {
    setPanes(prev => {
      const currentPane = prev[paneId];
      if (!currentPane) return prev;

      const newPaneId = generateId('pane');
      const newSessionId = generateId('session');

      // Create new pane
      const newPane: TerminalPane = {
        id: newPaneId,
        tabId: currentPane.tabId,
        sessionId: newSessionId,
        profileId: currentPane.profileId,
        splitRatio: 0.5,
        isActive: true,
      };

      // Update current pane to be a container with children
      const updatedCurrentPane: TerminalPane = {
        ...currentPane,
        splitDirection: direction,
        splitRatio: 0.5,
        children: [
          { ...currentPane, id: generateId('pane'), isActive: false },
          newPane,
        ],
        isActive: false,
      };

      return {
        ...prev,
        [paneId]: updatedCurrentPane,
        [newPaneId]: newPane,
        [updatedCurrentPane.children[0].id]: updatedCurrentPane.children[0],
      };
    });
  }, []);

  const closePane = useCallback((paneId: string) => {
    // For now, just close the tab if there's only one pane
    const currentTab = tabs.find(t => t.id === activeTabId);
    const tabPanes = Object.values(panes).filter(p => p.tabId === activeTabId);

    if (tabPanes.length <= 1 && currentTab) {
      closeTab(currentTab.id);
    } else {
      // TODO: Implement proper pane closing with tree restructuring
      setPanes(prev => {
        const newPanes = { ...prev };
        delete newPanes[paneId];
        return newPanes;
      });
    }
  }, [tabs, activeTabId, panes, closeTab]);

  const focusPane = useCallback((paneId: string) => {
    setPanes(prev => {
      const newPanes = { ...prev };
      Object.keys(newPanes).forEach(key => {
        newPanes[key] = { ...newPanes[key], isActive: key === paneId };
      });
      return newPanes;
    });
    setActivePaneId(paneId);
  }, []);

  const navigatePane = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    // Simplified navigation - cycle through panes in current tab
    const tabPanes = Object.values(panes).filter(p => p.tabId === activeTabId);
    if (tabPanes.length <= 1) return;

    const currentIndex = tabPanes.findIndex(p => p.id === activePaneId);
    let newIndex: number;

    if (direction === 'right' || direction === 'down') {
      newIndex = (currentIndex + 1) % tabPanes.length;
    } else {
      newIndex = (currentIndex - 1 + tabPanes.length) % tabPanes.length;
    }

    focusPane(tabPanes[newIndex].id);
  }, [panes, activeTabId, activePaneId, focusPane]);

  // Profile operations
  const setDefaultProfile = useCallback((profileId: string) => {
    setDefaultProfileIdState(profileId);
  }, []);

  const saveProfile = useCallback((profile: TerminalProfile) => {
    setProfiles(prev => {
      const existing = prev.findIndex(p => p.id === profile.id);
      if (existing >= 0) {
        const newProfiles = [...prev];
        newProfiles[existing] = profile;
        return newProfiles;
      }
      return [...prev, profile];
    });
    setEditingProfile(null);
    setShowProfileEditor(false);
  }, []);

  const deleteProfile = useCallback((profileId: string) => {
    // Don't delete default profiles or the last profile
    if (DEFAULT_PROFILES.some(p => p.id === profileId)) return;
    setProfiles(prev => prev.filter(p => p.id !== profileId));
    if (defaultProfileId === profileId) {
      setDefaultProfileIdState('default');
    }
  }, [defaultProfileId]);

  const setPaneProfile = useCallback((paneId: string, profileId: string) => {
    setPanes(prev => ({
      ...prev,
      [paneId]: { ...prev[paneId], profileId },
    }));
  }, []);

  // SSH operations
  const saveSSHConnection = useCallback((connection: SSHConnection) => {
    setSSHConnections(prev => {
      const existing = prev.findIndex(c => c.id === connection.id);
      if (existing >= 0) {
        const newConnections = [...prev];
        newConnections[existing] = connection;
        return newConnections;
      }
      return [...prev, connection];
    });
  }, []);

  const deleteSSHConnection = useCallback((connectionId: string) => {
    setSSHConnections(prev => prev.filter(c => c.id !== connectionId));
  }, []);

  const connectSSH = useCallback((connection: SSHConnection) => {
    // Create new tab for SSH connection
    const { tab, pane } = createTab(connection.profileId || defaultProfileId);
    tab.title = connection.name;

    setTabs(prev => [...prev.map(t => ({ ...t, isActive: false })), { ...tab, isActive: true }]);
    setPanes(prev => ({ ...prev, [pane.id]: pane }));
    setActiveTabId(tab.id);
    setActivePaneId(pane.id);
    setShowSSHManager(false);

    // Note: Actual SSH connection would need WebContainer or similar
    // For now, just output the connection command
    console.log(`SSH: ${connection.username}@${connection.host}:${connection.port}`);
  }, [defaultProfileId]);

  // Search operations
  const handleSearch = useCallback((query: string, direction: 'next' | 'prev') => {
    if (!query) {
      setSearchMatchCount(0);
      setSearchCurrentMatch(0);
      return;
    }
    // Search implementation would integrate with Terminal component
    // For now, just placeholder
    setSearchMatchCount(0);
    setSearchCurrentMatch(0);
  }, []);

  return {
    // Tabs
    tabs,
    activeTabId,
    createNewTab,
    closeTab,
    selectTab,
    updateTabTitle,

    // Panes
    panes,
    activePaneId,
    splitPane,
    closePane,
    focusPane,
    navigatePane,

    // Profiles
    profiles,
    defaultProfileId,
    currentProfile,
    setDefaultProfile,
    saveProfile,
    deleteProfile,
    setPaneProfile,

    // SSH
    sshConnections,
    saveSSHConnection,
    deleteSSHConnection,
    connectSSH,

    // UI State
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

    // Search
    searchMatchCount,
    searchCurrentMatch,
    handleSearch,

    // Root pane
    currentRootPane,
  };
}
