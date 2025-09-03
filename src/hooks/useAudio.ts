import { useCallback, useRef, useEffect } from 'react';
import { RoomId } from '@/store/useStore';

// Audio configuration
const AUDIO_CONFIG = {
  volume: 1.0, // Default volume (full volume since sounds are pre-normalized)
  enabled: true, // Can be controlled by user settings
};

// Sound mappings (only room alerts for catering screen)
const SOUNDS = {
  rooms: {
    'dashboard-a': '/sounds/room-a.wav', // Room 121
  }
} as const;

export const useAudio = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const isInitializedRef = useRef(false);

  // Debug: Override Audio constructor to catch unexpected audio creation
  useEffect(() => {
    const originalAudio = window.Audio;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).Audio = function(src?: string) {
      console.log('🎵 NEW Audio() created with src:', src);
      console.trace('Audio creation stack trace:');
      const audio = new originalAudio(src);
      
      // Monitor this audio element
      const originalPlay = audio.play;
      audio.play = function(...args) {
        console.log('▶️ Audio.play() called on:', src || 'unknown src');
        console.trace('Play call stack:');
        return originalPlay.apply(this, args);
      };
      
      return audio;
    };

    // Also override HTMLAudioElement.prototype.play
    const originalPrototypePlay = HTMLAudioElement.prototype.play;
    HTMLAudioElement.prototype.play = function(...args) {
      console.log('▶️ HTMLAudioElement.play() called on:', this.src);
      console.trace('Prototype play call stack:');
      return originalPrototypePlay.apply(this, args);
    };

    return () => {
      window.Audio = originalAudio;
      HTMLAudioElement.prototype.play = originalPrototypePlay;
    };
  }, []);

  // Initialize AudioContext and preload sounds
  const initializeAudio = useCallback(async () => {
    if (isInitializedRef.current) return;

    console.log('🎵 Initializing audio system...');

    try {
      // Initialize AudioContext for iOS compatibility
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioContextRef.current = new AudioContextClass();
        console.log('✅ AudioContext created');
        
        // Resume context if suspended (iOS requirement)
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
          console.log('✅ AudioContext resumed from suspended state');
        }
      }

      // Pre-create Audio elements for room sounds
      Object.entries(SOUNDS.rooms).forEach(([roomId, soundPath]) => {
        console.log('📁 Creating audio element for:', roomId, '→', soundPath);
        const audio = new Audio();
        audio.preload = 'auto';
        audio.src = soundPath;
        audio.volume = AUDIO_CONFIG.volume;
        
        // Add event listeners for debugging
        audio.addEventListener('loadstart', () => console.log('📥 Loading started:', roomId));
        audio.addEventListener('canplay', () => console.log('✅ Can play:', roomId));
        audio.addEventListener('error', (e) => console.error('❌ Audio error:', roomId, e));
        audio.addEventListener('play', () => console.log('▶️ Audio PLAY event:', roomId));
        audio.addEventListener('pause', () => console.log('⏸️ Audio PAUSE event:', roomId));
        audio.addEventListener('ended', () => console.log('🔚 Audio ENDED event:', roomId));
        
        // Preload the audio
        audio.load();
        
        audioElementsRef.current.set(roomId, audio);
      });

      console.log('✅ Audio system initialized with elements:', Array.from(audioElementsRef.current.keys()));
      isInitializedRef.current = true;
    } catch (error) {
      console.warn('❌ Audio initialization failed:', error);
    }
  }, []);

  // Initialize audio on first mount
  useEffect(() => {
    // Initialize immediately, but also set up for user interaction
    initializeAudio();

    // Set up user interaction listeners to unlock audio on iOS
    const handleUserInteraction = () => {
      initializeAudio();
      // Resume AudioContext if it was suspended
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
    };

    // Listen for any user interaction to unlock audio
    document.addEventListener('touchstart', handleUserInteraction, { once: true });
    document.addEventListener('click', handleUserInteraction, { once: true });

    return () => {
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('click', handleUserInteraction);
    };
  }, [initializeAudio]);

  // Enhanced audio playback with retry logic
  const playSound = useCallback(async (roomId: string) => {
    console.log('🎵 playSound called for roomId:', roomId);
    console.log('🔊 Audio enabled:', AUDIO_CONFIG.enabled);
    
    if (!AUDIO_CONFIG.enabled) {
      console.log('❌ Audio disabled, not playing');
      return;
    }

    try {
      // Ensure audio is initialized
      await initializeAudio();
      console.log('✅ Audio initialized');

      const audio = audioElementsRef.current.get(roomId);
      if (!audio) {
        console.warn('❌ Audio element not found for room:', roomId);
        console.log('Available audio elements:', Array.from(audioElementsRef.current.keys()));
        return;
      }

      console.log('🎵 Playing audio for room:', roomId, 'src:', audio.src);
      
      // Reset audio to beginning
      audio.currentTime = 0;
      audio.volume = AUDIO_CONFIG.volume;

      // Play with retry logic
      const playWithRetry = async (retries = 3): Promise<void> => {
        try {
          const playPromise = audio.play();
          if (playPromise !== undefined) {
            await playPromise;
          }
          console.log('✅ Audio played successfully for room:', roomId);
        } catch (error) {
          console.warn('❌ Audio play attempt failed:', error);
          if (retries > 0) {
            console.log('🔄 Retrying audio playback, retries left:', retries - 1);
            // Wait briefly and retry
            await new Promise(resolve => setTimeout(resolve, 100));
            return playWithRetry(retries - 1);
          }
          throw error;
        }
      };

      await playWithRetry();
    } catch (error) {
      console.warn('❌ Audio playback failed for room:', roomId, error);
    }
  }, [initializeAudio]);

  // Room alert sounds (for catering screen only)
  const playRoomAlert = useCallback((roomId: RoomId) => {
    console.log('🔊 PLAYING ROOM ALERT for:', roomId);
    playSound(roomId);
  }, [playSound]);

  // Audio settings controls
  const setAudioEnabled = useCallback((enabled: boolean) => {
    AUDIO_CONFIG.enabled = enabled;
  }, []);

  const setVolume = useCallback((volume: number) => {
    AUDIO_CONFIG.volume = Math.max(0, Math.min(1, volume));
    // Update volume on all pre-loaded audio elements
    audioElementsRef.current.forEach(audio => {
      audio.volume = AUDIO_CONFIG.volume;
    });
  }, []);

  return {
    playRoomAlert,
    setAudioEnabled,
    setVolume,
    isEnabled: AUDIO_CONFIG.enabled,
    volume: AUDIO_CONFIG.volume,
  };
};
