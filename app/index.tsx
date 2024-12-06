import { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  Image,
  Dimensions,
  Pressable,
  Text,
  Animated as RNAnimated,
} from "react-native";
import { useGameState } from "@/hooks/useGameState";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

const LAYOUT = {
  STATUS_BAR_HEIGHT: 120,
  CONTROLS_HEIGHT: 120,
  PIG_SAFE_PADDING: 50,
} as const;

const DEATH_MESSAGES = {
  hunger: { emoji: "🍽️", message: "🐷 died from hunger..." },
  happiness: { emoji: "😢", message: "🐷 died from sadness..." },
  cleanliness: { emoji: "🦠", message: "🐷 died from uncleanliness..." },
} as const;

interface GameOverScreenProps {
  causeOfDeath?: string;
  onReset: () => void;
}

function GameOverScreen({ causeOfDeath, onReset }: GameOverScreenProps) {
  const scaleAnim = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    RNAnimated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, []);

  const deathInfo =
    causeOfDeath && causeOfDeath in DEATH_MESSAGES
      ? DEATH_MESSAGES[causeOfDeath as keyof typeof DEATH_MESSAGES]
      : { emoji: "💀", message: "Game Over" };

  return (
    <View style={styles.overlay}>
      <RNAnimated.Text
        style={[styles.gameOverEmoji, { transform: [{ scale: scaleAnim }] }]}
      >
        {deathInfo.emoji}
      </RNAnimated.Text>
      <Text style={styles.gameOverTitle}>Game Over</Text>
      <Text style={styles.gameOverMessage}>{deathInfo.message}</Text>
      <Pressable style={styles.resetButton} onPress={onReset}>
        <Text style={styles.resetButtonText}>Start Again</Text>
      </Pressable>
    </View>
  );
}

function YouWinScreen({ onReset }: { onReset: () => void }) {
  const scaleAnim = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    RNAnimated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.overlay}>
      <RNAnimated.Text
        style={[styles.gameOverEmoji, { transform: [{ scale: scaleAnim }] }]}
      >
        🎉
      </RNAnimated.Text>
      <Text style={styles.gameOverTitle}>You Win!</Text>
      <Pressable style={styles.resetButton} onPress={onReset}>
        <Text style={styles.resetButtonText}>Play Again</Text>
      </Pressable>
    </View>
  );
}

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
        <RNAnimated.View
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
  const scaleAnim = useRef(new RNAnimated.Value(0)).current;
  const opacityAnim = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      RNAnimated.parallel([
        RNAnimated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }),
        RNAnimated.timing(opacityAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start(() => {
        RNAnimated.parallel([
          RNAnimated.timing(scaleAnim, {
            toValue: 2,
            duration: 300,
            useNativeDriver: true,
          }),
          RNAnimated.timing(opacityAnim, {
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
      <RNAnimated.Text
        style={[
          styles.actionEffectText,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        {emoji}
      </RNAnimated.Text>
    </View>
  );
}

export default function HomeScreen() {
  const { state, actions } = useGameState();
  const [currentAction, setCurrentAction] = useState<string | null>(null);
  const pigPosition = useRef(
    new RNAnimated.ValueXY({ x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT / 2 })
  ).current;

  const movePig = () => {
    if (state.isPaused) return;

    // Учитываем размер свинки (предположим 100x100) при расчете границ
    const PIG_SIZE = 100;

    const minX = LAYOUT.PIG_SAFE_PADDING;
    const maxX = SCREEN_WIDTH - LAYOUT.PIG_SAFE_PADDING - PIG_SIZE;
    const minY = LAYOUT.STATUS_BAR_HEIGHT + LAYOUT.PIG_SAFE_PADDING;
    const maxY =
      SCREEN_HEIGHT -
      LAYOUT.CONTROLS_HEIGHT -
      LAYOUT.PIG_SAFE_PADDING -
      PIG_SIZE;

    const newX = Math.min(
      maxX,
      Math.max(minX, Math.random() * (maxX - minX) + minX)
    );
    const newY = Math.min(
      maxY,
      Math.max(minY, Math.random() * (maxY - minY) + minY)
    );

    RNAnimated.spring(pigPosition, {
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
      <GameOverScreen
        causeOfDeath={state.causeOfDeath}
        onReset={actions.reset}
      />
    );
  }

  if (state.hasWon) {
    return <YouWinScreen onReset={actions.reset} />;
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

      <View style={[styles.statusBars, { height: LAYOUT.STATUS_BAR_HEIGHT }]}>
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
        <Pressable
          key={poop.id}
          style={[styles.poop, { left: poop.x, top: poop.y }]}
          onPress={() => actions.cleanPoop(poop.id)}
        >
          <Text style={styles.emoji}>💩</Text>
        </Pressable>
      ))}

      <RNAnimated.View style={[styles.pig, pigPosition.getLayout()]}>
        <Text style={styles.emoji}>
          🐷
          {state.isSick && <Text style={styles.sickEmoji}>🤮</Text>}
        </Text>
      </RNAnimated.View>

      <ActionEffect
        emoji={currentAction || ""}
        isVisible={currentAction !== null}
      />

      <View style={[styles.controls, { height: LAYOUT.CONTROLS_HEIGHT }]}>
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
    top: 0,
    left: 24,
    right: 24,
    paddingTop: 24,
    gap: 8,
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
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 50,
  },
  gameOverEmoji: {
    fontSize: 100,
    position: "absolute",
  },
  gameOverTitle: {
    color: "white",
    fontSize: 48,
    fontWeight: "800",
    marginTop: 120,
  },
  gameOverMessage: {
    color: "white",
    fontSize: 24,
    fontWeight: "700",
    marginTop: 16,
  },
  resetButton: {
    backgroundColor: "#22c55e",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 9999,
    marginTop: "auto",
    marginBottom: 64,
    transform: [{ scale: 1 }],
  },
  resetButtonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
  },
});
