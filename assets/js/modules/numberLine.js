import {
  randomInt,
  randomChoice,
  formatFractionForDisplay,
  simplifyFraction,
} from "../utils/fraction.js";

function generateNumberLine() {
  // Erstelle einen Zahlenstrahl von 0 bis 2 oder 0 bis 1
  const maxValue = randomChoice([1, 2]);
  const divisions = randomChoice([2, 3, 4, 5, 6, 8]); // Anzahl der Unterteilungen pro Einheit
  
  return { maxValue, divisions };
}

function generatePositionOnNumberLine(maxValue, divisions) {
  // Generiere eine Position auf dem Zahlenstrahl
  const totalSteps = maxValue * divisions;
  const step = randomInt(1, totalSteps - 1); // Nicht genau 0 oder Maximum
  
  // FEHLER BEHOBEN: Der Nenner muss totalSteps sein, nicht divisions!
  const fraction = simplifyFraction({ numerator: step, denominator: totalSteps });
  return fraction;
}

function createNumberLineVisualization(maxValue, divisions, targetFraction = null, showAnswer = false, markedPositions = []) {
  // Erstelle eine visuell ansprechende HTML-Darstellung des Zahlenstrahls
  const totalSteps = maxValue * divisions;
  let visualization = '<div style="font-family: monospace; font-size: 16px; line-height: 1.6; text-align: center; margin: 20px 0;">';
  
  // Position-Markierungen (A, B, C, etc.) oben
  if (markedPositions.length > 0) {
    visualization += '<div style="height: 25px; position: relative; margin-bottom: 5px;">';
    markedPositions.forEach(pos => {
      const leftPercent = (pos.step / totalSteps) * 100;
      visualization += `<span style="position: absolute; left: ${leftPercent}%; transform: translateX(-50%); font-weight: bold; color: #4f46e5; font-size: 18px;">${pos.letter}</span>`;
    });
    visualization += '</div>';
  }
  
  // Striche oben (Bruchmarkierungen)
  visualization += '<div style="height: 20px; position: relative; margin-bottom: 3px;">';
  for (let i = 0; i <= totalSteps; i++) {
    const leftPercent = (i / totalSteps) * 100;
    const isWhole = i % divisions === 0;
    const height = isWhole ? '15px' : '10px';
    const color = isWhole ? '#1f2933' : '#6b7280';
    const thickness = isWhole ? '2px' : '1px';
    
    visualization += `<div style="position: absolute; left: ${leftPercent}%; transform: translateX(-50%); width: ${thickness}; height: ${height}; background: ${color}; top: 5px;"></div>`;
  }
  visualization += '</div>';
  
  // Zielpfeil (wenn showAnswer true ist)
  if (targetFraction && showAnswer) {
    // FEHLER BEHOBEN: Korrekte Pfeil-Position berechnen
    const targetStep = (targetFraction.numerator * totalSteps) / targetFraction.denominator;
    const leftPercent = (targetStep / totalSteps) * 100;
    visualization += '<div style="height: 15px; position: relative; margin-bottom: 3px;">';
    visualization += `<div style="position: absolute; left: ${leftPercent}%; transform: translateX(-50%); color: #4f46e5; font-size: 20px; font-weight: bold;">↓</div>`;
    visualization += '</div>';
  }
  
  // Hauptlinie des Zahlenstrahls
  visualization += '<div style="height: 4px; background: linear-gradient(to right, #4f46e5 0%, #6366f1 100%); border-radius: 2px; margin: 3px 0; position: relative;">';
  
  // Punkte auf der Linie für bessere Visualisierung
  for (let i = 0; i <= totalSteps; i++) {
    const leftPercent = (i / totalSteps) * 100;
    const isWhole = i % divisions === 0;
    const size = isWhole ? '8px' : '4px';
    const color = isWhole ? '#1f2933' : '#6b7280';
    
    visualization += `<div style="position: absolute; left: ${leftPercent}%; top: 50%; transform: translate(-50%, -50%); width: ${size}; height: ${size}; background: ${color}; border-radius: 50%;"></div>`;
  }
  
  visualization += '</div>';
  
  // Zahlenbeschriftung unten
  visualization += '<div style="height: 25px; position: relative; margin-top: 10px;">';
  for (let i = 0; i <= maxValue; i++) {
    const leftPercent = (i * divisions / totalSteps) * 100;
    visualization += `<span style="position: absolute; left: ${leftPercent}%; transform: translateX(-50%); font-weight: bold; font-size: 16px;">${i}</span>`;
  }
  visualization += '</div>';
  
  visualization += '</div>';
  return visualization;
}

