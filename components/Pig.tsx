import { useEffect, useRef } from "react";
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

  useEffect(() => {
    if (!isDead) {
      const moveInterval = setInterval(movePig, 2500);
      return () => clearInterval(moveInterval);
    }
  }, [isDead]);

  const handlePress = () => {
    playSound("play");
    scale.value = withSequence(
      withTiming(1.2, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
  };

  const movePig = () => {
    const PIG_SIZE = 150;

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

    positionX.value = withSpring(newX, { damping: 10, stiffness: 100 });
    positionY.value = withSpring(newY, { damping: 10, stiffness: 100 });
  };

  useEffect(() => {
    console.log("Current pig age:", age);
  }, [age]);

  useEffect(() => {
    const milestones = [10, 25, 50, 80];
    const hasReachedMilestone = milestones.some(
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
  }, [age, playSound]);

  const getPigImage = () => {
    if (isDead) return "🪦";
    if (age >= 80) return require("../assets/images/piggy80.png");
    if (age >= 50) return require("../assets/images/piggy50.png");
    if (age >= 25) return require("../assets/images/piggy25.png");
    if (age >= 10) return require("../assets/images/piggy10.png");
    return require("../assets/images/piggy0.png");
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: positionX.value },
        { translateY: positionY.value },
        { scale: scale.value },
      ],
    };
  });

  return (
    <Animated.View style={[styles.pig, animatedStyle]}>
      <Pressable onPress={handlePress} disabled={isDead}>
        {isDead ? (
          <Text style={styles.tombstone}>{getPigImage()}</Text>
        ) : (
          <>
            <Animated.Image source={getPigImage()} style={styles.pigImage} />
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
    resizeMode: "contain",
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
