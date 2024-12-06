import { View, Pressable, Text, StyleSheet } from "react-native";

interface ControlsProps {
  onFeed: () => void;
  onPlay: () => void;
  onHeal?: () => void;
  onTogglePause: () => void;
  isPaused: boolean;
  isSick: boolean;
  height: number;
}

export function Controls({
  onFeed,
  onPlay,
  onHeal,
  isPaused,
  isSick,
  height,
}: ControlsProps) {
  const handleAction = (action: () => void, emoji: string) => {
    if (!isPaused) {
      action();
    }
  };

  return (
    <View style={[styles.controls, { height }]}>
      <Pressable
        style={[styles.button, isPaused && styles.buttonDisabled]}
        onPress={() => handleAction(onFeed, "🍎")}
        disabled={isPaused}
      >
        <Text style={styles.buttonText}>🍎</Text>
      </Pressable>
      <Pressable
        style={[styles.button, isPaused && styles.buttonDisabled]}
        onPress={() => handleAction(onPlay, "⚽")}
        disabled={isPaused}
      >
        <Text style={styles.buttonText}>⚽</Text>
      </Pressable>
      {isSick && (
        <Pressable
          style={[styles.button, isPaused && styles.buttonDisabled]}
          onPress={() => handleAction(onHeal!, "💊")}
          disabled={isPaused}
        >
          <Text style={styles.buttonText}>💊</Text>
        </Pressable>
      )}
    </View>
  );
}

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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    transform: [{ scale: 1 }],
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 40,
  },
});
