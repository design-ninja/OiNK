import { useState, useEffect } from "react";
import { View, StyleSheet, Image, Dimensions } from "react-native";
import { useGameState } from "@/hooks/useGameState";
import { useGameSounds } from "@/hooks/useGameSounds";
import { Poop } from "@/components/Poop";
import { GameOverScreen } from "@/app/screens/GameOverScreen";
import { YouWinScreen } from "@/app/screens/YouWinScreen";
import { Controls } from "@/components/Controls";
import { StatusBars } from "@/components/StatusBars";
import { Pig } from "@/components/Pig";
import { ActionEffect } from "@/components/ActionEffect";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

const LAYOUT = {
  STATUS_BAR_HEIGHT: 200,
  CONTROLS_HEIGHT: 100,
  PIG_SAFE_PADDING: 50,
} as const;

export default function HomeScreen() {
  const { state, actions } = useGameState();
  const [currentAction, setCurrentAction] = useState<string | null>(null);
  const { playBackgroundMusic } = useGameSounds();

  useEffect(() => {
    playBackgroundMusic();
  }, []);

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

      <StatusBars
        height={LAYOUT.STATUS_BAR_HEIGHT}
        hunger={state.hunger}
        happiness={state.happiness}
        cleanliness={state.cleanliness}
        age={state.age}
      />

      {state.poops.map((poop) => (
        <Poop
          key={poop.id}
          x={poop.x}
          y={poop.y}
          id={poop.id}
          onPress={actions.cleanPoop}
        />
      ))}

      <Pig
        isSick={state.isSick}
        isPaused={state.isPaused}
        statusBarHeight={LAYOUT.STATUS_BAR_HEIGHT}
        controlsHeight={LAYOUT.CONTROLS_HEIGHT}
        safePadding={LAYOUT.PIG_SAFE_PADDING}
        age={state.age}
      />

      <ActionEffect
        emoji={currentAction || ""}
        isVisible={currentAction !== null}
      />

      <Controls
        height={LAYOUT.CONTROLS_HEIGHT}
        onFeed={() => handleAction(actions.feed, "🍎")}
        onPlay={() => handleAction(actions.play, "⚽")}
        onHeal={() => handleAction(actions.heal, "💊")}
        onTogglePause={actions.togglePause}
        isPaused={state.isPaused}
        isSick={state.isSick}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    overflow: "hidden",
  },
  backgroundPattern: {
    position: "absolute",
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    flexDirection: "column",
    overflow: "hidden",
  },
  backgroundRow: {
    flexDirection: "row",
  },
  grassTile: {
    width: 48,
    height: 48,
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
