import { useState, useEffect, useCallback } from "react";
import { Dimensions } from "react-native";
import { useGameSounds } from "./useGameSounds";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

const LAYOUT = {
  STATUS_BAR_HEIGHT: 200,
  CONTROLS_HEIGHT: 100,
  PIG_SAFE_PADDING: 50,
} as const;

const GAME_CONFIG = {
  TICK_RATE: 1000,
  POOP_CHANCE: 0.15,
  SICK_CHANCE: 0.08,
  MAX_STAT_VALUE: 100,
  MIN_STAT_VALUE: 0,
  STAT_DECREASE: {
    NORMAL: 1,
    SICK: 2,
  },
  STAT_INCREASE: {
    NORMAL: 15,
    SICK: 5,
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
  isPaused: boolean;
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
    isPaused: false,
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
      isPaused: false,
    });
  }, []);

  const togglePause = useCallback(() => {
    setState((prev) => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  const decreaseStats = useCallback(() => {
    if (state.isPaused) return;

    setState((prev) => {
      const decreaseRate = prev.isSick
        ? GAME_CONFIG.STAT_DECREASE.SICK
        : GAME_CONFIG.STAT_DECREASE.NORMAL;

      const newHunger = Math.max(
        GAME_CONFIG.MIN_STAT_VALUE,
        prev.hunger - decreaseRate * 2
      );
      const newHappiness = Math.max(
        GAME_CONFIG.MIN_STAT_VALUE,
        prev.happiness - decreaseRate * 1.5
      );
      const newCleanliness = Math.max(
        GAME_CONFIG.MIN_STAT_VALUE,
        prev.cleanliness - GAME_CONFIG.STAT_DECREASE.NORMAL
      );

      if (newHunger === GAME_CONFIG.MIN_STAT_VALUE) {
        return { ...prev, isGameOver: true, causeOfDeath: "hunger" };
      }
      if (newHappiness === GAME_CONFIG.MIN_STAT_VALUE) {
        return { ...prev, isGameOver: true, causeOfDeath: "sadness" };
      }
      if (newCleanliness === GAME_CONFIG.MIN_STAT_VALUE) {
        return { ...prev, isGameOver: true, causeOfDeath: "dirt" };
      }

      return {
        ...prev,
        hunger: newHunger,
        happiness: newHappiness,
        cleanliness: newCleanliness,
      };
    });
  }, [state.isPaused]);

  const addPoop = useCallback(() => {
    setState((prev) => ({
      ...prev,
      poops: [
        ...prev.poops,
        {
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
          id: Date.now(),
        },
      ],
      cleanliness: Math.max(
        GAME_CONFIG.MIN_STAT_VALUE,
        prev.cleanliness - GAME_CONFIG.STAT_DECREASE.NORMAL
      ),
    }));
  }, []);

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
    setState((prev) => ({
      ...prev,
      hunger: Math.min(
        GAME_CONFIG.MAX_STAT_VALUE,
        prev.hunger +
          (prev.isSick
            ? GAME_CONFIG.STAT_INCREASE.SICK
            : GAME_CONFIG.STAT_INCREASE.NORMAL)
      ),
    }));
  }, [playSound]);

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
      if (!state.isGameOver && !state.hasWon && !state.isPaused) {
        decreaseStats();

        setState((prev) => {
          const newAge = prev.age + 0.1;
          if (newAge >= 100) {
            return { ...prev, age: 100, hasWon: true };
          }
          return { ...prev, age: newAge };
        });

        // Шанс заболеть
        if (Math.random() < GAME_CONFIG.SICK_CHANCE) {
          setState((prev) => ({ ...prev, isSick: true }));
        }

        // Шанс покакать
        if (Math.random() < GAME_CONFIG.POOP_CHANCE) {
          addPoop();
        }
      }
    }, GAME_CONFIG.TICK_RATE);

    return () => clearInterval(gameInterval);
  }, [state.isGameOver, state.hasWon, state.isPaused, decreaseStats, addPoop]);

  useEffect(() => {
    if (state.isGameOver) {
      playSound("gameOver");
    } else if (state.hasWon) {
      playSound("win");
    }
  }, [state.isGameOver, state.hasWon, playSound]);

  return {
    state,
    actions: {
      feed,
      play,
      heal,
      cleanPoop,
      togglePause,
      reset,
    },
  };
}
