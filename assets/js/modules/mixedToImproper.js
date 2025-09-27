import {
  toImproperFraction,
  mixedFractionToDisplay,
  formatFractionForDisplay,
  randomInt,
} from "../utils/fraction.js";

const DEFAULT_SETTINGS = {
  wholeMax: 5,
  denominatorMax: 12,
};

const mixedToImproper = {
  id: "mixed-to-improper",
  name: "Gemischte in unechte Brüche",
  description:
    "Wandle gemischte Brüche in unechte Brüche um. Gib den Zähler und Nenner ein.",
  generateProblem({ settings = {} } = {}) {
    const { wholeMax, denominatorMax } = { ...DEFAULT_SETTINGS, ...settings };
    const whole = randomInt(1, Math.max(2, wholeMax));
    const denominator = randomInt(2, Math.max(denominatorMax, 4));
    const numerator = randomInt(1, denominator - 1);

    const mixed = { whole, numerator, denominator };
    const improper = toImproperFraction(mixed);

    const mixedDisplay = mixedFractionToDisplay(mixed);
    const improperDisplay = formatFractionForDisplay(improper);
    const prompt = `Wandle den gemischten Bruch ${mixedDisplay.html} in einen unechten Bruch um.`;

    return {
      id: this.id,
      prompt,
      promptIsHtml: true,
      input: {
        type: "fraction",
        label: "Unechter Bruch",
        allowNegative: false,
      },
      solution: improper,
  explanation: `${mixedDisplay.html} = ${improperDisplay.html}. Multiplikation: ${whole} · ${denominator} + ${numerator} = ${improper.numerator}.`,
      explanationIsHtml: true,
      solutionDisplayHtml: improperDisplay.html,
    };
  },
};

export default mixedToImproper;
