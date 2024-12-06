import { useEffect, useRef, useCallback } from "react";
import { Audio } from "expo-av";

export function useGameSounds() {
  const sounds = useRef<Record<string, Audio.Sound>>({});

  const playSound = useCallback(async (soundName: string) => {
    try {
      const sound = sounds.current[soundName];
      if (sound) {
        await sound.setPositionAsync(0);
        await sound.playAsync();
      }
    } catch (error) {
      console.warn(`Failed to play sound ${soundName}:`, error);
    }
  }, []);

  useEffect(() => {
    const loadSounds = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
        });

        const soundFiles = {
          feed: require("@/assets/sounds/feed.mp3"),
          play: require("@/assets/sounds/play.mp3"),
          clean: require("@/assets/sounds/clean.mp3"),
          sick: require("@/assets/sounds/sick.mp3"),
          poop: require("@/assets/sounds/poop.mp3"),
          heal: require("@/assets/sounds/heal.mp3"),
          gameOver: require("@/assets/sounds/gameover.mp3"),
          win: require("@/assets/sounds/win.mp3"),
        };

        for (const [key, file] of Object.entries(soundFiles)) {
          const { sound } = await Audio.Sound.createAsync(file, {
            shouldPlay: false,
            volume: 1,
          });
          sounds.current[key] = sound;
        }
      } catch (error) {
        console.error("Failed to load sounds:", error);
      }
    };

    loadSounds();

    return () => {
      Object.values(sounds.current).forEach((sound) => {
        sound.unloadAsync();
      });
    };
  }, []);

  return { playSound };
}
