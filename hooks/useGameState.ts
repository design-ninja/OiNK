import { useState, useEffect, useCallback } from "react";
import { Audio } from "expo-av";
import { useGameSounds } from "./useGameSounds";

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
}

export function useGameState() {
  const { playSound } = useGameSounds();
  const [state, setState] = useState<GameState>({
    hunger: 100,
    happiness: 100,
    cleanliness: 100,
    age: 0,
    isSick: false,
    isGameOver: false,
    hasWon: false,
    poops: [],
  });

  const decreaseStats = useCallback(() => {
    setState((prev) => {
      const decreaseRate = prev.isSick ? 2 : 1;
      const newHunger = Math.max(0, prev.hunger - 0.5 * decreaseRate);
      const newHappiness = Math.max(0, prev.happiness - 0.3 * decreaseRate);
      const newCleanliness = Math.max(
        0,
        prev.cleanliness - prev.poops.length * 0.5
      );

      // Проверка на проигрыш
      if (newHunger === 0) {
        return { ...prev, isGameOver: true, causeOfDeath: "hunger" };
      }
      if (newHappiness === 0) {
        return { ...prev, isGameOver: true, causeOfDeath: "sadness" };
      }
      if (newCleanliness === 0) {
        return { ...prev, isGameOver: true, causeOfDeath: "dirt" };
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
    setState((prev) => ({
      ...prev,
      poops: [
        ...prev.poops,
        {
          x: Math.random() * 300,
          y: Math.random() * 500,
          id: Date.now(),
        },
      ],
    }));
  }, []);

  const cleanPoop = useCallback(
    (poopId: number) => {
      playSound("clean");
      setState((prev) => ({
        ...prev,
        poops: prev.poops.filter((poop) => poop.id !== poopId),
        cleanliness: Math.min(100, prev.cleanliness + 10),
      }));
    },
    [playSound]
  );

  const feed = useCallback(() => {
    playSound("feed");
    setState((prev) => ({
      ...prev,
      hunger: Math.min(100, prev.hunger + 20),
    }));
  }, [playSound]);

  const play = useCallback(() => {
    playSound("play");
    setState((prev) => ({
      ...prev,
      happiness: Math.min(100, prev.happiness + 15),
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

        // Увеличиваем возраст
        setState((prev) => {
          const newAge = prev.age + 0.1;
          if (newAge >= 100) {
            return { ...prev, age: 100, hasWon: true };
          }
          return { ...prev, age: newAge };
        });

        // Случайная болезнь
        if (Math.random() < 0.001) {
          setState((prev) => ({ ...prev, isSick: true }));
        }

        // Случайные какашки
        if (Math.random() < 0.05) {
          addPoop();
        }
      }
    }, 1000);

    return () => clearInterval(gameInterval);
  }, [state.isGameOver, state.hasWon, decreaseStats, addPoop]);

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
    },
  };
}