const numberLine = {
  id: "number-line",
  name: "Brüche am Zahlenstrahl",
  description: "Ordne Brüche auf dem Zahlenstrahl ein oder erkenne ihre Position.",
  
  generateProblem({ settings = {} } = {}) {
    const taskType = randomChoice(["find-position", "identify-fraction"]);
    const { maxValue, divisions } = generateNumberLine();
    
    if (taskType === "find-position") {
      // Aufgabe: Wo liegt der gegebene Bruch?
      const targetFraction = generatePositionOnNumberLine(maxValue, divisions);
      const targetDisplay = formatFractionForDisplay(targetFraction);
      
      // Erstelle Multiple Choice Optionen (Positionen von A bis F)
      const totalSteps = maxValue * divisions;
      const positions = [];
      for (let i = 1; i < totalSteps; i++) {
        positions.push({
          letter: String.fromCharCode(65 + positions.length), // A, B, C, ...
          step: i,
          fraction: simplifyFraction({ numerator: i, denominator: divisions })
        });
      }
      
      // Wähle 4 Positionen aus, eine davon ist die richtige
      const correctPosition = positions.find(p => 
        p.fraction.numerator === targetFraction.numerator && 
        p.fraction.denominator === targetFraction.denominator
      );
      
      const wrongPositions = positions.filter(p => p !== correctPosition);
      const selectedPositions = [correctPosition, ...wrongPositions.slice(0, 3)]
        .sort((a, b) => a.step - b.step);
      
      // Erstelle Zahlenstrahl mit Markierungen
      const numberLineViz = createNumberLineVisualization(maxValue, divisions, null, false, selectedPositions);
      
      const options = selectedPositions.map(pos => ({
        id: `pos-${pos.letter}`,
        label: `Position ${pos.letter}`,
        labelText: `Position ${pos.letter}`,
        value: pos.letter,
      }));
      
      return {
        id: `${this.id}-find-position`,
        prompt: `${numberLineViz}<br><strong>An welcher Position liegt der Bruch ${targetDisplay.html}?</strong>`,
        promptIsHtml: true,
        input: {
          type: "multiple-choice",
          options,
        },
        solution: {
          type: "multiple-choice",
          value: correctPosition.letter,
        },
        explanation: `${targetDisplay.html} entspricht ${targetFraction.numerator}/${divisions} = Position ${correctPosition.letter}`,
        explanationIsHtml: true,
        hint: `Tipp: Teile den Zahlenstrahl in ${divisions} gleiche Teile. Zähle ${targetFraction.numerator} Teile ab.`,
        hintIsHtml: true,
      };
      
    } else {
      // Aufgabe: Welcher Bruch liegt an der markierten Position?
      const targetFraction = generatePositionOnNumberLine(maxValue, divisions);
      const targetDisplay = formatFractionForDisplay(targetFraction);
      
      // Erstelle Zahlenstrahl mit Markierung
      const numberLineViz = createNumberLineVisualization(maxValue, divisions, targetFraction, true);
      
      // Erstelle Optionen
      const correctAnswer = targetDisplay.text;
      const wrongFractions = [];
      
      // Generiere ähnliche Brüche als Distraktoren
      for (let i = 0; i < 3; i++) {
        let wrongFraction;
        do {
          const wrongStep = randomInt(1, maxValue * divisions - 1);
          // FEHLER BEHOBEN: Korrekte Nenner für Distraktoren
          wrongFraction = simplifyFraction({ numerator: wrongStep, denominator: maxValue * divisions });
        } while (
          wrongFraction.numerator === targetFraction.numerator && 
          wrongFraction.denominator === targetFraction.denominator
        );
        
        wrongFractions.push(formatFractionForDisplay(wrongFraction).text);
      }
      
      const options = [correctAnswer, ...wrongFractions]
        .filter((answer, index, self) => 
          index === self.findIndex(a => a === answer)
        ) // Remove duplicates
        .sort(() => Math.random() - 0.5)
        .slice(0, 4)
        .map((answer, index) => {
          const fraction = answer.includes('/') 
            ? { numerator: parseInt(answer.split('/')[0]), denominator: parseInt(answer.split('/')[1]) }
            : { numerator: parseInt(answer), denominator: 1 };
          
          return {
            id: `frac-option-${index}`,
            label: formatFractionForDisplay(fraction).html,
            labelText: answer,
            value: answer,
          };
        });
      
      return {
        id: `${this.id}-identify-fraction`,
        prompt: `${numberLineViz}<br><strong>Welcher Bruch ist am Pfeil markiert?</strong>`,
        promptIsHtml: true,
        input: {
          type: "multiple-choice",
          options,
        },
        solution: {
          type: "multiple-choice",
          value: correctAnswer,
        },
        explanation: `Der markierte Punkt liegt bei ${targetDisplay.html} auf dem Zahlenstrahl.`,
        explanationIsHtml: true,
        hint: `Tipp: Zähle, wie viele Striche der Pfeil von 0 entfernt ist und teile durch die Gesamtzahl der Unterteilungen.`,
        hintIsHtml: false,
      };
    }
  },
};

export default numberLine;