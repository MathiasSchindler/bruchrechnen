import {
  randomInt,
  randomChoice,
  formatFractionForDisplay,
  addFractions,
  subtractFractions,
  multiplyFractions,
  simplifyFraction,
} from "../utils/fraction.js";

function generateWordProblem() {
  const contexts = [
    {
      id: "pizza-party",
      setup: () => {
        const totalPizza = randomChoice([2, 3]);
        return {
          story: `Für die Klassenparty wurden ${totalPizza} Pizzen bestellt. `,
          unit: totalPizza > 1 ? "der Pizzen" : "der Pizza",
          totalAmount: totalPizza,
        };
      },
      scenarios: {
        sequential: (context) => {
          const fraction1 = { numerator: randomInt(1, 3), denominator: randomChoice([4, 6, 8]) };
          const fraction2 = { numerator: randomInt(1, 3), denominator: fraction1.denominator };
          
          return {
            story: context.story + 
                   `In der ersten Pause essen die Schüler ${formatFractionForDisplay(fraction1).text} ${context.unit}. ` +
                   `In der zweiten Pause essen sie noch ${formatFractionForDisplay(fraction2).text} ${context.unit}. ` +
                   `Wie viel Pizza wurde insgesamt gegessen?`,
            solution: addFractions(fraction1, fraction2),
            operation: "addition",
            fractions: [fraction1, fraction2]
          };
        },
        leftover: (context) => {
          const total = { numerator: randomChoice([3, 4, 5]), denominator: randomChoice([4, 6, 8]) };
          const eaten = { numerator: randomInt(1, total.numerator - 1), denominator: total.denominator };
          
          return {
            story: context.story +
                   `Die Schüler haben ${formatFractionForDisplay(eaten).text} ${context.unit} gegessen. ` +
                   `Wie viel Pizza ist noch übrig?`,
            solution: subtractFractions({ numerator: context.totalAmount, denominator: 1 }, eaten),
            operation: "subtraction",
            fractions: [eaten]
          };
        }
      }
    },
    
    {
      id: "craft-project",
      setup: () => ({
        story: `Für ein Bastelprojekt braucht Tim verschiedene Materialien. `,
        unit: "des Materials",
        totalAmount: 1,
      }),
      scenarios: {
        materials: (context) => {
          const fraction1 = { numerator: randomInt(1, 2), denominator: randomChoice([3, 4, 5]) };
          const fraction2 = { numerator: randomInt(1, 2), denominator: fraction1.denominator };
          
          return {
            story: context.story +
                   `Er verwendet ${formatFractionForDisplay(fraction1).text} für das Grundgerüst ` +
                   `und ${formatFractionForDisplay(fraction2).text} für die Verzierung. ` +
                   `Wie viel Material hat er insgesamt verwendet?`,
            solution: addFractions(fraction1, fraction2),
            operation: "addition", 
            fractions: [fraction1, fraction2]
          };
        },
        remaining: (context) => {
          const used = { numerator: randomInt(2, 4), denominator: randomChoice([5, 6, 8]) };
          
          return {
            story: context.story +
                   `Er hat bereits ${formatFractionForDisplay(used).text} seines Materials verbraucht. ` +
                   `Welcher Anteil ist noch übrig?`,
            solution: subtractFractions({ numerator: 1, denominator: 1 }, used),
            operation: "remaining",
            fractions: [used]
          };
        }
      }
    },
    
    {
      id: "garden",
      setup: () => ({
        story: `Omas Garten ist in verschiedene Bereiche aufgeteilt. `,
        unit: "des Gartens",
        totalAmount: 1,
      }),
      scenarios: {
        planting: (context) => {
          const vegetables = { numerator: randomInt(1, 3), denominator: randomChoice([4, 5, 6]) };
          const flowers = { numerator: randomInt(1, 2), denominator: vegetables.denominator };
          
          return {
            story: context.story +
                   `${formatFractionForDisplay(vegetables).text} wird für Gemüse genutzt ` +
                   `und ${formatFractionForDisplay(flowers).text} für Blumen. ` +
                   `Wie viel des Gartens ist bepflanzt?`,
            solution: addFractions(vegetables, flowers),
            operation: "addition",
            fractions: [vegetables, flowers]
          };
        },
        free_space: (context) => {
          const used = { numerator: randomInt(2, 4), denominator: randomChoice([5, 6]) };
          
          return {
            story: context.story +
                   `${formatFractionForDisplay(used).text} ist bereits bepflanzt. ` +
                   `Wie viel Platz ist noch frei für neue Pflanzen?`,
            solution: subtractFractions({ numerator: 1, denominator: 1 }, used),
            operation: "remaining",
            fractions: [used]
          };
        }
      }
    },
    
    {
      id: "reading",
      setup: () => ({
        story: `Anna liest ein spannendes Buch. `,
        unit: "des Buches",
        totalAmount: 1,
      }),
      scenarios: {
        daily_progress: (context) => {
          const day1 = { numerator: randomInt(1, 2), denominator: randomChoice([4, 5, 6]) };
          const day2 = { numerator: randomInt(1, 2), denominator: day1.denominator };
          
          return {
            story: context.story +
                   `Am ersten Tag liest sie ${formatFractionForDisplay(day1).text} ${context.unit}. ` +
                   `Am zweiten Tag schafft sie weitere ${formatFractionForDisplay(day2).text} ${context.unit}. ` +
                   `Wie viel hat sie insgesamt bereits gelesen?`,
            solution: addFractions(day1, day2),
            operation: "addition",
            fractions: [day1, day2]
          };
        },
        remaining_pages: (context) => {
          const read = { numerator: randomInt(2, 5), denominator: randomChoice([6, 8]) };
          
          return {
            story: context.story +
                   `Sie hat bereits ${formatFractionForDisplay(read).text} ${context.unit} gelesen. ` +
                   `Wie viel muss sie noch lesen?`,
            solution: subtractFractions({ numerator: 1, denominator: 1 }, read),
            operation: "remaining",
            fractions: [read]
          };
        }
      }
    }
  ];
  
  const context = randomChoice(contexts);
  const contextData = context.setup();
  const scenario = randomChoice(Object.values(context.scenarios));
  const problem = scenario(contextData);
  
  return {
    ...problem,
    context: contextData,
  };
}

