export const difficultyLevels = [
  {
    id: "easy",
    label: "Leicht",
    description: "Kleine Zahlen, gleiche Nenner, klare Aufgabenstellung.",
  },
  {
    id: "medium",
    label: "Mittel",
    description: "Gemischte Nenner, moderate Zahlenbereiche, erste gemischte Zahlen.",
  },
  {
    id: "hard",
    label: "Schwer",
    description: "Größere Zahlen, gemischte Brüche, mehrere Zwischenschritte.",
  },
];

export const defaultDifficulty = "medium";

export const adaptiveConfig = {
  windowSize: 6,
  increaseThreshold: 5,
  decreaseThreshold: 2,
  cooldownTasks: 4,
};

const defaultModuleSettings = {
  easy: {},
  medium: {},
  hard: {},
};

export const moduleDifficultySettings = {
  default: defaultModuleSettings,
  "mixed-to-improper": {
    easy: { wholeMax: 4, denominatorMax: 8 },
    medium: { wholeMax: 6, denominatorMax: 12 },
    hard: { wholeMax: 9, denominatorMax: 16 },
  },
  "improper-to-mixed": {
    easy: { wholeMax: 4, denominatorMax: 8 },
    medium: { wholeMax: 6, denominatorMax: 12 },
    hard: { wholeMax: 9, denominatorMax: 16 },
  },
  simplify: {
    easy: { maxDenominator: 12, factorRange: [2, 4] },
    medium: { maxDenominator: 18, factorRange: [2, 6] },
    hard: { maxDenominator: 24, factorRange: [3, 8] },
  },
  expand: {
    easy: { numeratorMax: 8, factorRange: [2, 4] },
    medium: { numeratorMax: 12, factorRange: [2, 6] },
    hard: { numeratorMax: 16, factorRange: [3, 8] },
  },
  arithmetic: {
    easy: { denominatorMax: 9, operations: ["add", "subtract"], allowNegative: false },
    medium: { denominatorMax: 12, operations: ["add", "subtract", "multiply"], allowNegative: false },
    hard: { denominatorMax: 16, operations: ["add", "subtract", "multiply"], allowNegative: true },
  },
  compare: {
    easy: { denominatorMax: 10, includeEquals: true, includeMixed: false },
    medium: { denominatorMax: 14, includeEquals: true, includeMixed: true },
    hard: { denominatorMax: 18, includeEquals: true, includeMixed: true, includeNegatives: true },
  },
  cloze: {
    easy: { gaps: 1, allowMixed: false },
    medium: { gaps: 1, allowMixed: true },
    hard: { gaps: 2, allowMixed: true, allowDenominatorGap: true },
  },
};

export function getDifficultySettings(moduleId, level) {
  const settings = moduleDifficultySettings[moduleId] || moduleDifficultySettings.default;
  return settings[level] || settings[defaultDifficulty] || {};
}

export function clampDifficulty(levelId) {
  const order = difficultyLevels.map((level) => level.id);
  if (order.includes(levelId)) {
    return levelId;
  }
  return defaultDifficulty;
}

export function shiftDifficulty(current, direction = 1) {
  const order = difficultyLevels.map((level) => level.id);
  const index = order.indexOf(current);
  if (index === -1) {
    return defaultDifficulty;
  }
  const nextIndex = Math.min(Math.max(index + direction, 0), order.length - 1);
  return order[nextIndex];
}
