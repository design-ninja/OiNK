import { StyleSheet, Pressable } from "react-native";
import { useCallback } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  runOnJS,
} from "react-native-reanimated";

interface PoopProps {
  x: number;
  y: number;
  id: number;
  onPress: (id: number) => void;
}

export function Poop({ x, y, id, onPress }: PoopProps) {
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  const handlePress = useCallback(() => {
    scale.value = withSequence(
      withTiming(1.3, { duration: 150 }),
      withTiming(1, { duration: 100 })
    );

    opacity.value = withTiming(0, { duration: 200 }, (finished) => {
      if (finished) {
        runOnJS(onPress)(id);
      }
    });
  }, [id, onPress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      style={[styles.poop, { left: x, top: y }]}
      onPress={handlePress}
      hitSlop={10}
    >
      <Animated.Text style={[styles.poopEmoji, animatedStyle]}>
        💩
      </Animated.Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  poop: {
    position: "absolute",
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  poopEmoji: {
    fontSize: 56,
  },
});
