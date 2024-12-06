import { useRef, useEffect } from "react";
import { View, Text, Pressable, StyleSheet, Animated } from "react-native";

interface YouWinScreenProps {
  onReset: () => void;
}

export function YouWinScreen({ onReset }: YouWinScreenProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.overlay}>
      <Animated.Text
        style={[styles.gameOverEmoji, { transform: [{ scale: scaleAnim }] }]}
      >
        🎉
      </Animated.Text>
      <Text style={styles.gameOverTitle}>You Win!</Text>
      <Pressable style={styles.resetButton} onPress={onReset}>
        <Text style={styles.resetButtonText}>Play Again</Text>
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
    fontFamily: "PlusJakartaSans",
    color: "white",
    fontSize: 48,
    fontWeight: "800",
    marginTop: 120,
  },
  resetButton: {
    fontFamily: "PlusJakartaSans",
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
