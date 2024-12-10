import { useState } from "react";
import { View, StyleSheet, Image, Dimensions } from "react-native";
import { useGameState, LAYOUT } from "@/hooks/useGameState";
import { Poop } from "@/components/Poop";
import { GameEndScreen } from "./GameEndScreen";
import { Controls } from "@/components/Controls";
import { StatusBars } from "@/components/StatusBars";
import { Pig } from "@/components/Pig";
import { ActionEffect } from "@/components/ActionEffect";
const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

export default function HomeScreen() {
  const { state, actions } = useGameState();
  const [currentAction, setCurrentAction] = useState<string | null>(null);

  const handleAction = (action: () => void, emoji: string) => {
    action();
    setCurrentAction(emoji);
    setTimeout(() => setCurrentAction(null), 400);
  };

  if (state.isGameOver) {
    return (
      <GameEndScreen
        type="gameOver"
        causeOfDeath={state.causeOfDeath}
        onReset={actions.reset}
      />
    );
  }

  if (state.hasWon) {
    return <GameEndScreen type="win" onReset={actions.reset} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.backgroundPattern}>
        <Image
          source={require("@/assets/images/bg.png")}
          style={styles.grassBackground}
        />
      </View>

      <StatusBars
        height={LAYOUT.STATUS_BAR_HEIGHT}
        hunger={state.hunger}
        happiness={state.happiness}
        cleanliness={state.cleanliness}
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
    backgroundColor: "#90BE6D",
  },
  grassBackground: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
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
