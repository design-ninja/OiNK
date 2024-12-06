import { Text, StyleSheet, Pressable, Animated } from "react-native";
import { useRef, useCallback } from "react";

interface PoopProps {
  x: number;
  y: number;
  id: number;
  onPress: (id: number) => void;
}

export function Poop({ x, y, id, onPress }: PoopProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const handlePress = useCallback(() => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 1.5,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onPress(id);
    });
  }, [id, onPress]);

  return (
    <Pressable style={[styles.poop, { left: x, top: y }]} onPress={handlePress}>
      <Animated.Text
        style={[
          styles.poopEmoji,
          {
            transform: [{ scale }],
            opacity,
          },
        ]}
      >
        💩
      </Animated.Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  poop: {
    position: "absolute",
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  poopEmoji: {
    fontSize: 53,
  },
});
