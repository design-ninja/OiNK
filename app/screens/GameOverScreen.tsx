import { Typography } from "@/constants/Typography";
import { useEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const DEATH_MESSAGES = {
  hunger: { emoji: "🍽️", message: "🐷 died from hunger..." },
  happiness: { emoji: "😢", message: "🐷 died from sadness..." },
  cleanliness: { emoji: "🦠", message: "🐷 died from uncleanliness..." },
} as const;

interface GameOverScreenProps {
  causeOfDeath?: string;
  onReset: () => void;
}

export function GameOverScreen({ causeOfDeath, onReset }: GameOverScreenProps) {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const deathInfo =
    causeOfDeath && causeOfDeath in DEATH_MESSAGES
      ? DEATH_MESSAGES[causeOfDeath as keyof typeof DEATH_MESSAGES]
      : { emoji: "💀", message: "Game Over" };

  return (
    <View style={styles.overlay}>
      <Animated.Text style={[styles.gameOverEmoji, animatedStyle]}>
        {deathInfo.emoji}
      </Animated.Text>
      <Text style={styles.gameOverTitle}>Game Over</Text>
      <Text style={styles.gameOverMessage}>{deathInfo.message}</Text>
      <Pressable
        style={({ pressed }) => [
          styles.resetButton,
          { transform: [{ scale: pressed ? 0.95 : 1 }] },
        ]}
        onPress={onReset}
      >
        <Text style={styles.resetButtonText}>Start Again</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 1)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 50,
  },
  gameOverEmoji: {
    fontSize: 100,
    position: "absolute",
  },
  gameOverTitle: {
    ...Typography.defaultFontFamily.bold,
    color: "white",
    fontSize: 48,
    marginTop: 120,
  },
  gameOverMessage: {
    ...Typography.defaultFontFamily.semiBold,
    color: "white",
    fontSize: 24,
    marginTop: 16,
  },
  resetButton: {
    backgroundColor: "#22c55e",
    paddingHorizontal: 48,
    paddingVertical: 24,
    borderRadius: 9999,
    marginTop: "auto",
    marginBottom: 64,
  },
  resetButtonText: {
    ...Typography.defaultFontFamily.semiBold,
    color: "white",
    fontSize: 20,
    fontWeight: "600",
  },
});
