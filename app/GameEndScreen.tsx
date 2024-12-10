import { typography } from "@/config/typography";
import { useEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { END_MESSAGES } from "@/config/game";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

interface GameEndScreenProps {
  type: "win" | "gameOver";
  causeOfDeath?: string;
  onReset: () => void;
}

export default function GameEndScreen({
  type,
  causeOfDeath,
  onReset,
}: GameEndScreenProps) {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const endInfo =
    type === "win"
      ? END_MESSAGES.win
      : causeOfDeath && causeOfDeath in END_MESSAGES
      ? END_MESSAGES[causeOfDeath as keyof typeof END_MESSAGES]
      : END_MESSAGES.gameOver;

  return (
    <View style={styles.overlay}>
      <View style={styles.content}>
        <Animated.Text style={[styles.emoji, animatedStyle]}>
          {endInfo.emoji}
        </Animated.Text>
        <Text style={styles.title}>
          {type === "win" ? "You Win!" : "Game Over"}
        </Text>
      </View>
      <Pressable
        style={({ pressed }) => [
          styles.resetButton,
          { transform: [{ scale: pressed ? 1.1 : 1 }] },
        ]}
        onPress={onReset}
      >
        <Text style={styles.resetButtonText}>
          {type === "win" ? "Play Again" : "Start Again"}
        </Text>
      </Pressable>
      {type === "gameOver" && (
        <Text style={styles.message}>{endInfo.message}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 50,
    display: "flex",
    flexDirection: "column",
    gap: 40,
    padding: 64,
  },
  emoji: {
    fontSize: 100,
  },
  content: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
  },
  title: {
    ...typography.defaultFontFamily.bold,
    color: "white",
    fontSize: 48,
  },
  message: {
    ...typography.defaultFontFamily.semiBold,
    color: "white",
    fontSize: 24,
    textAlign: "center",
  },
  resetButton: {
    ...typography.defaultFontFamily.semiBold,
    backgroundColor: "#22c55e",
    paddingHorizontal: 48,
    paddingVertical: 24,
    borderRadius: 40,
  },
  resetButtonText: {
    color: "white",
    fontSize: 24,
    fontWeight: "500",
  },
});
