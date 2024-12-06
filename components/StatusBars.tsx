import { View, StyleSheet } from "react-native";
import { StatusBar } from "@/components/StatusBar";

interface StatusBarsProps {
  height: number;
  hunger: number;
  happiness: number;
  cleanliness: number;
}

export function StatusBars({
  height,
  hunger,
  happiness,
  cleanliness,
}: StatusBarsProps) {
  return (
    <View style={[styles.statusBars, { height }]}>
      <StatusBar label="Hunger" value={hunger} color="#FF6B6B" />
      <StatusBar label="Happiness" value={happiness} color="#4ECDC4" />
      <StatusBar label="Cleanliness" value={cleanliness} color="#45B7D1" />
    </View>
  );
}

const styles = StyleSheet.create({
  statusBars: {
    position: "absolute",
    top: 40,
    left: 24,
    right: 24,
    paddingTop: 16,
    gap: 2,
  },
});
