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
  onTogglePause,
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
      <View style={styles.actionButtons}>
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
      <Pressable style={styles.button} onPress={onTogglePause}>
        <Text style={styles.buttonText}>{isPaused ? "▶️" : "⏸️"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  controls: {
    position: "absolute",
    bottom: 0,
    left: 24,
    right: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 16,
  },
  button: {
    width: 60,
    height: 60,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    transform: [{ scale: 1 }],
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 30,
  },
});
