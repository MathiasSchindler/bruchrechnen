import {
  randomInt,
  randomChoice,
  formatFractionForDisplay,
  addFractions,
  subtractFractions,
  multiplyFractions,
  simplifyFraction,
  lcm,
} from "../utils/fraction.js";

function createRandomFraction({ minDenominator = 2, maxDenominator = 12 } = {}) {
  const denominator = randomInt(minDenominator, maxDenominator);
  const numerator = randomInt(1, denominator - 1);
  return { numerator, denominator };
}

const operations = [
  {
    id: "add",
    symbol: "+",
    description: "Addiere die Brüche.",
    operate: addFractions,
  },
  {
    id: "subtract",
    symbol: "-",
    description: "Subtrahiere den zweiten Bruch vom ersten.",
    operate: subtractFractions,
  },
  {
    id: "multiply",
    symbol: "·",
    description: "Multipliziere die Brüche.",
    operate: multiplyFractions,
  },
];

const arithmetic = {
  id: "arithmetic",
  name: "Brüche addieren, subtrahieren, multiplizieren",
  description:
    "Rechne mit Brüchen und gib das Ergebnis vollständig gekürzt ein.",
  generateProblem() {
    const operation = randomChoice(operations);
    let fractionA = createRandomFraction();
    let fractionB = createRandomFraction();

    if (operation.id === "subtract") {
      // sicherstellen, dass Ergebnis positiv bleibt
      const valueA = fractionA.numerator / fractionA.denominator;
      const valueB = fractionB.numerator / fractionB.denominator;
      if (valueB > valueA) {
        [fractionA, fractionB] = [fractionB, fractionA];
      }
      if (valueA === valueB) {
        fractionA.numerator += fractionA.denominator;
      }
    }

    const rawResult = operation.operate(fractionA, fractionB);
    const solution = simplifyFraction(rawResult);
    const displayA = formatFractionForDisplay(fractionA);
    const displayB = formatFractionForDisplay(fractionB);
    const solutionDisplay = formatFractionForDisplay(solution);

    let hint = null;
    if (operation.id === "subtract") {
      if (fractionA.denominator !== fractionB.denominator) {
        const targetDenominator = lcm(
          Math.abs(fractionA.denominator),
          Math.abs(fractionB.denominator)
        );
        const factorA = targetDenominator / fractionA.denominator;
        const factorB = targetDenominator / fractionB.denominator;
        const expandedA = formatFractionForDisplay({
          numerator: fractionA.numerator * factorA,
          denominator: targetDenominator,
        });
        const expandedB = formatFractionForDisplay({
          numerator: fractionB.numerator * factorB,
          denominator: targetDenominator,
        });

        const detailSteps = [
          factorA !== 1
            ? `${displayA.html} · ${factorA} = ${expandedA.html}`
            : `${displayA.html} muss nicht erweitert werden.`,
          factorB !== 1
            ? `${displayB.html} · ${factorB} = ${expandedB.html}`
            : `${displayB.html} muss nicht erweitert werden.`,
        ].join("<br>");

        hint = `Tipp: Bringe beide Brüche zuerst auf den gemeinsamen Nenner ${targetDenominator}.<br>${detailSteps}`;
      } else {
        hint = `Tipp: Die Nenner sind bereits gleich. Subtrahiere die Zähler ${fractionA.numerator} - ${fractionB.numerator}.`;
      }
    }

    return {
      id: `${this.id}-${operation.id}`,
      prompt: `${operation.description} ${displayA.html} ${operation.symbol} ${displayB.html} = ?`,
      promptIsHtml: true,
      input: {
        type: "fraction",
        label: "Ergebnis",
        allowNegative: operation.id === "subtract",
      },
      solution,
      explanation: `Rechne ${displayA.html} ${operation.symbol} ${displayB.html} und kürze anschließend vollständig. Ziel: ${solutionDisplay.html}.`,
      explanationIsHtml: true,
      hint,
      hintIsHtml: Boolean(hint),
      solutionDisplayHtml: solutionDisplay.html,
    };
  },
};

export default arithmetic;
