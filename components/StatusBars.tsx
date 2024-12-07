import { View, StyleSheet } from "react-native";
import { StatusBar } from "@/components/StatusBar";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.statusBars,
        {
          height,
          paddingTop: insets.top + 16, // 16 - дополнительный отступ после статус бара
        },
      ]}
    >
      <StatusBar label="Hunger" value={hunger} color="#FF6B6B" />
      <StatusBar label="Happiness" value={happiness} color="#4ECDC4" />
      <StatusBar label="Cleanliness" value={cleanliness} color="#45B7D1" />
    </View>
  );
}

const styles = StyleSheet.create({
  statusBars: {
    position: "absolute",
    left: 24,
    right: 24,
    gap: 2,
  },
});
