import { useRef } from "react";
import { Pressable, StyleSheet, Animated } from "react-native";

interface AnimatedPoopProps {
  x: number;
  y: number;
  id: number;
  onPress: (id: number) => void;
}

export function AnimatedPoop({ x, y, id, onPress }: AnimatedPoopProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.parallel([
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.3,
          useNativeDriver: true,
          bounciness: 12,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onPress(id);
    });
  };

  return (
    <Pressable
      style={[styles.container, { left: x, top: y }]}
      onPress={handlePress}
    >
      <Animated.Text
        style={[
          styles.emoji,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        💩
      </Animated.Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  emoji: {
    fontSize: 53,
  },
});
