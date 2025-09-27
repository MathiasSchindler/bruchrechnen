import {
  toMixedFraction,
  formatFractionForDisplay,
  mixedFractionToDisplay,
  randomInt,
} from "../utils/fraction.js";

const DEFAULT_SETTINGS = {
  wholeMax: 6,
  denominatorMax: 12,
};

const improperToMixed = {
  id: "improper-to-mixed",
  name: "Unechte in gemischte Brüche",
  description:
    "Wandle einen unechten Bruch in einen gemischten Bruch um. Gib Ganzzahl, Zähler und Nenner an.",
  generateProblem({ settings = {} } = {}) {
    const { wholeMax, denominatorMax } = { ...DEFAULT_SETTINGS, ...settings };
    const whole = randomInt(1, Math.max(2, wholeMax));
    const denominator = randomInt(2, Math.max(denominatorMax, 4));
    const remainder = randomInt(1, denominator - 1);

    const improper = {
      numerator: whole * denominator + remainder,
      denominator,
    };

    const mixed = toMixedFraction(improper);
    const improperDisplay = formatFractionForDisplay(improper);
    const mixedDisplay = mixedFractionToDisplay(mixed);

    return {
      id: this.id,
      prompt: `Wandle den unechten Bruch ${improperDisplay.html} in einen gemischten Bruch um.`,
      promptIsHtml: true,
      input: {
        type: "mixed-fraction",
        label: "Gemischter Bruch",
        allowNegative: false,
      },
    solution: improper,
    explanation: `Dividiere ${improper.numerator} durch ${denominator}. Der ganzzahlige Anteil ist ${mixed.whole}, der Rest ${mixed.numerator}.`,
    explanationIsHtml: false,
    solutionDisplayHtml: mixedDisplay.html,
      hint: "Teile Zähler durch Nenner: Ganzzahl und Rest bilden den gemischten Bruch.",
    };
  },
};

export default improperToMixed;
