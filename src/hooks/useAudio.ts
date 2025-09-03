import { useCallback } from 'react';
import { MessageType, RoomId } from '@/store/useStore';

// Audio configuration
const AUDIO_CONFIG = {
  volume: 1.0, // Default volume (full volume since sounds are pre-normalized)
  enabled: true, // Can be controlled by user settings
};

// Sound mappings (only for catering screen)
const SOUNDS = {
  status: {
    seen: '/sounds/seen.wav', 
    resolved: '/sounds/resolved.wav',
  },
  rooms: {
    'dashboard-a': '/sounds/room-a.wav', // Room 121
    'dashboard-b': '/sounds/room-b.wav', // Room 130
  }
} as const;

export const useAudio = () => {
  // Generic audio player function
  const playSound = useCallback((soundPath: string, volume: number = AUDIO_CONFIG.volume) => {
    if (!AUDIO_CONFIG.enabled) return;
    
    try {
      const audio = new Audio(soundPath);
      audio.volume = Math.max(0, Math.min(1, volume)); // Clamp between 0-1
      audio.currentTime = 0; // Reset to start if already playing
      
      // Play the sound
      const playPromise = audio.play();
      
      // Handle browsers that return a promise
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn('Audio playback failed:', error);
        });
      }
    } catch (error) {
      console.warn('Failed to play sound:', soundPath, error);
    }
  }, []);

  // Test sound for settings (using delay button sound file)
  const playTestSound = useCallback(() => {
    playSound('/sounds/button-1.wav'); // Test with Do Not Disturb sound
  }, [playSound]);

  // Status change sounds
  const playStatusSound = useCallback((status: 'seen' | 'resolved') => {
    const soundPath = SOUNDS.status[status];
    if (soundPath) {
      playSound(soundPath);
    }
  }, [playSound]);

  // Room alert sounds (for catering screen)
  const playRoomAlert = useCallback((roomId: RoomId) => {
    const soundPath = SOUNDS.rooms[roomId];
    if (soundPath) {
      playSound(soundPath);
    }
  }, [playSound]);

  // Audio settings controls
  const setAudioEnabled = useCallback((enabled: boolean) => {
    AUDIO_CONFIG.enabled = enabled;
  }, []);

  const setVolume = useCallback((volume: number) => {
    AUDIO_CONFIG.volume = Math.max(0, Math.min(1, volume));
  }, []);

  return {
    playTestSound,
    playStatusSound,
    playRoomAlert,
    setAudioEnabled,
    setVolume,
    isEnabled: AUDIO_CONFIG.enabled,
    volume: AUDIO_CONFIG.volume,
  };
};
