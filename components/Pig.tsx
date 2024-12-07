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
}

export function Pig({
  isSick,
  statusBarHeight,
  controlsHeight,
  safePadding,
  age,
}: PigProps) {
  const positionX = useSharedValue(SCREEN_WIDTH / 2);
  const positionY = useSharedValue(SCREEN_HEIGHT / 2);
  const scale = useSharedValue(1);
  const { playSound } = useGameSounds();
  const previousAge = useRef(age);

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

  const handlePress = () => {
    playSound("play");
    scale.value = withSequence(
      withTiming(1.2, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
  };

  const movePig = () => {
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

    positionX.value = withSpring(newX, { damping: 10, stiffness: 100 });
    positionY.value = withSpring(newY, { damping: 10, stiffness: 100 });
  };

  useEffect(() => {
    const moveInterval = setInterval(movePig, 2500);
    return () => clearInterval(moveInterval);
  }, []);

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
      <Pressable onPress={handlePress}>
        <Animated.Image source={getPigImage()} style={styles.pigImage} />
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
