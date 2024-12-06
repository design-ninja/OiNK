import { useEffect, useRef } from "react";
import { Audio } from "expo-av";

export function useGameSounds() {
  const sounds = useRef<Record<string, Audio.Sound>>({});

  useEffect(() => {
    const loadSounds = async () => {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
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
          shouldPlay: key === "background",
          isLooping: key === "background",
          volume: key === "background" ? 0.3 : 1,
        });
        sounds.current[key] = sound;
      }
    };

    loadSounds();

    return () => {
      Object.values(sounds.current).forEach((sound) => {
        sound.unloadAsync();
      });
    };
  }, []);

  const playSound = async (soundName: string) => {
    try {
      const sound = sounds.current[soundName];
      if (sound) {
        await sound.replayAsync();
      }
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  };

  return { playSound };
}
