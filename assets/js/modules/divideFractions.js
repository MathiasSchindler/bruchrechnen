import {
  randomInt,
  randomChoice,
  formatFractionForDisplay,
  multiplyFractions,
  simplifyFraction,
} from "../utils/fraction.js";

function createRandomFraction({ minDenominator = 2, maxDenominator = 8, minNumerator = 1 } = {}) {
  const denominator = randomInt(minDenominator, maxDenominator);
  const numerator = randomInt(minNumerator, denominator - 1);
  return { numerator, denominator };
}

function createDivisiblePair() {
  // Erstelle zwei Brüche, bei denen die Division ein "schönes" Ergebnis gibt
  const divisor = createRandomFraction({ maxDenominator: 6 });
  
  // Erstelle den Dividenden so, dass das Ergebnis ein einfacher Bruch oder ganze Zahl wird
  const resultChoices = [
    { numerator: 1, denominator: 2 },
    { numerator: 1, denominator: 3 },
    { numerator: 2, denominator: 3 },
    { numerator: 1, denominator: 4 },
    { numerator: 3, denominator: 4 },
    { numerator: 1, denominator: 1 }, // = 1
    { numerator: 2, denominator: 1 }, // = 2
  ];
  
  const targetResult = randomChoice(resultChoices);
  
  // dividend ÷ divisor = targetResult
  // => dividend = targetResult × divisor
  const dividend = multiplyFractions(targetResult, divisor);
  
  return { dividend, divisor, expectedResult: targetResult };
}

const divideFractions = {
  id: "divide-fractions",
  name: "Brüche dividieren",
  description: "Teile Brüche durch andere Brüche. Denk an die Kehrwert-Regel!",
  
  generateProblem({ settings = {} } = {}) {
    const { dividend, divisor, expectedResult } = createDivisiblePair();
    
    const solution = simplifyFraction(expectedResult);
    const dividendDisplay = formatFractionForDisplay(dividend);
    const divisorDisplay = formatFractionForDisplay(divisor);
    const solutionDisplay = formatFractionForDisplay(solution);
    
    // Kehrwert für den Hinweis
    const reciprocal = { numerator: divisor.denominator, denominator: divisor.numerator };
    const reciprocalDisplay = formatFractionForDisplay(reciprocal);
    
    const prompt = `Berechne: ${dividendDisplay.html} ÷ ${divisorDisplay.html}`;
    
    const hint = `Tipp: Beim Dividieren von Brüchen multiplizierst du mit dem Kehrwert. 
                 Also: ${dividendDisplay.html} × ${reciprocalDisplay.html}`;
    
    const explanation = `${dividendDisplay.html} ÷ ${divisorDisplay.html} = ${dividendDisplay.html} × ${reciprocalDisplay.html} = ${solutionDisplay.html}`;
    
    return {
      id: `${this.id}-${Date.now()}`,
      prompt,
      promptIsHtml: true,
      input: {
        type: "fraction",
        label: "Ergebnis der Division",
        allowNegative: false,
      },
      solution,
      explanation,
      explanationIsHtml: true,
      hint,
      hintIsHtml: true,
      solutionDisplayHtml: solutionDisplay.html,
    };
  },
};

export default divideFractions;