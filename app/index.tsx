import { useState, useCallback, memo } from "react";
import { View, StyleSheet, Image, Dimensions } from "react-native";
import { useGameState } from "@/hooks/useGameState";
import { LAYOUT } from "@/config/game";
import { Poop } from "@/components/Poop";
import GameEndScreen from "./GameEndScreen";
import { Controls } from "@/components/Controls";
import { StatusBars } from "@/components/StatusBars";
import { Pig } from "@/components/Pig";
import { ActionEffect } from "@/components/ActionEffect";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

// Memoize components that don't depend on changing state
const MemoizedBackground = memo(() => (
  <View style={styles.backgroundPattern}>
    <Image
      source={require("@/assets/images/bg.png")}
      style={styles.grassBackground}
      resizeMode="cover"
    />
  </View>
));

const MemoizedPoop = memo(Poop);

export default function HomeScreen() {
  const { state, actions } = useGameState();
  const [currentAction, setCurrentAction] = useState<string | null>(null);

  // Memoize action handler
  const handleAction = useCallback((action: () => void, emoji: string) => {
    action();
    setCurrentAction(emoji);
    setTimeout(() => setCurrentAction(null), 400);
  }, []);

  // Memoize handlers for Controls
  const handleFeed = useCallback(
    () => handleAction(actions.feed, "🍎"),
    [actions.feed, handleAction]
  );
  const handlePlay = useCallback(
    () => handleAction(actions.play, "⚽"),
    [actions.play, handleAction]
  );
  const handleHeal = useCallback(
    () => handleAction(actions.heal, "💊"),
    [actions.heal, handleAction]
  );

  return (
    <View style={styles.container}>
      <MemoizedBackground />

      <StatusBars
        height={LAYOUT.STATUS_BAR_HEIGHT}
        hunger={state.hunger}
        happiness={state.happiness}
        cleanliness={state.cleanliness}
      />

      {state.poops.map((poop) => (
        <MemoizedPoop
          key={poop.id}
          x={poop.x}
          y={poop.y}
          id={poop.id}
          onPress={actions.cleanPoop}
        />
      ))}

      <Pig
        isSick={state.isSick}
        statusBarHeight={LAYOUT.STATUS_BAR_HEIGHT}
        controlsHeight={LAYOUT.CONTROLS_HEIGHT}
        safePadding={LAYOUT.PIG_SAFE_PADDING}
        age={state.age}
        isDead={state.isGameOver}
        hasWon={state.hasWon}
      />

      <ActionEffect
        emoji={currentAction || ""}
        isVisible={currentAction !== null}
      />

      <Controls
        height={LAYOUT.CONTROLS_HEIGHT}
        onFeed={handleFeed}
        onPlay={handlePlay}
        onHeal={handleHeal}
        isSick={state.isSick}
      />

      {(state.isGameOver || state.hasWon) && (
        <GameEndScreen
          type={state.hasWon ? "win" : "gameOver"}
          causeOfDeath={state.causeOfDeath}
          onReset={actions.reset}
        />
      )}
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
  },
  grassBackground: {
    width: "100%",
    height: "100%",
  },
});
