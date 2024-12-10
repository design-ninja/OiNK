export const LAYOUT = {
  STATUS_BAR_HEIGHT: 200,
  CONTROLS_HEIGHT: 120,
  PIG_SAFE_PADDING: 50,
} as const;

export const GAME_CONFIG = {
  TICK_RATE: 1000,
  POOP_CHANCE: 0.12,
  SICK_CHANCE: 0.03,
  MAX_STAT_VALUE: 100,
  MIN_STAT_VALUE: 0,
  STAT_DECREASE: {
    NORMAL: 0.8,
    SICK: 1.5,
    CLEANLINESS: 1.2,
  },
  STAT_INCREASE: {
    NORMAL: 20,
    SICK: 8,
  },
  PIG_SIZE: 150,
  AGE_MILESTONES: [10, 25, 50, 80] as const,
} as const;

export const GAME_ASSETS = {
  PIG_IMAGES: {
    0: require("../assets/images/piggy0.png"),
    10: require("../assets/images/piggy10.png"),
    25: require("../assets/images/piggy25.png"),
    50: require("../assets/images/piggy50.png"),
    80: require("../assets/images/piggy80.png"),
  },
  PIG_EMOJIS: {
    DEAD: "🪦",
    SICK: "🤮",
  },
  STATUS_ICONS: {
    HUNGER: "🍎",
    HAPPINESS: "😊",
    CLEANLINESS: "🧽",
    AGE: "🎂",
  },
  CONTROLS: {
    FEED: "🍎",
    PLAY: "⚽",
    HEAL: "💊",
  },
} as const;

export const END_MESSAGES = {
  hunger: { emoji: "🍽️", message: "🐷 died from hunger..." },
  happiness: { emoji: "😢", message: "🐷 died from sadness..." },
  cleanliness: { emoji: "🦠", message: "🐷 died from disease..." },
  win: { emoji: "🎉", message: "You raised a happy pig!" },
  gameOver: { emoji: "💀", message: "Game Over" },
} as const;
