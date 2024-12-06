import { useEffect, useRef } from "react";
import {
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Pressable,
} from "react-native";
import { useGameSounds } from "@/hooks/useGameSounds";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

interface PigProps {
  isSick: boolean;
  isPaused: boolean;
  statusBarHeight: number;
  controlsHeight: number;
  safePadding: number;
  age: number;
}

export function Pig({
  isSick,
  isPaused,
  statusBarHeight,
  controlsHeight,
  safePadding,
  age,
}: PigProps) {
  const position = useRef(
    new Animated.ValueXY({ x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT / 2 })
  ).current;
  const scale = useRef(new Animated.Value(1)).current;
  const { playSound } = useGameSounds();
  const previousAge = useRef(age);

  useEffect(() => {
    const milestones = [10, 25, 50, 80];
    const hasReachedMilestone = milestones.some(
      (milestone) => age >= milestone && previousAge.current < milestone
    );

    if (hasReachedMilestone) {
      playSound("birthday");

      // Добавим анимацию празднования
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.3,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }

    previousAge.current = age;
  }, [age, playSound]);

  const handlePress = () => {
    if (isPaused) return;

    playSound("play");

    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const movePig = () => {
    if (isPaused) return;

    const PIG_SIZE = 100;

    const minX = safePadding;
    const maxX = SCREEN_WIDTH - safePadding - PIG_SIZE;
    const minY = statusBarHeight + safePadding;
    const maxY = SCREEN_HEIGHT - controlsHeight - safePadding - PIG_SIZE;

    const newX = Math.min(
      maxX,
      Math.max(minX, Math.random() * (maxX - minX) + minX)
    );
    const newY = Math.min(
      maxY,
      Math.max(minY, Math.random() * (maxY - minY) + minY)
    );

    Animated.spring(position, {
      toValue: { x: newX, y: newY },
      useNativeDriver: false,
      bounciness: 4,
      speed: 8,
    }).start();
  };

  useEffect(() => {
    const moveInterval = setInterval(movePig, 2500);
    return () => clearInterval(moveInterval);
  }, [isPaused]);

  useEffect(() => {
    console.log("Current pig age:", age);
  }, [age]);

  const getPigImage = () => {
    console.log("Getting pig image for age:", age);
    if (age >= 80) return require("../assets/images/piggy80.png");
    if (age >= 50) return require("../assets/images/piggy50.png");
    if (age >= 25) return require("../assets/images/piggy25.png");
    if (age >= 10) return require("../assets/images/piggy10.png");
    console.log("Loading default piggy.png");
    return require("../assets/images/piggy0.png");
  };

  return (
    <Animated.View style={[styles.pig, position.getLayout()]}>
      <Pressable onPress={handlePress}>
        <Animated.Image
          source={getPigImage()}
          style={[styles.pigImage, { transform: [{ scale }] }]}
        />
        {isSick && <Text style={styles.sickEmoji}>🤮</Text>}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pig: {
    position: "absolute",
  },
  pigImage: {
    width: 100,
    height: 100,
    resizeMode: "contain",
  },
  sickEmoji: {
    fontSize: 40,
    position: "absolute",
    bottom: 0,
    alignSelf: "center",
    right: 31,
  },
});
