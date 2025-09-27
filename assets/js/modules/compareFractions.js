import {
  randomInt,
  randomChoice,
  formatFractionForDisplay,
  lcm,
} from "../utils/fraction.js";

const SIGNS = [
  { value: "<", label: "<" },
  { value: ">", label: ">" },
  { value: "=", label: "=" },
];

const DEFAULT_SETTINGS = {
  denominatorMax: 12,
  includeEquals: true,
  includeMixed: false,
  includeNegatives: false,
};

function generateFraction({ denominatorMax, includeNegatives, includeMixed }) {
  const denominator = randomInt(2, Math.max(denominatorMax, 4));
  const mixedMultiplier = includeMixed ? randomInt(0, 2) : 0;
  const remainder = randomInt(1, denominator - 1);
  const numerator = mixedMultiplier * denominator + remainder;
  const sign = includeNegatives && Math.random() < 0.25 ? -1 : 1;
  return { numerator: numerator * sign, denominator };
}

function maybeCreateEquality(baseFraction) {
  const factor = randomInt(2, 4);
  return {
    numerator: baseFraction.numerator * factor,
    denominator: baseFraction.denominator * factor,
  };
}

const compareFractions = {
  id: "compare",
  name: "Brüche vergleichen",
  description: "Setze das passende Vergleichszeichen zwischen zwei Brüchen.",
  generateProblem({ settings = {} } = {}) {
    const config = { ...DEFAULT_SETTINGS, ...settings };
    const allowEquality = config.includeEquals;

    let left = generateFraction(config);
    let right = generateFraction(config);
    let correctSign;

    if (allowEquality && Math.random() < 0.25) {
      right = maybeCreateEquality(left);
      correctSign = "=";
    } else {
      let comparison =
        left.numerator * right.denominator - right.numerator * left.denominator;
      if (comparison === 0) {
        right.numerator += right.denominator;
        comparison =
          left.numerator * right.denominator - right.numerator * left.denominator;
      }
      correctSign = comparison > 0 ? ">" : "<";
    }

    const leftDisplay = formatFractionForDisplay(left);
    const rightDisplay = formatFractionForDisplay(right);

    const commonDenominator = lcm(Math.abs(left.denominator), Math.abs(right.denominator));
    const expandedLeft =
      left.denominator === commonDenominator
        ? null
        : formatFractionForDisplay({
            numerator: left.numerator * (commonDenominator / left.denominator),
            denominator: commonDenominator,
          });
    const expandedRight =
      right.denominator === commonDenominator
        ? null
        : formatFractionForDisplay({
            numerator: right.numerator * (commonDenominator / right.denominator),
            denominator: commonDenominator,
          });

    const hintParts = [
      "Bringe beide Brüche auf denselben Nenner, um sie leichter zu vergleichen.",
    ];
    if (expandedLeft) {
      hintParts.push(`${leftDisplay.html} → ${expandedLeft.html}`);
    }
    if (expandedRight) {
      hintParts.push(`${rightDisplay.html} → ${expandedRight.html}`);
    }

    const options = SIGNS.filter((option) => allowEquality || option.value !== "=")
      .map((option) => ({ ...option }))
      .sort(() => Math.random() - 0.5)
      .map((option, index) => ({
        id: `${this.id}-opt-${index}`,
        value: option.value,
        label: option.label,
      }));

    const solutionSignHtml =
      correctSign === "<" ? "&lt;" : correctSign === ">" ? "&gt;" : "=";

    return {
      id: this.id,
      prompt: `Setze das passende Zeichen: ${leftDisplay.html} ? ${rightDisplay.html}`,
      promptIsHtml: true,
      input: {
        type: "multiple-choice",
        options,
      },
      solution: { type: "multiple-choice", value: correctSign },
      solutionDisplayHtml: solutionSignHtml,
      explanation: `Vergleiche die Werte: ${left.numerator}/${left.denominator} ${correctSign} ${right.numerator}/${right.denominator}.`,
  hint: hintParts.filter(Boolean).join("<br>"),
      hintIsHtml: true,
    };
  },
};

export default compareFractions;
