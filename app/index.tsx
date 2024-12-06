import { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  Animated,
  Text,
  Pressable,
} from "react-native";
import { useGameState } from "@/hooks/useGameState";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

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

function StatusBar({ label, value, color }: StatusBarProps) {
  const isAge = label === "Age";
  const emoji = LABEL_EMOJIS[label];
  const displayValue = isAge ? Math.floor(value) : Math.round(value);
  const percentage = isAge ? (value / 100) * 100 : value;

  return (
    <View style={styles.statusBarContainer}>
      <Text style={styles.statusEmoji}>{emoji}</Text>
      <View style={styles.statusBarTrack}>
        <Animated.View
          style={[
            styles.statusBarFill,
            {
              backgroundColor: color,
              width: `${percentage}%`,
            },
          ]}
        />
      </View>
      <Text style={styles.statusValue}>{displayValue}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const { state, actions } = useGameState();
  const [isPaused, setIsPaused] = useState(false);
  const pigPosition = useRef(
    new Animated.ValueXY({ x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT / 2 })
  ).current;

  const movePig = () => {
    if (isPaused) return;

    const newX = Math.random() * (SCREEN_WIDTH - 50);
    const newY = Math.random() * (SCREEN_HEIGHT - 200) + 100;

    Animated.spring(pigPosition, {
      toValue: { x: newX, y: newY },
      useNativeDriver: false,
    }).start();
  };

  useEffect(() => {
    const moveInterval = setInterval(movePig, 3000);
    return () => clearInterval(moveInterval);
  }, [isPaused]);

  const handleAction = (action: () => void) => {
    if (!isPaused) {
      action();
    }
  };

  if (state.isGameOver) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Game Over!</Text>
        <Text style={styles.text}>Your pig died of {state.causeOfDeath}</Text>
        <Text style={styles.emoji}>💀</Text>
      </View>
    );
  }

  if (state.hasWon) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>You Win! 🎉</Text>
        <Text style={styles.text}>Your pig lived to 100 years!</Text>
        <Text style={styles.emoji}>🎊</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.backgroundPattern}>
        {Array.from({ length: Math.ceil(SCREEN_HEIGHT / 48) + 1 }).map(
          (_, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.backgroundRow}>
              {Array.from({ length: Math.ceil(SCREEN_WIDTH / 48) + 1 }).map(
                (_, colIndex) => (
                  <Image
                    key={`tile-${rowIndex}-${colIndex}`}
                    source={require("@/assets/images/grass.png")}
                    style={styles.grassTile}
                  />
                )
              )}
            </View>
          )
        )}
      </View>

      <View style={styles.statusBars}>
        <StatusBar label="Hunger" value={state.hunger} color="#FF6B6B" />
        <StatusBar label="Happiness" value={state.happiness} color="#4ECDC4" />
        <StatusBar
          label="Cleanliness"
          value={state.cleanliness}
          color="#45B7D1"
        />
        <StatusBar label="Age" value={state.age} color="#96CEB4" />
      </View>

      {state.poops.map((poop) => (
        <TouchableOpacity
          key={poop.id}
          style={[styles.poop, { left: poop.x, top: poop.y }]}
          onPress={() => actions.cleanPoop(poop.id)}
        >
          <Text style={styles.emoji}>💩</Text>
        </TouchableOpacity>
      ))}

      <Animated.View style={[styles.pig, pigPosition.getLayout()]}>
        <Text style={styles.emoji}>
          🐷
          {state.isSick && <Text style={styles.sickEmoji}>🤮</Text>}
        </Text>
      </Animated.View>

      <View style={styles.controls}>
        <View style={styles.actionButtons}>
          <Pressable
            style={[styles.button, isPaused && styles.buttonDisabled]}
            onPress={() => handleAction(actions.feed)}
            disabled={isPaused}
          >
            <Text style={styles.buttonText}>🍎</Text>
          </Pressable>
          <Pressable
            style={[styles.button, isPaused && styles.buttonDisabled]}
            onPress={() => handleAction(actions.play)}
            disabled={isPaused}
          >
            <Text style={styles.buttonText}>⚽</Text>
          </Pressable>
          {state.isSick && (
            <Pressable
              style={[styles.button, isPaused && styles.buttonDisabled]}
              onPress={() => handleAction(actions.heal)}
              disabled={isPaused}
            >
              <Text style={styles.buttonText}>💊</Text>
            </Pressable>
          )}
        </View>
        <Pressable style={styles.button} onPress={() => setIsPaused(!isPaused)}>
          <Text style={styles.buttonText}>{isPaused ? "▶️" : "⏸️"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backgroundPattern: {
    position: "absolute",
    width: "100%",
    height: "100%",
    flexDirection: "column",
  },
  backgroundRow: {
    flexDirection: "row",
  },
  grassTile: {
    width: 48,
    height: 48,
  },
  statusBars: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    gap: 4,
  },
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
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 6,
    overflow: "hidden",
  },
  statusBarFill: {
    height: "100%",
  },
  statusValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    minWidth: 30,
    textAlign: "right",
  },
  pig: {
    position: "absolute",
  },
  poop: {
    position: "absolute",
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    fontSize: 40,
  },
  emoji: {
    fontSize: 80,
  },
  sickEmoji: {
    fontSize: 20,
    position: "absolute",
    top: -10,
    right: -10,
  },
  controls: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
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
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  text: {
    fontSize: 16,
    color: "white",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    marginTop: 8,
  },
});
