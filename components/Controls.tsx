import { View, Pressable, Text, StyleSheet, Animated } from "react-native";
import { useRef } from "react";

interface ControlsProps {
  onFeed: () => void;
  onPlay: () => void;
  onHeal?: () => void;
  isSick: boolean;
  height: number;
}

export function Controls({
  onFeed,
  onPlay,
  onHeal,
  isSick,
  height,
}: ControlsProps) {
  const feedScale = useRef(new Animated.Value(1)).current;
  const playScale = useRef(new Animated.Value(1)).current;
  const healScale = useRef(new Animated.Value(1)).current;

  const handlePress = (action: () => void, scale: Animated.Value) => {
    action();

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

  return (
    <View style={[styles.controls, { height }]}>
      <Animated.View style={{ transform: [{ scale: feedScale }] }}>
        <Pressable
          style={styles.button}
          onPress={() => handlePress(onFeed, feedScale)}
        >
          <Text style={styles.buttonText}>🍎</Text>
        </Pressable>
      </Animated.View>

      <Animated.View style={{ transform: [{ scale: playScale }] }}>
        <Pressable
          style={styles.button}
          onPress={() => handlePress(onPlay, playScale)}
        >
          <Text style={styles.buttonText}>⚽</Text>
        </Pressable>
      </Animated.View>

      {isSick && (
        <Animated.View style={{ transform: [{ scale: healScale }] }}>
          <Pressable
            style={styles.button}
            onPress={() => handlePress(onHeal!, healScale)}
          >
            <Text style={styles.buttonText}>💊</Text>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  controls: {
    position: "absolute",
    bottom: 24,
    left: 24,
    right: 24,
    display: "flex",
    gap: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    width: 80,
    height: 80,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 40,
  },
});
