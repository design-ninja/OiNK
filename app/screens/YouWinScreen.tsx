import { Typography } from "@/constants/Typography";
import { useEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

interface YouWinScreenProps {
  onReset: () => void;
}

export function YouWinScreen({ onReset }: YouWinScreenProps) {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.overlay}>
      <Animated.Text style={[styles.gameOverEmoji, animatedStyle]}>
        🎉
      </Animated.Text>
      <Text style={styles.gameOverTitle}>You Win!</Text>
      <Pressable
        style={({ pressed }) => [
          styles.resetButton,
          { transform: [{ scale: pressed ? 0.95 : 1 }] },
        ]}
        onPress={onReset}
      >
        <Text style={styles.resetButtonText}>Play Again</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "black",
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
  resetButton: {
    ...Typography.defaultFontFamily.semiBold,
    backgroundColor: "#22c55e",
    paddingHorizontal: 48,
    paddingVertical: 24,
    borderRadius: 9999,
    marginTop: "auto",
    marginBottom: 64,
    transform: [{ scale: 1 }],
  },
  resetButtonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "600",
  },
});
