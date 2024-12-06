import { useEffect, useRef, useCallback } from "react";
import { Audio } from "expo-av";

export function useGameSounds() {
  const sounds = useRef<Record<string, Audio.Sound>>({});
  const isBackgroundMusicPlaying = useRef(false);

  const playBackgroundMusic = useCallback(async () => {
    try {
      const backgroundSound = sounds.current["background"];
      if (!backgroundSound) return;

      const status = await backgroundSound.getStatusAsync();

      // Проверяем, не проигрывается ли уже музыка
      if (status.isLoaded && !status.isPlaying) {
        await backgroundSound.setPositionAsync(0); // Перематываем на начало
        await backgroundSound.playAsync();
        isBackgroundMusicPlaying.current = true;
      }
    } catch (error) {
      console.warn("Failed to play background music:", error);
      // Пробуем перезагрузить звук
      try {
        const { sound } = await Audio.Sound.createAsync(
          require("@/assets/sounds/background.mp3"),
          {
            shouldPlay: true,
            isLooping: true,
            volume: 0.3,
          }
        );
        sounds.current["background"] = sound;
        isBackgroundMusicPlaying.current = true;
      } catch (reloadError) {
        console.error("Failed to reload background music:", reloadError);
      }
    }
  }, []);

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

  const stopBackgroundMusic = useCallback(async () => {
    try {
      const backgroundSound = sounds.current["background"];
      if (!backgroundSound) return;

      const status = await backgroundSound.getStatusAsync();
      if (status.isLoaded && status.isPlaying) {
        await backgroundSound.pauseAsync();
        isBackgroundMusicPlaying.current = false;
      }
    } catch (error) {
      console.warn("Failed to stop background music:", error);
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
          gameOver: require("@/assets/sounds/gameover.mp3"),
          win: require("@/assets/sounds/win.mp3"),
          heal: require("@/assets/sounds/heal.mp3"),
          background: require("@/assets/sounds/background.mp3"),
        };

        for (const [key, file] of Object.entries(soundFiles)) {
          const { sound } = await Audio.Sound.createAsync(file, {
            shouldPlay: false,
            isLooping: key === "background",
            volume: key === "background" ? 0.3 : 1,
          });
          sounds.current[key] = sound;
        }

        await playBackgroundMusic();
      } catch (error) {
        console.error("Failed to load sounds:", error);
      }
    };

    loadSounds();

    return () => {
      Object.values(sounds.current).forEach((sound) => {
        sound.unloadAsync();
      });
      isBackgroundMusicPlaying.current = false;
    };
  }, [playBackgroundMusic]);

  return { playSound, playBackgroundMusic, stopBackgroundMusic };
}
