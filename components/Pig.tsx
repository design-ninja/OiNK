import { useEffect, useRef } from "react";
import { Text, StyleSheet, Animated, Dimensions } from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

interface PigProps {
  isSick: boolean;
  isPaused: boolean;
  statusBarHeight: number;
  controlsHeight: number;
  safePadding: number;
}

export function Pig({
  isSick,
  isPaused,
  statusBarHeight,
  controlsHeight,
  safePadding,
}: PigProps) {
  const position = useRef(
    new Animated.ValueXY({ x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT / 2 })
  ).current;

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

  return (
    <Animated.View style={[styles.pig, position.getLayout()]}>
      <Text style={styles.emoji}>
        🐷
        {isSick && <Text style={styles.sickEmoji}>🤮</Text>}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pig: {
    position: "absolute",
  },
  emoji: {
    fontSize: 80,
  },
  sickEmoji: {
    fontSize: 32,
    position: "absolute",
    bottom: 11,
    alignSelf: "center",
    right: 24,
  },
});
