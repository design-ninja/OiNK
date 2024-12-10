import { useEffect, memo, useCallback } from "react";
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

export const ActionEffect = memo(function ActionEffect({
  emoji,
  isVisible,
}: ActionEffectProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  const runAnimation = useCallback(() => {
    scale.value = withSequence(withSpring(1), withTiming(2, { duration: 300 }));
    opacity.value = withSequence(
      withTiming(1, { duration: 100 }),
      withTiming(0, { duration: 300 })
    );
  }, [scale, opacity]);

  const resetAnimation = useCallback(() => {
    scale.value = 0;
    opacity.value = 0;
  }, [scale, opacity]);

  useEffect(() => {
    if (isVisible) {
      runAnimation();
    } else {
      resetAnimation();
    }
  }, [isVisible, runAnimation, resetAnimation]);

  const animatedStyle = useAnimatedStyle(
    () => ({
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    }),
    []
  );

  if (!isVisible) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.Text style={[styles.text, animatedStyle]}>
        {emoji}
      </Animated.Text>
    </View>
  );
});

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
