import { useState, useCallback } from 'react';
import { Audio } from 'expo-av';
import { AppSettings } from '../types';

export const useAudio = (settings: AppSettings) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playAlert = useCallback(async (type: 'beep' | 'chime' | 'alert' | 'custom') => {
    if (!settings.enableAudio) return;

    try {
      // Stop previous sound if still playing
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }

      // Play different sounds based on type
      const newSound = new Audio.Sound();

      // For now, use system defaults
      // In production, load actual audio files
      await newSound.loadAsync(require('../assets/sounds/alert.mp3'));
      await newSound.setVolumeAsync(settings.audioVolume / 100);
      await newSound.playAsync();

      setSound(newSound);
      setIsPlaying(true);

      // Auto-stop after sound finishes
      const status = await newSound.getStatusAsync();
      if (status.isLoaded && status.durationMillis) {
        setTimeout(() => {
          setIsPlaying(false);
        }, status.durationMillis);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  }, [sound, settings.enableAudio, settings.audioVolume]);

  const stopAlert = useCallback(async () => {
    if (sound) {
      try {
        await sound.stopAsync();
        setIsPlaying(false);
      } catch (error) {
        console.error('Error stopping audio:', error);
      }
    }
  }, [sound]);

  const cleanup = useCallback(async () => {
    if (sound) {
      try {
        await sound.unloadAsync();
      } catch (error) {
        console.error('Error unloading audio:', error);
      }
    }
  }, [sound]);

  return {
    playAlert,
    stopAlert,
    isPlaying,
    cleanup,
  };
};
