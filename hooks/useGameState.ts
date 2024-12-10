import { useState, useEffect, useCallback } from "react";
import { Dimensions } from "react-native";
import { useGameSounds } from "./useGameSounds";
import { Audio } from "expo-av";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

export const LAYOUT = {
  STATUS_BAR_HEIGHT: 200,
  CONTROLS_HEIGHT: 120,
  PIG_SAFE_PADDING: 50,
} as const;

const GAME_CONFIG = {
  TICK_RATE: 1000,
  POOP_CHANCE: 0.12,
  SICK_CHANCE: 0.08,
  MAX_STAT_VALUE: 100,
  MIN_STAT_VALUE: 0,
  STAT_DECREASE: {
    NORMAL: 0.8,
    SICK: 1.5,
    CLEANLINESS: 1.2,
  },
  STAT_INCREASE: {
    NORMAL: 20,
    SICK: 8,
  },
} as const;

interface GameState {
  hunger: number;
  happiness: number;
  cleanliness: number;
  age: number;
  isSick: boolean;
  isGameOver: boolean;
  hasWon: boolean;
  poops: Array<{ x: number; y: number; id: number }>;
  causeOfDeath?: string;
  backgroundSound: Audio.Sound | null;
}

export function useGameState() {
  const { playSound } = useGameSounds();
  const [state, setState] = useState<GameState>({
    hunger: GAME_CONFIG.MAX_STAT_VALUE,
    happiness: GAME_CONFIG.MAX_STAT_VALUE,
    cleanliness: GAME_CONFIG.MAX_STAT_VALUE,
    age: 0,
    isSick: false,
    isGameOver: false,
    hasWon: false,
    poops: [],
    backgroundSound: null,
  });

  const reset = useCallback(() => {
    setState({
      hunger: GAME_CONFIG.MAX_STAT_VALUE,
      happiness: GAME_CONFIG.MAX_STAT_VALUE,
      cleanliness: GAME_CONFIG.MAX_STAT_VALUE,
      age: 0,
      isSick: false,
      isGameOver: false,
      hasWon: false,
      poops: [],
      backgroundSound: null,
    });
  }, []);

  const decreaseStats = useCallback(() => {
    setState((prev) => {
      const decreaseRate = prev.isSick
        ? GAME_CONFIG.STAT_DECREASE.SICK
        : GAME_CONFIG.STAT_DECREASE.NORMAL;

      const poopMultiplier = 1 + prev.poops.length * 0.3;

      const ageMultiplier = 1 + prev.age / 30;

      const newHunger = Math.max(
        GAME_CONFIG.MIN_STAT_VALUE,
        prev.hunger - decreaseRate * 2 * poopMultiplier
      );
      const newHappiness = Math.max(
        GAME_CONFIG.MIN_STAT_VALUE,
        prev.happiness - decreaseRate * 1.5 * poopMultiplier * ageMultiplier
      );
      const newCleanliness = Math.max(
        GAME_CONFIG.MIN_STAT_VALUE,
        prev.cleanliness -
          GAME_CONFIG.STAT_DECREASE.CLEANLINESS * (1 + prev.poops.length * 0.5)
      );

      if (newHunger === GAME_CONFIG.MIN_STAT_VALUE) {
        return { ...prev, isGameOver: true, causeOfDeath: "hunger" };
      }
      if (newHappiness === GAME_CONFIG.MIN_STAT_VALUE) {
        return { ...prev, isGameOver: true, causeOfDeath: "happiness" };
      }
      if (newCleanliness === GAME_CONFIG.MIN_STAT_VALUE) {
        return { ...prev, isGameOver: true, causeOfDeath: "cleanliness" };
      }

      return {
        ...prev,
        hunger: newHunger,
        happiness: newHappiness,
        cleanliness: newCleanliness,
      };
    });
  }, []);

  const addPoop = useCallback(() => {
    playSound("poop");
    setState((prev) => {
      const newPoop = {
        id: Date.now(),
        x:
          Math.random() * (SCREEN_WIDTH - LAYOUT.PIG_SAFE_PADDING * 2) +
          LAYOUT.PIG_SAFE_PADDING,
        y:
          Math.random() *
            (SCREEN_HEIGHT -
              LAYOUT.STATUS_BAR_HEIGHT -
              LAYOUT.CONTROLS_HEIGHT -
              LAYOUT.PIG_SAFE_PADDING * 2) +
          LAYOUT.STATUS_BAR_HEIGHT +
          LAYOUT.PIG_SAFE_PADDING,
      };

      // Descrease cleanliness when a poop is added
      const newCleanliness = Math.max(
        GAME_CONFIG.MIN_STAT_VALUE,
        prev.cleanliness - 10
      );

      return {
        ...prev,
        poops: [...prev.poops, newPoop],
        cleanliness: newCleanliness,
      };
    });
  }, [playSound]);

  const cleanPoop = useCallback(
    (poopId: number) => {
      playSound("clean");
      setState((prev) => ({
        ...prev,
        poops: prev.poops.filter((poop) => poop.id !== poopId),
        cleanliness: Math.min(
          GAME_CONFIG.MAX_STAT_VALUE,
          prev.cleanliness + GAME_CONFIG.STAT_INCREASE.NORMAL
        ),
      }));
    },
    [playSound]
  );

  const feed = useCallback(() => {
    playSound("feed");
    setState((prev) => {
      const currentPoopChance = GAME_CONFIG.POOP_CHANCE * (prev.hunger / 20);

      if (Math.random() < currentPoopChance) {
        setTimeout(() => {
          addPoop();
        }, Math.random() * 2000 + 1000);
      }

      return {
        ...prev,
        hunger: Math.min(
          GAME_CONFIG.MAX_STAT_VALUE,
          prev.hunger +
            (prev.isSick
              ? GAME_CONFIG.STAT_INCREASE.SICK
              : GAME_CONFIG.STAT_INCREASE.NORMAL)
        ),
      };
    });
  }, [playSound, addPoop]);

  const play = useCallback(() => {
    playSound("play");
    setState((prev) => ({
      ...prev,
      happiness: Math.min(
        GAME_CONFIG.MAX_STAT_VALUE,
        prev.happiness +
          (prev.isSick
            ? GAME_CONFIG.STAT_INCREASE.SICK
            : GAME_CONFIG.STAT_INCREASE.NORMAL)
      ),
    }));
  }, [playSound]);

  const heal = useCallback(() => {
    playSound("heal");
    setState((prev) => ({
      ...prev,
      isSick: false,
    }));
  }, [playSound]);

  useEffect(() => {
    const gameInterval = setInterval(() => {
      if (!state.isGameOver && !state.hasWon) {
        decreaseStats();

        setState((prev) => {
          const newAge = prev.age + 0.25;
          if (newAge >= 100) {
            return { ...prev, age: 100, hasWon: true };
          }
          return { ...prev, age: newAge };
        });

        // Modified sick chance
        setState((prev) => {
          let sickChance = GAME_CONFIG.SICK_CHANCE;
          sickChance += prev.poops.length * 0.05;

          if (prev.happiness < 50) {
            sickChance += (50 - prev.happiness) * 0.005;
          }

          if (prev.hunger < 30) {
            sickChance += (30 - prev.hunger) * 0.01;
          }

          if (!prev.isSick && Math.random() < sickChance) {
            playSound("sick");
            return { ...prev, isSick: true };
          }

          return prev;
        });

        // Automatic poop addition
        setState((prev) => {
          let poopChance = GAME_CONFIG.POOP_CHANCE;

          // Increase chance when hunger is low
          if (prev.hunger < 50) {
            poopChance *= 1.5;
          }

          // Increase chance with age
          if (prev.age >= 50) {
            poopChance *= 1.5;
          } else if (prev.age >= 25) {
            poopChance *= 1.2;
          }

          // Add poop only if hunger is not at max
          if (
            Math.random() < poopChance &&
            prev.hunger < GAME_CONFIG.MAX_STAT_VALUE
          ) {
            setTimeout(() => {
              addPoop();
            }, Math.random() * 1000);
          }

          return prev;
        });
      }
    }, GAME_CONFIG.TICK_RATE);

    return () => clearInterval(gameInterval);
  }, [state.isGameOver, state.hasWon, decreaseStats, addPoop, playSound]);

  useEffect(() => {
    if (state.isGameOver) {
      playSound("gameOver");
    } else if (state.hasWon) {
      playSound("win");
    }
  }, [state.isGameOver, state.hasWon, playSound]);

  useEffect(() => {
    const loadSound = async () => {
      const { sound } = await Audio.Sound.createAsync(
        require("../assets/sounds/background.mp3"),
        { isLooping: true }
      );
      setState((prev) => ({ ...prev, backgroundSound: sound }));
      await sound.playAsync();
    };

    loadSound();

    return () => {
      if (state.backgroundSound) {
        state.backgroundSound.unloadAsync();
      }
    };
  }, []);

  return {
    state,
    actions: {
      feed,
      play,
      heal,
      cleanPoop,
      reset,
    },
  };
}
