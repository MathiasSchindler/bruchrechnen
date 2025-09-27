import {
  randomInt,
  randomChoice,
  formatFractionForDisplay,
  addFractions,
  subtractFractions,
  multiplyFractions,
  simplifyFraction,
} from "../utils/fraction.js";

function generateDetectiveCase() {
  const cases = [
    {
      id: "homework-disaster",
      setup: () => {
        const studentName = randomChoice(["Tim", "Sarah", "Max", "Emma", "Leon"]);
        const operation = randomChoice(["addition", "subtraction", "multiplication"]);
        
        let problem, correctAnswer, studentAnswer, evidence;
        
        if (operation === "addition") {
          const a = { numerator: randomInt(1, 3), denominator: randomChoice([4, 5, 6]) };
          const b = { numerator: randomInt(1, 3), denominator: a.denominator };
          correctAnswer = simplifyFraction(addFractions(a, b));
          
          // Typischer Fehler: Zähler und Nenner getrennt addieren
          studentAnswer = simplifyFraction({ 
            numerator: a.numerator + b.numerator, 
            denominator: a.denominator + b.denominator 
          });
          
          // Stelle sicher, dass das Ergebnis tatsächlich falsch ist
          if (studentAnswer.numerator === correctAnswer.numerator && studentAnswer.denominator === correctAnswer.denominator) {
            // Wenn zufällig gleich, ändere die Zahlen
            studentAnswer = { numerator: correctAnswer.numerator + 1, denominator: correctAnswer.denominator + 1 };
          }
          
          const aDisplay = formatFractionForDisplay(a);
          const bDisplay = formatFractionForDisplay(b);
          
          problem = `${aDisplay.html} + ${bDisplay.html}`;
          evidence = {
            mistake: "separate-addition",
            clue1: `${studentName} hat geschrieben: "${a.numerator} + ${b.numerator} = ${studentAnswer.numerator}" und "${a.denominator} + ${b.denominator} = ${studentAnswer.denominator}"`,
            clue2: `Bei Bruchaddition bleibt der Nenner gleich!`,
            clue3: `Richtig wäre: Die Nenner sind schon gleich (${a.denominator}), also nur Zähler addieren: ${a.numerator} + ${b.numerator} = ${correctAnswer.numerator}`
          };
        }
        else if (operation === "multiplication") {
          const a = { numerator: randomInt(1, 3), denominator: randomChoice([2, 3, 4]) };
          const b = { numerator: randomInt(1, 3), denominator: randomChoice([2, 3, 4]) };
          correctAnswer = simplifyFraction(multiplyFractions(a, b));
          
          // Typischer Fehler: Kreuzweise multiplizieren
          studentAnswer = simplifyFraction({ 
            numerator: a.numerator * b.denominator, 
            denominator: a.denominator * b.numerator 
          });
          
          // Stelle sicher, dass das Ergebnis falsch ist
          if (studentAnswer.numerator === correctAnswer.numerator && studentAnswer.denominator === correctAnswer.denominator) {
            // Wenn zufällig gleich, nimm andere Zahlen
            studentAnswer = { numerator: correctAnswer.numerator + 1, denominator: correctAnswer.denominator };
          }
          
          const aDisplay = formatFractionForDisplay(a);
          const bDisplay = formatFractionForDisplay(b);
          
          problem = `${aDisplay.html} × ${bDisplay.html}`;
          evidence = {
            mistake: "cross-multiplication",
            clue1: `${studentName}s Notizen zeigen: "${a.numerator} × ${b.denominator} = ${studentAnswer.numerator}" und "${a.denominator} × ${b.numerator} = ${studentAnswer.denominator}"`,
            clue2: `Das ist die falsche Regel - das macht man nur bei Gleichungen!`,
            clue3: `Bei Bruchmultiplikation: Zähler × Zähler und Nenner × Nenner. Also: ${a.numerator} × ${b.numerator} = ${correctAnswer.numerator}`
          };
        }
        else { // subtraction
          let a = { numerator: randomInt(4, 7), denominator: randomChoice([6, 8]) };
          let b = { numerator: randomInt(1, a.numerator - 1), denominator: a.denominator };
          correctAnswer = simplifyFraction(subtractFractions(a, b));
          
          // Typischer Fehler: Reihenfolge vertauscht - aber stelle sicher, dass das Ergebnis falsch ist!
          let tempAnswer = subtractFractions(b, a);
          if (tempAnswer.numerator < 0) {
            tempAnswer.numerator = Math.abs(tempAnswer.numerator);
          }
          studentAnswer = simplifyFraction(tempAnswer);
          
          // Stelle sicher, dass studentAnswer != correctAnswer
          if (studentAnswer.numerator === correctAnswer.numerator && studentAnswer.denominator === correctAnswer.denominator) {
            // Falls sie gleich sind, ändere die Aufgabe leicht
            a.numerator += 1;
            correctAnswer = simplifyFraction(subtractFractions(a, b));
            tempAnswer = subtractFractions(b, a);
            if (tempAnswer.numerator < 0) {
              tempAnswer.numerator = Math.abs(tempAnswer.numerator);
            }
            studentAnswer = simplifyFraction(tempAnswer);
          }
          
          const aDisplay = formatFractionForDisplay(a);
          const bDisplay = formatFractionForDisplay(b);
          
          problem = `${aDisplay.html} - ${bDisplay.html}`;
          evidence = {
            mistake: "wrong-order",
            clue1: `${studentName} hat gerechnet: ${b.numerator} - ${a.numerator} = ${Math.abs(b.numerator - a.numerator)}`,
            clue2: `Die Reihenfolge bei der Subtraktion ist wichtig!`,
            clue3: `Es muss ${a.numerator} - ${b.numerator} = ${correctAnswer.numerator} sein, nicht umgekehrt!`
          };
        }
        
        return {
          studentName,
          problem,
          correctAnswer,
          studentAnswer,
          evidence,
          operation
        };
      }
    },
    
    {
      id: "test-confusion", 
      setup: () => {
        const studentName = randomChoice(["Julia", "Ben", "Lisa", "Paul", "Nina"]);
        
        // Kürzungsfehler
        const baseFraction = { numerator: randomInt(3, 6), denominator: randomChoice([6, 8, 9, 12]) };
        const factor = randomChoice([2, 3]);
        const expandedFraction = { 
          numerator: baseFraction.numerator * factor, 
          denominator: baseFraction.denominator * factor 
        };
        
        const correctAnswer = simplifyFraction(expandedFraction);
        
        // Fehler: Nur Zähler oder nur Nenner gekürzt
        let studentAnswer;
        const attempts = [
          { numerator: Math.floor(expandedFraction.numerator / factor), denominator: expandedFraction.denominator }, // Nur Zähler gekürzt
          { numerator: expandedFraction.numerator, denominator: Math.floor(expandedFraction.denominator / factor) }, // Nur Nenner gekürzt
          { numerator: Math.floor(expandedFraction.numerator / 2), denominator: Math.floor(expandedFraction.denominator / 3) } // Verschiedene Faktoren
        ];
        
        // Wähle einen Fehler, der nicht zufällig richtig ist
        studentAnswer = attempts.find(attempt => 
          attempt.numerator !== correctAnswer.numerator || attempt.denominator !== correctAnswer.denominator
        ) || attempts[0];
        
        const originalDisplay = formatFractionForDisplay(expandedFraction);
        const problem = `Kürze ${originalDisplay.html}`;
        
        const evidence = {
          mistake: "incomplete-simplification", 
          clue1: `${studentName} hat nur einen Teil gekürzt, aber nicht beide Zahlen durch den gleichen Faktor geteilt`,
          clue2: `Der Nenner und Zähler müssen durch die gleiche Zahl geteilt werden`,
          clue3: `Beim Kürzen muss man Zähler UND Nenner durch die gleiche Zahl teilen! Hier durch ${factor}.`
        };
        
        return {
          studentName,
          problem,
          correctAnswer,
          studentAnswer,
          evidence,
          operation: "simplification"
        };
      }
    }
  ];
  
  const caseTemplate = randomChoice(cases);
  return caseTemplate.setup();
}

