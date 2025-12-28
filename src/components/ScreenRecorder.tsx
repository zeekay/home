import React, { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface ScreenRecorderState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  hasAudio: boolean;
}

export interface ScreenRecorderControls {
  startRecording: (withAudio?: boolean) => Promise<void>;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  togglePause: () => void;
}

interface ScreenRecorderContextType extends ScreenRecorderState, ScreenRecorderControls {}

const ScreenRecorderContext = React.createContext<ScreenRecorderContextType | null>(null);

export const useScreenRecorder = (): ScreenRecorderContextType => {
  const context = React.useContext(ScreenRecorderContext);
  if (!context) {
    throw new Error('useScreenRecorder must be used within ScreenRecorderProvider');
  }
  return context;
};

// Format duration as MM:SS
const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Download helper
const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const ScreenRecorderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [hasAudio, setHasAudio] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Duration timer
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording, isPaused]);

  const startRecording = useCallback(async (withAudio: boolean = false) => {
    try {
      // Request screen capture
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'monitor',
        } as MediaTrackConstraints,
        audio: withAudio,
      });

      let combinedStream = displayStream;

      // If audio requested and not already in display stream, get microphone
      if (withAudio && !displayStream.getAudioTracks().length) {
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });

          const tracks = [
            ...displayStream.getVideoTracks(),
            ...audioStream.getAudioTracks(),
          ];
          combinedStream = new MediaStream(tracks);
        } catch {
          // Continue without audio if mic access denied
          toast.warning('Microphone access denied. Recording without audio.');
        }
      }

      streamRef.current = combinedStream;
      chunksRef.current = [];

      // Determine supported MIME type
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : MediaRecorder.isTypeSupported('video/webm')
          ? 'video/webm'
          : 'video/mp4';

      const recorder = new MediaRecorder(combinedStream, { mimeType });

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const extension = mimeType.includes('webm') ? 'webm' : 'mp4';
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `zos-recording-${timestamp}.${extension}`;

        downloadBlob(blob, filename);
        toast.success(`Recording saved: ${filename}`);

        // Clean up stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }

        setIsRecording(false);
        setIsPaused(false);
        setDuration(0);
        setHasAudio(false);
      };

      // Handle stream ending (user clicks "Stop sharing")
      combinedStream.getVideoTracks()[0].onended = () => {
        if (mediaRecorderRef.current?.state !== 'inactive') {
          mediaRecorderRef.current?.stop();
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start(1000); // Collect data every second

      setIsRecording(true);
      setIsPaused(false);
      setDuration(0);
      setHasAudio(withAudio || combinedStream.getAudioTracks().length > 0);

      toast.success('Screen recording started');
    } catch (error) {
      if ((error as Error).name === 'NotAllowedError') {
        toast.error('Screen sharing permission denied');
      } else {
        toast.error('Failed to start recording');
        console.error('Recording error:', error);
      }
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      toast.info('Recording paused');
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      toast.info('Recording resumed');
    }
  }, []);

  const togglePause = useCallback(() => {
    if (isPaused) {
      resumeRecording();
    } else {
      pauseRecording();
    }
  }, [isPaused, pauseRecording, resumeRecording]);

  const value: ScreenRecorderContextType = {
    isRecording,
    isPaused,
    duration,
    hasAudio,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    togglePause,
  };

  return (
    <ScreenRecorderContext.Provider value={value}>
      {children}
    </ScreenRecorderContext.Provider>
  );
};

// Menu bar recording indicator component
interface RecordingIndicatorProps {
  className?: string;
  onClick?: () => void;
}

export const RecordingIndicator: React.FC<RecordingIndicatorProps> = ({
  className,
  onClick
}) => {
  const { isRecording, isPaused, duration, stopRecording, togglePause } = useScreenRecorder();

  if (!isRecording) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-2 py-0.5 rounded-md cursor-pointer",
        "bg-red-500/20 hover:bg-red-500/30 transition-colors",
        className
      )}
      onClick={onClick}
      role="button"
      aria-label="Screen recording controls"
    >
      {/* Recording dot */}
      <div
        className={cn(
          "w-2 h-2 rounded-full bg-red-500",
          !isPaused && "animate-pulse"
        )}
      />

      {/* Duration */}
      <span className="text-xs font-mono text-red-400">
        {formatDuration(duration)}
      </span>

      {/* Pause/Resume button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          togglePause();
        }}
        className="p-0.5 hover:bg-white/10 rounded"
        aria-label={isPaused ? 'Resume recording' : 'Pause recording'}
      >
        {isPaused ? (
          <svg className="w-3 h-3 text-red-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        ) : (
          <svg className="w-3 h-3 text-red-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 4h4v16H6zM14 4h4v16h-4z"/>
          </svg>
        )}
      </button>

      {/* Stop button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          stopRecording();
        }}
        className="p-0.5 hover:bg-white/10 rounded"
        aria-label="Stop recording"
      >
        <svg className="w-3 h-3 text-red-400" fill="currentColor" viewBox="0 0 24 24">
          <rect x="6" y="6" width="12" height="12"/>
        </svg>
      </button>
    </div>
  );
};

// Screen recorder control panel (for use in a window or popover)
interface ScreenRecorderPanelProps {
  className?: string;
  onClose?: () => void;
}

export const ScreenRecorderPanel: React.FC<ScreenRecorderPanelProps> = ({
  className,
  onClose
}) => {
  const {
    isRecording,
    isPaused,
    duration,
    hasAudio,
    startRecording,
    stopRecording,
    togglePause
  } = useScreenRecorder();

  const [recordWithAudio, setRecordWithAudio] = useState(true);

  const handleStart = async () => {
    await startRecording(recordWithAudio);
  };

  return (
    <div className={cn("p-4 space-y-4", className)}>
      <h3 className="text-lg font-medium text-white">Screen Recording</h3>

      {!isRecording ? (
        <>
          {/* Audio toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={recordWithAudio}
              onChange={(e) => setRecordWithAudio(e.target.checked)}
              className="w-4 h-4 rounded border-white/30 bg-white/10 checked:bg-blue-500"
            />
            <span className="text-sm text-white/70">Record with audio</span>
          </label>

          {/* Start button */}
          <button
            onClick={handleStart}
            className={cn(
              "w-full py-2 px-4 rounded-lg font-medium",
              "bg-red-500 hover:bg-red-600 text-white",
              "transition-colors"
            )}
          >
            Start Recording
          </button>
        </>
      ) : (
        <>
          {/* Recording status */}
          <div className="flex items-center justify-center gap-3 py-4">
            <div
              className={cn(
                "w-4 h-4 rounded-full bg-red-500",
                !isPaused && "animate-pulse"
              )}
            />
            <span className="text-2xl font-mono text-white">
              {formatDuration(duration)}
            </span>
            {hasAudio && (
              <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            <button
              onClick={togglePause}
              className={cn(
                "flex-1 py-2 px-4 rounded-lg font-medium",
                "bg-white/10 hover:bg-white/20 text-white",
                "transition-colors"
              )}
            >
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            <button
              onClick={stopRecording}
              className={cn(
                "flex-1 py-2 px-4 rounded-lg font-medium",
                "bg-red-500 hover:bg-red-600 text-white",
                "transition-colors"
              )}
            >
              Stop
            </button>
          </div>

          {isPaused && (
            <p className="text-xs text-center text-white/50">
              Recording paused
            </p>
          )}
        </>
      )}

      <p className="text-xs text-white/40 text-center">
        Recording will be saved as WebM/MP4
      </p>
    </div>
  );
};

export default ScreenRecorderProvider;
