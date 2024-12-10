import { View, StyleSheet } from "react-native";
import { StatusBar } from "@/components/StatusBar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { memo, useMemo } from "react";

interface StatusBarsProps {
  height: number;
  hunger: number;
  happiness: number;
  cleanliness: number;
}

export const StatusBars = memo(function StatusBars({
  height,
  hunger,
  happiness,
  cleanliness,
}: StatusBarsProps) {
  const insets = useSafeAreaInsets();

  // Memoize styles to prevent unnecessary recalculations
  const containerStyle = useMemo(
    () => [
      styles.statusBars,
      {
        height,
        paddingTop: insets.top + 16,
      },
    ],
    [height, insets.top]
  );

  // Memoize status bars to prevent unnecessary re-renders
  const statusBars = useMemo(
    () => (
      <>
        <StatusBar label="Hunger" value={hunger} color="#FF6B6B" />
        <StatusBar label="Happiness" value={happiness} color="#02ce68" />
        <StatusBar label="Cleanliness" value={cleanliness} color="#1a8dec" />
      </>
    ),
    [hunger, happiness, cleanliness]
  );

  return <View style={containerStyle}>{statusBars}</View>;
});

const styles = StyleSheet.create({
  statusBars: {
    position: "absolute",
    left: 24,
    right: 24,
    gap: 2,
  },
});
