import { View, Pressable, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from "react-native-reanimated";

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
  const feedScale = useSharedValue(1);
  const playScale = useSharedValue(1);
  const healScale = useSharedValue(1);

  const handlePress = (
    action: () => void,
    scale: Animated.SharedValue<number>
  ) => {
    action();
    scale.value = withSequence(
      withTiming(1.2, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
  };

  const feedAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: feedScale.value }],
  }));

  const playAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: playScale.value }],
  }));

  const healAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: healScale.value }],
  }));

  return (
    <View style={[styles.controls, { height }]}>
      <Animated.View style={feedAnimatedStyle}>
        <Pressable
          style={styles.button}
          onPress={() => handlePress(onFeed, feedScale)}
        >
          <Text style={styles.buttonText}>🍎</Text>
        </Pressable>
      </Animated.View>

      <Animated.View style={playAnimatedStyle}>
        <Pressable
          style={styles.button}
          onPress={() => handlePress(onPlay, playScale)}
        >
          <Text style={styles.buttonText}>⚽</Text>
        </Pressable>
      </Animated.View>

      {isSick && (
        <Animated.View style={healAnimatedStyle}>
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
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 48,
  },
});
