import { useState, useCallback, useMemo } from 'react';

export interface OverlayState {
  spotlight: boolean;
  forceQuit: boolean;
  appSwitcher: boolean;
  about: boolean;
  applications: boolean;
  downloads: boolean;
  clipboard: boolean;
  missionControl: boolean;
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

  openClipboard: () => void;
  closeClipboard: () => void;
  toggleClipboard: () => void;

  openMissionControl: () => void;
  closeMissionControl: () => void;
  toggleMissionControl: () => void;

  closeAllOverlays: () => void;
}

export function useOverlays(): OverlayState & OverlayActions {
  const [spotlight, setSpotlight] = useState(false);
  const [forceQuit, setForceQuit] = useState(false);
  const [appSwitcher, setAppSwitcher] = useState(false);
  const [about, setAbout] = useState(false);
  const [applications, setApplications] = useState(false);
  const [downloads, setDownloads] = useState(false);
  const [clipboard, setClipboard] = useState(false);
  const [missionControl, setMissionControl] = useState(false);

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

  // Applications popover actions - closes other temporary popovers
  const openApplications = useCallback(() => {
    setDownloads(false); // Close downloads when opening applications
    setApplications(true);
  }, []);
  const closeApplications = useCallback(() => setApplications(false), []);
  const toggleApplications = useCallback(() => {
    setApplications(prev => {
      if (!prev) setDownloads(false); // Close downloads when opening applications
      return !prev;
    });
  }, []);

  // Downloads popover actions - closes other temporary popovers
  const openDownloads = useCallback(() => {
    setApplications(false); // Close applications when opening downloads
    setDownloads(true);
  }, []);
  const closeDownloads = useCallback(() => setDownloads(false), []);
  const toggleDownloads = useCallback(() => {
    setDownloads(prev => {
      if (!prev) setApplications(false); // Close applications when opening downloads
      return !prev;
    });
  }, []);

  // Clipboard manager actions
  const openClipboard = useCallback(() => setClipboard(true), []);
  const closeClipboard = useCallback(() => setClipboard(false), []);
  const toggleClipboard = useCallback(() => setClipboard(prev => !prev), []);

  // Mission Control actions
  const openMissionControl = useCallback(() => {
    // Close other overlays when opening Mission Control
    setSpotlight(false);
    setApplications(false);
    setDownloads(false);
    setMissionControl(true);
  }, []);
  const closeMissionControl = useCallback(() => setMissionControl(false), []);
  const toggleMissionControl = useCallback(() => {
    setMissionControl(prev => {
      if (!prev) {
        setSpotlight(false);
        setApplications(false);
        setDownloads(false);
      }
      return !prev;
    });
  }, []);

  // Close all overlays
  const closeAllOverlays = useCallback(() => {
    setSpotlight(false);
    setForceQuit(false);
    setAppSwitcher(false);
    setAbout(false);
    setApplications(false);
    setDownloads(false);
    setClipboard(false);
    setMissionControl(false);
  }, []);

  return useMemo(() => ({
    // State
    spotlight,
    forceQuit,
    appSwitcher,
    about,
    applications,
    downloads,
    clipboard,
    missionControl,

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
    openClipboard,
    closeClipboard,
    toggleClipboard,
    openMissionControl,
    closeMissionControl,
    toggleMissionControl,
    closeAllOverlays,
  }), [
    spotlight, forceQuit, appSwitcher, about, applications, downloads, clipboard, missionControl,
    openSpotlight, closeSpotlight, toggleSpotlight,
    openForceQuit, closeForceQuit, openAppSwitcher, closeAppSwitcher,
    openAbout, closeAbout, openApplications, closeApplications,
    toggleApplications, openDownloads, closeDownloads, toggleDownloads,
    openClipboard, closeClipboard, toggleClipboard,
    openMissionControl, closeMissionControl, toggleMissionControl,
    closeAllOverlays
  ]);
}
