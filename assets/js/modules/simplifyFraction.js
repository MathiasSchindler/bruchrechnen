import {
  generateReducibleFraction,
  simplifyFraction as simplifyFractionUtil,
  formatFractionForDisplay,
} from "../utils/fraction.js";

function createDistractors(base, simplifiedFraction) {
  const simplified = formatFractionForDisplay(simplifiedFraction).fraction;
  const distractorMap = new Map();
  const addVariant = (fraction, options) => {
    const display = formatFractionForDisplay(fraction, options);
    distractorMap.set(display.text, display);
  };

  addVariant(
    { numerator: simplified.numerator + 1, denominator: simplified.denominator }
  );

  if (simplified.numerator > 1) {
    addVariant({ numerator: simplified.numerator - 1, denominator: simplified.denominator });
  }

  addVariant({ numerator: simplified.numerator, denominator: simplified.denominator + 1 });

  if (simplified.denominator > 2) {
    addVariant({ numerator: simplified.numerator, denominator: simplified.denominator - 1 });
  }

  addVariant(base, { normalize: false });
  addVariant({ numerator: simplified.numerator * 2, denominator: simplified.denominator * 2 });

  return Array.from(distractorMap.values())
    .filter((option) => option.text !== formatFractionForDisplay(simplifiedFraction).text)
    .slice(0, 3);
}

const simplifyFraction = {
  id: "simplify",
  name: "Brüche kürzen",
  description: "Finde die vollständig gekürzte Form eines Bruchs.",
  generateProblem() {
    const base = generateReducibleFraction();
    const simplified = simplifyFractionUtil(base);
    const correct = formatFractionForDisplay(simplified);
    const distractors = createDistractors(base, simplified);
    const baseDisplay = formatFractionForDisplay(base, { normalize: false });

    const options = [correct, ...distractors]
      .sort(() => Math.random() - 0.5)
      .map((option, index) => ({
        id: `${this.id}-option-${index}`,
        label: option.html,
        labelText: option.text,
        value: option.text,
      }));

    return {
      id: this.id,
      prompt: `Kürze den Bruch ${baseDisplay.html} auf die vollständig gekürzte Form.`,
      promptIsHtml: true,
      input: {
        type: "multiple-choice",
        options,
      },
      solution: {
        type: "multiple-choice",
        value: correct.text,
      },
      explanation: `Teile Zähler (${base.numerator}) und Nenner (${base.denominator}) durch ihren größten gemeinsamen Teiler.`,
      solutionDisplayHtml: correct.html,
    };
  },
};
export default simplifyFraction;
