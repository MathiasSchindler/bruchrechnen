import { randomInt, formatFractionForDisplay } from "../utils/fraction.js";

const expandFraction = {
  id: "expand",
  name: "Brüche erweitern",
  description:
    "Erweitere einen Bruch mit einem vorgegebenen Faktor. Gib Zähler und Nenner an.",
  generateProblem() {
    const numerator = randomInt(1, 11);
    const denominator = randomInt(numerator + 1, numerator + 8);
    const factor = randomInt(2, 6);
    const expanded = {
      numerator: numerator * factor,
      denominator: denominator * factor,
    };

    const original = { numerator, denominator };
    const originalDisplay = formatFractionForDisplay(original);
    const expandedDisplay = formatFractionForDisplay(expanded);

    return {
      id: this.id,
      prompt: `Erweitere den Bruch ${originalDisplay.html} um den Faktor ${factor}.`,
      promptIsHtml: true,
      input: {
        type: "fraction",
        label: "Erweiteter Bruch",
        allowNegative: false,
      },
      solution: expanded,
      explanation: `${originalDisplay.html} · ${factor} = ${expandedDisplay.html}`,
      explanationIsHtml: true,
      solutionDisplayHtml: expandedDisplay.html,
    };
  },
};

export default expandFraction;
