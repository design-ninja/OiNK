import { useEffect, useRef, useMemo, useCallback } from "react";
import { Text, StyleSheet, Dimensions, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useGameSounds } from "@/hooks/useGameSounds";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

interface PigProps {
  isSick: boolean;
  statusBarHeight: number;
  controlsHeight: number;
  safePadding: number;
  age: number;
  isDead: boolean;
}

// Move constants outside component
const PIG_SIZE = 150;
const AGE_MILESTONES = [10, 25, 50, 80] as const;

// Memoize pig images mapping
const PIG_IMAGES = {
  0: require("../assets/images/piggy0.png"),
  10: require("../assets/images/piggy10.png"),
  25: require("../assets/images/piggy25.png"),
  50: require("../assets/images/piggy50.png"),
  80: require("../assets/images/piggy80.png"),
} as const;

export function Pig({
  isSick,
  statusBarHeight,
  controlsHeight,
  safePadding,
  age,
  isDead,
}: PigProps) {
  const positionX = useSharedValue(SCREEN_WIDTH / 2);
  const positionY = useSharedValue(SCREEN_HEIGHT / 2);
  const scale = useSharedValue(1);
  const { playSound } = useGameSounds();
  const previousAge = useRef(age);

  // Memoize movement boundaries
  const boundaries = useMemo(
    () => ({
      minX: safePadding,
      maxX: SCREEN_WIDTH - safePadding - PIG_SIZE,
      minY: statusBarHeight + safePadding,
      maxY: SCREEN_HEIGHT - controlsHeight - safePadding - PIG_SIZE,
    }),
    [statusBarHeight, controlsHeight, safePadding]
  );

  // Memoize movement handler
  const movePig = useCallback(() => {
    const { minX, maxX, minY, maxY } = boundaries;

    const newX = Math.min(
      maxX,
      Math.max(minX, Math.random() * (maxX - minX) + minX)
    );
    const newY = Math.min(
      maxY,
      Math.max(minY, Math.random() * (maxY - minY) + minY)
    );

    positionX.value = withSpring(newX, { damping: 10, stiffness: 100 });
    positionY.value = withSpring(newY, { damping: 10, stiffness: 100 });
  }, [boundaries, positionX, positionY]);

  // Optimize movement interval
  useEffect(() => {
    if (isDead) return;

    const moveInterval = setInterval(movePig, 2500);
    return () => clearInterval(moveInterval);
  }, [isDead, movePig]);

  // Memoize press handler
  const handlePress = useCallback(() => {
    playSound("play");
    scale.value = withSequence(
      withTiming(1.2, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
  }, [playSound, scale]);

  // Optimize age milestone effect
  useEffect(() => {
    const hasReachedMilestone = AGE_MILESTONES.some(
      (milestone) => age >= milestone && previousAge.current < milestone
    );

    if (hasReachedMilestone) {
      playSound("birthday");
      scale.value = withSequence(
        withTiming(1.3, { duration: 200 }),
        withTiming(1, { duration: 200 })
      );
    }

    previousAge.current = age;
  }, [age, playSound, scale]);

  // Memoize pig image getter
  const getPigImage = useCallback(() => {
    if (isDead) return "🪦";

    const milestone = [...AGE_MILESTONES].reverse().find((m) => age >= m) ?? 0;
    return PIG_IMAGES[milestone as keyof typeof PIG_IMAGES];
  }, [age, isDead]);

  // Memoize animated style
  const animatedStyle = useAnimatedStyle(
    () => ({
      transform: [
        { translateX: positionX.value },
        { translateY: positionY.value },
        { scale: scale.value },
      ],
    }),
    []
  );

  useEffect(() => {
    console.log("🐷 Current age:", age);
  }, [age]);

  return (
    <Animated.View style={[styles.pig, animatedStyle]}>
      <Pressable onPress={handlePress} disabled={isDead}>
        {isDead ? (
          <Text style={styles.tombstone}>{getPigImage()}</Text>
        ) : (
          <>
            <Animated.Image
              source={getPigImage()}
              style={styles.pigImage}
              resizeMode="contain"
            />
            {isSick && <Text style={styles.sickEmoji}>🤮</Text>}
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pig: {
    position: "absolute",
  },
  pigImage: {
    width: 150,
    height: 150,
  },
  sickEmoji: {
    fontSize: 64,
    position: "absolute",
    bottom: 8,
    alignSelf: "center",
    right: 42,
  },
  tombstone: {
    fontSize: 100,
    width: 150,
    height: 150,
    textAlign: "center",
    lineHeight: 150,
  },
});
