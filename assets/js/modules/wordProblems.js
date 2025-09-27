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
  // Bestimme Schwierigkeitsgrad: Bruchteile vs. absolute Mengen
  const difficultyType = randomChoice(["fraction-parts", "absolute-amounts"]);
  
  const contexts = [
    {
      id: "pizza-party",
      setup: (difficulty) => {
        if (difficulty === "absolute-amounts") {
          const totalPizza = randomChoice([2, 3, 4]);
          return {
            story: `Für die Klassenparty wurden ${totalPizza} gleich große Pizzen bestellt. `,
            unit: "der Pizza",
            unitPlural: "Pizzen",
            totalAmount: totalPizza,
            isAbsolute: true,
          };
        } else {
          return {
            story: `Für die Klassenparty wurde eine große Pizza bestellt. `,
            unit: "der Pizza",
            unitPlural: "Pizza",
            totalAmount: 1,
            isAbsolute: false,
          };
        }
      },
      scenarios: {
        sequential: (context) => {
          const fraction1 = { numerator: randomInt(1, 3), denominator: randomChoice([4, 6, 8]) };
          const fraction2 = { numerator: randomInt(1, 3), denominator: fraction1.denominator };
          
          if (context.isAbsolute) {
            // Absolute Mengen: Rechne 1/6 × 3 + 1/3 × 3 = ?
            const amount1 = multiplyFractions(fraction1, { numerator: context.totalAmount, denominator: 1 });
            const amount2 = multiplyFractions(fraction2, { numerator: context.totalAmount, denominator: 1 });
            const solution = addFractions(amount1, amount2);
            
            return {
              story: context.story + 
                     `In der ersten Pause essen die Schüler ${formatFractionForDisplay(fraction1).text} von jeder Pizza. ` +
                     `In der zweiten Pause essen sie noch ${formatFractionForDisplay(fraction2).text} von jeder Pizza. ` +
                     `Wie viele ganze und teilweise Pizzen wurden insgesamt gegessen?`,
              solution,
              operation: "absolute-addition",
              fractions: [fraction1, fraction2],
              explanation: `${formatFractionForDisplay(fraction1).text} × ${context.totalAmount} + ${formatFractionForDisplay(fraction2).text} × ${context.totalAmount} = ${formatFractionForDisplay(amount1).text} + ${formatFractionForDisplay(amount2).text} = ${formatFractionForDisplay(solution).text} ${context.unitPlural}`
            };
          } else {
            // Bruchteile: Rechne 1/6 + 1/3 = ?
            const solution = addFractions(fraction1, fraction2);
            
            return {
              story: context.story + 
                   `In der ersten Pause essen die Schüler ${formatFractionForDisplay(fraction1).text} ${context.unit}. ` +
                   `In der zweiten Pause essen sie noch ${formatFractionForDisplay(fraction2).text} ${context.unit}. ` +
                   `Wie viel von der Pizza wurde insgesamt gegessen?`,
              solution,
              operation: "fraction-addition",
              fractions: [fraction1, fraction2],
              explanation: `${formatFractionForDisplay(fraction1).text} + ${formatFractionForDisplay(fraction2).text} = ${formatFractionForDisplay(solution).text} ${context.unit}`
            };
          }
        },
        leftover: (context) => {
          if (context.isAbsolute) {
            const eaten = { numerator: randomInt(2, 5), denominator: randomChoice([6, 8]) };
            const totalEaten = multiplyFractions(eaten, { numerator: context.totalAmount, denominator: 1 });
            const solution = subtractFractions({ numerator: context.totalAmount, denominator: 1 }, totalEaten);
            
            return {
              story: context.story +
                     `Die Schüler haben ${formatFractionForDisplay(eaten).text} von jeder Pizza gegessen. ` +
                     `Wie viele ganze und teilweise Pizzen sind noch übrig?`,
              solution,
              operation: "absolute-subtraction",
              fractions: [eaten],
              explanation: `${context.totalAmount} - (${formatFractionForDisplay(eaten).text} × ${context.totalAmount}) = ${context.totalAmount} - ${formatFractionForDisplay(totalEaten).text} = ${formatFractionForDisplay(solution).text} ${context.unitPlural}`
            };
          } else {
            const eaten = { numerator: randomInt(2, 5), denominator: randomChoice([6, 8]) };
            const solution = subtractFractions({ numerator: 1, denominator: 1 }, eaten);
            
            return {
              story: context.story +
                     `Die Schüler haben ${formatFractionForDisplay(eaten).text} ${context.unit} gegessen. ` +
                     `Wie viel von der Pizza ist noch übrig?`,
              solution,
              operation: "fraction-subtraction",
              fractions: [eaten],
              explanation: `1 - ${formatFractionForDisplay(eaten).text} = ${formatFractionForDisplay(solution).text} ${context.unit}`
            };
          }
        }
      }
    },
    
    {
      id: "craft-project",
      setup: (difficulty) => {
        if (difficulty === "absolute-amounts") {
          const sheets = randomChoice([2, 3]);
          return {
            story: `Für ein Bastelprojekt hat Tim ${sheets} gleich große Bögen Papier. `,
            unit: "des Papiers",
            unitPlural: "Bögen Papier",
            totalAmount: sheets,
            isAbsolute: true,
          };
        } else {
          return {
            story: `Für ein Bastelprojekt hat Tim eine Rolle Papier. `,
            unit: "des Papiers",
            unitPlural: "Papier",
            totalAmount: 1,
            isAbsolute: false,
          };
        }
      },
      scenarios: {
        materials: (context) => {
          const fraction1 = { numerator: randomInt(1, 2), denominator: randomChoice([3, 4, 5]) };
          const fraction2 = { numerator: randomInt(1, 2), denominator: fraction1.denominator };
          
          if (context.isAbsolute) {
            const amount1 = multiplyFractions(fraction1, { numerator: context.totalAmount, denominator: 1 });
            const amount2 = multiplyFractions(fraction2, { numerator: context.totalAmount, denominator: 1 });
            const solution = addFractions(amount1, amount2);
            
            return {
              story: context.story +
                     `Er verwendet ${formatFractionForDisplay(fraction1).text} von jedem Bogen für das Grundgerüst ` +
                     `und ${formatFractionForDisplay(fraction2).text} von jedem Bogen für die Verzierung. ` +
                     `Wie viel Papier hat er insgesamt verwendet?`,
              solution,
              operation: "absolute-addition", 
              fractions: [fraction1, fraction2],
              explanation: `${formatFractionForDisplay(fraction1).text} × ${context.totalAmount} + ${formatFractionForDisplay(fraction2).text} × ${context.totalAmount} = ${formatFractionForDisplay(solution).text} ${context.unitPlural}`
            };
          } else {
            const solution = addFractions(fraction1, fraction2);
            
            return {
              story: context.story +
                     `Er verwendet ${formatFractionForDisplay(fraction1).text} für das Grundgerüst ` +
                     `und ${formatFractionForDisplay(fraction2).text} für die Verzierung. ` +
                     `Wie viel von seinem Papier hat er insgesamt verwendet?`,
              solution,
              operation: "fraction-addition", 
              fractions: [fraction1, fraction2],
              explanation: `${formatFractionForDisplay(fraction1).text} + ${formatFractionForDisplay(fraction2).text} = ${formatFractionForDisplay(solution).text} ${context.unit}`
            };
          }
        },
        remaining: (context) => {
          const used = { numerator: randomInt(2, 4), denominator: randomChoice([5, 6, 8]) };
          
          if (context.isAbsolute) {
            const totalUsed = multiplyFractions(used, { numerator: context.totalAmount, denominator: 1 });
            const solution = subtractFractions({ numerator: context.totalAmount, denominator: 1 }, totalUsed);
            
            return {
              story: context.story +
                     `Er hat bereits ${formatFractionForDisplay(used).text} von jedem Bogen verbraucht. ` +
                     `Wie viel Papier ist noch übrig?`,
              solution,
              operation: "absolute-remaining",
              fractions: [used],
              explanation: `${context.totalAmount} - (${formatFractionForDisplay(used).text} × ${context.totalAmount}) = ${formatFractionForDisplay(solution).text} ${context.unitPlural}`
            };
          } else {
            const solution = subtractFractions({ numerator: 1, denominator: 1 }, used);
            
            return {
              story: context.story +
                     `Er hat bereits ${formatFractionForDisplay(used).text} seines Papiers verbraucht. ` +
                     `Wie viel ist noch übrig?`,
              solution,
              operation: "fraction-remaining",
              fractions: [used],
              explanation: `1 - ${formatFractionForDisplay(used).text} = ${formatFractionForDisplay(solution).text} ${context.unit}`
            };
          }
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
                   `Wie viel vom Garten ist bepflanzt?`,
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
                   `Wie viel vom Buch hat sie insgesamt gelesen?`,
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
                   `Wie viel vom Buch ist noch ungelesen?`,
            solution: subtractFractions({ numerator: 1, denominator: 1 }, read),
            operation: "remaining",
            fractions: [read]
          };
        }
      }
    }
  ];
  
  const context = randomChoice(contexts);
  const contextData = context.setup(difficultyType);
  const scenario = randomChoice(Object.values(context.scenarios));
  const problem = scenario(contextData);
  
  return {
    ...problem,
    context: contextData,
    difficulty: difficultyType,
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
    if (problem.operation.includes("addition")) {
      const frac1Display = formatFractionForDisplay(problem.fractions[0]);
      const frac2Display = formatFractionForDisplay(problem.fractions[1]);
      if (problem.difficulty === "absolute-amounts") {
        hint = `Tipp: Berechne erst ${frac1Display.html} × ${problem.context.totalAmount} und dann ${frac2Display.html} × ${problem.context.totalAmount}, dann addiere beide Ergebnisse.`;
      } else {
        hint = `Tipp: Du musst addieren: ${frac1Display.html} + ${frac2Display.html}`;
      }
    } else if (problem.operation.includes("subtraction") || problem.operation.includes("remaining")) {
      if (problem.difficulty === "absolute-amounts") {
        const usedDisplay = formatFractionForDisplay(problem.fractions[0]);
        hint = `Tipp: Berechne erst, wie viel insgesamt verwendet wurde: ${usedDisplay.html} × ${problem.context.totalAmount}, dann subtrahiere von ${problem.context.totalAmount}.`;
      } else {
        const usedDisplay = formatFractionForDisplay(problem.fractions[0]);
        hint = `Tipp: Vom Ganzen (1) wird ${usedDisplay.html} abgezogen: 1 - ${usedDisplay.html}`;
      }
    }
    
    // Verwende die explanation aus dem generierten Problem oder erstelle eine einfache
    const explanation = problem.explanation || `Lösung: ${solutionDisplay.html}`;
    
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