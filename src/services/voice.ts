/**
 * Voice Service for zOS
 *
 * Provides voice input/output capabilities:
 * - Speech-to-text via Whisper (transformers.js) or Web Speech API
 * - Text-to-speech via Web Speech API or DIA
 */

import { logger } from '@/lib/logger';

// Types
export interface VoiceConfig {
  sttEngine: 'whisper' | 'native';
  ttsEngine: 'native' | 'dia';
  language: string;
  voiceId?: string;
  autoPlay: boolean;
}

export interface TranscriptionResult {
  text: string;
  confidence: number;
  language?: string;
}

export interface VoiceState {
  isListening: boolean;
  isSpeaking: boolean;
  isModelLoaded: boolean;
  error: string | null;
}

// Default config
const DEFAULT_CONFIG: VoiceConfig = {
  sttEngine: 'native', // Start with native, can upgrade to whisper
  ttsEngine: 'native',
  language: 'en-US',
  autoPlay: false,
};

class VoiceService {
  private config: VoiceConfig;
  private state: VoiceState = {
    isListening: false,
    isSpeaking: false,
    isModelLoaded: false,
    error: null,
  };

  // Native Speech Recognition
  private recognition: SpeechRecognition | null = null;

  // Native Speech Synthesis
  private synthesis: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];

  // Whisper model (lazy loaded)
  private whisperPipeline: any = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];

  // Listeners
  private stateListeners: Set<(state: VoiceState) => void> = new Set();

  constructor(config?: Partial<VoiceConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initNativeSpeech();
  }

  /**
   * Initialize native Web Speech APIs
   */
  private initNativeSpeech(): void {
    // Check for Speech Recognition support
    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognitionAPI) {
      this.recognition = new SpeechRecognitionAPI();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = this.config.language;

      this.recognition.onresult = (event: SpeechRecognitionEvent) => {
        const result = event.results[event.results.length - 1];
        if (result.isFinal) {
          this.handleTranscription({
            text: result[0].transcript,
            confidence: result[0].confidence,
          });
        }
      };

      this.recognition.onend = () => {
        this.updateState({ isListening: false });
      };

      this.recognition.onerror = (event: any) => {
        logger.error('Speech recognition error:', event.error);
        this.updateState({
          isListening: false,
          error: event.error
        });
      };
    }

    // Check for Speech Synthesis support
    if (window.speechSynthesis) {
      this.synthesis = window.speechSynthesis;

      // Load voices
      const loadVoices = () => {
        this.voices = this.synthesis!.getVoices();
      };

      if (this.synthesis.onvoiceschanged !== undefined) {
        this.synthesis.onvoiceschanged = loadVoices;
      }
      loadVoices();
    }
  }

  /**
   * Load Whisper model for higher quality transcription
   */
  async loadWhisperModel(): Promise<boolean> {
    if (this.whisperPipeline) return true;

    try {
      this.updateState({ error: null });

      // Dynamic import of transformers.js
      const { pipeline } = await import('@xenova/transformers');

      // Load whisper-tiny for fast inference
      this.whisperPipeline = await pipeline(
        'automatic-speech-recognition',
        'Xenova/whisper-tiny.en',
        { progress_callback: (progress: any) => {
          logger.info('Loading Whisper:', progress);
        }}
      );

      this.updateState({ isModelLoaded: true });
      logger.info('Whisper model loaded');
      return true;
    } catch (error) {
      logger.error('Failed to load Whisper model:', error);
      this.updateState({ error: 'Failed to load Whisper model' });
      return false;
    }
  }

  /**
   * Start listening for voice input
   */
  async startListening(): Promise<void> {
    if (this.state.isListening) return;

    this.updateState({ isListening: true, error: null });

    if (this.config.sttEngine === 'whisper') {
      await this.startWhisperRecording();
    } else {
      this.startNativeRecognition();
    }
  }

  /**
   * Stop listening
   */
  stopListening(): Promise<TranscriptionResult | null> {
    if (!this.state.isListening) return Promise.resolve(null);

    if (this.config.sttEngine === 'whisper') {
      return this.stopWhisperRecording();
    } else {
      this.stopNativeRecognition();
      return Promise.resolve(null);
    }
  }

  /**
   * Native speech recognition
   */
  private startNativeRecognition(): void {
    if (!this.recognition) {
      this.updateState({ error: 'Speech recognition not supported' });
      return;
    }

    try {
      this.recognition.start();
    } catch (error) {
      logger.error('Failed to start recognition:', error);
      this.updateState({ isListening: false, error: 'Failed to start' });
    }
  }

  private stopNativeRecognition(): void {
    if (this.recognition) {
      this.recognition.stop();
    }
    this.updateState({ isListening: false });
  }

  /**
   * Whisper-based speech recognition
   */
  private async startWhisperRecording(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(100); // Collect data every 100ms
    } catch (error) {
      logger.error('Failed to start recording:', error);
      this.updateState({ isListening: false, error: 'Microphone access denied' });
    }
  }

  private async stopWhisperRecording(): Promise<TranscriptionResult | null> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) {
        this.updateState({ isListening: false });
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = async () => {
        this.updateState({ isListening: false });

        // Convert to audio blob
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });

        // Load Whisper if needed
        if (!this.whisperPipeline) {
          const loaded = await this.loadWhisperModel();
          if (!loaded) {
            resolve(null);
            return;
          }
        }

        try {
          // Convert blob to array buffer
          const arrayBuffer = await audioBlob.arrayBuffer();

          // Transcribe with Whisper
          const result = await this.whisperPipeline(arrayBuffer);

          const transcription: TranscriptionResult = {
            text: result.text.trim(),
            confidence: 1.0,
            language: 'en',
          };

          this.handleTranscription(transcription);
          resolve(transcription);
        } catch (error) {
          logger.error('Whisper transcription failed:', error);
          this.updateState({ error: 'Transcription failed' });
          resolve(null);
        }

        // Stop tracks
        this.mediaRecorder?.stream.getTracks().forEach(t => t.stop());
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * Handle transcription result
   */
  private transcriptionCallbacks: Set<(result: TranscriptionResult) => void> = new Set();

  private handleTranscription(result: TranscriptionResult): void {
    this.transcriptionCallbacks.forEach(cb => cb(result));
  }

  onTranscription(callback: (result: TranscriptionResult) => void): () => void {
    this.transcriptionCallbacks.add(callback);
    return () => this.transcriptionCallbacks.delete(callback);
  }

  /**
   * Text-to-speech
   */
  async speak(text: string): Promise<void> {
    if (!text.trim()) return;

    // Cancel any ongoing speech
    this.stopSpeaking();

    this.updateState({ isSpeaking: true });

    if (this.config.ttsEngine === 'dia') {
      await this.speakWithDia(text);
    } else {
      await this.speakWithNative(text);
    }
  }

  private speakWithNative(text: string): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synthesis) {
        this.updateState({ isSpeaking: false, error: 'TTS not supported' });
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.config.language;

      // Find a good voice
      const voice = this.voices.find(v =>
        v.name.includes('Samantha') || // macOS default
        v.name.includes('Google') ||
        v.lang.startsWith('en')
      ) || this.voices[0];

      if (voice) {
        utterance.voice = voice;
      }

      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onend = () => {
        this.updateState({ isSpeaking: false });
        resolve();
      };

      utterance.onerror = (event) => {
        logger.error('TTS error:', event);
        this.updateState({ isSpeaking: false, error: 'Speech failed' });
        resolve();
      };

      this.synthesis.speak(utterance);
    });
  }

  private async speakWithDia(text: string): Promise<void> {
    // DIA is a small TTS model from Nari Labs
    // For now, fall back to native TTS
    // TODO: Implement DIA when available as WebAssembly
    logger.info('DIA TTS not yet implemented, using native');
    return this.speakWithNative(text);
  }

  stopSpeaking(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
    this.updateState({ isSpeaking: false });
  }

  /**
   * Check capabilities
   */
  getCapabilities(): { stt: boolean; tts: boolean; whisper: boolean } {
    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    return {
      stt: !!SpeechRecognitionAPI,
      tts: !!window.speechSynthesis,
      whisper: true, // Can always try to load
    };
  }

  /**
   * State management
   */
  getState(): VoiceState {
    return { ...this.state };
  }

  private updateState(updates: Partial<VoiceState>): void {
    this.state = { ...this.state, ...updates };
    this.stateListeners.forEach(cb => cb(this.state));
  }

  onStateChange(callback: (state: VoiceState) => void): () => void {
    this.stateListeners.add(callback);
    return () => this.stateListeners.delete(callback);
  }

  /**
   * Configuration
   */
  setConfig(config: Partial<VoiceConfig>): void {
    this.config = { ...this.config, ...config };

    if (this.recognition) {
      this.recognition.lang = this.config.language;
    }
  }

  getConfig(): VoiceConfig {
    return { ...this.config };
  }

  getVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }
}

// Export singleton instance
export const voiceService = new VoiceService();

// Export class for custom instances
export { VoiceService };
