import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useOverlays } from '../useOverlays';

describe('useOverlays', () => {
  describe('initial state', () => {
    it('all overlays start closed', () => {
      const { result } = renderHook(() => useOverlays());

      expect(result.current.spotlight).toBe(false);
      expect(result.current.forceQuit).toBe(false);
      expect(result.current.appSwitcher).toBe(false);
      expect(result.current.about).toBe(false);
      expect(result.current.applications).toBe(false);
      expect(result.current.downloads).toBe(false);
    });
  });

  describe('spotlight', () => {
    it('openSpotlight sets spotlight to true', () => {
      const { result } = renderHook(() => useOverlays());

      act(() => {
        result.current.openSpotlight();
      });

      expect(result.current.spotlight).toBe(true);
    });

    it('closeSpotlight sets spotlight to false', () => {
      const { result } = renderHook(() => useOverlays());

      act(() => {
        result.current.openSpotlight();
      });
      act(() => {
        result.current.closeSpotlight();
      });

      expect(result.current.spotlight).toBe(false);
    });

    it('toggleSpotlight toggles state', () => {
      const { result } = renderHook(() => useOverlays());

      act(() => {
        result.current.toggleSpotlight();
      });
      expect(result.current.spotlight).toBe(true);

      act(() => {
        result.current.toggleSpotlight();
      });
      expect(result.current.spotlight).toBe(false);
    });
  });

  describe('forceQuit', () => {
    it('openForceQuit sets forceQuit to true', () => {
      const { result } = renderHook(() => useOverlays());

      act(() => {
        result.current.openForceQuit();
      });

      expect(result.current.forceQuit).toBe(true);
    });

    it('closeForceQuit sets forceQuit to false', () => {
      const { result } = renderHook(() => useOverlays());

      act(() => {
        result.current.openForceQuit();
      });
      act(() => {
        result.current.closeForceQuit();
      });

      expect(result.current.forceQuit).toBe(false);
    });
  });

  describe('appSwitcher', () => {
    it('openAppSwitcher sets appSwitcher to true', () => {
      const { result } = renderHook(() => useOverlays());

      act(() => {
        result.current.openAppSwitcher();
      });

      expect(result.current.appSwitcher).toBe(true);
    });

    it('closeAppSwitcher sets appSwitcher to false', () => {
      const { result } = renderHook(() => useOverlays());

      act(() => {
        result.current.openAppSwitcher();
      });
      act(() => {
        result.current.closeAppSwitcher();
      });

      expect(result.current.appSwitcher).toBe(false);
    });
  });

  describe('about', () => {
    it('openAbout sets about to true', () => {
      const { result } = renderHook(() => useOverlays());

      act(() => {
        result.current.openAbout();
      });

      expect(result.current.about).toBe(true);
    });

    it('closeAbout sets about to false', () => {
      const { result } = renderHook(() => useOverlays());

      act(() => {
        result.current.openAbout();
      });
      act(() => {
        result.current.closeAbout();
      });

      expect(result.current.about).toBe(false);
    });
  });

  describe('applications', () => {
    it('openApplications sets applications to true', () => {
      const { result } = renderHook(() => useOverlays());

      act(() => {
        result.current.openApplications();
      });

      expect(result.current.applications).toBe(true);
    });

    it('closeApplications sets applications to false', () => {
      const { result } = renderHook(() => useOverlays());

      act(() => {
        result.current.openApplications();
      });
      act(() => {
        result.current.closeApplications();
      });

      expect(result.current.applications).toBe(false);
    });

    it('toggleApplications toggles state', () => {
      const { result } = renderHook(() => useOverlays());

      act(() => {
        result.current.toggleApplications();
      });
      expect(result.current.applications).toBe(true);

      act(() => {
        result.current.toggleApplications();
      });
      expect(result.current.applications).toBe(false);
    });
  });

  describe('downloads', () => {
    it('openDownloads sets downloads to true', () => {
      const { result } = renderHook(() => useOverlays());

      act(() => {
        result.current.openDownloads();
      });

      expect(result.current.downloads).toBe(true);
    });

    it('closeDownloads sets downloads to false', () => {
      const { result } = renderHook(() => useOverlays());

      act(() => {
        result.current.openDownloads();
      });
      act(() => {
        result.current.closeDownloads();
      });

      expect(result.current.downloads).toBe(false);
    });

    it('toggleDownloads toggles state', () => {
      const { result } = renderHook(() => useOverlays());

      act(() => {
        result.current.toggleDownloads();
      });
      expect(result.current.downloads).toBe(true);

      act(() => {
        result.current.toggleDownloads();
      });
      expect(result.current.downloads).toBe(false);
    });
  });

  describe('closeAllOverlays', () => {
    it('closes all open overlays', () => {
      const { result } = renderHook(() => useOverlays());

      // Open all overlays
      act(() => {
        result.current.openSpotlight();
        result.current.openForceQuit();
        result.current.openAppSwitcher();
        result.current.openAbout();
        result.current.openApplications();
        result.current.openDownloads();
      });

      // Verify all are open
      expect(result.current.spotlight).toBe(true);
      expect(result.current.forceQuit).toBe(true);
      expect(result.current.appSwitcher).toBe(true);
      expect(result.current.about).toBe(true);
      expect(result.current.applications).toBe(true);
      expect(result.current.downloads).toBe(true);

      // Close all
      act(() => {
        result.current.closeAllOverlays();
      });

      // Verify all are closed
      expect(result.current.spotlight).toBe(false);
      expect(result.current.forceQuit).toBe(false);
      expect(result.current.appSwitcher).toBe(false);
      expect(result.current.about).toBe(false);
      expect(result.current.applications).toBe(false);
      expect(result.current.downloads).toBe(false);
    });

    it('works when only some overlays are open', () => {
      const { result } = renderHook(() => useOverlays());

      act(() => {
        result.current.openSpotlight();
        result.current.openAbout();
      });

      act(() => {
        result.current.closeAllOverlays();
      });

      expect(result.current.spotlight).toBe(false);
      expect(result.current.about).toBe(false);
    });

    it('is idempotent when no overlays are open', () => {
      const { result } = renderHook(() => useOverlays());

      act(() => {
        result.current.closeAllOverlays();
      });

      expect(result.current.spotlight).toBe(false);
      expect(result.current.forceQuit).toBe(false);
      expect(result.current.appSwitcher).toBe(false);
      expect(result.current.about).toBe(false);
      expect(result.current.applications).toBe(false);
      expect(result.current.downloads).toBe(false);
    });
  });
});
