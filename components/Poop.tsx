import { Text, StyleSheet, Pressable, Animated } from "react-native";
import { useRef, useCallback } from "react";

interface PoopProps {
  x: number;
  y: number;
  id: number;
  onPress: (id: number) => void;
}

export function Poop({ x, y, id, onPress }: PoopProps) {
  const opacity = useRef(new Animated.Value(1)).current;

  const handlePress = useCallback(() => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onPress(id);
    });
  }, [id, onPress]);

  return (
    <Pressable
      style={[styles.poop, { left: x, top: y }]}
      onPress={handlePress}
      hitSlop={10}
    >
      <Animated.Text style={[styles.poopEmoji, { opacity }]}>💩</Animated.Text>
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
