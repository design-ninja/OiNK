import { View, StyleSheet, Animated } from "react-native";
import { useRef, useEffect } from "react";

interface ActionEffectProps {
  emoji: string;
  isVisible: boolean;
}

export function ActionEffect({ emoji, isVisible }: ActionEffectProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start(() => {
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 2,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      });
    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.Text
        style={[
          styles.text,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
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