const wordProblems = {
  id: "word-problems",
  name: "Textaufgaben mit Brüchen",
  description: "Löse realitätsnahe Sachaufgaben mit Brüchen aus dem Alltag.",
  
  generateProblem({ settings = {} } = {}) {
    const problem = generateWordProblem();
    const solutionDisplay = formatFractionForDisplay(problem.solution);
    
    // Generiere Hinweis basierend auf der Operation
    let hint = "";
    if (problem.operation === "addition") {
      const frac1Display = formatFractionForDisplay(problem.fractions[0]);
      const frac2Display = formatFractionForDisplay(problem.fractions[1]);
      hint = `Tipp: Du musst addieren: ${frac1Display.html} + ${frac2Display.html}`;
    } else if (problem.operation === "subtraction") {
      const frac1Display = formatFractionForDisplay(problem.fractions[0]);
      const frac2Display = formatFractionForDisplay(problem.fractions[1]);
      hint = `Tipp: Du musst subtrahieren: ${frac1Display.html} - ${frac2Display.html}`;
    } else {
      const usedDisplay = formatFractionForDisplay(problem.fractions[0]);
      hint = `Tipp: Vom Ganzen (1) wird ${usedDisplay.html} abgezogen: 1 - ${usedDisplay.html}`;
    }
    
    let explanation = "";
    if (problem.operation === "addition") {
      const frac1Display = formatFractionForDisplay(problem.fractions[0]);
      const frac2Display = formatFractionForDisplay(problem.fractions[1]);
      explanation = `Addition: ${frac1Display.html} + ${frac2Display.html} = ${solutionDisplay.html}`;
    } else if (problem.operation === "subtraction") {
      const frac1Display = formatFractionForDisplay(problem.fractions[0]);
      const frac2Display = formatFractionForDisplay(problem.fractions[1]);
      explanation = `Subtraktion: ${frac1Display.html} - ${frac2Display.html} = ${solutionDisplay.html}`;
    } else {
      const usedDisplay = formatFractionForDisplay(problem.fractions[0]);
      explanation = `Vom Ganzen bleibt: 1 - ${usedDisplay.html} = ${solutionDisplay.html} übrig`;
    }
    
    // Erstelle HTML-Version der Story mit korrekt formatierten Brüchen
    let htmlStory = problem.story;
    problem.fractions.forEach(fraction => {
      const textVersion = formatFractionForDisplay(fraction).text;
      const htmlVersion = formatFractionForDisplay(fraction).html;
      htmlStory = htmlStory.replace(new RegExp(textVersion.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), htmlVersion);
    });
    
    return {
      id: `${this.id}-${problem.operation}`,
      prompt: htmlStory,
      promptIsHtml: true,
      input: {
        type: "fraction",
        label: "Antwort als Bruch",
        allowNegative: false,
      },
      solution: problem.solution,
      explanation,
      explanationIsHtml: true,
      hint,
      hintIsHtml: true,
      solutionDisplayHtml: solutionDisplay.html,
    };
  },
};

export default wordProblems;