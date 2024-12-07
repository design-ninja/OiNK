import { Typography } from "@/constants/Typography";
import { useRef, useEffect } from "react";
import { View, Text, Pressable, StyleSheet, Animated } from "react-native";

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
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, []);

  const deathInfo =
    causeOfDeath && causeOfDeath in DEATH_MESSAGES
      ? DEATH_MESSAGES[causeOfDeath as keyof typeof DEATH_MESSAGES]
      : { emoji: "💀", message: "Game Over" };

  return (
    <View style={styles.overlay}>
      <Animated.Text
        style={[styles.gameOverEmoji, { transform: [{ scale: scaleAnim }] }]}
      >
        {deathInfo.emoji}
      </Animated.Text>
      <Text style={styles.gameOverTitle}>Game Over</Text>
      <Text style={styles.gameOverMessage}>{deathInfo.message}</Text>
      <Pressable style={styles.resetButton} onPress={onReset}>
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
    transform: [{ scale: 1 }],
  },
  resetButtonText: {
    ...Typography.defaultFontFamily.semiBold,
    color: "white",
    fontSize: 20,
    fontWeight: "600",
  },
});
