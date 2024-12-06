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

const GAME_CONFIG = {
  TICK_RATE: 1000,
  POOP_CHANCE: 0.15,
  SICK_CHANCE: 0.08,
  MAX_STAT_VALUE: 100,
  MIN_STAT_VALUE: 0,
  STAT_DECREASE: {
    NORMAL: 1,
    SICK: 2,
  },
  STAT_INCREASE: {
    NORMAL: 15,
    SICK: 5,
  },
  SPEED_MULTIPLIERS: {
    HUNGER: 2,
    HAPPINESS: 1.5,
    AGE: 1,
    CLEANLINESS: 1,
  },
  AGE_INCREASE: 1,
  MAX_AGE: 100,
  CLEANLINESS_DECREASE: 10,
} as const;

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

interface ActionEffectProps {
  emoji: string;
  isVisible: boolean;
}

function ActionEffect({ emoji, isVisible }: ActionEffectProps) {
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
    <View style={styles.actionEffectContainer} pointerEvents="none">
      <Animated.Text
        style={[
          styles.actionEffectText,
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

export default function HomeScreen() {
  const { state, actions } = useGameState();
  const [currentAction, setCurrentAction] = useState<string | null>(null);
  const pigPosition = useRef(
    new Animated.ValueXY({ x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT / 2 })
  ).current;

  const movePig = () => {
    if (state.isPaused) return;

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
  }, [state.isPaused]);

  const handleAction = (action: () => void, emoji: string) => {
    if (!state.isPaused) {
      action();
      setCurrentAction(emoji);
      setTimeout(() => setCurrentAction(null), 400);
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

      <ActionEffect
        emoji={currentAction || ""}
        isVisible={currentAction !== null}
      />

      <View style={styles.controls}>
        <View style={styles.actionButtons}>
          <Pressable
            style={[styles.button, state.isPaused && styles.buttonDisabled]}
            onPress={() => handleAction(actions.feed, "🍎")}
            disabled={state.isPaused}
          >
            <Text style={styles.buttonText}>🍎</Text>
          </Pressable>
          <Pressable
            style={[styles.button, state.isPaused && styles.buttonDisabled]}
            onPress={() => handleAction(actions.play, "⚽")}
            disabled={state.isPaused}
          >
            <Text style={styles.buttonText}>⚽</Text>
          </Pressable>
          {state.isSick && (
            <Pressable
              style={[styles.button, state.isPaused && styles.buttonDisabled]}
              onPress={() => handleAction(actions.heal, "💊")}
              disabled={state.isPaused}
            >
              <Text style={styles.buttonText}>💊</Text>
            </Pressable>
          )}
        </View>
        <Pressable style={styles.button} onPress={actions.togglePause}>
          <Text style={styles.buttonText}>{state.isPaused ? "▶️" : "⏸️"}</Text>
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
  actionEffectContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  actionEffectText: {
    fontSize: 100,
  },
});
