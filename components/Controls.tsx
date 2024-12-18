import { memo, useCallback } from "react";
import { View, Pressable, Text, StyleSheet } from "react-native";
import { GAME_ASSETS } from "@/config/game";
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

// Memoized button component to prevent unnecessary re-renders
const AnimatedButton = memo(
  ({
    onPress,
    scale,
    emoji,
  }: {
    onPress: () => void;
    scale: Animated.SharedValue<number>;
    emoji: string;
  }) => {
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    return (
      <Animated.View style={animatedStyle}>
        <Pressable style={styles.button} onPress={onPress}>
          <Text style={styles.buttonText}>{emoji}</Text>
        </Pressable>
      </Animated.View>
    );
  }
);

export const Controls = memo(
  ({ onFeed, onPlay, onHeal, isSick, height }: ControlsProps) => {
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

    // Memoize handlePress callbacks
    const handleFeedPress = useCallback(() => {
      handlePress(onFeed, feedScale);
    }, [onFeed]);

    const handlePlayPress = useCallback(() => {
      handlePress(onPlay, playScale);
    }, [onPlay]);

    const handleHealPress = useCallback(() => {
      if (onHeal) handlePress(onHeal, healScale);
    }, [onHeal]);

    return (
      <View style={[styles.controls, { height }]}>
        <AnimatedButton
          onPress={handleFeedPress}
          scale={feedScale}
          emoji={GAME_ASSETS.CONTROLS.FEED}
        />

        <AnimatedButton
          onPress={handlePlayPress}
          scale={playScale}
          emoji={GAME_ASSETS.CONTROLS.PLAY}
        />

        {isSick && (
          <AnimatedButton
            onPress={handleHealPress}
            scale={healScale}
            emoji={GAME_ASSETS.CONTROLS.HEAL}
          />
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  controls: {
    position: "absolute",
    bottom: 16,
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
