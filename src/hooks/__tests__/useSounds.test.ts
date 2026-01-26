import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the dependencies with inline factories
vi.mock('@/lib/sounds', () => ({
  soundManager: {
    setVolume: vi.fn(),
    setEnabled: vi.fn(),
    play: vi.fn(),
    playAlert: vi.fn(),
    playVolumeChange: vi.fn(),
  },
  playSound: vi.fn(),
  SoundType: {},
}));

vi.mock('../useSystemPreferences', () => ({
  useSystemPreferences: vi.fn(() => ({
    sound: {
      outputVolume: 0.75,
      outputMuted: false,
      playFeedback: true,
      playStartupSound: true,
      alertSound: 'Glass',
    },
    accessibility: {
      reduceMotion: false,
    },
  })),
}));

// Import after mocks
import { useSounds } from '../useSounds';
import { soundManager } from '@/lib/sounds';
import { useSystemPreferences } from '../useSystemPreferences';

describe('useSounds', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the mock implementation
    vi.mocked(useSystemPreferences).mockReturnValue({
      sound: {
        outputVolume: 0.75,
        outputMuted: false,
        playFeedback: true,
        playStartupSound: true,
        alertSound: 'Glass',
      },
      accessibility: {
        reduceMotion: false,
      },
    } as ReturnType<typeof useSystemPreferences>);
  });

  describe('initial state', () => {
    it('returns isEnabled based on preferences', () => {
      const { result } = renderHook(() => useSounds());
      expect(result.current.isEnabled).toBe(true);
    });

    it('returns volume from preferences', () => {
      const { result } = renderHook(() => useSounds());
      expect(result.current.volume).toBe(0.75);
    });

    it('returns 0 volume when muted', () => {
      vi.mocked(useSystemPreferences).mockReturnValue({
        sound: {
          outputVolume: 0.75,
          outputMuted: true,
          playFeedback: true,
          playStartupSound: true,
          alertSound: 'Glass',
        },
        accessibility: { reduceMotion: false },
      } as ReturnType<typeof useSystemPreferences>);

      const { result } = renderHook(() => useSounds());
      expect(result.current.volume).toBe(0);
    });
  });

  describe('play methods', () => {
    it('provides play function', () => {
      const { result } = renderHook(() => useSounds());
      expect(typeof result.current.play).toBe('function');
    });

    it('provides playAlert function', () => {
      const { result } = renderHook(() => useSounds());
      expect(typeof result.current.playAlert).toBe('function');
    });

    it('calls soundManager.play on play()', () => {
      const { result } = renderHook(() => useSounds());
      result.current.play('click');
      expect(soundManager.play).toHaveBeenCalledWith('click');
    });

    it('calls soundManager.playAlert on playAlert()', () => {
      const { result } = renderHook(() => useSounds());
      result.current.playAlert('Basso');
      expect(soundManager.playAlert).toHaveBeenCalledWith('Basso');
    });
  });

  describe('convenience methods exist', () => {
    it('has click method', () => {
      const { result } = renderHook(() => useSounds());
      expect(typeof result.current.click).toBe('function');
    });

    it('has menuClick method', () => {
      const { result } = renderHook(() => useSounds());
      expect(typeof result.current.menuClick).toBe('function');
    });

    it('has buttonClick method', () => {
      const { result } = renderHook(() => useSounds());
      expect(typeof result.current.buttonClick).toBe('function');
    });

    it('has toggle method', () => {
      const { result } = renderHook(() => useSounds());
      expect(typeof result.current.toggle).toBe('function');
    });

    it('has notification method', () => {
      const { result } = renderHook(() => useSounds());
      expect(typeof result.current.notification).toBe('function');
    });

    it('has error method', () => {
      const { result } = renderHook(() => useSounds());
      expect(typeof result.current.error).toBe('function');
    });

    it('has warning method', () => {
      const { result } = renderHook(() => useSounds());
      expect(typeof result.current.warning).toBe('function');
    });

    it('has screenshot method', () => {
      const { result } = renderHook(() => useSounds());
      expect(typeof result.current.screenshot).toBe('function');
    });

    it('has trashEmpty method', () => {
      const { result } = renderHook(() => useSounds());
      expect(typeof result.current.trashEmpty).toBe('function');
    });

    it('has volumeChange method', () => {
      const { result } = renderHook(() => useSounds());
      expect(typeof result.current.volumeChange).toBe('function');
    });

    it('has window methods', () => {
      const { result } = renderHook(() => useSounds());
      expect(typeof result.current.windowMinimize).toBe('function');
      expect(typeof result.current.windowZoom).toBe('function');
      expect(typeof result.current.windowClose).toBe('function');
    });

    it('has dockBounce method', () => {
      const { result } = renderHook(() => useSounds());
      expect(typeof result.current.dockBounce).toBe('function');
    });

    it('has startup method', () => {
      const { result } = renderHook(() => useSounds());
      expect(typeof result.current.startup).toBe('function');
    });
  });

  describe('disabled state', () => {
    beforeEach(() => {
      vi.mocked(useSystemPreferences).mockReturnValue({
        sound: {
          outputVolume: 0.75,
          outputMuted: false,
          playFeedback: false,
          playStartupSound: false,
          alertSound: 'Glass',
        },
        accessibility: { reduceMotion: false },
      } as ReturnType<typeof useSystemPreferences>);
    });

    it('does NOT play sounds when feedback is disabled', () => {
      const { result } = renderHook(() => useSounds());
      result.current.click();
      expect(soundManager.play).not.toHaveBeenCalled();
    });

    it('reports isEnabled as false', () => {
      const { result } = renderHook(() => useSounds());
      expect(result.current.isEnabled).toBe(false);
    });
  });

  describe('muted state', () => {
    beforeEach(() => {
      vi.mocked(useSystemPreferences).mockReturnValue({
        sound: {
          outputVolume: 0.75,
          outputMuted: true,
          playFeedback: true,
          playStartupSound: true,
          alertSound: 'Glass',
        },
        accessibility: { reduceMotion: false },
      } as ReturnType<typeof useSystemPreferences>);
    });

    it('does NOT play sounds when muted', () => {
      const { result } = renderHook(() => useSounds());
      result.current.click();
      expect(soundManager.play).not.toHaveBeenCalled();
    });

    it('reports isEnabled as false when muted', () => {
      const { result } = renderHook(() => useSounds());
      expect(result.current.isEnabled).toBe(false);
    });
  });

  describe('sound manager sync', () => {
    it('syncs enabled state on mount', () => {
      renderHook(() => useSounds());
      expect(soundManager.setEnabled).toHaveBeenCalledWith(true);
    });

    it('syncs volume on mount', () => {
      renderHook(() => useSounds());
      expect(soundManager.setVolume).toHaveBeenCalled();
    });
  });
});
