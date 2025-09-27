import {
  randomInt,
  randomChoice,
  formatFractionForDisplay,
  simplifyFraction,
} from "../utils/fraction.js";

function decimalToFraction(decimal, maxDenominator = 100) {
  // Wandelt Dezimalzahl in Bruch um (vereinfacht für Schulkontext)
  const decimalPlaces = decimal.toString().split('.')[1]?.length || 0;
  if (decimalPlaces === 0) {
    return { numerator: decimal, denominator: 1 };
  }
  
  const denominator = Math.pow(10, decimalPlaces);
  const numerator = decimal * denominator;
  
  return simplifyFraction({ numerator, denominator });
}

function fractionToDecimal(fraction) {
  return fraction.numerator / fraction.denominator;
}

function generateNiceDecimalFraction() {
  // Erstelle Brüche, die "schöne" Dezimalzahlen ergeben
  const niceDecimals = [
    { decimal: 0.5, fraction: { numerator: 1, denominator: 2 } },
    { decimal: 0.25, fraction: { numerator: 1, denominator: 4 } },
    { decimal: 0.75, fraction: { numerator: 3, denominator: 4 } },
    { decimal: 0.2, fraction: { numerator: 1, denominator: 5 } },
    { decimal: 0.4, fraction: { numerator: 2, denominator: 5 } },
    { decimal: 0.6, fraction: { numerator: 3, denominator: 5 } },
    { decimal: 0.8, fraction: { numerator: 4, denominator: 5 } },
    { decimal: 0.125, fraction: { numerator: 1, denominator: 8 } },
    { decimal: 0.375, fraction: { numerator: 3, denominator: 8 } },
    { decimal: 0.625, fraction: { numerator: 5, denominator: 8 } },
    { decimal: 1.5, fraction: { numerator: 3, denominator: 2 } },
    { decimal: 2.25, fraction: { numerator: 9, denominator: 4 } },
  ];
  
  return randomChoice(niceDecimals);
}

function createDistractors(correctAnswer, isDecimalTarget) {
  const distractors = [];
  
  if (isDecimalTarget) {
    // Wenn Ziel eine Dezimalzahl ist, erstelle ähnliche Dezimalzahlen
    const base = parseFloat(correctAnswer);
    const variations = [
      base + 0.1,
      base - 0.1,
      base * 2,
      base / 2,
    ].filter(n => n > 0 && n < 10).map(n => parseFloat(n.toFixed(3)));
    
    return [...new Set(variations)].slice(0, 3);
  } else {
    // Wenn Ziel ein Bruch ist, erstelle ähnliche Brüche
    const baseFraction = correctAnswer;
    const variations = [
      { numerator: baseFraction.numerator + 1, denominator: baseFraction.denominator },
      { numerator: baseFraction.numerator, denominator: baseFraction.denominator + 1 },
      { numerator: baseFraction.numerator * 2, denominator: baseFraction.denominator * 2 },
    ];
    
    return variations.map(f => formatFractionForDisplay(f).text).slice(0, 3);
  }
}

const decimalFractions = {
  id: "decimal-fractions",
  name: "Brüche und Dezimalzahlen",
  description: "Wandle zwischen Brüchen und Dezimalzahlen um.",
  
  generateProblem({ settings = {} } = {}) {
    const direction = randomChoice(["fraction-to-decimal", "decimal-to-fraction"]);
    const niceValue = generateNiceDecimalFraction();
    
    if (direction === "fraction-to-decimal") {
      // Bruch → Dezimalzahl
      const fraction = niceValue.fraction;
      const fractionDisplay = formatFractionForDisplay(fraction);
      const correctDecimal = niceValue.decimal.toString();
      const distractors = createDistractors(correctDecimal, true);
      
      const options = [
        { value: correctDecimal, label: correctDecimal },
        ...distractors.map(d => ({ value: d.toString(), label: d.toString() }))
      ]
        .filter((option, index, self) => 
          index === self.findIndex(o => o.value === option.value)
        ) // Remove duplicates
        .sort(() => Math.random() - 0.5)
        .slice(0, 4)
        .map((option, index) => ({
          id: `decimal-option-${index}`,
          label: option.label,
          labelText: option.label,
          value: option.value,
        }));
      
      return {
        id: `${this.id}-to-decimal`,
        prompt: `Welche Dezimalzahl entspricht dem Bruch ${fractionDisplay.html}?`,
        promptIsHtml: true,
        input: {
          type: "multiple-choice",
          options,
        },
        solution: {
          type: "multiple-choice",
          value: correctDecimal,
        },
        explanation: `${fractionDisplay.html} = ${fraction.numerator} ÷ ${fraction.denominator} = ${correctDecimal}`,
        explanationIsHtml: true,
        hint: `Tipp: Teile den Zähler durch den Nenner: ${fraction.numerator} ÷ ${fraction.denominator}`,
        hintIsHtml: false,
      };
      
    } else {
      // Dezimalzahl → Bruch
      const decimal = niceValue.decimal;
      const correctFraction = niceValue.fraction;
      const correctDisplay = formatFractionForDisplay(correctFraction);
      const distractors = createDistractors(correctFraction, false);
      
      const options = [
        { value: correctDisplay.text, label: correctDisplay.html },
        ...distractors.map(d => ({ 
          value: d, 
          label: formatFractionForDisplay(
            d.includes('/') 
              ? { numerator: parseInt(d.split('/')[0]), denominator: parseInt(d.split('/')[1]) }
              : { numerator: parseInt(d), denominator: 1 }
          ).html 
        }))
      ]
        .filter((option, index, self) => 
          index === self.findIndex(o => o.value === option.value)
        ) // Remove duplicates
        .sort(() => Math.random() - 0.5)
        .slice(0, 4)
        .map((option, index) => ({
          id: `fraction-option-${index}`,
          label: option.label,
          labelText: option.value,
          value: option.value,
        }));
      
      return {
        id: `${this.id}-to-fraction`,
        prompt: `Welcher Bruch entspricht der Dezimalzahl ${decimal}?`,
        promptIsHtml: false,
        input: {
          type: "multiple-choice",
          options,
        },
        solution: {
          type: "multiple-choice",
          value: correctDisplay.text,
        },
        explanation: `${decimal} = ${correctDisplay.html} (vollständig gekürzt)`,
        explanationIsHtml: true,
        hint: `Tipp: Überlege, welcher Bruchteil ${decimal} entspricht. Bei 0,5 denkst du an "die Hälfte" = ½`,
        hintIsHtml: true,
      };
    }
  },
};

export default decimalFractions;