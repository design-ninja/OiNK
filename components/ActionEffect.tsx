import { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  useSharedValue,
} from "react-native-reanimated";

interface ActionEffectProps {
  emoji: string;
  isVisible: boolean;
}

export function ActionEffect({ emoji, isVisible }: ActionEffectProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isVisible) {
      scale.value = withSequence(
        withSpring(1),
        withTiming(2, { duration: 300 })
      );
      opacity.value = withSequence(
        withTiming(1, { duration: 100 }),
        withTiming(0, { duration: 300 })
      );
    } else {
      scale.value = 0;
      opacity.value = 0;
    }
  }, [isVisible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (!isVisible) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.Text style={[styles.text, animatedStyle]}>
        {emoji}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  text: {
    fontSize: 100,
  },
});
