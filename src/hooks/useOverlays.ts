import { useState, useCallback, useMemo } from 'react';

export interface OverlayState {
  spotlight: boolean;
  forceQuit: boolean;
  appSwitcher: boolean;
  about: boolean;
  applications: boolean;
  downloads: boolean;
}

export interface OverlayActions {
  openSpotlight: () => void;
  closeSpotlight: () => void;
  toggleSpotlight: () => void;

  openForceQuit: () => void;
  closeForceQuit: () => void;

  openAppSwitcher: () => void;
  closeAppSwitcher: () => void;

  openAbout: () => void;
  closeAbout: () => void;

  openApplications: () => void;
  closeApplications: () => void;
  toggleApplications: () => void;

  openDownloads: () => void;
  closeDownloads: () => void;
  toggleDownloads: () => void;

  closeAllOverlays: () => void;
}

export function useOverlays(): OverlayState & OverlayActions {
  const [spotlight, setSpotlight] = useState(false);
  const [forceQuit, setForceQuit] = useState(false);
  const [appSwitcher, setAppSwitcher] = useState(false);
  const [about, setAbout] = useState(false);
  const [applications, setApplications] = useState(false);
  const [downloads, setDownloads] = useState(false);

  // Spotlight actions
  const openSpotlight = useCallback(() => setSpotlight(true), []);
  const closeSpotlight = useCallback(() => setSpotlight(false), []);
  const toggleSpotlight = useCallback(() => setSpotlight(prev => !prev), []);

  // Force quit actions
  const openForceQuit = useCallback(() => setForceQuit(true), []);
  const closeForceQuit = useCallback(() => setForceQuit(false), []);

  // App switcher actions
  const openAppSwitcher = useCallback(() => setAppSwitcher(true), []);
  const closeAppSwitcher = useCallback(() => setAppSwitcher(false), []);

  // About actions
  const openAbout = useCallback(() => setAbout(true), []);
  const closeAbout = useCallback(() => setAbout(false), []);

  // Applications popover actions
  const openApplications = useCallback(() => setApplications(true), []);
  const closeApplications = useCallback(() => setApplications(false), []);
  const toggleApplications = useCallback(() => setApplications(prev => !prev), []);

  // Downloads popover actions
  const openDownloads = useCallback(() => setDownloads(true), []);
  const closeDownloads = useCallback(() => setDownloads(false), []);
  const toggleDownloads = useCallback(() => setDownloads(prev => !prev), []);

  // Close all overlays
  const closeAllOverlays = useCallback(() => {
    setSpotlight(false);
    setForceQuit(false);
    setAppSwitcher(false);
    setAbout(false);
    setApplications(false);
    setDownloads(false);
  }, []);

  return useMemo(() => ({
    // State
    spotlight,
    forceQuit,
    appSwitcher,
    about,
    applications,
    downloads,

    // Actions
    openSpotlight,
    closeSpotlight,
    toggleSpotlight,
    openForceQuit,
    closeForceQuit,
    openAppSwitcher,
    closeAppSwitcher,
    openAbout,
    closeAbout,
    openApplications,
    closeApplications,
    toggleApplications,
    openDownloads,
    closeDownloads,
    toggleDownloads,
    closeAllOverlays,
  }), [
    spotlight, forceQuit, appSwitcher, about, applications, downloads,
    openSpotlight, closeSpotlight, toggleSpotlight,
    openForceQuit, closeForceQuit, openAppSwitcher, closeAppSwitcher,
    openAbout, closeAbout, openApplications, closeApplications,
    toggleApplications, openDownloads, closeDownloads, toggleDownloads,
    closeAllOverlays
  ]);
}