const errorDetective = {
  id: "error-detective",
  name: "🕵️ Bruch-Detektiv",
  description: "Schlüpfe in die Rolle eines Detektivs und löse mysteriöse Bruch-Fälle!",
  
  generateProblem({ settings = {} } = {}) {
    const detectiveCase = generateDetectiveCase();
    const taskType = randomChoice(["find-mistake", "solve-case"]);
    
    if (taskType === "find-mistake") {
      // Aufgabe: Finde den Fehler im Schülerheft
      const correctDisplay = formatFractionForDisplay(detectiveCase.correctAnswer);
      const studentDisplay = formatFractionForDisplay(detectiveCase.studentAnswer);
      
      const options = [
        { id: "correct", label: "Die Lösung ist richtig", value: "correct" },
        { id: "separate", label: "Zähler und Nenner wurden getrennt behandelt", value: "separate-treatment" },
        { id: "order", label: "Die Reihenfolge wurde vertauscht", value: "wrong-order" },
        { id: "incomplete", label: "Das Kürzen wurde nicht vollständig durchgeführt", value: "incomplete-simplification" }
      ];
      
      // Bestimme richtige Antwort basierend auf dem Fehler
      let correctChoice = "separate-treatment";
      if (detectiveCase.evidence.mistake === "wrong-order") correctChoice = "wrong-order";
      if (detectiveCase.evidence.mistake === "incomplete-simplification") correctChoice = "incomplete-simplification";
      
      return {
        id: `${this.id}-find-mistake`,
        prompt: `<div style="background: #f0f9ff; border: 2px solid #0ea5e9; border-radius: 12px; padding: 20px; margin: 10px 0;">
                  <h3 style="color: #0369a1; margin-top: 0;">🕵️‍♂️ Fall #${randomInt(101, 999)}: Das rätselhafte Matheheft</h3>
                  <p><strong>Der Fall:</strong> ${detectiveCase.studentName} hat eine Bruchaufgabe gerechnet, aber das Ergebnis stimmt nicht.</p>
                  <p><strong>Aufgabe war:</strong> ${detectiveCase.problem}</p>
                  <p><strong>${detectiveCase.studentName}s Antwort:</strong> ${studentDisplay.html}</p>
                  <div style="background: white; border-left: 4px solid #10b981; padding: 15px; margin: 15px 0;">
                    <p><strong>🔍 Indiz 1:</strong> ${detectiveCase.evidence.clue1}</p>
                  </div>
                  <p style="color: #dc2626;"><strong>Deine Aufgabe:</strong> Was ist hier schiefgelaufen?</p>
                </div>`,
        promptIsHtml: true,
        input: {
          type: "multiple-choice",
          options,
        },
        solution: {
          type: "multiple-choice", 
          value: correctChoice,
        },
        explanation: `<strong>🎯 Fall gelöst!</strong><br><br>
                     <strong>Der Fehler:</strong> ${detectiveCase.evidence.clue2}<br><br>
                     <strong>💡 Richtige Lösung:</strong> ${correctDisplay.html}<br><br>
                     <strong>🧠 Erklärung:</strong> ${detectiveCase.evidence.clue3}`,
        explanationIsHtml: true,
        hint: `<strong>🔍 Detektiv-Tipp:</strong> Schaue genau hin, wie ${detectiveCase.studentName} gerechnet hat. ${detectiveCase.evidence.clue2}`,
        hintIsHtml: true,
      };
      
    } else {
      // Aufgabe: Löse den Fall und finde die richtige Antwort
      const correctDisplay = formatFractionForDisplay(detectiveCase.correctAnswer);
      const studentDisplay = formatFractionForDisplay(detectiveCase.studentAnswer);
      
      // Generiere Ablenkungsantworten
      const wrongAnswers = [detectiveCase.studentAnswer];
      
      for (let i = 0; i < 2; i++) {
        let wrongFraction;
        let attempts = 0;
        do {
          wrongFraction = {
            numerator: randomInt(1, 8),
            denominator: randomChoice([2, 3, 4, 5, 6, 8])
          };
          wrongFraction = simplifyFraction(wrongFraction);
          attempts++;
        } while (
          attempts < 20 && (
            wrongAnswers.some(w => w.numerator === wrongFraction.numerator && w.denominator === wrongFraction.denominator) ||
            (wrongFraction.numerator === detectiveCase.correctAnswer.numerator && wrongFraction.denominator === detectiveCase.correctAnswer.denominator)
          )
        );
        
        if (!wrongAnswers.some(w => w.numerator === wrongFraction.numerator && w.denominator === wrongFraction.denominator)) {
          wrongAnswers.push(wrongFraction);
        }
      }
      
      const options = [detectiveCase.correctAnswer, ...wrongAnswers]
        .filter((answer, index, self) => 
          index === self.findIndex(a => a.numerator === answer.numerator && a.denominator === answer.denominator)
        )
        .sort(() => Math.random() - 0.5)
        .slice(0, 4)
        .map((answer, index) => {
          const display = formatFractionForDisplay(answer);
          return {
            id: `answer-${index}`,
            label: display.html,
            labelText: display.text,
            value: display.text,
          };
        });
      
      return {
        id: `${this.id}-solve-case`,
        prompt: `<div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 12px; padding: 20px; margin: 10px 0;">
                  <h3 style="color: #92400e; margin-top: 0;">🕵️‍♀️ Fall #${randomInt(201, 799)}: Der Bruch-Betrug</h3>
                  <p><strong>Der Fall:</strong> ${detectiveCase.studentName} behauptet, die richtige Antwort zu haben, aber du zweifelst...</p>
                  <p><strong>Die Aufgabe:</strong> ${detectiveCase.problem}</p>
                  <p><strong>${detectiveCase.studentName}s Behauptung:</strong> ${studentDisplay.html}</p>
                  <div style="background: white; border-left: 4px solid #ef4444; padding: 15px; margin: 15px 0;">
                    <p><strong>🚨 Verdächtiges Indiz:</strong> ${detectiveCase.evidence.clue1}</p>
                    <p><strong>🔍 Weiterer Hinweis:</strong> ${detectiveCase.evidence.clue2}</p>
                  </div>
                  <p style="color: #dc2626;"><strong>Deine Mission:</strong> Finde die wirklich richtige Antwort!</p>
                </div>`,
        promptIsHtml: true,
        input: {
          type: "multiple-choice",
          options,
        },
        solution: {
          type: "multiple-choice",
          value: correctDisplay.text,
        },
        explanation: `<strong>🎉 Fall abgeschlossen!</strong><br><br>
                     <strong>Die richtige Antwort ist:</strong> ${correctDisplay.html}<br><br>
                     <strong>🚫 ${detectiveCase.studentName}s Fehler:</strong> ${detectiveCase.evidence.clue2}<br><br>
                     <strong>💡 So geht's richtig:</strong> ${detectiveCase.evidence.clue3}`,
        explanationIsHtml: true,
        hint: `<strong>🔍 Detektiv-Hinweis:</strong> Ignoriere ${detectiveCase.studentName}s Antwort und rechne selbst. ${detectiveCase.evidence.clue3.split('.')[0]}...`,
        hintIsHtml: true,
      };
    }
  },
};

export default errorDetective;