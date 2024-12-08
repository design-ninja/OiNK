import { Typography } from "@/constants/Typography";
import { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const LABEL_EMOJIS = {
  Hunger: "🍎",
  Happiness: "😊",
  Cleanliness: "🧽",
  Age: "🎂",
} as const;

interface StatusBarProps {
  label: keyof typeof LABEL_EMOJIS;
  value: number;
  color: string;
}

export function StatusBar({ label, value, color }: StatusBarProps) {
  const isAge = label === "Age";
  const emoji = LABEL_EMOJIS[label];
  const displayValue = isAge ? Math.floor(value) : Math.round(value);
  const percentage = isAge ? (value / 100) * 100 : value;

  const width = useSharedValue(percentage);

  useEffect(() => {
    width.value = withSpring(percentage, {
      damping: 15,
      stiffness: 100,
      mass: 0.5,
    });
  }, [percentage]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${width.value}%`,
    };
  });

  return (
    <View style={styles.statusBarContainer}>
      <Text style={styles.statusEmoji}>{emoji}</Text>
      <View style={styles.statusBarTrack}>
        <Animated.View
          style={[
            styles.statusBarFill,
            { backgroundColor: color },
            animatedStyle,
          ]}
        />
      </View>
      <Text style={styles.statusValue}>{displayValue}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statusBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusEmoji: {
    fontSize: 24,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  statusBarTrack: {
    flex: 1,
    height: 12,
    backgroundColor: "rgba(0, 0, 0, 0.15)",
    shadowColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 6,
    overflow: "hidden",
  },
  statusBarFill: {
    height: "100%",
  },
  statusValue: {
    ...Typography.defaultFontFamily.semiBold,
    fontSize: 16,
    color: "white",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    minWidth: 30,
    textAlign: "right",
  },
});
